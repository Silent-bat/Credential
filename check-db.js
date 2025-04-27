// Script to check database connection
const { PrismaClient } = require('@prisma/client');

// Set DATABASE_URL to PostgreSQL from .env file
process.env.DATABASE_URL = "postgresql://credential_owner:npg_LTKjmCv5lMw9@ep-blue-snow-a20y4y4g-pooler.eu-central-1.aws.neon.tech/credential?sslmode=require";
console.log("Using DATABASE_URL:", process.env.DATABASE_URL);

async function main() {
  console.log("Testing database connection...");
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      },
    },
  });
  
  try {
    // Test a simple query
    console.log("Executing query...");
    const result = await prisma.$executeRaw`SELECT 1 as test`;
    console.log("Database connection successful:", result);
    
    // Check if ActivityLog table exists
    try {
      const activeLogs = await prisma.activityLog.findMany({
        take: 1
      });
      console.log("ActivityLog table found and queried successfully");
    } catch (error) {
      console.error("Error querying ActivityLog table:", error);
    }
    
  } catch (error) {
    console.error("Database connection error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();