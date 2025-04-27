import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const certificate = await db.certificate.findUnique({
      where: { id: params.id },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    return NextResponse.json(certificate);
  } catch (error) {
    console.error('Error fetching certificate:', error);
    return NextResponse.json({ error: 'Failed to fetch certificate' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    
    // Extract form values
    const title = formData.get('title') as string;
    const institutionId = formData.get('institutionId') as string;
    const recipientName = formData.get('recipientName') as string;
    const recipientEmail = formData.get('recipientEmail') as string;
    const issueDate = formData.get('issueDate') as string;
    const expiryDate = formData.get('expiryDate') as string;
    const type = formData.get('type') as string;
    const status = formData.get('status') as string;
    const description = formData.get('description') as string;

    // Update certificate in database
    const updatedCertificate = await db.certificate.update({
      where: { id: params.id },
      data: {
        title,
        institutionId,
        recipientName,
        recipientEmail,
        issueDate: issueDate ? new Date(issueDate) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        type,
        status,
        description,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedCertificate);
  } catch (error) {
    console.error('Error updating certificate:', error);
    return NextResponse.json({ error: 'Failed to update certificate' }, { status: 500 });
  }
} 