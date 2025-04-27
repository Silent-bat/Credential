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
import { Separator } from '@/components/ui/separator';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'react-hot-toast';
import {
  ShieldAlert,
  RefreshCw,
  AlertTriangle,
  Lock,
  Clock,
  UserPlus,
  Shield,
  Network,
  FileCheck
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Create custom switch and slider components to avoid import errors
const Switch = ({ checked, onCheckedChange }: { checked: boolean, onCheckedChange: (checked: boolean) => void }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-input'
      }`}
      onClick={() => onCheckedChange(!checked)}
    >
      <span
        className={`${
          checked ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-background transition-transform`}
      />
    </button>
  );
};

const Slider = ({ 
  id, 
  min, 
  max, 
  step, 
  value, 
  onValueChange 
}: { 
  id: string; 
  min: number; 
  max: number; 
  step: number; 
  value: number[]; 
  onValueChange: (value: number[]) => void;
}) => {
  return (
    <div className="relative w-full h-5 flex items-center">
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => onValueChange([parseInt(e.target.value)])}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
      />
    </div>
  );
};

export default function SystemSecurityPage() {
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const baseUrl = `/${locale}/dashboard/admin/settings`;
  
  const [isLoading, setIsLoading] = useState(false);
  
  const [securitySettings, setSecuritySettings] = useState({
    // Session settings
    sessionTimeout: 30, // minutes
    maxFailedLogins: 5,
    loginThrottling: true,
    
    // Password Policy
    requireStrongPasswords: true,
    passwordRotationDays: 90,
    preventPasswordReuse: true,
    
    // Access Controls
    ipRestriction: false,
    allowedIPs: "",
    twoFactorEnforced: false,
    
    // API Security
    rateLimit: 100, // requests per minute
    corsPolicy: "strict", // strict, moderate, permissive
    
    // Audit Settings
    auditLogging: true,
    logRetentionDays: 90,
    sensitiveOperationsAlerts: true
  });
  
  const handleSettingChange = (setting: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  const saveSettings = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('System security settings saved successfully');
    } catch (error) {
      toast.error('Failed to save system security settings');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SettingsLayout>
      <div className="space-y-6">
        {/* Session Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Session Security
            </CardTitle>
            <CardDescription>
              Configure session timeout and login security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <span className="text-sm text-muted-foreground">{securitySettings.sessionTimeout} min</span>
                </div>
                <Slider
                  id="sessionTimeout"
                  min={5}
                  max={120}
                  step={5}
                  value={[securitySettings.sessionTimeout]}
                  onValueChange={(value) => handleSettingChange('sessionTimeout', value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Users will be automatically logged out after this period of inactivity
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maxFailedLogins">Maximum Failed Login Attempts</Label>
                  <span className="text-sm text-muted-foreground">{securitySettings.maxFailedLogins}</span>
                </div>
                <Slider
                  id="maxFailedLogins"
                  min={1}
                  max={10}
                  step={1}
                  value={[securitySettings.maxFailedLogins]}
                  onValueChange={(value) => handleSettingChange('maxFailedLogins', value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Accounts will be temporarily locked after this many failed login attempts
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Login Throttling</Label>
                  <p className="text-sm text-muted-foreground">
                    Add a delay between login attempts to prevent brute force attacks
                  </p>
                </div>
                <Switch
                  checked={securitySettings.loginThrottling}
                  onCheckedChange={(checked: boolean) => handleSettingChange('loginThrottling', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Password Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Password Policy
            </CardTitle>
            <CardDescription>
              Set organization-wide password requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Strong Passwords</Label>
                <p className="text-sm text-muted-foreground">
                  Passwords must contain uppercase, lowercase, numbers, and symbols
                </p>
              </div>
              <Switch
                checked={securitySettings.requireStrongPasswords}
                onCheckedChange={(checked: boolean) => handleSettingChange('requireStrongPasswords', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="passwordRotationDays">Password Rotation (days)</Label>
                <span className="text-sm text-muted-foreground">{securitySettings.passwordRotationDays} days</span>
              </div>
              <Slider
                id="passwordRotationDays"
                min={0}
                max={365}
                step={30}
                value={[securitySettings.passwordRotationDays]}
                onValueChange={(value) => handleSettingChange('passwordRotationDays', value[0])}
              />
              <p className="text-xs text-muted-foreground">
                {securitySettings.passwordRotationDays === 0 
                  ? "Password rotation is disabled" 
                  : `Users will be required to change passwords every ${securitySettings.passwordRotationDays} days`}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Prevent Password Reuse</Label>
                <p className="text-sm text-muted-foreground">
                  Users cannot reuse their previous passwords
                </p>
              </div>
              <Switch
                checked={securitySettings.preventPasswordReuse}
                onCheckedChange={(checked: boolean) => handleSettingChange('preventPasswordReuse', checked)}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Access Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Controls
            </CardTitle>
            <CardDescription>
              Configure IP restrictions and authentication requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>IP Address Restriction</Label>
                  <p className="text-sm text-muted-foreground">
                    Limit system access to specific IP addresses
                  </p>
                </div>
                <Switch
                  checked={securitySettings.ipRestriction}
                  onCheckedChange={(checked: boolean) => handleSettingChange('ipRestriction', checked)}
                />
              </div>
              
              {securitySettings.ipRestriction && (
                <div className="space-y-2">
                  <Label htmlFor="allowedIPs">Allowed IP Addresses</Label>
                  <Input
                    id="allowedIPs"
                    placeholder="e.g., 192.168.1.1, 10.0.0.0/24"
                    value={securitySettings.allowedIPs}
                    onChange={(e) => handleSettingChange('allowedIPs', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter comma-separated IP addresses or CIDR notation
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enforce Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require all users to set up two-factor authentication
                  </p>
                </div>
                <Switch
                  checked={securitySettings.twoFactorEnforced}
                  onCheckedChange={(checked: boolean) => handleSettingChange('twoFactorEnforced', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* API Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              API Security
            </CardTitle>
            <CardDescription>
              Configure API rate limits and access controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="rateLimit">API Rate Limit (requests per minute)</Label>
                  <span className="text-sm text-muted-foreground">{securitySettings.rateLimit} req/min</span>
                </div>
                <Slider
                  id="rateLimit"
                  min={10}
                  max={1000}
                  step={10}
                  value={[securitySettings.rateLimit]}
                  onValueChange={(value) => handleSettingChange('rateLimit', value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of API requests allowed per minute per client
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="corsPolicy">CORS Policy</Label>
                <Select 
                  value={securitySettings.corsPolicy} 
                  onValueChange={(value) => handleSettingChange('corsPolicy', value)}
                >
                  <SelectTrigger id="corsPolicy">
                    <SelectValue placeholder="Select CORS policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strict">Strict (Same Origin Only)</SelectItem>
                    <SelectItem value="moderate">Moderate (Limited Origins)</SelectItem>
                    <SelectItem value="permissive">Permissive (All Origins)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Controls which domains can access your API
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Audit and Logging */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Audit and Logging
            </CardTitle>
            <CardDescription>
              Configure system-wide logging and notification settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Audit Logging</Label>
                <p className="text-sm text-muted-foreground">
                  Keep detailed logs of all system activities
                </p>
              </div>
              <Switch
                checked={securitySettings.auditLogging}
                onCheckedChange={(checked: boolean) => handleSettingChange('auditLogging', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="logRetentionDays">Log Retention Period (days)</Label>
                <span className="text-sm text-muted-foreground">{securitySettings.logRetentionDays} days</span>
              </div>
              <Slider
                id="logRetentionDays"
                min={30}
                max={365}
                step={30}
                value={[securitySettings.logRetentionDays]}
                onValueChange={(value) => handleSettingChange('logRetentionDays', value[0])}
              />
              <p className="text-xs text-muted-foreground">
                How long to keep audit logs before automatic deletion
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sensitive Operations Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Send alerts for sensitive operations like user permission changes
                </p>
              </div>
              <Switch
                checked={securitySettings.sensitiveOperationsAlerts}
                onCheckedChange={(checked: boolean) => handleSettingChange('sensitiveOperationsAlerts', checked)}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Save Button */}
        <Card>
          <CardFooter className="flex justify-between pt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                // Reset to default settings
                setSecuritySettings({
                  sessionTimeout: 30,
                  maxFailedLogins: 5,
                  loginThrottling: true,
                  requireStrongPasswords: true,
                  passwordRotationDays: 90,
                  preventPasswordReuse: true,
                  ipRestriction: false,
                  allowedIPs: "",
                  twoFactorEnforced: false,
                  rateLimit: 100,
                  corsPolicy: "strict",
                  auditLogging: true,
                  logRetentionDays: 90,
                  sensitiveOperationsAlerts: true
                });
                toast.success('Settings reset to defaults');
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
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