import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { message: 'File is required' },
        { status: 400 }
      );
    }
    
    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }
    
    // Get the file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'json'];
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { message: 'Invalid file type. Allowed: PDF, JPG, PNG, JSON' },
        { status: 400 }
      );
    }
    
    // Generate a unique verification ID
    const verificationId = randomUUID();
    
    // Read the file as an ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    
    // Create the certificate record in the database
    const certificate = await prisma.certificate.create({
      data: {
        verificationId,
        name: file.name,
        contentType: file.type,
        size: file.size,
        file: Buffer.from(fileBuffer),
        status: 'PENDING_VERIFICATION',
        uploadDate: new Date(),
      },
    });
    
    // Return the certificate data without the binary file content
    const { file: _, ...certificateData } = certificate;
    
    return NextResponse.json(
      { 
        message: 'File uploaded successfully',
        certificate: certificateData 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { message: 'An error occurred while uploading the file' },
      { status: 500 }
    );
  }
} 