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
import { Textarea } from "@/components/ui/textarea";
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

export default async function EditInstitutionPage({ params }: Props) {
  const { locale, id } = params;
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

  // Fetch institution by ID
  const institution = await db.institution.findUnique({
    where: { id },
    include: {
      InstitutionUser: {
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        take: 5,
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

  // Server action to handle form submission
  async function updateInstitution(formData: FormData) {
    'use server';
    
    try {
      // Extract form values
      const name = formData.get('name') as string;
      const email = formData.get('email') as string;
      const website = formData.get('website') as string;
      const type = formData.get('type') as string;
      const status = formData.get('status') as string;
      const logo = formData.get('logo') as string;
      const description = formData.get('description') as string;

      // Update institution in database
      await db.institution.update({
        where: { id },
        data: {
          name,
          email,
          website,
          type,
          status,
          logo,
          description,
          updatedAt: new Date(),
        },
      });

      // Revalidate the institutions page and redirect
      revalidatePath(`/${locale}/dashboard/admin/institutions`);
      redirect(`/${locale}/dashboard/admin/institutions`);
    } catch (error) {
      console.error('Error updating institution:', error);
      return { error: 'Failed to update institution' };
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link href={`/${locale}/dashboard/admin/institutions`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Institutions
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Edit Institution</h1>
          <p className="text-gray-600 mt-2">Update institution details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Institution Details</CardTitle>
          <CardDescription>
            Update the details of this institution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateInstitution} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Institution Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={institution.name}
                  placeholder="Enter institution name" 
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  defaultValue={institution.email || ''}
                  placeholder="Enter contact email" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input 
                  id="website" 
                  name="website" 
                  defaultValue={institution.website || ''}
                  placeholder="Enter website URL" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Institution Type</Label>
                <Select name="type" defaultValue={institution.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNIVERSITY">University</SelectItem>
                    <SelectItem value="COLLEGE">College</SelectItem>
                    <SelectItem value="SCHOOL">School</SelectItem>
                    <SelectItem value="TRAINING_CENTER">Training Center</SelectItem>
                    <SelectItem value="COMPANY">Company</SelectItem>
                    <SelectItem value="GOVERNMENT">Government</SelectItem>
                    <SelectItem value="NONPROFIT">Non-Profit</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={institution.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL (Optional)</Label>
                <Input 
                  id="logo" 
                  name="logo" 
                  defaultValue={institution.logo || ''}
                  placeholder="Enter logo URL" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                defaultValue={institution.description || ''}
                placeholder="Enter institution description" 
                rows={4} 
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" asChild>
                <Link href={`/${locale}/dashboard/admin/institutions`}>
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