import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { fetchInstitutionData } from "@/lib/fetch-institution-data";
import { AdminLanguageSwitcher } from "@/components/admin/LanguageSwitcher";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Award, 
  FileCheck, 
  Settings,
  Headset,
  BookOpen,
  BarChart3,
  UserPlus
} from "lucide-react";
import { getTranslations } from 'next-intl/server';

type Props = {
  params: { locale: string }
};

export default async function InstitutionDashboardPage({ params }: Props) {
  // Properly await params to avoid synchronous access warnings
  const resolvedParams = await Promise.resolve(params);
  const { locale } = resolvedParams;
  
  // Get translations properly with next-intl/server
  const dashboardT = await getTranslations({ locale, namespace: 'dashboard' });
  const commonT = await getTranslations({ locale, namespace: 'common' });
  
  // Safe translation utility to handle missing keys
  const safeTranslation = (translator: any, key: string, fallback: string): string => {
    try {
      return translator.raw(key) || fallback;
    } catch {
      return fallback;
    }
  };
  
  // Pre-translate all strings with fallbacks
  const translations = {
    institutionDashboard: safeTranslation(dashboardT, 'institutionDashboard', 'Institution Dashboard'),
    welcomeBack: safeTranslation(dashboardT, 'welcomeBack', 'Welcome back'),
    settings: safeTranslation(commonT, 'navigation.settings', 'Settings'),
    inviteStaff: safeTranslation(dashboardT, 'inviteStaff', 'Invite Staff'),
    dbConnectionError: safeTranslation(dashboardT, 'dbConnectionError', 'Database connection error'),
    noInstitutionFound: safeTranslation(dashboardT, 'noInstitutionFound', 'No Institution Found'),
    accountNotAssociated: safeTranslation(dashboardT, 'accountNotAssociated', 'Your account is not associated with any institution'),
    staffMembers: safeTranslation(dashboardT, 'staffMembers', 'Staff Members'),
    manageStaff: safeTranslation(dashboardT, 'manageStaff', 'Manage Staff'),
    viewAllUsers: safeTranslation(dashboardT, 'viewAllUsers', 'View All Users'),
    totalCertificates: safeTranslation(dashboardT, 'totalCertificates', 'Total Certificates'),
    viewAllCertificates: safeTranslation(dashboardT, 'viewAllCertificates', 'View All Certificates'),
    createCertificate: safeTranslation(dashboardT, 'createCertificate', 'Create Certificate'),
    issueCertificate: safeTranslation(dashboardT, 'issueCertificate', 'Issue Certificate'),
    createNewCertificate: safeTranslation(dashboardT, 'createNewCertificate', 'Create New Certificate'),
    support: safeTranslation(commonT, 'navigation.support', 'Support'),
    submitSupportTicket: safeTranslation(dashboardT, 'submitSupportTicket', 'Submit Support Ticket'),
    unauthorized: safeTranslation(dashboardT, 'unauthorized', 'Unauthorized'),
    unauthorizedDescription: safeTranslation(dashboardT, 'unauthorizedDescription', 'You do not have permission to access this page'),
    goToDashboard: safeTranslation(dashboardT, 'goToDashboard', 'Go to Dashboard'),
    analytics: safeTranslation(dashboardT, 'analytics', 'Analytics'),
    viewAnalytics: safeTranslation(dashboardT, 'viewAnalytics', 'View Analytics'),
    resources: safeTranslation(dashboardT, 'resources', 'Resources'),
    viewDocs: safeTranslation(dashboardT, 'viewDocs', 'View Documentation'),
    error: safeTranslation(commonT, 'messages.error', 'Error')
  };
  
  const session = await auth();
  const user = session?.user;
  
  if (!user) {
    redirect(`/${locale}/auth/login`);
  }
  
  // Check for institution role (case-insensitive check for any role containing 'institution')
  const isInstitutionAdmin = user.role?.toUpperCase()?.includes('INSTITUTION');
  
  if (!isInstitutionAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold">{translations.unauthorized}</h1>
        <p>{translations.unauthorizedDescription}</p>
        <Button className="mt-4" asChild>
          <Link href={`/${locale}/dashboard`}>{translations.goToDashboard}</Link>
        </Button>
      </div>
    );
  }
  
  // Fetch dashboard data
  const { 
    staffCount, 
    certificatesCount, 
    pendingCertificatesCount, 
    ticketsCount, 
    dbConnectionError, 
    institutionId 
  } = await fetchInstitutionData(user.id);
  
  if (institutionId) {
  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold">{translations.institutionDashboard}</h1>
            <p className="text-gray-600 mt-2">{translations.welcomeBack}, {user.name}!</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <AdminLanguageSwitcher />
          <Button variant="outline" asChild>
            <Link href={`/${locale}/dashboard/institution/settings`}>
              <Settings className="mr-2 h-4 w-4" />
                {translations.settings}
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/${locale}/dashboard/institution/invite`}>
              <UserPlus className="mr-2 h-4 w-4" />
                {translations.inviteStaff}
            </Link>
          </Button>
        </div>
      </div>
      
      {dbConnectionError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                  <strong>{translations.error}:</strong> {translations.dbConnectionError}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {!institutionId && !dbConnectionError && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                  <strong>{translations.noInstitutionFound}:</strong> {translations.accountNotAssociated}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{translations.staffMembers}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{staffCount}</div>
                <div className="flex space-x-4">
                  <Link href={`/${locale}/dashboard/institution/staff`} className="text-sm text-blue-600">
                      {translations.manageStaff}
                  </Link>
                  <Link href={`/${locale}/dashboard/institution/users`} className="text-sm text-blue-600">
                      {translations.viewAllUsers}
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{translations.totalCertificates}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Award className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{certificatesCount}</div>
                <Link href={`/${locale}/dashboard/institution/certificates`} className="text-sm text-blue-600">
                    {translations.viewAllCertificates}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{translations.createCertificate}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileCheck className="h-8 w-8 text-indigo-500 mr-3" />
              <div>
                  <div className="text-xl font-medium">{translations.issueCertificate}</div>
                <Link href={`/${locale}/dashboard/institution/certificates/create`} className="text-sm text-blue-600">
                    {translations.createNewCertificate}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{translations.support}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Headset className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{ticketsCount}</div>
                <Link href={`/${locale}/dashboard/institution/support`} className="text-sm text-blue-600">
                    {translations.submitSupportTicket}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
        {/* Additional Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
              <CardTitle>{translations.analytics}</CardTitle>
              <CardDescription>{safeTranslation(dashboardT, 'analyticsDescription', 'View certificate metrics and statistics')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
                <Link href={`/${locale}/dashboard/institution/analytics`}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  {translations.viewAnalytics}
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
              <CardTitle>{translations.resources}</CardTitle>
              <CardDescription>{safeTranslation(dashboardT, 'resourcesDescription', 'Access guides and documentation')}</CardDescription>
          </CardHeader>
          <CardContent>
              <Button asChild>
                <Link href={`/${locale}/dashboard/resources`}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  {translations.viewDocs}
                </Link>
              </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }
  
  // Fallback view for no institution
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">{translations.noInstitutionFound}</h1>
        <p className="mb-8">{translations.accountNotAssociated}</p>
        <Button asChild>
          <Link href={`/${locale}/dashboard`}>{translations.goToDashboard}</Link>
        </Button>
      </div>
    </div>
  );
} 