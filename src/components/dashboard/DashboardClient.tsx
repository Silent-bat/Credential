'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { updatedNavigation } from './navigation-new';
import { User } from 'next-auth';
import { useState, createContext, useContext, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Award, 
  FileCheck, 
  Settings,
  UserCircle,
  Share2,
  Shield,
  Clock,
  Loader2
} from "lucide-react";
import { AdminLanguageSwitcher } from "@/components/admin/LanguageSwitcher";

// Define the shape of our dashboard state
type DashboardState = {
  navigation: typeof updatedNavigation;
};

// Create the context
const DashboardContext = createContext<DashboardState | null>(null);

// Hook to use the dashboard state
export function useDashboardState(user?: User): DashboardState {
  const context = useContext(DashboardContext);
  
  if (!context) {
    // Provide a default state if the context is not available
    const navItems = updatedNavigation
      .filter(item => !item.roles || item.roles.includes(user?.role as string))
      .map(item => ({ ...item, current: false }));
    
    return { navigation: navItems };
  }
  
  return context;
}

export default function DashboardClient({ user }: { user: any }) {
  const t = useTranslations('Dashboard');
  const pathname = usePathname();
  const locale = useLocale();
  
  // Placeholder summary data
  const summary = [
    {
      label: 'Users',
      count: 8,
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      ),
      link: `/${locale}/dashboard/admin/users`,
      linkLabel: 'View all users',
    },
    {
      label: 'Institutions',
      count: 3,
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10V6a1 1 0 011-1h16a1 1 0 011 1v4M4 10v10a1 1 0 001 1h14a1 1 0 001-1V10M4 10h16" /></svg>
      ),
      link: `/${locale}/dashboard/admin/institutions`,
      linkLabel: 'View all institutions',
    },
    {
      label: 'Certificates',
      count: 2,
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
      ),
      link: `/${locale}/dashboard/admin/certificates`,
      linkLabel: 'View all certificates',
    },
    {
      label: 'Support Tickets',
      count: 0,
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2m10-4h-4m0 0V4m0 0a2 2 0 012 2v2a2 2 0 01-2 2h-4a2 2 0 01-2-2V6a2 2 0 012-2h4z" /></svg>
      ),
      link: `/${locale}/dashboard/admin/support`,
      linkLabel: 'View all tickets',
    },
  ];

  // Placeholder activity log data
  const activityStats = {
    total: 8,
    today: 0,
    week: 1,
    month: 8,
  };

  return (
    <div className="container mx-auto py-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {summary.map((item) => (
          <div key={item.label} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center">
            <div className="mb-2">{item.icon}</div>
            <div className="text-3xl font-bold mb-1">{item.count}</div>
            <div className="text-gray-700 dark:text-gray-300 mb-2">{item.label}</div>
            <a href={item.link} className="text-blue-600 hover:underline text-sm">{item.linkLabel}</a>
          </div>
        ))}
      </div>

      {/* Activity Log Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div className="text-lg font-semibold mb-2 md:mb-0">Activity Log Overview</div>
          <a href={`/${locale}/dashboard/admin/logs`} className="text-blue-600 hover:underline text-sm">View All Logs</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">Total Logs</div>
            <div className="text-2xl font-bold">{activityStats.total}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">Today</div>
            <div className="text-2xl font-bold">{activityStats.today}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">This Week</div>
            <div className="text-2xl font-bold">{activityStats.week}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">This Month</div>
            <div className="text-2xl font-bold">{activityStats.month}</div>
          </div>
        </div>
        {/* Placeholder for chart */}
        <div className="h-32 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center text-gray-400">
          [Activity Chart Placeholder]
        </div>
      </div>
    </div>
  );
} 