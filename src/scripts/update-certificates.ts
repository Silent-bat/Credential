import { PrismaClient } from '@prisma/client';
import { generateVerificationId } from "../lib/mock-iota";

const prisma = new PrismaClient();

async function main() {
  console.log('Starting certificate update...');

  // Get all certificates without verification IDs
  const certificates = await prisma.certificate.findMany({
    where: {
      verificationId: null
    }
  });

  console.log(`Found ${certificates.length} certificates without verification IDs`);

  // Update each certificate
  for (const certificate of certificates) {
    const verificationId = generateVerificationId();
    
    await prisma.certificate.update({
      where: {
        id: certificate.id
      },
      data: {
        verificationId
      }
    });
    
    console.log(`Updated certificate ${certificate.id} with verification ID: ${verificationId}`);
  }

  console.log('Certificate update completed');
}

main()
  .catch((e) => {
    console.error('Error updating certificates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 