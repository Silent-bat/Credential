'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ActivityIcon, Users, Building2, Award, FileCheck, RefreshCw } from 'lucide-react';
import { Title, Text, Grid, DonutChart, BarChart, AreaChart } from '@tremor/react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [retryCount, setRetryCount] = useState(0);
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Analytics');

  useEffect(() => {
    // Check if session is loading
    if (status === 'loading') return;

    // Check if user is not authenticated
    if (status === 'unauthenticated') {
      router.push(`/${locale}/auth/login`);
      return;
    }

    // Check if user is not an admin
    if (session?.user?.role !== 'ADMIN') {
      setError('You do not have permission to view this page');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/analytics', {
          next: { revalidate: 60 }, // Revalidate every minute
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.status === 401) {
          router.push(`/${locale}/auth/login`);
          return;
        }
        
        if (response.status === 403) {
          setError('You do not have permission to view this page');
          return;
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch analytics data');
        }
        
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [retryCount, router, session, status, locale]);

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-24 mt-2" />
            </Card>
          ))}
        </Grid>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-24 mt-2" />
            </Card>
          ))}
        </Grid>
        <Grid numItems={1} numItemsLg={2} className="gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-72 mt-4" />
            </Card>
          ))}
        </Grid>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        {retryCount < 3 && (
          <Button
            onClick={() => setRetryCount(prev => prev + 1)}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        )}
      </div>
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

export const dynamic = 'force-dynamic'
