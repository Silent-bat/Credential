import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Certificate } from '@prisma/client';
import { resolve } from 'path';
import prisma from '@/lib/db';

// Define type for design options
export type CertificateDesignOptions = {
  certificateId: string;
  templateId: string;
  title: string;
  recipientName: string;
  recipientEmail: string;
  description?: string;
  issuedDate: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontSize: number;
  showBorder: boolean;
  borderColor: string;
  fontFamily: string;
  showLogo: boolean;
  logoUrl?: string | null;
  institutionId: string;
};

/**
 * Create a canvas from the certificate design options
 */
export async function createCanvasFromDesign(options: CertificateDesignOptions): Promise<{ buffer: Buffer; dataUrl: string }> {
  // Create canvas with standard dimensions (1754 x 1240 = A4 landscape at 150 DPI)
  const canvas = createCanvas(1754, 1240);
  const ctx = canvas.getContext('2d');
  
  // Set background
  ctx.fillStyle = options.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add border if requested
  if (options.showBorder) {
    ctx.strokeStyle = options.borderColor;
    ctx.lineWidth = 16;
    ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);
  }
  
  // Set text properties
  ctx.fillStyle = options.textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${options.fontSize + 10}px ${options.fontFamily}`;
  
  // Calculate positions
  const centerX = canvas.width / 2;
  const startY = options.showLogo ? 240 : 180;
  let currentY = startY;
  
  // Add logo if needed
  if (options.showLogo && options.logoUrl) {
    try {
      // Load logo from URL or data URL
      const logo = await loadImage(options.logoUrl);
      
      // Calculate logo size and position (max height 120px, maintain aspect ratio)
      const maxLogoHeight = 120;
      const logoRatio = logo.width / logo.height;
      const logoHeight = Math.min(maxLogoHeight, logo.height);
      const logoWidth = logoHeight * logoRatio;
      
      // Draw logo centered at the top
      ctx.drawImage(
        logo, 
        centerX - logoWidth / 2, 
        currentY - 100, 
        logoWidth, 
        logoHeight
      );
      
      currentY += 40; // Add space after logo
    } catch (error) {
      console.error('Error loading logo:', error);
      // Continue without logo if there's an error
    }
  }
  
  // Draw certificate title
  ctx.font = `bold ${options.fontSize + 24}px ${options.fontFamily}`;
  ctx.fillText(options.title, centerX, currentY);
  currentY += 80;
  
  // Draw decorative line
  ctx.fillStyle = options.accentColor;
  ctx.fillRect(centerX - 150, currentY, 300, 4);
  currentY += 60;
  
  // Draw "awarded to" text
  ctx.fillStyle = options.textColor;
  ctx.font = `${options.fontSize + 4}px ${options.fontFamily}`;
  ctx.fillText('This certificate is awarded to', centerX, currentY);
  currentY += 60;
  
  // Draw recipient name
  ctx.font = `bold ${options.fontSize + 16}px ${options.fontFamily}`;
  ctx.fillText(options.recipientName, centerX, currentY);
  currentY += 60;
  
  // Draw email
  ctx.font = `${options.fontSize}px ${options.fontFamily}`;
  ctx.fillText(options.recipientEmail, centerX, currentY);
  currentY += 80;
  
  // Draw description
  if (options.description) {
    ctx.font = `${options.fontSize}px ${options.fontFamily}`;
    
    // Handle multiline description
    const maxWidth = 800;
    const words = options.description.split(' ');
    let line = '';
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, centerX, currentY);
        line = words[i] + ' ';
        currentY += options.fontSize * 1.5;
      } else {
        line = testLine;
      }
    }
    
    ctx.fillText(line, centerX, currentY);
    currentY += 80;
  }
  
  // Draw issue date
  ctx.font = `${options.fontSize - 2}px ${options.fontFamily}`;
  const dateText = `Issued on: ${new Date(options.issuedDate).toLocaleDateString()}`;
  ctx.fillText(dateText, centerX, currentY);
  
  // Add certificate ID at the bottom right
  ctx.font = `${options.fontSize - 4}px ${options.fontFamily}`;
  ctx.textAlign = 'right';
  ctx.fillText(`Certificate ID: ${options.certificateId}`, canvas.width - 60, canvas.height - 40);
  
  // Convert canvas to buffer and data URL
  const buffer = canvas.toBuffer('image/png');
  const dataUrl = canvas.toDataURL('image/png');
  
  return { buffer, dataUrl };
}

/**
 * Calculates SHA-256 hash of the provided buffer
 * @param buffer Buffer to calculate hash for
 * @returns Hex string of the hash
 */
export function calculateHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
} 