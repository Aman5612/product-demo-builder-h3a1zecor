import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);
  
  // Verify session and user ID match
  if (!session || parseInt(session.user.id) !== parseInt(params.userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { accessToken, refreshToken } = await req.json();

  try {
    // Update user with Google Drive tokens
    const user = await prisma.user.update({
      where: { id: parseInt(params.userId) },
      data: {
        googleDriveAccessToken: accessToken,
        googleDriveRefreshToken: refreshToken
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing Google Drive tokens:', error);
    return NextResponse.json(
      { error: 'Failed to store Google Drive tokens' },
      { status: 500 }
    );
  }
}
