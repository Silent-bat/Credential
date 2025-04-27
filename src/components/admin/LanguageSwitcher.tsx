'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Languages } from 'lucide-react';
import { availableLocales, locales } from '@/i18n/config';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function AdminLanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Split the path into segments
  const segments = pathname.split('/').filter(Boolean);
  
  // For debugging
  console.log('Current pathname:', pathname);
  console.log('Current locale:', currentLocale);
  console.log('Path segments:', segments);
  
  useEffect(() => {
    // Close the dropdown when clicked outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const switchLocale = (localeId: string) => {
    // For debugging
    console.log('Switching to locale:', localeId);
    
    // If current locale is already selected, don't navigate
    if (localeId === currentLocale) {
      setIsOpen(false);
      return;
    }

    try {
      // Update the cookie that Next.js uses for locale
      document.cookie = `NEXT_LOCALE=${localeId}; path=/; max-age=31536000; SameSite=Lax`;
      
      // Store the user's preference in localStorage
      localStorage.setItem('preferredLocale', localeId);
    
      // Special case for root path
      if (pathname === '/') {
        window.location.href = `/${localeId}`;
        return;
      }
      
      // Get the current path segments
      const pathSegments = pathname.split('/').filter(Boolean);
      
      // If the first segment is a locale, remove it
      if (locales.includes(pathSegments[0] as any)) {
        pathSegments.shift();
      }
      
      // Rebuild the path with the new locale
      const newPath = `/${localeId}${pathSegments.length ? '/' + pathSegments.join('/') : ''}`;
      
      console.log('Final redirect path:', newPath);
      
      // Use window.location for a full page refresh
      window.location.href = newPath;
    } catch (error) {
      console.error('Error switching locale:', error);
    }
  };

  return (
    <div ref={dropdownRef}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Languages className="h-5 w-5" />
            <span className="sr-only">Change language</span>
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

// Helper function to get language name from code
function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    es: 'Español'
  };
  
  // Make sure code is a string before calling toUpperCase
  return languages[code] || (typeof code === 'string' ? code.toUpperCase() : String(code).toUpperCase());
} 