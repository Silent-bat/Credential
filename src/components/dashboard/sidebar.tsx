"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { User } from "next-auth";
import { HomeIcon, BuildingOfficeIcon, DocumentCheckIcon, UsersIcon, DocumentPlusIcon, Cog6ToothIcon, ShieldCheckIcon, XMarkIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { PinIcon, PinOffIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useDashboardState } from "./DashboardClient";
import { useLocale, useTranslations } from "next-intl";
import { NavItem } from "./navigation";

// Navigation items for the sidebar
export const navigation: NavItem[] = [
  {
    translationKey: "common.navigation.dashboard",
    href: (role: string, locale: string) => {
      if (role === "ADMIN") return `/${locale}/dashboard/admin`;
      return `/${locale}/dashboard`;
    },
    icon: HomeIcon,
    current: false,
    roles: ["ADMIN", "INSTITUTION", "USER"],
  },
  {
    translationKey: "common.navigation.institutions",
    href: (role: string, locale: string) => `/${locale}/dashboard/admin/institutions`,
    icon: BuildingOfficeIcon,
    current: false,
    roles: ["ADMIN"],
  },
  {
    translationKey: "common.navigation.certificates",
    href: (role: string, locale: string) => {
      if (role === "ADMIN") return `/${locale}/dashboard/admin/certificates`;
      if (role === "INSTITUTION") return `/${locale}/dashboard/institution/certificates`;
      return `/${locale}/dashboard/certificates`;
    },
    icon: DocumentCheckIcon,
    current: false,
    roles: ["ADMIN", "INSTITUTION", "USER"],
  },
  {
    translationKey: "common.navigation.users",
    href: (role: string, locale: string) => {
      if (role === "ADMIN") return `/${locale}/dashboard/admin/users`;
      if (role === "INSTITUTION") return `/${locale}/dashboard/institution/users`;
      return `/${locale}/dashboard/users`;
    },
    icon: UsersIcon,
    current: false,
    roles: ["ADMIN", "INSTITUTION"],
  },
  {
    translationKey: "certificates.issueCertificate",
    href: (role: string, locale: string) => {
      if (role === "ADMIN") return `/${locale}/dashboard/admin/certificates/create`;
      return `/${locale}/dashboard/institution/certificates/new`;
    },
    icon: DocumentPlusIcon,
    current: false,
    roles: ["ADMIN", "INSTITUTION"],
  },
  {
    translationKey: "common.navigation.settings",
    href: (role: string, locale: string) => {
      if (role === "ADMIN") return `/${locale}/dashboard/admin/settings`;
      if (role === "INSTITUTION") return `/${locale}/dashboard/institution/settings`;
      return `/${locale}/dashboard/users/settings`;
    },
    icon: Cog6ToothIcon,
    current: false,
    roles: ["ADMIN", "INSTITUTION", "USER"],
  },
  {
    translationKey: "certificates.verifyCertificate",
    href: (role: string, locale: string) => `/${locale}/verify`,
    icon: ShieldCheckIcon,
    current: false,
    roles: ["ADMIN", "INSTITUTION", "USER"],
  },
  {
    translationKey: "common.navigation.support",
    href: (role: string, locale: string) => {
      if (role === "ADMIN") return `/${locale}/dashboard/admin/support`;
      return `/${locale}/support`;
    },
    icon: ChatBubbleLeftRightIcon,
    current: false,
    roles: ["ADMIN", "INSTITUTION", "USER"],
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar({ user }: { user: User }) {
  const { navigation: currentNavigation } = useDashboardState(user);
  const locale = useLocale();
  const t = useTranslations();
  const [open, setOpen] = React.useState(true);
  const [pinned, setPinned] = React.useState(true);

  useEffect(() => {
    // Load sidebar state from localStorage
    const savedPinned = localStorage.getItem('sidebar-pinned');
    if (savedPinned !== null) {
      setPinned(savedPinned === 'true');
    }
    
    const savedOpen = localStorage.getItem('sidebar-open');
    if (savedOpen !== null) {
      setOpen(savedOpen === 'true');
    }
  }, []);

  useEffect(() => {
    // Update the CSS variable when sidebar state changes
    document.documentElement.style.setProperty('--sidebar-width', open ? '16rem' : '4rem');
    // Save sidebar state
    localStorage.setItem('sidebar-open', String(open));
    localStorage.setItem('sidebar-pinned', String(pinned));
  }, [open, pinned]);

  // Handle mouse enter/leave for auto-expand when not pinned
  const handleMouseEnter = () => {
    if (!pinned && !open) {
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!pinned && open) {
      setOpen(false);
    }
  };

  return (
    <aside
      className={
        `fixed inset-y-0 left-0 z-10 transition-all duration-200
        ${open ? 'w-64' : 'w-16'}
        bg-white shadow-lg dark:bg-gray-900
        hidden md:block`
      }
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="h-full flex flex-col">
        {/* Toggle button */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className={`text-xl font-semibold transition-all ${open ? '' : 'hidden'}`}>
              <span className="text-gray-900 dark:text-white">CREDENTIAL</span>
              <span className="text-blue-600 dark:text-blue-400">VERIFIER</span>
            </span>
            <span className={`text-xl font-semibold ${open ? 'hidden' : ''} text-blue-600 dark:text-blue-400`}>CV</span>
          </div>
          <button
            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t('common.labels.collapseSidebar') : t('common.labels.expandSidebar')}
          >
            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto">
          <div className="px-1 py-2">
            <h2 className={`mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${open ? '' : 'hidden'}`}>{t('common.navigation.dashboard')}</h2>
            <nav className="space-y-1">
              {currentNavigation.map((item) => {
                if (!item) return null;
                const itemHref = typeof item.href === 'function' 
                  ? item.href(user.role as string, locale) 
                  : item.href;
                return (
                  <Link
                    key={item.translationKey}
                    href={itemHref}
                    className={classNames(
                      item.current
                        ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
                      "group flex items-center rounded-md px-2 py-2 text-sm font-medium"
                    )}
                  >
                    <span className="mr-3 h-6 w-6 flex-shrink-0 text-gray-500 dark:text-gray-400">
                      {React.createElement(item.icon, { className: "h-5 w-5" })}
                    </span>
                    <span className={`truncate ${open ? '' : 'hidden'}`}>
                      {t(item.translationKey)}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        
        {/* Pin button */}
        <div className={`flex justify-end p-2 border-t border-gray-200 dark:border-gray-800 ${open ? '' : 'hidden'}`}>
          <button
            onClick={() => setPinned(!pinned)}
            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            aria-label={pinned ? t('common.labels.unpinSidebar') : t('common.labels.pinSidebar')}
          >
            {pinned ? (
              <PinIcon className="h-4 w-4" />
            ) : (
              <PinOffIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
} 