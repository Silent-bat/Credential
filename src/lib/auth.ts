import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth";

// Re-export authOptions for backward compatibility
export { authOptions };

/**
 * Helper function to check if a user is authenticated in API routes
 * @returns The authenticated user or null
 */
export async function getAuthUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

/**
 * Helper function to check if a user is authenticated and has admin role
 * @returns The authenticated admin user or null
 */
export async function getAuthAdmin() {
  const user = await getAuthUser();
  if (user && user.role === "ADMIN") {
    return user;
  }
  return null;
}

/**
 * Middleware to check if a user is authenticated
 * @param handler The handler function to execute if authenticated
 */
export function withAuth(handler: (req: NextRequest, user: any) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const user = await getAuthUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    return handler(req, user);
  };
}

/**
 * Middleware to check if a user is an admin
 * @param handler The handler function to execute if the user is an admin
 */
export function withAdmin(handler: (req: NextRequest, user: any) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const user = await getAuthAdmin();
    
    if (!user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    return handler(req, user);
  };
}

/**
 * Get the user's ID from the session
 * @returns The user ID or null
 */
export async function getUserId() {
  const user = await getAuthUser();
  return user?.id || null;
} 