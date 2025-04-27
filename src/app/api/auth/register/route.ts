import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { InstitutionType } from '@prisma/client';

// Valid institution types matching the Prisma schema enum
const validInstitutionTypes: InstitutionType[] = [
  'UNIVERSITY', 
  'COLLEGE', 
  'SCHOOL', 
  'TRAINING_CENTER', 
  'COMPANY', 
  'GOVERNMENT', 
  'NONPROFIT',
  'OTHER'
];

// Map common lowercase types to their enum values
const mapInstitutionType = (type: string): InstitutionType => {
  const typeMap: Record<string, InstitutionType> = {
    'university': 'UNIVERSITY',
    'college': 'COLLEGE',
    'school': 'SCHOOL',
    'training': 'TRAINING_CENTER',
    'trainingcenter': 'TRAINING_CENTER',
    'training_center': 'TRAINING_CENTER',
    'trainingCenter': 'TRAINING_CENTER',
    'company': 'COMPANY',
    'government': 'GOVERNMENT',
    'nonprofit': 'NONPROFIT',
    'other': 'OTHER'
  };

  // Check if the type is a valid enum value
  if (validInstitutionTypes.includes(type as any)) {
    return type as InstitutionType;
  }

  // Try to map from lowercase version
  const normalizedType = type.toLowerCase();
  return typeMap[normalizedType] || 'OTHER';
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      password, 
      preferredLocale, 
      institution
    } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with institution details if provided
    let userData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'INSTITUTION',
      preferredLocale: preferredLocale || 'en',
    };

    let institutionData = null;

    // Create user first
    const user = await prisma.user.create({
      data: userData
    });

    // Create institution if provided
    if (institution && institution.name) {
      const institutionType = institution.type 
        ? mapInstitutionType(institution.type)
        : 'UNIVERSITY';

      // Create the institution
      const newInstitution = await prisma.institution.create({
        data: {
          name: institution.name,
          type: institutionType as InstitutionType,
          website: institution.website || null,
          address: institution.address || null,
          phone: institution.phone || null,
          status: 'PENDING', // Pending approval by admin
        },
      });
      
      // Create relationship between user and institution
      await prisma.institutionUser.create({
        data: {
          userId: user.id,
          institutionId: newInstitution.id,
          role: 'ADMIN', // Set as admin of the institution they created
        }
      });

      institutionData = newInstitution;
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        user: userWithoutPassword,
        institution: institutionData,
        message: 'Registration successful' 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}