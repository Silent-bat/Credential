'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Debug information to help diagnose issues
    console.log("Dashboard page mounted");
    console.log("Session status:", status);
    console.log("Session data:", session);
    console.log("Current pathname:", window.location.pathname);
    console.log("Current locale:", locale);

    // Only proceed if we're not already redirecting and have a settled session state
    if (isRedirecting || status === 'loading') return;

    if (status === 'unauthenticated') {
      console.log("User is not authenticated, redirecting to login");
      window.location.href = `/${locale}/auth/login`;
      return;
    }

    if (status === 'authenticated' && session) {
      try {
        // Get user role and redirect accordingly
        const userRole = session.user?.role?.toUpperCase();
        console.log("User role:", userRole);
        
        // Set redirecting state to prevent multiple redirects
        setIsRedirecting(true);
        
        // Only redirect if we're exactly on the /dashboard route (no subroutes)
        if (window.location.pathname === `/${locale}/dashboard`) {
          let targetUrl = '';
          
          if (userRole === 'ADMIN') {
            // Admin users go to admin dashboard
            targetUrl = `/${locale}/dashboard/admin`;
          } else if (userRole === 'INSTITUTION') {
            // Institution users go to institution dashboard
            targetUrl = `/${locale}/dashboard/institution`;
          } else {
            // Regular users go to user dashboard
            targetUrl = `/${locale}/dashboard/users`;
          }
          
          console.log("Redirecting to:", targetUrl);
          
          // Use direct location change for more reliable redirects in production
          window.location.href = targetUrl;
        }
      } catch (err) {
        console.error("Error during dashboard redirect:", err);
        setError("An error occurred while redirecting. Please try refreshing the page.");
      }
    }
  }, [session, status, router, locale, isRedirecting]);

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <div className="text-red-500 mb-4">⚠️ {error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // Show loading state while redirecting or waiting for session
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <div className="text-gray-600">
        {status === 'loading' ? 'Loading session...' : 'Redirecting to dashboard...'}
      </div>
    </div>
  );
} 