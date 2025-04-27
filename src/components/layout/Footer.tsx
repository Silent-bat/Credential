'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';

export function Footer() {
  const locale = useLocale();
  const t = useTranslations('Navigation');
  const currentYear = new Date().getFullYear();
  const { data: session } = useSession();

  // Determine dashboard path based on user role
  const getDashboardPath = () => {
    if (!session?.user) return `/${locale}/dashboard`;
    
    return session.user.role === 'admin' 
      ? `/${locale}/dashboard/institution` 
      : `/${locale}/dashboard`;
  };

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Credential Verifier</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              A secure platform for verifying and managing credentials using blockchain technology
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}`} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                  {t('home')}
                </Link>
              </li>
              {/* Only show dashboard link if user is logged in */}
              {session && (
                <li>
                  <Link href={getDashboardPath()} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                    {t('dashboard')}
                  </Link>
                </li>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/help`} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about`} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/privacy`} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {currentYear} Credential Verifier. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 