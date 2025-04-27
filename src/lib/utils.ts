import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date object or string to a localized date string
 * @param date Date object or date string
 * @param locales Locale string or array of locale strings
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, locales: string | string[] = 'en-US'): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString(locales, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
