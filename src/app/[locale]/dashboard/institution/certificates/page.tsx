'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Award, 
  Plus, 
  Search, 
  FileText, 
  Calendar, 
  ArrowUpDown,
  Download,
  MoreHorizontal,
  FileCheck,
  Ban,
  Eye,
  RefreshCw,
  Filter,
  CheckCircle2,
  AlertCircle,
  ClockIcon,
  XCircle,
  Info
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

type Certificate = {
  id: string;
  title: string;
  recipientName: string;
  recipientEmail: string;
  status: string;
  issueDate: string;
  expiryDate: string | null;
  verificationId: string;
  createdAt: string;
  updatedAt: string;
  institutionId: string;
};

export default function CertificatesPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const locale = useLocale();
  const t = useTranslations('certificates');
  const common = useTranslations('common');
  
  // Fix all translation issues with a completely new approach
  // Simple utility to get translation with guaranteed fallback
  const safeTranslation = (key: string, fallback: string): string => {
    try {
      return t.raw(key) || fallback;
    } catch {
      return fallback;
    }
  };
  
  // Common translations with fallbacks
  const commonTranslations = {
    previous: common('buttons.previous') || 'Previous',
    next: common('buttons.next') || 'Next'
  };
  
  // Define all translations with fallbacks as plain values to avoid any issues
  const translations = {
    // Stats & headers
    totalCertificates: safeTranslation('totalCertificates', 'Total Certificates'),
    activeCertificates: safeTranslation('activeCertificates', 'Active Certificates'),
    issuedThisMonth: safeTranslation('issuedThisMonth', 'Issued This Month'),
    comparedToLastMonth: (percent: string) => `${percent} ${safeTranslation('comparedToLastMonth', 'compared to last month')}`,
    certificatesList: safeTranslation('certificatesList', 'Certificates List'),
    certificatesDescription: safeTranslation('certificatesDescription', 'View and manage all your certificates'),
    manageCertificates: safeTranslation('manageCertificates', 'Manage Certificates'),
    certificatesSubtitle: (params: {institution: string}) => 
      safeTranslation('certificatesSubtitle', `Create and manage certificates for ${params.institution}`),
    
    // Filters and search
    filterByStatus: safeTranslation('filterByStatus', 'Filter by Status'),
    allStatuses: safeTranslation('allStatuses', 'All Statuses'),
    search: safeTranslation('searchCertificates', 'Search certificates...'),
    
    // Status labels
    issued: safeTranslation('issued', 'Issued'),
    active: safeTranslation('active', 'Active'),
    pending: safeTranslation('pending', 'Pending'),
    expired: safeTranslation('expired', 'Expired'),
    revoked: safeTranslation('revoked', 'Revoked'),
    draft: safeTranslation('draft', 'Draft'),
    
    // Table headers
    certificate: safeTranslation('certificate', 'Certificate'),
    recipient: safeTranslation('recipient', 'Recipient'),
    issueDate: safeTranslation('issueDate', 'Issue Date'),
    status: safeTranslation('status', 'Status'),
    actions: safeTranslation('actions', 'Actions'),
    
    // Actions
    create: safeTranslation('createNewCertificate', 'Create Template'),
    issue: safeTranslation('issueCertificate', 'Issue Certificate'),
    manage: safeTranslation('manage', 'Manage Certificate'),
    view: safeTranslation('view', 'View Details'),
    edit: safeTranslation('edit', 'Edit Certificate'),
    verify: safeTranslation('verify', 'Verify'),
    download: safeTranslation('download', 'Download PDF'),
    expires: safeTranslation('expiryDate', 'Expires'),
    
    // Navigation - using common namespace directly
    previous: commonTranslations.previous,
    next: commonTranslations.next,
    
    // Empty states
    noCertificates: safeTranslation('noCertificates', 'No Certificates Found'),
    noCertificatesDesc: safeTranslation('noCertificatesDescription', 
      'Start by creating your first certificate template or issuing a certificate directly.')
  };
  
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('issueDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [institutionInfo, setInstitutionInfo] = useState<{
    name: string;
    totalCertificates: number;
    activeCertificates: number;
    issuedThisMonth: number;
  }>({
    name: '',
    totalCertificates: 0,
    activeCertificates: 0,
    issuedThisMonth: 0
  });
  
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push(`/${locale}/auth/login`);
      return;
    }

    if (sessionStatus === 'authenticated') {
      fetchCertificates();
      fetchInstitutionStats();
    }
  }, [sessionStatus, locale, sortBy, sortOrder]);
  
  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/institution/certificates', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
      },
    });
    
      if (!response.ok) {
        if (response.status === 400) {
          console.error('Bad request: Institution ID is required');
          setError('Institution information is missing. Please check your account settings.');
          setCertificates([]);
          return;
        }
        if (response.status === 401) {
          console.error('Unauthorized: Authentication required');
          setError('Authentication required. Please log in again.');
          router.push(`/${locale}/auth/login`);
          return;
        }
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setCertificates(data.certificates || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setError('Failed to fetch certificates. Please try again.');
      setCertificates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInstitutionStats = async () => {
    try {
      const response = await fetch('/api/analytics/institution', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 400) {
          console.error('Bad request: Institution ID is required for analytics');
          return;
        }
        if (response.status === 401) {
          console.error('Unauthorized: Authentication required for analytics');
          return;
        }
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Get the first day of the current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      // Calculate certificates issued this month
      const issuedThisMonth = certificates.filter(cert => 
        new Date(cert.issueDate) >= startOfMonth
      ).length;
      
      setInstitutionInfo({
        name: session?.user?.name?.split(' ')[0] || 'Your Institution',
        totalCertificates: data.institutionOverview?.totalCertificates || 0,
        activeCertificates: data.institutionOverview?.activeCertificates || 0,
        issuedThisMonth
      });
    } catch (error) {
      console.error('Error fetching institution stats:', error);
      // Use fallback values rather than showing an error
      setInstitutionInfo({
        name: session?.user?.name?.split(' ')[0] || 'Your Institution',
        totalCertificates: 0,
        activeCertificates: 0,
        issuedThisMonth: 0
      });
    }
  };
  
  // Filter certificates based on search term and status
  const getFilteredCertificates = () => {
    return certificates.filter(cert => {
      const matchesSearch = 
        cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' || 
        cert.status.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  };
  
  const filteredCertificates = getFilteredCertificates();
  
  // Sort certificates based on sort criteria
  const sortedCertificates = [...filteredCertificates].sort((a, b) => {
    if (sortBy === 'title') {
      return sortOrder === 'asc' 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else if (sortBy === 'issueDate') {
      return sortOrder === 'asc'
        ? new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
        : new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
    } else if (sortBy === 'recipient') {
      return sortOrder === 'asc'
        ? a.recipientName.localeCompare(b.recipientName)
        : b.recipientName.localeCompare(a.recipientName);
    }
    return 0;
  });

  // Toggle sort order when clicking on a table header
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'PPP');
  };
  
  // Status badge component with appropriate styling
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      'ISSUED': { 
        label: translations.issued, 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
      },
      'ACTIVE': { 
        label: translations.active, 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
      },
      'PENDING': { 
        label: translations.pending, 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <ClockIcon className="h-3.5 w-3.5 mr-1" />
      },
      'EXPIRED': { 
        label: translations.expired, 
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: <AlertCircle className="h-3.5 w-3.5 mr-1" />
      },
      'REVOKED': { 
        label: translations.revoked, 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle className="h-3.5 w-3.5 mr-1" />
      },
      'DRAFT': { 
        label: translations.draft, 
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: <Info className="h-3.5 w-3.5 mr-1" />
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
      { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200', icon: null };

  return (
      <Badge variant="outline" className={`flex items-center px-2 py-1 ${config.color}`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };
  
  // Statistics Cards
  const StatCard = ({ title, value, icon, description, className = '' }: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    description?: string;
    className?: string;
  }) => (
    <Card className={`${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 p-1.5 text-primary flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
  
  // Render skeleton loader for the certificates table
  const CertificatesTableSkeleton = () => (
    <div className="bg-white rounded-md shadow">
      <div className="flex p-4 justify-between items-center border-b">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between items-center py-3 border-b last:border-0">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-24" />
            </div>
        ))}
          </div>
        </div>
  );
  
  // Empty state component when no certificates are found
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Award className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">{translations.noCertificates}</h3>
      <p className="mt-1 text-sm text-gray-500">
        {searchTerm 
          ? "Try adjusting your search or filter criteria" 
          : translations.noCertificatesDesc}
      </p>
      <div className="mt-6">
        <Button asChild>
          <Link href={`/${locale}/dashboard/institution/certificates/issue`}>
            <Plus className="mr-2 h-4 w-4" />
            {translations.issue}
          </Link>
        </Button>
      </div>
            </div>
  );
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col space-y-8">
        {/* Page header */}
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{translations.manageCertificates}</h1>
              <p className="text-muted-foreground mt-1">
                {translations.certificatesSubtitle({ institution: institutionInfo.name })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/${locale}/dashboard/institution/certificates/issue`}>
                  <FileText className="mr-2 h-4 w-4" />
                  {translations.issue}
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/${locale}/dashboard/institution/certificates/create`}>
                  <Plus className="mr-2 h-4 w-4" />
                  {translations.create}
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Stats section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard 
              title={translations.totalCertificates} 
              value={institutionInfo.totalCertificates}
              icon={<Award className="h-4 w-4" />}
            />
            <StatCard 
              title={translations.activeCertificates} 
              value={institutionInfo.activeCertificates}
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
            <StatCard 
              title={translations.issuedThisMonth} 
              value={institutionInfo.issuedThisMonth}
              icon={<Calendar className="h-4 w-4" />}
              description={translations.comparedToLastMonth('+12%')}
            />
          </div>
        </div>
      
        {/* Certificates section */}
      <Card>
          <CardHeader className="pb-3">
            <CardTitle>{translations.certificatesList}</CardTitle>
            <CardDescription>{translations.certificatesDescription}</CardDescription>
        </CardHeader>
        <CardContent>
            {/* Search and filter controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                  placeholder={translations.search}
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
              <div className="flex gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={translations.filterByStatus} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{translations.allStatuses}</SelectItem>
                    <SelectItem value="ISSUED">{translations.issued}</SelectItem>
                    <SelectItem value="ACTIVE">{translations.active}</SelectItem>
                    <SelectItem value="PENDING">{translations.pending}</SelectItem>
                    <SelectItem value="EXPIRED">{translations.expired}</SelectItem>
                    <SelectItem value="REVOKED">{translations.revoked}</SelectItem>
                    <SelectItem value="DRAFT">{translations.draft}</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={fetchCertificates}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            
            {/* Error state */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>{error}</span>
            </div>
          </div>
            )}
            
            {/* Certificates table */}
            {isLoading ? (
              <CertificatesTableSkeleton />
            ) : sortedCertificates.length === 0 ? (
              <EmptyState />
            ) : (
            <div className="rounded-md border">
                <ScrollArea className="max-h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                        <TableHead 
                          className="w-[40%] cursor-pointer"
                          onClick={() => toggleSort('title')}
                        >
                          <div className="flex items-center">
                            {translations.certificate}
                            {sortBy === 'title' && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer"
                          onClick={() => toggleSort('recipient')}
                        >
                          <div className="flex items-center">
                            {translations.recipient}
                            {sortBy === 'recipient' && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer"
                          onClick={() => toggleSort('issueDate')}
                        >
                          <div className="flex items-center">
                            {translations.issueDate}
                            {sortBy === 'issueDate' && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead>{translations.status}</TableHead>
                        <TableHead className="text-right">{translations.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                      {sortedCertificates.map((certificate) => (
                    <TableRow key={certificate.id}>
                      <TableCell className="font-medium">
                            <div className="flex flex-col">
                          <span>{certificate.title}</span>
                              <span className="text-xs text-muted-foreground">
                                ID: {certificate.id.substring(0, 8)}...
                              </span>
                        </div>
                      </TableCell>
                      <TableCell>
                            <div className="flex flex-col">
                              <span>{certificate.recipientName}</span>
                              <span className="text-xs text-muted-foreground">
                                {certificate.recipientEmail}
                              </span>
                        </div>
                      </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  {formatDate(certificate.issueDate)}
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{translations.issued}: {formatDate(certificate.issueDate)}</p>
                                  {certificate.expiryDate && (
                                    <p>{translations.expires}: {formatDate(certificate.expiryDate)}</p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                      <TableCell>
                            <StatusBadge status={certificate.status} />
                      </TableCell>
                      <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{translations.manage}</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link href={`/${locale}/dashboard/institution/certificates/${certificate.id}`} className="cursor-pointer">
                                    <Eye className="mr-2 h-4 w-4" />
                                    {translations.view}
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/${locale}/dashboard/institution/certificates/${certificate.id}/edit`} className="cursor-pointer">
                                    <FileText className="mr-2 h-4 w-4" />
                                    {translations.edit}
                            </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link href={`/verify/${certificate.verificationId}`} target="_blank" className="cursor-pointer">
                                    <FileCheck className="mr-2 h-4 w-4" />
                                    {translations.verify}
                              </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Download className="mr-2 h-4 w-4" />
                                  {translations.download}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 cursor-pointer">
                                  <Ban className="mr-2 h-4 w-4" />
                                  {translations.revoked}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                </ScrollArea>
            </div>
          )}
          
            {/* Pagination - for future implementation */}
            {!isLoading && sortedCertificates.length > 0 && (
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                >
                  {commonTranslations.previous}
              </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                >
                  {commonTranslations.next}
              </Button>
            </div>
            )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
} 