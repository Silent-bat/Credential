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
import { toast } from 'react-hot-toast';
import {
  Shield,
  AlertTriangle,
  Lock,
  Eye,
  Key,
  User,
  Clock,
  FileText,
  RefreshCw,
  ShieldAlert,
  Fingerprint,
  Mail,
  Network,
  XCircle,
  CheckCircle,
  Download,
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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function SystemSecuritySettingsPage() {
  const params = useParams();
  const locale = params?.locale as string || 'en';
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  
  const [securitySettings, setSecuritySettings] = useState({
    authentication: {
      minPasswordLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      passwordExpiryDays: 90,
      preventReuseCount: 5,
      maxLoginAttempts: 5,
      mfaRequired: 'optional', // 'disabled', 'optional', 'required'
      rememberDeviceDays: 30,
    },
    session: {
      sessionTimeout: 30,
      extendSessionOnActivity: true,
      enforceOneSession: false,
      requireReauthForSensitive: true,
      ipChangeValidation: true,
      deviceChangeValidation: true,
    },
    api: {
      enableApiAccess: true,
      apiRateLimiting: true,
      requestsPerMinute: 60,
      apiKeyExpiryDays: 90,
      requireTLS: true,
    }
  });
  
  const [securityAudit, setSecurityAudit] = useState({
    lastAudit: '2023-10-10 08:15:22',
    securityScore: 87,
    criticalIssues: 0,
    highIssues: 1,
    mediumIssues: 3,
    lowIssues: 5,
    findings: [
      { id: 1, severity: 'high', title: 'No rate limiting on login endpoints', status: 'open' },
      { id: 2, severity: 'medium', title: 'Password policy not enforced on API keys', status: 'open' },
      { id: 3, severity: 'medium', title: 'Session timeout too long', status: 'fixed' },
      { id: 4, severity: 'medium', title: 'MFA not required for admins', status: 'open' },
      { id: 5, severity: 'low', title: 'CORS policy too permissive', status: 'open' },
    ]
  });
  
  const handleAuthSettingChange = (field: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      authentication: {
        ...prev.authentication,
        [field]: value
      }
    }));
  };
  
  const handleSessionSettingChange = (field: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      session: {
        ...prev.session,
        [field]: value
      }
    }));
  };
  
  const handleApiSettingChange = (field: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      api: {
        ...prev.api,
        [field]: value
      }
    }));
  };
  
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
  
  const runSecurityAudit = async () => {
    setIsRunningAudit(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setSecurityAudit(prev => ({
        ...prev,
        lastAudit: new Date().toLocaleString(),
        securityScore: Math.floor(Math.random() * 15) + 80, // Random score between 80-95
      }));
      
      toast.success('Security audit completed successfully');
    } catch (error) {
      toast.error('Failed to run security audit');
    } finally {
      setIsRunningAudit(false);
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'high': return 'text-orange-500 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      case 'medium': return 'text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
      case 'low': return 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      default: return 'text-gray-500 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fixed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-amber-500" />;
      case 'open':
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };
  
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              <CardTitle>System Security Audit</CardTitle>
            </div>
            <CardDescription>
              Security audit results and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="flex flex-col items-center justify-center rounded-lg border bg-background p-4">
                <div className="text-2xl font-bold text-primary">{securityAudit.securityScore}%</div>
                <div className="text-xs text-muted-foreground">Security Score</div>
              </div>
              
              <div className="flex flex-col items-center justify-center rounded-lg border bg-background p-4">
                <div className="text-2xl font-bold text-red-500">{securityAudit.criticalIssues}</div>
                <div className="text-xs text-muted-foreground">Critical Issues</div>
              </div>
              
              <div className="flex flex-col items-center justify-center rounded-lg border bg-background p-4">
                <div className="text-2xl font-bold text-orange-500">{securityAudit.highIssues}</div>
                <div className="text-xs text-muted-foreground">High Issues</div>
              </div>
              
              <div className="flex flex-col items-center justify-center rounded-lg border bg-background p-4">
                <div className="text-2xl font-bold text-amber-500">{securityAudit.mediumIssues + securityAudit.lowIssues}</div>
                <div className="text-xs text-muted-foreground">Medium/Low Issues</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Security Findings</h3>
                <p className="text-sm text-muted-foreground">Last audit: {securityAudit.lastAudit}</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={runSecurityAudit}
                  disabled={isRunningAudit}
                  className="flex items-center"
                >
                  {isRunningAudit ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Running Audit...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Run New Audit
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>Finding</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityAudit.findings.map((finding) => (
                    <TableRow key={finding.id}>
                      <TableCell>
                        <Badge className={`${getSeverityColor(finding.severity)}`}>
                          {finding.severity.charAt(0).toUpperCase() + finding.severity.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{finding.title}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">
                          {getStatusIcon(finding.status)}
                          <span className="ml-2 text-xs">
                            {finding.status === 'fixed' ? 'Fixed' : 
                             finding.status === 'in_progress' ? 'In Progress' : 'Open'}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Lock className="mr-2 h-5 w-5" />
              <CardTitle>Authentication Security</CardTitle>
            </div>
            <CardDescription>
              Configure system-wide authentication security policies
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
                <Label htmlFor="minPasswordLength">Minimum Password Length</Label>
                <Input
                  id="minPasswordLength"
                  type="number"
                  min="8"
                  max="32"
                  value={securitySettings.authentication.minPasswordLength}
                  onChange={(e) => handleAuthSettingChange('minPasswordLength', parseInt(e.target.value) || 8)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="passwordExpiryDays">Password Expiry (days)</Label>
                <Input
                  id="passwordExpiryDays"
                  type="number"
                  min="0"
                  max="365"
                  value={securitySettings.authentication.passwordExpiryDays}
                  onChange={(e) => handleAuthSettingChange('passwordExpiryDays', parseInt(e.target.value) || 90)}
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
                  value={securitySettings.authentication.preventReuseCount}
                  onChange={(e) => handleAuthSettingChange('preventReuseCount', parseInt(e.target.value) || 5)}
                />
                <p className="text-xs text-muted-foreground">
                  Number of previous passwords that cannot be reused (0 to disable)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  min="1"
                  max="10"
                  value={securitySettings.authentication.maxLoginAttempts}
                  onChange={(e) => handleAuthSettingChange('maxLoginAttempts', parseInt(e.target.value) || 5)}
                />
                <p className="text-xs text-muted-foreground">
                  Number of failed attempts before account lockout
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mfaRequired">Multi-Factor Authentication</Label>
              <Select 
                value={securitySettings.authentication.mfaRequired} 
                onValueChange={(value) => handleAuthSettingChange('mfaRequired', value)}
              >
                <SelectTrigger id="mfaRequired">
                  <SelectValue placeholder="Select MFA policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disabled">Disabled</SelectItem>
                  <SelectItem value="optional">Optional (User Choice)</SelectItem>
                  <SelectItem value="required">Required for All Users</SelectItem>
                </SelectContent>
              </Select>
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
                    checked={securitySettings.authentication.requireUppercase}
                    onCheckedChange={(checked) => handleAuthSettingChange('requireUppercase', checked)}
                  />
                  <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireLowercase"
                    checked={securitySettings.authentication.requireLowercase}
                    onCheckedChange={(checked) => handleAuthSettingChange('requireLowercase', checked)}
                  />
                  <Label htmlFor="requireLowercase">Require Lowercase Letters</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireNumbers"
                    checked={securitySettings.authentication.requireNumbers}
                    onCheckedChange={(checked) => handleAuthSettingChange('requireNumbers', checked)}
                  />
                  <Label htmlFor="requireNumbers">Require Numbers</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireSpecialChars"
                    checked={securitySettings.authentication.requireSpecialChars}
                    onCheckedChange={(checked) => handleAuthSettingChange('requireSpecialChars', checked)}
                  />
                  <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <User className="mr-2 h-5 w-5" />
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
                  value={securitySettings.session.sessionTimeout}
                  onChange={(e) => handleSessionSettingChange('sessionTimeout', parseInt(e.target.value) || 30)}
                />
                <p className="text-xs text-muted-foreground">
                  Time before inactive sessions are automatically logged out
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rememberDeviceDays">Remember Device (days)</Label>
                <Input
                  id="rememberDeviceDays"
                  type="number"
                  min="0"
                  max="90"
                  value={securitySettings.authentication.rememberDeviceDays}
                  onChange={(e) => handleAuthSettingChange('rememberDeviceDays', parseInt(e.target.value) || 30)}
                />
                <p className="text-xs text-muted-foreground">
                  Days to remember trusted devices (0 to disable)
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="extendSessionOnActivity">Extend Session on Activity</Label>
                  <p className="text-sm text-muted-foreground">
                    Reset session timeout countdown when user is active
                  </p>
                </div>
                <Switch
                  id="extendSessionOnActivity"
                  checked={securitySettings.session.extendSessionOnActivity}
                  onCheckedChange={(checked) => handleSessionSettingChange('extendSessionOnActivity', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enforceOneSession">Enforce Single Session</Label>
                  <p className="text-sm text-muted-foreground">
                    Only allow one active session per user (logout other sessions)
                  </p>
                </div>
                <Switch
                  id="enforceOneSession"
                  checked={securitySettings.session.enforceOneSession}
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
                  checked={securitySettings.session.requireReauthForSensitive}
                  onCheckedChange={(checked) => handleSessionSettingChange('requireReauthForSensitive', checked)}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ipChangeValidation">IP Change Validation</Label>
                  <p className="text-sm text-muted-foreground">
                    Validate session when user's IP address changes
                  </p>
                </div>
                <Switch
                  id="ipChangeValidation"
                  checked={securitySettings.session.ipChangeValidation}
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
                  checked={securitySettings.session.deviceChangeValidation}
                  onCheckedChange={(checked) => handleSessionSettingChange('deviceChangeValidation', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Network className="mr-2 h-5 w-5" />
              <CardTitle>API Security</CardTitle>
            </div>
            <CardDescription>
              Configure API security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableApiAccess">Enable API Access</Label>
                <p className="text-sm text-muted-foreground">
                  Allow programmatic access to the application via API
                </p>
              </div>
              <Switch
                id="enableApiAccess"
                checked={securitySettings.api.enableApiAccess}
                onCheckedChange={(checked) => handleApiSettingChange('enableApiAccess', checked)}
              />
            </div>
            
            {securitySettings.api.enableApiAccess && (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="apiRateLimiting">Enable Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">
                      Limit API request frequency to prevent abuse
                    </p>
                  </div>
                  <Switch
                    id="apiRateLimiting"
                    checked={securitySettings.api.apiRateLimiting}
                    onCheckedChange={(checked) => handleApiSettingChange('apiRateLimiting', checked)}
                  />
                </div>
                
                {securitySettings.api.apiRateLimiting && (
                  <div className="space-y-2">
                    <Label htmlFor="requestsPerMinute">Requests Per Minute</Label>
                    <Input
                      id="requestsPerMinute"
                      type="number"
                      min="10"
                      max="1000"
                      value={securitySettings.api.requestsPerMinute}
                      onChange={(e) => handleApiSettingChange('requestsPerMinute', parseInt(e.target.value) || 60)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum number of API requests allowed per minute per API key
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="apiKeyExpiryDays">API Key Expiry (days)</Label>
                  <Input
                    id="apiKeyExpiryDays"
                    type="number"
                    min="0"
                    max="365"
                    value={securitySettings.api.apiKeyExpiryDays}
                    onChange={(e) => handleApiSettingChange('apiKeyExpiryDays', parseInt(e.target.value) || 90)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Days before API keys expire and need to be renewed (0 for no expiration)
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requireTLS">Require TLS/SSL</Label>
                    <p className="text-sm text-muted-foreground">
                      Only allow API access over secure HTTPS connections
                    </p>
                  </div>
                  <Switch
                    id="requireTLS"
                    checked={securitySettings.api.requireTLS}
                    onCheckedChange={(checked) => handleApiSettingChange('requireTLS', checked)}
                  />
                </div>
              </>
            )}
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