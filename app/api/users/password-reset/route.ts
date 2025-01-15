import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email);

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 },
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetOtp: otp,
        otpExpiry,
      },
    });

    await sendEmail({
      to: email,
      template: {
        subject: 'Password Reset OTP',
        html: `<h1>Your OTP for password reset is: ${otp}</h1>`,
        text: `Your OTP for password reset is: ${otp}`,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset OTP sent to email',
        data: {},
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error generating OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}