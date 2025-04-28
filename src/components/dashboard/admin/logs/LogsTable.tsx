import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';
import { format } from 'date-fns';

type Log = {
  id: string;
  action: string;
  category: string;
  details: string;
  createdAt: string;
  User: {
    id: string;
    name: string;
    email: string;
  };
  Institution: {
    id: string;
    name: string;
  } | null;
  Certificate: {
    id: string;
    title: string;
    recipientName: string;
  } | null;
};

type LogsTableProps = {
  logs: Log[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
};

export function LogsTable({ logs, totalCount, currentPage, pageSize }: LogsTableProps) {
  const t = useTranslations('admin.logs');
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  const handlePageSizeChange = (size: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('pageSize', size.toString());
    params.set('page', '1'); // Reset to first page
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('date')}</TableHead>
              <TableHead>{t('user')}</TableHead>
              <TableHead>{t('action')}</TableHead>
              <TableHead>{t('category')}</TableHead>
              <TableHead>{t('details')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {format(new Date(log.createdAt), 'PPpp')}
                </TableCell>
                <TableCell>
                  {log.User.name} ({log.User.email})
                </TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.category}</TableCell>
                <TableCell>
                  {log.details}
                  {log.Institution && (
                    <div className="text-sm text-gray-500">
                      Institution: {log.Institution.name}
                    </div>
                  )}
                  {log.Certificate && (
                    <div className="text-sm text-gray-500">
                      Certificate: {log.Certificate.title} ({log.Certificate.recipientName})
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="h-8 w-[70px] rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            {t('itemsPerPage')}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {t('page')} {currentPage} {t('of')} {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 