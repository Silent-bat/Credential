import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canAccessAnalytics } from '@/lib/permissions';

// Maximum number of retries for database operations
const MAX_RETRIES = 3;

export async function GET(request: NextRequest) {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      // Get current session
      const session = await getServerSession(authOptions);
      
      if (!session) {
        return NextResponse.json(
          { hasAccess: false, message: "No active session found" },
          { status: 401 }
        );
      }

      if (!session.user) {
        return NextResponse.json(
          { hasAccess: false, message: "No user found in session" },
          { status: 401 }
        );
      }

      if (!session.user.id) {
        return NextResponse.json(
          { hasAccess: false, message: "User ID missing from session" },
          { status: 400 }
        );
      }
      
      // Check if user can access analytics
      const hasAccess = await canAccessAnalytics(session.user.id);
      
      return NextResponse.json({ 
        hasAccess,
        user: {
          id: session.user.id,
          role: session.user.role || "unknown",
          institutionId: session.user.institutionId || null
        }
      });
    } catch (error) {
      retries++;
      
      // If we've used all our retries, return an error
      if (retries >= MAX_RETRIES) {
        console.error(`Failed permission check after ${MAX_RETRIES} attempts:`, error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        
        // If this is a database connection error, provide a specific message
        const isConnectionError = errorMessage.includes('connection') || 
                                 errorMessage.includes('ECONNREFUSED') || 
                                 errorMessage.includes('timed out');
        
        return NextResponse.json(
          { 
            hasAccess: false, 
            error: isConnectionError ? 'Database Connection Error' : 'Internal Server Error', 
            message: isConnectionError ? 
              'Could not connect to the database. Please try again later.' : 
              'Failed to check analytics permissions',
            details: process.env.NODE_ENV === 'development' ? {
              message: errorMessage,
              stack: errorStack,
              retries: retries
            } : undefined
          },
          { status: isConnectionError ? 503 : 500 }
        );
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, retries) * 100;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Continue to next retry iteration
      continue;
    }
  }
  
  // We should never reach here, but just in case
  return NextResponse.json(
    { hasAccess: false, error: 'Unexpected Error', message: 'An unexpected error occurred' },
    { status: 500 }
  );
} 