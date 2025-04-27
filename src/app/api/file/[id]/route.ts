import { NextRequest, NextResponse } from 'next/server';
import { getFile } from '@/lib/file-storage';

/**
 * API route to retrieve a file from database storage
 * Handles GET requests to /api/file/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Properly await the params to avoid warnings
    params = await Promise.resolve(params);
    const fileId = params.id;
    
    if (!fileId) {
      return NextResponse.json(
        { message: 'File ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the file from the database
    const file = await getFile(fileId);
    
    if (!file || !file.data) {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      );
    }

    // Create response with the file data
    const response = new NextResponse(file.data);
    
    // Set appropriate headers
    response.headers.set('Content-Type', file.contentType || 'application/octet-stream');
    response.headers.set('Content-Disposition', `inline; filename="${file.name}"`);
    
    return response;
  } catch (error) {
    console.error('Error retrieving file:', error);
    return NextResponse.json(
      { message: 'An error occurred while retrieving the file' },
      { status: 500 }
    );
  }
} 