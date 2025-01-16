import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

type SignupRequestBody = {
  email: string;
  password: string;
  name?: string;
};

export async function POST(request: Request) {
  try {
    const body: SignupRequestBody = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required", success: false },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists", success: false },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const user = await prisma.user.create({
      data: {
        email,
        username: email.split("@")[0],
        name: name || "",
        password: hashedPassword,
        role: "user", // Default role
      },
    });

    // Create session for the new user
    const session = await getServerSession(authOptions);
    
    return NextResponse.json(
      {
        message: "Signup successful",
        success: true,
        userId: user.id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during signup" },
      { status: 500 }
    );
  }
}
