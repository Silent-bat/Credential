import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Sidebar from "@/components/dashboard/sidebar";
import { NextIntlClientProvider } from 'next-intl';
import { locales } from '@/i18n/config';
import { getMessages } from '@/i18n';
import DashboardHeader from "@/components/dashboard/header";

type Props = {
  children: React.ReactNode;
  params: {
    locale: string;
  };
};

export default async function DashboardLayout({
  children,
  params,
}: Props) {
  // Properly await the params to avoid synchronous access warnings
  params = await Promise.resolve(params);
  
  // Create a local copy of the locale to avoid direct access
  const currentLocale = String(params.locale || 'en');
  
  // Check if the locale is valid
  if (!locales.includes(currentLocale as any)) {
    redirect(`/en/dashboard`);
  }
  
  const session = await auth();
  const user = session?.user;
  
  if (!user) {
    redirect(`/${currentLocale}/auth/login`);
  }

  // Fetch messages for the requested locale
  const messages = await getMessages(currentLocale);

  return (
    <NextIntlClientProvider locale={currentLocale} messages={messages}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar user={user} />
        <div className="flex flex-1 flex-col overflow-hidden transition-all duration-200 ml-0 md:ml-[var(--sidebar-width,16rem)] w-[calc(100%-var(--sidebar-width,16rem))]">
          <DashboardHeader user={user} />
          <main className="flex-1 overflow-y-auto bg-gray-100 p-4 dark:bg-gray-900 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </NextIntlClientProvider>
  );
} 