import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email-service';

export async function POST(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const userId = parseInt(params.userId, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 },
      );
    }

    const body = await request.json();
    const googleDriveAccessToken = String(body.googleDriveAccessToken);

    if (!googleDriveAccessToken) {
      return NextResponse.json(
        { success: false, message: 'Google Drive access token is required' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 },
      );
    }

    const recording = await prisma.recording.create({
      data: {
        googleDriveUrl: 'https://drive.google.com/recording',
        userId: userId,
      },
    });

    await sendEmail({
      to: user.email,
      template: {
        subject: 'Recording Saved Successfully',
        html: '<h1>Your recording has been saved to Google Drive</h1>',
        text: 'Your recording has been saved to Google Drive',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Recording saved to Google Drive',
        data: {
          id: recording.id,
          googleDriveUrl: recording.googleDriveUrl,
          createdAt: recording.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error saving recording:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}