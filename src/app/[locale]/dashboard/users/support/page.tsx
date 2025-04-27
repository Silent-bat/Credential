'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle, Building } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Institution {
  id: string;
  name: string;
}

export default function UserSupportPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const t = useTranslations('support');
  const commonT = useTranslations('common');
  const locale = useLocale();
  
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    institutionId: '',
    priority: 'MEDIUM'
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/auth/login`);
      return;
    }

    // Fetch user's associated institutions
    const fetchInstitutions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user/institutions');
        
        if (response.ok) {
          const data = await response.json();
          setInstitutions(data.institutions || []);
        } else {
          console.error('Error response from API:', response.status);
          try {
            // Use safe translation with fallback
            const errorMsg = commonT.raw('error') || "Error";
            toast({
              title: errorMsg,
              description: "Failed to fetch institutions",
              variant: "destructive"
            });
          } catch (translationError) {
            // Ultimate fallback if translation fails
            toast({
              title: "Error",
              description: "Failed to fetch institutions",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error('Error fetching institutions:', error);
        toast({
          title: "Error",
          description: "Failed to connect to the server",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (session) {
      fetchInstitutions();
    }
  }, [session, status, router, locale, commonT]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.institutionId) {
      toast({
        title: "Missing information",
        description: "Please select an institution",
        variant: "destructive"
      });
      return;
    }

    // Find the selected institution name for the description
    const selectedInstitution = institutions.find(inst => inst.id === formData.institutionId);
    const institutionName = selectedInstitution ? selectedInstitution.name : 'Unknown Institution';

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `[${institutionName}] ${formData.title}`,
          description: `Institution: ${institutionName} (ID: ${formData.institutionId})\n\n${formData.description}`,
          priority: formData.priority
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create support ticket');
      }
      
      toast({
        title: "Success",
        description: "Your support ticket has been submitted successfully",
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        institutionId: '',
        priority: 'MEDIUM'
      });
      
    } catch (error) {
      console.error('Error creating support ticket:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create support ticket. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">{t('contactSupport')}</h1>
      
      {institutions.length === 0 ? (
        <Alert variant="warning" className="mb-8">
          <AlertCircle className="h-5 w-5 mr-2" />
          <div>
            <AlertTitle>{t('noInstitutions')}</AlertTitle>
            <AlertDescription>
              {t('noInstitutionsDescription')}
            </AlertDescription>
          </div>
        </Alert>
      ) : (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('createSupportTicket')}</CardTitle>
            <CardDescription>{t('createSupportTicketDescription')}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="institutionId">{t('selectInstitution')}</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange('institutionId', value)}
                  value={formData.institutionId}
                >
                  <SelectTrigger id="institutionId">
                    <SelectValue placeholder={t('selectInstitutionPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions.map((institution) => (
                      <SelectItem key={institution.id} value={institution.id}>
                        {institution.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">{t('ticketTitle')}</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder={t('ticketTitlePlaceholder')}
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">{t('priority')}</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange('priority', value)}
                  value={formData.priority}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder={t('selectPriority')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">{t('priorityLow')}</SelectItem>
                    <SelectItem value="MEDIUM">{t('priorityMedium')}</SelectItem>
                    <SelectItem value="HIGH">{t('priorityHigh')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">{t('description')}</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder={t('descriptionPlaceholder')}
                  value={formData.description}
                  onChange={handleChange}
                  className="min-h-32"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? commonT('loading') : t('submitTicket')}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Previously submitted tickets section - if implemented */}
      <Card>
        <CardHeader>
          <CardTitle>{t('yourTickets')}</CardTitle>
          <CardDescription>{t('yourTicketsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-gray-500">{t('noTicketsYet')}</p>
        </CardContent>
      </Card>
    </div>
  );
} 