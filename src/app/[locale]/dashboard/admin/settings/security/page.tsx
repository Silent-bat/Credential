'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { toast } from 'react-hot-toast';
import {
  Shield,
  Lock,
  User,
  Key,
  AlertTriangle,
  ChevronLeft,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function SecuritySettingsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = Array.isArray(params?.locale) 
    ? params?.locale[0] 
    : params?.locale || 'en';
  const baseUrl = `/${locale}/dashboard/admin/settings`;
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("password");
  
  const [settings, setSettings] = useState({
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      passwordExpiryDays: 90,
      preventReuseCount: 5,
    },
    authentication: {
      maxLoginAttempts: 5,
      lockoutDuration: 30, // minutes
      mfaRequired: 'optional', // 'disabled', 'optional', 'required'
      allowRememberMe: true,
      rememberDeviceDays: 30,
      requireCaptcha: false,
    },
    session: {
      sessionTimeout: 60, // minutes
      extendSessionOnActivity: true,
      enforceOneSession: false,
      requireReauthForSensitive: true,
      ipChangeValidation: true,
      deviceChangeValidation: true,
    }
  });
  
  // Handlers for different settings sections
  const handlePasswordSettingChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      password: {
        ...prev.password,
        [field]: value
      }
    }));
  };
  
  const handleAuthSettingChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      authentication: {
        ...prev.authentication,
        [field]: value
      }
    }));
  };
  
  const handleSessionSettingChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      session: {
        ...prev.session,
        [field]: value
      }
    }));
  };
  
  // Save all settings
  const saveSettings = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Security settings saved successfully');
    } catch (error) {
      toast.error('Failed to save security settings');
    } finally {
      setIsLoading(false);
    }
  };
  
  const goBackToSettings = () => {
    router.push(`${baseUrl}#security`);
  };
  
  return (
    <SettingsLayout baseUrl={baseUrl}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={goBackToSettings}
              className="mr-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold">Security Settings</h2>
              <p className="text-sm text-muted-foreground">
                Configure security settings for your organization
              </p>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="password">
              <Lock className="mr-2 h-4 w-4" />
              Password Policy
            </TabsTrigger>
            <TabsTrigger value="authentication">
              <Shield className="mr-2 h-4 w-4" />
              Authentication
            </TabsTrigger>
            <TabsTrigger value="session">
              <User className="mr-2 h-4 w-4" />
              Session Security
            </TabsTrigger>
          </TabsList>
          
          {/* Password Policy Tab */}
          <TabsContent value="password" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Lock className="mr-2 h-5 w-5" />
                  <CardTitle>Password Requirements</CardTitle>
                </div>
                <CardDescription>
                  Configure password complexity and security requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-md bg-amber-50 p-4 dark:bg-amber-900/20">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">Password Policy</h3>
                      <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                        <p>These settings affect all users in your organization. Changes to password policy will apply to new passwords only.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="minLength">Minimum Password Length</Label>
                    <Input
                      id="minLength"
                      type="number"
                      min="8"
                      max="32"
                      value={settings.password.minLength}
                      onChange={(e) => handlePasswordSettingChange('minLength', parseInt(e.target.value) || 8)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiryDays">Password Expiry (days)</Label>
                    <Input
                      id="passwordExpiryDays"
                      type="number"
                      min="0"
                      max="365"
                      value={settings.password.passwordExpiryDays}
                      onChange={(e) => handlePasswordSettingChange('passwordExpiryDays', parseInt(e.target.value) || 90)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Set to 0 to disable password expiry
                    </p>
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="preventReuseCount">Prevent Password Reuse</Label>
                    <Input
                      id="preventReuseCount"
                      type="number"
                      min="0"
                      max="24"
                      value={settings.password.preventReuseCount}
                      onChange={(e) => handlePasswordSettingChange('preventReuseCount', parseInt(e.target.value) || 5)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of previous passwords that cannot be reused (0 to disable)
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Password Complexity Requirements</Label>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requireUppercase"
                        checked={settings.password.requireUppercase}
                        onCheckedChange={(checked) => handlePasswordSettingChange('requireUppercase', checked)}
                      />
                      <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requireLowercase"
                        checked={settings.password.requireLowercase}
                        onCheckedChange={(checked) => handlePasswordSettingChange('requireLowercase', checked)}
                      />
                      <Label htmlFor="requireLowercase">Require Lowercase Letters</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requireNumbers"
                        checked={settings.password.requireNumbers}
                        onCheckedChange={(checked) => handlePasswordSettingChange('requireNumbers', checked)}
                      />
                      <Label htmlFor="requireNumbers">Require Numbers</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requireSpecialChars"
                        checked={settings.password.requireSpecialChars}
                        onCheckedChange={(checked) => handlePasswordSettingChange('requireSpecialChars', checked)}
                      />
                      <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={goBackToSettings}>Cancel</Button>
                <Button 
                  onClick={saveSettings} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Authentication Tab */}
          <TabsContent value="authentication" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  <CardTitle>Authentication Security</CardTitle>
                </div>
                <CardDescription>
                  Configure login security and two-factor authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      min="1"
                      max="10"
                      value={settings.authentication.maxLoginAttempts}
                      onChange={(e) => handleAuthSettingChange('maxLoginAttempts', parseInt(e.target.value) || 5)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of failed attempts before account lockout
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lockoutDuration">Account Lockout Duration (minutes)</Label>
                    <Input
                      id="lockoutDuration"
                      type="number"
                      min="5"
                      max="1440"
                      value={settings.authentication.lockoutDuration}
                      onChange={(e) => handleAuthSettingChange('lockoutDuration', parseInt(e.target.value) || 30)}
                    />
                    <p className="text-xs text-muted-foreground">
                      How long users are locked out after too many failed attempts
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mfaRequired">Multi-Factor Authentication</Label>
                  <Select 
                    value={settings.authentication.mfaRequired}
                    onValueChange={(value) => handleAuthSettingChange('mfaRequired', value)}
                  >
                    <SelectTrigger id="mfaRequired">
                      <SelectValue placeholder="Select MFA policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disabled">Disabled</SelectItem>
                      <SelectItem value="optional">Optional (recommended)</SelectItem>
                      <SelectItem value="required">Required for all users</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Enable two-factor authentication for additional security
                  </p>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requireCaptcha">CAPTCHA Protection</Label>
                    <p className="text-sm text-muted-foreground">
                      Show CAPTCHA challenges on login attempts
                    </p>
                  </div>
                  <Switch
                    id="requireCaptcha"
                    checked={settings.authentication.requireCaptcha}
                    onCheckedChange={(checked) => handleAuthSettingChange('requireCaptcha', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowRememberMe">Remember Me Feature</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to stay logged in on trusted devices
                    </p>
                  </div>
                  <Switch
                    id="allowRememberMe"
                    checked={settings.authentication.allowRememberMe}
                    onCheckedChange={(checked) => handleAuthSettingChange('allowRememberMe', checked)}
                  />
                </div>
                
                {settings.authentication.allowRememberMe && (
                  <div className="space-y-2">
                    <Label htmlFor="rememberDeviceDays">Remember Device (days)</Label>
                    <Input
                      id="rememberDeviceDays"
                      type="number"
                      min="1"
                      max="90"
                      value={settings.authentication.rememberDeviceDays}
                      onChange={(e) => handleAuthSettingChange('rememberDeviceDays', parseInt(e.target.value) || 30)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum days to remember trusted devices
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={goBackToSettings}>Cancel</Button>
                <Button 
                  onClick={saveSettings} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Session Security Tab */}
          <TabsContent value="session" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  <CardTitle>Session Security</CardTitle>
                </div>
                <CardDescription>
                  Configure user session security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="5"
                      max="1440"
                      value={settings.session.sessionTimeout}
                      onChange={(e) => handleSessionSettingChange('sessionTimeout', parseInt(e.target.value) || 60)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Time before inactive sessions are automatically logged out
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="extendSessionOnActivity">Extend Session on Activity</Label>
                    <p className="text-sm text-muted-foreground">
                      Reset timeout timer when user performs actions
                    </p>
                  </div>
                  <Switch
                    id="extendSessionOnActivity"
                    checked={settings.session.extendSessionOnActivity}
                    onCheckedChange={(checked) => handleSessionSettingChange('extendSessionOnActivity', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enforceOneSession">Single Session</Label>
                    <p className="text-sm text-muted-foreground">
                      Users can only be logged in on one device at a time
                    </p>
                  </div>
                  <Switch
                    id="enforceOneSession"
                    checked={settings.session.enforceOneSession}
                    onCheckedChange={(checked) => handleSessionSettingChange('enforceOneSession', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requireReauthForSensitive">Require Re-authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require password re-entry for sensitive operations
                    </p>
                  </div>
                  <Switch
                    id="requireReauthForSensitive"
                    checked={settings.session.requireReauthForSensitive}
                    onCheckedChange={(checked) => handleSessionSettingChange('requireReauthForSensitive', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ipChangeValidation">IP Change Validation</Label>
                    <p className="text-sm text-muted-foreground">
                      Validate session when user's IP address changes
                    </p>
                  </div>
                  <Switch
                    id="ipChangeValidation"
                    checked={settings.session.ipChangeValidation}
                    onCheckedChange={(checked) => handleSessionSettingChange('ipChangeValidation', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="deviceChangeValidation">Device Change Validation</Label>
                    <p className="text-sm text-muted-foreground">
                      Validate session when user's device fingerprint changes
                    </p>
                  </div>
                  <Switch
                    id="deviceChangeValidation"
                    checked={settings.session.deviceChangeValidation}
                    onCheckedChange={(checked) => handleSessionSettingChange('deviceChangeValidation', checked)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={goBackToSettings}>Cancel</Button>
                <Button 
                  onClick={saveSettings} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SettingsLayout>
  );
} 