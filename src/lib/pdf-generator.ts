import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import crypto from "crypto";

// Function to generate a PDF certificate
export async function generateCertificatePDF({
  title,
  recipientName,
  issueDate,
  expiryDate,
  institutionName,
  certificateId,
  verificationUrl,
}: {
  title: string;
  recipientName: string;
  issueDate: Date;
  expiryDate?: Date | null;
  institutionName: string;
  certificateId: string;
  verificationUrl: string;
}) {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Set background color
  doc.setFillColor(245, 245, 245);
  doc.rect(0, 0, 297, 210, "F");

  // Add a border
  doc.setDrawColor(50, 50, 50);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, 277, 190);

  // Add title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(44, 62, 80);
  doc.text(title, 148.5, 40, { align: "center" });

  // Add certificate text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(
    "This is to certify that",
    148.5,
    60,
    { align: "center" }
  );

  // Add recipient name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(recipientName, 148.5, 80, { align: "center" });

  // Add additional text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text(
    `has been issued this certificate by ${institutionName}`,
    148.5,
    100,
    { align: "center" }
  );

  // Add dates
  doc.setFontSize(12);
  doc.text(
    `Issue Date: ${issueDate.toLocaleDateString()}`,
    148.5,
    120,
    { align: "center" }
  );

  if (expiryDate) {
    doc.text(
      `Expiry Date: ${expiryDate.toLocaleDateString()}`,
      148.5,
      130,
      { align: "center" }
    );
  }

  // Add certificate ID
  doc.setFontSize(10);
  doc.text(
    `Certificate ID: ${certificateId}`,
    148.5,
    150,
    { align: "center" }
  );

  // Generate QR Code for verification
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
    doc.addImage(qrCodeDataUrl, "PNG", 20, 140, 40, 40);
    doc.setFontSize(8);
    doc.text("Scan to verify", 40, 185, { align: "center" });
  } catch (error) {
    console.error("Error generating QR code:", error);
  }

  // Add verification instructions
  doc.setFontSize(10);
  doc.text(
    `Verify this certificate at: ${verificationUrl}`,
    148.5,
    170,
    { align: "center" }
  );

  // Convert the PDF to a buffer
  const pdfBuffer = doc.output("arraybuffer");

  // Calculate the SHA-256 hash of the PDF
  const hash = crypto
    .createHash("sha256")
    .update(Buffer.from(pdfBuffer))
    .digest("hex");

  // Return the PDF as a base64 string and its hash
  return {
    pdfBase64: Buffer.from(pdfBuffer).toString("base64"),
    pdfHash: hash,
  };
} 