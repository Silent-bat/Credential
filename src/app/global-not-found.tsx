import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n/config';

export default function GlobalNotFound() {
  // Redirect to default locale's not found page
  redirect(`/${defaultLocale}/not-found`);
} 