import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Generating migration for adding preferredLocale field to User model...');
    
    // Run the prisma migration command
    await execPromise('npx prisma migrate dev --name add_preferred_locale_to_user');
    
    console.log('Migration created and applied successfully.');
    
    // Update all existing users to have 'en' as their default locale
    console.log('Updating existing users to have "en" as their default locale...');
    
    const updatedCount = await prisma.user.updateMany({
      where: {
        preferredLocale: null
      },
      data: {
        preferredLocale: 'en'
      }
    });
    
    console.log(`Updated ${updatedCount.count} users.`);
    console.log('Migration complete!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 