import { auth } from '@/auth';

/**
 * Get the current authenticated user
 * @returns The user from the session or null if not authenticated
 */
export async function getUser() {
  const session = await auth();
  return session?.user || null;
}

/**
 * Check if the current user is authenticated
 * @returns True if the user is authenticated, false otherwise
 */
export async function isAuthenticated() {
  const user = await getUser();
  return !!user;
}

/**
 * Check if the current user is an admin
 * @returns True if the user is an admin, false otherwise
 */
export async function isAdmin() {
  const user = await getUser();
  return user?.role === 'ADMIN';
} 