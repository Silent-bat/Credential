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
import { format } from 'date-fns';

interface AnalyticsData {
  totalUsers: number;
  totalInstitutions: number;
  totalCertificates: number;
  userGrowth: Array<{ date: string; users: number }>;
  certificateIssuance: Array<{ date: string; certificates: number }>;
  institutionStats: Array<{
    name: string;
    _count: {
      certificates: number;
      users: number;
    };
  }>;
  recentActivity: Array<{
    user: {
      name: string;
      email: string;
    };
    action: string;
    createdAt: string;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('Analytics');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Text>Loading...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

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
                  {format(new Date(activity.createdAt), 'MMM dd, HH:mm')}
                </Text>
              </div>
            ))}
          </div>
        </Card>
      </Grid>
    </div>
  );
}
