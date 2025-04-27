'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Award, FileCheck, Shield, Clock, Share2 } from 'lucide-react';

// Define types for certificate data
type Certificate = {
  id: number;
  name: string;
  issuedAt: string;
  expiresAt?: string | null;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  verificationId: string;
};

type CertificatesResponse = {
  certificates: Certificate[];
};

export default function UserDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const t = useTranslations('dashboard');
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
          setCertificates(data.certificates || []);
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
  
  // Format date to a readable format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'; // Handle null or undefined
    try {
      const date = new Date(dateString);
      // Check if date is valid before formatting
      if (isNaN(date.getTime())) return '-';
      return new Intl.DateTimeFormat(locale, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };
  
  const activeCertificates = certificates.filter(cert => cert.status === 'ACTIVE');
  const expiredCertificates = certificates.filter(cert => cert.status === 'EXPIRED' || cert.status === 'REVOKED');
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">{t('userDashboard')}</h1>
      
      {/* User Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('totalCertificates')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{certificates.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('activeCertificates')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {certificates.filter(cert => cert.status === 'ACTIVE').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('expiringSoon')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('quickActions')}</h2>
        <div className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href={`/${locale}/verify`}>
              <Shield className="mr-2 h-4 w-4" />
              {t('verifyCertificate')}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/${locale}/dashboard/profile`}>
              <FileCheck className="mr-2 h-4 w-4" />
              {t('viewProfile')}
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Certificates Tabs */}
      <h2 className="text-xl font-semibold mb-4">{t('myCertificates')}</h2>
      <Tabs defaultValue="active" className="mb-8">
          <TabsList>
            <TabsTrigger value="active">{t('active')}</TabsTrigger>
            <TabsTrigger value="expired">{t('expired')}</TabsTrigger>
          </TabsList>
          
        <TabsContent value="active">
          <div className="text-sm text-gray-500 mb-4">{t('activeTabDescription')}</div>
          
          {activeCertificates.length === 0 ? (
            <div className="text-center p-8 border rounded-lg">
              <p className="text-gray-500">{t('noCertificatesFound')}</p>
                  </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCertificates.map((cert) => (
                <Card key={cert.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                      <CardTitle className="text-lg truncate">{cert.name}</CardTitle>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {cert.status}
                        </Badge>
                      </div>
                    <CardDescription>
                      {t('issuedOn')}: {formatDate(cert.issuedAt)}
                    </CardDescription>
                    </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center text-sm">
                      <Award className="h-4 w-4 mr-1 text-blue-500" />
                      <span>ID: {cert.id}</span>
                      </div>
                    </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/${locale}/certificate/${cert.verificationId}`}>
                        <FileCheck className="h-4 w-4 mr-1" /> {t('view')}
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4 mr-1" /> {t('share')}
                    </Button>
                  </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
        <TabsContent value="expired">
          <div className="text-sm text-gray-500 mb-4">{t('expiredTabDescription')}</div>
          
          {expiredCertificates.length === 0 ? (
            <div className="text-center p-8 border rounded-lg">
              <p className="text-gray-500">{t('noCertificatesFound')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {expiredCertificates.map((cert) => (
                <Card key={cert.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg truncate">{cert.name}</CardTitle>
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {cert.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {t('issuedOn')}: {formatDate(cert.issuedAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-1 text-red-500" />
                      <span>
                        {cert.expiresAt ? `Expired: ${formatDate(cert.expiresAt)}` : 'Revoked'}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/${locale}/certificate/${cert.verificationId}`}>
                        <FileCheck className="h-4 w-4 mr-1" /> {t('view')}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          </TabsContent>
        </Tabs>
    </div>
  );
} 