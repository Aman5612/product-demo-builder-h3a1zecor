import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

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
    const { websiteUrl, username, password } = body;

    if (!websiteUrl || !username || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const credential = await prisma.credential.create({
      data: {
        websiteUrl,
        username,
        password: hashedPassword,
        userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Credentials saved successfully',
        data: {
          id: credential.id,
          websiteUrl: credential.websiteUrl,
          createdAt: credential.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error saving credentials:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}