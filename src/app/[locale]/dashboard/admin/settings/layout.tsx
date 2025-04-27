import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminSettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const currentLocale = params && typeof params.locale === 'string' 
    ? params.locale 
    : 'en';
    
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect(`/${currentLocale}/auth/login`);
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600 mt-2">Configure system settings and preferences</p>
        </div>
      </div>
      
      {children}
    </div>
  );
} 