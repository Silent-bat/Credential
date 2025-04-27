"use client";

import { Fragment, useState, useEffect } from "react";
import { User } from "next-auth";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { AdminLanguageSwitcher } from "@/components/admin/LanguageSwitcher";
import { useParams } from "next/navigation";

export default function DashboardHeader({ user }: { user: User }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { locale } = useParams();
  const [mounted, setMounted] = useState(false);

  // Only show the correct icon after component is mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine settings path based on user role
  const getSettingsPath = () => {
    if (!user) return `/${locale}/dashboard`;
    
    const role = user.role?.toUpperCase() || '';
    
    if (role.includes('ADMIN')) {
      return `/${locale}/dashboard/admin/settings`;
    } else if (role.includes('INSTITUTION')) {
      return `/${locale}/dashboard/institution/settings`;
    } else {
      return `/${locale}/dashboard/user/settings`;
    }
  };

  return (
    <header className="w-full border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Logo and Page Title */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
            CREDENTIAL<span className="text-gray-900 dark:text-white">VERIFIER</span>
          </Link>
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">Admin Dashboard</span>
        </div>
        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <AdminLanguageSwitcher />
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300"
            aria-label="Toggle dark mode"
          >
            {mounted ? (
              theme === "dark" ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />
            ) : (
              <div className="h-6 w-6" /> // Empty placeholder during SSR
            )}
          </button>
          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </span>
              <span className="hidden md:block">{user.name || user.email}</span>
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name || user.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                </div>
                <Link
                  href={getSettingsPath()}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Settings
                </Link>
                <Link
                  href={`/${locale}/auth/logout`}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Sign out
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 