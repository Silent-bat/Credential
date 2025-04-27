'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PencilIcon, ExternalLinkIcon, DownloadIcon, MoreVertical, Trash2, FileText, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface Certificate {
  id: string;
  title: string;
  verificationId?: string;
  recipientName?: string;
  recipientEmail?: string;
  createdAt: Date;
  fileUrl?: string;
  pdfUrl?: string;
  institution?: {
    name: string;
  };
}

interface CertificatesListProps {
  initialCertificates: Certificate[];
  locale: string;
}

export default function CertificatesList({ initialCertificates, locale }: CertificatesListProps) {
  const t = useTranslations('certificates');
  const common = useTranslations('common');
  
  const [certificates] = useState<Certificate[]>(initialCertificates);
  const [searchQuery, setSearchQuery] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [showVerified, setShowVerified] = useState(true);
  const [showUnverified, setShowUnverified] = useState(true);

  // Extract all unique institutions for the filter dropdown
  const institutions = useMemo(() => {
    const uniqueInstitutions = new Set<string>();
    
    certificates.forEach(cert => {
      if (cert.institution?.name) {
        uniqueInstitutions.add(cert.institution.name);
      }
    });
    
    return Array.from(uniqueInstitutions).sort();
  }, [certificates]);

  // Apply filters and sorting
  const filteredCertificates = useMemo(() => {
    return certificates.filter(certificate => {
      // Search filter
      if (searchQuery && !((
        certificate.title || '') +
        (certificate.recipientName || '') +
        (certificate.recipientEmail || '') +
        (certificate.institution?.name || '')
      ).toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Institution filter
      if (institutionFilter !== "all" && certificate.institution?.name !== institutionFilter) {
        return false;
      }

      // Verification filter
      if (!showVerified && certificate.verificationId) {
        return false;
      }
      
      if (!showUnverified && !certificate.verificationId) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort by selected option
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });
  }, [certificates, searchQuery, institutionFilter, sortBy, showVerified, showUnverified]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setInstitutionFilter("all");
    setSortBy('newest');
    setShowVerified(true);
    setShowUnverified(true);
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <CardTitle className="text-gray-600">{t('title')}</CardTitle>
            <CardDescription>
              {t('issuedCertificates')}
            </CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder={common('search') + ' ' + t('title').toLowerCase() + '...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex gap-2">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as 'newest' | 'oldest' | 'title')}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder={common('buttons.sort')} className="text-gray-600" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest" className="text-gray-600">{t('sortNewest')}</SelectItem>
                  <SelectItem value="oldest" className="text-gray-600">{t('sortOldest')}</SelectItem>
                  <SelectItem value="title" className="text-gray-600">{t('sortTitle')}</SelectItem>
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
                    <SheetTitle className="text-gray-600">{common('buttons.filter')} {t('title')}</SheetTitle>
                    <SheetDescription>
                      {t('filterDescription')}
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="py-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="institution" className="text-gray-600">{t('issuerOrganization')}</Label>
                      <Select
                        value={institutionFilter}
                        onValueChange={(value) => setInstitutionFilter(value)}
                      >
                        <SelectTrigger id="institution">
                          <SelectValue placeholder={t('allInstitutions')} className="text-gray-600" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="text-gray-600">{t('allInstitutions')}</SelectItem>
                          {institutions.map((inst) => (
                            <SelectItem key={inst} value={inst} className="text-gray-600">
                              {inst}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-gray-600">{t('verificationStatus')}</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="verified" 
                            checked={showVerified}
                            onCheckedChange={(checked) => setShowVerified(!!checked)}
                          />
                          <label
                            htmlFor="verified"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600"
                          >
                            {t('showVerified')}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="unverified" 
                            checked={showUnverified}
                            onCheckedChange={(checked) => setShowUnverified(!!checked)}
                          />
                          <label
                            htmlFor="unverified"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600"
                          >
                            {t('showUnverified')}
                          </label>
                        </div>
                      </div>
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
          <table className="w-full text-sm text-left text-gray-700 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  {t('certificateID')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t('certificateTitle')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t('recipientName')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t('issuerOrganization')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t('issueDate')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {common('labels.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {t('noCertificatesFound')}
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((certificate) => (
                  <tr 
                    key={certificate.id} 
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {certificate.verificationId ? certificate.verificationId.substring(0, 8) + '...' : t('notAvailable')}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-400">
                      {certificate.title}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-400">
                      {certificate.recipientName || certificate.recipientEmail || t('unknown')}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-400">
                      {certificate.institution?.name || t('unknownInstitution')}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-400">
                      {new Date(certificate.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 flex space-x-2">
                      <Link href={`/${locale}/dashboard/admin/certificates/${certificate.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                      {certificate.verificationId ? (
                        <Link href={`/${locale}/verify/${certificate.verificationId}`} target="_blank">
                          <Button variant="outline" size="sm" className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300">
                            <ExternalLinkIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                      ) : (
                        <Button disabled variant="outline" size="sm" className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300">
                          <ExternalLinkIcon className="h-4 w-4" />
                        </Button>
                      )}
                      {certificate.fileUrl ? (
                        <a href={certificate.fileUrl} download target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20 dark:hover:text-green-300">
                            <DownloadIcon className="h-4 w-4" />
                          </Button>
                        </a>
                      ) : certificate.pdfUrl ? (
                        <a href={certificate.pdfUrl} download target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20 dark:hover:text-green-300">
                            <DownloadIcon className="h-4 w-4" />
                          </Button>
                        </a>
                      ) : (
                        <Button disabled variant="outline" size="sm" className="text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20 dark:hover:text-green-300">
                          <DownloadIcon className="h-4 w-4" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{common('labels.manage')}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Link href={`/${locale}/dashboard/admin/certificates/${certificate.id}/edit`} className="flex items-center text-gray-700 dark:text-gray-200">
                              <PencilIcon className="mr-2 h-4 w-4" />
                              <span>{common('buttons.edit')} {t('certificate')}</span>
                            </Link>
                          </DropdownMenuItem>
                          {certificate.verificationId && (
                            <DropdownMenuItem>
                              <Link href={`/${locale}/verify/${certificate.verificationId}`} target="_blank" className="flex items-center text-gray-700 dark:text-gray-200">
                                <ExternalLinkIcon className="mr-2 h-4 w-4" />
                                <span>{t('viewPublic')}</span>
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {(certificate.fileUrl || certificate.pdfUrl) && (
                            <DropdownMenuItem>
                              <a 
                                href={certificate.fileUrl || certificate.pdfUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-gray-700 dark:text-gray-200"
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                <span>{t('viewDocument')}</span>
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 dark:hover:text-red-400">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>{common('buttons.delete')}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {filteredCertificates.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {t('showing')} {filteredCertificates.length} {t('of')} {certificates.length} {t('certificates')}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 