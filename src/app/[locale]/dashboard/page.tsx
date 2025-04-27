'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      // Not authenticated, redirect to login
      router.push(`/${locale}/auth/login`);
      return;
    }

    // Get user role and redirect accordingly
    const userRole = session.user?.role?.toUpperCase();
    
    console.log("Current pathname:", window.location.pathname);
    console.log("Current locale:", locale);
    console.log("Path segments:", window.location.pathname.split('/'));
    
    // Only redirect if we're exactly on the /dashboard route (no subroutes)
    if (window.location.pathname === `/${locale}/dashboard`) {
      if (userRole === 'ADMIN') {
        // Admin users go to admin dashboard
        router.push(`/${locale}/dashboard/admin`);
      } else if (userRole === 'INSTITUTION') {
        // Institution users go to institution dashboard
        router.push(`/${locale}/dashboard/institution`);
      } else {
        // Regular users go to user dashboard
        router.push(`/${locale}/dashboard/users`);
      }
    }
  }, [session, status, router, locale]);

  // Show loading state while redirecting
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
} 