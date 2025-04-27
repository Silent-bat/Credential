import { authOptions } from "@/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      authenticated: !!session,
      expires: session?.expires || null,
      user: session?.user || null,
    });
  } catch (error) {
    console.error("Session API error:", error);
    return NextResponse.json(
      { 
        error: "Failed to get session", 
        authenticated: false 
      },
      { status: 500 }
    );
  }
} 