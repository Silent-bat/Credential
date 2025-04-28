import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'es', 'fr', 'de'] as const;
export type Locale = (typeof locales)[number];

// This is the default locale to use if no locale is specified
export const defaultLocale = 'en';

// These are all the locales that are supported in the application
export const availableLocales = [
  { id: 'en', name: 'English' },
  { id: 'es', name: 'Español' },
  { id: 'fr', name: 'Français' },
  { id: 'de', name: 'Deutsch' }
];

export const localeNames = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
};

/**
 * Check if a locale is valid
 * @param locale The locale to check
 * @returns True if the locale is valid, false otherwise
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// Get the locale from a pathname
export function getLocaleFromPathname(pathname: string): Locale | null {
  // Extract the first path segment
  const segment = pathname.split('/')[1];
  
  // Check if it's a valid locale
  if (segment && isValidLocale(segment)) {
    return segment;
  }
  
  return null;
}

// Remove the locale prefix from a pathname
export function removeLocaleFromPathname(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);
  
  if (locale) {
    // Remove the locale prefix
    return pathname.replace(`/${locale}`, '') || '/';
  }
  
  return pathname;
}

// Add a locale prefix to a pathname
export function addLocaleToPathname(pathname: string, locale: Locale = defaultLocale): string {
  // If the path already has a locale, replace it
  const existingLocale = getLocaleFromPathname(pathname);
  
  if (existingLocale) {
    return pathname.replace(`/${existingLocale}`, `/${locale}`);
  }
  
  // If the path is just /, add the locale
  if (pathname === '/') {
    return `/${locale}`;
  }
  
  // Otherwise, add the locale as a prefix
  return `/${locale}${pathname}`;
}

// Define our namespace structure
export type Messages = {
  common: Record<string, any>;
  auth: Record<string, any>;
  dashboard: Record<string, any>;
  Home: Record<string, any>;
  Navigation: Record<string, any>;
  settings: Record<string, any>;
  Verification: Record<string, any>;
  Testimonials: Record<string, any>;
  certificates: Record<string, any>;
  admin: Record<string, any>;
  Dashboard: Record<string, any>;
};

// Function to create messages for the server
export async function getMessages(locale: Locale | string) {
  try {
    const validLocale = locale && locales.includes(locale as Locale) 
      ? locale 
      : defaultLocale;
    
    // Load the requested locale
    const localeMessages = (await import(`./locales/${validLocale}.json`)).default;
    
    // If we're not using the default locale, also load default for fallback
    if (validLocale !== defaultLocale) {
      const defaultMessages = (await import(`./locales/${defaultLocale}.json`)).default;
      // Deep merge the default and locale-specific messages
      return deepMerge(defaultMessages, localeMessages);
    }
    
    return localeMessages;
  } catch (error) {
    console.error(`Error loading messages for locale ${locale}:`, error);
    // Fallback to default locale
    return (await import(`./locales/${defaultLocale}.json`)).default;
  }
}

// Deep merge utility for translation objects
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Load the messages for a specific locale
export default getRequestConfig(async ({ locale }) => {
  // Ensure we have a valid locale, fallback to default if undefined
  const messages = await getMessages(locale);
    
  return {
    messages,
    // Add error handling for missing translations
    onError: (error) => {
      if (error.code === 'MISSING_MESSAGE') {
        console.warn(`[i18n] Missing message: ${error.message}`);
        return;
      }
      throw error;
    },
    // Use the message key itself as the fallback
    getMessageFallback: ({ namespace, key }) => {
      // For debugging:
      console.debug(`[i18n] Fallback used: ${namespace ? `${namespace}.` : ''}${key}`);
      
      // Return key for debugging or empty string for production
      return process.env.NODE_ENV === 'development' ? `${namespace ? `${namespace}.` : ''}${key}` : '';
    },
    // Add time zone support
    timeZone: 'UTC',
    // Add number formatting support
    numberFormat: {
      currency: {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      },
      percent: {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      },
    },
  };
}); 