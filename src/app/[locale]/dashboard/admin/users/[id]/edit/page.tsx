import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { revalidatePath } from "next/cache";
import { Toaster } from "@/components/ui/toaster";
import { UserEditForm } from "./user-edit-form"; // We'll create this component next

type Props = {
  params: { 
    locale: string;
    id: string;
  };
};

// Server action for updating user
async function updateUser(formData: FormData) {
  'use server';
  
  try {
    const id = formData.get('id') as string;
    const locale = formData.get('locale') as string;
    
    // Extract form values
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const preferredLocale = formData.get('preferredLocale') as string;
    
    // Update user in database
    await db.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
        preferredLocale,
        updatedAt: new Date(),
      },
    });

    // Revalidate the users page
    revalidatePath(`/${locale}/dashboard/admin/users`);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: 'Failed to update user' };
  }
}

export default async function EditUserPage({ params }: Props) {
  // Await params before destructuring
  params = await Promise.resolve(params);
  const { locale, id } = params;
  
  const session = await auth();
  const currentUser = session?.user;

  if (!currentUser) {
    redirect(`/${locale}/auth/login`);
  }

  if (currentUser.role !== "ADMIN") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  // Fetch user by ID - Fix the field names to use lowercase 'institutionUsers' and 'institution'
  const user = await db.user.findUnique({
    where: { id },
    include: {
      institutionUsers: {
        include: {
          institution: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">User Not Found</h1>
        <p>The requested user could not be found.</p>
        <Button asChild className="mt-4">
          <Link href={`/${locale}/dashboard/admin/users`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link href={`/${locale}/dashboard/admin/users`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Edit User</h1>
          <p className="text-gray-600 mt-2">Update user details and permissions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>
            Update the details of this user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserEditForm 
            user={user} 
            updateUser={updateUser} 
            locale={locale}
            id={id}
          />
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
} 