import React from 'react';
import VerificationUI from '@/components/verification/VerificationUI';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: { locale: string };
};

export default async function VerifyPage({ params }: Props) {
  // Properly await params to avoid synchronous access warnings
  const { locale } = await Promise.resolve(params);
  
  // Get translations for the verification page
  const t = await getTranslations('verification');
  
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">{t('title')}</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">{t('subtitle')}</p>
      </div>
      
      <VerificationUI locale={locale} />
    </div>
  );
} 