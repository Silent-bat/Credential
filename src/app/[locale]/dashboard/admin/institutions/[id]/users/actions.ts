"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function removeUserFromInstitution(
  institutionId: string,
  userId: string,
  locale: string
) {
  const session = await auth();
  const user = session?.user;

  // Authorization check
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    // Delete the association
    await db.institutionUser.delete({
      where: {
        userId_institutionId: {
          userId,
          institutionId,
        },
      },
    });

    // Revalidate the institution's users page to reflect changes
    revalidatePath(`/${locale}/dashboard/admin/institutions/${institutionId}/users`);
    
    return { success: true, message: "User removed from institution successfully" };
  } catch (error: any) {
    console.error("Error removing user from institution:", error);
    return { success: false, message: error.message || "Failed to remove user from institution" };
  }
}

export async function updateUserInstitutionRole(
  institutionId: string,
  userId: string,
  role: "ADMIN" | "MEMBER",
  locale: string
) {
  const session = await auth();
  const user = session?.user;

  // Authorization check
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    // Update the role
    await db.institutionUser.update({
      where: {
        userId_institutionId: {
          userId,
          institutionId,
        },
      },
      data: {
        role,
      },
    });

    // Revalidate the institution's users page to reflect changes
    revalidatePath(`/${locale}/dashboard/admin/institutions/${institutionId}/users`);
    
    return { success: true, message: "User role updated successfully" };
  } catch (error: any) {
    console.error("Error updating user role:", error);
    return { success: false, message: error.message || "Failed to update user role" };
  }
}