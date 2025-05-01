import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, BarChart3, TrendingUp, TimerOff, Factory, CheckCircle, PackageOpen, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { PieChart, BarChart, LineChart } from './charts';

export default function ManufacturingDashboard() {
  // Fetch dashboard data
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/manufacturing/dashboard'],
    queryFn: () => fetch('/api/manufacturing/dashboard').then(res => res.json()),
  });

  // Generate sample data for demo purposes when actual API is not available
  const getSampleData = () => {
    // These are placeholder values that simulate API responses
    // Will be replaced by real API data once backend is implemented
    return {
      productionSummary: {
        completedOrders: 24,
        inProgressOrders: 8,
        plannedOrders: 15,
        delayedOrders: 3
      },
      efficiency: {
        equipmentUtilization: 78,
        productionEfficiency: 85,
        cycleTime: 4.2,
        changeoverTime: 1.5
      },
      inventory: {
        rawMaterials: 42,
        inProduction: 18,
        finishedGoods: 36
      },
      qualityMetrics: {
        passRate: 96.5,
        defectRate: 3.5,
        returnRate: 1.2
      },
      statusDistribution: [
        { name: 'Completed', value: 24 },
        { name: 'In Progress', value: 8 },
        { name: 'Planned', value: 15 },
        { name: 'Delayed', value: 3 }
      ],
      resourceUtilization: [
        { name: 'Work Center 1', value: 85 },
        { name: 'Work Center 2', value: 72 },
        { name: 'Work Center 3', value: 64 },
        { name: 'Work Center 4', value: 90 },
        { name: 'Work Center 5', value: 78 }
      ],
      productionTrend: [
        { name: 'Jan', value: 65 },
        { name: 'Feb', value: 59 },
        { name: 'Mar', value: 80 },
        { name: 'Apr', value: 81 },
        { name: 'May', value: 90 },
        { name: 'Jun', value: 87 }
      ],
      qualityTrend: [
        { name: 'Jan', value: 94 },
        { name: 'Feb', value: 95 },
        { name: 'Mar', value: 93 },
        { name: 'Apr', value: 97 },
        { name: 'May', value: 96 },
        { name: 'Jun', value: 98 }
      ],
      inventoryDistribution: [
        { name: 'Raw Materials', value: 42 },
        { name: 'In Production', value: 18 },
        { name: 'Finished Goods', value: 36 }
      ]
    };
  };

  // Use sample data for demonstration when API data is not available
  const dashboardData = data || getSampleData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load manufacturing dashboard data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Production Orders
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.productionSummary.completedOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed orders this month
            </p>
            <div className="flex justify-between mt-2 text-xs">
              <div>
                <span className="font-semibold text-amber-500">
                  {dashboardData.productionSummary.inProgressOrders}
                </span> In Progress
              </div>
              <div>
                <span className="font-semibold text-blue-500">
                  {dashboardData.productionSummary.plannedOrders}
                </span> Planned
              </div>
              <div>
                <span className="font-semibold text-red-500">
                  {dashboardData.productionSummary.delayedOrders}
                </span> Delayed
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Equipment Utilization
            </CardTitle>
            <Factory className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.efficiency.equipmentUtilization}%
            </div>
            <p className="text-xs text-muted-foreground">
              Current equipment utilization rate
            </p>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${dashboardData.efficiency.equipmentUtilization}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Production Efficiency
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.efficiency.productionEfficiency}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall production efficiency
            </p>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
              <div 
                className="h-full bg-green-500 rounded-full" 
                style={{ width: `${dashboardData.efficiency.productionEfficiency}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Quality Pass Rate
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.qualityMetrics.passRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Products passing quality inspection
            </p>
            <div className="flex justify-between mt-2 text-xs">
              <div>
                <span className="font-semibold text-red-500">
                  {dashboardData.qualityMetrics.defectRate}%
                </span> Defect Rate
              </div>
              <div>
                <span className="font-semibold text-amber-500">
                  {dashboardData.qualityMetrics.returnRate}%
                </span> Return Rate
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Cycle Time
            </CardTitle>
            <TimerOff className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.efficiency.cycleTime} hrs
            </div>
            <p className="text-xs text-muted-foreground">
              Average production cycle time
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Changeover Time
            </CardTitle>
            <TimerOff className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.efficiency.changeoverTime} hrs
            </div>
            <p className="text-xs text-muted-foreground">
              Average setup/changeover time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Third Row - Inventory Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Raw Materials
            </CardTitle>
            <ArrowDownToLine className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.inventory.rawMaterials}
            </div>
            <p className="text-xs text-muted-foreground">
              Current raw materials inventory
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Work In Progress
            </CardTitle>
            <Factory className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.inventory.inProduction}
            </div>
            <p className="text-xs text-muted-foreground">
              Items currently in production
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Finished Goods
            </CardTitle>
            <PackageOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.inventory.finishedGoods}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready-to-ship finished goods
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="production" className="space-y-4">
        <TabsList>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="resources">Resource Utilization</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
        </TabsList>
        
        <TabsContent value="production" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Production Order Status</CardTitle>
                <CardDescription>
                  Current status distribution of production orders
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <PieChart data={dashboardData.statusDistribution} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Production Trend</CardTitle>
                <CardDescription>
                  Monthly production output trend
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <LineChart data={dashboardData.productionTrend} dataKey="value" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Work Center Utilization</CardTitle>
              <CardDescription>
                Current utilization rate of work centers (%)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <BarChart data={dashboardData.resourceUtilization} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Distribution</CardTitle>
              <CardDescription>
                Distribution of inventory across categories
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <PieChart data={dashboardData.inventoryDistribution} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics Trend</CardTitle>
              <CardDescription>
                Monthly trend of quality pass rate (%)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <LineChart data={dashboardData.qualityTrend} dataKey="value" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}