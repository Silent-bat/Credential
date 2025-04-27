"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performSignOut = async () => {
      try {
        // Sign out and redirect to login page
        await signOut({ redirect: false });
        router.push("/");
      } catch (err) {
        console.error("Logout error:", err);
        setError("An error occurred while signing out. You will be redirected to the login page.");
        
        // If sign out fails, still redirect to login page after a short delay
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    };

    performSignOut();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <div className="flex flex-col items-center justify-center text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Signing out...
          </h1>
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            You will be redirected to the login page.
          </p>
        </div>
      </div>
    </div>
  );
} 