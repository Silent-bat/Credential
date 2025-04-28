'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, ActivityIcon, Users, Building2, Award, FileCheck } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState<string | null>(null);

  // These would typically come from an API
  const summaryStats = {
    usersCount: 0,
    institutionsCount: 0,
    certificatesCount: 0,
    verificationCount: 0,
  };

  useEffect(() => {
    // Check authentication
    if (status === 'unauthenticated') {
      router.push(`/${locale}/auth/login`);
      return;
    }

    // Check if user is admin
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      setError('You do not have permission to access this page');
      setIsLoading(false);
      return;
    }

    // Simulate loading analytics data
    const loadData = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await fetch('/api/admin/analytics');
        // const data = await response.json();
        
        // For now, we'll just use dummy data
        setAnalyticsData({
          usersCount: 10,
          institutionsCount: 3,
          certificatesCount: 25,
          verificationCount: 42,
          recentActivity: [
            { type: 'Certificate', action: 'Created', date: new Date().toISOString() },
            { type: 'Institution', action: 'Approved', date: new Date(Date.now() - 86400000).toISOString() }
          ]
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError('Failed to load analytics data');
        setIsLoading(false);
      }
    };

    if (session) {
      loadData();
    }
  }, [session, status, router, locale]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto my-8">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container px-4 py-6 mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Analytics</h1>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="institutions">Institutions</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500 mr-3" />
                  <div className="text-2xl font-bold">
                    {analyticsData ? analyticsData.usersCount : 0}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Institutions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-indigo-500 mr-3" />
                  <div className="text-2xl font-bold">
                    {analyticsData ? analyticsData.institutionsCount : 0}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-green-500 mr-3" />
                  <div className="text-2xl font-bold">
                    {analyticsData ? analyticsData.certificatesCount : 0}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <FileCheck className="h-8 w-8 text-orange-500 mr-3" />
                  <div className="text-2xl font-bold">
                    {analyticsData ? analyticsData.verificationCount : 0}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData && analyticsData.recentActivity ? (
                <div className="space-y-4">
                  {analyticsData.recentActivity.map((activity: any, index: number) => (
                    <div key={index} className="flex items-center py-2 border-b border-gray-100 dark:border-gray-800">
                      <ActivityIcon className="h-5 w-5 mr-3 text-gray-500" />
                      <span>
                        <strong>{activity.type}</strong> was {activity.action.toLowerCase()} on{' '}
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No recent activity</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>User analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="institutions">
          <Card>
            <CardHeader>
              <CardTitle>Institution Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Institution analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Certificate analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
