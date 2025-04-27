import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import Link from "next/link";
import { FilePlusIcon, DatabaseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CertificatesList from "./certificates-list";

type Props = {
  params: { locale: string };
};

export default async function AdminCertificatesPage({
  params,
}: Props) {
  // Properly await the params to avoid synchronous access warnings
  params = await Promise.resolve(params);
  
  // Create a copy of the locale to avoid direct access in an async context
  const currentLocale = String(params.locale || 'en');
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect(`/${currentLocale}/auth/login`);
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  // Initialize certificates array and error flag
  let certificates = [];
  let dbError = false;

  try {
    // Fetch certificates from database
    certificates = await prisma.certificate.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        institution: {
          select: {
            name: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    dbError = true;
  }

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Certificate Management</h1>
          <p className="text-gray-600 mt-2">Manage certificates issued by all institutions</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button asChild>
            <Link href={`/${currentLocale}/dashboard/admin/certificates/create`}>
              <FilePlusIcon className="mr-2 h-4 w-4" />
              Issue Certificate
            </Link>
          </Button>
        </div>
      </div>
      
      {dbError ? (
        <Card>
          <CardContent className="py-10">
            <div className="flex flex-col items-center justify-center text-center">
              <DatabaseIcon className="h-10 w-10 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Database Connection Error</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Unable to connect to the database. Please check your database configuration or try again later.
              </p>
              <form action={async () => { 'use server'; }}>
                <Button variant="outline" className="mt-4" type="submit">
                  Try Again
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      ) : (
        <CertificatesList 
          initialCertificates={certificates} 
          locale={currentLocale} 
        />
      )}
    </div>
  );
} 