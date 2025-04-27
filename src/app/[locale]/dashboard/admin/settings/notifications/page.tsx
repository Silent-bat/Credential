'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'react-hot-toast';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  AlertTriangle,
  ShieldAlert,
  Calendar,
  Clock,
  User,
  Check,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function NotificationsSettingsPage() {
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const baseUrl = `/${locale}/dashboard/admin/settings`;
  
  const [isLoading, setIsLoading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    channels: {
      email: true,
      inApp: true,
      push: false,
      sms: false,
    },
    emailNotifications: {
      securityAlerts: true,
      accountUpdates: true,
      newCertificates: true,
      certificateExpiry: true,
      supportTickets: true,
      marketingUpdates: false,
    },
    inAppNotifications: {
      securityAlerts: true,
      accountUpdates: true,
      newCertificates: true,
      certificateExpiry: true,
      supportTickets: true,
      systemAnnouncements: true,
    },
    timing: {
      digestFrequency: 'immediate',
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      timezone: 'UTC',
    }
  });
  
  const handleChannelChange = (channel: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: value
      }
    }));
  };
  
  const handleEmailNotificationChange = (setting: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        [setting]: value
      }
    }));
  };
  
  const handleInAppNotificationChange = (setting: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      inAppNotifications: {
        ...prev.inAppNotifications,
        [setting]: value
      }
    }));
  };
  
  const handleTimingChange = (setting: string, value: any) => {
    setNotificationSettings(prev => ({
      ...prev,
      timing: {
        ...prev.timing,
        [setting]: value
      }
    }));
  };
  
  const saveSettings = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Notification settings saved successfully');
    } catch (error) {
      toast.error('Failed to save notification settings');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SettingsLayout baseUrl={baseUrl}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              <CardTitle>Notification Channels</CardTitle>
            </div>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={notificationSettings.channels.email}
                  onCheckedChange={(checked) => handleChannelChange('email', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div className="space-y-0.5">
                    <Label htmlFor="inAppNotifications">In-App Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications within the application
                    </p>
                  </div>
                </div>
                <Switch
                  id="inAppNotifications"
                  checked={notificationSettings.channels.inApp}
                  onCheckedChange={(checked) => handleChannelChange('inApp', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div className="space-y-0.5">
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications on your mobile device
                    </p>
                  </div>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={notificationSettings.channels.push}
                  onCheckedChange={(checked) => handleChannelChange('push', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div className="space-y-0.5">
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via text message
                    </p>
                  </div>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={notificationSettings.channels.sms}
                  onCheckedChange={(checked) => handleChannelChange('sms', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {notificationSettings.channels.email && (
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                <CardTitle>Email Notification Settings</CardTitle>
              </div>
              <CardDescription>
                Choose which email notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="securityAlertsEmail" 
                    checked={notificationSettings.emailNotifications.securityAlerts}
                    onCheckedChange={(checked) => 
                      handleEmailNotificationChange('securityAlerts', checked === true)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="securityAlertsEmail"
                      className="flex items-center space-x-2"
                    >
                      <ShieldAlert className="h-4 w-4 text-muted-foreground" /> 
                      <span>Security Alerts</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Login attempts, password changes, and security notifications
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="accountUpdatesEmail" 
                    checked={notificationSettings.emailNotifications.accountUpdates}
                    onCheckedChange={(checked) => 
                      handleEmailNotificationChange('accountUpdates', checked === true)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="accountUpdatesEmail"
                      className="flex items-center space-x-2"
                    >
                      <User className="h-4 w-4 text-muted-foreground" /> 
                      <span>Account Updates</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Profile changes, settings updates, and account notifications
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="newCertificatesEmail" 
                    checked={notificationSettings.emailNotifications.newCertificates}
                    onCheckedChange={(checked) => 
                      handleEmailNotificationChange('newCertificates', checked === true)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="newCertificatesEmail"
                      className="flex items-center space-x-2"
                    >
                      <Check className="h-4 w-4 text-muted-foreground" /> 
                      <span>New Certificates</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications about new certificates issued or verified
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="certificateExpiryEmail" 
                    checked={notificationSettings.emailNotifications.certificateExpiry}
                    onCheckedChange={(checked) => 
                      handleEmailNotificationChange('certificateExpiry', checked === true)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="certificateExpiryEmail"
                      className="flex items-center space-x-2"
                    >
                      <Calendar className="h-4 w-4 text-muted-foreground" /> 
                      <span>Certificate Expiry</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Reminders when certificates are about to expire
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="supportTicketsEmail" 
                    checked={notificationSettings.emailNotifications.supportTickets}
                    onCheckedChange={(checked) => 
                      handleEmailNotificationChange('supportTickets', checked === true)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="supportTicketsEmail"
                      className="flex items-center space-x-2"
                    >
                      <MessageSquare className="h-4 w-4 text-muted-foreground" /> 
                      <span>Support Tickets</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Updates on your support tickets and responses
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="marketingUpdatesEmail" 
                    checked={notificationSettings.emailNotifications.marketingUpdates}
                    onCheckedChange={(checked) => 
                      handleEmailNotificationChange('marketingUpdates', checked === true)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="marketingUpdatesEmail"
                      className="flex items-center space-x-2"
                    >
                      <Mail className="h-4 w-4 text-muted-foreground" /> 
                      <span>Marketing Updates</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      News, updates, and promotional information
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {notificationSettings.channels.inApp && (
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                <CardTitle>In-App Notification Settings</CardTitle>
              </div>
              <CardDescription>
                Choose which in-app notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="securityAlertsInApp" 
                    checked={notificationSettings.inAppNotifications.securityAlerts}
                    onCheckedChange={(checked) => 
                      handleInAppNotificationChange('securityAlerts', checked === true)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="securityAlertsInApp"
                      className="flex items-center space-x-2"
                    >
                      <ShieldAlert className="h-4 w-4 text-muted-foreground" /> 
                      <span>Security Alerts</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Login attempts, password changes, and security notifications
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="accountUpdatesInApp" 
                    checked={notificationSettings.inAppNotifications.accountUpdates}
                    onCheckedChange={(checked) => 
                      handleInAppNotificationChange('accountUpdates', checked === true)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="accountUpdatesInApp"
                      className="flex items-center space-x-2"
                    >
                      <User className="h-4 w-4 text-muted-foreground" /> 
                      <span>Account Updates</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Profile changes, settings updates, and account notifications
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="newCertificatesInApp" 
                    checked={notificationSettings.inAppNotifications.newCertificates}
                    onCheckedChange={(checked) => 
                      handleInAppNotificationChange('newCertificates', checked === true)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="newCertificatesInApp"
                      className="flex items-center space-x-2"
                    >
                      <Check className="h-4 w-4 text-muted-foreground" /> 
                      <span>New Certificates</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications about new certificates issued or verified
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="certificateExpiryInApp" 
                    checked={notificationSettings.inAppNotifications.certificateExpiry}
                    onCheckedChange={(checked) => 
                      handleInAppNotificationChange('certificateExpiry', checked === true)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="certificateExpiryInApp"
                      className="flex items-center space-x-2"
                    >
                      <Calendar className="h-4 w-4 text-muted-foreground" /> 
                      <span>Certificate Expiry</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Reminders when certificates are about to expire
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="supportTicketsInApp" 
                    checked={notificationSettings.inAppNotifications.supportTickets}
                    onCheckedChange={(checked) => 
                      handleInAppNotificationChange('supportTickets', checked === true)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="supportTicketsInApp"
                      className="flex items-center space-x-2"
                    >
                      <MessageSquare className="h-4 w-4 text-muted-foreground" /> 
                      <span>Support Tickets</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Updates on your support tickets and responses
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="systemAnnouncementsInApp" 
                    checked={notificationSettings.inAppNotifications.systemAnnouncements}
                    onCheckedChange={(checked) => 
                      handleInAppNotificationChange('systemAnnouncements', checked === true)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="systemAnnouncementsInApp"
                      className="flex items-center space-x-2"
                    >
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" /> 
                      <span>System Announcements</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Important system-wide announcements and notifications
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              <CardTitle>Notification Timing</CardTitle>
            </div>
            <CardDescription>
              Configure when and how often you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="digestFrequency">Notification Frequency</Label>
                <Select 
                  value={notificationSettings.timing.digestFrequency} 
                  onValueChange={(value) => handleTimingChange('digestFrequency', value)}
                >
                  <SelectTrigger id="digestFrequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Digest</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {notificationSettings.timing.digestFrequency === 'immediate' 
                    ? 'Receive notifications as they happen' 
                    : `Receive a digest of notifications ${notificationSettings.timing.digestFrequency}`}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="quietHoursEnabled">Quiet Hours</Label>
                    <p className="text-sm text-muted-foreground">
                      Don't send notifications during specified hours
                    </p>
                  </div>
                  <Switch
                    id="quietHoursEnabled"
                    checked={notificationSettings.timing.quietHoursEnabled}
                    onCheckedChange={(checked) => handleTimingChange('quietHoursEnabled', checked)}
                  />
                </div>
                
                {notificationSettings.timing.quietHoursEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quietHoursStart">Start Time</Label>
                      <Input
                        id="quietHoursStart"
                        type="time"
                        value={notificationSettings.timing.quietHoursStart}
                        onChange={(e) => handleTimingChange('quietHoursStart', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quietHoursEnd">End Time</Label>
                      <Input
                        id="quietHoursEnd"
                        type="time"
                        value={notificationSettings.timing.quietHoursEnd}
                        onChange={(e) => handleTimingChange('quietHoursEnd', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select 
                  value={notificationSettings.timing.timezone} 
                  onValueChange={(value) => handleTimingChange('timezone', value)}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  All notification times will be displayed in this timezone
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardFooter className="flex justify-end space-x-2 pt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                toast.success('Notification preferences reset to default');
                // Reset logic would go here
              }}
            >
              Reset to Defaults
            </Button>
            <Button 
              onClick={saveSettings} 
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </SettingsLayout>
  );
} 