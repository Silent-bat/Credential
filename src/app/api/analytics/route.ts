import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const [
      totalUsers,
      totalInstitutions,
      totalCertificates,
      userGrowth,
      certificateIssuance,
      institutionStats,
      recentActivity
    ] = await Promise.all([
      prisma.user.count(),
      prisma.institution.count(),
      prisma.certificate.count(),
      prisma.user.groupBy({
        by: ['createdAt'],
        _count: true,
        orderBy: {
          createdAt: 'asc'
        },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      prisma.certificate.groupBy({
        by: ['createdAt'],
        _count: true,
        orderBy: {
          createdAt: 'asc'
        },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.institution.findMany({
        select: {
          name: true,
          _count: {
            select: {
              certificates: true,
              users: true
            }
          }
        },
        orderBy: {
          certificates: {
            _count: 'desc'
          }
        },
        take: 5
      }),
      prisma.activityLog.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        take: 10,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
    ]);

    const response = NextResponse.json({
      totalUsers,
      totalInstitutions,
      totalCertificates,
      userGrowth: userGrowth.map(item => ({
        date: format(item.createdAt, 'MMM dd'),
        users: item._count
      })),
      certificateIssuance: certificateIssuance.map(item => ({
        date: format(item.createdAt, 'MMM dd'),
        certificates: item._count
      })),
      institutionStats,
      recentActivity
    });

    // Add caching headers
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');

    return response;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 