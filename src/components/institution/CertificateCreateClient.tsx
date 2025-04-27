'use client';

import { useState } from "react";
import CertificateCreateForm from "@/components/institution/CertificateCreateForm";
import CertificateDesigner from "@/components/institution/CertificateDesigner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Palette } from "lucide-react";
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface FormUser {
  id: string;
  name?: string | undefined;
  email?: string | undefined;
  role?: string | undefined;
}

interface CertificateCreateClientProps {
  user: FormUser;
  locale: string;
  translations: any;
}

export default function CertificateCreateClient({ user, locale, translations }: CertificateCreateClientProps) {
  const [templateData, setTemplateData] = useState(null);

  // Handle saving template data from designer
  const handleSaveTemplate = async (template: any) => {
    setTemplateData(template);
    
    try {
      // First save to localStorage
      const savedTemplates = localStorage.getItem('certificate_templates');
      let templates = savedTemplates ? JSON.parse(savedTemplates) : [];
      
      // Check if template with this ID already exists
      const existingIndex = templates.findIndex((t: any) => t.id === template.id);
      
      if (existingIndex >= 0) {
        // Update existing template
        templates[existingIndex] = template;
      } else {
        // Add new template
        templates.push(template);
      }
      
      // Save back to localStorage
      localStorage.setItem('certificate_templates', JSON.stringify(templates));
      
      // Save to database
      const response = await axios.post('/api/institution/certificate-templates', {
        templateData: template,
        institutionId: user?.institutionId
      });
      
      if (response.status === 200 || response.status === 201) {
        toast.success('Certificate template saved successfully!');
      } else {
        toast.error('Failed to save template to database, but saved locally.');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Error saving template to database, but saved locally.');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{translations.createNewCertificate}</h1>
        <p className="text-gray-600 mb-6">
          {translations.designNewCertificateDescription}
        </p>
        
        <Alert className="mb-8">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>{translations.designCertificate}</AlertTitle>
          <AlertDescription>
            {translations.designNewCertificateDescription}
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="form" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="form">
              {translations.certificateInformation}
            </TabsTrigger>
            <TabsTrigger value="designer">
              <Palette className="mr-2 h-4 w-4" />
              {translations.designCertificate}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <CertificateCreateForm user={user} locale={locale} translations={translations} />
          </TabsContent>
          
          <TabsContent value="designer">
            <CertificateDesigner onSave={handleSaveTemplate} translations={translations} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 