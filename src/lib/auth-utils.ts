import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import crypto from "crypto";
import { Role } from "@prisma/client";

// Register a new user (only accessible by admins and institutions)
export async function registerUser({
  email,
  password,
  name,
  role,
  institutionIds,
}: {
  email: string;
  password: string;
  name?: string;
  role: Role;
  institutionIds?: string[];
}) {
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
    },
  });

  // If institution IDs are provided, link the user to these institutions
  if (institutionIds && institutionIds.length > 0) {
    await Promise.all(
      institutionIds.map((institutionId) =>
        prisma.InstitutionUser.create({
          data: {
            userId: user.id,
            institutionId,
          },
        })
      )
    );
  }

  return user;
}

// Generate a password reset token
export async function generatePasswordResetToken(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Generate a random token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

  // Save the token in the database
  await prisma.passwordReset.upsert({
    where: { userId: user.id },
    update: {
      token,
      expiresAt,
    },
    create: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  return token;
}

// Reset password using token
export async function resetPassword(token: string, newPassword: string) {
  const passwordReset = await prisma.passwordReset.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!passwordReset) {
    throw new Error("Invalid token");
  }

  if (passwordReset.expiresAt < new Date()) {
    throw new Error("Token expired");
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the user's password
  await prisma.user.update({
    where: { id: passwordReset.userId },
    data: { password: hashedPassword },
  });

  // Delete the password reset token
  await prisma.passwordReset.delete({
    where: { id: passwordReset.id },
  });

  return true;
}

// Get the current session user
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

// Check if the current user has required role
export async function checkUserRole(requiredRole: Role) {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }
  
  // Admin can access all roles
  if (user.role === "ADMIN") {
    return true;
  }
  
  // Check if user has the required role
  return user.role === requiredRole;
}

// Check if a user belongs to an institution
export async function checkUserInstitution(userId: string, institutionId: string) {
  const institutionUser = await prisma.InstitutionUser.findUnique({
    where: {
      userId_institutionId: {
        userId,
        institutionId,
      },
    },
  });
  
  return !!institutionUser;
} 