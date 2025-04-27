'use client';

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function LocaleNotFound() {
  const locale = useLocale();
  
  // Try to get translations, fall back to English text if unavailable
  let errorText = "Error";
  let notFoundText = "Sorry, we couldn't find the page you're looking for.";
  let backText = "Go back home";
  
  try {
    const t = useTranslations('common');
    errorText = t('error');
    backText = t('back');
  } catch (error) {
    // Fall back to default text if translations aren't available
    console.error("Translation error:", error);
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 dark:bg-gray-900 lg:px-8">
      <div className="text-center">
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          {errorText}
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-400">
          {notFoundText}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href={`/${locale}`}
            className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {backText}
          </Link>
        </div>
      </div>
    </div>
  );
} 