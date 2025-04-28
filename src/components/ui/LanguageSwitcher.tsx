'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { locales, availableLocales } from '@/i18n/config';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';

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

    // Set cookie for the new locale
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`; // 1 year expiration

    const newPath = `/${locale}${pathnameWithoutLocale || ''}`;
    router.push(newPath);
    setIsOpen(false);
  };

  // Find current locale display name
  const currentLocaleDisplay = availableLocales.find(loc => loc.id === currentLocale)?.name || currentLocale;

  return (
    <div ref={dropdownRef}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Languages className="h-5 w-5" />
            <span className="sr-only">{t('changeLanguage')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {availableLocales.map((locale) => (
            <DropdownMenuItem
              key={locale.id}
              className={`cursor-pointer ${locale.id === currentLocale ? 'font-bold bg-gray-100 dark:bg-gray-800' : ''}`}
              onClick={() => switchLocale(locale.id)}
            >
              {locale.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 