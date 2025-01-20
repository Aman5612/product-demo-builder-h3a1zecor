import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'

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

  // Fetch credentials from database
  const credentials = await prisma.credential.findFirst({
    where: {
      userId: parseInt(params.userId),
      websiteUrl: {
        contains: new URL(req.url).searchParams.get('websiteUrl') || ''
      }
    },
    select: {
      username: true,
      password: true,
      usernameSelector: true,
      passwordSelector: true,
      submitSelector: true
    }
  })

  if (!credentials) {
    return NextResponse.json(
      { error: 'No credentials found for this website' },
      { status: 404 }
    )
  }

  return NextResponse.json({ credentials })
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

  const body = await req.json()
  
  try {
    const credential = await prisma.credential.upsert({
      where: {
        userId_websiteUrl: {
          userId: parseInt(params.userId),
          websiteUrl: body.websiteUrl
        }
      },
      update: {
        username: body.username,
        password: body.password,
        usernameSelector: body.usernameSelector || 'input[name="username"]',
        passwordSelector: body.passwordSelector || 'input[name="password"]',
        submitSelector: body.submitSelector || 'button[type="submit"]'
      },
      create: {
        userId: parseInt(params.userId),
        websiteUrl: body.websiteUrl,
        username: body.username,
        password: body.password,
        usernameSelector: body.usernameSelector || 'input[name="username"]',
        passwordSelector: body.passwordSelector || 'input[name="password"]',
        submitSelector: body.submitSelector || 'button[type="submit"]'
      }
    })

    return NextResponse.json({ credential })
  } catch (error) {
    console.error('Error saving credentials:', error)
    return NextResponse.json(
      { error: 'Failed to save credentials' },
      { status: 500 }
    )
  }
}
