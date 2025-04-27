'use client';

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircleIcon, CheckCircleIcon, AlertTriangleIcon, InfoIcon, DatabaseIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Define types for our data
type LogStatus = 'SUCCESS' | 'FAILURE' | 'WARNING' | 'INFO';
type LogCategory = 'AUTHENTICATION' | 'CERTIFICATE' | 'USER' | 'SYSTEM' | 'ADMIN' | 'API' | 'VERIFICATION' | 'BLOCKCHAIN';
type LogAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'VERIFY';

interface Log {
  id: string;
  createdAt: string; // ISO string date
  action: LogAction;
  category: LogCategory;
  status: LogStatus;
  details: string;
  metadata?: any;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  institution?: {
    id: string;
    name: string;
  };
  certificate?: {
    id: string;
    title: string;
    recipientName: string;
  };
}

interface LogStat {
  category: LogCategory;
  _count: {
    id: number;
  };
}

export default function AdminLogsPage() {
  const params = useParams();
  const router = useRouter();
  const currentLocale = String(params?.locale || 'en');
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<Log[]>([]);
  const [logStats, setLogStats] = useState<LogStat[]>([]);
  const [dbError, setDbError] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(true);
  
  // Add missing search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LogCategory | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<LogStatus | null>(null);
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;
  const totalPages = Math.ceil((logs?.length || 0) / logsPerPage);
  const currentLogs = logs?.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  ) || [];

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user session
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        
        if (!session || !session.user) {
          router.push(`/${currentLocale}/auth/login`);
          return;
        }
        
        setUser(session.user);
        
        if (session.user.role !== "ADMIN") {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }
        
        // Fetch logs
        try {
          console.log("Fetching logs from API...");
          const logsResponse = await fetch('/api/admin/logs');
          
          console.log("Logs API response status:", logsResponse.status);
          
          if (!logsResponse.ok) {
            const errorText = await logsResponse.text();
            console.error("Logs API error response:", errorText);
            throw new Error(`Failed to fetch logs: ${logsResponse.status} ${errorText}`);
          }
          
          const logsData = await logsResponse.json();
          console.log("Logs data received:", logsData);
          
          if (!logsData.logs) {
            console.error("No logs property in API response:", logsData);
            throw new Error("Invalid logs API response format");
          }
          
          setLogs(logsData.logs);
          
          // Fetch stats separately
          try {
            console.log("Fetching stats from API...");
            const statsResponse = await fetch('/api/admin/logs/stats');
            
            console.log("Stats API response status:", statsResponse.status);
            
            if (statsResponse.ok) {
              const statsData = await statsResponse.json();
              console.log("Stats data received:", statsData);
              
              if (!statsData.categories) {
                console.warn("No categories property in stats response:", statsData);
              } else {
                // Get categories with counts for stats
                const categoriesStats = statsData.categories.map(item => ({
                  category: item.category,
                  _count: { id: item.count }
                }));
                setLogStats(categoriesStats);
              }
            } else {
              console.warn("Stats API returned non-OK status:", statsResponse.status);
            }
          } catch (statsError) {
            console.error("Error fetching stats:", statsError);
            // Continue even if stats fetch fails
          }
        } catch (logsError) {
          console.error("Error fetching logs:", logsError);
          setDbError(true);
          throw logsError; // Re-throw to be caught by outer catch
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
        setDbError(true);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [currentLocale, router]);

  // Helper function to get icon for log status
  const getStatusIcon = (status: LogStatus) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'FAILURE':
        return <AlertCircleIcon className="h-5 w-5 text-red-500" />;
      case 'WARNING':
        return <AlertTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <InfoIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  // Helper function to format log category
  const formatCategory = (category: LogCategory) => {
    return category.charAt(0) + category.slice(1).toLowerCase().replace(/_/g, ' ');
  };

  // Helper function to get background color based on log status
  const getStatusColor = (status: LogStatus) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'FAILURE':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'WARNING':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };

  // Handle view details click
  const handleViewDetails = (metadata: any) => {
    console.log(metadata);
    // In a real implementation, you might show this in a modal
  };

  // Convert stats to a more usable format
  const stats = {
    total: logs?.length || 0,
    byCategory: logStats 
      ? Object.fromEntries(
          logStats.map(stat => [stat.category, stat._count.id])
        )
      : {},
  };

  // Filtered logs based on search and selected filters
  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    
    return logs.filter(log => {
      // Search filter
      if (
        searchQuery &&
        !`${log.user?.name || 'System'} ${log.action || ''} ${log.details || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (selectedCategory && log.category !== selectedCategory) {
        return false;
      }

      // Severity filter
      if (selectedSeverity && log.status !== selectedSeverity) {
        return false;
      }

      // Date filter
      if (dateRange.start && new Date(log.createdAt) < dateRange.start) {
        return false;
      }
      if (dateRange.end && new Date(log.createdAt) > dateRange.end) {
        return false;
      }

      return true;
    });
  }, [logs, searchQuery, selectedCategory, selectedSeverity, dateRange]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Activity Logs</h1>
          <p className="text-gray-600 mt-2">Monitor and track system activities</p>
        </div>
      </div>
      
      {dbError ? (
        <Card>
          <CardContent className="py-10">
            <div className="flex flex-col items-center justify-center text-center">
              <DatabaseIcon className="h-10 w-10 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Database Connection Error</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Unable to connect to the database. Please check your database configuration or try again later.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-4">
                    <InfoIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Events</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-4">
                    <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Authentication</p>
                    <p className="text-2xl font-bold">{stats.byCategory['AUTHENTICATION'] || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-4">
                    <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Certificate</p>
                    <p className="text-2xl font-bold">{stats.byCategory['CERTIFICATE'] || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg mr-4">
                    <AlertCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Errors</p>
                    <p className="text-2xl font-bold">{logs.filter(log => log.status === 'FAILURE').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Showing the last 100 system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                {/* Logs Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Severity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Message</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {currentLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            No logs found matching the selected filters.
                          </td>
                        </tr>
                      ) : (
                        currentLogs.map((log, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {log.user?.name || 'System'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                                {log.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center">
                                {getStatusIcon(log.status)}
                                <span className={`ml-1 ${getStatusColor(log.status) === 'bg-green-50 dark:bg-green-900/20' ? 'text-green-600 dark:text-green-400' : getStatusColor(log.status) === 'bg-red-50 dark:bg-red-900/20' ? 'text-red-600 dark:text-red-400' : getStatusColor(log.status) === 'bg-yellow-50 dark:bg-yellow-900/20' ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                  {log.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {log.details}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {log.metadata && (
                                <button
                                  onClick={() => handleViewDetails(log.metadata)}
                                  className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  View Details
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-md disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-md disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 