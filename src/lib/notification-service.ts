import prisma from '@/lib/db';
import { LogAction, LogCategory, LogStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configure nodemailer with environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send an email notification
 */
export async function sendEmailNotification({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // Only send if email is configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('Email notification not sent - SMTP not configured');
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'notifications@credentialsystem.com',
      to,
      subject,
      html,
    });
    console.log(`Email notification sent to ${to}`);
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
}

/**
 * Notify admins about suspicious verification activities
 */
export async function notifyAdminsOfSuspiciousActivity(log: any) {
  try {
    // Check if prisma is available
    if (!prisma) {
      console.error("Prisma client is not available, cannot send notifications");
      return;
    }
    
    // Find admin users to notify
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
      },
      select: {
        email: true,
      },
    });

    if (admins.length === 0) {
      console.log('No admin users found to notify');
      return;
    }

    // Create email content
    const subject = `🚨 Suspicious Activity Alert: ${log.action} - ${log.category}`;
    
    // Format time
    const time = new Date(log.createdAt).toLocaleString();
    
    // Format certificate info if available
    let certificateInfo = '';
    if (log.Certificate) {
      certificateInfo = `
        <h3>Certificate Information</h3>
        <p>Title: ${log.Certificate.title}</p>
        <p>Recipient: ${log.Certificate.recipientName} (${log.Certificate.recipientEmail})</p>
        <p>Verification ID: ${log.Certificate.verificationId}</p>
      `;
    }

    // Format user info if available
    let userInfo = '';
    if (log.User) {
      userInfo = `
        <h3>User Information</h3>
        <p>Name: ${log.User.name || 'N/A'}</p>
        <p>Email: ${log.User.email || 'N/A'}</p>
      `;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e53e3e;">Suspicious Activity Detected</h2>
        <p>The system has detected suspicious activity that requires your attention.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Event Details</h3>
          <p><strong>Action:</strong> ${log.action}</p>
          <p><strong>Category:</strong> ${log.category}</p>
          <p><strong>Status:</strong> ${log.status}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>IP Address:</strong> ${log.ipAddress || 'N/A'}</p>
          <p><strong>Details:</strong> ${log.details || 'No details provided'}</p>
        </div>
        
        ${certificateInfo}
        ${userInfo}
        
        <div style="margin-top: 30px;">
          <a href="${process.env.NEXTAUTH_URL}/admin/logs" style="background-color: #3182ce; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">View Activity Logs</a>
        </div>
        
        <p style="margin-top: 30px; font-size: 12px; color: #718096;">
          This is an automated notification from your Credential System. 
          Please do not reply to this email.
        </p>
      </div>
    `;

    // Send to all admins
    for (const admin of admins) {
      if (admin.email) {
        await sendEmailNotification({
          to: admin.email,
          subject,
          html,
        });
      }
    }
  } catch (error) {
    console.error('Failed to notify admins of suspicious activity:', error);
  }
}

/**
 * Check if a log event should trigger notifications
 */
export function shouldNotifyAdmins(log: any): boolean {
  // Notify on failed verification attempts
  if (
    log.action === LogAction.VERIFY && 
    log.status === LogStatus.FAILURE &&
    log.category === LogCategory.VERIFICATION
  ) {
    return true;
  }

  // Notify on multiple failed verification attempts from same IP (if available)
  if (
    log.action === LogAction.VERIFY &&
    log.ipAddress &&
    log.status === LogStatus.FAILURE
  ) {
    // This would need additional logic to check for multiple failures
    // from the same IP address in a short time period
    return false; // For now, handled by the above condition
  }

  // Notify on blockchain verification failures
  if (
    log.action === LogAction.BLOCKCHAIN_VERIFY && 
    log.status === LogStatus.FAILURE
  ) {
    return true;
  }

  // Add more notification rules as needed

  return false;
}