import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  console.log("[API] Admin logs stats endpoint called");
  
  try {
    // Check authentication - can be skipped in dev with skipAuth param
    const searchParams = request.nextUrl.searchParams;
    const skipAuth = searchParams.get('skipAuth') === 'true' && process.env.NODE_ENV === 'development';

    if (!skipAuth) {
      console.log("[API] Checking authentication for stats");
      const session = await auth();
      
      // Only admins can access log statistics
      if (!session?.user || session.user.role !== 'ADMIN') {
        console.log("[API] Unauthorized access attempt to stats");
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
    }

    // Get date ranges for statistics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get last 7 days for the chart
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    // Get total logs count
    const totalLogs = await prisma.activityLog.count();
    
    // Get logs count for today
    const logsToday = await prisma.activityLog.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });
    
    // Get logs count for yesterday
    const logsYesterday = await prisma.activityLog.count({
      where: {
        createdAt: {
          gte: yesterday,
          lt: today,
        },
      },
    });
    
    // Get logs count for this week
    const logsThisWeek = await prisma.activityLog.count({
      where: {
        createdAt: {
          gte: thisWeekStart,
        },
      },
    });
    
    // Get logs count for this month
    const logsThisMonth = await prisma.activityLog.count({
      where: {
        createdAt: {
          gte: thisMonthStart,
        },
      },
    });
    
    // Get daily activity for the last 7 days
    const dailyActivity = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const count = await prisma.activityLog.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDay,
            },
          },
        });
        
        return {
          date: date.toISOString().split('T')[0],
          count,
        };
      })
    );
    
    // Get verification statistics
    const totalVerifications = await prisma.activityLog.count({
      where: {
        category: 'VERIFICATION',
      },
    });
    
    const successfulVerifications = await prisma.activityLog.count({
      where: {
        category: 'VERIFICATION',
        status: 'SUCCESS',
      },
    });
    
    const failedVerifications = await prisma.activityLog.count({
      where: {
        category: 'VERIFICATION',
        status: 'FAILURE',
      },
    });
    
    // Get blockchain statistics
    const totalBlockchain = await prisma.activityLog.count({
      where: {
        category: 'BLOCKCHAIN',
      },
    });
    
    const successfulBlockchain = await prisma.activityLog.count({
      where: {
        category: 'BLOCKCHAIN',
        status: 'SUCCESS',
      },
    });
    
    const failedBlockchain = await prisma.activityLog.count({
      where: {
        category: 'BLOCKCHAIN',
        status: 'FAILURE',
      },
    });
    
    // Get recent verification failures
    const recentFailures = await prisma.activityLog.findMany({
      where: {
        category: 'VERIFICATION',
        status: 'FAILURE',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });
    
    // Get categories with counts
    console.log("[API] Getting category counts");
    const categories = await prisma.activityLog.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    });
    
    // Convert to simple array format
    const categoryCounts = categories.map(item => ({
      category: item.category,
      count: item._count.category
    }));

    // Generate statistics
    const stats = {
      overview: {
        totalLogs,
        logsToday,
        logsYesterday,
        logsThisWeek,
        logsThisMonth,
      },
      dailyActivity,
      verification: {
        total: totalVerifications,
        successful: successfulVerifications,
        failed: failedVerifications,
        successRate: totalVerifications > 0 
          ? ((successfulVerifications / totalVerifications) * 100).toFixed(1)
          : '0.0',
      },
      blockchain: {
        total: totalBlockchain,
        successful: successfulBlockchain,
        failed: failedBlockchain,
        successRate: totalBlockchain > 0
          ? ((successfulBlockchain / totalBlockchain) * 100).toFixed(1)
          : '0.0',
      },
      recentFailures,
      categories: categoryCounts
    };
    
    console.log("[API] Stats response prepared, categories count:", categoryCounts.length);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('[API] Error getting log statistics:', error);
    return NextResponse.json(
      { message: 'An error occurred while getting log statistics' },
      { status: 500 }
    );
  }
} 