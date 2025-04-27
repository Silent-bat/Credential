import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';

type Props = {
  params: { locale: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'dashboard' });
  
  return {
    title: `${t('support')} - Credential Network`,
    description: t('supportDescription')
  };
}

export default async function InstitutionSupportPage({ params }: Props) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'dashboard' });
  const common = await getTranslations({ locale, namespace: 'common' });
  
  // Check authentication
  const session = await auth();
  if (!session || !session.user) {
    redirect(`/${locale}/login?callbackUrl=/${locale}/dashboard/institution/support`);
  }

  // Get user role
  const userRole = session.user.role;
  if (userRole !== 'ADMIN' && userRole !== 'INSTITUTION') {
    redirect(`/${locale}/dashboard`);
  }

  // Get institution ID for institution users
  let institutionId = null;
  let dbConnectionError = false;
  let tickets = [];
  let user = null;

  try {
    // Get user information
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { institutionUsers: true }
    });

    if (userRole === 'INSTITUTION') {
      institutionId = user?.institutionUsers?.[0]?.institutionId;
      
      if (!institutionId) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-4">{t('noInstitutionFound')}</h1>
            <p className="text-gray-600 mb-6">{t('accountNotAssociated')}</p>
          </div>
        );
      }

      // For institution admins, fetch tickets related to their institution
      const institutionUsers = await prisma.institutionUser.findMany({
        where: { institutionId },
        select: { userId: true }
      });

      const userIds = institutionUsers.map(iu => iu.userId);

      tickets = await prisma.ticket.findMany({
        where: { userId: { in: userIds } },
        include: {
          User: {
            select: { name: true, email: true }
          },
          TicketMessage: {
            include: {
              User: {
                select: { name: true, email: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });
    } else if (userRole === 'ADMIN') {
      // For system admins, fetch all tickets or tickets from institution admins
      tickets = await prisma.ticket.findMany({
        where: {
          User: {
            role: 'INSTITUTION'
          }
        },
        include: {
          User: {
            select: { name: true, email: true, role: true },
            include: {
              institutionUsers: {
                include: {
                  institution: {
                    select: { name: true }
                  }
                }
              }
            }
          },
          TicketMessage: {
            include: {
              User: {
                select: { name: true, email: true, role: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });
    }
  } catch (error) {
    console.error('Failed to fetch institution or tickets:', error);
    dbConnectionError = true;
  }

  // Helper function to format dates
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get appropriate title based on user role
  const getSupportTitle = () => {
    if (userRole === 'ADMIN') {
      return t('supportTickets') + ' - ' + t('allTickets');
    } else {
      return t('supportTickets');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">{common('navigation.support')}</h1>
      
      {dbConnectionError && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {t('dbConnectionError')}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="tickets">{t('supportTickets')}</TabsTrigger>
          <TabsTrigger value="faq">{t('frequentlyAskedQuestions')}</TabsTrigger>
          <TabsTrigger value="contact">{t('contactUs')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tickets" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">{getSupportTitle()}</h2>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button>{t('createTicket')}</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{t('createTicket')}</DialogTitle>
                  <DialogDescription>{t('createTicketDescription')}</DialogDescription>
                </DialogHeader>
                <form className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">{t('ticketSubject')}</Label>
                      <Input id="subject" placeholder={t('ticketSubjectPlaceholder')} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="priority">{t('ticketPriority')}</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder={t('ticketMediumPriority')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HIGH">{t('ticketHighPriority')}</SelectItem>
                          <SelectItem value="MEDIUM">{t('ticketMediumPriority')}</SelectItem>
                          <SelectItem value="LOW">{t('ticketLowPriority')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {userRole === 'ADMIN' && (
                      <div className="space-y-2">
                        <Label htmlFor="recipient">Recipient</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select recipient" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SYSTEM">System Admin</SelectItem>
                            <SelectItem value="INSTITUTION">Institution Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">{t('ticketDescription')}</Label>
                      <Textarea id="description" placeholder={t('ticketDescriptionPlaceholder')} rows={5} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{common('buttons.submit')}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {tickets.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('ticketID')}</TableHead>
                      <TableHead>{t('ticketSubject')}</TableHead>
                      {userRole === 'ADMIN' && (
                        <TableHead>From</TableHead>
                      )}
                      <TableHead>{t('ticketStatus')}</TableHead>
                      <TableHead>{t('ticketPriority')}</TableHead>
                      <TableHead>{t('ticketUpdatedAt')}</TableHead>
                      <TableHead>{common('labels.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket: any) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">#{ticket.id.substring(0, 8)}</TableCell>
                        <TableCell>{ticket.title}</TableCell>
                        {userRole === 'ADMIN' && (
                          <TableCell>
                            {ticket.User.name || ticket.User.email}
                            {ticket.User.institutionUsers?.[0]?.institution?.name && (
                              <span className="block text-xs text-gray-500">
                                {ticket.User.institutionUsers[0].institution.name}
                              </span>
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          <Badge className={getStatusColor(ticket.status)}>
                            {t(`ticket${ticket.status.charAt(0) + ticket.status.slice(1).toLowerCase()}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {t(`ticket${ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase()}Priority`)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(ticket.updatedAt)}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">{t('viewTicket')}</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[800px]">
                              <DialogHeader>
                                <DialogTitle>{ticket.title}</DialogTitle>
                                <DialogDescription>
                                  <div className="flex gap-2 mt-2">
                                    <Badge className={getStatusColor(ticket.status)}>
                                      {t(`ticket${ticket.status.charAt(0) + ticket.status.slice(1).toLowerCase()}`)}
                                    </Badge>
                                    <Badge className={getPriorityColor(ticket.priority)}>
                                      {t(`ticket${ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase()}Priority`)}
                                    </Badge>
                                    <span className="text-gray-500 text-sm">
                                      {t('ticketCreatedAt')}: {formatDate(ticket.createdAt)}
                                    </span>
                                  </div>
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="py-4 space-y-4">
                                <div className="bg-gray-50 p-4 rounded-md">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">
                                      {ticket.User.name || ticket.User.email}
                                      {userRole === 'ADMIN' && ticket.User.institutionUsers?.[0]?.institution?.name && (
                                        <span className="ml-2 text-sm text-gray-500">
                                          ({ticket.User.institutionUsers[0].institution.name})
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-sm text-gray-500">{formatDate(ticket.createdAt)}</span>
                                  </div>
                                  <p className="whitespace-pre-wrap">{ticket.description}</p>
                                </div>
                                
                                <div className="space-y-4">
                                  <h4 className="font-medium">{t('ticketResponses')}</h4>
                                  
                                  {ticket.TicketMessage.length > 0 ? (
                                    <div className="space-y-3">
                                      {ticket.TicketMessage.map((message: any) => (
                                        <div key={message.id} className="bg-gray-50 p-4 rounded-md">
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium">
                                              {message.User.name || message.User.email}
                                              {message.User.role && (
                                                <span className="ml-2 text-xs text-gray-500">
                                                  ({message.User.role})
                                                </span>
                                              )}
                                            </span>
                                            <span className="text-sm text-gray-500">{formatDate(message.createdAt)}</span>
                                          </div>
                                          <p className="whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-gray-500 text-sm">{t('noTicketsFound')}</p>
                                  )}
                                </div>
                                
                                {ticket.status !== 'CLOSED' && (
                                  <div className="space-y-2">
                                    <Label htmlFor="response">{t('ticketAddResponse')}</Label>
                                    <Textarea id="response" placeholder={t('ticketResponsePlaceholder')} rows={3} />
                                    <div className="flex justify-between pt-2">
                                      <Button variant="outline">{t('closeTicket')}</Button>
                                      <Button>{t('submitResponse')}</Button>
                                    </div>
                                  </div>
                                )}
                                
                                {ticket.status === 'CLOSED' && (
                                  <div className="flex justify-end pt-2">
                                    <Button variant="outline">{t('reopenTicket')}</Button>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h10z" />
                </svg>
                <h3 className="text-lg font-medium">{t('noTicketsCreated')}</h3>
                <p className="text-gray-500">{t('ticketsHelp')}</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>{t('createTicket')}</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{t('createTicket')}</DialogTitle>
                      <DialogDescription>{t('createTicketDescription')}</DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="subject">{t('ticketSubject')}</Label>
                          <Input id="subject" placeholder={t('ticketSubjectPlaceholder')} />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="priority">{t('ticketPriority')}</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder={t('ticketMediumPriority')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="HIGH">{t('ticketHighPriority')}</SelectItem>
                              <SelectItem value="MEDIUM">{t('ticketMediumPriority')}</SelectItem>
                              <SelectItem value="LOW">{t('ticketLowPriority')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {userRole === 'ADMIN' && (
                          <div className="space-y-2">
                            <Label htmlFor="recipient">Recipient</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select recipient" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SYSTEM">System Admin</SelectItem>
                                <SelectItem value="INSTITUTION">Institution Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <Label htmlFor="description">{t('ticketDescription')}</Label>
                          <Textarea id="description" placeholder={t('ticketDescriptionPlaceholder')} rows={5} />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">{common('buttons.submit')}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('frequentlyAskedQuestions')}</CardTitle>
              <CardDescription>{t('faqDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="font-medium mb-1">{t('faqInviteUsers')}</h3>
                  <p className="text-gray-600">{t('faqInviteUsersAnswer')}</p>
                </div>
                
                <div className="border-b pb-2">
                  <h3 className="font-medium mb-1">{t('faqCreateCertificate')}</h3>
                  <p className="text-gray-600">{t('faqCreateCertificateAnswer')}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">{t('faqManageRecipients')}</h3>
                  <p className="text-gray-600">{t('faqManageRecipientsAnswer')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('contactUs')}</CardTitle>
              <CardDescription>{t('contactUsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-gray-600">support@credential.network</p>
                </div>
                <div>
                  <h3 className="font-medium">Phone</h3>
                  <p className="text-gray-600">+1 (123) 456-7890</p>
                </div>
                <div>
                  <h3 className="font-medium">{t('responseTime')}</h3>
                  <p className="text-gray-600">{t('responseTimeDescription')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 