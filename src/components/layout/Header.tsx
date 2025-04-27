'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LanguageSelector } from './LanguageSelector';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { ThemeToggle } from '../ui/ThemeToggle';

export function Header() {
  const t = useTranslations('Navigation');
  const common = useTranslations('common');
  const auth = useTranslations('auth');
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const locale = useLocale();

  const isActive = (path: string) => {
    return pathname.includes(path);
  };

  // Determine dashboard path based on user role
  const getDashboardPath = () => {
    if (!session?.user) return `/${locale}/dashboard`;
    
    const role = session.user.role?.toLowerCase() || '';
    
    if (role.includes('admin')) {
      return `/${locale}/dashboard/admin`;
    } else if (role.includes('institution')) {
      return `/${locale}/dashboard/institution`;
    } else {
      return `/${locale}/dashboard/users`;
    }
  };

  // Check if user is properly authenticated
  const isAuthenticated = status === 'authenticated' && session && session.user;

  return (
    <header className="bg-white dark:bg-gray-900 shadow">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href={`/${locale}`} className="text-xl font-bold text-gray-900 dark:text-white">
            Credential Verifier
          </Link>
          
          <nav className="hidden md:flex ml-10 space-x-4">
            <Link
              href={`/${locale}`}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === `/${locale}` || pathname === `/${locale}/`
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              {t('home')}
            </Link>
            {/* Only show dashboard link if user is authenticated */}
            {isAuthenticated && (
              <Link
                href={getDashboardPath()}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/dashboard')
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                {t('dashboard')}
              </Link>
            )}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <LanguageSelector />
          
          {status === 'loading' ? (
            <span className="text-sm">{common('messages.loading')}</span>
          ) : isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="hidden md:block text-sm text-gray-700 dark:text-gray-300">
                {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: `/${locale}` })}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {auth('signOut')}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href={`/${locale}/auth/login`}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {auth('signIn')}
              </Link>
              <Link
                href={`/${locale}/auth/register`}
                className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
              >
                {auth('signUp')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 