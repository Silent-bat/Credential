import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

// POST: Save a certificate template
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
    
    // Parse the request
    const data = await request.json();
    const { templateData, institutionId } = data;
    
    if (!templateData) {
      return NextResponse.json(
        { message: 'Template data is required' },
        { status: 400 }
      );
    }
    
    if (!institutionId) {
      return NextResponse.json(
        { message: 'Institution ID is required' },
        { status: 400 }
      );
    }
    
    // Check if the user has permission to save templates for this institution
    const institutionUser = await prisma.institutionUser.findFirst({
      where: {
        userId: session.user.id,
        institutionId: institutionId,
      },
    });
    
    if (!institutionUser && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'You do not have permission to save templates for this institution' },
        { status: 403 }
      );
    }
    
    // Check if a template with this ID already exists
    const existingTemplate = await prisma.fileStorage.findFirst({
      where: {
        name: `certificate-template-${templateData.id}`,
        folder: 'certificate-templates',
      },
    });
    
    let savedTemplate;
    
    if (existingTemplate) {
      // Update the existing template
      savedTemplate = await prisma.fileStorage.update({
        where: {
          id: existingTemplate.id,
        },
        data: {
          data: Buffer.from(JSON.stringify(templateData)),
          contentType: 'application/json',
          size: JSON.stringify(templateData).length,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create a new template
      savedTemplate = await prisma.fileStorage.create({
        data: {
          name: `certificate-template-${templateData.id}`,
          folder: 'certificate-templates',
          contentType: 'application/json',
          data: Buffer.from(JSON.stringify(templateData)),
          size: JSON.stringify(templateData).length,
        },
      });
    }
    
    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: 'CREATE',
        category: 'CERTIFICATE',
        details: `Saved certificate template: ${templateData.name}`,
        status: 'SUCCESS',
        userId: session.user.id,
        institutionId: institutionId,
      },
    });
    
    return NextResponse.json({
      message: 'Certificate template saved successfully',
      templateId: savedTemplate.id,
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error saving certificate template:', error);
    return NextResponse.json(
      { message: 'An error occurred while saving the certificate template' },
      { status: 500 }
    );
  }
}

// GET: Retrieve certificate templates
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
    const institutionId = url.searchParams.get('institutionId');
    
    if (!institutionId) {
      return NextResponse.json(
        { message: 'Institution ID is required' },
        { status: 400 }
      );
    }
    
    // Check if the user has permission to view templates for this institution
    const institutionUser = await prisma.institutionUser.findFirst({
      where: {
        userId: session.user.id,
        institutionId: institutionId,
      },
    });
    
    if (!institutionUser && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'You do not have permission to view templates for this institution' },
        { status: 403 }
      );
    }
    
    // Retrieve templates from storage
    const templates = await prisma.fileStorage.findMany({
      where: {
        folder: 'certificate-templates',
      },
    });
    
    // Convert Buffer data to JSON
    const parsedTemplates = templates.map(template => {
      try {
        return {
          id: template.id,
          name: template.name.replace('certificate-template-', ''),
          data: JSON.parse(template.data.toString()),
          updatedAt: template.updatedAt,
        };
      } catch (error) {
        console.error(`Error parsing template ${template.id}:`, error);
        return null;
      }
    }).filter(Boolean);
    
    return NextResponse.json({
      templates: parsedTemplates,
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error retrieving certificate templates:', error);
    return NextResponse.json(
      { message: 'An error occurred while retrieving certificate templates' },
      { status: 500 }
    );
  }
} 
 