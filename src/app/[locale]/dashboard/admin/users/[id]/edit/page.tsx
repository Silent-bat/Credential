import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { revalidatePath } from "next/cache";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

type Props = {
  params: { 
    locale: string;
    id: string;
  };
};

export default async function EditUserPage({ params }: Props) {
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

  // Fetch user by ID
  const user = await db.user.findUnique({
    where: { id },
    include: {
      InstitutionUser: {
        include: {
          Institution: {
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

  // Server action to handle form submission
  async function updateUser(formData: FormData) {
    'use server';
    
    try {
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

      // Revalidate the users page and redirect
      revalidatePath(`/${locale}/dashboard/admin/users`);
      redirect(`/${locale}/dashboard/admin/users`);
    } catch (error) {
      console.error('Error updating user:', error);
      return { error: 'Failed to update user' };
    }
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
          <form action={updateUser} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={user.name || ''}
                  placeholder="Enter full name" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  defaultValue={user.email}
                  placeholder="Enter email address" 
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">User Role</Label>
                <Select name="role" defaultValue={user.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="INSTITUTION">Institution Manager</SelectItem>
                    <SelectItem value="USER">Regular User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredLocale">Preferred Language</Label>
                <Select name="preferredLocale" defaultValue={user.preferredLocale || 'en'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {user.InstitutionUser && user.InstitutionUser.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Associated Institutions</h3>
                <ul className="space-y-2">
                  {user.InstitutionUser.map((membership) => (
                    <li key={membership.institutionId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div>
                        <span className="font-medium">{membership.Institution.name}</span>
                        <span className="ml-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          {membership.role}
                        </span>
                      </div>
                      <Link href={`/${locale}/dashboard/admin/institutions/${membership.institutionId}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" asChild>
                <Link href={`/${locale}/dashboard/admin/users`}>
                  Cancel
                </Link>
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
} 