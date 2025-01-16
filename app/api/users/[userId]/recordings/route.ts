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

  const { driveUrl } = await req.json()

  try {
    const recording = await prisma.recording.create({
      data: {
        googleDriveUrl: driveUrl,
        userId: parseInt(params.userId)
      }
    })

    return NextResponse.json(recording)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save recording' },
      { status: 500 }
    )
  }
}
