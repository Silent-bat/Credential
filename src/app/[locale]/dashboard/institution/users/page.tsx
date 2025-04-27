import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { fetchInstitutionUsers } from "@/lib/fetch-institution-data";
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
  Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from 'next-intl/server';

type Props = {
  params: { locale: string }
};

export default async function InstitutionUsersPage(props: Props) {
  // Properly await params to fix the NextJS warning
  const params = await Promise.resolve(props.params);
  const { locale } = params;
  
  // Output current pathname for debugging
  console.log('Current pathname:', `/dashboard/institution/users`);
  console.log('Current locale:', locale);
  console.log('Path segments:', [locale, 'dashboard', 'institution', 'users']);
  
  // Get translations for dashboard and common namespaces
  const dashboardT = await getTranslations({ locale, namespace: 'dashboard' });
  const commonT = await getTranslations({ locale, namespace: 'common' });

  // Safe translation utility to handle missing keys
  const safeTranslation = (translator: any, key: string, fallback: string): string => {
    try {
      return translator.raw(key) || fallback;
    } catch {
      return fallback;
    }
  };
  
  // Pre-translate strings to avoid passing functions to client components
  const translations = {
    title: safeTranslation(dashboardT, 'users.title', 'Institution Users'),
    subtitle: safeTranslation(dashboardT, 'users.subtitle', 'Manage users of your institution'),
    back: safeTranslation(commonT, 'buttons.back', 'Back'),
    inviteUsers: safeTranslation(dashboardT, 'users.inviteUsers', 'Invite Users'),
    connectionError: safeTranslation(dashboardT, 'users.connectionError', 'Connection Error'),
    connectionErrorDescription: safeTranslation(dashboardT, 'users.connectionErrorDescription', 'Could not connect to the database. Please try again later.'),
    noInstitution: safeTranslation(dashboardT, 'users.noInstitution', 'No Institution Found'),
    noInstitutionDescription: safeTranslation(dashboardT, 'users.noInstitutionDescription', 'You are not associated with any institution.'),
    search: safeTranslation(dashboardT, 'users.search', 'Search users...'),
    allStatus: safeTranslation(dashboardT, 'users.allStatus', 'All Statuses'),
    user: safeTranslation(dashboardT, 'users.user', 'User'),
    role: safeTranslation(dashboardT, 'users.role', 'Role'),
    status: safeTranslation(dashboardT, 'users.status', 'Status'),
    added: safeTranslation(dashboardT, 'users.added', 'Added'),
    actions: safeTranslation(commonT, 'labels.actions', 'Actions'),
    noUsers: safeTranslation(dashboardT, 'users.noUsers', 'No Users Found'),
    noUsersDescription: safeTranslation(dashboardT, 'users.noUsersDescription', 'Start by inviting users to your institution.'),
    showing: safeTranslation(dashboardT, 'users.showing', 'Showing'),
    of: safeTranslation(dashboardT, 'users.of', 'of'),
    users: safeTranslation(dashboardT, 'users.users', 'users'),
    previous: safeTranslation(commonT, 'buttons.previous', 'Previous'),
    next: safeTranslation(commonT, 'buttons.next', 'Next'),
    unnamedUser: safeTranslation(dashboardT, 'users.unnamedUser', 'Unnamed User'),
    defaultRole: safeTranslation(dashboardT, 'users.defaultRole', 'Member'),
    statusLabels: {
      active: safeTranslation(dashboardT, 'users.statusLabels.active', 'Active'),
      pending: safeTranslation(dashboardT, 'users.statusLabels.pending', 'Pending'),
      inactive: safeTranslation(dashboardT, 'users.statusLabels.inactive', 'Inactive'),
      unknown: safeTranslation(dashboardT, 'users.statusLabels.unknown', 'Unknown')
    },
    actionLabels: {
      editUser: safeTranslation(dashboardT, 'users.actionLabels.editUser', 'Edit User'),
      removeUser: safeTranslation(dashboardT, 'users.actionLabels.removeUser', 'Remove User'),
      resendInvite: safeTranslation(dashboardT, 'users.actionLabels.resendInvite', 'Resend Invite')
    }
  };
  
  // Get translations for certificates namespace (to use common status labels)
  const certificatesT = await getTranslations({ locale, namespace: 'certificates' });
  
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
  
  // Fetch users data using the utility function
  const { users, dbConnectionError, institutionId } = await fetchInstitutionUsers(user.id);

  // Function to render status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">{translations.statusLabels.active}</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">{translations.statusLabels.pending}</Badge>;
      case "inactive":
        return <Badge className="bg-gray-500">{translations.statusLabels.inactive}</Badge>;
      default:
        return <Badge>{translations.statusLabels.unknown}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{translations.title}</h1>
          <p className="text-muted-foreground">{translations.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild variant="outline">
            <Link href={`/${locale}/dashboard`}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              {translations.back}
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/${locale}/dashboard/institution/users/add`}>
              <UserPlus className="mr-1 h-4 w-4" />
              {translations.inviteUsers}
            </Link>
          </Button>
        </div>
      </div>
      
      {dbConnectionError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>{translations.connectionError}:</strong> {translations.connectionErrorDescription}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {!institutionId && !dbConnectionError && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>{translations.noInstitution}:</strong> {translations.noInstitutionDescription}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>{translations.title}</CardTitle>
          <CardDescription>
            {translations.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder={translations.search}
                className="pl-8"
              />
            </div>
            <div className="ml-4">
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">{translations.allStatus}</option>
                <option value="active">{translations.statusLabels.active}</option>
                <option value="pending">{translations.statusLabels.pending}</option>
                <option value="inactive">{translations.statusLabels.inactive}</option>
              </select>
            </div>
          </div>
          
          {users.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{translations.user}</TableHead>
                    <TableHead>{translations.role}</TableHead>
                    <TableHead>{translations.status}</TableHead>
                    <TableHead>{translations.added}</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name || translations.unnamedUser}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{user.role || translations.defaultRole}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString(locale) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {user.status === "pending" ? (
                            <Button variant="outline" size="icon">
                              <Mail className="h-4 w-4" />
                              <span className="sr-only">{translations.actionLabels.resendInvite}</span>
                            </Button>
                          ) : (
                            <Button variant="outline" size="icon">
                              <UserCog className="h-4 w-4" />
                              <span className="sr-only">{translations.actionLabels.editUser}</span>
                            </Button>
                          )}
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">{translations.actionLabels.removeUser}</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 p-4">
              <div className="text-center">
                <h3 className="text-lg font-medium">{translations.noUsers}</h3>
                <p className="text-sm text-gray-500">{translations.noUsersDescription}</p>
              </div>
              <Button className="mt-4" asChild>
                <Link href={`/${locale}/dashboard/institution/users/add`}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {translations.inviteUsers}
                </Link>
              </Button>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              {translations.showing} {users.length} {translations.of} {users.length} {translations.users}
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>
                {translations.previous}
              </Button>
              <Button variant="outline" size="sm" disabled>
                {translations.next}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}