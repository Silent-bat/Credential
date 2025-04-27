'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { ChevronLeft, Plus, Save, Upload, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';

// Define form schema with Zod
const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
  description: z.string().optional(),
  template: z.string({ required_error: 'Please select a certificate template' }),
  issueDate: z.date({ required_error: 'Issue date is required' }),
  expiryDate: z.date().optional(),
  recipientIds: z.array(z.string()).min(1, { message: 'At least one recipient is required' }),
});

interface Props {
  params: { locale: string };
}

export default function IssueCertificatePage({ params: { locale } }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipients, setSelectedRecipients] = useState<Array<{ id: string; name: string }>>([]);
  const [uploading, setUploading] = useState(false);
  
  // Mock data for recipients and templates
  const recipientOptions = [
    { value: '1', label: 'John Doe' },
    { value: '2', label: 'Jane Smith' },
    { value: '3', label: 'Alex Johnson' },
    { value: '4', label: 'Maria Garcia' },
    { value: '5', label: 'Robert Chen' },
  ];
  
  const templateOptions = [
    { value: 'completion', label: 'Course Completion' },
    { value: 'achievement', label: 'Achievement' },
    { value: 'participation', label: 'Participation' },
    { value: 'custom', label: 'Custom Template' },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      template: '',
      issueDate: new Date(),
      recipientIds: [],
    },
  });

  const addRecipient = (id: string) => {
    const recipient = recipientOptions.find(r => r.value === id);
    if (recipient && !selectedRecipients.some(r => r.id === id)) {
      const newRecipients = [...selectedRecipients, { id, name: recipient.label }];
      setSelectedRecipients(newRecipients);
      form.setValue('recipientIds', newRecipients.map(r => r.id));
    }
  };

  const removeRecipient = (id: string) => {
    const newRecipients = selectedRecipients.filter(r => r.id !== id);
    setSelectedRecipients(newRecipients);
    form.setValue('recipientIds', newRecipients.map(r => r.id));
  };

  const handleFileUpload = () => {
    setUploading(true);
    // Simulate file upload
    setTimeout(() => {
      setUploading(false);
    }, 1500);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setError(null);

    try {
      // In a real application, you would send the data to your API
      console.log('Form values:', values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Redirect to certificates page
      router.push(`/${locale}/dashboard/institution/certificates`);
    } catch (err) {
      setError('An error occurred while issuing the certificate. Please try again.');
      console.error('Error issuing certificate:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/${locale}/dashboard/institution/certificates`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Certificates
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issue New Certificate</CardTitle>
          <CardDescription>
            Create and issue new certificates to one or more recipients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificate Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Web Development Certificate" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="template"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificate Template</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {templateOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter details about this certificate"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Issue Date</FormLabel>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
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
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="recipientIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipients</FormLabel>
                      <div className="flex flex-col space-y-4">
                        <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-24">
                          {selectedRecipients.length === 0 && (
                            <p className="text-sm text-muted-foreground p-2">
                              No recipients selected. Add recipients below.
                            </p>
                          )}
                          {selectedRecipients.map(recipient => (
                            <div 
                              key={recipient.id} 
                              className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                            >
                              {recipient.name}
                              <button 
                                type="button" 
                                onClick={() => removeRecipient(recipient.id)}
                                className="text-secondary-foreground/70 hover:text-secondary-foreground"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Combobox
                              options={recipientOptions}
                              onSelect={(value) => addRecipient(value)}
                              placeholder="Search for recipients..."
                              emptyText="No matching recipients found"
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="shrink-0"
                            onClick={handleFileUpload}
                            disabled={uploading}
                          >
                            {uploading ? "Uploading..." : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload CSV
                              </>
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
                <Button variant="outline" type="button" asChild className="sm:order-1">
                  <Link href={`/${locale}/dashboard/institution/certificates`}>
                    Cancel
                  </Link>
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || selectedRecipients.length === 0}
                  className="sm:order-2"
                >
                  {isSubmitting ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Issue Certificate
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 