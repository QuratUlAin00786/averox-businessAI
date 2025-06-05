import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, Calendar, MessageSquare, Search, User, Filter,
  CheckCircle2, AlertCircle, Clock, Plus, Eye, Trash2
} from 'lucide-react';

interface DashboardActivity {
  id: number;
  action: string;
  detail?: string;
  relatedToType?: string;
  relatedToId?: number;
  createdAt: string;
  icon?: string;
  user: {
    name: string;
    avatar: string;
    initials: string;
  };
  time: string;
}

export default function ActivitiesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Fetch activities from database
  const { data: activities = [], isLoading } = useQuery<DashboardActivity[]>({
    queryKey: ['/api/dashboard/activities'],
  });

  const filteredActivities = Array.isArray(activities) ? activities.filter((activity: DashboardActivity) => {
    const matchesSearch = activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (activity.detail && activity.detail.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'leads') return matchesSearch && activity.relatedToType === 'lead';
    if (filterType === 'opportunities') return matchesSearch && activity.relatedToType === 'opportunity';
    if (filterType === 'tasks') return matchesSearch && activity.relatedToType === 'task';
    return matchesSearch;
  }) : [];

  const getActivityIcon = (action: string) => {
    if (action.toLowerCase().includes('created') || action.toLowerCase().includes('added')) {
      return <Plus className="w-5 h-5 text-green-500" />;
    } else if (action.toLowerCase().includes('completed') || action.toLowerCase().includes('finished')) {
      return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
    } else if (action.toLowerCase().includes('deleted') || action.toLowerCase().includes('removed')) {
      return <Trash2 className="w-5 h-5 text-red-500" />;
    } else if (action.toLowerCase().includes('updated') || action.toLowerCase().includes('modified')) {
      return <AlertCircle className="w-5 h-5 text-orange-500" />;
    } else if (action.toLowerCase().includes('viewed') || action.toLowerCase().includes('accessed')) {
      return <Eye className="w-5 h-5 text-gray-500" />;
    }
    return <Activity className="w-5 h-5 text-primary" />;
  };

  const getActivityBadgeColor = (relatedToType?: string) => {
    switch (relatedToType) {
      case 'lead':
        return 'bg-blue-100 text-blue-800';
      case 'opportunity':
        return 'bg-green-100 text-green-800';
      case 'task':
        return 'bg-purple-100 text-purple-800';
      case 'contact':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold">Activities</h1>
          <p className="text-muted-foreground">Track all system activities and user actions</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(activities as DashboardActivity[]).length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(activities as DashboardActivity[]).filter((a: DashboardActivity) => {
                const today = new Date().toDateString();
                const activityDate = new Date(a.createdAt).toDateString();
                return today === activityDate;
              }).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(activities as DashboardActivity[]).filter((a: DashboardActivity) => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(a.createdAt) >= weekAgo;
              }).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set((activities as DashboardActivity[]).map((a: DashboardActivity) => a.user?.name)).size || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activities</SelectItem>
            <SelectItem value="leads">Leads</SelectItem>
            <SelectItem value="opportunities">Opportunities</SelectItem>
            <SelectItem value="tasks">Tasks</SelectItem>
            <SelectItem value="contacts">Contacts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>
            All system activities and user actions are logged here
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No activities found</h3>
              <p className="text-muted-foreground text-center">
                No activities match your current search and filter criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity: DashboardActivity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="bg-muted p-2 rounded-full flex-none">
                    {getActivityIcon(activity.action)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{activity.action}</p>
                      <div className="flex items-center gap-2">
                        {activity.relatedToType && (
                          <Badge className={getActivityBadgeColor(activity.relatedToType)}>
                            {activity.relatedToType}
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                    
                    {activity.detail && (
                      <p className="text-sm text-muted-foreground">{activity.detail}</p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                          {activity.user?.initials || 'U'}
                        </div>
                        <span>{activity.user?.name || 'Unknown User'}</span>
                      </div>
                      <span>•</span>
                      <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}