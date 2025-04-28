import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import prisma from '@/lib/db';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { LogsTable } from '@/components/dashboard/admin/logs/LogsTable';
import { LogsStats } from '@/components/dashboard/admin/logs/LogsStats';

type Props = {
  params: { locale: string }
  searchParams: { [key: string]: string | string[] | undefined }
};

export default async function AdminLogsPage({ params, searchParams }: Props) {
  const currentLocale = String(params?.locale || 'en');
  const session = await auth();
  const user = session?.user;
  const t = await getTranslations({ locale: currentLocale, namespace: 'admin.logs' });

  if (!user) {
    redirect(`/${currentLocale}/auth/login`);
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">{t('unauthorized')}</h1>
        <p>{t('unauthorizedDescription')}</p>
      </div>
    );
  }

  let logs = [];
  let stats = null;
  let error = null;
  let totalCount = 0;

  try {
    // Get pagination parameters
    const page = Number(searchParams.page) || 1;
    const pageSize = Number(searchParams.pageSize) || 20;
    const skip = (page - 1) * pageSize;

    // Fetch total count for pagination
    totalCount = await prisma.activityLog.count();

    // Fetch logs with pagination
    logs = await prisma.activityLog.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        Institution: {
          select: {
            id: true,
            name: true,
          },
        },
        Certificate: {
          select: {
            id: true,
            title: true,
            recipientName: true,
          },
        },
      },
      skip,
      take: pageSize,
    });

    // Format dates and ensure all fields are properly serialized
    logs = logs.map(log => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
      User: log.User || { id: '', name: 'System', email: 'system' },
      Institution: log.Institution || null,
      Certificate: log.Certificate || null,
    }));

    // Fetch statistics
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

    stats = {
      categories: categories.map(item => ({
        category: item.category,
        count: item._count.category
      }))
    };
  } catch (err) {
    console.error("Error fetching logs:", err);
    error = "Failed to load logs. Please check your database connection and try again later.";
  }

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-gray-600 mt-2">{t('subtitle')}</p>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4">
              <button 
                onClick={() => window.location.reload()} 
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                Retry
              </button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {stats && <LogsStats stats={stats} />}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{t('recentLogs')}</CardTitle>
              <CardDescription>
                {t('recentLogsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogsTable 
                logs={logs} 
                totalCount={totalCount}
                currentPage={Number(searchParams.page) || 1}
                pageSize={Number(searchParams.pageSize) || 20}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 