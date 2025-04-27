import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a singleton instance of PrismaClient
const createPrismaClient = () => {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      // Default to a local PostgreSQL connection if not set
      process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/credential";
      console.warn("DATABASE_URL not set, using default PostgreSQL connection");
    }

    // Make sure it's a PostgreSQL connection
    if (!process.env.DATABASE_URL.startsWith('postgresql://')) {
      process.env.DATABASE_URL = process.env.DATABASE_URL.replace(/^.*:\/\//, 'postgresql://');
      console.warn("DATABASE_URL protocol updated to PostgreSQL");
    }

    return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        },
      },
    });
  } catch (error) {
    console.error("Failed to create Prisma client:", error);
    throw error;
  }
};

// Initialize the PrismaClient
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Save the client to the global object in development
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Export both 'prisma' and 'db' (as an alias) to support different import styles
export const db = prisma;
export default prisma; 