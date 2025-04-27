import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get current session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!session.user || !session.user.id) {
      return NextResponse.json(
        { error: "User information not found in session" },
        { status: 401 }
      );
    }
    
    // Fetch user with institution details
    const user = await db.user.findUnique({
      where: { 
        id: session.user.id 
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        preferredLocale: true,
        createdAt: true,
        updatedAt: true,
        institutionUsers: {
          select: {
            id: true,
            role: true,
            institutionId: true,
            institution: {
              select: {
                id: true,
                name: true,
                logo: true,
                type: true,
                status: true
              }
            }
          }
        }
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 