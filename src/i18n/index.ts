import { createTranslator } from 'next-intl';
import { locales, defaultLocale } from './config';

export { locales, defaultLocale };

export async function getTranslations(locale: string = defaultLocale, namespace: string = '*') {
  const messages = (await import(`./locales/${locale}.json`)).default;
  
  return createTranslator({
    locale,
    messages: namespace === '*' ? messages : messages[namespace],
  });
} 