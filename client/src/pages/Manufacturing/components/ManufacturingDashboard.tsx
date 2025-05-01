import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { BarChart, LineChart, PieChart } from './charts';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { AlertCircle, Factory, Package, ShoppingCart, Truck, Users, Wrench } from 'lucide-react';

type DashboardData = {
  counts: {
    warehouses: number;
    workCenters: number;
    equipment: number;
  };
  productionOrdersByStatus: {
    status: string;
    count: number;
  }[];
  recentProductionOrders: Array<{
    id: number;
    order_number: string;
    product_id: number;
    product_name: string;
    status: string;
    quantity: number;
    planned_start_date: string;
    planned_end_date: string;
  }>;
  maintenanceRequestsByStatus: {
    status: string;
    count: number;
  }[];
};

export default function ManufacturingDashboard() {
  const { toast } = useToast();
  
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/manufacturing/dashboard'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error fetching dashboard data",
        description: "Please try again later",
      });
    }
  }, [error, toast]);

  // Prepare chart data from the dashboard data
  const productionOrderData = data?.productionOrdersByStatus.map(item => ({
    name: item.status,
    value: item.count
  })) || [];

  const maintenanceRequestData = data?.maintenanceRequestsByStatus.map(item => ({
    name: item.status,
    value: item.count
  })) || [];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Summary cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Warehouses</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : data?.counts.warehouses || 0}</div>
          <p className="text-xs text-muted-foreground">Storage locations</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Work Centers</CardTitle>
          <Factory className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : data?.counts.workCenters || 0}</div>
          <p className="text-xs text-muted-foreground">Production facilities</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Equipment</CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : data?.counts.equipment || 0}</div>
          <p className="text-xs text-muted-foreground">Machinery and tools</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Production Orders</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? '...' : 
              data?.productionOrdersByStatus.reduce((sum, item) => sum + item.count, 0) || 0}
          </div>
          <p className="text-xs text-muted-foreground">Manufacturing orders</p>
        </CardContent>
      </Card>
      
      {/* Charts */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Production Orders by Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">Loading...</div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load production order data.
              </AlertDescription>
            </Alert>
          ) : (
            <PieChart data={productionOrderData} />
          )}
        </CardContent>
      </Card>
      
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Maintenance Requests by Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">Loading...</div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load maintenance request data.
              </AlertDescription>
            </Alert>
          ) : (
            <BarChart data={maintenanceRequestData} />
          )}
        </CardContent>
      </Card>
      
      {/* Recent Orders */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Recent Production Orders</CardTitle>
          <CardDescription>
            The latest manufacturing orders in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">Loading...</div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load recent orders.
              </AlertDescription>
            </Alert>
          ) : data?.recentProductionOrders?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <Package className="h-12 w-12 mb-4" />
              <p>No production orders found</p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="h-12 px-4 text-left font-medium">Order Number</th>
                    <th className="h-12 px-4 text-left font-medium">Product</th>
                    <th className="h-12 px-4 text-left font-medium">Status</th>
                    <th className="h-12 px-4 text-left font-medium">Quantity</th>
                    <th className="h-12 px-4 text-left font-medium">Start Date</th>
                    <th className="h-12 px-4 text-left font-medium">End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentProductionOrders.map((order) => (
                    <tr key={order.id} className="border-b">
                      <td className="p-4 align-middle">{order.order_number}</td>
                      <td className="p-4 align-middle">{order.product_name}</td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                          ${order.status === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : order.status === 'In Progress' 
                              ? 'bg-blue-100 text-blue-800' 
                              : order.status === 'Planned' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-gray-100 text-gray-800'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 align-middle">{order.quantity}</td>
                      <td className="p-4 align-middle">{new Date(order.planned_start_date).toLocaleDateString()}</td>
                      <td className="p-4 align-middle">{new Date(order.planned_end_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}