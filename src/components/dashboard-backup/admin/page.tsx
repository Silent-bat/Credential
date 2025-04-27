import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default async function AdminDashboardPage() {
  // Verify admin access
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/login');
  }
  
  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Activity Overview */}
        <div className="col-span-full lg:col-span-2">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Activity Overview</h2>
            <p>Welcome to the admin dashboard. From here you can manage all aspects of the credential system.</p>
          </div>
        </div>
        
        {/* Quick Links */}
        <div className="col-span-1">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Quick Links</h2>
            <nav className="space-y-2">
              <a 
                href="/dashboard/admin/institutions" 
                className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                Institutions Management
              </a>
              <a 
                href="/dashboard/admin/users" 
                className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                Users Management
              </a>
              <a 
                href="/dashboard/admin/logs" 
                className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                Activity Logs
              </a>
              <a 
                href="/dashboard/admin/settings" 
                className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                System Settings
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
} 