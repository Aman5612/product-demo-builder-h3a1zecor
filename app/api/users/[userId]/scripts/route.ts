import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import puppeteer, { Page } from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { uploadToDrive } from '@/lib/google-drive'

declare module 'puppeteer' {
  interface Page {
    waitForTimeout: (ms: number) => Promise<void>
  }
}

const scriptSchema = z.object({
  url: z.string().url(),
  credentials: z.object({
    username: z.string(),
    password: z.string(),
    usernameSelector: z.string().default('input[name="username"]'),
    passwordSelector: z.string().default('input[name="password"]'),
    submitSelector: z.string().default('button[type="submit"]')
  }),
  steps: z.array(z.object({
    action: z.string(),
    selector: z.string(),
    value: z.string().optional()
  })),
  record: z.boolean().default(false)
})

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.id !== params.userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const scripts = await prisma.script.findMany({
      where: {
        userId: parseInt(params.userId)
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(scripts)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch scripts' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.id !== params.userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const { url, credentials, steps } = scriptSchema.parse(body)
    
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    })
    
    try {
      const page = await browser.newPage()
      let recordingPath: string | null = null
      let recordingUrl: string | undefined = undefined
      
      // Start recording if requested
      if (body.record) {
        const tempDir = path.join('/tmp', 'recordings')
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true })
        }
        recordingPath = path.join(tempDir, `recording_${Date.now()}.webm`)
        
        // Start screen recording
        await page.evaluateOnNewDocument(() => {
          (window as any).startRecording = async () => {
            const stream = await (navigator as any).mediaDevices.getDisplayMedia({
              video: true,
              audio: true
            })
            const recorder = new MediaRecorder(stream)
            const chunks: Blob[] = []
            
            recorder.ondataavailable = (e: BlobEvent) => {
              chunks.push(e.data)
            }
            
            recorder.onstop = () => {
              const blob = new Blob(chunks, { type: 'video/webm' })
              const reader = new FileReader()
              reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1]
                fetch('/api/recording', {
                  method: 'POST',
                  body: JSON.stringify({ data: base64 }),
                  headers: {
                    'Content-Type': 'application/json'
                  }
                })
              }
              reader.readAsDataURL(blob)
            }
            
            recorder.start()
            ;(window as any).stopRecording = () => {
              recorder.stop()
              stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
            }
          }
        })
        await page.evaluate(() => (window as any).startRecording())
      }

      await page.goto(url, { waitUntil: 'networkidle2' })
      
      // Login with credentials
      await page.type('input[name="username"]', credentials.username)
      await page.type('input[name="password"]', credentials.password)
      await page.click('button[type="submit"]')
      await page.waitForNavigation({ waitUntil: 'networkidle2' })
      
      // Execute script steps
      for (const step of steps) {
        switch (step.action) {
          case 'click':
            await page.click(step.selector)
            break
          case 'type':
            if (!step.value) throw new Error('Missing value for type action')
            await page.type(step.selector, step.value)
            break
          case 'wait':
            await page.waitForSelector(step.selector)
            break
          default:
            throw new Error(`Unknown action: ${step.action}`)
        }
        
        // Add small delay between steps
        await page.waitForTimeout(500)
      }
      
      // Stop recording if it was started
      if (body.record && recordingPath) {
        await page.evaluate(() => (window as any).stopRecording())
        
        // Upload recording to Google Drive
        const fileContent = fs.readFileSync(recordingPath)
        const blob = new Blob([fileContent], { type: 'video/webm' })
        recordingUrl = await uploadToDrive(blob)
        
        // Clean up temporary file
        fs.unlinkSync(recordingPath)
      }

      // Save script to database
      const savedScript = await prisma.script.create({
        data: {
          content: JSON.stringify({
            url,
            credentials,
            steps,
            record: body.record
          }),
          userId: parseInt(params.userId)
        }
      })

      return NextResponse.json({ 
        success: true,
        message: 'Script executed successfully',
        scriptId: savedScript.id,
        recordingUrl: body.record ? recordingUrl : undefined
      })
    } finally {
      await browser.close()
    }
  } catch (error) {
    console.error('Script execution error:', error)
    return NextResponse.json(
      { error: 'Failed to execute script' },
      { status: 500 }
    )
  }
}
