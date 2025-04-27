import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CertificateCreateClient from "@/components/institution/CertificateCreateClient";
import { getTranslations } from 'next-intl/server';

type Props = {
  params: { locale: string }
};

export default async function CreateCertificatePage({ params }: Props) {
  // Properly await params to fix the NextJS warning
  const resolvedParams = await Promise.resolve(params);
  const { locale } = resolvedParams;
  
  try {
    // First try common translations that we need
    const commonT = await getTranslations({ locale, namespace: 'common' });
    
    // Create translations object with defaults to start
    const translations = {
      createNewCertificate: "Create New Certificate",
      certificateTitle: "Certificate Title",
      certificateTitlePlaceholder: "e.g., Bachelor of Science in Computer Science",
      recipientName: "Recipient Name",
      recipientNamePlaceholder: "Recipient full name",
      recipientEmail: "Recipient Email",
      recipientEmailPlaceholder: "email@example.com",
      description: "Description",
      descriptionPlaceholder: "Details about the certification and achievements",
      designCertificate: "Design Certificate",
      designNewCertificate: "Design New Certificate",
      designNewCertificateDescription: "Create a custom certificate design with our template builder",
      certificateInformation: "Certificate Information",
      designOptions: "Design Options",
      issueDate: "Issue Date",
      expiryDate: "Expiry Date",
      back: commonT('buttons.back'),
      cancel: commonT('buttons.cancel'),
      save: commonT('buttons.save'),
      createCertificate: "Create Certificate",
      uploadCertificate: "Upload Certificate"
    };
    
    // Try to load certificates translations from various namespaces
    try {
      const certificatesT = await getTranslations({ locale, namespace: 'certificates' });
      
      // Update translations with lowercase namespace values
      if (certificatesT) {
        try { translations.createNewCertificate = certificatesT('createNewCertificate') || translations.createNewCertificate; } catch (e) {}
        try { translations.certificateTitle = certificatesT('certificateTitle') || translations.certificateTitle; } catch (e) {}
        try { translations.certificateTitlePlaceholder = certificatesT('certificateTitlePlaceholder') || translations.certificateTitlePlaceholder; } catch (e) {}
        try { translations.recipientName = certificatesT('recipientName') || translations.recipientName; } catch (e) {}
        try { translations.recipientNamePlaceholder = certificatesT('recipientNamePlaceholder') || translations.recipientNamePlaceholder; } catch (e) {}
        try { translations.recipientEmail = certificatesT('recipientEmail') || translations.recipientEmail; } catch (e) {}
        try { translations.recipientEmailPlaceholder = certificatesT('recipientEmailPlaceholder') || translations.recipientEmailPlaceholder; } catch (e) {}
        try { translations.description = certificatesT('description') || translations.description; } catch (e) {}
        try { translations.descriptionPlaceholder = certificatesT('descriptionPlaceholder') || translations.descriptionPlaceholder; } catch (e) {}
        try { translations.designCertificate = certificatesT('designCertificate') || translations.designCertificate; } catch (e) {}
        try { translations.designNewCertificate = certificatesT('designNewCertificate') || translations.designNewCertificate; } catch (e) {}
        try { translations.designNewCertificateDescription = certificatesT('designNewCertificateDescription') || translations.designNewCertificateDescription; } catch (e) {}
        try { translations.certificateInformation = certificatesT('certificateInformation') || translations.certificateInformation; } catch (e) {}
        try { translations.designOptions = certificatesT('designOptions') || translations.designOptions; } catch (e) {}
        try { translations.issueDate = certificatesT('issueDate') || translations.issueDate; } catch (e) {}
        try { translations.expiryDate = certificatesT('expiryDate') || translations.expiryDate; } catch (e) {}
        try { translations.createCertificate = certificatesT('createCertificate') || translations.createCertificate; } catch (e) {}
        try { translations.uploadCertificate = certificatesT('uploadCertificate') || translations.uploadCertificate; } catch (e) {}
      }
    } catch (error) {
      console.warn('Could not load lowercase certificates namespace:', error);
    }
    
    // Try to load uppercase Certificates namespace as well
    try {
      const upperCertificatesT = await getTranslations({ locale, namespace: 'Certificates' });
      
      // Update translations with uppercase namespace values
      if (upperCertificatesT) {
        try { translations.createNewCertificate = upperCertificatesT('createNewCertificate') || translations.createNewCertificate; } catch (e) {}
        try { translations.certificateTitle = upperCertificatesT('certificateTitle') || translations.certificateTitle; } catch (e) {}
        try { translations.certificateTitlePlaceholder = upperCertificatesT('certificateTitlePlaceholder') || translations.certificateTitlePlaceholder; } catch (e) {}
        try { translations.recipientName = upperCertificatesT('recipientName') || translations.recipientName; } catch (e) {}
        try { translations.recipientNamePlaceholder = upperCertificatesT('recipientNamePlaceholder') || translations.recipientNamePlaceholder; } catch (e) {}
        try { translations.recipientEmail = upperCertificatesT('recipientEmail') || translations.recipientEmail; } catch (e) {}
        try { translations.recipientEmailPlaceholder = upperCertificatesT('recipientEmailPlaceholder') || translations.recipientEmailPlaceholder; } catch (e) {}
        try { translations.description = upperCertificatesT('description') || translations.description; } catch (e) {}
        try { translations.descriptionPlaceholder = upperCertificatesT('descriptionPlaceholder') || translations.descriptionPlaceholder; } catch (e) {}
        try { translations.designCertificate = upperCertificatesT('designCertificate') || translations.designCertificate; } catch (e) {}
        try { translations.designNewCertificate = upperCertificatesT('designNewCertificate') || translations.designNewCertificate; } catch (e) {}
        try { translations.designNewCertificateDescription = upperCertificatesT('designNewCertificateDescription') || translations.designNewCertificateDescription; } catch (e) {}
        try { translations.certificateInformation = upperCertificatesT('certificateInformation') || translations.certificateInformation; } catch (e) {}
        try { translations.designOptions = upperCertificatesT('designOptions') || translations.designOptions; } catch (e) {}
        try { translations.issueDate = upperCertificatesT('issueDate') || translations.issueDate; } catch (e) {}
        try { translations.expiryDate = upperCertificatesT('expiryDate') || translations.expiryDate; } catch (e) {}
        try { translations.createCertificate = upperCertificatesT('createCertificate') || translations.createCertificate; } catch (e) {}
        try { translations.uploadCertificate = upperCertificatesT('uploadCertificate') || translations.uploadCertificate; } catch (e) {}
      }
    } catch (error) {
      console.warn('Could not load uppercase Certificates namespace:', error);
    }
    
    // Check auth
    const session = await auth();
    const user = session?.user;
    
    if (!user) {
      return redirect(`/${locale}/auth/login`);
    }
    
    // Check for institution role (case-insensitive check for any role containing 'institution')
    const isInstitutionAdmin = user.role?.toUpperCase()?.includes('INSTITUTION');
    
    if (!isInstitutionAdmin) {
      return redirect(`/${locale}/dashboard`);
    }
    
    // Create a compatible user object for the form
    const formUser = {
      id: user.id,
      name: user.name || undefined,
      email: user.email || undefined,
      role: user.role || undefined
    };
    
    return (
      <CertificateCreateClient user={formUser} locale={locale} translations={translations} />
    );
  } catch (error) {
    console.error("Error in certificate creation page:", error);
    
    // Fallback to english translations if there's a problem
    const fallbackTranslations = {
      createNewCertificate: "Create New Certificate",
      certificateTitle: "Certificate Title",
      certificateTitlePlaceholder: "e.g., Bachelor of Science in Computer Science",
      recipientName: "Recipient Name",
      recipientNamePlaceholder: "Recipient full name",
      recipientEmail: "Recipient Email",
      recipientEmailPlaceholder: "email@example.com",
      description: "Description",
      descriptionPlaceholder: "Details about the certification and achievements",
      designCertificate: "Design Certificate",
      designNewCertificate: "Design New Certificate",
      designNewCertificateDescription: "Create a custom certificate design with our template builder",
      certificateInformation: "Certificate Information",
      designOptions: "Design Options",
      issueDate: "Issue Date",
      expiryDate: "Expiry Date",
      back: "Back",
      cancel: "Cancel",
      save: "Save",
      createCertificate: "Create Certificate",
      uploadCertificate: "Upload Certificate"
    };
    
    const session = await auth();
    const user = session?.user;
    
    if (!user) {
      return redirect(`/${locale}/auth/login`);
    }
    
    if (!user.role?.toUpperCase()?.includes('INSTITUTION')) {
      return redirect(`/${locale}/dashboard`);
    }
    
    const formUser = {
      id: user.id,
      name: user.name || undefined,
      email: user.email || undefined,
      role: user.role || undefined
    };
    
    return (
      <CertificateCreateClient user={formUser} locale={locale} translations={fallbackTranslations} />
    );
  }
} 