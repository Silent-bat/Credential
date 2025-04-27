import { NextRequest, NextResponse } from 'next/server';
import { storeFile } from '@/lib/file-storage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';
    
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
    
    // Store the file in the database
    const storedFile = await storeFile(file, file.name, file.type, folder);
    
    // Add a URL property to match the expected format
    const fileWithUrl = {
      ...storedFile,
      url: `/api/file/${storedFile.id}`,
      secure_url: `/api/file/${storedFile.id}`
    };
    
    return NextResponse.json(
      { 
        message: 'File uploaded successfully',
        file: fileWithUrl
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