import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Calculator, ChevronDown, Download, FileText, Search, Settings2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';

export default function MaterialValuationList() {
  const [activeTab, setActiveTab] = useState('materials');
  const [configOpen, setConfigOpen] = useState(false);
  
  // Sample data for demonstration
  const materialValuations = [
    {
      id: 'MAT-001',
      materialCode: 'RM-102',
      materialName: 'Aluminum Sheets',
      category: 'Raw Materials',
      valuationMethod: 'Moving Average',
      stockQuantity: '1250 kg',
      unitOfMeasure: 'kg',
      standardCost: '$21.50',
      currentValue: '$26,875.00',
      lastValuationDate: '2025-04-28',
      currency: 'USD'
    },
    {
      id: 'MAT-002',
      materialCode: 'RM-156',
      materialName: 'Steel Rods',
      category: 'Raw Materials',
      valuationMethod: 'Moving Average',
      stockQuantity: '1900 kg',
      unitOfMeasure: 'kg',
      standardCost: '$18.75',
      currentValue: '$35,625.00',
      lastValuationDate: '2025-04-28',
      currency: 'USD'
    },
    {
      id: 'MAT-003',
      materialCode: 'CMP-2245',
      materialName: 'Electronic Controller',
      category: 'Components',
      valuationMethod: 'FIFO',
      stockQuantity: '80 units',
      unitOfMeasure: 'ea',
      standardCost: '$125.00',
      currentValue: '$10,000.00',
      lastValuationDate: '2025-04-28',
      currency: 'USD'
    },
    {
      id: 'MAT-004',
      materialCode: 'CMP-2312',
      materialName: 'Sensor Assembly',
      category: 'Components',
      valuationMethod: 'FIFO',
      stockQuantity: '150 units',
      unitOfMeasure: 'ea',
      standardCost: '$45.80',
      currentValue: '$6,870.00',
      lastValuationDate: '2025-04-28',
      currency: 'USD'
    },
    {
      id: 'MAT-005',
      materialCode: 'CHM-5001',
      materialName: 'Industrial Solvent',
      category: 'Chemicals',
      valuationMethod: 'LIFO',
      stockQuantity: '220 liters',
      unitOfMeasure: 'l',
      standardCost: '$75.20',
      currentValue: '$16,544.00',
      lastValuationDate: '2025-04-28',
      currency: 'USD'
    },
    {
      id: 'MAT-006',
      materialCode: 'PKG-3001',
      materialName: 'Packaging Materials',
      category: 'Packaging',
      valuationMethod: 'Standard Cost',
      stockQuantity: '5000 units',
      unitOfMeasure: 'ea',
      standardCost: '$1.25',
      currentValue: '$6,250.00',
      lastValuationDate: '2025-04-28',
      currency: 'USD'
    },
    {
      id: 'MAT-007',
      materialCode: 'RM-378',
      materialName: 'Raw Polymer',
      category: 'Raw Materials',
      valuationMethod: 'Moving Average',
      stockQuantity: '3200 kg',
      unitOfMeasure: 'kg',
      standardCost: '$12.80',
      currentValue: '$40,960.00',
      lastValuationDate: '2025-04-28',
      currency: 'USD'
    }
  ];
  
  const valuationRecords = [
    {
      id: 'VR-2504-001',
      materialCode: 'RM-102',
      materialName: 'Aluminum Sheets',
      date: '2025-04-28',
      previousCost: '$21.25',
      currentCost: '$21.50',
      changeAmount: '+$0.25',
      changePercent: '+1.18%',
      reason: 'Price adjustment due to market increase',
      approvedBy: 'John Smith'
    },
    {
      id: 'VR-2504-002',
      materialCode: 'RM-156',
      materialName: 'Steel Rods',
      date: '2025-04-28',
      previousCost: '$19.10',
      currentCost: '$18.75',
      changeAmount: '-$0.35',
      changePercent: '-1.83%',
      reason: 'Price decrease from volume discount',
      approvedBy: 'John Smith'
    },
    {
      id: 'VR-2503-015',
      materialCode: 'CMP-2245',
      materialName: 'Electronic Controller',
      date: '2025-03-15',
      previousCost: '$122.50',
      currentCost: '$125.00',
      changeAmount: '+$2.50',
      changePercent: '+2.04%',
      reason: 'Component cost increase',
      approvedBy: 'Sarah Johnson'
    },
    {
      id: 'VR-2503-018',
      materialCode: 'CHM-5001',
      materialName: 'Industrial Solvent',
      date: '2025-03-10',
      previousCost: '$72.80',
      currentCost: '$75.20',
      changeAmount: '+$2.40',
      changePercent: '+3.30%',
      reason: 'Supplier price increase',
      approvedBy: 'David Lee'
    },
    {
      id: 'VR-2502-032',
      materialCode: 'RM-378',
      materialName: 'Raw Polymer',
      date: '2025-02-20',
      previousCost: '$13.25',
      currentCost: '$12.80',
      changeAmount: '-$0.45',
      changePercent: '-3.40%',
      reason: 'New supplier contract',
      approvedBy: 'Michael Chen'
    }
  ];
  
  // Data for charts
  const valuationMethodDistribution = [
    { name: 'Moving Average', value: 3 },
    { name: 'FIFO', value: 2 },
    { name: 'LIFO', value: 1 },
    { name: 'Standard Cost', value: 1 }
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  const priceTrendData = [
    { month: 'Dec', aluminium: 20.50, steel: 19.20, polymer: 13.50 },
    { month: 'Jan', aluminium: 20.80, steel: 19.50, polymer: 13.40 },
    { month: 'Feb', aluminium: 21.10, steel: 19.30, polymer: 13.25 },
    { month: 'Mar', aluminium: 21.25, steel: 19.10, polymer: 13.00 },
    { month: 'Apr', aluminium: 21.50, steel: 18.75, polymer: 12.80 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Material Valuation</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Report
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setConfigOpen(true)}>
            <Settings2 className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>SAP-level Material Valuation</AlertTitle>
        <AlertDescription>
          Averox provides multiple valuation methods including Moving Average, FIFO, LIFO, and Standard Cost.
          The system supports multiple currencies, automated price updates, and detailed valuation history.
          These capabilities exceed standard ERP functionality by providing real-time cost calculations and
          integrated material requirements planning.
        </AlertDescription>
      </Alert>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="materials">Material Valuation</TabsTrigger>
          <TabsTrigger value="history">Valuation History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Material Valuation List</CardTitle>
                  <CardDescription>Current valuation of materials in inventory</CardDescription>
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
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="raw">Raw Materials</SelectItem>
                      <SelectItem value="components">Components</SelectItem>
                      <SelectItem value="chemicals">Chemicals</SelectItem>
                      <SelectItem value="packaging">Packaging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Valuation Method</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Standard Cost</TableHead>
                    <TableHead>Current Value</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materialValuations.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.materialCode}</TableCell>
                      <TableCell>{material.materialName}</TableCell>
                      <TableCell>{material.category}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {material.valuationMethod}
                        </Badge>
                      </TableCell>
                      <TableCell>{material.stockQuantity}</TableCell>
                      <TableCell>{material.standardCost}/{material.unitOfMeasure}</TableCell>
                      <TableCell className="font-medium">{material.currentValue}</TableCell>
                      <TableCell>{material.lastValuationDate}</TableCell>
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
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Valuation History</CardTitle>
                  <CardDescription>Historical record of material cost changes</CardDescription>
                </div>
                <div className="flex">
                  <div className="relative mr-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search records..."
                      className="w-[200px] pl-8"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Materials</SelectItem>
                      {materialValuations.map(material => (
                        <SelectItem key={material.id} value={material.materialCode}>
                          {material.materialCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Record ID</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Previous Cost</TableHead>
                    <TableHead>Current Cost</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>% Change</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Approved By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {valuationRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.id}</TableCell>
                      <TableCell>
                        <div>{record.materialCode}</div>
                        <div className="text-xs text-muted-foreground">{record.materialName}</div>
                      </TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.previousCost}</TableCell>
                      <TableCell>{record.currentCost}</TableCell>
                      <TableCell>
                        <span className={record.changeAmount.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                          {record.changeAmount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={record.changePercent.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                          {record.changePercent}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{record.reason}</TableCell>
                      <TableCell>{record.approvedBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Valuation Methods Distribution</CardTitle>
                <CardDescription>Distribution of valuation methods across materials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={valuationMethodDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {valuationMethodDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} materials`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Material Cost Trends</CardTitle>
                <CardDescription>Price trends for key raw materials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={priceTrendData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Unit Cost']} />
                      <Legend />
                      <Line type="monotone" dataKey="aluminium" stroke="#8884d8" name="Aluminum" />
                      <Line type="monotone" dataKey="steel" stroke="#82ca9d" name="Steel" />
                      <Line type="monotone" dataKey="polymer" stroke="#ff7300" name="Polymer" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Material Value by Category</CardTitle>
                <CardDescription>Total inventory value by material category</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Material Count</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Primary Valuation Method</TableHead>
                      <TableHead>Last Update</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Raw Materials</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell>$103,460.00</TableCell>
                      <TableCell>Moving Average</TableCell>
                      <TableCell>2025-04-28</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Components</TableCell>
                      <TableCell>2</TableCell>
                      <TableCell>$16,870.00</TableCell>
                      <TableCell>FIFO</TableCell>
                      <TableCell>2025-04-28</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Chemicals</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>$16,544.00</TableCell>
                      <TableCell>LIFO</TableCell>
                      <TableCell>2025-04-28</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Packaging</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>$6,250.00</TableCell>
                      <TableCell>Standard Cost</TableCell>
                      <TableCell>2025-04-28</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Configure Valuation Dialog */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Configure Material Valuation</DialogTitle>
            <DialogDescription>
              Configure material valuation methods and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="default-method" className="text-right">
                Default Method
              </Label>
              <Select>
                <SelectTrigger id="default-method" className="col-span-3">
                  <SelectValue placeholder="Select valuation method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moving-avg">Moving Average</SelectItem>
                  <SelectItem value="fifo">FIFO</SelectItem>
                  <SelectItem value="lifo">LIFO</SelectItem>
                  <SelectItem value="standard">Standard Cost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="default-currency" className="text-right">
                Default Currency
              </Label>
              <Select>
                <SelectTrigger id="default-currency" className="col-span-3">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD - US Dollar</SelectItem>
                  <SelectItem value="eur">EUR - Euro</SelectItem>
                  <SelectItem value="gbp">GBP - British Pound</SelectItem>
                  <SelectItem value="jpy">JPY - Japanese Yen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="auto-update" className="text-right">
                Auto Update
              </Label>
              <Select>
                <SelectTrigger id="auto-update" className="col-span-3">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="manual">Manual Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="approval-required" className="text-right">
                Approval Required
              </Label>
              <Select>
                <SelectTrigger id="approval-required" className="col-span-3">
                  <SelectValue placeholder="Select threshold" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="5">Changes &gt; 5%</SelectItem>
                  <SelectItem value="10">Changes &gt; 10%</SelectItem>
                  <SelectItem value="all">All Changes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setConfigOpen(false)}>
              <Calculator className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}