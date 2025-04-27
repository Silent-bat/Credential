'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface UserSettings {
  id?: string;
  userId?: string;
  darkMode: boolean;
  emailNotifications: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function UserSettingsPage() {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();
  const t = useTranslations('settings');
  const commonT = useTranslations('common');
  const locale = useLocale();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(locale);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    darkMode: false,
    emailNotifications: true
  });
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/auth/login`);
      return;
    }
    
    // Load user settings from the API
    const fetchUserSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user/settings');
        
        if (response.ok) {
          const data = await response.json();
          // Set user information
          setUserName(data.user.name || '');
          setUserEmail(data.user.email || '');
          setSelectedLanguage(data.user.preferredLocale || locale);
          
          // Set user settings
          if (data.settings) {
            setUserSettings({
              darkMode: data.settings.darkMode,
              emailNotifications: data.settings.emailNotifications
            });
          }
        } else {
          // Handle error
          toast({
            title: commonT("error"),
            description: "Failed to load user settings",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching user settings:', error);
        toast({
          title: commonT("error"),
          description: "Failed to load user settings",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (session) {
      fetchUserSettings();
    }
  }, [status, router, locale, session, commonT]);
  
  const handleSaveGeneral = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: userName,
          preferredLocale: selectedLanguage
        })
      });
      
      if (response.ok) {
        // Update the session to reflect the changes
        await updateSession({
          name: userName
        });
        
        toast({
          title: commonT("messages.success"),
          description: "Profile settings saved successfully",
        });
        
        // Refresh the page if language changed
        if (selectedLanguage !== locale) {
          router.push(`/${selectedLanguage}/dashboard/users/settings`);
        }
      } else {
        toast({
          title: commonT("error"),
          description: "Failed to save profile settings",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving general settings:', error);
      toast({
        title: commonT("error"),
        description: "Failed to save profile settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAppearance = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          darkMode: userSettings.darkMode
        })
      });
      
      if (response.ok) {
        // Update theme if needed
        if (typeof document !== 'undefined') {
          if (userSettings.darkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        
        toast({
          title: commonT("messages.success"),
          description: "Appearance settings saved successfully",
        });
      } else {
        toast({
          title: commonT("error"),
          description: "Failed to save appearance settings",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving appearance settings:', error);
      toast({
        title: commonT("error"),
        description: "Failed to save appearance settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emailNotifications: userSettings.emailNotifications
        })
      });
      
      if (response.ok) {
        toast({
          title: commonT("messages.success"),
          description: "Notification settings saved successfully",
        });
      } else {
        toast({
          title: commonT("error"),
          description: "Failed to save notification settings",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: commonT("error"),
        description: "Failed to save notification settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
      
      <Tabs defaultValue="general" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="general">{t('general')}</TabsTrigger>
          <TabsTrigger value="appearance">{t('appearance')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('notifications')}</TabsTrigger>
          <TabsTrigger value="security">{t('security')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile')}</CardTitle>
              <CardDescription>{t('generalDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{commonT('labels.name')}</Label>
                <Input 
                  id="name" 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{commonT('labels.email')}</Label>
                <Input id="email" value={userEmail} type="email" disabled />
                <p className="text-sm text-gray-500">Your email cannot be changed</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="language">{t('language')}</Label>
                <select 
                  id="language"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
              
              <Button 
                onClick={handleSaveGeneral} 
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {commonT('messages.loading')}
                  </>
                ) : (
                  commonT('buttons.save')
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{t('appearanceSettings')}</CardTitle>
              <CardDescription>{t('appearanceDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="darkMode">{t('darkMode')}</Label>
                <Switch 
                  id="darkMode" 
                  checked={userSettings.darkMode}
                  onCheckedChange={(checked) => setUserSettings({...userSettings, darkMode: checked})}
                />
              </div>
              <Separator />
              <Button 
                onClick={handleSaveAppearance}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {commonT('messages.loading')}
                  </>
                ) : (
                  commonT('buttons.save')
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t('notifications')}</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications">{t('emailNotifications')}</Label>
                <Switch 
                  id="emailNotifications" 
                  checked={userSettings.emailNotifications}
                  onCheckedChange={(checked) => setUserSettings({...userSettings, emailNotifications: checked})}
                />
              </div>
              <Separator />
              <Button 
                onClick={handleSaveNotifications}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {commonT('messages.loading')}
                  </>
                ) : (
                  commonT('buttons.save')
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t('security')}</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              
              <Button>{t('changePassword')}</Button>
              
              <Separator className="my-4" />
              
              <div className="flex items-center justify-between">
                <Label htmlFor="two-factor">{t('twoFactorAuth')}</Label>
                <Button variant="outline">Setup</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 