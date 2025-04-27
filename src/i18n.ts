import { getRequestConfig } from 'next-intl/server';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const locales = ['en', 'fr', 'es', 'de'];
export const defaultLocale = 'en';

// Get messages for a specific locale with fallback support
export async function getMessages(locale: string) {
  try {
    const messages = (await import(`./i18n/locales/${locale}.json`)).default;
    // Also load the default locale for fallback
    if (locale !== defaultLocale) {
      const defaultMessages = (await import(`./i18n/locales/${defaultLocale}.json`)).default;
      // Merge the messages with default as fallback
      return { ...defaultMessages, ...messages };
    }
    return messages;
  } catch (error) {
    // Fallback to default locale if the requested locale is not available
    return (await import(`./i18n/locales/${defaultLocale}.json`)).default;
  }
}

// Configure the Next.js Intl provider
export default getRequestConfig(async ({ locale }) => {
  return {
    messages: await getMessages(locale),
    // Add this configuration to avoid throwing errors for missing keys
    // Instead, it will silently fall back to the key name, which we can then handle in the component
    onError: (error) => {
      // Don't throw errors for missing messages
      if (error.code === 'MISSING_MESSAGE') {
        console.warn(`[i18n] Missing message: ${error.message}`);
        return;
      }
      throw error;
    },
    // Use the message key itself as the fallback
    getMessageFallback: ({ namespace, key, error }) => {
      // For debugging:
      console.debug(`[i18n] Fallback used: ${namespace ? `${namespace}.` : ''}${key}`);
      
      // Return null or an empty string to silently handle the missing key
      return '';
    }
  };
}); 