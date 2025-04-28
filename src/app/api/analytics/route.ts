import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

export async function GET() {
  try {
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

    return NextResponse.json({
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
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 