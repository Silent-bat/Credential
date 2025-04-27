const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Look for all institutions with 'Test' in the name
    const testInstitutions = await prisma.institution.findMany({
      where: {
        name: {
          contains: 'Test',
          mode: 'insensitive' // Case insensitive search
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${testInstitutions.length} institutions with 'Test' in the name:`);
    testInstitutions.forEach(inst => {
      console.log(`- ${inst.name} (${inst.type}, created: ${inst.createdAt})`);
    });

    // Also check the InstitutionUser table to see if any relationships were created
    const institutionUsers = await prisma.institutionUser.findMany({
      include: {
        user: true,
        institution: true
      }
    });
    
    console.log(`\nFound ${institutionUsers.length} institution-user relationships:`);
    institutionUsers.forEach(relation => {
      console.log(`- User: ${relation.user.email} is ${relation.role} of ${relation.institution.name}`);
    });
  } catch (error) {
    console.error('Error checking test institutions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();