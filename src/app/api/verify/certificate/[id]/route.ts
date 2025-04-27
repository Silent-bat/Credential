import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Properly await the params to avoid warnings
    params = await Promise.resolve(params);
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
          where: { id },
        });
    
    if (!certificate) {
      return NextResponse.json(
        { message: 'Certificate not found' },
        { status: 404 }
      );
    }
    
    // Return the certificate data
    return NextResponse.json(
      { 
        message: 'Certificate found',
        certificate: certificate 
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error retrieving certificate:', error);
    return NextResponse.json(
      { message: 'An error occurred while retrieving the certificate' },
      { status: 500 }
    );
  }
} 