import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { userId: string; scriptId: string } },
) {
  try {
    const userId = parseInt(params.userId, 10);
    const scriptId = parseInt(params.scriptId, 10);

    if (isNaN(userId) || isNaN(scriptId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID or script ID' },
        { status: 400 },
      );
    }

    const body = await request.json();
    const content = String(body.content);

    if (!content) {
      return NextResponse.json(
        { success: false, message: 'Content is required' },
        { status: 400 },
      );
    }

    const script = await prisma.script.updateMany({
      where: { id: scriptId, userId },
      data: { content, updatedAt: new Date() },
    });

    if (script.count === 0) {
      return NextResponse.json(
        { success: false, message: 'Script not found or unauthorized' },
        { status: 404 },
      );
    }

    const updatedScript = await prisma.script.findFirst({
      where: { id: scriptId, userId },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Script updated successfully',
        data: {
          id: updatedScript?.id,
          content: updatedScript?.content,
          updatedAt: updatedScript?.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}