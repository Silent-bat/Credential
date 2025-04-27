'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, CheckCircle, Search, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VerificationUIProps {
  locale: string;
}

export default function VerificationUI({ locale }: VerificationUIProps) {
  const t = useTranslations('verification');
  const router = useRouter();
  
  const [verificationId, setVerificationId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fileSelected, setFileSelected] = useState(false);
  
  const handleVerifyById = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationId.trim()) {
      setErrorMessage(t('enterIdError'));
      return;
    }
    
    setIsVerifying(true);
    setErrorMessage('');
    
    try {
      // In a real implementation, you would call an API endpoint here
      // For now, we'll just simulate a delay and redirect
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to the certificate page
      router.push(`/${locale}/certificate/${verificationId}`);
    } catch (error) {
      setErrorMessage(t('verificationError'));
      setIsVerifying(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileType = selectedFile.type;
      
      // Check if file type is supported
      if (!['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/json'].includes(fileType)) {
        setErrorMessage(t('supportedFormatsError'));
        setFile(null);
        setFileSelected(false);
        return;
      }
      
      setFile(selectedFile);
      setFileSelected(true);
      setErrorMessage('');
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const fileType = droppedFile.type;
      
      // Check if file type is supported
      if (!['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/json'].includes(fileType)) {
        setErrorMessage(t('supportedFormatsError'));
        setFile(null);
        setFileSelected(false);
        return;
      }
      
      setFile(droppedFile);
      setFileSelected(true);
      setErrorMessage('');
    }
  };
  
  const handleVerifyByFile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setErrorMessage(t('selectFileError'));
      return;
    }
    
    setIsUploading(true);
    setErrorMessage('');
    
    try {
      // In a real implementation, you would upload the file to an API endpoint here
      // For now, we'll just simulate a delay and redirect to a mock certificate
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to a mock certificate page
      router.push(`/${locale}/certificate/mock-verification-id`);
    } catch (error) {
      setErrorMessage(t('verificationError'));
      setIsUploading(false);
    }
  };
  
  return (
    <Tabs defaultValue="id" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="id">{t('byId')}</TabsTrigger>
        <TabsTrigger value="file">{t('byFile')}</TabsTrigger>
      </TabsList>
      
      <TabsContent value="id">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              {t('byId')}
            </CardTitle>
            <CardDescription>{t('enterIdDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyById} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="certificateId" className="text-sm font-medium">
                  {t('credentialId')}
                </label>
                <div className="relative">
                  <Input
                    id="certificateId"
                    placeholder={t('credentialIdPlaceholder')}
                    value={verificationId}
                    onChange={(e) => setVerificationId(e.target.value)}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                {errorMessage && (
                  <div className="flex items-center text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errorMessage}
                  </div>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                    {t('verifying')}
                  </>
                ) : (
                  t('verifyButton')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="file">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2 text-green-500" />
              {t('byFile')}
            </CardTitle>
            <CardDescription>{t('uploadDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyByFile} className="space-y-4">
              <div
                className={`border-2 ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'
                } rounded-lg p-6 text-center transition-colors`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                
                {fileSelected ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">{t('fileSelected')}: {file?.name}</span>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {t('dragAndDrop')}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                      {t('or')}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('fileInput')?.click()}
                    >
                      {t('browseFiles')}
                    </Button>
                    <input
                      id="fileInput"
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.json"
                      onChange={handleFileChange}
                    />
                    <p className="text-xs text-gray-400 mt-4">
                      {t('supportedFormats')}
                    </p>
                  </>
                )}
              </div>
              
              {errorMessage && (
                <div className="flex items-center text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errorMessage}
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={!fileSelected || isUploading}>
                {isUploading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                    {t('uploading')}
                  </>
                ) : (
                  t('verifyButton')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {t('needCredential')}
        </p>
        <Button variant="link" onClick={() => router.push(`/${locale}/auth/register`)}>
          {t('createAccount')}
        </Button>
      </div>
    </Tabs>
  );
} 