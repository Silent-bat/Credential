"use client";

import { useState } from "react";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Filter,
  Search,
  Download,
  Clock,
  Calendar,
  User,
  Activity,
  Shield,
  AlertTriangle,
  Info,
  Check,
  ArrowDownToLine,
  AlertCircle,
  FileCheck,
} from "lucide-react";

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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Badge,
} from "@/components/ui/badge";

// Mock audit log data
const auditLogs = [
  {
    id: "1",
    timestamp: "2023-10-05T08:23:15",
    user: "admin@example.com",
    action: "USER_LOGIN",
    details: "User logged in successfully",
    ip: "192.168.1.1",
    severity: "info",
    category: "authentication",
  },
  {
    id: "2",
    timestamp: "2023-10-05T09:45:22",
    user: "admin@example.com",
    action: "CERTIFICATE_CREATED",
    details: "Created certificate ID: CERT-2023-001",
    ip: "192.168.1.1",
    severity: "info",
    category: "certificates",
  },
  {
    id: "3",
    timestamp: "2023-10-04T14:12:05",
    user: "manager@institution.com",
    action: "USER_CREATED",
    details: "Created user: user@example.com",
    ip: "203.0.113.45",
    severity: "info",
    category: "users",
  },
  {
    id: "4",
    timestamp: "2023-10-04T11:38:47",
    user: "system",
    action: "SECURITY_ALERT",
    details: "Multiple failed login attempts for user: test@example.com",
    ip: "198.51.100.23",
    severity: "warning",
    category: "security",
  },
  {
    id: "5",
    timestamp: "2023-10-03T16:05:33",
    user: "admin@example.com",
    action: "SETTINGS_UPDATED",
    details: "Updated system security settings",
    ip: "192.168.1.1",
    severity: "info",
    category: "settings",
  },
  {
    id: "6",
    timestamp: "2023-10-03T09:22:18",
    user: "manager@institution.com",
    action: "CERTIFICATE_REVOKED",
    details: "Revoked certificate ID: CERT-2022-187",
    ip: "203.0.113.45",
    severity: "warning",
    category: "certificates",
  },
  {
    id: "7",
    timestamp: "2023-10-02T13:44:51",
    user: "admin@example.com",
    action: "ROLE_UPDATED",
    details: "Updated permissions for role: INSTITUTION",
    ip: "192.168.1.1",
    severity: "info",
    category: "users",
  },
  {
    id: "8",
    timestamp: "2023-10-01T22:17:09",
    user: "system",
    action: "SYSTEM_ERROR",
    details: "Database connection timeout",
    ip: "127.0.0.1",
    severity: "error",
    category: "system",
  },
  {
    id: "9",
    timestamp: "2023-09-30T10:55:24",
    user: "admin@example.com",
    action: "BACKUP_COMPLETED",
    details: "System backup completed successfully",
    ip: "192.168.1.1",
    severity: "info",
    category: "system",
  },
  {
    id: "10",
    timestamp: "2023-09-29T16:33:42",
    user: "admin@example.com",
    action: "USER_DELETED",
    details: "Deleted user: olduser@example.com",
    ip: "192.168.1.1",
    severity: "warning",
    category: "users",
  },
  {
    id: "11",
    timestamp: "2023-09-29T08:15:37",
    user: "system",
    action: "MAINTENANCE_STARTED",
    details: "System maintenance mode activated",
    ip: "127.0.0.1",
    severity: "info",
    category: "system",
  },
  {
    id: "12",
    timestamp: "2023-09-28T19:02:11",
    user: "system",
    action: "SECURITY_SCAN",
    details: "Security scan completed: 2 vulnerabilities found",
    ip: "127.0.0.1",
    severity: "warning",
    category: "security",
  },
];

export default function AuditLogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [logs, setLogs] = useState(auditLogs);
  const [isExporting, setIsExporting] = useState(false);

  // Filter logs based on search query and filters
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter;
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
    
    // Date filtering logic
    const logDate = new Date(log.timestamp);
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const matchesDate = 
      dateFilter === "all" ||
      (dateFilter === "today" && logDate >= oneDayAgo) ||
      (dateFilter === "week" && logDate >= oneWeekAgo) ||
      (dateFilter === "month" && logDate >= oneMonthAgo);

    return matchesSearch && matchesCategory && matchesSeverity && matchesDate;
  });

  const handleExport = () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      // In a real application, this would trigger a download
      alert("Audit log exported successfully");
    }, 1500);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "authentication":
        return <User className="h-4 w-4" />;
      case "certificates":
        return <FileCheck className="h-4 w-4" />;
      case "users":
        return <User className="h-4 w-4" />;
      case "security":
        return <Shield className="h-4 w-4" />;
      case "settings":
        return <Activity className="h-4 w-4" />;
      case "system":
        return <Activity className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <SettingsLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Audit Log</h1>
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <Activity className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <ArrowDownToLine className="h-4 w-4" />
                Export Logs
              </>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              <CardTitle>System Activity</CardTitle>
            </div>
            <CardDescription>
              View and filter system events and user actions
            </CardDescription>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-28">
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Past Week</SelectItem>
                    <SelectItem value="month">Past Month</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-32">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="authentication">Authentication</SelectItem>
                    <SelectItem value="certificates">Certificates</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="settings">Settings</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-32">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md max-h-[calc(100vh-22rem)] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white dark:bg-gray-950 z-10">
                  <TableRow>
                    <TableHead className="w-[180px]">Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="hidden md:table-cell">Details</TableHead>
                    <TableHead className="text-center">Severity</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden md:table-cell">IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No audit logs found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(log.timestamp)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {log.user === "system" ? (
                            <Badge variant="outline" className="font-normal">
                              System
                            </Badge>
                          ) : (
                            log.user
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {log.action.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-xs truncate">
                          <div className="max-w-[300px] truncate" title={log.details}>
                            {log.details}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center">
                            <Badge 
                              variant={log.severity === "info" ? "default" : 
                                    log.severity === "warning" ? "warning" : "destructive"}
                              className="gap-1 capitalize"
                            >
                              {getSeverityIcon(log.severity)}
                              <span className="hidden sm:inline">{log.severity}</span>
                            </Badge>
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline" className="capitalize gap-1">
                            {getCategoryIcon(log.category)}
                            {log.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {log.ip}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-6 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {logs.length} log entries
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              <CardTitle>Audit Settings</CardTitle>
            </div>
            <CardDescription>
              Configure audit logging and retention settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="retentionPeriod">Retention Period (days)</Label>
                  <Input
                    id="retentionPeriod"
                    type="number"
                    defaultValue="90"
                    min="30"
                    max="365"
                  />
                  <p className="text-xs text-muted-foreground">
                    Logs older than this will be automatically archived
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logLevel">Minimum Log Level</Label>
                  <Select defaultValue="info">
                    <SelectTrigger id="logLevel">
                      <SelectValue placeholder="Select log level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Only events at or above this level will be logged
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exportFormat">Export Format</Label>
                  <Select defaultValue="json">
                    <SelectTrigger id="exportFormat">
                      <SelectValue placeholder="Select export format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exportEncryption">Export Encryption</Label>
                  <Select defaultValue="none">
                    <SelectTrigger id="exportEncryption">
                      <SelectValue placeholder="Select encryption" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="password">Password Protected</SelectItem>
                      <SelectItem value="pgp">PGP Encryption</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end pt-6">
            <Button>Save Settings</Button>
          </CardFooter>
        </Card>
      </div>
    </SettingsLayout>
  );
} 