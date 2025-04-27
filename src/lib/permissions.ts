import { db } from './db';

/**
 * Check if a user has access to an institution
 * 
 * @param userId The ID of the user
 * @param institutionId The ID of the institution to check access for
 * @returns true if the user has access, false otherwise
 */
export async function canAccessInstitution(userId: string, institutionId: string): Promise<boolean> {
  try {
    // First, check if the user exists and get their role
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
        institutionUsers: {
          where: {
            institutionId: institutionId
          },
          select: {
            id: true
          }
        }
      },
    });

    // If user is not found, they don't have access
    if (!user) {
      return false;
    }

    // If user is an admin, they have access to all institutions
    if (user.role === 'ADMIN') {
      return true;
    }

    // Check if user is associated with this institution
    return user.institutionUsers.length > 0;
  } catch (error) {
    console.error('Error checking institution access:', error);
    // Default to no access on error for security
    return false;
  }
}

/**
 * Check if a user can manage certificates
 * 
 * @param userId The ID of the user
 * @returns true if the user can manage certificates, false otherwise
 */
export async function canManageCertificates(userId: string): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });

    if (!user) {
      return false;
    }

    // Admin and institution managers can manage certificates
    return ['ADMIN', 'INSTITUTION_MANAGER'].includes(user.role);
  } catch (error) {
    console.error('Error checking certificate management permission:', error);
    return false;
  }
}

/**
 * Check if a user can access analytics
 * 
 * @param userId The ID of the user
 * @returns true if the user can access analytics, false otherwise
 */
export async function canAccessAnalytics(userId: string): Promise<boolean> {
  try {
    // First try to get just the role
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { 
        role: true,
        institutionUsers: {
          select: {
            role: true,
            institution: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return false;
    }

    // System admins always have access
    if (user.role === 'ADMIN') {
      return true;
    }

    // Check if user is an institution admin or staff
    if (user.institutionUsers && user.institutionUsers.length > 0) {
      // Institution admin or staff have access
      return user.institutionUsers.some(iu => 
        iu.role === 'ADMIN' || // Institution admin
        iu.role === 'STAFF' || // Institution staff
        iu.role === 'MANAGER' // Institution manager
      );
    }

    return false;
  } catch (error) {
    console.error('Error checking analytics access permission:', error);
    return false;
  }
}

/**
 * Check if a user can manage users
 * 
 * @param userId The ID of the user
 * @returns true if the user can manage users, false otherwise
 */
export async function canManageUsers(userId: string): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });

    if (!user) {
      return false;
    }

    // Only admins and institution managers can manage users
    return ['ADMIN', 'INSTITUTION_MANAGER'].includes(user.role);
  } catch (error) {
    console.error('Error checking user management permission:', error);
    return false;
  }
} 