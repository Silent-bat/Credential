'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

type InstitutionUser = {
  id: string;
  role: string;
  institutionId: string;
  userId: string;
  institution: {
    id: string;
    name: string;
  };
};

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  preferredLocale: string | null;
  institutionUsers: InstitutionUser[];
};

type Props = {
  user: User;
  updateUser: (formData: FormData) => Promise<any>;
  locale: string;
  id: string;
};

export function UserEditForm({ user, updateUser, locale, id }: Props) {
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
      
      const result = await updateUser(formData);

      if (result?.success) {
        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
        // Redirect programmatically
        router.push(`/${locale}/dashboard/admin/users`);
      } else {
        toast({
          title: 'Error',
          description: result?.error || 'Failed to update user',
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
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            name="name" 
            defaultValue={user.name || ''}
            placeholder="Enter full name" 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            name="email" 
            type="email"
            defaultValue={user.email}
            placeholder="Enter email address" 
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">User Role</Label>
          <Select name="role" defaultValue={user.role}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="INSTITUTION">Institution Manager</SelectItem>
              <SelectItem value="USER">Regular User</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredLocale">Preferred Language</Label>
          <Select name="preferredLocale" defaultValue={user.preferredLocale || 'en'}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="de">German</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {user.institutionUsers && user.institutionUsers.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Associated Institutions</h3>
          <ul className="space-y-2">
            {user.institutionUsers.map((membership) => (
              <li key={membership.institutionId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div>
                  <span className="font-medium">{membership.institution.name}</span>
                  <span className="ml-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    {membership.role}
                  </span>
                </div>
                <Link href={`/${locale}/dashboard/admin/institutions/${membership.institutionId}`}>
                  <Button variant="outline" size="sm">View</Button>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" asChild>
          <Link href={`/${locale}/dashboard/admin/users`}>
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