import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
    const content = String(body.content);

    if (content.length > 10000) {
      return NextResponse.json(
        { success: false, message: 'Script content exceeds character limit' },
        { status: 400 },
      );
    }

    const script = await prisma.script.create({
      data: {
        content,
        userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Script saved successfully',
        data: {
          id: script.id,
          content: script.content,
          createdAt: script.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error saving script:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}