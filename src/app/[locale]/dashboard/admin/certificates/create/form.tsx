"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createCertificate } from './actions';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Extend the allowed file types to support more formats
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Form schema validation with more robust rules
const formSchema = z.object({
  locale: z.string(),
  certificateType: z.string(),
  institutionId: z.string().min(1, { message: "Institution is required" }),
  title: z.string().min(3, { message: "Title must be at least 3 characters" }).max(100, { message: "Title must be less than 100 characters" }),
  recipientName: z.string().min(2, { message: "Recipient name is required" }),
  recipientEmail: z.string().email({ message: "Valid email is required" }),
  description: z.string().max(500, { message: "Description must be less than 500 characters" }).optional(),
  issueDate: z.date({
    required_error: "Issue date is required",
  }),
  expiryDate: z.date().optional().nullable(),
  storeOnBlockchain: z.boolean().default(true),
  certificateImage: z.any()
    .refine(
      (file) => !file || (file instanceof File && file.size <= MAX_FILE_SIZE),
      { message: `File size must be less than 10MB` }
    )
    .refine(
      (file) => !file || (file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file.type)),
      { message: "File must be a PNG, JPG, JPEG, or WebP image" }
    )
    .optional(),
  designData: z.any().optional(),
  tags: z.string().optional(),
  courseOrDegree: z.string().optional(),
  certificateId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CertificateFormProps {
  institutions: { id: string; name: string }[];
  locale: string;
  certificateType: 'uploaded' | 'designed';
  designData?: string;
  preselectedInstitutionId?: string;
  onError?: (message: string) => void;
}

export default function CertificateForm({ 
  institutions, 
  locale, 
  certificateType, 
  designData,
  preselectedInstitutionId,
  onError
}: CertificateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      locale,
      certificateType,
      institutionId: preselectedInstitutionId || "",
      title: "",
      recipientName: "",
      recipientEmail: "",
      description: "",
      issueDate: new Date(),
      expiryDate: null,
      storeOnBlockchain: true,
      designData: designData || null,
      tags: "",
      courseOrDegree: "",
    },
  });

  // Handle file input change to show preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        form.setError('certificateImage', { 
          type: 'manual', 
          message: 'File size must be less than 10MB' 
        });
        return;
      }
      
      // Check file type
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        form.setError('certificateImage', { 
          type: 'manual', 
          message: 'File must be a PNG, JPG, JPEG, or WebP image' 
        });
        return;
      }
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      form.setValue('certificateImage', file);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      setUploadProgress(10); // Initial progress
      
      const formData = new FormData();
      
      // Add form fields to FormData
      formData.append('locale', data.locale);
      formData.append('certificateType', data.certificateType);
      formData.append('institutionId', data.institutionId);
      formData.append('title', data.title);
      formData.append('recipientName', data.recipientName);
      formData.append('recipientEmail', data.recipientEmail);
      formData.append('description', data.description || '');
      formData.append('issuedDate', data.issueDate.toISOString());
      
      if (data.expiryDate) {
        formData.append('expirationDate', data.expiryDate.toISOString());
      }
      
      // Additional metadata fields
      if (data.tags) formData.append('tags', data.tags);
      if (data.courseOrDegree) formData.append('courseOrDegree', data.courseOrDegree);
      if (data.certificateId) formData.append('certificateId', data.certificateId);
      
      formData.append('storeOnBlockchain', data.storeOnBlockchain ? 'true' : 'false');
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);
      
      // Handle certificate image for uploaded type
      if (certificateType === 'uploaded' && form.watch('certificateImage')) {
        formData.append('certificateImage', form.watch('certificateImage'));
      }
      
      // Handle design data for designed type
      if (certificateType === 'designed' && designData) {
        formData.append('designData', designData);
      }
      
      // Submit form
      await createCertificate(formData);
      
      // Cleanup
      clearInterval(progressInterval);
      setUploadProgress(100);
      
    } catch (error) {
      console.error('Error submitting certificate:', error);
      
      // Show error message
      if (onError) {
        onError('Failed to create certificate. Please check your form data and try again.');
      }
      
      // Reset upload progress
      setUploadProgress(0);
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="certificateType" value={certificateType} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="institutionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Institution</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select institution" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {institutions.map(institution => (
                      <SelectItem key={institution.id} value={institution.id}>
                        {institution.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The institution issuing this certificate
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certificate Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Certificate of Achievement" 
                    {...field} 
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  The title or name of the certificate
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="recipientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipient Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="John Doe" 
                    {...field} 
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Full name of the recipient
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="recipientEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipient Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="john@example.com" 
                    {...field} 
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Email address of the recipient
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* New field: Course or Degree */}
          <FormField
            control={form.control}
            name="courseOrDegree"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course or Degree (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Bachelor of Science" 
                    {...field} 
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  The course or degree this certificate is for
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* New field: Certificate ID */}
          <FormField
            control={form.control}
            name="certificateId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Certificate ID (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="CERT-2023-00001" 
                    {...field} 
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Optional custom ID for the certificate
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Certificate description and details"
                    className="min-h-24"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Optional description of the certificate and what it represents
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* New field: Tags */}
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Tags (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="computer science, programming, web development" 
                    {...field} 
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Comma-separated list of tags for categorizing and searching certificates
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {certificateType === 'uploaded' && (
            <FormField
              control={form.control}
              name="certificateImage"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Certificate Image</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Input 
                        type="file"
                        accept={ACCEPTED_IMAGE_TYPES.join(',')}
                        onChange={handleFileChange}
                        disabled={isSubmitting}
                        {...rest}
                      />
                      {previewUrl && (
                        <div className="mt-4 border rounded-md overflow-hidden">
                          <img 
                            src={previewUrl} 
                            alt="Certificate preview" 
                            className="max-h-64 mx-auto"
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload a PNG, JPG, JPEG, or WebP image (max 10MB)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Issue Date</FormLabel>
                <DatePicker 
                  date={field.value} 
                  setDate={field.onChange}
                  disabled={isSubmitting}
                />
                <FormDescription>
                  When the credential was earned or issued
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expiry Date (Optional)</FormLabel>
                <DatePicker 
                  date={field.value} 
                  setDate={field.onChange}
                  disabled={isSubmitting}
                />
                <FormDescription>
                  Optional. Set if the credential has an expiration date
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Separator className="my-6" />
        
        <FormField
          control={form.control}
          name="storeOnBlockchain"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Secure on Blockchain</FormLabel>
                <FormDescription>
                  Store a secure hash of this certificate on the blockchain for tamper-proof verification
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        {isSubmitting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uploading certificate...</span>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
        
        <div className="flex justify-end">
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate.spin" />
                Processing...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create Certificate
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 