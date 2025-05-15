import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Users, FileText, PencilIcon, ExternalLinkIcon, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type Props = {
  params: { 
    locale: string;
    id: string;
  };
};

export default async function InstitutionDetailsPage({ params }: Props) {
  // Await params before destructuring
  params = await Promise.resolve(params);
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
    include: {
      institutionUsers: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        take: 5,
      },
      certificates: {
        select: {
          id: true,
          title: true,
          recipientName: true,
          recipientEmail: true,
          createdAt: true,
        },
        take: 5,
        orderBy: {
          createdAt: 'desc',
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

  // Count total certificates and users
  const certificateCount = await db.certificate.count({
    where: {
      institutionId: institution.id,
    },
  });

  const userCount = institution.institutionUsers.length;

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
          <div className="flex items-center">
            <h1 className="text-3xl font-bold">{institution.name}</h1>
            <span className={`ml-3 px-2 py-1 rounded text-xs font-medium ${
              institution.status === "APPROVED" 
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                : institution.status === "PENDING" 
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            }`}>
              {institution.status}
            </span>
          </div>
          <p className="text-gray-600 mt-2">{institution.description || "No description provided."}</p>
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button asChild variant="outline">
            <Link href={`/${locale}/dashboard/admin/institutions/${institutionId}/edit`}>
              <PencilIcon className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/${locale}/dashboard/admin/institutions/${institutionId}/users`}>
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Institution Type</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{institution.type}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{userCount}</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/${locale}/dashboard/admin/institutions/${institutionId}/users`}>
                View All Users
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{certificateCount}</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/${locale}/dashboard/admin/certificates?institution=${institutionId}`}>
                View All Certificates
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="details" className="mb-8">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Institution Details</CardTitle>
              <CardDescription>
                Complete information about the institution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{institution.name}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    No email associated with this institution
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {institution.website ? (
                      <a 
                        href={institution.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        {institution.website}
                        <ExternalLinkIcon className="ml-1 h-3 w-3" />
                      </a>
                    ) : (
                      "No website provided"
                    )}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{institution.type}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{new Date(institution.createdAt).toLocaleDateString()}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{new Date(institution.updatedAt).toLocaleDateString()}</dd>
                </div>
              </dl>

              {institution.description && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{institution.description}</p>
                </div>
              )}

              {institution.logo && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Logo</h3>
                  <img 
                    src={institution.logo} 
                    alt={`${institution.name} logo`}
                    className="h-20 object-contain"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Institution Users</CardTitle>
              <CardDescription>
                Users that have access to manage this institution
              </CardDescription>
            </CardHeader>
            <CardContent>
              {institution.institutionUsers.length === 0 ? (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No Users Found</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    This institution doesn't have any associated users yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Email</th>
                        <th scope="col" className="px-6 py-3">Role</th>
                        <th scope="col" className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {institution.institutionUsers.map((institutionUser) => (
                        <tr 
                          key={institutionUser.userId} 
                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {institutionUser.user.name || "No Name"}
                          </td>
                          <td className="px-6 py-4">{institutionUser.user.email}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              {institutionUser.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Link href={`/${locale}/dashboard/admin/users/${institutionUser.userId}/edit`}>
                              <Button variant="outline" size="sm">
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button asChild>
                <Link href={`/${locale}/dashboard/admin/institutions/${institutionId}/users`}>
                  <Users className="mr-2 h-4 w-4" />
                  View All Users
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="certificates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Certificates</CardTitle>
              <CardDescription>
                Certificates recently issued by this institution
              </CardDescription>
            </CardHeader>
            <CardContent>
              {institution.certificates.length === 0 ? (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No Certificates Found</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    This institution hasn't issued any certificates yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">Title</th>
                        <th scope="col" className="px-6 py-3">Recipient</th>
                        <th scope="col" className="px-6 py-3">Date Issued</th>
                        <th scope="col" className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {institution.certificates.map((certificate) => (
                        <tr 
                          key={certificate.id} 
                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {certificate.title}
                          </td>
                          <td className="px-6 py-4">
                            {certificate.recipientName || certificate.recipientEmail}
                          </td>
                          <td className="px-6 py-4">
                            {new Date(certificate.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <Link href={`/${locale}/dashboard/admin/certificates/${certificate.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button asChild>
                <Link href={`/${locale}/dashboard/admin/certificates?institution=${institutionId}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  View All Certificates
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 