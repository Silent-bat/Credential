const { PrismaClient, InstitutionType } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // First check existing institutions
    const existingInstitutions = await prisma.institution.findMany();
    console.log('Existing institutions:', existingInstitutions.length);
    
    // Try to create an institution with the same code from the register endpoint
    const newInstitution = await prisma.institution.create({
      data: {
        name: 'Test Institution Script',
        type: 'COMPANY',
        website: 'https://testinstitutionscript.com',
        address: '123 Script Street, Testville, TS 12345',
        phone: '+1 (555) 123-4567',
        status: 'PENDING',
      },
    });
    
    console.log('Institution created successfully:', newInstitution);
  } catch (error) {
    console.error('Error creating institution:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();