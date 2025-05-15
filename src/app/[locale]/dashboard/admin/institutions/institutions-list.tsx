'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PencilIcon, UsersIcon, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslations } from 'next-intl';

// Define the Institution interface based on what's received from the server
interface Institution {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
  certificates: { id: string }[];
  institutionUsers: {
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }[];
}

interface InstitutionsListProps {
  initialInstitutions: Institution[];
  locale: string;
}

export default function InstitutionsList({ initialInstitutions, locale }: InstitutionsListProps) {
  const [institutions] = useState<Institution[]>(initialInstitutions);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical' | 'certificates'>('newest');
  const t = useTranslations('dashboard.institutions');

  // Extract all unique institution types for the filter dropdown
  const institutionTypes = useMemo(() => {
    const uniqueTypes = new Set<string>();
    
    institutions.forEach(inst => {
      if (inst.type) {
        uniqueTypes.add(inst.type);
      }
    });
    
    return Array.from(uniqueTypes).sort();
  }, [institutions]);

  // Apply filters and sorting
  const filteredInstitutions = useMemo(() => {
    return institutions.filter(institution => {
      // Search filter
      if (searchQuery && 
          !institution.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !institution.type.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Type filter
      if (typeFilter !== "all" && institution.type !== typeFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all" && institution.status !== statusFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort by selected option
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'certificates') {
        return b.certificates.length - a.certificates.length;
      }
      return 0;
    });
  }, [institutions, searchQuery, typeFilter, statusFilter, sortBy]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setTypeFilter("all");
    setStatusFilter("all");
    setSortBy('newest');
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <CardTitle>{t('allInstitutions')}</CardTitle>
            <CardDescription>
              {t('allInstitutionsDesc')}
            </CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder={t('searchInstitutions')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex gap-2">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as 'newest' | 'oldest' | 'alphabetical' | 'certificates')}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder={t('sortBy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t('newestFirst')}</SelectItem>
                  <SelectItem value="oldest">{t('oldestFirst')}</SelectItem>
                  <SelectItem value="alphabetical">{t('alphabetical')}</SelectItem>
                  <SelectItem value="certificates">{t('mostCertificates')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{t('filterInstitutions')}</SheetTitle>
                    <SheetDescription>
                      {t('filterDesc')}
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="py-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="type">{t('institutionType')}</Label>
                      <Select
                        value={typeFilter}
                        onValueChange={(value) => setTypeFilter(value)}
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder={t('allTypes')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('allTypes')}</SelectItem>
                          {institutionTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {t(`institutionTypes.${type}`, { defaultValue: type })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="status">{t('status')}</Label>
                      <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value)}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder={t('allStatuses')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('allStatuses')}</SelectItem>
                          <SelectItem value="APPROVED">{t('statusTypes.APPROVED')}</SelectItem>
                          <SelectItem value="PENDING">{t('statusTypes.PENDING')}</SelectItem>
                          <SelectItem value="REJECTED">{t('statusTypes.REJECTED')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <SheetFooter>
                    <Button variant="outline" onClick={resetFilters}>{t('resetFilters')}</Button>
                    <SheetClose asChild>
                      <Button type="submit">{t('applyFilters')}</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-700 dark:text-gray-400">{t('name')}</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-400">{t('type')}</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-400">{t('status')}</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-400">{t('certificates')}</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-400">{t('dateCreated')}</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-400">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstitutions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    {t('noInstitutionsFound')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredInstitutions.map((institution) => (
                  <TableRow key={institution.id}>
                    <TableCell className="font-medium">
                      <Link href={`/${locale}/dashboard/admin/institutions/${institution.id}`} className="hover:underline">
                        {institution.name}
                      </Link>
                    </TableCell>
                    <TableCell>{t(`institutionTypes.${institution.type}`, { defaultValue: institution.type })}</TableCell>
                    <TableCell>
                      <div className={`
                        px-2 py-1 rounded-md text-xs font-medium inline-flex items-center
                        ${institution.status === 'APPROVED' ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300' : ''}
                        ${institution.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                        ${institution.status === 'REJECTED' ? 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300' : ''}
                      `}>
                        {t(`statusTypes.${institution.status}`, { defaultValue: institution.status })}
                      </div>
                    </TableCell>
                    <TableCell>{institution.certificates.length}</TableCell>
                    <TableCell>{new Date(institution.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/${locale}/dashboard/admin/institutions/${institution.id}`}>
                            {t('viewDetails')}
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/${locale}/dashboard/admin/institutions/${institution.id}/edit`}>
                            <PencilIcon className="h-4 w-4 mr-1" />
                            {t('editInstitution')}
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/${locale}/dashboard/admin/institutions/${institution.id}/users`}>
                            <UsersIcon className="h-4 w-4 mr-1" />
                            {t('manageUsers')}
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredInstitutions.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredInstitutions.length} of {institutions.length} institutions
          </div>
        )}
      </CardContent>
    </Card>
  );
} 