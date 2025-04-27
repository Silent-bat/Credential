'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function LanguageSettingsRedirect() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string || 'en';

  useEffect(() => {
    // Redirect to the main settings page with the language hash
    router.push(`/${locale}/dashboard/admin/settings#language`);
  }, [locale, router]);

  return <div className="p-8">Redirecting to language settings...</div>;
} 