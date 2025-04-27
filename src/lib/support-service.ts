import { PrismaClient, TicketStatus, TicketPriority, TicketCategory } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import prisma from '@/lib/db';

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  assignedToId?: string;
  institutionId?: string;
  attachments: {
    id: string;
    url: string;
    publicId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }[];
  messages: {
    id: string;
    content: string;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
    attachments: {
      id: string;
      url: string;
      publicId: string;
      fileName: string;
      fileType: string;
      fileSize: number;
    }[];
  }[];
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  assignedTo?: {
    id: string;
    name: string | null;
    email: string;
  };
  institution?: {
    id: string;
    name: string;
  };
}

export interface SupportMessage {
  id: string;
  content: string;
  createdAt: Date;
  ticketId: string;
  userId: string;
  isInternal: boolean;
  attachments: {
    id: string;
    url: string;
    publicId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }[];
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

/**
 * Create a new support ticket
 */
export async function createSupportTicket({
  title,
  description,
  category,
  priority = TicketPriority.MEDIUM,
  institutionId,
  relatedTo,
  attachments = [],
}: {
  title: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
  institutionId?: string;
  relatedTo?: string;
  attachments?: File[];
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('Unauthorized: User must be logged in to create a ticket');
  }

  // Create the ticket
  const ticket = await prisma.supportTicket.create({
    data: {
      title,
      description,
      category,
      priority,
      status: TicketStatus.OPEN,
      reference: generateReferenceId(),
      createdBy: session.user.id,
      institutionId,
      relatedTo,
    },
  });

  // Upload attachments if any
  if (attachments.length > 0) {
    await Promise.all(
      attachments.map(async (file) => {
        const uploadResult = await uploadToCloudinary(file, file.name, 'support-attachments');
        await prisma.supportAttachment.create({
          data: {
            filename: file.name,
            fileUrl: uploadResult.secure_url,
            fileType: file.type,
            fileSize: file.size,
            ticketId: ticket.id,
            uploadedBy: session.user.id,
          },
        });
      })
    );
  }

  // Log the activity
  await logSupportActivity({
    action: 'CREATE',
    ticketId: ticket.id,
    userId: session.user.id,
    details: `Created support ticket: ${title}`,
  });

  return ticket;
}

/**
 * Get a support ticket by ID with all related data
 */
export async function getSupportTicket(ticketId: string): Promise<SupportTicket> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('Unauthorized: User must be logged in to view a ticket');
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      institution: {
        select: {
          id: true,
          name: true,
        },
      },
      attachments: true,
      messages: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          attachments: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!ticket) {
    throw new Error('Ticket not found');
  }

  // Check permissions
  const hasAccess = await checkTicketAccess(ticket, session.user.id);
  if (!hasAccess) {
    throw new Error('Unauthorized: You do not have permission to view this ticket');
  }

  return ticket;
}

/**
 * Update a support ticket
 */
export async function updateSupportTicket(
  ticketId: string,
  data: {
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
    assignedToId?: string | null;
  }
): Promise<SupportTicket> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('Unauthorized: User must be logged in to update a ticket');
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: { institution: true },
  });

  if (!ticket) {
    throw new Error('Ticket not found');
  }

  // Check permissions
  const hasAccess = await checkTicketAccess(ticket, session.user.id, true);
  if (!hasAccess) {
    throw new Error('Unauthorized: You do not have permission to update this ticket');
  }

  // Update the ticket
  const updatedTicket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      institution: {
        select: {
          id: true,
          name: true,
        },
      },
      attachments: true,
      messages: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          attachments: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  // Log the activity
  await logSupportActivity({
    action: 'UPDATE',
    ticketId: ticketId,
    userId: session.user.id,
    details: `Updated support ticket: ${ticket.title}`,
    metadata: { changes: data },
  });

  return updatedTicket;
}

/**
 * Add a message to a support ticket
 */
export async function addSupportMessage(
  ticketId: string,
  content: string,
  isInternal: boolean,
  attachments: File[]
): Promise<SupportMessage> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('Unauthorized: User must be logged in to add a message');
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: { institution: true },
  });

  if (!ticket) {
    throw new Error('Ticket not found');
  }

  // Check permissions
  const hasAccess = await checkTicketAccess(ticket, session.user.id);
  if (!hasAccess) {
    throw new Error('Unauthorized: You do not have permission to add messages to this ticket');
  }

  // Create the message
  const message = await prisma.supportMessage.create({
    data: {
      content,
      ticketId,
      sentBy: session.user.id,
      isInternal,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      attachments: true,
    },
  });

  // Upload attachments if any
  if (attachments.length > 0) {
    await Promise.all(
      attachments.map(async (file) => {
        const uploadResult = await uploadToCloudinary(file, file.name, 'support-attachments');
        await prisma.supportAttachment.create({
          data: {
            filename: file.name,
            fileUrl: uploadResult.secure_url,
            fileType: file.type,
            fileSize: file.size,
            ticketId,
            messageId: message.id,
            uploadedBy: session.user.id,
          },
        });
      })
    );
  }

  // Update ticket status if needed
  if (ticket.status === TicketStatus.WAITING_ON_CLIENT && !isInternal) {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: TicketStatus.IN_PROGRESS },
    });
  }

  // Log the activity
  await logSupportActivity({
    action: 'MESSAGE',
    ticketId: ticketId,
    userId: session.user.id,
    details: `Added message to support ticket: ${ticket.title}`,
  });

  return message;
}

/**
 * List support tickets with filtering and pagination
 */
export async function listSupportTickets(params: {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  userId?: string;
  assignedToId?: string;
  institutionId?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  tickets: SupportTicket[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}> {
  const {
    status,
    priority,
    category,
    userId,
    assignedToId,
    institutionId,
    search,
    page = 1,
    limit = 10,
  } = params;

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('Unauthorized: User must be logged in to list tickets');
  }

  // Build filter conditions
  const where: any = {};
  
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (category) where.category = category;
  if (userId) where.userId = userId;
  if (assignedToId) where.assignedToId = assignedToId;
  if (institutionId) where.institutionId = institutionId;
  
  // Search in title and description
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Apply role-based filtering
  const userRole = session.user.role;
  if (userRole === 'USER') {
    // Regular users can only see their own tickets or tickets from their institution
    const userInstitutions = await prisma.userInstitution.findMany({
      where: { userId: session.user.id },
      select: { institutionId: true },
    });
    
    const institutionIds = userInstitutions.map(ui => ui.institutionId);
    
    where.OR = [
      { createdBy: session.user.id },
      { institutionId: { in: institutionIds } },
    ];
  } else if (userRole === 'INSTITUTION') {
    // Institution users can only see tickets from their institution
    const userInstitution = await prisma.userInstitution.findFirst({
      where: { userId: session.user.id },
      select: { institutionId: true },
    });
    
    if (userInstitution) {
      where.institutionId = userInstitution.institutionId;
    }
  }
  // Admins can see all tickets

  // Get total count for pagination
  const total = await prisma.supportTicket.count({ where });

  // Get tickets with pagination
  const tickets = await prisma.supportTicket.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      institution: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          messages: true,
          attachments: true,
        },
      },
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    tickets,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Check if a user has access to a ticket
 */
async function checkTicketAccess(ticket: any, userId: string, requireAdmin = false) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userInstitutions: true,
    },
  });

  if (!user) return false;

  // Admins have access to all tickets
  if (user.role === 'ADMIN') return true;

  // If admin access is required, only admins can proceed
  if (requireAdmin && user.role !== 'ADMIN') return false;

  // Users can access their own tickets
  if (ticket.createdBy === userId) return true;

  // Institution users can access tickets from their institution
  if (user.role === 'INSTITUTION' && ticket.institutionId) {
    const userInstitution = user.userInstitutions.find(
      (ui) => ui.institutionId === ticket.institutionId
    );
    if (userInstitution) return true;
  }

  // Regular users can access tickets from their institution
  if (ticket.institutionId) {
    const userInstitution = user.userInstitutions.find(
      (ui) => ui.institutionId === ticket.institutionId
    );
    if (userInstitution) return true;
  }

  return false;
}

/**
 * Log support-related activities
 */
async function logSupportActivity({
  action,
  ticketId,
  userId,
  details,
  metadata,
}: {
  action: string;
  ticketId: string;
  userId: string;
  details: string;
  metadata?: any;
}) {
  await prisma.activityLog.create({
    data: {
      action: 'ADMIN_ACTION',
      category: 'ADMIN',
      details,
      metadata: {
        ...metadata,
        supportAction: action,
        ticketId,
      },
      userId,
      status: 'SUCCESS',
    },
  });
}

/**
 * Generate a reference ID for tickets
 */
function generateReferenceId() {
  const prefix = 'TKT';
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
} 