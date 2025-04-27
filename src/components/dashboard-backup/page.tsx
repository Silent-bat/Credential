import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default async function DashboardPage({
  params,
}: {
  params: { locale: string }
}) {
  // Fix the params usage to avoid the sync warning
  const { locale } = params;
  
  const session = await auth();
  
  // If user is not authenticated, redirect to the login page with locale
  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }
  
  return <DashboardClient user={session.user} />;
} 