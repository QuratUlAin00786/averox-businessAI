import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, Download, Trash2, AlertTriangle, Info, XCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  category: string;
  message: string;
  details?: any;
  userId?: number;
  ip?: string;
}

interface SystemStatus {
  database: 'connected' | 'error' | 'slow';
  storage: 'healthy' | 'warning' | 'critical';
  memory: { used: number; total: number; percentage: number };
  cpu: { usage: number };
  diskSpace: { used: number; total: number; percentage: number };
  uptime: number;
  activeUsers: number;
  errorCount24h: number;
}

interface FileSystemCheck {
  path: string;
  exists: boolean;
  size?: number;
  permissions?: string;
  error?: string;
}

export default function SystemLogsPage() {
  const { toast } = useToast();
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { data: logs, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ["/api/system/logs"],
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const { data: systemStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ["/api/system/status"],
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const { data: fileSystemChecks, isLoading: fsLoading, refetch: refetchFS } = useQuery({
    queryKey: ["/api/system/filesystem-check"],
  });

  const { data: errorSummary, isLoading: errorLoading } = useQuery({
    queryKey: ["/api/system/error-summary"],
  });

  const handleClearLogs = async () => {
    try {
      const response = await fetch("/api/system/clear-logs", { method: "POST" });
      if (response.ok) {
        toast({ title: "Success", description: "Logs cleared successfully" });
        refetchLogs();
      } else {
        toast({ title: "Error", description: "Failed to clear logs", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    }
  };

  const handleDownloadLogs = async () => {
    try {
      const response = await fetch("/api/system/download-logs");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast({ title: "Success", description: "Logs downloaded successfully" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to download logs", variant: "destructive" });
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'bg-red-100 text-red-800 border-red-200';
      case 'WARN': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'INFO': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DEBUG': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR': return <XCircle className="h-4 w-4" />;
      case 'WARN': return <AlertTriangle className="h-4 w-4" />;
      case 'INFO': return <Info className="h-4 w-4" />;
      case 'DEBUG': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning':
      case 'slow': return 'bg-yellow-100 text-yellow-800';
      case 'error':
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Logs & Diagnostics</h1>
          <p className="text-gray-600 mt-2">Monitor system health, logs, and troubleshoot issues</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-50 border-green-200" : ""}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadLogs}>
            <Download className="h-4 w-4 mr-2" />
            Download Logs
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearLogs}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
        </div>
      </div>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="status">System Status</TabsTrigger>
          <TabsTrigger value="logs">Application Logs</TabsTrigger>
          <TabsTrigger value="filesystem">File System</TabsTrigger>
          <TabsTrigger value="errors">Error Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statusLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Database</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className={getStatusColor(systemStatus?.database || 'error')}>
                      {systemStatus?.database || 'Unknown'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Storage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className={getStatusColor(systemStatus?.storage || 'warning')}>
                      {systemStatus?.storage || 'Unknown'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStatus?.activeUsers || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Memory Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600">
                      {systemStatus?.memory ? 
                        `${systemStatus.memory.percentage.toFixed(1)}% (${(systemStatus.memory.used / 1024 / 1024).toFixed(0)}MB / ${(systemStatus.memory.total / 1024 / 1024).toFixed(0)}MB)` : 
                        'Unknown'
                      }
                    </div>
                    {systemStatus?.memory && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${systemStatus.memory.percentage}%` }}
                        ></div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">CPU Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStatus?.cpu?.usage?.toFixed(1) || 0}%</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Errors (24h)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{systemStatus?.errorCount24h || 0}</div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Application Logs</CardTitle>
              <CardDescription>Real-time application logs and events</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {logsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {logs?.map((log: LogEntry) => (
                      <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            {getLevelIcon(log.level)}
                            <Badge className={getLevelColor(log.level)}>
                              {log.level}
                            </Badge>
                            <span className="text-sm font-medium text-gray-900">{log.category}</span>
                            <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">{log.message}</div>
                        {log.details && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    )) || (
                      <div className="text-center py-12 text-gray-500">
                        No logs available
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filesystem">
          <Card>
            <CardHeader>
              <CardTitle>File System Check</CardTitle>
              <CardDescription>Verify critical files and directories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <>
                    {fileSystemChecks?.map((check: FileSystemCheck, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${check.exists ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="font-mono text-sm">{check.path}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          {check.size && (
                            <span className="text-sm text-gray-500">{(check.size / 1024).toFixed(1)} KB</span>
                          )}
                          <Badge variant={check.exists ? "default" : "destructive"}>
                            {check.exists ? "EXISTS" : "MISSING"}
                          </Badge>
                        </div>
                        {check.error && (
                          <div className="mt-2 text-sm text-red-600">{check.error}</div>
                        )}
                      </div>
                    )) || (
                      <div className="text-center py-12 text-gray-500">
                        No file system checks available
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>Error Analysis</CardTitle>
              <CardDescription>Most common errors and their frequency</CardDescription>
            </CardHeader>
            <CardContent>
              {errorLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-4">
                  {errorSummary?.map((error: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span className="font-medium">{error.message}</span>
                        </div>
                        <Badge variant="destructive">{error.count} occurrences</Badge>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        Last seen: {new Date(error.lastSeen).toLocaleString()}
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-12 text-gray-500">
                      No error data available
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>System performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                Performance metrics coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}