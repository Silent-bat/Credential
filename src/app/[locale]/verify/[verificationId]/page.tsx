'use client';

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, ChevronLeft } from "lucide-react";

export default function VerificationPage() {
  const params = useParams();
  const verificationId = params?.verificationId as string;
  const t = useTranslations('Verification');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<any>(null);

  useEffect(() => {
    if (!verificationId) {
      setError(t('noIdError'));
      setIsLoading(false);
      return;
    }

    const verifyCertificate = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/verify/certificate/${verificationId}`);
        setCertificate(response.data.certificate);
      } catch (error: any) {
        setError(error.response?.data?.message || t('verificationError'));
        toast.error(error.response?.data?.message || t('verificationError'));
      } finally {
        setIsLoading(false);
      }
    };

    verifyCertificate();
  }, [verificationId, t]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('verifying')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-500" />
              </div>
              <CardTitle className="mt-4 text-lg font-medium text-red-800 dark:text-red-400">
                {t('verificationFailed')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-500 dark:text-gray-400">{error}</p>
              <div className="mt-6">
                <Link href="/verify">
                  <Button>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {t('tryAnother')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                <AlertTriangle className="h-10 w-10 text-yellow-600 dark:text-yellow-500" />
              </div>
              <CardTitle className="mt-4 text-lg font-medium text-yellow-800 dark:text-yellow-400">
                {t('certificateNotFound')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-500 dark:text-gray-400">{t('certificateNotFoundDesc')}</p>
              <div className="mt-6">
                <Link href="/verify">
                  <Button>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {t('tryAnother')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="text-center pb-0">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <Check className="h-10 w-10 text-green-600 dark:text-green-500" />
            </div>
            <CardTitle className="mt-4 text-2xl font-bold">{t('certificateVerified')}</CardTitle>
            <div className="mt-2 flex justify-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                {t('authentic')}
              </span>
              {certificate.blockchainVerified && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {t('blockchainVerified')}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <div className="py-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('certificateDetails')}</h3>
                <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('certificateTitle')}</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{certificate.title}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('issuedTo')}</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{certificate.recipientName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('issuedBy')}</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{certificate.issuer}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('issueDate')}</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {new Date(certificate.issueDate).toLocaleDateString()}
                    </dd>
                  </div>
                  {certificate.expiryDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('expiryDate')}</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {new Date(certificate.expiryDate).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('certificateId')}</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{certificate.id}</dd>
                  </div>
                </div>
              </div>

              {certificate.description && (
                <div className="py-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('description')}</h3>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <p>{certificate.description}</p>
                  </div>
                </div>
              )}

              {certificate.metadata && Object.keys(certificate.metadata).length > 0 && (
                <div className="py-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('additionalInfo')}</h3>
                  <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    {Object.entries(certificate.metadata).map(([key, value]: [string, any]) => (
                      <div key={key}>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{key}</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                          {typeof value === 'string' ? value : JSON.stringify(value)}
                        </dd>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <Link href="/verify">
                <Button variant="outline">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t('verifyAnother')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 