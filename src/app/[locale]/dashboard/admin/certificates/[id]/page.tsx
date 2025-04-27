import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ArrowLeft, Download, Edit, Share, Trash, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

type Props = {
  params: { 
    locale: string;
    id: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Properly await the params
  params = await Promise.resolve(params);
  
  // Fetch certificate data
  const certificate = await prisma.certificate.findUnique({
    where: { id: params.id },
    select: { title: true },
  });

  return {
    title: certificate ? `${certificate.title} | Certificate` : "Certificate Details",
  };
}

export default async function CertificateDetailPage({ params }: Props) {
  // Properly await the params
  params = await Promise.resolve(params);
  
  const currentLocale = String(params.locale || 'en');
  const certificateId = params.id;
  const session = await auth();

  // Check if user is logged in
  if (!session?.user) {
    redirect(`/${currentLocale}/login?callbackUrl=/${currentLocale}/dashboard/admin/certificates/${certificateId}`);
  }

  // Check if user has permission (admin or institution admin)
  if (!["ADMIN", "INSTITUTION"].includes(session.user.role)) {
    redirect(`/${currentLocale}/dashboard`);
  }

  // Fetch certificate with institution data
  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: {
      institution: {
        select: { id: true, name: true, logo: true },
      },
    },
  });

  // Check if certificate exists
  if (!certificate) {
    redirect(`/${currentLocale}/dashboard/admin/certificates`);
  }
  
  // If user is an institution admin, check if they have access to this certificate
  if (session.user.role === "INSTITUTION") {
    const hasAccess = await prisma.institutionUser.findFirst({
      where: {
        userId: session.user.id,
        institutionId: certificate.institutionId,
      },
    });
    
    if (!hasAccess) {
      redirect(`/${currentLocale}/dashboard/admin/certificates`);
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Link href={`/${currentLocale}/dashboard/admin/certificates`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{certificate.title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/${currentLocale}/dashboard/admin/certificates/${certificateId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          
          <Button variant="outline">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardContent className="pt-6 flex justify-center">
              {certificate.fileUrl && (
                <div className="relative border rounded-lg overflow-hidden" style={{ width: '100%', maxWidth: '800px', height: 'auto', minHeight: '500px' }}>
                  <Image
                    src={certificate.fileUrl}
                    alt={certificate.title}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              
              {!certificate.fileUrl && (
                <div className="border rounded-lg flex items-center justify-center" style={{ width: '100%', maxWidth: '800px', height: '500px' }}>
                  <p className="text-gray-500">Certificate image not available</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Certificate Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Certificate ID</p>
                      <p className="font-medium">{certificate.id}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Verification ID</p>
                      <p className="font-medium">{certificate.verificationId || "Not available"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Recipient</p>
                      <p className="font-medium">{certificate.recipientName}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Recipient Email</p>
                      <p className="font-medium">{certificate.recipientEmail}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Issue Date</p>
                      <p className="font-medium">{formatDate(certificate.issueDate)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Expiry Date</p>
                      <p className="font-medium">{certificate.expiryDate ? formatDate(certificate.expiryDate) : "Never"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Institution</p>
                      <p className="font-medium">{certificate.institution.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">{certificate.status}</p>
                    </div>
                  </div>
                  
                  {certificate.description && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="font-medium">{certificate.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="verification">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center mb-4">
                      {certificate.verificationId ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <p className="font-medium">
                        {certificate.verificationId 
                          ? "This certificate can be verified using the verification ID" 
                          : "This certificate doesn't have a verification ID"}
                      </p>
                    </div>
                    
                    {certificate.verificationId && (
                      <div className="bg-gray-50 p-4 rounded">
                        <p className="text-sm text-gray-500 mb-1">Verification URL</p>
                        <p className="font-mono text-sm break-all">
                          {`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/verify/${certificate.verificationId}`}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="blockchain">
              <Card>
                <CardHeader>
                  <CardTitle>Blockchain Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center mb-4">
                      {certificate.blockchainTxId ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <p className="font-medium">
                        {certificate.blockchainTxId 
                          ? "This certificate is stored on the blockchain" 
                          : "This certificate is not stored on the blockchain"}
                      </p>
                    </div>
                    
                    {certificate.blockchainTxId && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded">
                          <p className="text-sm text-gray-500 mb-1">Blockchain Network</p>
                          <p className="font-medium">{certificate.blockchainNetwork || "IOTA"}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded">
                          <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                          <p className="font-mono text-sm break-all">{certificate.blockchainTxId}</p>
                        </div>
                        
                        {certificate.blockchainHash && (
                          <div className="bg-gray-50 p-4 rounded">
                            <p className="text-sm text-gray-500 mb-1">Document Hash</p>
                            <p className="font-mono text-sm break-all">{certificate.blockchainHash}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Certificate History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">No history available for this certificate.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" asChild>
                <Link href={`/${currentLocale}/verify/${certificate.verificationId}`} target="_blank">
                  Verify Certificate
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Certificate
              </Button>
              
              <Button variant="outline" className="w-full">
                <Share className="h-4 w-4 mr-2" />
                Share Certificate
              </Button>
              
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/${currentLocale}/dashboard/admin/certificates/${certificateId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Certificate
                </Link>
              </Button>
              
              <Button variant="destructive" className="w-full">
                <Trash className="h-4 w-4 mr-2" />
                Delete Certificate
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 