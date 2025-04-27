import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './config';

export default getRequestConfig(async ({ locale }) => {
  // Ensure we have a valid locale, fallback to default if undefined
  const validLocale = locale && locales.includes(locale) 
    ? locale 
    : defaultLocale;
    
  return {
    locale: validLocale,
    messages: (await import(`./locales/${validLocale}.json`)).default
  };
}); 