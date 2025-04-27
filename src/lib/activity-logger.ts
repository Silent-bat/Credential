import prisma from '@/lib/db';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { shouldNotifyAdmins, notifyAdminsOfSuspiciousActivity } from './notification-service';
import { LogAction, LogCategory, LogStatus } from '@prisma/client';

// Export the enums for use in other files
export { LogAction, LogCategory, LogStatus };

type LogActivityProps = {
  action: LogAction;
  category: LogCategory;
  details?: string;
  metadata?: any;
  status?: LogStatus;
  userId?: string;
  institutionId?: string;
  certificateId?: string;
  request?: NextRequest;
};

/**
 * Logs an activity in the system
 * This function can be used throughout the application to track events
 */
export async function logActivity({
  action,
  category,
  details,
  metadata,
  status = LogStatus.SUCCESS,
  userId,
  institutionId,
  certificateId,
  request,
}: LogActivityProps) {
  try {
    // Make sure prisma is initialized
    if (!prisma) {
      console.error("Prisma client is not available, cannot log activity");
      return null;
    }

    // Extract IP and user agent if request is provided
    let ipAddress: string | undefined;
    let userAgent: string | undefined;
    
    if (request) {
      ipAddress = request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  '127.0.0.1';
      
      userAgent = request.headers.get('user-agent') || undefined;
    }

    // If userId is not provided, try to get it from the session
    if (!userId && request) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        userId = session.user.id;
      }
    }

    // Create the activity log
    const activityLog = await prisma.activityLog.create({
      data: {
        action,
        category,
        details,
        metadata, // Prisma will handle JSON serialization
        status,
        ipAddress,
        userAgent,
        userId,
        institutionId,
        certificateId,
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        Certificate: {
          select: {
            id: true,
            title: true,
            recipientName: true,
            recipientEmail: true,
          },
        },
        Institution: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Check if this activity should trigger admin notifications
    if (shouldNotifyAdmins(activityLog)) {
      // Run notification in the background to not block the main flow
      notifyAdminsOfSuspiciousActivity(activityLog).catch(error => {
        console.error('Error sending notification:', error);
      });
    }

    return activityLog;
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw the error - logging should not disrupt the main application flow
    return null;
  }
}

/**
 * Utility function to log certificate verifications
 */
export async function logCertificateVerification({
  certificateId,
  institutionId,
  userId,
  success,
  details,
  metadata,
  request,
}: {
  certificateId: string;
  institutionId: string;
  userId?: string;
  success: boolean;
  details?: string;
  metadata?: any;
  request?: NextRequest;
}) {
  return logActivity({
    action: LogAction.VERIFY,
    category: LogCategory.VERIFICATION,
    status: success ? LogStatus.SUCCESS : LogStatus.FAILURE,
    certificateId,
    institutionId,
    userId,
    details,
    metadata,
    request,
  });
}

/**
 * Utility function to log blockchain operations
 */
export async function logBlockchainOperation({
  action,
  certificateId,
  institutionId,
  userId,
  success,
  details,
  metadata,
  request,
}: {
  action: 'VERIFY' | 'UPLOAD';
  certificateId: string;
  institutionId: string;
  userId?: string;
  success: boolean;
  details?: string;
  metadata?: any;
  request?: NextRequest;
}) {
  return logActivity({
    action: action === 'VERIFY' ? LogAction.BLOCKCHAIN_VERIFY : LogAction.BLOCKCHAIN_UPLOAD,
    category: LogCategory.BLOCKCHAIN,
    status: success ? LogStatus.SUCCESS : LogStatus.FAILURE,
    certificateId,
    institutionId,
    userId,
    details,
    metadata,
    request,
  });
}

/**
 * Utility function to log admin actions
 */
export async function logAdminAction({
  action,
  category,
  userId,
  details,
  metadata,
  request,
  institutionId,
  certificateId,
}: {
  action: LogAction;
  category: LogCategory;
  userId: string;
  details?: string;
  metadata?: any;
  request?: NextRequest;
  institutionId?: string;
  certificateId?: string;
}) {
  return logActivity({
    action,
    category,
    userId,
    details,
    metadata,
    request,
    institutionId,
    certificateId,
    status: LogStatus.INFO,
  });
} 