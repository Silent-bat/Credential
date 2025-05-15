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
import { InstitutionEditForm } from "./institution-edit-form"; // We'll create this next

type Props = {
  params: { 
    locale: string;
    id: string;
  };
};

// Server action for updating institution
async function updateInstitution(formData: FormData) {
  'use server';
  
  try {
    const id = formData.get('id') as string;
    const locale = formData.get('locale') as string;
    
    // Extract form values
    const name = formData.get('name') as string;
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
        website,
        type,
        status,
        logo,
        description,
        updatedAt: new Date(),
      },
    });

    // Revalidate the institutions page
    revalidatePath(`/${locale}/dashboard/admin/institutions`);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating institution:', error);
    return { success: false, error: 'Failed to update institution' };
  }
}

export default async function EditInstitutionPage({ params }: Props) {
  // Await params before destructuring
  params = await Promise.resolve(params);
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
      institutionUsers: {
        include: {
          user: {
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
          <InstitutionEditForm 
            institution={institution} 
            updateInstitution={updateInstitution} 
            locale={locale}
            id={id}
          />
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
} 