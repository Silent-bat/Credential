"use server";

import prisma from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

// Form validation schema
const FormSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]),
  name: z.string().optional(),
  institutionId: z.string(),
  locale: z.string(),
});

export async function addUserToInstitution(formData: FormData) {
  const session = await auth();
  const user = session?.user;

  // Authorization check - must be logged in and have an institution role
  if (!user || !user.role?.toUpperCase()?.includes('INSTITUTION')) {
    throw new Error("Unauthorized");
  }

  // Parse and validate form data
  const validatedFields = FormSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
    name: formData.get("name"),
    institutionId: formData.get("institutionId"),
    locale: formData.get("locale"),
  });

  if (!validatedFields.success) {
    console.error("Validation error:", validatedFields.error);
    throw new Error("Invalid form data");
  }

  const { email, role, name, institutionId, locale } = validatedFields.data;

  try {
    // Verify that the user is an admin of this institution
    const institutionUser = await prisma.institutionUser.findFirst({
      where: {
        userId: user.id,
        institutionId: institutionId,
        role: "ADMIN",
      },
    });

    if (!institutionUser) {
      throw new Error("You are not authorized to add users to this institution");
    }

    // Check if the institution exists
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) {
      throw new Error("Institution not found");
    }

    // Check if the user already exists
    let existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // If user doesn't exist and we've provided a name, create a new user
    if (!existingUser && name) {
      existingUser = await prisma.user.create({
        data: {
          email,
          name,
          role: "USER", // Regular user role
        },
      });
    } else if (!existingUser) {
      // If user doesn't exist and no name provided, we can't proceed
      throw new Error("User doesn't exist. Please provide a name to create a new user.");
    }

    // Check if the user is already associated with the institution
    const existingAssociation = await prisma.institutionUser.findUnique({
      where: {
        userId_institutionId: {
          userId: existingUser.id,
          institutionId,
        },
      },
    });

    if (existingAssociation) {
      // Update the existing association
      await prisma.institutionUser.update({
        where: {
          userId_institutionId: {
            userId: existingUser.id,
            institutionId,
          },
        },
        data: {
          role,
        },
      });
    } else {
      // Create a new association
      await prisma.institutionUser.create({
        data: {
          userId: existingUser.id,
          institutionId,
          role,
        },
      });
    }

    // Revalidate the users page to reflect changes
    revalidatePath(`/${locale}/dashboard/institution/users`);
    
    // Redirect back to the users page
    redirect(`/${locale}/dashboard/institution/users`);
  } catch (error: any) {
    console.error("Error adding user to institution:", error);
    throw new Error(`Failed to add user to institution: ${error.message}`);
  }
} 