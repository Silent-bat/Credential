"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useTranslations } from 'next-intl';

export default function DashboardRouter() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('common');
  const [redirecting, setRedirecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    // Handle different states
    if (status === "unauthenticated") {
      // User is not logged in, redirect to login
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      try {
        // Redirect based on role
        const userRole = session.user.role?.toUpperCase();
        
        // Get the locale from the URL path
        const locale = window.location.pathname.split('/')[1] || 'en';
        
        console.log("Redirecting based on role:", userRole);
        
        switch (userRole) {
          case "ADMIN":
            router.push(`/${locale}/dashboard/admin`);
            break;
          case "INSTITUTION":
            router.push(`/${locale}/dashboard/institution`);
            break;
          case "USER":
            router.push(`/${locale}/dashboard/user`);
            break;
          default:
            // Default case - may need to handle differently
            console.warn(`Unknown role: ${userRole}, defaulting to user dashboard`);
            router.push(`/${locale}/dashboard/user`);
            break;
        }
      } catch (err) {
        console.error("Error in role-based routing:", err);
        setError("Failed to redirect to appropriate dashboard");
        setRedirecting(false);
      }
    }
  }, [status, session, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-destructive/10 p-4 rounded-md mb-4 max-w-md w-full">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            {t('error')}
          </h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          {t('goHome')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-muted-foreground">
        {t('redirecting')}...
      </p>
    </div>
  );
} 