'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLocale } from 'next-intl';

export default function AuthError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations();
  const tAuth = useTranslations('auth');

  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Get error from URL query parameters
    const errorParam = searchParams.get('error');
    
    // Map error codes to readable messages
    if (errorParam) {
      switch (errorParam) {
        case 'CredentialsSignin':
          setError(tAuth('errorInvalidCredentials'));
          break;
        case 'SessionRequired':
          setError(tAuth('errorSessionRequired'));
          break;
        case 'AccessDenied':
          setError(tAuth('errorAccessDenied'));
          break;
        case 'OAuthSignin':
        case 'OAuthCallback':
        case 'OAuthCreateAccount':
        case 'EmailCreateAccount':
        case 'Callback':
        case 'OAuthAccountNotLinked':
        case 'EmailSignin':
        case 'CredentialsSignup':
        case 'default':
        default:
          setError(tAuth('errorGeneral') || 'An error occurred during authentication');
          break;
      }
    }
  }, [searchParams, tAuth]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            {tAuth('errorHeading')}
          </h2>
          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
            </div>
          )}
          <div className="mt-6 flex flex-col space-y-4">
            <Button asChild>
              <Link href={`/${locale}/auth/login`}>
                {tAuth('tryAgain')}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}`}>
                {t('common.navigation.backToHome')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 