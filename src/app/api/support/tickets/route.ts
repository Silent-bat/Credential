import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { 
      title, 
      description, 
      priority = 'MEDIUM'
    } = await request.json();

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the support ticket
    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        status: 'OPEN',
        priority,
        userId: session.user.id,
        messages: {
          create: {
            message: description,
            userId: session.user.id,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create support ticket' },
      { status: 500 }
    );
  }
} 