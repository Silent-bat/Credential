import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { useLocale } from 'next-intl';

export default async function DashboardPage() {
  const session = await auth();
  const locale = useLocale();

  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  const userRole = session.user.role?.toUpperCase();
  
  if (userRole === 'ADMIN') {
    redirect(`/${locale}/dashboard/admin`);
  } else if (userRole === 'INSTITUTION') {
    redirect(`/${locale}/dashboard/institution`);
  } else {
    redirect(`/${locale}/dashboard/users`);
  }
} 