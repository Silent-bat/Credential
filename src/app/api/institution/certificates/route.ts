import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { randomUUID } from 'crypto';
import { generateCertificatePDF } from '@/lib/pdf-generator';

// POST: Create a new certificate
export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get form data
    const formData = await request.formData();
    
    // Extract certificate information
    const title = formData.get('title') as string;
    const recipientName = formData.get('recipientName') as string;
    const recipientEmail = formData.get('recipientEmail') as string;
    const issueDate = new Date(formData.get('issueDate') as string);
    const expiryDate = formData.get('expiryDate') 
      ? new Date(formData.get('expiryDate') as string) 
      : null;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const file = formData.get('file') as File;
    const institutionId = formData.get('institutionId') as string || session.user.institutionId;
    
    // Validate required fields
    if (!title || !recipientName || !recipientEmail || !issueDate || !institutionId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user has permission for this institution
    const institutionUser = await prisma.institutionUser.findFirst({
      where: {
        userId: session.user.id,
        institutionId: institutionId,
      },
    });
    
    if (!institutionUser && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'You do not have permission to create certificates for this institution' },
        { status: 403 }
      );
    }
    
    // Generate a verification ID
    const verificationId = randomUUID();
    
    // Get institution name for PDF generation
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
    });
    
    if (!institution) {
      return NextResponse.json(
        { message: 'Institution not found' },
        { status: 404 }
      );
    }
    
    // Generate PDF if no file is provided
    let pdfBase64 = null;
    let pdfHash = null;
    
    if (!file) {
      // Create verification URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const verificationUrl = `${baseUrl}/verify/${verificationId}`;
      
      // Generate PDF
      const pdfResult = await generateCertificatePDF({
        title,
        recipientName,
        issueDate,
        expiryDate,
        institutionName: institution.name,
        certificateId: verificationId,
        verificationUrl,
      });
      
      pdfBase64 = pdfResult.pdfBase64;
      pdfHash = pdfResult.pdfHash;
    }
    
    // Create certificate in the database
    const certificate = await prisma.certificate.create({
      data: {
        title,
        recipientName,
        recipientEmail,
        issueDate,
        expiryDate,
        description,
        type,
        verificationId,
        institutionId,
        status: 'ISSUED',
        pdfHash,
        issuedByUserId: session.user.id,
        ...(pdfBase64 && { pdfUrl: `data:application/pdf;base64,${pdfBase64}` }),
      },
    });
    
    // If a file was uploaded, store it
    if (file) {
      const fileBuffer = await file.arrayBuffer();
      
      await prisma.fileStorage.create({
        data: {
          name: `certificate-${certificate.id}`,
          contentType: file.type,
          size: file.size,
          folder: 'certificates',
          data: Buffer.from(fileBuffer),
        },
      });
    }
    
    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: 'CREATE',
        category: 'CERTIFICATE',
        details: `Created certificate: ${title} for ${recipientName}`,
        status: 'SUCCESS',
        userId: session.user.id,
        institutionId,
        certificateId: certificate.id,
      },
    });
    
    return NextResponse.json({
      message: 'Certificate created successfully',
      certificate: {
        id: certificate.id,
        title: certificate.title,
        recipientName: certificate.recipientName,
        verificationId: certificate.verificationId,
      },
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating certificate:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the certificate' },
      { status: 500 }
    );
  }
}

// GET: List certificates
export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const institutionId = url.searchParams.get('institutionId') || session.user.institutionId;
    
    if (!institutionId) {
      // If no institutionId, try to find it from the database
      const userInstitution = await prisma.institutionUser.findFirst({
        where: {
          userId: session.user.id,
        },
        select: {
          institutionId: true,
        },
      });
      
      if (!userInstitution) {
        return NextResponse.json(
          { message: 'Institution ID is required, and no institution was found for this user' },
          { status: 400 }
        );
      }
      
      // Found an institution for this user
      const foundInstitutionId = userInstitution.institutionId;
      
      // Get certificates for this institution
      const certificates = await prisma.certificate.findMany({
        where: {
          institutionId: foundInstitutionId,
        },
        orderBy: {
          issueDate: 'desc',
        },
      });
      
      return NextResponse.json({
        certificates,
      }, { status: 200 });
    }
    
    // Check if user has permission for this institution or is admin
    if (session.user.role !== 'ADMIN') {
      const institutionUser = await prisma.institutionUser.findFirst({
        where: {
          userId: session.user.id,
          institutionId,
        },
      });
      
      if (!institutionUser) {
        return NextResponse.json(
          { message: 'You do not have permission to view certificates for this institution' },
          { status: 403 }
        );
      }
    }
    
    // Get certificates for this institution
    const certificates = await prisma.certificate.findMany({
      where: {
        institutionId,
      },
      orderBy: {
        issueDate: 'desc',
      },
    });
    
    return NextResponse.json({
      certificates,
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error retrieving certificates:', error);
    return NextResponse.json(
      { message: 'An error occurred while retrieving certificates' },
      { status: 500 }
    );
  }
} 