import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

export default function MaterialValuationList() {
  const [activeTab, setActiveTab] = useState('methods');
  const [selectedMethod, setSelectedMethod] = useState('moving-average');
  
  const { data: valuationData, isLoading } = useQuery({
    queryKey: ['/api/manufacturing/valuations'],
    enabled: true
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="methods" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="methods">Valuation Methods</TabsTrigger>
          <TabsTrigger value="materials">Material Values</TabsTrigger>
          <TabsTrigger value="reports">Valuation Reports</TabsTrigger>
          <TabsTrigger value="history">Price History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="methods" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>Valuation Methods</CardTitle>
                  <CardDescription>
                    Configure and manage material valuation methods
                  </CardDescription>
                </div>
                <Button>Configure Method</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Default For</TableHead>
                    <TableHead>Last Calculated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Moving Average</TableCell>
                    <TableCell>Average cost continuously recalculated with each receipt</TableCell>
                    <TableCell><Badge className="bg-green-500">Active</Badge></TableCell>
                    <TableCell>Raw Materials</TableCell>
                    <TableCell>May 1, 2025</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Configure</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">FIFO</TableCell>
                    <TableCell>First-in, first-out cost flow assumption</TableCell>
                    <TableCell><Badge className="bg-green-500">Active</Badge></TableCell>
                    <TableCell>Finished Goods</TableCell>
                    <TableCell>May 1, 2025</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Configure</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">LIFO</TableCell>
                    <TableCell>Last-in, first-out cost flow assumption</TableCell>
                    <TableCell><Badge variant="outline">Inactive</Badge></TableCell>
                    <TableCell>N/A</TableCell>
                    <TableCell>N/A</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Configure</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Standard Cost</TableCell>
                    <TableCell>Predetermined cost based on normal operating conditions</TableCell>
                    <TableCell><Badge className="bg-green-500">Active</Badge></TableCell>
                    <TableCell>Components</TableCell>
                    <TableCell>May 1, 2025</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Configure</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="materials" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Material Values</CardTitle>
                  <CardDescription>
                    Current inventory values by material and method
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="valuation-method">Valuation Method</Label>
                    <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                      <SelectTrigger id="valuation-method" className="w-[180px]">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="moving-average">Moving Average</SelectItem>
                        <SelectItem value="fifo">FIFO</SelectItem>
                        <SelectItem value="lifo">LIFO</SelectItem>
                        <SelectItem value="standard">Standard Cost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>Run Valuation</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Unit Value</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Raw Material A</TableCell>
                    <TableCell>2,500</TableCell>
                    <TableCell>kg</TableCell>
                    <TableCell>$4.25</TableCell>
                    <TableCell>$10,625.00</TableCell>
                    <TableCell>May 1, 2025</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Details</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Component X</TableCell>
                    <TableCell>15,000</TableCell>
                    <TableCell>units</TableCell>
                    <TableCell>$1.85</TableCell>
                    <TableCell>$27,750.00</TableCell>
                    <TableCell>May 1, 2025</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Details</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Finished Product Z</TableCell>
                    <TableCell>800</TableCell>
                    <TableCell>units</TableCell>
                    <TableCell>$43.75</TableCell>
                    <TableCell>$35,000.00</TableCell>
                    <TableCell>May 1, 2025</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Details</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>Valuation Reports</CardTitle>
                  <CardDescription>
                    Generate and view inventory valuation reports
                  </CardDescription>
                </div>
                <Button>Generate Report</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No valuation report data available. Please add data to the database.
                </p>
                <Button>View Report History</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>Price History</CardTitle>
                  <CardDescription>
                    Historical price trends and fluctuations
                  </CardDescription>
                </div>
                <Button>Export Data</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No price history data available. Please add data to the database.
                </p>
                <Button>View Analysis</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}