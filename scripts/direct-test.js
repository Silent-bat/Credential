const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// This function mimics the mapInstitutionType function from register.ts
function mapInstitutionType(type) {
  const validTypes = [
    'UNIVERSITY', 
    'COLLEGE', 
    'SCHOOL', 
    'TRAINING_CENTER', 
    'COMPANY', 
    'GOVERNMENT', 
    'NONPROFIT',
    'OTHER'
  ];
  
  const typeMap = {
    'university': 'UNIVERSITY',
    'college': 'COLLEGE',
    'school': 'SCHOOL',
    'training': 'TRAINING_CENTER',
    'trainingcenter': 'TRAINING_CENTER',
    'training_center': 'TRAINING_CENTER',
    'trainingCenter': 'TRAINING_CENTER',
    'company': 'COMPANY',
    'government': 'GOVERNMENT',
    'nonprofit': 'NONPROFIT',
    'other': 'OTHER'
  };

  // Check if the type is a valid enum value
  if (validTypes.includes(type)) {
    return type;
  }

  // Try to map from lowercase version
  const normalizedType = type.toLowerCase();
  return typeMap[normalizedType] || 'OTHER';
}

async function main() {
  try {
    const institution = {
      name: 'Direct Test Institution',
      type: 'COMPANY',
      website: 'https://directtest.com',
      address: '123 Direct Test Street',
      phone: '+1 (555) 123-4567'
    };
    
    console.log('Institution data:', institution);
    
    const institutionType = institution.type 
      ? mapInstitutionType(institution.type)
      : 'UNIVERSITY';
      
    console.log('Mapped institution type:', institutionType);
    
    const newInstitution = await prisma.institution.create({
      data: {
        name: institution.name,
        type: institutionType,
        website: institution.website || null,
        address: institution.address || null,
        phone: institution.phone || null,
        status: 'PENDING',
      },
    });
    
    console.log('Institution created successfully:', newInstitution);
    
    const allInstitutions = await prisma.institution.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
    
    console.log('Recent 5 institutions:');
    allInstitutions.forEach(inst => {
      console.log(`- ${inst.name} (${inst.type}, created: ${inst.createdAt})`);
    });
  } catch (error) {
    console.error('Error in direct test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();