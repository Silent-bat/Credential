import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import ActivityLogWidget from "@/components/admin/ActivityLogWidget";
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
  Building2, 
  Award, 
  FileCheck, 
  Shield, 
  Settings,
  Languages,
  Headset
} from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  params: { locale: string }
};

export default async function AdminDashboardPage({ params }: Props) {
  const session = await auth();
  const user = session?.user;
  // Safely access the locale parameter and cast it to string
  const locale = params.locale as string;
  
  if (!user) {
    return redirect(`/${locale}/auth/login`);
  }
  
  if (user.role !== "ADMIN") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p>You don't have permission to access the admin dashboard.</p>
      </div>
    );
  }
  
  // Initialize stats with default values
  let usersCount = 0;
  let institutionsCount = 0;
  let certificatesCount = 0;
  let pendingInstitutionsCount = 0;
  let dbConnectionError = false;
  let ticketsCount = 0;
  
  try {
    // Fetch dashboard statistics
    [
      usersCount,
      institutionsCount,
      certificatesCount,
      pendingInstitutionsCount,
      ticketsCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.institution.count(),
      prisma.certificate.count(), 
      prisma.institution.count({
        where: {
          status: "PENDING"
        }
      }),
      prisma.ticket.count()
    ]);
  } catch (error) {
    console.error("Database connection error:", error);
    dbConnectionError = true;
  }
  
  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user.name}!</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <AdminLanguageSwitcher />
          <Button variant="outline" asChild>
            <Link href={`/${locale}/dashboard/admin/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/${locale}/dashboard/admin/logs`}>
              <Shield className="mr-2 h-4 w-4" />
              View All Logs
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
                <strong>Database Connection Error:</strong> Could not connect to the database. Some data may not be available.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{usersCount}</div>
                <Link href={`/${locale}/dashboard/admin/users`} className="text-sm text-blue-600">
                  View all users
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Institutions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-indigo-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{institutionsCount}</div>
                <Link href={`/${locale}/dashboard/admin/institutions`} className="text-sm text-blue-600">
                  View all institutions
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Award className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{certificatesCount}</div>
                <Link href={`/${locale}/dashboard/admin/certificates`} className="text-sm text-blue-600">
                  View all certificates
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileCheck className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{pendingInstitutionsCount}</div>
                <Link href={`/${locale}/dashboard/admin/institutions?status=PENDING`} className="text-sm text-blue-600">
                  Review pending institutions
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Headset className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{ticketsCount}</div>
                <Link href={`/${locale}/dashboard/admin/support`} className="text-sm text-blue-600">
                  View all tickets
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Activity Logs Widget */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Suspense fallback={<div className="col-span-full">Loading activity logs...</div>}>
          <div className="col-span-full">
            <ActivityLogWidget />
          </div>
        </Suspense>
      </div>
    </div>
  );
} 