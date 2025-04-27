"use client";

import React, { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import CertificateDesigner from './CertificateDesigner';
import CertificateForm from './form';
import { AlertCircle, InfoIcon, CheckCircle2, UploadCloud, Palette, Settings, Save } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Type for translations
type Translations = {
  createNewCertificate: string;
  back: string;
  uploadCertificate: string;
  designCertificate: string;
  certificateDetails: string;
  uploadExistingCertificate: string;
  uploadExistingCertificateDescription: string;
  designNewCertificate: string;
  designCertificateDescription: string;
  enterCertificateDetails: string;
  loading: string;
};

// Type for component props
interface CertificateCreateClientProps {
  locale: string;
  institutions: { id: string; name: string }[];
  selectedInstitutionId?: string;
  translations: Translations;
  userRole: string;
}

export default function CertificateCreateClient({
  locale,
  institutions,
  selectedInstitutionId,
  translations: t,
  userRole
}: CertificateCreateClientProps) {
  const [designData, setDesignData] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [savedTemplates, setSavedTemplates] = useState<Array<{id: string, name: string, designData: string}>>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isAdmin = userRole === "ADMIN";
  
  // Handle design completion
  const handleDesignComplete = useCallback((data: string) => {
    setDesignData(data);
    setActiveTab("form");
    // Clear any previous messages
    setSuccessMessage(null);
    setErrorMessage(null);
  }, []);

  // Save template for future use (admin only feature)
  const handleSaveTemplate = useCallback((designData: string, templateName: string) => {
    try {
      // Generate a unique ID
      const templateId = `template-${Date.now()}`;
      const newTemplate = { id: templateId, name: templateName, designData };
      
      // In production, this would save to the database
      setSavedTemplates(prev => [...prev, newTemplate]);
      
      // Show success message
      setSuccessMessage(`Template "${templateName}" saved successfully`);
      
      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error saving template:', error);
      setErrorMessage('Failed to save template. Please try again.');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  }, []);

  // Handle form submission error
  const handleFormError = useCallback((message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  }, []);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">{t.createNewCertificate}</h1>
          {isAdmin && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded-md text-xs font-semibold">
                    Admin
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>You have advanced template management permissions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <Link href={`/${locale}/dashboard/admin/certificates`}>
          <Button variant="outline">
            {t.back}
          </Button>
        </Link>
      </div>
      
      {/* Status messages */}
      {successMessage && (
        <Alert className="mb-4 bg-green-50 border-green-500">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
        </Alert>
      )}
      
      {errorMessage && (
        <Alert className="mb-4 bg-red-50 border-red-500">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Error</AlertTitle>
          <AlertDescription className="text-red-700">{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upload" className="flex items-center gap-1">
            <UploadCloud className="h-4 w-4" />
            {t.uploadCertificate}
          </TabsTrigger>
          <TabsTrigger value="design" className="flex items-center gap-1">
            <Palette className="h-4 w-4" />
            {t.designCertificate}
          </TabsTrigger>
          {designData && (
            <TabsTrigger value="form" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              {t.certificateDetails}
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>{t.uploadExistingCertificate}</CardTitle>
              <CardDescription>
                {t.uploadExistingCertificateDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CertificateForm 
                institutions={institutions}
                locale={locale}
                certificateType="uploaded"
                preselectedInstitutionId={selectedInstitutionId}
                onError={handleFormError}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="design">
          <Card>
            <CardHeader>
              <CardTitle>{t.designNewCertificate}</CardTitle>
              <CardDescription>
                {t.designCertificateDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CertificateDesigner 
                onComplete={handleDesignComplete}
                onSaveTemplate={isAdmin ? handleSaveTemplate : undefined}
                savedTemplates={savedTemplates}
              />
            </CardContent>
            {isAdmin && (
              <CardFooter className="bg-blue-50 border-t border-blue-200 flex justify-between">
                <div className="flex items-center gap-2">
                  <InfoIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-700">As an administrator, you can save and manage certificate templates</span>
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        {designData && (
          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>{t.certificateDetails}</CardTitle>
                <CardDescription>
                  {t.enterCertificateDetails}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CertificateForm
                  institutions={institutions}
                  locale={locale}
                  certificateType="designed"
                  designData={designData}
                  preselectedInstitutionId={selectedInstitutionId}
                  onError={handleFormError}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
} 