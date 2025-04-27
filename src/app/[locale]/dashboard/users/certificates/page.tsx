'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

// Define Certificate interface based on the schema
interface Certificate {
  id: string;
  title: string;
  recipientName: string;
  recipientEmail: string;
  issueDate: string;
  expiryDate?: string;
  pdfUrl?: string;
  status: string;
  institution: {
    id: string;
    name: string;
  };
}

// Define response type to improve type safety
interface CertificatesResponse {
  certificates: Certificate[];
}

export default function UserCertificates() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const t = useTranslations('certificates');
  const locale = useLocale();
  
  // Certificates state with proper typing
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/auth/login`);
      return;
    }

    // Fetch user certificates when component mounts
    const fetchCertificates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user/certificates');
        
        if (response.ok) {
          const data = await response.json() as CertificatesResponse;
          // Set certificates with proper typing
          setCertificates(data.certificates || []);
        } else {
          console.error('Error response from API:', response.status);
        }
      } catch (error) {
        console.error('Error fetching certificates:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (session) {
      fetchCertificates();
    }
  }, [session, status, router, locale]);
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Helper function to safely render certificate content
  const renderCertificates = () => {
    if (certificates.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">{t('noCertificatesFound')}</p>
              <Button asChild>
                <Link href={`/${locale}/verify`}>{t('verifyCertificate')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <Card key={cert.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{cert.title}</CardTitle>
                <Badge variant={cert.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {cert.status}
                </Badge>
              </div>
              <CardDescription>{cert.institution.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <span className="font-medium">{t('recipientName')}:</span> {cert.recipientName}
                </p>
                <p className="text-sm">
                  <span className="font-medium">{t('issueDate')}:</span> {new Date(cert.issueDate).toLocaleDateString(locale)}
                </p>
                {cert.expiryDate && (
                  <p className="text-sm">
                    <span className="font-medium">{t('expiryDate')}:</span> {new Date(cert.expiryDate).toLocaleDateString(locale)}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" asChild>
                  <Link href={`/${locale}/certificate/${cert.id}`}>{t('view')}</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/${locale}/certificate/${cert.id}/share`}>{t('shareCertificate')}</Link>
                </Button>
                {cert.pdfUrl && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer">{t('downloadCertificate')}</a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <Button asChild>
          <Link href={`/${locale}/verify`}>{t('verifyCertificate')}</Link>
        </Button>
      </div>
      
      {renderCertificates()}
    </div>
  );
} 