import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertCircle, BarChart3, Calendar, ChevronDown, Download, FileText, PlusCircle, RefreshCw, Search, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function MRPDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Sample data for demonstration
  const forecastData = [
    { month: 'Jan', forecasted: 120, actual: 115 },
    { month: 'Feb', forecasted: 140, actual: 132 },
    { month: 'Mar', forecasted: 135, actual: 142 },
    { month: 'Apr', forecasted: 150, actual: 145 },
    { month: 'May', forecasted: 165, actual: 160 },
    { month: 'Jun', forecasted: 180, actual: 175 },
  ];
  
  const materialRequirements = [
    { 
      id: 'MR-001', 
      name: 'Raw Material A', 
      currentStock: 250,
      safetyStock: 100,
      required: 400,
      orderPoint: 150,
      status: 'Sufficient'
    },
    { 
      id: 'MR-002', 
      name: 'Component B', 
      currentStock: 120,
      safetyStock: 75,
      required: 300,
      orderPoint: 100,
      status: 'Low'
    },
    { 
      id: 'MR-003', 
      name: 'Semifinished C', 
      currentStock: 30,
      safetyStock: 50,
      required: 150,
      orderPoint: 60,
      status: 'Critical'
    },
    { 
      id: 'MR-004', 
      name: 'Packaging Materials', 
      currentStock: 1000,
      safetyStock: 500,
      required: 1200,
      orderPoint: 600,
      status: 'Sufficient'
    },
    { 
      id: 'MR-005', 
      name: 'Chemical D', 
      currentStock: 45,
      safetyStock: 40,
      required: 85,
      orderPoint: 45,
      status: 'Low'
    },
    { 
      id: 'MR-006', 
      name: 'Additive E', 
      currentStock: 65,
      safetyStock: 30,
      required: 70,
      orderPoint: 35,
      status: 'Sufficient'
    }
  ];
  
  const plannedOrders = [
    { 
      id: 'PO-2025-0451', 
      material: 'Component B', 
      quantity: 250,
      requiredDate: '2025-05-15',
      status: 'Planned',
      leadTime: '2 weeks',
      supplier: 'Quality Components Ltd'
    },
    { 
      id: 'PO-2025-0452', 
      material: 'Semifinished C', 
      quantity: 120,
      requiredDate: '2025-05-10',
      status: 'Released',
      leadTime: '3 weeks',
      supplier: 'Advanced Materials Inc.'
    },
    { 
      id: 'PO-2025-0453', 
      material: 'Chemical D', 
      quantity: 100,
      requiredDate: '2025-05-20',
      status: 'Planned',
      leadTime: '1 week',
      supplier: 'ChemSupply Global'
    }
  ];
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'Low':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Low</Badge>;
      case 'Sufficient':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Sufficient</Badge>;
      case 'Planned':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Planned</Badge>;
      case 'Released':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Released</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Advanced MRP Planning</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Plan
          </Button>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>SAP-level MRP Functionality</AlertTitle>
        <AlertDescription>
          Averox provides advanced MRP functionality with demand forecasting, material requirements planning, 
          capacity planning and production scheduling. The system uses machine learning to optimize inventory
          levels and minimize stockouts.
        </AlertDescription>
      </Alert>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="forecasting">Demand Forecasting</TabsTrigger>
          <TabsTrigger value="requirements">Material Requirements</TabsTrigger>
          <TabsTrigger value="planning">Production Planning</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Materials at Critical Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">Requiring immediate action</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Planned Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">To be released this week</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Forecast Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95.8%</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Demand Forecast vs Actual</CardTitle>
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart
                    data={forecastData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="forecasted" stroke="#8884d8" name="Forecasted" />
                    <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Actual" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Material Status Overview</CardTitle>
                <CardDescription>Current inventory levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={materialRequirements.slice(0, 4)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="currentStock" fill="#8884d8" name="Current Stock" />
                    <Bar dataKey="required" fill="#82ca9d" name="Required" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="forecasting" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Demand Forecasting</CardTitle>
                  <CardDescription>Advanced demand forecasting with AI-driven predictions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Time Range
                  </Button>
                  <Button variant="outline" size="sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Algorithms
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-4">
                <Select defaultValue="product">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">All Products</SelectItem>
                    <SelectItem value="product1">Product A</SelectItem>
                    <SelectItem value="product2">Product B</SelectItem>
                    <SelectItem value="product3">Product C</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select defaultValue="monthly">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline">Apply</Button>
              </div>
              
              {/* This would be replaced with actual forecast data visualization */}
              <div className="border rounded-md h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">Demand forecast visualization will appear here</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Advanced forecasting using multiple algorithms including ARIMA, Holt-Winters and Machine Learning
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Material Requirements</CardTitle>
                  <CardDescription>Current material requirements based on production plans</CardDescription>
                </div>
                <div className="flex">
                  <div className="relative mr-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search materials..."
                      className="w-[200px] pl-8"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="sufficient">Sufficient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Required</TableHead>
                    <TableHead className="text-right">Order Point</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materialRequirements.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">{item.currentStock}</TableCell>
                      <TableCell className="text-right">{item.required}</TableCell>
                      <TableCell className="text-right">{item.orderPoint}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="planning" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Production Planning</CardTitle>
                  <CardDescription>Planned orders based on material requirements</CardDescription>
                </div>
                <Button size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Purchase Orders
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Required Date</TableHead>
                    <TableHead>Lead Time</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plannedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.material}</TableCell>
                      <TableCell className="text-right">{order.quantity}</TableCell>
                      <TableCell>{order.requiredDate}</TableCell>
                      <TableCell>{order.leadTime}</TableCell>
                      <TableCell>{order.supplier}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}