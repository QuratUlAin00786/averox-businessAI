import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  BarChart3, 
  PieChart, 
  BarChart, 
  Activity,
  Factory,
  Package,
  Wrench,
  AlertTriangle,
  ClipboardList,
  LineChart,
  CircleAlert
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import charts if available
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart as RechartsLineChart, Line } from 'recharts';

export default function ManufacturingDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // In a real implementation, this would fetch dashboard data from the API
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['/api/manufacturing/dashboard'],
    // This queryFn would be enabled when the API is ready
    queryFn: async () => {
      return {}; // Placeholder for actual API call
    },
    enabled: false, // Disable this query until the API is ready
  });

  // Sample data for demonstration
  const sampleDashboardData = {
    productionSummary: {
      totalOrders: 42,
      ordersInProgress: 12,
      ordersScheduled: 18,
      ordersCompleted: 10,
      ordersOnHold: 2,
    },
    workCenterUtilization: [
      { name: 'Assembly Line A', utilization: 75, capacity: 100 },
      { name: 'Assembly Line B', utilization: 60, capacity: 100 },
      { name: 'Machining Center', utilization: 85, capacity: 80 },
      { name: 'Finishing Department', utilization: 0, capacity: 60 },
      { name: 'Packaging Line', utilization: 90, capacity: 120 },
    ],
    equipmentStatus: {
      operational: 32,
      underMaintenance: 5,
      idle: 3,
      decommissioned: 2,
      faulty: 1,
    },
    productionTrend: [
      { month: 'Jan', planned: 100, actual: 90 },
      { month: 'Feb', planned: 120, actual: 115 },
      { month: 'Mar', planned: 130, actual: 125 },
      { month: 'Apr', planned: 125, actual: 128 },
      { month: 'May', planned: 140, actual: 110 },
    ],
    qualityMetrics: {
      inspections: 38,
      passed: 32,
      failed: 4,
      pendingReview: 2,
      passRate: 84.2,
    },
    warehouseCapacity: [
      { name: 'Main Production', used: 6500, total: 10000 },
      { name: 'Secondary Storage', used: 2000, total: 8000 },
      { name: 'Distribution Center', used: 12000, total: 15000 },
      { name: 'Equipment Storage', used: 2500, total: 5000 },
    ],
    maintenanceRequests: {
      total: 28,
      completed: 15,
      inProgress: 6,
      scheduled: 5,
      deferred: 2,
    },
    materialStatus: {
      adequate: 24,
      low: 8,
      critical: 3,
      excess: 5,
    },
    alerts: [
      { id: 1, level: 'critical', message: 'Conveyor belt failure on Assembly Line A', timestamp: '2025-05-01T08:30:00Z' },
      { id: 2, level: 'warning', message: 'Raw material steel frames inventory low (20% remaining)', timestamp: '2025-05-01T09:15:00Z' },
      { id: 3, level: 'warning', message: 'Packaging Line approaching maximum capacity (90%)', timestamp: '2025-05-01T10:20:00Z' },
      { id: 4, level: 'info', message: 'Scheduled maintenance for CNC Machine B1 due in 3 days', timestamp: '2025-05-01T11:45:00Z' },
    ],
    recentActivities: [
      { id: 1, type: 'production', description: 'Production Order PO-2025-0001 completed', timestamp: '2025-05-01T10:15:00Z' },
      { id: 2, type: 'maintenance', description: 'Maintenance completed on Paint Booth C1', timestamp: '2025-05-01T09:30:00Z' },
      { id: 3, type: 'quality', description: 'Quality inspection failed for Batch B2025-0126', timestamp: '2025-04-30T15:45:00Z' },
      { id: 4, type: 'inventory', description: 'Raw material shipment received: Steel Frames (500 units)', timestamp: '2025-04-30T14:20:00Z' },
      { id: 5, type: 'production', description: 'Production Order PO-2025-0002 started', timestamp: '2025-04-30T08:00:00Z' },
    ]
  };

  const displayData = dashboardData || sampleDashboardData;

  // Prepare chart data from the dashboard data
  const equipmentStatusData = Object.entries(displayData.equipmentStatus).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
  }));

  const EQUIPMENT_STATUS_COLORS = ['#4ade80', '#facc15', '#94a3b8', '#a3a3a3', '#f87171'];

  const getAlertIcon = (level) => {
    switch (level) {
      case 'critical':
        return <CircleAlert className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'info':
        return <ClipboardList className="h-5 w-5 text-blue-500" />;
      default:
        return <ClipboardList className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'production':
        return <Factory className="h-5 w-5 text-blue-500" />;
      case 'maintenance':
        return <Wrench className="h-5 w-5 text-amber-500" />;
      case 'quality':
        return <ClipboardList className="h-5 w-5 text-purple-500" />;
      case 'inventory':
        return <Package className="h-5 w-5 text-green-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading manufacturing dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load dashboard data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Manufacturing Dashboard</h3>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Status Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Production Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayData.productionSummary.totalOrders}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600 font-medium">{displayData.productionSummary.ordersInProgress}</span> in progress, 
                  <span className="text-blue-600 font-medium ml-1">{displayData.productionSummary.ordersScheduled}</span> scheduled
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Equipment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayData.equipmentStatus.operational}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600 font-medium">Operational</span> out of {Object.values(displayData.equipmentStatus).reduce((sum, val) => sum + val, 0)} total
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Quality Pass Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayData.qualityMetrics.passRate}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600 font-medium">{displayData.qualityMetrics.passed}</span> passed,
                  <span className="text-red-600 font-medium ml-1">{displayData.qualityMetrics.failed}</span> failed
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Maintenance Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayData.maintenanceRequests.total}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600 font-medium">{displayData.maintenanceRequests.completed}</span> completed,
                  <span className="text-amber-600 font-medium ml-1">{displayData.maintenanceRequests.inProgress}</span> in progress
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Equipment Status</CardTitle>
                <CardDescription>Current status of all manufacturing equipment</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={equipmentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {equipmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={EQUIPMENT_STATUS_COLORS[index % EQUIPMENT_STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Production Trend</CardTitle>
                <CardDescription>Planned vs. actual production output</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={displayData.productionTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="planned" fill="#93c5fd" name="Planned" />
                    <Bar dataKey="actual" fill="#4ade80" name="Actual" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Alerts and Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>Important manufacturing alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayData.alerts.map(alert => (
                    <div key={alert.id} className="flex items-start space-x-3">
                      {getAlertIcon(alert.level)}
                      <div>
                        <p className={`text-sm font-medium ${
                          alert.level === 'critical' ? 'text-red-600' : 
                          alert.level === 'warning' ? 'text-amber-600' : 'text-blue-600'
                        }`}>
                          {alert.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(alert.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">View All Alerts</Button>
              </CardFooter>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest manufacturing activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayData.recentActivities.map(activity => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      {getActivityIcon(activity.type)}
                      <div>
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">View All Activities</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="production" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Work Center Utilization */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Work Center Utilization</CardTitle>
                <CardDescription>Current utilization of manufacturing work centers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayData.workCenterUtilization.map(center => {
                    const utilizationPercentage = (center.utilization / center.capacity) * 100;
                    const utilizationColor = 
                      utilizationPercentage >= 90 ? 'bg-red-500' :
                      utilizationPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500';
                    
                    return (
                      <div key={center.name} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">{center.name}</span>
                          <span className="text-muted-foreground">{utilizationPercentage.toFixed(0)}%</span>
                        </div>
                        <Progress value={utilizationPercentage} className="h-2" indicatorClassName={utilizationColor} />
                        <div className="text-xs text-muted-foreground">
                          {center.utilization} / {center.capacity} units
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            {/* Warehouse Capacity */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Warehouse Capacity</CardTitle>
                <CardDescription>Current storage usage across warehouses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayData.warehouseCapacity.map(warehouse => {
                    const usagePercentage = (warehouse.used / warehouse.total) * 100;
                    const usageColor = 
                      usagePercentage >= 90 ? 'bg-red-500' :
                      usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500';
                    
                    return (
                      <div key={warehouse.name} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">{warehouse.name}</span>
                          <span className="text-muted-foreground">{usagePercentage.toFixed(0)}%</span>
                        </div>
                        <Progress value={usagePercentage} className="h-2" indicatorClassName={usageColor} />
                        <div className="text-xs text-muted-foreground">
                          {warehouse.used} / {warehouse.total} sq.ft
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Production Orders Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Production Orders Summary</CardTitle>
              <CardDescription>Status of all production orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="p-4 rounded-md bg-slate-100 text-center">
                  <div className="text-sm text-muted-foreground">Total</div>
                  <div className="text-2xl font-bold">{displayData.productionSummary.totalOrders}</div>
                </div>
                <div className="p-4 rounded-md bg-yellow-50 text-center">
                  <div className="text-sm text-yellow-600">In Progress</div>
                  <div className="text-2xl font-bold text-yellow-700">{displayData.productionSummary.ordersInProgress}</div>
                </div>
                <div className="p-4 rounded-md bg-blue-50 text-center">
                  <div className="text-sm text-blue-600">Scheduled</div>
                  <div className="text-2xl font-bold text-blue-700">{displayData.productionSummary.ordersScheduled}</div>
                </div>
                <div className="p-4 rounded-md bg-green-50 text-center">
                  <div className="text-sm text-green-600">Completed</div>
                  <div className="text-2xl font-bold text-green-700">{displayData.productionSummary.ordersCompleted}</div>
                </div>
                <div className="p-4 rounded-md bg-orange-50 text-center">
                  <div className="text-sm text-orange-600">On Hold</div>
                  <div className="text-2xl font-bold text-orange-700">{displayData.productionSummary.ordersOnHold}</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Production Orders</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="equipment" className="space-y-4">
          {/* Maintenance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Summary</CardTitle>
              <CardDescription>Status of maintenance requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="p-4 rounded-md bg-slate-100 text-center">
                  <div className="text-sm text-muted-foreground">Total</div>
                  <div className="text-2xl font-bold">{displayData.maintenanceRequests.total}</div>
                </div>
                <div className="p-4 rounded-md bg-green-50 text-center">
                  <div className="text-sm text-green-600">Completed</div>
                  <div className="text-2xl font-bold text-green-700">{displayData.maintenanceRequests.completed}</div>
                </div>
                <div className="p-4 rounded-md bg-yellow-50 text-center">
                  <div className="text-sm text-yellow-600">In Progress</div>
                  <div className="text-2xl font-bold text-yellow-700">{displayData.maintenanceRequests.inProgress}</div>
                </div>
                <div className="p-4 rounded-md bg-blue-50 text-center">
                  <div className="text-sm text-blue-600">Scheduled</div>
                  <div className="text-2xl font-bold text-blue-700">{displayData.maintenanceRequests.scheduled}</div>
                </div>
                <div className="p-4 rounded-md bg-orange-50 text-center">
                  <div className="text-sm text-orange-600">Deferred</div>
                  <div className="text-2xl font-bold text-orange-700">{displayData.maintenanceRequests.deferred}</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Maintenance Requests</Button>
            </CardFooter>
          </Card>
          
          {/* Equipment Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Equipment Status Breakdown</CardTitle>
              <CardDescription>Status of all equipment in the facility</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={equipmentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {equipmentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={EQUIPMENT_STATUS_COLORS[index % EQUIPMENT_STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quality" className="space-y-4">
          {/* Quality Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Inspection Results</CardTitle>
              <CardDescription>Summary of quality control inspections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-md bg-slate-100 text-center">
                  <div className="text-sm text-muted-foreground">Total Inspections</div>
                  <div className="text-2xl font-bold">{displayData.qualityMetrics.inspections}</div>
                </div>
                <div className="p-4 rounded-md bg-green-50 text-center">
                  <div className="text-sm text-green-600">Passed</div>
                  <div className="text-2xl font-bold text-green-700">{displayData.qualityMetrics.passed}</div>
                </div>
                <div className="p-4 rounded-md bg-red-50 text-center">
                  <div className="text-sm text-red-600">Failed</div>
                  <div className="text-2xl font-bold text-red-700">{displayData.qualityMetrics.failed}</div>
                </div>
                <div className="p-4 rounded-md bg-blue-50 text-center">
                  <div className="text-sm text-blue-600">Pending Review</div>
                  <div className="text-2xl font-bold text-blue-700">{displayData.qualityMetrics.pendingReview}</div>
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Overall Pass Rate:</span>
                  <span className="font-medium">{displayData.qualityMetrics.passRate}%</span>
                </div>
                <Progress 
                  value={displayData.qualityMetrics.passRate} 
                  className="h-2" 
                  indicatorClassName={
                    displayData.qualityMetrics.passRate >= 90 ? 'bg-green-500' :
                    displayData.qualityMetrics.passRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Quality Inspections</Button>
            </CardFooter>
          </Card>
          
          {/* Material Status */}
          <Card>
            <CardHeader>
              <CardTitle>Raw Material Status</CardTitle>
              <CardDescription>Inventory status of raw materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-md bg-green-50 text-center">
                  <div className="text-sm text-green-600">Adequate</div>
                  <div className="text-2xl font-bold text-green-700">{displayData.materialStatus.adequate}</div>
                </div>
                <div className="p-4 rounded-md bg-yellow-50 text-center">
                  <div className="text-sm text-yellow-600">Low</div>
                  <div className="text-2xl font-bold text-yellow-700">{displayData.materialStatus.low}</div>
                </div>
                <div className="p-4 rounded-md bg-red-50 text-center">
                  <div className="text-sm text-red-600">Critical</div>
                  <div className="text-2xl font-bold text-red-700">{displayData.materialStatus.critical}</div>
                </div>
                <div className="p-4 rounded-md bg-blue-50 text-center">
                  <div className="text-sm text-blue-600">Excess</div>
                  <div className="text-2xl font-bold text-blue-700">{displayData.materialStatus.excess}</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View Material Inventory</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}