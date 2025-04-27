import '../globals.css';
import 'react-day-picker/dist/style.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { locales, isValidLocale } from '@/i18n/config';
import { redirect, notFound } from 'next/navigation';
import { getMessages } from '@/i18n/config';
import { NextIntlClientProvider } from 'next-intl';
import { auth } from '@/auth';
import ErrorBoundary from '@/providers/ErrorBoundary';
import AuthProvider from '@/providers/AuthProvider';
import ThemeProvider from '@/providers/ThemeProvider'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Credential Verifier',
  description: 'A secure platform for verifying and managing credentials using blockchain technology',
};

// Generate static params for all supported locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Properly await params to avoid synchronous access warnings
  const { locale } = await Promise.resolve(params);
  
  // Validate that the locale is supported, or fallback to a 404 page
  if (!isValidLocale(locale)) {
    notFound();
  }
  
  // Fetch the messages for this locale
  const messages = await getMessages(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <AuthProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <ThemeProvider>
                {children}
                <Toaster />
              </ThemeProvider>
            </NextIntlClientProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}