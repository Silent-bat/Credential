import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getLocale } from 'next-intl/server';

export default async function DashboardPage({ params }) {
  const session = await auth();
  let locale;
  
  try {
    // Try to get locale from next-intl
    locale = await getLocale();
  } catch (error) {
    // Fallback to params if getLocale fails
    locale = params?.locale || 'en';
    console.error('Error getting locale:', error);
  }

  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  const userRole = session.user.role?.toUpperCase();
  
  if (userRole === 'ADMIN') {
    redirect(`/${locale}/dashboard/admin`);
  } else if (userRole === 'INSTITUTION') {
    redirect(`/${locale}/dashboard/institution`);
  } else {
    redirect(`/${locale}/dashboard/user`);
  }
} 