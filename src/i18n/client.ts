'use client';

import { useMessages, NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

export default function NextIntlProvider({ locale, children }: { locale: string, children: ReactNode }) {
  const messages = useMessages();
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
} 