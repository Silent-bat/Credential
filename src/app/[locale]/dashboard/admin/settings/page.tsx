'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  User,
  Lock,
  Globe,
  Bell,
  Database,
  Server,
  ShieldAlert,
  Clock,
  Check,
  ArrowRight,
  Network,
  Mail,
  Smartphone,
  FileCheck,
  Key,
  Languages,
  Calendar,
  Type
} from "lucide-react";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = Array.isArray(params?.locale) 
    ? params?.locale[0] 
    : params?.locale || 'en';
  const baseUrl = `/${locale}/dashboard/admin/settings`;
  const t = useTranslations('admin.settings');
  
  const [activeTab, setActiveTab] = useState<string>("general");
  
  // Listen for hash changes to update the active tab
  useEffect(() => {
    // Function to handle hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      
      // Map hash to tab value
      const hashToTab: Record<string, string> = {
        'profile': 'profile',
        'security': 'security',
        'language': 'language',
        'notifications': 'notifications',
        'general': 'general',
        'database': 'database',
        'blockchain': 'blockchain',
        'security-settings': 'system-security'
      };
      
      setActiveTab(hashToTab[hash] || 'general');
    };
    
    // Set initial active tab based on hash
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Redirect to default hash if none is provided
    if (!window.location.hash) {
      window.location.hash = 'general';
    }
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Credential Verifier",
    siteUrl: "https://credential-verifier.example.com",
    contactEmail: "admin@example.com",
    maintenanceMode: false,
    allowRegistration: true,
    requireVerification: true
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorRequired: true,
    passwordPolicy: true,
    sessionTimeout: 60
  });

  // Basic handlers for settings changes
  const handleGeneralSettingChange = (key: string, value: any) => {
    setGeneralSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSecuritySettingChange = (key: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    toast.success('Settings saved successfully');
  };

  // Card components for each settings category
  const settingsCards = {
    general: (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            <CardTitle>{t('general')}</CardTitle>
          </div>
          <CardDescription>
            {t('generalDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="siteName">{t('siteName')}</Label>
            <Input 
              id="siteName" 
              value={generalSettings.siteName}
              onChange={(e) => handleGeneralSettingChange('siteName', e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              {t('siteNameDescription')}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="siteUrl">{t('siteUrl')}</Label>
            <Input 
              id="siteUrl" 
              value={generalSettings.siteUrl}
              onChange={(e) => handleGeneralSettingChange('siteUrl', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactEmail">{t('contactEmail')}</Label>
            <Input 
              id="contactEmail" 
              value={generalSettings.contactEmail}
              onChange={(e) => handleGeneralSettingChange('contactEmail', e.target.value)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('maintenanceMode')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('maintenanceModeDescription')}
              </p>
            </div>
            <Switch 
              checked={generalSettings.maintenanceMode}
              onCheckedChange={(checked) => handleGeneralSettingChange('maintenanceMode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('allowRegistration')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('allowRegistrationDescription')}
              </p>
            </div>
            <Switch 
              checked={generalSettings.allowRegistration}
              onCheckedChange={(checked) => handleGeneralSettingChange('allowRegistration', checked)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveSettings}>{t('saveChanges')}</Button>
        </CardFooter>
      </Card>
    ),
    
    security: (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center">
            <Lock className="mr-2 h-5 w-5" />
            <CardTitle>{t('security')}</CardTitle>
          </div>
          <CardDescription>
            {t('securityDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('twoFactorAuth')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('twoFactorAuthDescription')}
              </p>
            </div>
            <Switch 
              checked={securitySettings.twoFactorRequired}
              onCheckedChange={(checked) => handleSecuritySettingChange('twoFactorRequired', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('strongPasswordPolicy')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('strongPasswordPolicyDescription')}
              </p>
            </div>
            <Switch 
              checked={securitySettings.passwordPolicy}
              onCheckedChange={(checked) => handleSecuritySettingChange('passwordPolicy', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">{t('sessionTimeout')}</Label>
            <Input
              id="sessionTimeout"
              type="number"
              value={securitySettings.sessionTimeout}
              onChange={(e) => handleSecuritySettingChange('sessionTimeout', parseInt(e.target.value) || 60)}
            />
            <p className="text-sm text-muted-foreground">
              {t('sessionTimeoutDescription')}
            </p>
          </div>
          
          <Link href={`${baseUrl}/security`} className="block w-full">
            <Button variant="outline" className="w-full mt-4">
              <span>{t('advancedSecuritySettings')}</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
        <CardFooter>
          <Button onClick={saveSettings}>{t('saveChanges')}</Button>
        </CardFooter>
      </Card>
    ),
    
    profile: (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            <CardTitle>Profile Settings</CardTitle>
          </div>
          <CardDescription>
            Manage user profile settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted flex items-center justify-between">
              <div>
                <h3 className="font-medium">User Profile Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Configure profile fields, visibility options, and avatars
                </p>
              </div>
              <Link href={`${baseUrl}/profile`}>
                <Button variant="secondary">
                  Manage Profile Settings
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    
    language: (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center">
            <Globe className="mr-2 h-5 w-5" />
            <CardTitle>Language Settings</CardTitle>
          </div>
          <CardDescription>
            Configure language and localization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-muted">
                <Languages className="h-5 w-5 mb-2" />
                <h3 className="font-medium">Interface Languages</h3>
                <p className="text-sm text-muted-foreground">
                  Configure available languages for the user interface
                </p>
                <Link href={`${baseUrl}/language`} className="block mt-4">
                  <Button variant="secondary" size="sm">
                    Configure
                  </Button>
                </Link>
              </div>
              
              <div className="p-4 rounded-lg bg-muted">
                <Calendar className="h-5 w-5 mb-2" />
                <h3 className="font-medium">Date & Time Formats</h3>
                <p className="text-sm text-muted-foreground">
                  Set date, time, and number formatting options
                </p>
                <Link href={`${baseUrl}/language`} className="block mt-4">
                  <Button variant="secondary" size="sm">
                    Configure
                  </Button>
                </Link>
              </div>
              
              <div className="p-4 rounded-lg bg-muted">
                <Type className="h-5 w-5 mb-2" />
                <h3 className="font-medium">Translation Management</h3>
                <p className="text-sm text-muted-foreground">
                  Manage content translations and missing strings
                </p>
                <Link href={`${baseUrl}/language`} className="block mt-4">
                  <Button variant="secondary" size="sm">
                    Configure
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    
    notifications: (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            <CardTitle>Notification Settings</CardTitle>
          </div>
          <CardDescription>
            Configure system notifications and alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-muted">
                <Mail className="h-5 w-5 mb-2" />
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Configure email notification settings and templates
                </p>
                <Link href={`${baseUrl}/notifications`} className="block mt-4">
                  <Button variant="secondary" size="sm">
                    Configure
                  </Button>
                </Link>
              </div>
              
              <div className="p-4 rounded-lg bg-muted">
                <Bell className="h-5 w-5 mb-2" />
                <h3 className="font-medium">In-App Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Configure alerts and notifications within the application
                </p>
                <Link href={`${baseUrl}/notifications`} className="block mt-4">
                  <Button variant="secondary" size="sm">
                    Configure
                  </Button>
                </Link>
              </div>
              
              <div className="p-4 rounded-lg bg-muted">
                <Smartphone className="h-5 w-5 mb-2" />
                <h3 className="font-medium">Push Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Configure mobile and browser push notifications
                </p>
                <Link href={`${baseUrl}/notifications`} className="block mt-4">
                  <Button variant="secondary" size="sm">
                    Configure
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    
    database: (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            <CardTitle>Database Settings</CardTitle>
          </div>
          <CardDescription>
            Manage database configuration and maintenance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
              <h3 className="font-medium text-yellow-800 dark:text-yellow-300 flex items-center">
                <ShieldAlert className="h-5 w-5 mr-2" />
                Advanced Configuration
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                Database settings are critical to system stability. Changes should only be made by administrators.
              </p>
              <Link href={`${baseUrl}/database`} className="block mt-4">
                <Button variant="outline" className="bg-white dark:bg-gray-900">
                  Access Database Settings
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    
    blockchain: (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center">
            <Server className="mr-2 h-5 w-5" />
            <CardTitle>Blockchain Settings</CardTitle>
          </div>
          <CardDescription>
            Configure blockchain providers and connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-muted">
                <Server className="h-5 w-5 mb-2" />
                <h3 className="font-medium">Blockchain Provider</h3>
                <p className="text-sm text-muted-foreground">
                  Configure the blockchain network and connection settings
                </p>
                <Link href={`${baseUrl}/blockchain`} className="block mt-4">
                  <Button variant="secondary" size="sm">
                    Configure
                  </Button>
                </Link>
              </div>
              
              <div className="p-4 rounded-lg bg-muted">
                <Check className="h-5 w-5 mb-2" />
                <h3 className="font-medium">Verification Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Configure credential verification methods and parameters
                </p>
                <Link href={`${baseUrl}/blockchain`} className="block mt-4">
                  <Button variant="secondary" size="sm">
                    Configure
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    
    'system-security': (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center">
            <ShieldAlert className="mr-2 h-5 w-5" />
            <CardTitle>System Security</CardTitle>
          </div>
          <CardDescription>
            Configure advanced system security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-muted">
                <Clock className="h-5 w-5 mb-2" />
                <h3 className="font-medium">Session Security</h3>
                <p className="text-sm text-muted-foreground">
                  Configure login security and session timeouts
                </p>
                <Link href={`${baseUrl}/system-security`} className="block mt-4">
                  <Button variant="secondary" size="sm">
                    Configure
                  </Button>
                </Link>
              </div>
              
              <div className="p-4 rounded-lg bg-muted">
                <Key className="h-5 w-5 mb-2" />
                <h3 className="font-medium">Access Controls</h3>
                <p className="text-sm text-muted-foreground">
                  Configure IP restrictions and authentication requirements
                </p>
                <Link href={`${baseUrl}/system-security`} className="block mt-4">
                  <Button variant="secondary" size="sm">
                    Configure
                  </Button>
                </Link>
              </div>
              
              <div className="p-4 rounded-lg bg-muted">
                <FileCheck className="h-5 w-5 mb-2" />
                <h3 className="font-medium">Audit and Logging</h3>
                <p className="text-sm text-muted-foreground">
                  Configure system logging and audit trail settings
                </p>
                <Link href={`${baseUrl}/system-security`} className="block mt-4">
                  <Button variant="secondary" size="sm">
                    Configure
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
  };

  return (
    <SettingsLayout>
      {settingsCards[activeTab as keyof typeof settingsCards] || settingsCards.general}
    </SettingsLayout>
  );
} 