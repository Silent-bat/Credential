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
  Database,
  Shield,
  RefreshCw,
  AlertTriangle,
  Trash2,
  FileText,
  HardDrive,
  Server,
  Clock,
  Table,
  BarChart,
  Info,
  Activity,
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Table as UITable,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DatabaseSettingsPage() {
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const baseUrl = `/${locale}/dashboard/admin/settings`;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isRunningOptimization, setIsRunningOptimization] = useState(false);
  
  const [dbSettings, setDbSettings] = useState({
    connection: {
      driver: 'postgresql',
      host: 'localhost',
      port: '5432',
      database: 'credential_verifier',
      username: 'postgres',
      password: '********',
      sslEnabled: true,
    },
    performance: {
      maxConnections: 50,
      connectionTimeout: 30,
      statementTimeout: 60,
      idleTimeout: 600,
      queryLogging: false,
      slowQueryThreshold: 1000,
    },
    caching: {
      enabled: true,
      ttl: 3600,
      maxItems: 1000,
      clearOnUpdate: true,
    }
  });
  
  const [maintenanceStatus, setMaintenanceStatus] = useState({
    lastBackup: '2023-10-15 03:00:00',
    lastOptimization: '2023-10-10 01:30:00',
    dataSize: '1.24 GB',
    indexSize: '320 MB',
    uptime: '15 days, 7 hours',
    connectionCount: 12,
    transactionCount: 2547893,
  });
  
  const [dbStats, setDbStats] = useState([
    { table: 'users', rows: 1250, size: '8 MB', lastUpdated: '2023-10-15' },
    { table: 'certificates', rows: 5782, size: '450 MB', lastUpdated: '2023-10-15' },
    { table: 'institutions', rows: 124, size: '3 MB', lastUpdated: '2023-10-14' },
    { table: 'verifications', rows: 9834, size: '120 MB', lastUpdated: '2023-10-15' },
    { table: 'logs', rows: 89245, size: '640 MB', lastUpdated: '2023-10-15' },
  ]);
  
  const handleConnectionSettingChange = (field: string, value: any) => {
    setDbSettings(prev => ({
      ...prev,
      connection: {
        ...prev.connection,
        [field]: value
      }
    }));
  };
  
  const handlePerformanceSettingChange = (field: string, value: any) => {
    setDbSettings(prev => ({
      ...prev,
      performance: {
        ...prev.performance,
        [field]: value
      }
    }));
  };
  
  const handleCachingSettingChange = (field: string, value: any) => {
    setDbSettings(prev => ({
      ...prev,
      caching: {
        ...prev.caching,
        [field]: value
      }
    }));
  };
  
  const saveSettings = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Database settings saved successfully');
    } catch (error) {
      toast.error('Failed to save database settings');
    } finally {
      setIsLoading(false);
    }
  };
  
  const testConnection = async () => {
    setIsTestingConnection(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      toast.success('Database connection successful');
    } catch (error) {
      toast.error('Database connection failed');
    } finally {
      setIsTestingConnection(false);
    }
  };
  
  const runDatabaseOptimization = async () => {
    setIsRunningOptimization(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('Database optimization completed successfully');
      setMaintenanceStatus(prev => ({
        ...prev,
        lastOptimization: new Date().toLocaleString()
      }));
    } catch (error) {
      toast.error('Database optimization failed');
    } finally {
      setIsRunningOptimization(false);
    }
  };
  
  return (
    <SettingsLayout baseUrl={baseUrl}>
      <div className="space-y-6">
        <Tabs defaultValue="connection">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connection" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  <CardTitle>Database Connection</CardTitle>
                </div>
                <CardDescription>
                  Configure database connection settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="driver">Database Driver</Label>
                    <Select 
                      value={dbSettings.connection.driver} 
                      onValueChange={(value) => handleConnectionSettingChange('driver', value)}
                    >
                      <SelectTrigger id="driver">
                        <SelectValue placeholder="Select database driver" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="postgresql">PostgreSQL</SelectItem>
                        <SelectItem value="mysql">MySQL</SelectItem>
                        <SelectItem value="sqlserver">SQL Server</SelectItem>
                        <SelectItem value="sqlite">SQLite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="host">Host</Label>
                    <Input
                      id="host"
                      value={dbSettings.connection.host}
                      onChange={(e) => handleConnectionSettingChange('host', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      value={dbSettings.connection.port}
                      onChange={(e) => handleConnectionSettingChange('port', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="database">Database Name</Label>
                    <Input
                      id="database"
                      value={dbSettings.connection.database}
                      onChange={(e) => handleConnectionSettingChange('database', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={dbSettings.connection.username}
                      onChange={(e) => handleConnectionSettingChange('username', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={dbSettings.connection.password}
                      onChange={(e) => handleConnectionSettingChange('password', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sslEnabled">Enable SSL</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable secure SSL connection to the database
                    </p>
                  </div>
                  <Switch
                    id="sslEnabled"
                    checked={dbSettings.connection.sslEnabled}
                    onCheckedChange={(checked) => handleConnectionSettingChange('sslEnabled', checked)}
                  />
                </div>
                
                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={testConnection}
                    disabled={isTestingConnection || isLoading}
                    className="flex items-center"
                  >
                    {isTestingConnection ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <Database className="mr-2 h-4 w-4" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  <CardTitle>Database Security</CardTitle>
                </div>
                <CardDescription>
                  Configure database security settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-amber-50 p-4 dark:bg-amber-900/20">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">Security Recommendations</h3>
                      <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                        <ul className="list-disc space-y-1 pl-5">
                          <li>Use a strong, unique password for database access</li>
                          <li>Enable SSL/TLS for all database connections</li>
                          <li>Limit database user permissions to only what is necessary</li>
                          <li>Keep your database server updated with the latest security patches</li>
                          <li>Configure a firewall to restrict database access to known IP addresses</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  <CardTitle>Performance Settings</CardTitle>
                </div>
                <CardDescription>
                  Configure database performance and optimization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxConnections">Max Connections</Label>
                    <Input
                      id="maxConnections"
                      type="number"
                      min="1"
                      max="1000"
                      value={dbSettings.performance.maxConnections}
                      onChange={(e) => handlePerformanceSettingChange('maxConnections', parseInt(e.target.value) || 50)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum number of simultaneous database connections
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="connectionTimeout">Connection Timeout (seconds)</Label>
                    <Input
                      id="connectionTimeout"
                      type="number"
                      min="1"
                      max="300"
                      value={dbSettings.performance.connectionTimeout}
                      onChange={(e) => handlePerformanceSettingChange('connectionTimeout', parseInt(e.target.value) || 30)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Time to wait for a new connection before timing out
                    </p>
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="statementTimeout">Statement Timeout (seconds)</Label>
                    <Input
                      id="statementTimeout"
                      type="number"
                      min="0"
                      max="3600"
                      value={dbSettings.performance.statementTimeout}
                      onChange={(e) => handlePerformanceSettingChange('statementTimeout', parseInt(e.target.value) || 60)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum time allowed for any statement to execute (0 for no limit)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="idleTimeout">Idle Timeout (seconds)</Label>
                    <Input
                      id="idleTimeout"
                      type="number"
                      min="0"
                      max="7200"
                      value={dbSettings.performance.idleTimeout}
                      onChange={(e) => handlePerformanceSettingChange('idleTimeout', parseInt(e.target.value) || 600)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Time to wait before closing an idle connection
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="queryLogging">Query Logging</Label>
                      <p className="text-sm text-muted-foreground">
                        Log all database queries for debugging (high performance impact)
                      </p>
                    </div>
                    <Switch
                      id="queryLogging"
                      checked={dbSettings.performance.queryLogging}
                      onCheckedChange={(checked) => handlePerformanceSettingChange('queryLogging', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="slowQueryThreshold">Slow Query Threshold (ms)</Label>
                    <Input
                      id="slowQueryThreshold"
                      type="number"
                      min="0"
                      max="10000"
                      value={dbSettings.performance.slowQueryThreshold}
                      onChange={(e) => handlePerformanceSettingChange('slowQueryThreshold', parseInt(e.target.value) || 1000)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Log queries that take longer than this threshold (milliseconds)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <HardDrive className="mr-2 h-5 w-5" />
                  <CardTitle>Caching Settings</CardTitle>
                </div>
                <CardDescription>
                  Configure database query caching
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="cachingEnabled">Enable Query Caching</Label>
                    <p className="text-sm text-muted-foreground">
                      Cache query results to improve performance
                    </p>
                  </div>
                  <Switch
                    id="cachingEnabled"
                    checked={dbSettings.caching.enabled}
                    onCheckedChange={(checked) => handleCachingSettingChange('enabled', checked)}
                  />
                </div>
                
                {dbSettings.caching.enabled && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="cacheTtl">Cache TTL (seconds)</Label>
                        <Input
                          id="cacheTtl"
                          type="number"
                          min="1"
                          max="86400"
                          value={dbSettings.caching.ttl}
                          onChange={(e) => handleCachingSettingChange('ttl', parseInt(e.target.value) || 3600)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Time-to-live for cached queries
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cacheMaxItems">Max Cache Items</Label>
                        <Input
                          id="cacheMaxItems"
                          type="number"
                          min="100"
                          max="10000"
                          value={dbSettings.caching.maxItems}
                          onChange={(e) => handleCachingSettingChange('maxItems', parseInt(e.target.value) || 1000)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Maximum number of items to store in cache
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="clearOnUpdate">Clear Cache on Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically clear affected cache entries when data is updated
                        </p>
                      </div>
                      <Switch
                        id="clearOnUpdate"
                        checked={dbSettings.caching.clearOnUpdate}
                        onCheckedChange={(checked) => handleCachingSettingChange('clearOnUpdate', checked)}
                      />
                    </div>
                    
                    <div className="pt-2">
                      <Button variant="outline" className="flex items-center">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear Entire Cache
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Server className="mr-2 h-5 w-5" />
                  <CardTitle>Database Status</CardTitle>
                </div>
                <CardDescription>
                  Current database status and metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Last Backup</p>
                    <p className="text-sm">{maintenanceStatus.lastBackup}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Last Optimization</p>
                    <p className="text-sm">{maintenanceStatus.lastOptimization}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Database Size</p>
                    <p className="text-sm">{maintenanceStatus.dataSize}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Index Size</p>
                    <p className="text-sm">{maintenanceStatus.indexSize}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                    <p className="text-sm">{maintenanceStatus.uptime}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Current Connections</p>
                    <p className="text-sm">{maintenanceStatus.connectionCount}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-3">Table Statistics</h3>
                  <UITable>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Table</TableHead>
                        <TableHead className="text-right">Rows</TableHead>
                        <TableHead className="text-right">Size</TableHead>
                        <TableHead>Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dbStats.map((stat) => (
                        <TableRow key={stat.table}>
                          <TableCell className="font-medium">{stat.table}</TableCell>
                          <TableCell className="text-right">{stat.rows.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{stat.size}</TableCell>
                          <TableCell>{stat.lastUpdated}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </UITable>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <RefreshCw className="mr-2 h-5 w-5" />
                  <CardTitle>Maintenance Tasks</CardTitle>
                </div>
                <CardDescription>
                  Database maintenance operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="rounded-md bg-muted p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">Scheduled Maintenance</h3>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>Database maintenance tasks are automatically scheduled to run during low-usage periods. You can also run them manually below.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Button
                              variant="outline"
                              onClick={runDatabaseOptimization}
                              disabled={isRunningOptimization || isLoading}
                              className="flex items-center w-full justify-center"
                            >
                              {isRunningOptimization ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Optimizing...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Optimize Database
                                </>
                              )}
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Run VACUUM, ANALYZE and reindex operations</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <Button
                      variant="outline"
                      disabled={isLoading}
                      className="flex items-center justify-center"
                    >
                      <Table className="mr-2 h-4 w-4" />
                      Run Database Check
                    </Button>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Button
                      variant="outline"
                      disabled={isLoading}
                      className="flex items-center justify-center"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Database Logs
                    </Button>
                    
                    <Button
                      variant="outline"
                      disabled={isLoading}
                      className="flex items-center justify-center"
                    >
                      <BarChart className="mr-2 h-4 w-4" />
                      View Performance Metrics
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
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