'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Upload } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';

// Define the form schema
const certificateFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  recipientName: z.string().min(1, { message: "Recipient name is required" }),
  recipientEmail: z.string().email({ message: "Valid email is required" }),
  issueDate: z.date({ required_error: "Issue date is required" }),
  expiryDate: z.date().optional(),
  description: z.string().optional(),
  type: z.string().default("CERTIFICATE"),
  pdf: z.any().optional(),
});

type FormValues = z.infer<typeof certificateFormSchema>;

interface CertificateCreateFormProps {
  user: {
    id: string;
    name?: string;
    email?: string;
    role?: string;
  };
  locale: string;
  translations: any;
}

export default function CertificateCreateForm({ user, locale, translations }: CertificateCreateFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  
  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(certificateFormSchema),
    defaultValues: {
      title: '',
      recipientName: '',
      recipientEmail: '',
      issueDate: new Date(),
      description: '',
      type: 'CERTIFICATE',
    },
  });
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('pdf', file);
      setUploadedFileName(file.name);
    }
  };

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      console.log('Submitting certificate data:', data);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('recipientName', data.recipientName);
      formData.append('recipientEmail', data.recipientEmail);
      formData.append('issueDate', data.issueDate.toISOString());
      if (data.expiryDate) {
        formData.append('expiryDate', data.expiryDate.toISOString());
      }
      if (data.description) {
        formData.append('description', data.description);
      }
      formData.append('type', data.type);
      
      // Add PDF file if provided
      if (data.pdf) {
        formData.append('file', data.pdf);
      }
      
      // Send to API
      const response = await fetch('/api/institution/certificates', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to create certificate');
      }
      
      const result = await response.json();
      
      // Show success message
      alert('Certificate created successfully!');
      router.push(`/${locale}/dashboard/institution/certificates`);
    } catch (error) {
      console.error('Error creating certificate:', error);
      alert('Failed to create certificate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{translations.createNewCertificate}</CardTitle>
        <CardDescription>
          {translations.designNewCertificateDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="basic">{translations.certificateInformation}</TabsTrigger>
            <TabsTrigger value="advanced">{translations.designOptions}</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TabsContent value="basic" className="space-y-6">
                {/* Certificate Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations.certificateTitle}*</FormLabel>
                      <FormControl>
                        <Input placeholder={translations.certificateTitlePlaceholder} {...field} />
                      </FormControl>
                      <FormDescription>
                        {translations.createNewCertificateDescription || 'The name of the credential being issued.'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Recipient Name */}
                <FormField
                  control={form.control}
                  name="recipientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations.recipientName}*</FormLabel>
                      <FormControl>
                        <Input placeholder={translations.recipientNamePlaceholder} {...field} />
                      </FormControl>
                      <FormDescription>
                        {translations.recipientDescription || 'The full name of the person receiving the credential.'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Recipient Email */}
                <FormField
                  control={form.control}
                  name="recipientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations.recipientEmail}*</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder={translations.recipientEmailPlaceholder} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Issue Date */}
                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Issue Date*</FormLabel>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                      <FormDescription>
                        When the credential was earned or issued.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the achievement or qualification represented by this credential..." 
                          className="resize-y min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Optional. Provide details about what this credential represents.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-6">
                {/* Expiry Date */}
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expiry Date (Optional)</FormLabel>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                      <FormDescription>
                        Optional. Set if the credential has an expiration date.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Certificate Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificate Type</FormLabel>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="CERTIFICATE">Certificate</option>
                        <option value="DEGREE">Degree</option>
                        <option value="DIPLOMA">Diploma</option>
                        <option value="COURSE">Course Completion</option>
                        <option value="ACHIEVEMENT">Achievement</option>
                        <option value="PROFESSIONAL">Professional License</option>
                        <option value="OTHER">Other</option>
                      </select>
                      <FormDescription>
                        Select the type of credential you are issuing.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* PDF Upload */}
                <div className="space-y-2">
                  <FormLabel>Certificate PDF (Optional)</FormLabel>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="pdf-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PDF (MAX. 10MB)
                        </p>
                        {uploadedFileName && (
                          <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                            File selected: {uploadedFileName}
                          </p>
                        )}
                      </div>
                      <input
                        id="pdf-upload"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                  <FormDescription>
                    Optional. Upload a PDF version of the certificate.
                  </FormDescription>
                </div>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push(`/${locale}/dashboard/institution/certificates`)}
        >
          {translations.back || 'Back'}
        </Button>
        <div className="space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            {translations.cancel || 'Cancel'}
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isSubmitting ? 'Saving...' : (translations.createCertificate || 'Create Certificate')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 