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
  Settings,
  Save,
  Upload,
  Download,
  RefreshCw,
  Share2,
  Clock,
  Calendar,
  Info,
  AlertCircle,
  FileText,
  Mail,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GeneralSettingsPage() {
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const baseUrl = `/${locale}/dashboard/admin/settings`;
  
  const [isLoading, setIsLoading] = useState(false);
  const [generalSettings, setGeneralSettings] = useState({
    system: {
      applicationName: 'Credential Verifier',
      supportEmail: 'support@credentialverifier.com',
      maintenanceMode: false,
      debugMode: false,
      analyticsEnabled: true,
      userRegistration: true,
      sessionTimeout: 30,
    },
    backups: {
      automaticBackups: true,
      backupFrequency: 'daily',
      backupRetention: 7,
      includeUploads: true,
      encryptBackups: true,
    },
    communications: {
      defaultFromName: 'Credential Verifier',
      defaultFromEmail: 'no-reply@credentialverifier.com',
      footerText: '© 2023 Credential Verifier. All rights reserved.',
      logoUrl: '/logo.png',
    }
  });
  
  const handleSystemSettingChange = (field: string, value: any) => {
    setGeneralSettings(prev => ({
      ...prev,
      system: {
        ...prev.system,
        [field]: value
      }
    }));
  };
  
  const handleBackupSettingChange = (field: string, value: any) => {
    setGeneralSettings(prev => ({
      ...prev,
      backups: {
        ...prev.backups,
        [field]: value
      }
    }));
  };
  
  const handleCommunicationSettingChange = (field: string, value: string) => {
    setGeneralSettings(prev => ({
      ...prev,
      communications: {
        ...prev.communications,
        [field]: value
      }
    }));
  };
  
  const saveSettings = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('General settings saved successfully');
    } catch (error) {
      toast.error('Failed to save general settings');
    } finally {
      setIsLoading(false);
    }
  };
  
  const runBackupNow = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      toast.success('Backup completed successfully');
    } catch (error) {
      toast.error('Backup failed');
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
              <Settings className="mr-2 h-5 w-5" />
              <CardTitle>System Settings</CardTitle>
            </div>
            <CardDescription>
              Configure general application settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="applicationName">Application Name</Label>
                <Input
                  id="applicationName"
                  value={generalSettings.system.applicationName}
                  onChange={(e) => handleSystemSettingChange('applicationName', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={generalSettings.system.supportEmail}
                  onChange={(e) => handleSystemSettingChange('supportEmail', e.target.value)}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Put the application in maintenance mode with a custom message
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={generalSettings.system.maintenanceMode}
                  onCheckedChange={(checked) => handleSystemSettingChange('maintenanceMode', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="debugMode">Debug Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable detailed error reporting and debugging information
                  </p>
                </div>
                <Switch
                  id="debugMode"
                  checked={generalSettings.system.debugMode}
                  onCheckedChange={(checked) => handleSystemSettingChange('debugMode', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="analyticsEnabled">Enable Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Collect anonymous usage statistics to improve the application
                  </p>
                </div>
                <Switch
                  id="analyticsEnabled"
                  checked={generalSettings.system.analyticsEnabled}
                  onCheckedChange={(checked) => handleSystemSettingChange('analyticsEnabled', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="userRegistration">User Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to register for accounts
                  </p>
                </div>
                <Switch
                  id="userRegistration"
                  checked={generalSettings.system.userRegistration}
                  onCheckedChange={(checked) => handleSystemSettingChange('userRegistration', checked)}
                />
              </div>
            </div>

            <Separator />
            
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Automatically log out users after period of inactivity
              </p>
              <div className="flex items-center gap-2">
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="5"
                  max="1440"
                  value={generalSettings.system.sessionTimeout}
                  onChange={(e) => handleSystemSettingChange('sessionTimeout', parseInt(e.target.value) || 30)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Save className="mr-2 h-5 w-5" />
              <CardTitle>Backup & Recovery</CardTitle>
            </div>
            <CardDescription>
              Configure automatic backups and data recovery options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="automaticBackups">Automatic Backups</Label>
                  <p className="text-sm text-muted-foreground">
                    Regularly back up system data according to schedule
                  </p>
                </div>
                <Switch
                  id="automaticBackups"
                  checked={generalSettings.backups.automaticBackups}
                  onCheckedChange={(checked) => handleBackupSettingChange('automaticBackups', checked)}
                />
              </div>
              
              {generalSettings.backups.automaticBackups && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select 
                      value={generalSettings.backups.backupFrequency} 
                      onValueChange={(value) => handleBackupSettingChange('backupFrequency', value)}
                    >
                      <SelectTrigger id="backupFrequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="backupRetention">Backup Retention (days)</Label>
                    <Input
                      id="backupRetention"
                      type="number"
                      min="1"
                      max="365"
                      value={generalSettings.backups.backupRetention}
                      onChange={(e) => handleBackupSettingChange('backupRetention', parseInt(e.target.value) || 7)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="includeUploads">Include Uploaded Files</Label>
                      <p className="text-sm text-muted-foreground">
                        Include all uploaded certificate files in backups
                      </p>
                    </div>
                    <Switch
                      id="includeUploads"
                      checked={generalSettings.backups.includeUploads}
                      onCheckedChange={(checked) => handleBackupSettingChange('includeUploads', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="encryptBackups">Encrypt Backups</Label>
                      <p className="text-sm text-muted-foreground">
                        Encrypt backup files for additional security
                      </p>
                    </div>
                    <Switch
                      id="encryptBackups"
                      checked={generalSettings.backups.encryptBackups}
                      onCheckedChange={(checked) => handleBackupSettingChange('encryptBackups', checked)}
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-4 flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <Button
                variant="outline"
                onClick={runBackupNow}
                disabled={isLoading}
                className="flex items-center"
              >
                <Save className="mr-2 h-4 w-4" />
                Run Backup Now
              </Button>
              <Button
                variant="outline"
                disabled={isLoading}
                className="flex items-center"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Latest Backup
              </Button>
              <Button
                variant="outline"
                disabled={isLoading}
                className="flex items-center"
              >
                <Upload className="mr-2 h-4 w-4" />
                Restore from Backup
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              <CardTitle>Communications</CardTitle>
            </div>
            <CardDescription>
              Configure email templates and communication settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="defaultFromName">Default From Name</Label>
                <Input
                  id="defaultFromName"
                  value={generalSettings.communications.defaultFromName}
                  onChange={(e) => handleCommunicationSettingChange('defaultFromName', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultFromEmail">Default From Email</Label>
                <Input
                  id="defaultFromEmail"
                  type="email"
                  value={generalSettings.communications.defaultFromEmail}
                  onChange={(e) => handleCommunicationSettingChange('defaultFromEmail', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="footerText">Email Footer Text</Label>
              <Input
                id="footerText"
                value={generalSettings.communications.footerText}
                onChange={(e) => handleCommunicationSettingChange('footerText', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                value={generalSettings.communications.logoUrl}
                onChange={(e) => handleCommunicationSettingChange('logoUrl', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardFooter className="flex justify-end space-x-2 pt-6">
            <Button variant="outline">Reset to Defaults</Button>
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