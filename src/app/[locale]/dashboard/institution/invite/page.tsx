import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronLeft } from "lucide-react";

type Props = {
  params: { locale: string }
};

export default async function InviteStaffPage({ params: { locale } }: Props) {
  const session = await auth();
  const user = session?.user;
  
  if (!user) {
    redirect(`/${locale}/auth/login`);
  }
  
  // Check for institution role (case-insensitive check for any role containing 'institution')
  const isInstitutionAdmin = user.role?.toUpperCase()?.includes('INSTITUTION');
  
  if (!isInstitutionAdmin) {
    redirect(`/${locale}/dashboard`);
  }
  
  return (
    <div className="p-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/${locale}/dashboard/institution`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Invite Staff Member</h1>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Send Invitation</CardTitle>
          <CardDescription>
            Invite a new staff member to your institution. They will receive an email with instructions to set up their account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="colleague@example.com" />
              <p className="text-sm text-gray-500">
                The invitation will be sent to this email address.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <RadioGroup defaultValue="STAFF">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="STAFF" id="staff" />
                  <Label htmlFor="staff" className="font-normal">Staff Member</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ADMIN" id="admin" />
                  <Label htmlFor="admin" className="font-normal">Administrator</Label>
                </div>
              </RadioGroup>
              <p className="text-sm text-gray-500">
                Administrators can invite other staff members and manage institution settings.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Additional Message (Optional)</Label>
              <textarea 
                id="message" 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Write a personal message to include in the invitation email..."
              ></textarea>
            </div>

            <Button className="w-full">Send Invitation</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 