'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, ActivityIcon, Users, Building2, Award, FileCheck } from 'lucide-react';
import { Title, Text, Grid, DonutChart, BarChart, AreaChart } from '@tremor/react';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

async function getAnalyticsData() {
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

  return {
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
  };
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();
  const t = useTranslations('Analytics');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-gray-500">{t('description')}</p>
      </div>

      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
        <Card>
          <Text>{t('totalUsers')}</Text>
          <Title>{data.totalUsers}</Title>
        </Card>
        <Card>
          <Text>{t('totalInstitutions')}</Text>
          <Title>{data.totalInstitutions}</Title>
        </Card>
        <Card>
          <Text>{t('totalCertificates')}</Text>
          <Title>{data.totalCertificates}</Title>
        </Card>
      </Grid>

      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>{t('userGrowth')}</Title>
          <AreaChart
            className="h-72 mt-4"
            data={data.userGrowth}
            index="date"
            categories={['users']}
            colors={['blue']}
          />
        </Card>
        <Card>
          <Title>{t('certificateIssuance')}</Title>
          <BarChart
            className="h-72 mt-4"
            data={data.certificateIssuance}
            index="date"
            categories={['certificates']}
            colors={['green']}
          />
        </Card>
      </Grid>

      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>{t('topInstitutions')}</Title>
          <div className="mt-4">
            {data.institutionStats.map((institution, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <Text>{institution.name}</Text>
                <div className="flex gap-4">
                  <Text>{institution._count.certificates} {t('certificates')}</Text>
                  <Text>{institution._count.users} {t('users')}</Text>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <Title>{t('recentActivity')}</Title>
          <div className="mt-4 space-y-4">
            {data.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <Text className="font-medium">{activity.user.name}</Text>
                  <Text className="text-sm text-gray-500">{activity.action}</Text>
                </div>
                <Text className="text-sm text-gray-500">
                  {format(activity.createdAt, 'MMM dd, HH:mm')}
                </Text>
              </div>
            ))}
          </div>
        </Card>
      </Grid>
    </div>
  );
}
