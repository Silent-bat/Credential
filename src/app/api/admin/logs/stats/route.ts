import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';
import { LogCategory, LogStatus } from '@prisma/client';

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

    // Initialize with default values in case of db errors
    let totalLogs = 0;
    let logsToday = 0;
    let logsYesterday = 0;
    let logsThisWeek = 0;
    let logsThisMonth = 0;
    let dailyActivity = [];
    let totalVerifications = 0;
    let successfulVerifications = 0;
    let failedVerifications = 0;
    let totalBlockchain = 0;
    let successfulBlockchain = 0;
    let failedBlockchain = 0;
    let recentFailures = [];
    let categoryCounts = [];

    try {
      // Get total logs count
      totalLogs = await prisma.activityLog.count();
      
      // Get logs count for today
      logsToday = await prisma.activityLog.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      });
      
      // Get logs count for yesterday
      logsYesterday = await prisma.activityLog.count({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today,
          },
        },
      });
      
      // Get logs count for this week
      logsThisWeek = await prisma.activityLog.count({
        where: {
          createdAt: {
            gte: thisWeekStart,
          },
        },
      });
      
      // Get logs count for this month
      logsThisMonth = await prisma.activityLog.count({
        where: {
          createdAt: {
            gte: thisMonthStart,
          },
        },
      });
      
      // Get daily activity for the last 7 days
      dailyActivity = await Promise.all(
        last7Days.map(async (date) => {
          const nextDay = new Date(date);
          nextDay.setDate(nextDay.getDate() + 1);
          
          try {
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
          } catch (err) {
            console.error(`[API] Error counting logs for date ${date}:`, err);
            return {
              date: date.toISOString().split('T')[0],
              count: 0,
            };
          }
        })
      );

      // Safely get verification statistics
      try {
        // Get verification statistics
        totalVerifications = await prisma.activityLog.count({
          where: {
            category: LogCategory.VERIFICATION,
          },
        });
        
        successfulVerifications = await prisma.activityLog.count({
          where: {
            category: LogCategory.VERIFICATION,
            status: LogStatus.SUCCESS,
          },
        });
        
        failedVerifications = await prisma.activityLog.count({
          where: {
            category: LogCategory.VERIFICATION,
            status: LogStatus.FAILURE,
          },
        });
      } catch (err) {
        console.error('[API] Error getting verification statistics:', err);
      }
      
      // Safely get blockchain statistics
      try {
        // Get blockchain statistics
        totalBlockchain = await prisma.activityLog.count({
          where: {
            category: LogCategory.BLOCKCHAIN,
          },
        });
        
        successfulBlockchain = await prisma.activityLog.count({
          where: {
            category: LogCategory.BLOCKCHAIN,
            status: LogStatus.SUCCESS,
          },
        });
        
        failedBlockchain = await prisma.activityLog.count({
          where: {
            category: LogCategory.BLOCKCHAIN,
            status: LogStatus.FAILURE,
          },
        });
      } catch (err) {
        console.error('[API] Error getting blockchain statistics:', err);
      }
      
      // Safely get recent failures
      try {
        // Get recent verification failures
        recentFailures = await prisma.activityLog.findMany({
          where: {
            category: LogCategory.VERIFICATION,
            status: LogStatus.FAILURE,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        });
      } catch (err) {
        console.error('[API] Error getting recent failures:', err);
      }
      
      // Safely get categories with counts
      try {
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
        categoryCounts = categories.map(item => ({
          category: item.category,
          count: item._count.category
        }));
      } catch (err) {
        console.error('[API] Error getting category counts:', err);
      }
    } catch (dbError) {
      console.error('[API] Database error while getting statistics:', dbError);
      // We'll continue with the default values initialized earlier
    }

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