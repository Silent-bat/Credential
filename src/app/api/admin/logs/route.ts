import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  console.log("[API] Admin logs endpoint called");
  
  try {
    // Check authentication - can be skipped in dev with skipAuth param
    const searchParams = request.nextUrl.searchParams;
    const skipAuth = searchParams.get('skipAuth') === 'true' && process.env.NODE_ENV === 'development';
    
    console.log("[API] skipAuth:", skipAuth, "NODE_ENV:", process.env.NODE_ENV);

    if (!skipAuth) {
      console.log("[API] Checking authentication");
      const session = await auth();
      console.log("[API] Session:", session ? "exists" : "null", "User role:", session?.user?.role);
      
      // Only admins can access logs
      if (!session?.user || session.user.role !== 'ADMIN') {
        console.log("[API] Unauthorized access attempt");
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
    }

    // Get query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    
    console.log("[API] Query params:", { page, limit, category, status, action, userId });

    // Build filter conditions
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (action) {
      where.action = action;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    // Date range filtering
    if (startDate || endDate) {
      where.createdAt = {};
      
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      
      if (endDate) {
        // Add 1 day to include the end date fully
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        where.createdAt.lt = end;
      }
    }
    
    // Text search in details
    if (search) {
      where.details = {
        contains: search,
        mode: 'insensitive',
      };
    }
    
    console.log("[API] Prisma where clause:", JSON.stringify(where));

    // Count total logs for pagination
    console.log("[API] Counting total logs");
    try {
      const total = await prisma.activityLog.count({ where });
      console.log("[API] Total logs count:", total);

      // Get logs with pagination
      console.log("[API] Fetching logs with pagination");
      const logs = await prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          institution: {
            select: {
              id: true,
              name: true,
            },
          },
          certificate: {
            select: {
              id: true,
              title: true,
              recipientName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      });
      
      console.log("[API] Logs retrieved:", logs.length);

      const response = {
        logs,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
      
      return NextResponse.json(response);
    } catch (dbError) {
      console.error("[API] Database error:", dbError);
      return NextResponse.json(
        { message: 'Database error: ' + (dbError instanceof Error ? dbError.message : String(dbError)) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[API] Error getting logs:', error);
    return NextResponse.json(
      { message: 'An error occurred while getting logs: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 