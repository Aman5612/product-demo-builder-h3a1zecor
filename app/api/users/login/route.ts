import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

type LoginRequestBody = {
  email: string;
  password: string;
};

export async function POST(request: Request) {
  try {
    const body: LoginRequestBody = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required", success: false },
        { status: 400 }
      );
    }

    // Get server session
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Authentication failed", success: false },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        message: "Login successful",
        success: true,
        session,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "An error occurred during login", success: false },
      { status: 500 }
    );
  }
}
