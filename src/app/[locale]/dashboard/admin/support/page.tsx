import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type Props = {
  params: { locale: string }
};

// Define the ticket type based on Prisma schema
type Ticket = {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'TECHNICAL' | 'BILLING' | 'ACCOUNT' | 'GENERAL' | 'OTHER';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: {
    name: string | null;
    email: string;
  };
};

export default async function AdminSupportPage({ params }: Props) {
  // Create a copy of the locale to avoid direct access in an async context
  const currentLocale = String(params?.locale || 'en');
  const session = await auth();
  const user = session?.user;
  const t = await getTranslations({ locale: currentLocale, namespace: 'admin.support' });

  if (!user) {
    redirect(`/${currentLocale}/auth/login`);
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">{t('unauthorized')}</h1>
        <p>{t('unauthorizedDescription')}</p>
      </div>
    );
  }

  // Fetch tickets from the database
  const tickets: Ticket[] = await prisma.ticket.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-gray-600 mt-2">{t('subtitle')}</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button asChild>
            <Link href={`/${currentLocale}/dashboard/admin/support/new`}>
              {t('createNewTicket')}
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('allTickets')}</CardTitle>
          <CardDescription>
            {t('allTicketsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('id')}</TableHead>
                <TableHead>{t('title')}</TableHead>
                <TableHead>{t('user')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('priority')}</TableHead>
                <TableHead>{t('created')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.id}</TableCell>
                  <TableCell>{ticket.title}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{ticket.user.name}</div>
                      <div className="text-sm text-gray-500">{ticket.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ticket.status === 'OPEN' ? 'default' : 'secondary'}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      ticket.priority === 'HIGH' ? 'destructive' :
                      ticket.priority === 'MEDIUM' ? 'secondary' :
                      'default'
                    }>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/${currentLocale}/dashboard/admin/support/${ticket.id}`}>
                        {t('view')}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 