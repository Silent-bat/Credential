'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { DatePicker } from '@/components/ui/date-picker';

export default function EditCertificatePage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<any>(null);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [unauthorized, setUnauthorized] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Hidden input references
  const [issueDate, setIssueDate] = useState<Date | undefined>(undefined);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    async function loadData() {
      try {
        // Check auth
        const session = await auth();
        const user = session?.user;

        if (!user) {
          router.push(`/${locale}/auth/login`);
          return;
        }

        if (user.role !== "ADMIN") {
          setUnauthorized(true);
          return;
        }

        // Fetch certificate data
        const certificateData = await fetch(`/api/certificates/${id}`).then(res => res.json());
        
        if (!certificateData || certificateData.error) {
          setNotFound(true);
          return;
        }
        
        setCertificate(certificateData);
        
        // Set dates
        if (certificateData.issueDate) {
          setIssueDate(new Date(certificateData.issueDate));
        }
        
        if (certificateData.expiryDate) {
          setExpiryDate(new Date(certificateData.expiryDate));
        }
        
        // Fetch institutions
        const institutionsData = await fetch('/api/institutions').then(res => res.json());
        setInstitutions(institutionsData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load certificate data');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [id, locale, router]);
  
  async function updateCertificate(formData: FormData) {
    try {
      const response = await fetch(`/api/certificates/${id}`, {
        method: 'PUT',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update certificate');
      }
      
      // Show success message
      toast({
        title: "Success",
        description: "Certificate updated successfully",
      });
      
      // Redirect
      router.push(`/${locale}/dashboard/admin/certificates`);
    } catch (error) {
      console.error('Error updating certificate:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update certificate"
      });
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }
  
  if (unauthorized) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }
  
  if (notFound) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Certificate Not Found</h1>
        <p>The requested certificate could not be found.</p>
        <Button asChild className="mt-4">
          <Link href={`/${locale}/dashboard/admin/certificates`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Certificates
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link href={`/${locale}/dashboard/admin/certificates`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Certificates
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Edit Certificate</h1>
          <p className="text-gray-600 mt-2">Update certificate information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Certificate Details</CardTitle>
          <CardDescription>
            Update the details of this certificate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            updateCertificate(formData);
          }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Certificate Title</Label>
                <Input 
                  id="title" 
                  name="title" 
                  defaultValue={certificate?.title}
                  placeholder="Enter certificate title" 
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institutionId">Institution</Label>
                <Select name="institutionId" defaultValue={certificate?.institutionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select institution" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions.map((institution: any) => (
                      <SelectItem key={institution.id} value={institution.id}>
                        {institution.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name</Label>
                <Input 
                  id="recipientName" 
                  name="recipientName" 
                  defaultValue={certificate?.recipientName}
                  placeholder="Enter recipient name" 
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientEmail">Recipient Email</Label>
                <Input 
                  id="recipientEmail" 
                  name="recipientEmail" 
                  type="email"
                  defaultValue={certificate?.recipientEmail}
                  placeholder="Enter recipient email" 
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <input type="hidden" id="issueDate" name="issueDate" 
                  value={issueDate ? issueDate.toISOString() : ''} 
                />
                <DatePicker
                  date={issueDate}
                  setDate={(date) => {
                    setIssueDate(date);
                    const input = document.getElementById('issueDate') as HTMLInputElement;
                    if (date) {
                      input.value = date.toISOString();
                    } else {
                      input.value = '';
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <input type="hidden" id="expiryDate" name="expiryDate" 
                  value={expiryDate ? expiryDate.toISOString() : ''} 
                />
                <DatePicker
                  date={expiryDate}
                  setDate={(date) => {
                    setExpiryDate(date);
                    const input = document.getElementById('expiryDate') as HTMLInputElement;
                    if (date) {
                      input.value = date.toISOString();
                    } else {
                      input.value = '';
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Certificate Type</Label>
                <Select name="type" defaultValue={certificate?.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEGREE">Degree</SelectItem>
                    <SelectItem value="DIPLOMA">Diploma</SelectItem>
                    <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                    <SelectItem value="COURSE">Course</SelectItem>
                    <SelectItem value="ACHIEVEMENT">Achievement</SelectItem>
                    <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                    <SelectItem value="LICENSE">License</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={certificate?.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ISSUED">Issued</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="REVOKED">Revoked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                defaultValue={certificate?.description || ''}
                placeholder="Enter certificate description" 
                rows={4} 
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" asChild>
                <Link href={`/${locale}/dashboard/admin/certificates`}>
                  Cancel
                </Link>
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
} 