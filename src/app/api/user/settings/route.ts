import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

// GET /api/user/settings - Get user settings
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        preferredLocale: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user settings from database or initialize if not found
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    }) || { 
      darkMode: false,
      emailNotifications: true,
      userId: user.id
    };

    return NextResponse.json({
      user,
      settings: userSettings
    });
  } catch (error) {
    console.error("[API] GET /api/user/settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user settings" },
      { status: 500 }
    );
  }
}

// POST /api/user/settings - Update user settings
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate the request data
    if (!data) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    // Update user data if provided
    if (data.name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { 
          name: data.name,
          preferredLocale: data.preferredLocale || undefined
        },
      });
    }

    // Update or create user settings
    const userSettings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: {
        darkMode: data.darkMode !== undefined ? data.darkMode : undefined,
        emailNotifications: data.emailNotifications !== undefined ? data.emailNotifications : undefined,
      },
      create: {
        userId: session.user.id,
        darkMode: data.darkMode !== undefined ? data.darkMode : false,
        emailNotifications: data.emailNotifications !== undefined ? data.emailNotifications : true,
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        category: "USER",
        details: "User settings updated",
        status: "SUCCESS",
      },
    });

    return NextResponse.json({ success: true, settings: userSettings });
  } catch (error) {
    console.error("[API] POST /api/user/settings error:", error);
    return NextResponse.json(
      { error: "Failed to update user settings" },
      { status: 500 }
    );
  }
} 