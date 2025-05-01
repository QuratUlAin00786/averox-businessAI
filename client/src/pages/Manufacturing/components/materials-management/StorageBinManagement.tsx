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
import { Search } from 'lucide-react';

export default function StorageBinManagement() {
  const [activeTab, setActiveTab] = useState('bins');
  
  const { data: warehouseData, isLoading } = useQuery({
    queryKey: ['/api/manufacturing/warehouse/bins'],
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
      <Tabs defaultValue="bins" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="bins">Storage Bins</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          <TabsTrigger value="zones">Storage Zones</TabsTrigger>
          <TabsTrigger value="transfers">Material Transfers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bins" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>Storage Bin Management</CardTitle>
                  <CardDescription>
                    Manage storage locations and bin arrangements
                  </CardDescription>
                </div>
                <Button>Add Storage Bin</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center border rounded-md px-3 mb-4 w-full max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <Input 
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0" 
                  placeholder="Search storage bins..."
                />
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bin ID</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">BIN-A1-001</TableCell>
                    <TableCell>Central Warehouse</TableCell>
                    <TableCell>Zone A1</TableCell>
                    <TableCell>Large</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                          <div className="h-full bg-yellow-500 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                        <span>65%</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge className="bg-green-500">Active</Badge></TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">BIN-B2-042</TableCell>
                    <TableCell>Central Warehouse</TableCell>
                    <TableCell>Zone B2</TableCell>
                    <TableCell>Medium</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: '90%' }}></div>
                        </div>
                        <span>90%</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge className="bg-green-500">Active</Badge></TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">BIN-C3-115</TableCell>
                    <TableCell>East Distribution</TableCell>
                    <TableCell>Zone C3</TableCell>
                    <TableCell>Small</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '20%' }}></div>
                        </div>
                        <span>20%</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge className="bg-green-500">Active</Badge></TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="warehouses" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>Warehouse Management</CardTitle>
                  <CardDescription>
                    Manage warehouse facilities and capacity
                  </CardDescription>
                </div>
                <Button>Add Warehouse</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Size (sqft)</TableHead>
                    <TableHead>Zones</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Central Warehouse</TableCell>
                    <TableCell>Chicago, IL</TableCell>
                    <TableCell>125,000</TableCell>
                    <TableCell>8</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                          <div className="h-full bg-yellow-500 rounded-full" style={{ width: '72%' }}></div>
                        </div>
                        <span>72%</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge className="bg-green-500">Operational</Badge></TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">East Distribution</TableCell>
                    <TableCell>Atlanta, GA</TableCell>
                    <TableCell>85,000</TableCell>
                    <TableCell>6</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                        <span>45%</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge className="bg-green-500">Operational</Badge></TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="zones" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>Storage Zone Management</CardTitle>
                  <CardDescription>
                    Manage storage zones within warehouses
                  </CardDescription>
                </div>
                <Button>Add Zone</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Storage zone configuration and monitoring system is being loaded...
                </p>
                <Button>View Zones</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transfers" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>Material Transfers</CardTitle>
                  <CardDescription>
                    Manage movement of materials between locations
                  </CardDescription>
                </div>
                <Button>New Transfer</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Material transfer system with barcode scanning and location tracking is being loaded...
                </p>
                <Button>View Transfer History</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}