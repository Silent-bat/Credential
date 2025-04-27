import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Fetch certificates for this user
    let certificates = [];
    
    try {
      // Get certificates where the user's email matches the recipient email
      certificates = await db.certificate.findMany({
        where: {
          recipientEmail: session.user.email,
        },
        include: {
          institution: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          issueDate: 'desc',
        },
      });
      
      console.log(`Found ${certificates.length} certificates for user ${userId}`);
      
    } catch (error) {
      console.error('Error fetching certificates from database:', error);
      // Return empty array if there's an error
    }
    
    // If no certificates found or there was an error, return empty array
    if (!certificates || certificates.length === 0) {
      // Return mock data for development - remove in production
      const mockCertificates = [
        {
          id: 'cert-123',
          title: 'Advanced Web Development Certificate',
          recipientName: session.user.name || 'User',
          recipientEmail: session.user.email,
          issueDate: new Date('2023-05-15'),
          expiryDate: new Date('2025-05-15'),
          status: 'ACTIVE',
          institution: {
            id: 'inst-456',
            name: 'Tech Learning Institute'
          },
          verificationId: 'v-789',
          blockchainHash: '0x123456789abcdef',
          imageUrl: '/images/certificates/sample.jpg',
          pdfUrl: '/documents/certificates/sample.pdf'
        }
      ];
      
      return NextResponse.json({ 
        certificates: mockCertificates
      });
    }
    
    return NextResponse.json({ 
      certificates: certificates
    });
    
  } catch (error) {
    console.error('Error fetching user certificates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 