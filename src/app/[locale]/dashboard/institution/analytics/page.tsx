'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

type AnalyticsProps = {
  params: {
    locale: string;
  };
};

type AnalyticsData = {
  institutionOverview: {
    totalCertificates: number;
    activeCertificates: number;
    verifications: number;
    userCount: number;
  };
  certificatesByStatus: {
    name: string;
    value: number;
    color: string;
  }[];
  certificatesIssuedMonthly: {
    month: string;
    count: number;
  }[];
  verificationsMonthly: {
    month: string;
    count: number;
  }[];
};

// Fallback data in case API fails
const fallbackData: AnalyticsData = {
  institutionOverview: {
    totalCertificates: 0,
    activeCertificates: 0,
    verifications: 0,
    userCount: 0
  },
  certificatesByStatus: [
    { name: 'Active', value: 0, color: '#4ade80' },
    { name: 'Expired', value: 0, color: '#fb7185' },
    { name: 'Revoked', value: 0, color: '#f43f5e' },
    { name: 'Pending', value: 0, color: '#facc15' }
  ],
  certificatesIssuedMonthly: [],
  verificationsMonthly: []
};

export default function AnalyticsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const locale = useLocale();
  const t = useTranslations('dashboard');
  
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/auth/login`);
      return;
    }
    
    // Check if user has permission to access analytics
    const checkPermissions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user/permissions/analytics');
        const data = await response.json();
        
        if (response.ok) {
          setHasPermission(data.hasAccess);
          
          // If no permission, don't fetch analytics
          if (!data.hasAccess) {
            setIsLoading(false);
            return;
          }
          
          // If has permission, fetch analytics data
          await fetchAnalyticsData();
        } else {
          setHasPermission(false);
          setIsLoading(false);
          setError(data.message || t('errorCheckingPermissions'));
          toast({
            title: t('error'),
            description: data.message || t('errorCheckingPermissions'),
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        setHasPermission(false);
        setIsLoading(false);
        setError(t('errorCheckingPermissions'));
        toast({
          title: t('error'),
          description: t('errorCheckingPermissions'),
          variant: 'destructive',
        });
      }
    };
    
    const fetchAnalyticsData = async () => {
      try {
        // Fetch user's institution ID first
        const userResponse = await fetch('/api/user/profile');
        if (!userResponse.ok) {
          throw new Error('Failed to get user profile information');
        }
        
        const userData = await userResponse.json();
        // Get the first institution from the user's institutionUsers array
        const institutionId = userData.institutionUsers?.[0]?.institutionId;
        
        if (!institutionId) {
          setError(t('noInstitutionId'));
          setIsLoading(false);
          toast({
            title: t('error'),
            description: t('noInstitutionId'),
            variant: 'destructive',
          });
          return;
        }
        
        // Fetch analytics data from API
        const response = await fetch(`/api/institution/${institutionId}/analytics`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch analytics data');
        }
        
        setAnalyticsData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError(t('errorFetchingAnalytics'));
        setIsLoading(false);
        toast({
          title: t('error'),
          description: t('errorFetchingAnalytics'),
          variant: 'destructive',
        });
      }
    };
    
    if (session) {
      checkPermissions();
    }
  }, [session, status, router, locale, t]);
  
  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('error')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // If user doesn't have permission, show access denied
  if (hasPermission === false) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{t('accessDenied')}</AlertTitle>
          <AlertDescription>
            {t('noPermissionToAccessAnalytics')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // If no analytics data, show empty state
  if (!analyticsData) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('noData')}</AlertTitle>
          <AlertDescription>{t('noAnalyticsData')}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold">{t('institutionAnalytics')}</h1>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t('totalCertificates')}</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="text-3xl font-bold">{analyticsData.institutionOverview?.totalCertificates || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t('activeCertificates')}</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="text-3xl font-bold">{analyticsData.institutionOverview?.activeCertificates || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t('totalVerifications')}</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="text-3xl font-bold">{analyticsData.institutionOverview?.verifications || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t('userCount')}</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="text-3xl font-bold">{analyticsData.institutionOverview?.userCount || 0}</div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="certificates" className="mb-8">
            <TabsList>
              <TabsTrigger value="certificates">{t('certificates')}</TabsTrigger>
              <TabsTrigger value="verifications">{t('verifications')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="certificates">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('certificatesByStatus')}</CardTitle>
                    <CardDescription>{t('certificatesByStatusDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                  <div className="w-full h-80 mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                          data={analyticsData.certificatesByStatus || []}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                          >
                          {(analyticsData.certificatesByStatus || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        <Legend />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t('certificatesIssuedMonthly')}</CardTitle>
                    <CardDescription>{t('certificatesIssuedMonthlyDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                  <div className="w-full h-80 mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.certificatesIssuedMonthly || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                        <Bar dataKey="count" fill="#4f46e5" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="verifications">
              <Card>
                <CardHeader>
                  <CardTitle>{t('monthlyVerifications')}</CardTitle>
                  <CardDescription>{t('monthlyVerificationsDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="w-full h-80 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.verificationsMonthly || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                      <Bar dataKey="count" fill="#0ea5e9" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
      </div>
    </div>
  );
} 