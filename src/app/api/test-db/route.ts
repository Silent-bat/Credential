import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Try to connect and run a simple query
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    
    console.log('Database connection successful:', result);
    
    // Check database connection by counting users
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
    
    // Return successful connection
    return NextResponse.json({ 
      status: 'success', 
      message: 'Database connection successful',
      database: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'redacted',
      userCount 
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    
    // Return error response
    return NextResponse.json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}