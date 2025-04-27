'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname, useRouter, useParams } from 'next/navigation';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Settings,
  User,
  Lock,
  Globe,
  Bell,
  Database,
  Server,
  ShieldAlert,
  ChevronRight,
  Cog,
  Shield,
  Palette,
  Users,
  Clock,
  Wallet,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const locale = Array.isArray(params?.locale) ? params?.locale[0] : params?.locale || 'en';
  const baseUrl = `/${locale}/dashboard/admin/settings`;
  const [activeHash, setActiveHash] = useState<string>('');

  // Update active hash when it changes in the browser
  useEffect(() => {
    // Get the current hash from window location
    const hash = window.location.hash.replace('#', '');
    setActiveHash(hash);

    // Listen for hash changes
    const handleHashChange = () => {
      const newHash = window.location.hash.replace('#', '');
      setActiveHash(newHash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isLinkActive = (path: string) => {
    return pathname?.includes(path);
  };

  const sidebarNavItems = [
    {
      title: "Account Settings",
      items: [
        {
          title: "Profile",
          href: `${baseUrl}/profile`,
          icon: User,
          active: isLinkActive(`${baseUrl}/profile`),
        },
        {
          title: "Security",
          href: `${baseUrl}/security`,
          icon: Shield,
          active: isLinkActive(`${baseUrl}/security`),
        },
        {
          title: "Notifications",
          href: `${baseUrl}/notifications`,
          icon: Bell,
          active: isLinkActive(`${baseUrl}/notifications`),
        },
        {
          title: "Interface",
          href: `${baseUrl}/interface`,
          icon: Palette,
          active: isLinkActive(`${baseUrl}/interface`),
        },
      ],
    },
    {
      title: "System Settings",
      items: [
        {
          title: "General",
          href: `${baseUrl}#general`,
          icon: Cog,
          active: pathname === baseUrl || pathname === `${baseUrl}/`,
        },
        {
          title: "Users & Permissions",
          href: `${baseUrl}/users`,
          icon: Users,
          active: isLinkActive(`${baseUrl}/users`),
        },
        {
          title: "Audit Log",
          href: `${baseUrl}/audit-log`,
          icon: Clock,
          active: isLinkActive(`${baseUrl}/audit-log`),
        },
        {
          title: "Database",
          href: `${baseUrl}#database`,
          icon: Database,
          active: false,
        },
        {
          title: "Blockchain",
          href: `${baseUrl}#blockchain`,
          icon: Wallet,
          active: false,
        },
        {
          title: "Security Settings",
          href: `${baseUrl}/security-settings`,
          icon: Shield,
          active: isLinkActive(`${baseUrl}/security-settings`),
        },
      ],
    },
  ];

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    // Extract the hash from the href
    const linkHash = href.split('#')[1];
    setActiveHash(linkHash);
    
    // Navigate to the hash
    window.location.hash = linkHash;
  };

  return (
    <div className="container mx-auto grid grid-cols-1 gap-12 lg:grid-cols-[250px_1fr]">
      <aside className="lg:block">
        <div className="sticky top-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Settings</h2>
            <p className="text-sm text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>
          {sidebarNavItems.map((section, i) => (
            <div key={i} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                {section.title}
              </h3>
              <nav className="grid gap-1">
                {section.items.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                      item.active
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </aside>
      <main>{children}</main>
    </div>
  );
} 