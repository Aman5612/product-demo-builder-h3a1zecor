import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import { generateScript } from '@/lib/openai'
import { uploadToDrive } from '@/lib/google-drive'
import puppeteer from 'puppeteer-core'
import { chromium } from '@sparticuz/chromium'

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
    const recordings = await prisma.recording.findMany({
      where: {
        userId: parseInt(params.userId)
      },
      select: {
        id: true,
        googleDriveUrl: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(recordings)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch recordings' },
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

  const { websiteUrl, username, password } = await req.json()

  try {
    // Generate AI script
    const script = await generateScript(websiteUrl, username, password)
    
    // Launch browser
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true
    })

    const page = await browser.newPage()
    await page.goto(websiteUrl)

    // Execute script steps
    for (const step of script.steps) {
      switch (step.action) {
        case 'navigate':
          await page.goto(step.url)
          break
        case 'type':
          await page.type(step.selector, step.value)
          break
        case 'click':
          await page.click(step.selector)
          break
        case 'wait':
          await page.waitForTimeout(step.duration)
          break
      }
    }

    // Record screen
    const videoPath = `/tmp/recording_${Date.now()}.webm`
    await page.screencast({ path: videoPath })

    // Upload to Google Drive
    const driveUrl = await uploadToDrive(videoPath, `recording_${Date.now()}.webm`)

    // Save recording
    const recording = await prisma.recording.create({
      data: {
        googleDriveUrl: driveUrl,
        userId: parseInt(params.userId)
      }
    })

    await browser.close()
    return NextResponse.json({ success: true, recording })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create recording' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const { status } = await req.json()
    
    await prisma.recording.update({
      where: {
        userId: parseInt(params.userId)
      },
      data: {
        status
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update recording status' },
      { status: 500 }
    )
  }
}
