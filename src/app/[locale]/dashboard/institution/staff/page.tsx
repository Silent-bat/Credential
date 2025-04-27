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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft, 
  UserPlus, 
  Search, 
  Mail, 
  UserCog, 
  Trash2, 
  Filter,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchInstitutionUsers } from "@/lib/fetch-institution-data";

type Props = {
  params: { locale: string }
};

export default async function InstitutionStaffPage({ params: { locale } }: Props) {
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
  
  // Fetch real data from the database
  const { users: staffMembers, dbConnectionError, institutionId } = await fetchInstitutionUsers(user.id);
  
  // Check if user has an institution
  if (!institutionId && !dbConnectionError) {
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
        
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No institution found</AlertTitle>
          <AlertDescription>
            Your account is not associated with any institution. Please contact an administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Function to render status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "inactive":
        return <Badge className="bg-gray-500">Inactive</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
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
      
      {dbConnectionError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Error</AlertTitle>
          <AlertDescription>
            There was a problem connecting to the database. Some data may not be available.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage your institution's staff members</p>
        </div>
        
        <Button className="mt-4 md:mt-0" asChild>
          <Link href={`/${locale}/dashboard/institution/invite`}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Staff Member
          </Link>
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
          <CardDescription>
            View and manage all staff members associated with your institution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search staff members..."
                className="pl-8"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <select className="h-10 rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none">
                  <option value="all">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="STAFF">Staff</option>
                  <option value="MEMBER">Member</option>
                </select>
                <Filter className="absolute right-2 top-2.5 h-4 w-4 text-gray-500" />
              </div>
              <div className="relative">
                <select className="h-10 rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none">
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
                <Filter className="absolute right-2 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
          
          {staffMembers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffMembers.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      <TableCell className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        {staff.email}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                          {staff.role}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(staff.status)}</TableCell>
                      <TableCell>
                        {new Date(staff.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/${locale}/dashboard/institution/staff/${staff.id}`}>
                              View
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <UserCog className="h-4 w-4" />
                          </Button>
                          {staff.status !== "pending" && (
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <UserPlus className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-1">No staff members found</h3>
              <p className="text-sm text-gray-500 mb-4">
                You haven't added any staff members to your institution yet.
              </p>
              <Button asChild>
                <Link href={`/${locale}/dashboard/institution/invite`}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Staff Member
                </Link>
              </Button>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Showing {staffMembers.length} of {staffMembers.length} staff members
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 