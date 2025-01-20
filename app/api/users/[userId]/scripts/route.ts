import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import puppeteer, { Page } from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { uploadToDrive } from '@/lib/google-drive'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function analyzePage(page: Page, goal: string) {
  // Get page content and structure
  const content = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'))
    return elements.map(el => ({
      tag: el.tagName,
      id: el.id,
      classes: Array.from(el.classList),
      text: el.textContent?.trim(),
      type: el.getAttribute('type'),
      name: el.getAttribute('name'),
      placeholder: el.getAttribute('placeholder'),
      role: el.getAttribute('role'),
      ariaLabel: el.getAttribute('aria-label')
    }))
  })

  // Get visible elements
  const visibleElements = content.filter(el => {
    const rect = document.querySelector(`#${el.id}`)?.getBoundingClientRect()
    return rect && rect.width > 0 && rect.height > 0
  })

  // Ask GPT to analyze and suggest next steps
  const prompt = `Given this page structure and elements, suggest the best way to ${goal}. 
  Available elements: ${JSON.stringify(visibleElements)}`

  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-4',
    temperature: 0.7
  })

  return completion.choices[0].message.content
}

declare module 'puppeteer' {
  interface Page {
    waitForTimeout: (ms: number) => Promise<void>
  }
}

const scriptSchema = z.object({
  url: z.string().url(),
  goal: z.string(),
  credentials: z.object({
    username: z.string(),
    password: z.string(),
    usernameSelector: z.string().default('#email'),
    passwordSelector: z.string().default('#password'), 
    submitSelector: z.string().default('button[type="submit"]')
  }),
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
    const { url, goal, credentials } = scriptSchema.parse(body)
    
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
      try {
        await page.waitForSelector(credentials.usernameSelector, { timeout: 10000 })
        await page.type(credentials.usernameSelector, credentials.username)
        
        await page.waitForSelector(credentials.passwordSelector, { timeout: 10000 })
        await page.type(credentials.passwordSelector, credentials.password)
        
        await page.waitForSelector(credentials.submitSelector, { timeout: 10000 })
        await page.click(credentials.submitSelector)
        
        try {
          await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 })
        } catch (err) {
          console.warn('Navigation timeout exceeded, continuing with script')
        }
      } catch (error) {
        console.error('Login failed:', error)
        throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      
      // Generate and execute steps using GPT
      const analysis = await analyzePage(page, goal)
      if (!analysis) {
        throw new Error('Failed to generate steps from GPT analysis')
      }
      
      let steps: any[]
      try {
        steps = JSON.parse(analysis)
        if (!Array.isArray(steps)) {
          throw new Error('Generated steps must be an array')
        }
      } catch (error) {
        throw new Error(`Failed to parse GPT steps: ${error instanceof Error ? error.message : 'Invalid JSON'}`)
      }
      
      for (const step of steps) {
        try {
          switch (step.action) {
            case 'click':
              await page.waitForSelector(step.selector)
              await page.click(step.selector)
              break
            case 'type':
              if (!step.value) throw new Error('Missing value for type action')
              await page.waitForSelector(step.selector)
              await page.type(step.selector, step.value)
              break
            case 'wait':
              await page.waitForTimeout(step.duration || 1000)
              break
            case 'navigate':
              await page.goto(step.url, { waitUntil: 'networkidle2' })
              break
            default:
              throw new Error(`Unknown action: ${step.action}`)
          }
          
          // Add small delay between steps
          await page.waitForTimeout(500)
        } catch (error) {
          console.error(`Step failed: ${step.action} on ${step.selector}`)
          // Get updated analysis and continue
          const recovery = await analyzePage(page, goal)
          steps.push(...JSON.parse(recovery))
        }
      }
      
      // Stop recording if it was started
      if (body.record) {
        await page.evaluate(() => (window as any).stopRecording())
        
        // Upload recording to Google Drive
        if (recordingPath) {
          const fileContent = fs.readFileSync(recordingPath)
          const blob = new Blob([fileContent], { type: 'video/webm' })
          recordingUrl = await uploadToDrive(blob)
          
          // Clean up temporary file
          fs.unlinkSync(recordingPath)
        }
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
