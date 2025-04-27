import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Certificate ID is required' },
        { status: 400 }
      );
    }
    
    // Check if ID is a verification ID or regular ID
    const isVerificationId = id.includes('-'); // UUIDs contain hyphens
    
    // Query the database based on the type of ID
    const certificate = isVerificationId
      ? await prisma.certificate.findUnique({
          where: { verificationId: id },
        })
      : await prisma.certificate.findUnique({
          where: { id: Number(id) },
        });
    
    if (!certificate) {
      return NextResponse.json(
        { message: 'Certificate not found' },
        { status: 404 }
      );
    }
    
    // If file is not found in the database
    if (!certificate.file) {
      return NextResponse.json(
        { message: 'Certificate file not found' },
        { status: 404 }
      );
    }
    
    // Set the appropriate content type based on the file
    const contentType = certificate.contentType || 'application/octet-stream';
    
    // Create a response with the file content
    const response = new NextResponse(certificate.file, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${certificate.name}"`,
      },
    });
    
    return response;
    
  } catch (error) {
    console.error('Error downloading certificate:', error);
    return NextResponse.json(
      { message: 'An error occurred while downloading the certificate' },
      { status: 500 }
    );
  }
} 