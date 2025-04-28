import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import CertificateCreateClient from './client';

type Props = {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function CreateCertificatePage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: Props) {
  // Properly await the parameters
  const params = await Promise.resolve(paramsPromise);
  const searchParams = await Promise.resolve(searchParamsPromise);
  
  // Get the locale
  const currentLocale = params.locale as string;
  const t = await getTranslations({ locale: currentLocale, namespace: 'Certificates' });
  
  // Get the session
  const session = await auth();

  // Check if user is logged in
  if (!session?.user) {
    redirect(`/${currentLocale}/login?callbackUrl=/${currentLocale}/dashboard/admin/certificates/create`);
  }

  // Check if user has permission (admin or institution admin)
  if (!["ADMIN", "INSTITUTION"].includes(session.user.role)) {
    redirect(`/${currentLocale}/dashboard`);
  }

  // Fetch institutions based on user role
  let institutions = [];
  try {
    if (session.user.role === "ADMIN") {
      // Admin can see all approved institutions
      institutions = await prisma.institution.findMany({
        where: { isApproved: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
      });
    } else {
      // Institution admin can only see their own institutions
      const userInstitutions = await prisma.institutionUser.findMany({
        where: { 
          userId: session.user.id,
          role: "ADMIN"
        },
        include: {
          Institution: {
            select: { id: true, name: true, isApproved: true }
          }
        }
      });
      
      institutions = userInstitutions
        .filter(ui => ui.Institution.isApproved)
        .map(ui => ({ id: ui.Institution.id, name: ui.Institution.name }));
    }
  } catch (error) {
    console.error("Error fetching institutions:", error);
  }

  // Get selected institution from query params (properly awaited)
  const selectedInstitutionId = typeof searchParams.institution === 'string' 
    ? searchParams.institution 
    : undefined;

  // Use a try/catch to handle potential missing translations
  const translations = {
    createNewCertificate: t('createNewCertificate'),
    back: t('back'),
    uploadCertificate: t('uploadCertificate'),
    designCertificate: t('designCertificate'),
    certificateDetails: t('certificateDetails', { fallback: 'Certificate Details' }),
    uploadExistingCertificate: t('uploadExistingCertificate'),
    uploadExistingCertificateDescription: t('uploadExistingCertificateDescription'),
    designNewCertificate: t('designNewCertificate'),
    designCertificateDescription: t('designCertificateDescription', { fallback: 'Create a custom certificate design with our template builder' }),
    enterCertificateDetails: t('enterCertificateDetails', { fallback: 'Enter the details for your designed certificate' }),
    loading: t('loading', { fallback: 'Loading...' })
  };

  return (
    <CertificateCreateClient
      locale={currentLocale}
                institutions={institutions} 
      selectedInstitutionId={selectedInstitutionId}
      translations={translations}
      userRole={session.user.role}
              />
  );
}

export const dynamic = 'force-dynamic' 