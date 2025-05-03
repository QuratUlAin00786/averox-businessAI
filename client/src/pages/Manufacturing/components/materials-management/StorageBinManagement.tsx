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
import { Search, AlertCircle, Plus } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function StorageBinManagement() {
  const [activeTab, setActiveTab] = useState('bins');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch storage bins with utilization data
  const { 
    data: storageBinsResponse, 
    isLoading: isLoadingStorageBins, 
    isError: isStorageBinsError,
    error: storageBinsError
  } = useQuery({
    queryKey: ['/api/manufacturing/warehouse/bins'],
    queryFn: async () => {
      const response = await fetch('/api/manufacturing/warehouse/bins');
      if (!response.ok) {
        throw new Error('Failed to fetch storage bins data');
      }
      return response.json();
    },
    enabled: activeTab === 'bins'
  });

  // Extract storage data from PostgreSQL response
  const storageData = storageBinsResponse?.rows || [];

  // Fetch warehouses (top-level storage locations)
  const { 
    data: warehousesResponse, 
    isLoading: isLoadingWarehouses,
    isError: isWarehousesError,
    error: warehousesError 
  } = useQuery({
    queryKey: ['/api/manufacturing/storage/locations'],
    queryFn: async () => {
      const response = await fetch('/api/manufacturing/storage/locations');
      if (!response.ok) {
        throw new Error('Failed to fetch storage locations data');
      }
      return response.json();
    },
    enabled: activeTab === 'warehouses'
  });
  
  // Extract warehouses data from PostgreSQL response
  const warehousesData = warehousesResponse?.rows || [];

  const isLoading = (activeTab === 'bins' && isLoadingStorageBins) || 
                    (activeTab === 'warehouses' && isLoadingWarehouses);
  
  const isError = (activeTab === 'bins' && isStorageBinsError) || 
                  (activeTab === 'warehouses' && isWarehousesError);
  
  const error = activeTab === 'bins' ? storageBinsError : warehousesError;

  // Filter storage bins based on search term
  const filteredStorageBins = storageData && searchTerm
    ? storageData.filter(bin => 
        bin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bin.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bin.parent_name && bin.parent_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : storageData;

  // Filter warehouses to only show top-level locations
  const warehouses = warehousesData?.filter(location => 
    location.type === 'Warehouse' || !location.parentId
  );

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
          {error instanceof Error ? error.message : 'Failed to load storage data'}
        </AlertDescription>
      </Alert>
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
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Storage Bin
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center border rounded-md px-3 mb-4 w-full max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <Input 
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0" 
                  placeholder="Search storage bins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {filteredStorageBins?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bin ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStorageBins.map((bin) => (
                      <TableRow key={bin.id}>
                        <TableCell className="font-medium">{bin.code}</TableCell>
                        <TableCell>{bin.name}</TableCell>
                        <TableCell>{bin.parent_name || '-'}</TableCell>
                        <TableCell>{bin.capacityUom ? `${bin.capacity} ${bin.capacityUom}` : 'Unknown'}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                              <div 
                                className={`h-full rounded-full ${
                                  bin.utilization_percentage >= 90 ? 'bg-red-500' : 
                                  bin.utilization_percentage >= 70 ? 'bg-yellow-500' : 
                                  'bg-green-500'
                                }`} 
                                style={{ width: `${bin.utilization_percentage || 0}%` }}
                              ></div>
                            </div>
                            <span>{bin.utilization_percentage || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={bin.isActive ? 'bg-green-500' : 'bg-gray-400'}
                          >
                            {bin.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? (
                    <p>No storage bins match your search criteria.</p>
                  ) : (
                    <p>No storage bins found. Please add some bins to get started.</p>
                  )}
                </div>
              )}
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
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Warehouse
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {warehouses?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warehouses.map((warehouse) => (
                      <TableRow key={warehouse.id}>
                        <TableCell className="font-medium">{warehouse.code}</TableCell>
                        <TableCell>{warehouse.name}</TableCell>
                        <TableCell>{warehouse.address || 'Not specified'}</TableCell>
                        <TableCell>
                          {warehouse.capacity 
                            ? `${warehouse.capacity} ${warehouse.capacityUom || 'units'}` 
                            : 'Not specified'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={warehouse.isActive ? 'bg-green-500' : 'bg-gray-400'}
                          >
                            {warehouse.isActive ? 'Operational' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No warehouses found. Please add a warehouse to get started.</p>
                </div>
              )}
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
                  No storage zone data available. Please add data to the database.
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
                  No material transfer data available. Please add data to the database.
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