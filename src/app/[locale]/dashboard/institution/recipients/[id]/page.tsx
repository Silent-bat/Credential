import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Eye,
  Mail,
  Download,
  Award,
  Calendar,
  FileText,
  MoreHorizontal,
  Edit,
  AlertCircle,
  UserCog,
  Mail as MailIcon,
  Clock,
  CheckCircle,
  XCircle,
  DownloadCloud,
  User,
} from 'lucide-react';
import Link from 'next/link';

interface Props {
  params: { locale: string; id: string };
}

export default async function RecipientDetailPage({ params: { locale, id } }: Props) {
  const session = await auth();
  
  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }
  
  if (session.user.role !== 'INSTITUTION') {
    redirect(`/${locale}/dashboard`);
  }
  
  // Mock data - would be fetched from an API in production
  const recipient = {
    id,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    status: 'ACTIVE',
    joinedAt: '2023-01-15T10:30:00Z',
    lastActive: '2023-06-22T14:45:00Z',
    totalCertificates: 3,
    avatar: '',
  };

  // Mock certificates data
  const certificates = [
    {
      id: '1',
      title: 'Advanced Web Development',
      issuedAt: '2023-05-15T09:00:00Z',
      expiresAt: '2025-05-15T09:00:00Z',
      status: 'ACTIVE',
    },
    {
      id: '2',
      title: 'Data Science Fundamentals',
      issuedAt: '2023-04-22T10:30:00Z',
      expiresAt: '2025-04-22T10:30:00Z',
      status: 'ACTIVE',
    },
    {
      id: '3',
      title: 'UI/UX Design Principles',
      issuedAt: '2023-03-10T14:15:00Z',
      expiresAt: '2025-03-10T14:15:00Z',
      status: 'ACTIVE',
    },
  ];

  // Mock email history
  const emailHistory = [
    {
      id: '1',
      subject: 'Certificate Issued: Advanced Web Development',
      sentAt: '2023-05-15T09:30:00Z',
      status: 'DELIVERED',
    },
    {
      id: '2',
      subject: 'Certificate Issued: Data Science Fundamentals',
      sentAt: '2023-04-22T11:00:00Z',
      status: 'DELIVERED',
    },
    {
      id: '3',
      subject: 'Account Activation',
      sentAt: '2023-01-15T10:45:00Z',
      status: 'DELIVERED',
    },
  ];

  // Mock activity logs
  const activityLogs = [
    {
      id: '1',
      action: 'Viewed Certificate',
      certificateId: '1',
      certificateTitle: 'Advanced Web Development',
      timestamp: '2023-06-20T14:30:00Z',
      ip: '192.168.1.100',
      userAgent: 'Chrome/Windows',
    },
    {
      id: '2',
      action: 'Downloaded Certificate',
      certificateId: '2',
      certificateTitle: 'Data Science Fundamentals',
      timestamp: '2023-06-15T09:45:00Z',
      ip: '192.168.1.100',
      userAgent: 'Chrome/Windows',
    },
    {
      id: '3',
      action: 'Shared Certificate',
      certificateId: '1',
      certificateTitle: 'Advanced Web Development',
      timestamp: '2023-06-10T16:20:00Z',
      ip: '192.168.1.100',
      userAgent: 'Chrome/Windows',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'INACTIVE':
        return <Badge className="bg-gray-500">Inactive</Badge>;
      case 'DELIVERED':
        return <Badge className="bg-green-500">Delivered</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${locale}/dashboard/institution/recipients`}>
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Recipient Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" /> Send Email
          </Button>
          <Button>
            <Award className="mr-2 h-4 w-4" /> Issue Certificate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Recipient's personal information and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={recipient.avatar} />
                <AvatarFallback className="text-2xl bg-primary text-white">
                  {getInitials(recipient.name)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-xl font-semibold">{recipient.name}</h2>
                <p className="text-gray-500">{getStatusBadge(recipient.status)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{recipient.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Phone:</span>
                <span className="text-sm">{recipient.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Joined:</span>
                <span className="text-sm">{formatDate(recipient.joinedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Last Active:</span>
                <span className="text-sm">{formatDate(recipient.lastActive)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Certificates:</span>
                <span className="text-sm">{recipient.totalCertificates}</span>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/${locale}/dashboard/institution/recipients/${id}/edit`}>
                  <UserCog className="mr-2 h-4 w-4" /> Edit Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <Tabs defaultValue="certificates">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recipient Details</CardTitle>
                <TabsList>
                  <TabsTrigger value="certificates">
                    Certificates
                  </TabsTrigger>
                  <TabsTrigger value="emails">
                    Emails
                  </TabsTrigger>
                  <TabsTrigger value="activity">
                    Activity
                  </TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>
                View recipient certificates, email history, and activity logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TabsContent value="certificates" className="space-y-4">
                {certificates.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Certificate</TableHead>
                          <TableHead>Issue Date</TableHead>
                          <TableHead>Expiry Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {certificates.map((certificate) => (
                          <TableRow key={certificate.id}>
                            <TableCell className="font-medium">
                              {certificate.title}
                            </TableCell>
                            <TableCell>{formatDate(certificate.issuedAt)}</TableCell>
                            <TableCell>{formatDate(certificate.expiresAt)}</TableCell>
                            <TableCell>{getStatusBadge(certificate.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" asChild>
                                  <Link href={`/${locale}/dashboard/institution/certificates/${certificate.id}`}>
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View</span>
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Download className="h-4 w-4" />
                                  <span className="sr-only">Download</span>
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <MailIcon className="h-4 w-4" />
                                  <span className="sr-only">Send</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Award className="h-12 w-12 text-gray-300" />
                    <h3 className="text-lg font-medium">No Certificates</h3>
                    <p className="text-gray-500 text-center max-w-sm">
                      This recipient doesn't have any certificates yet. Issue a certificate to get started.
                    </p>
                    <Button>
                      <Award className="mr-2 h-4 w-4" /> Issue Certificate
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="emails" className="space-y-4">
                {emailHistory.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Sent Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {emailHistory.map((email) => (
                          <TableRow key={email.id}>
                            <TableCell className="font-medium">
                              {email.subject}
                            </TableCell>
                            <TableCell>{formatDateTime(email.sentAt)}</TableCell>
                            <TableCell>{getStatusBadge(email.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Mail className="mr-2 h-4 w-4" />
                                Resend
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Mail className="h-12 w-12 text-gray-300" />
                    <h3 className="text-lg font-medium">No Email History</h3>
                    <p className="text-gray-500 text-center max-w-sm">
                      No emails have been sent to this recipient yet.
                    </p>
                    <Button>
                      <Mail className="mr-2 h-4 w-4" /> Send Email
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                {activityLogs.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Action</TableHead>
                          <TableHead>Certificate</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>IP Address</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activityLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">
                              {log.action}
                            </TableCell>
                            <TableCell>{log.certificateTitle}</TableCell>
                            <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                            <TableCell>{log.ip}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Clock className="h-12 w-12 text-gray-300" />
                    <h3 className="text-lg font-medium">No Activity</h3>
                    <p className="text-gray-500 text-center max-w-sm">
                      This recipient hasn't performed any actions yet.
                    </p>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
} 