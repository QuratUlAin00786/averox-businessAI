import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  CloudOff, Search, Filter, Database, Clock, CheckCircle2,
  AlertTriangle, RefreshCw, Download, Upload
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Migration {
  id: number;
  name: string;
  status: string;
  progress: number;
  source?: string;
  totalRecords?: number;
  recordsProcessed?: number;
  errorCount?: number;
  startedAt?: string;
  completedAt?: string;
}

export default function MigrationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch migrations from database
  const { data: migrations = [], isLoading } = useQuery<Migration[]>({
    queryKey: ['/api/dashboard/migrations'],
  });

  const filteredMigrations = Array.isArray(migrations) ? migrations.filter((migration: Migration) => {
    const matchesSearch = migration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (migration.source && migration.source.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && migration.status === filterStatus;
  }) : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "failed":
      case "error":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      case "in_progress":
      case "running":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "failed":
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "in_progress":
      case "running":
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Database className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Data Migrations</h1>
          <p className="text-muted-foreground">Monitor and manage all data migration processes</p>
        </div>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          New Migration
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Migrations</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(migrations as Migration[]).length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(migrations as Migration[]).filter((m: Migration) => 
                m.status === 'success' || m.status === 'completed'
              ).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(migrations as Migration[]).filter((m: Migration) => 
                m.status === 'in_progress' || m.status === 'running'
              ).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(migrations as Migration[]).filter((m: Migration) => 
                m.status === 'failed' || m.status === 'error'
              ).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search migrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Migrations</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Migrations List */}
      <Card>
        <CardHeader>
          <CardTitle>Migration History</CardTitle>
          <CardDescription>
            All data migration processes and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMigrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CloudOff className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No migrations found</h3>
              <p className="text-muted-foreground text-center">
                No migrations match your current search and filter criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredMigrations.map((migration: Migration) => {
                const progressPercentage = migration.totalRecords && migration.recordsProcessed
                  ? Math.round((migration.recordsProcessed / migration.totalRecords) * 100)
                  : migration.progress || 0;
                  
                return (
                  <div key={migration.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="bg-muted p-2 rounded-full">
                            {getStatusIcon(migration.status)}
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">{migration.name}</h3>
                            {migration.source && (
                              <p className="text-sm text-muted-foreground">Source: {migration.source}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(migration.status)}
                          {migration.startedAt && (
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(migration.startedAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {(migration.totalRecords || migration.progress !== undefined) && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            {migration.totalRecords ? (
                              <span>Progress: {migration.recordsProcessed || 0} / {migration.totalRecords} records</span>
                            ) : (
                              <span>Progress</span>
                            )}
                            <span>{progressPercentage}%</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                        </div>
                      )}
                      
                      {migration.errorCount !== undefined && migration.errorCount > 0 && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span>{migration.errorCount} errors encountered</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          {migration.startedAt && (
                            <span>Started: {new Date(migration.startedAt).toLocaleDateString()}</span>
                          )}
                          {migration.completedAt && (
                            <span>Completed: {new Date(migration.completedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Logs
                          </Button>
                          {migration.status === 'failed' && (
                            <Button variant="outline" size="sm">
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Retry
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}