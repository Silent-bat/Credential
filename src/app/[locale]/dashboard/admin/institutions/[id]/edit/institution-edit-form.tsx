'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

type Institution = {
  id: string;
  name: string;
  email?: string | null;
  website?: string | null;
  type: string;
  status: string;
  logo?: string | null;
  description?: string | null;
};

type Props = {
  institution: Institution;
  updateInstitution: (formData: FormData) => Promise<any>;
  locale: string;
  id: string;
};

export function InstitutionEditForm({ institution, updateInstitution, locale, id }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      // Add hidden fields needed by the server action
      formData.append('id', id);
      formData.append('locale', locale);
      
      const result = await updateInstitution(formData);

      if (result?.success) {
        toast({
          title: 'Success',
          description: 'Institution updated successfully',
        });
        // Redirect programmatically
        router.push(`/${locale}/dashboard/admin/institutions`);
      } else {
        toast({
          title: 'Error',
          description: result?.error || 'Failed to update institution',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Institution Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={institution.name}
            placeholder="Enter institution name"
            required
          />
        </div>

        {/* Only show email field if it exists in the institution data (for backward compatibility) */}
        {institution.email && (
          <div className="space-y-2">
            <Label htmlFor="email">Contact Email (Read Only)</Label>
            <Input
              id="email"
              name="email"
              defaultValue={institution.email || ''}
              placeholder="Email cannot be edited"
              disabled
            />
            <p className="text-xs text-amber-600">
              Note: Email is displayed for reference but cannot be changed.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="website">Website (Optional)</Label>
          <Input
            id="website"
            name="website"
            defaultValue={institution.website || ''}
            placeholder="Enter website URL"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Institution Type</Label>
          <Select name="type" defaultValue={institution.type}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UNIVERSITY">University</SelectItem>
              <SelectItem value="COLLEGE">College</SelectItem>
              <SelectItem value="SCHOOL">School</SelectItem>
              <SelectItem value="TRAINING_CENTER">Training Center</SelectItem>
              <SelectItem value="COMPANY">Company</SelectItem>
              <SelectItem value="GOVERNMENT">Government</SelectItem>
              <SelectItem value="NONPROFIT">Non-Profit</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={institution.status}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo">Logo URL (Optional)</Label>
          <Input
            id="logo"
            name="logo"
            defaultValue={institution.logo || ''}
            placeholder="Enter logo URL"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={institution.description || ''}
          placeholder="Enter institution description"
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" asChild>
          <Link href={`/${locale}/dashboard/admin/institutions`}>
            Cancel
          </Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
} 