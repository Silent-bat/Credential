const { PrismaClient, InstitutionType } = require('@prisma/client');

console.log('Available InstitutionType values:');
console.log(InstitutionType);

// This logs the exact enum values for comparison
// We'll use this to verify the type value that should be used in our code