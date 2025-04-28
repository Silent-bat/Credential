import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import Link from "next/link";
import { UserPlusIcon, DatabaseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UsersList from "./users-list";

type Props = {
  params: { locale: string };
};

// Define the User type based on the exact prisma response shape
type UserWithInstitution = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  institutionUsers: {
    institutionId: string;
    institution: {
      name: string;
    }
  }[];
}

export default async function AdminUsersPage({ params }: Props) {
  // Create a copy of the locale to avoid direct access in an async context
  const currentLocale = String(params?.locale || 'en');
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

  // Initialize users array and error state with proper typing
  let users: UserWithInstitution[] = [];
  let dbError = false;

  try {
    // Fetch users from database with properly matching field names
    users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        institutionUsers: {
          select: {
            institutionId: true,
            institution: {
              select: {
                name: true
              }
            }
          }
        }
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    dbError = true;
  }

  // Safely serialize users for client components
  const serializedUsers = users.map(user => ({
    ...user,
    // Convert Date to string for proper serialization
    createdAt: user.createdAt.toISOString(),
    // Ensure institutionUsers is always an array
    institutionUsers: user.institutionUsers || [],
    // Ensure name is always a string
    name: user.name || "",
  }));

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600 mt-2">Manage user accounts and permissions</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button asChild>
            <Link href={`/${currentLocale}/dashboard/admin/users/create`}>
              <UserPlusIcon className="mr-2 h-4 w-4" />
              Add New User
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
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <UsersList 
          initialUsers={serializedUsers} 
          locale={currentLocale} 
        />
      )}
    </div>
  );
} 