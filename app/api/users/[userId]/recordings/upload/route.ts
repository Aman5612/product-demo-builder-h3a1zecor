import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { uploadToDrive } from '@/lib/google-drive'

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
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const blob = new Blob([arrayBuffer], { type: file.type });
    const driveUrl = await uploadToDrive(blob as any, session.user.id, file?.name as any);
    
    return NextResponse.json({ driveUrl });
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload recording' },
      { status: 500 }
    )
  }
}
