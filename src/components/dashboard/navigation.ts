import React from "react";
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  DocumentCheckIcon, 
  UsersIcon, 
  DocumentPlusIcon, 
  Cog6ToothIcon, 
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";

// Define types for navigation items
export type NavItem = {
  translationKey: string;
  href: string | ((role: string, locale: string) => string);
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  current?: boolean;
  roles: string[];
};

// Navigation items for the sidebar
export const navigation: NavItem[] = [
  {
    translationKey: "common.navigation.dashboard",
    href: (role: string, locale: string) => {
      if (role === "ADMIN") return `/${locale}/dashboard/institution`;
      return `/${locale}/dashboard`;
    },
    icon: HomeIcon,
    current: false,
    roles: ["ADMIN", "INSTITUTION", "USER"],
  },
  {
    translationKey: "common.navigation.analytics",
    href: (role: string, locale: string) => `/${locale}/dashboard/institution/analytics`,
    icon: ChartBarIcon,
    current: false,
    roles: ["ADMIN", "INSTITUTION"],
  },
  {
    translationKey: "common.navigation.institutions",
    href: (role: string, locale: string) => `/${locale}/dashboard/admin/institutions`,
    icon: BuildingOfficeIcon,
    current: false,
    roles: ["ADMIN"],
  },
  {
    translationKey: "common.navigation.certificates",
    href: (role: string, locale: string) => {
      if (role === "ADMIN") return `/${locale}/dashboard/admin/certificates`;
      if (role === "INSTITUTION") return `/${locale}/dashboard/institution/certificates`;
      return `/${locale}/dashboard/certificates`;
    },
    icon: DocumentCheckIcon,
    current: false,
    roles: ["ADMIN", "INSTITUTION", "USER"],
  },
  {
    translationKey: "common.navigation.users",
    href: (role: string, locale: string) => {
      if (role === "ADMIN") return `/${locale}/dashboard/admin/users`;
      if (role === "INSTITUTION") return `/${locale}/dashboard/institution/users`;
      return `/${locale}/dashboard/users`;
    },
    icon: UsersIcon,
    current: false,
    roles: ["ADMIN", "INSTITUTION"],
  },
  {
    translationKey: "certificates.issueCertificate",
    href: (role: string, locale: string) => {
      if (role === "ADMIN") return `/${locale}/dashboard/admin/certificates/create`;
      return `/${locale}/dashboard/institution/certificates/create`;
    },
    icon: DocumentPlusIcon,
    current: false,
    roles: ["ADMIN", "INSTITUTION"],
  },
  {
    translationKey: "common.navigation.settings",
    href: (role: string, locale: string) => `/${locale}/dashboard/admin/settings`,
    icon: Cog6ToothIcon,
    current: false,
    roles: ["ADMIN"],
  },
  {
    translationKey: "certificates.verifyCertificate",
    href: (role: string, locale: string) => `/${locale}/verify`,
    icon: ShieldCheckIcon,
    current: false,
    roles: ["ADMIN", "INSTITUTION", "USER"],
  },
  {
    translationKey: "common.navigation.support",
    href: (role: string, locale: string) => {
      if (role === "ADMIN") return `/${locale}/dashboard/admin/support`;
      return `/${locale}/support`;
    },
    icon: ChatBubbleLeftRightIcon,
    current: false,
    roles: ["ADMIN", "INSTITUTION", "USER"],
  },
]; 