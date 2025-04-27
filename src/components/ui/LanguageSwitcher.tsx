'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { locales, availableLocales } from '@/i18n/config';
import { useState, useRef, useEffect } from 'react';

export function LanguageSwitcher() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extract the pathname without the locale prefix
  const pathnameWithoutLocale = pathname.replace(`/${currentLocale}`, '');

  const switchLocale = (locale: string) => {
    // If current locale is already selected, don't navigate
    if (locale === currentLocale) {
      setIsOpen(false);
      return;
    }

    const newPath = `/${locale}${pathnameWithoutLocale || ''}`;
    router.push(newPath);
    setIsOpen(false);
  };

  // Find current locale display name
  const currentLocaleDisplay = availableLocales.find(loc => loc.id === currentLocale)?.name || currentLocale;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center space-x-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{currentLocaleDisplay}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {availableLocales.map((locale) => (
              <button
                key={locale.id}
                onClick={() => switchLocale(locale.id)}
                className={`block w-full px-4 py-2 text-left text-sm ${
                  locale.id === currentLocale
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
                role="menuitem"
              >
                {locale.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 