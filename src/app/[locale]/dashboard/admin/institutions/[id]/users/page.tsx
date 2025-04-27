import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UsersTable from "./UsersTable";

type Props = {
  params: { 
    locale: string;
    id: string;
  };
};

export default async function InstitutionUsersPage({ params }: Props) {
  const { locale, id: institutionId } = params;
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  // Fetch institution by ID with its users
  const institution = await db.institution.findUnique({
    where: { id: institutionId },
    include: {
      InstitutionUser: {
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!institution) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Institution Not Found</h1>
        <p>The requested institution could not be found.</p>
        <Button asChild className="mt-4">
          <Link href={`/${locale}/dashboard/admin/institutions`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Institutions
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <Button asChild variant="outline">
          <Link href={`/${locale}/dashboard/admin/institutions/${institutionId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Institution
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/${locale}/dashboard/admin/institutions/${institutionId}/users/add`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users for {institution.name}</CardTitle>
          <CardDescription>
            Manage users who have access to this institution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {institution.InstitutionUser.length === 0 ? (
            <div className="text-center py-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No Users Found</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                This institution doesn't have any associated users yet.
              </p>
              <Button asChild className="mt-4">
                <Link href={`/${locale}/dashboard/admin/institutions/${institutionId}/users/add`}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Invite Users
                </Link>
              </Button>
            </div>
          ) : (
            <UsersTable 
              locale={locale} 
              institutionId={institutionId} 
              institutionName={institution.name}
              institutionUsers={institution.InstitutionUser} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}