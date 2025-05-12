import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface LowStockItem {
  id: number;
  material_id: number;
  material_name: string;
  current_stock: number;
  minimum_stock: number;
  unit_of_measure: string;
  category: string;
  reorder_level: number;
  supplier_name: string;
}

interface UpcomingRequirement {
  material_id: number;
  material_name: string;
  required_quantity: string;
  available_quantity: string;
  coverage_percentage: number;
  unit_of_measure: string;
  earliest_requirement_date: string;
}

interface Forecast {
  id: number;
  name: string;
  period: string;
  created_date: string;
  confidence: number;
  values: {
    period: string;
    value: number;
  }[];
}
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart, 
  Bar,
  Cell
} from 'recharts';
import { AlertCircle, ArrowRight, TrendingUp, TrendingDown, Package, Calendar, CheckCircle2, PackageX } from 'lucide-react';

export default function MRPDashboard() {
  const [activeTab, setActiveTab] = useState('summary');
  
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['/api/manufacturing/mrp/dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/manufacturing/mrp/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch MRP dashboard data');
      }
      return response.json();
    },
    enabled: true
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load MRP dashboard data'}
        </AlertDescription>
      </Alert>
    );
  }

  // Create chart data for upcoming requirements
  const requirementsChartData = data?.upcomingRequirements?.map((item: UpcomingRequirement) => ({
    name: item.material_name,
    required: parseFloat(item.required_quantity),
    available: parseFloat(item.available_quantity),
    coverage: item.coverage_percentage
  })) || [];

  // Create chart data for forecasts
  const forecastsChartData = data?.forecastData || [];
  
  // If no forecast data is available from the API, create empty array
  // This will handle UI gracefully with "No active forecasts found" message

  return (
    <div className="space-y-6">
      <Tabs defaultValue="summary" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="summary">MRP Summary</TabsTrigger>
          <TabsTrigger value="forecasts">Demand Forecasting</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Status</TabsTrigger>
          <TabsTrigger value="planning">Planning Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="mt-6 grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Low Stock Items
              </CardTitle>
              <CardDescription>
                Materials below reorder point
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data?.lowStockItems?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Current Qty</TableHead>
                      <TableHead>Reorder Point</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.lowStockItems.map((item: LowStockItem) => (
                      <TableRow key={item.material_id}>
                        <TableCell className="font-medium">{item.material_name}</TableCell>
                        <TableCell>{parseFloat(String(item.current_stock)).toFixed(2)}</TableCell>
                        <TableCell>{parseFloat(String(item.reorder_level)).toFixed(2)}</TableCell>
                        <TableCell>
                          {item.current_stock === 0 ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : (
                            <Badge variant="outline">Low Stock</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-3" />
                  <p>No low stock items detected</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Upcoming Requirements
              </CardTitle>
              <CardDescription>
                Materials needed soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data?.upcomingRequirements?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Coverage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.upcomingRequirements.slice(0, 5).map((item: UpcomingRequirement) => (
                      <TableRow key={item.material_id}>
                        <TableCell className="font-medium">{item.material_name}</TableCell>
                        <TableCell>{parseFloat(item.required_quantity).toFixed(2)}</TableCell>
                        <TableCell>{parseFloat(item.available_quantity).toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={item.coverage_percentage} className="w-[60px]" />
                            <span className="text-xs">{item.coverage_percentage}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-3" />
                  <p>No upcoming material requirements</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Material Requirements Overview
              </CardTitle>
              <CardDescription>
                Upcoming material requirements vs. available inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requirementsChartData.length > 0 ? (
                <div className="h-[300px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={requirementsChartData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip 
                        formatter={(value: any, name: string) => {
                          return [
                            typeof value === 'number' ? value.toFixed(2) : value, 
                            name === 'required' ? 'Required Quantity' : 'Available Quantity'
                          ];
                        }}
                      />
                      <Bar dataKey="required" name="Required" fill="#ff4d4f" />
                      <Bar dataKey="available" name="Available" fill="#52c41a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <PackageX className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <p>No material requirements data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="forecasts" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>Demand Forecasts</CardTitle>
                  <CardDescription>
                    Material demand forecasts for production planning
                  </CardDescription>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = "/manufacturing/forecasting/create"}
                >
                  Create Forecast
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {data?.forecasts?.length > 0 ? (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Active Forecasts</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Period</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.forecasts.map((forecast: Forecast) => (
                          <TableRow key={forecast.id}>
                            <TableCell className="font-medium">{forecast.name}</TableCell>
                            <TableCell>
                              {new Date(forecast.created_date).toLocaleDateString()} - {forecast.period}
                            </TableCell>
                            <TableCell>
                              <Badge variant="default">
                                {forecast.confidence > 0.8 ? 'High' : forecast.confidence > 0.5 ? 'Medium' : 'Low'} Confidence
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.location.href = `/manufacturing/forecasting/${forecast.id}`}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="h-[300px] mt-8">
                    <h3 className="text-lg font-medium mb-3">Forecast Visualization</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={forecastsChartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        {data.forecasts.map((forecast: Forecast, index: number) => (
                          <Line 
                            key={forecast.id}
                            type="monotone"
                            dataKey={forecast.name}
                            stroke={['#8884d8', '#82ca9d', '#ffc658'][index % 3]}
                            activeDot={{ r: 8 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <p className="mb-4">No active forecasts found</p>
                  <Button onClick={() => window.location.href = "/manufacturing/forecasting/create"}>
                    Create Your First Forecast
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inventory" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>Inventory Status</CardTitle>
                  <CardDescription>
                    Current inventory levels and valuation
                  </CardDescription>
                </div>
                <Button 
                  variant="outline"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/manufacturing/inventory/report', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          reportType: 'inventory-status',
                          format: 'pdf'
                        })
                      });
                      
                      if (response.ok) {
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'inventory-status-report.pdf';
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                      } else {
                        console.error('Error generating report:', await response.text());
                      }
                    } catch (error) {
                      console.error('Error generating report:', error);
                    }
                  }}
                >
                  Generate Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">
                <p className="mb-4">
                  View detailed inventory status with real-time tracking and analytics
                </p>
                <Button 
                  onClick={() => window.location.href = "/manufacturing/inventory"}
                >
                  View Detailed Inventory
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="planning" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>Planning Results</CardTitle>
                  <CardDescription>
                    Material requirements planning results
                  </CardDescription>
                </div>
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/manufacturing/mrp/run', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          planningHorizon: 30, // 30 days
                          considerSafetyStock: true,
                          considerLeadTimes: true,
                          considerCapacityConstraints: false,
                          warehouseId: 1
                        })
                      });
                      
                      if (response.ok) {
                        const result = await response.json();
                        window.location.href = `/manufacturing/mrp/runs/${result.runId}`;
                      } else {
                        console.error('Error running MRP process:', await response.text());
                      }
                    } catch (error) {
                      console.error('Error running MRP process:', error);
                    }
                  }}
                >
                  Run MRP Process
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">
                <p className="mb-4">
                  View MRP planning results with purchase recommendations and production scheduling
                </p>
                <Button
                  onClick={() => window.location.href = "/manufacturing/mrp/runs"}
                >
                  View Planning Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}