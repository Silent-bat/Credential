"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { createCanvasFromDesign } from "@/lib/certificates/canvas-utils";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { createIOTATransaction, CertificateBlockchainData } from "@/lib/blockchain/iota";
import { LogAction, LogCategory, LogStatus } from "@prisma/client";
import crypto from "crypto";

export async function createCertificate(formData: FormData) {
  const session = await auth();
  
  // Ensure user is logged in
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }
  
  // Check if user has permission (admin or institution admin)
  if (!["ADMIN", "INSTITUTION"].includes(session.user.role)) {
    throw new Error('Not authorized');
  }
  
  // Extract form data
  const locale = formData.get('locale') as string;
  const certificateType = formData.get('certificateType') as string;
  const institutionId = formData.get('institutionId') as string;
  const title = formData.get('title') as string;
  const recipientName = formData.get('recipientName') as string;
  const recipientEmail = formData.get('recipientEmail') as string;
  const description = formData.get('description') as string || '';
  const issuedDate = formData.get('issuedDate') as string;
  const expirationDate = formData.get('expirationDate') as string || null;
  const storeOnBlockchain = formData.get('storeOnBlockchain') === 'on' || formData.get('storeOnBlockchain') === 'true';
  
  // Validate required fields
  if (!institutionId || !title || !recipientName || !recipientEmail || !issuedDate) {
    throw new Error('Missing required fields');
  }
  
  // Check if user has permission to create certificates for this institution
  const canAccessInstitution = await prisma.institutionUser.findFirst({
    where: {
      userId: session.user.id,
      institutionId,
      role: "ADMIN",
    },
  });
  
  if (session.user.role !== "ADMIN" && !canAccessInstitution) {
    throw new Error('Not authorized to create certificates for this institution');
  }
  
  // Generate a unique certificate ID
  const certificateId = uuidv4();
  
  // Variables for image handling
  let imageUrl = null;
  let imageBuffer = null;
  
  try {
    // Handle different certificate types
    if (certificateType === 'uploaded') {
      // Handle uploaded certificate
      const certificateImage = formData.get('certificateImage') as File;
      
      if (!certificateImage) {
        throw new Error('Certificate image is required');
      }
      
      // Upload image to database storage (previously Cloudinary)
      const uploadResult = await uploadToCloudinary(
        Buffer.from(await certificateImage.arrayBuffer()),
        certificateId,
        'certificates'
      );
      
      imageUrl = uploadResult.secure_url;
      imageBuffer = Buffer.from(await certificateImage.arrayBuffer());
      
    } else if (certificateType === 'designed') {
      // Handle designed certificate
      const designDataStr = formData.get('designData') as string;
      
      if (!designDataStr) {
        throw new Error('Design data is required');
      }
      
      const designData = JSON.parse(designDataStr);
      const logoFile = formData.get('logoFile') as File;
      
      // Get institution information for the logo
      const institution = await prisma.institution.findUnique({
        where: { id: institutionId },
        select: { logo: true },
      });
      
      // Create design options
      const designOptions = {
        certificateId,
        templateId: designData.templateId,
        title, 
        recipientName,
        recipientEmail,
        description,
        issuedDate,
        backgroundColor: designData.backgroundColor,
        textColor: designData.textColor,
        accentColor: designData.accentColor,
        fontSize: designData.fontSize,
        showBorder: designData.showBorder,
        fontFamily: designData.fontFamily,
        showLogo: designData.showLogo,
        borderColor: designData.borderColor,
        institutionId,
        logoUrl: logoFile ? await createDataURLFromFile(logoFile) : institution?.logo || null,
      };
      
      // Generate certificate from design
      const { buffer, dataUrl } = await createCanvasFromDesign(designOptions);
      
      // Upload to database storage (previously Cloudinary)
      const uploadResult = await uploadToCloudinary(buffer, certificateId, 'certificates');
      
      imageUrl = uploadResult.secure_url;
      imageBuffer = buffer;
    } else {
      throw new Error('Invalid certificate type');
    }
    
    // Create blockchain transaction if requested
    let blockchainTxId = null;
    let blockchainHash = null;
    
    if (storeOnBlockchain && imageBuffer) {
      try {
        // Get institution name for blockchain record
        const institution = await prisma.institution.findUnique({
          where: { id: institutionId },
          select: { name: true },
        });
        
        // Calculate hash of the image
        const hash = calculateHash(imageBuffer);
        
        // Create blockchain data
        const blockchainData: CertificateBlockchainData = {
          certificateId,
          title,
          recipientName,
          recipientEmail,
          issuedDate,
          institutionId,
          issuerName: institution?.name || 'Unknown Institution',
          issuerId: institutionId,
          imageHash: hash,
        };
        
        // Create blockchain transaction
        const transaction = await createIOTATransaction(blockchainData);
        blockchainTxId = transaction.transactionId;
        blockchainHash = hash;
      } catch (error) {
        console.error('Error storing on blockchain, continuing without blockchain:', error);
        // Continue without blockchain storage rather than failing
      }
    }
    
    // Create certificate in database
    const certificate = await prisma.certificate.create({
      data: {
        id: certificateId,
        title,
        recipientName,
        recipientEmail,
        description,
        issueDate: new Date(issuedDate),
        expiryDate: expirationDate ? new Date(expirationDate) : null,
        institutionId,
        fileUrl: imageUrl,
        blockchainTxId,
        blockchainHash,
        blockchainNetwork: storeOnBlockchain ? 'IOTA' : null,
        designType: certificateType.toUpperCase(),
        designData: certificateType === 'designed' ? formData.get('designData') as string : null,
        issuedByUserId: session.user.id,
        verificationId: uuidv4(),
      },
    });
    
    // Create activity log for successful creation
    await prisma.activityLog.create({
      data: {
        action: LogAction.CREATE,
        category: LogCategory.CERTIFICATE,
        status: LogStatus.SUCCESS,
        details: `Created certificate "${title}" for ${recipientName}`,
        userId: session.user.id,
        institutionId,
        certificateId: certificate.id,
        metadata: {
          certificateType,
          issuedDate,
          blockchainStored: storeOnBlockchain,
        },
      },
    });
    
    // Revalidate path to update certificate list
    revalidatePath(`/${locale}/dashboard/admin/certificates`);
    
    // Redirect to the certificate page
    redirect(`/${locale}/dashboard/admin/certificates/${certificate.id}`);
    
  } catch (error) {
    console.error('Error creating certificate:', error);
    
    // Log error
    await prisma.activityLog.create({
      data: {
        action: LogAction.CREATE,
        category: LogCategory.CERTIFICATE,
        status: LogStatus.FAILURE,
        details: `Failed to create certificate: ${(error as Error).message}`,
        userId: session.user.id,
        institutionId,
        metadata: {
          certificateType,
          error: (error as Error).message,
        },
      },
    });
    
    throw error;
  }
}

// Helper function to create data URL from file
async function createDataURLFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || 'application/octet-stream';
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

// Helper function to calculate SHA-256 hash of data
function calculateHash(data: Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
} 