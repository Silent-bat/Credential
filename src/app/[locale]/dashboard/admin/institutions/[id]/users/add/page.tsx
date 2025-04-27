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
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { addUserToInstitution } from "./actions";

type Props = {
  params: { 
    locale: string;
    id: string;
  };
};

export default async function AddUserToInstitutionPage({ params }: Props) {
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

  // Fetch institution by ID
  const institution = await db.institution.findUnique({
    where: { id: institutionId },
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
          <Link href={`/${locale}/dashboard/admin/institutions/${institutionId}/users`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Add User to Institution</CardTitle>
          <CardDescription>
            Add a new or existing user to {institution.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={addUserToInstitution}>
            <input type="hidden" name="institutionId" value={institutionId} />
            <input type="hidden" name="locale" value={locale} />
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">User Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="user@example.com"
                  required
                />
                <p className="text-sm text-gray-500">
                  Enter the email of an existing user or a new user to invite
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Institution Role</Label>
                <Select name="role" defaultValue="MEMBER">
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Admins can manage certificates and users, members can only view
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="name">User Name (for new users)</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                />
                <p className="text-sm text-gray-500">
                  Only required when inviting a new user who doesn't exist in the system
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="submit">
                Add User
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 