import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  FileText,
  Share2,
  UserCheck,
  Calendar,
  Mail,
  Clock,
  AlertTriangle,
  QrCode,
  History,
  Link as LinkIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import QRCode from 'react-qr-code';
import Link from 'next/link';

interface Props {
  params: { locale: string; id: string };
}

export default async function CertificateDetailPage({ params: { locale, id } }: Props) {
  const session = await auth();
  
  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }
  
  if (session.user.role !== 'INSTITUTION') {
    redirect(`/${locale}/dashboard`);
  }
  
  // Mock certificate data - in production, fetch from API based on ID
  const certificate = {
    id,
    title: 'Bachelor of Computer Science',
    recipientName: 'John Doe',
    recipientEmail: 'john.doe@example.com',
    issueDate: '2023-05-15',
    expiryDate: '2026-05-15',
    description: 'This certificate confirms that John Doe has successfully completed the Bachelor of Computer Science program at Tech University with distinction.',
    status: 'ISSUED',
    issuerName: 'Tech University',
    issuerLogo: '/placeholder.svg',
    certificateType: 'Degree',
    verificationUrl: `https://credentials.example.com/verify/${id}`,
    verifications: [
      { id: '1', date: '2023-06-10', verifier: 'Acme Corp HR', success: true },
      { id: '2', date: '2023-07-22', verifier: 'Global Tech', success: true },
      { id: '3', date: '2023-08-15', verifier: 'Unknown Source', success: false },
    ],
    activities: [
      { id: '1', date: '2023-05-15', action: 'Certificate issued', actor: 'Admin User' },
      { id: '2', date: '2023-06-10', action: 'Certificate viewed', actor: 'Acme Corp HR' },
      { id: '3', date: '2023-07-22', action: 'Certificate verified', actor: 'Global Tech' },
      { id: '4', date: '2023-08-15', action: 'Verification attempt failed', actor: 'Unknown Source' },
    ],
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ISSUED':
        return <Badge className="bg-green-500">Issued</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'REVOKED':
        return <Badge className="bg-red-500">Revoked</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{certificate.title}</h1>
          <div className="flex items-center gap-2">
            <p className="text-gray-500">Certificate ID: {certificate.id}</p>
            {getStatusBadge(certificate.status)}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          {certificate.status === 'ISSUED' ? (
            <Button variant="destructive">
              <AlertTriangle className="mr-2 h-4 w-4" /> Revoke
            </Button>
          ) : (
            <Button variant="default">
              <FileText className="mr-2 h-4 w-4" /> Re-issue
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Title</h3>
                    <p>{certificate.title}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Recipient</h3>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-gray-400" />
                      <p>{certificate.recipientName}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p>{certificate.recipientEmail}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Certificate Type</h3>
                    <p>{certificate.certificateType}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Issued Date</h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p>{format(new Date(certificate.issueDate), 'PPP')}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Expiry Date</h3>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <p>{certificate.expiryDate ? format(new Date(certificate.expiryDate), 'PPP') : 'No expiry'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Issuer</h3>
                    <p>{certificate.issuerName}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <p className="text-sm">{certificate.description}</p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="activity">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
              <TabsTrigger value="verifications">Verification History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>
                    Track all actions related to this certificate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {certificate.activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <History className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.action}</p>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>{activity.actor}</span>
                            <span>{format(new Date(activity.date), 'PPP')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="verifications" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Verification History</CardTitle>
                  <CardDescription>
                    See who has verified this certificate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {certificate.verifications.map((verification) => (
                      <div key={verification.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                        <div className={`p-2 rounded-full ${verification.success ? 'bg-green-100' : 'bg-red-100'}`}>
                          {verification.success ? (
                            <UserCheck className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {verification.success ? 'Successful Verification' : 'Failed Verification'}
                          </p>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>{verification.verifier}</span>
                            <span>{format(new Date(verification.date), 'PPP')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-white p-3 rounded-md mb-4">
                <QRCode value={certificate.verificationUrl} size={180} />
              </div>
              <p className="text-sm text-center text-gray-500 mb-4">
                Scan this QR code to verify the certificate
              </p>
              <div className="w-full space-y-2">
                <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                  <QrCode className="h-4 w-4 text-gray-500" />
                  <span className="text-sm truncate flex-1">{certificate.verificationUrl}</span>
                </div>
                <Button className="w-full flex items-center gap-2" variant="outline" size="sm">
                  <LinkIcon className="h-4 w-4" />
                  Copy verification link
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
              <Link href={`/${locale}/dashboard/institution/certificates/${id}/edit`}>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" /> Edit Certificate
                </Button>
              </Link>
              <Button className="w-full justify-start" variant="outline">
                <Mail className="mr-2 h-4 w-4" /> Resend to Recipient
              </Button>
              {certificate.status === 'ISSUED' ? (
                <Button className="w-full justify-start" variant="destructive">
                  <AlertTriangle className="mr-2 h-4 w-4" /> Revoke Certificate
                </Button>
              ) : (
                <Button className="w-full justify-start" variant="default">
                  <FileText className="mr-2 h-4 w-4" /> Re-issue Certificate
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 