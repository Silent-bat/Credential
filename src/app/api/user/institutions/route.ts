import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find all institutions the user is associated with
    const userInstitutions = await prisma.institutionUser.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        Institution: true,
      },
    });

    // Filter out any institutions that are not active
    const activeInstitutions = userInstitutions
      .filter(ui => ui.Institution.status === 'APPROVED')
      .map(ui => ({
        id: ui.Institution.id,
        name: ui.Institution.name,
      }));

    return NextResponse.json({
      institutions: activeInstitutions,
    });
  } catch (error) {
    console.error('Error fetching user institutions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch institutions' },
      { status: 500 }
    );
  }
} 