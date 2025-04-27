"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useTranslations } from "next-intl";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Search, AlertCircle } from "lucide-react";

export default function VerifyCertificatePage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  const { data: session, status } = useSession();
  const t = useTranslations("dashboard");
  const tVerify = useTranslations("Verification");
  const [verificationMethod, setVerificationMethod] = useState<'id' | 'file'>('id');
  const [certificateId, setCertificateId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [verificationState, setVerificationState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  // If user is not authenticated, redirect to login
  if (status === 'unauthenticated') {
    redirect(`/${locale}/auth/login`);
  }

  // Handle verification by ID
  const handleVerifyById = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!certificateId.trim()) {
      setErrorMessage(tVerify("enterIdError"));
      setVerificationState("error");
      return;
    }

    setVerificationState("loading");
    
    try {
      // API call would go here
      // const response = await fetch(`/api/verify/id/${certificateId}`);
      // const data = await response.json();
      
      // For demo purposes, using a timeout to simulate API call
      setTimeout(() => {
        // Mock success for now
        setVerificationState("success");
      }, 1500);
    } catch (error) {
      setVerificationState("error");
      setErrorMessage(tVerify("verificationError"));
    }
  };

  // Handle verification by file
  const handleVerifyByFile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setErrorMessage(tVerify("selectFileError"));
      setVerificationState("error");
      return;
    }

    // Check file type
    const supportedFormats = ['application/json', 'application/pdf'];
    if (!supportedFormats.includes(file.type)) {
      setErrorMessage(tVerify("supportedFormatsError"));
      setVerificationState("error");
      return;
    }

    setVerificationState("loading");
    
    try {
      // File upload and verification would go here
      // const formData = new FormData();
      // formData.append('certificate', file);
      // const response = await fetch('/api/verify/file', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const data = await response.json();
      
      // For demo purposes, using a timeout to simulate API call
      setTimeout(() => {
        // Mock success for now
        setVerificationState("success");
      }, 2000);
    } catch (error) {
      setVerificationState("error");
      setErrorMessage(tVerify("verificationError"));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    // Reset verification state when file changes
    setVerificationState("idle");
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
    // Reset verification state when file changes
    setVerificationState("idle");
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{tVerify("title")}</h1>
      <p className="text-gray-600 mb-8">{tVerify("subtitle")}</p>

      <Tabs defaultValue="id" onValueChange={(value) => setVerificationMethod(value as 'id' | 'file')}>
        <TabsList className="mb-6">
          <TabsTrigger value="id">{tVerify("byId")}</TabsTrigger>
          <TabsTrigger value="file">{tVerify("byFile")}</TabsTrigger>
        </TabsList>

        <TabsContent value="id">
          <Card>
            <CardHeader>
              <CardTitle>{tVerify("byId")}</CardTitle>
              <CardDescription>{tVerify("enterIdDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyById} className="space-y-4">
                <div>
                  <label htmlFor="certificateId" className="block text-sm font-medium text-gray-700">
                    {tVerify("credentialId")}
                  </label>
                  <Input
                    id="certificateId"
                    placeholder={tVerify("credentialIdPlaceholder")}
                    value={certificateId}
                    onChange={(e) => {
                      setCertificateId(e.target.value);
                      setVerificationState("idle");
                    }}
                  />
                </div>
                
                <Button type="submit" disabled={verificationState === 'loading'} className="w-full">
                  {verificationState === 'loading' ? (
                    <>{tVerify("verifying")}</>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      {tVerify("verifyButton")}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="file">
          <Card>
            <CardHeader>
              <CardTitle>{tVerify("byFile")}</CardTitle>
              <CardDescription>{tVerify("uploadDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyByFile} className="space-y-4">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".json,.pdf"
                  />
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm font-semibold">{tVerify("dragAndDrop")}</p>
                  <p className="mt-1 text-xs text-gray-500">{tVerify("or")}</p>
                  <Button variant="outline" className="mt-2" type="button">
                    {tVerify("browseFiles")}
                  </Button>
                  <p className="mt-1 text-xs text-gray-500">{tVerify("supportedFormats")}</p>
                  
                  {file && (
                    <p className="mt-2 text-sm font-medium">
                      {tVerify("fileSelected")}: {file.name}
                    </p>
                  )}
                </div>
                
                <Button type="submit" disabled={!file || verificationState === 'loading'} className="w-full">
                  {verificationState === 'loading' ? (
                    <>{tVerify("verifying")}</>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      {tVerify("verifyButton")}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {verificationState === 'error' && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {verificationState === 'success' && (
        <Alert className="mt-6 bg-green-50 border border-green-200">
          <AlertDescription className="text-green-700">
            Certificate verification successful! (This is a placeholder for actual verification results)
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 