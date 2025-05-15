"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ActivityLogWidget() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Add skipAuth in development
        const params = new URLSearchParams();
        if (process.env.NODE_ENV === "development") {
          params.append("skipAuth", "true");
        }
        
        const response = await axios.get(`/api/admin/logs/stats?${params.toString()}`);
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching log statistics:", error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 500) {
            setError("Server error occurred. The database may be unavailable or there might be data integrity issues.");
          } else if (error.response?.status === 401) {
            setError("You are not authorized to view this data.");
          } else {
            setError(`Error: ${error.message || "Failed to load activity log data"}`);
          }
        } else {
          setError("An unexpected error occurred while loading activity log data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button 
              variant="outline"
              onClick={() => {
                setLoading(true);
                setError(null);
                setTimeout(() => {
                  window.location.reload();
                }, 500);
              }}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Failed to load log statistics.</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                window.location.reload();
              }, 500);
            }}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Set default categories if missing
  const categories = stats.categories || [];

  // Create default data if any property is missing
  const ensureStatsStructure = () => {
    if (!stats.overview) {
      stats.overview = {
        totalLogs: 0,
        logsToday: 0,
        logsYesterday: 0,
        logsThisWeek: 0,
        logsThisMonth: 0,
      };
    }

    if (!stats.verification) {
      stats.verification = {
        total: 0,
        successful: 0,
        failed: 0,
        successRate: '0.0',
      };
    }

    if (!stats.blockchain) {
      stats.blockchain = {
        total: 0,
        successful: 0,
        failed: 0,
        successRate: '0.0',
      };
    }

    if (!stats.dailyActivity || !Array.isArray(stats.dailyActivity)) {
      // Create empty daily activity data for the last 7 days
      const today = new Date();
      stats.dailyActivity = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split('T')[0],
          count: 0,
        };
      });
    }

    if (!stats.recentFailures || !Array.isArray(stats.recentFailures)) {
      stats.recentFailures = [];
    }
  };

  ensureStatsStructure();

  return (
    <>
      {/* Overview cards */}
      <Card className="col-span-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Activity Log Overview</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push("/dashboard/admin/logs")}
          >
            View All Logs
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm font-medium text-muted-foreground">Total Logs</p>
              <p className="text-2xl font-bold">{stats.overview.totalLogs.toLocaleString()}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm font-medium text-muted-foreground">Today</p>
              <p className="text-2xl font-bold">{stats.overview.logsToday.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {stats.overview.logsYesterday 
                  ? `${((stats.overview.logsToday - stats.overview.logsYesterday) / stats.overview.logsYesterday * 100).toFixed(1)}% vs yesterday`
                  : 'No data for yesterday'}
              </p>
            </div>
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm font-medium text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">{stats.overview.logsThisWeek.toLocaleString()}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm font-medium text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">{stats.overview.logsThisMonth.toLocaleString()}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-6 h-60">
            <p className="text-sm font-medium mb-2">Daily Activity (Last 7 Days)</p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  width={30}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [value, 'Logs']}
                  labelFormatter={formatDate}
                />
                <Bar 
                  dataKey="count" 
                  name="Logs" 
                  fill="var(--primary)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Stats cards */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Verification Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-6">
            <div>
              <p className="text-3xl font-bold">{stats.verification.total.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total verifications</p>
            </div>
            <div>
              <div className="text-right">
                <Badge variant={Number(stats.verification.successRate) > 95 ? "success" : "warning"}>
                  {stats.verification.successRate}% Success
                </Badge>
              </div>
              <div className="flex gap-3 mt-2 justify-end">
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">{stats.verification.successful.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Successful</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">{stats.verification.failed.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>
            </div>
          </div>

          {stats.recentFailures && stats.recentFailures.length > 0 ? (
            <div>
              <h4 className="text-sm font-medium mb-2">Recent Verification Failures</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {stats.recentFailures.map((failure: any, index: number) => (
                  <div key={failure?.id || index} className="text-xs border-l-2 border-red-500 pl-2 py-1">
                    <p className="font-medium">{new Date(failure.createdAt).toLocaleString()}</p>
                    <p className="text-muted-foreground">{failure.details || 'No details available'}</p>
                    {failure.metadata && (
                      <p className="text-muted-foreground">
                        {typeof failure.metadata === 'object' 
                          ? JSON.stringify(failure.metadata).substring(0, 50) + '...'
                          : failure.metadata}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent verification failures</p>
          )}
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Blockchain Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-6">
            <div>
              <p className="text-3xl font-bold">{stats.blockchain.total.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total operations</p>
            </div>
            <div>
              <div className="text-right">
                <Badge variant={Number(stats.blockchain.successRate) > 95 ? "success" : "warning"}>
                  {stats.blockchain.successRate}% Success
                </Badge>
              </div>
              <div className="flex gap-3 mt-2 justify-end">
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">{stats.blockchain.successful.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Successful</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">{stats.blockchain.failed.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Activity Categories</h4>
            <div className="space-y-2">
              {categories.length > 0 ? (
                categories.map((cat: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{cat.category}</span>
                    <span className="font-medium">{cat.count.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No category data available</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
} 