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
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';

export default function BatchLotManagement() {
  const [activeTab, setActiveTab] = useState('lots');
  
  const { data: batchesData, isLoading } = useQuery({
    queryKey: ['/api/manufacturing/batch-lots'],
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
      <Tabs defaultValue="lots" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="lots">Batch/Lot Control</TabsTrigger>
          <TabsTrigger value="expiration">Expiration Tracking</TabsTrigger>
          <TabsTrigger value="recalls">Recall Management</TabsTrigger>
          <TabsTrigger value="genealogy">Lot Genealogy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lots" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>Batch/Lot Control</CardTitle>
                  <CardDescription>
                    Manage batch and lot numbers for material traceability
                  </CardDescription>
                </div>
                <Button>Create Batch</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center border rounded-md px-3 w-full max-w-sm">
                  <Search className="h-4 w-4 text-muted-foreground mr-2" />
                  <Input 
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0" 
                    placeholder="Search batches..."
                  />
                </div>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch/Lot Number</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Manufacturing Date</TableHead>
                    <TableHead>Expiration Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">BL-2025-0042</TableCell>
                    <TableCell>Raw Material A</TableCell>
                    <TableCell>500 kg</TableCell>
                    <TableCell>Jan 15, 2025</TableCell>
                    <TableCell>Jan 15, 2026</TableCell>
                    <TableCell><Badge className="bg-green-500">Available</Badge></TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">BL-2025-0108</TableCell>
                    <TableCell>Component X</TableCell>
                    <TableCell>2,500 units</TableCell>
                    <TableCell>Feb 10, 2025</TableCell>
                    <TableCell>Feb 10, 2027</TableCell>
                    <TableCell><Badge className="bg-green-500">Available</Badge></TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">BL-2025-0091</TableCell>
                    <TableCell>Packaging Material</TableCell>
                    <TableCell>1,000 units</TableCell>
                    <TableCell>Feb 01, 2025</TableCell>
                    <TableCell>Feb 01, 2028</TableCell>
                    <TableCell><Badge className="bg-yellow-500">On Hold</Badge></TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expiration" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>Expiration Tracking</CardTitle>
                  <CardDescription>
                    Monitor and manage materials with expiration dates
                  </CardDescription>
                </div>
                <Button>Set Alerts</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch/Lot Number</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Expiration Date</TableHead>
                    <TableHead>Days Remaining</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-red-50">
                    <TableCell className="font-medium">BL-2024-0978</TableCell>
                    <TableCell>Chemical Solution</TableCell>
                    <TableCell>May 15, 2025</TableCell>
                    <TableCell>
                      <Badge variant="destructive">14 days</Badge>
                    </TableCell>
                    <TableCell>200 L</TableCell>
                    <TableCell>Warehouse A, Zone C</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-yellow-50">
                    <TableCell className="font-medium">BL-2024-1042</TableCell>
                    <TableCell>Raw Material B</TableCell>
                    <TableCell>Jul 10, 2025</TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-500">70 days</Badge>
                    </TableCell>
                    <TableCell>350 kg</TableCell>
                    <TableCell>Warehouse B, Zone A</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">BL-2025-0042</TableCell>
                    <TableCell>Raw Material A</TableCell>
                    <TableCell>Jan 15, 2026</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">260 days</Badge>
                    </TableCell>
                    <TableCell>500 kg</TableCell>
                    <TableCell>Warehouse A, Zone B</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recalls" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>Recall Management</CardTitle>
                  <CardDescription>
                    Track and manage product recalls and affected batches
                  </CardDescription>
                </div>
                <Button>Initiate Recall</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Recall management system with automated customer notifications and batch tracking is being loaded...
                </p>
                <Button>View Active Recalls</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="genealogy" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>Lot Genealogy</CardTitle>
                  <CardDescription>
                    Track ingredient relationships through manufacturing processes
                  </CardDescription>
                </div>
                <Button>Generate Report</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Lot genealogy visualization with upstream and downstream traceability is being loaded...
                </p>
                <Button>View Genealogy Tree</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}