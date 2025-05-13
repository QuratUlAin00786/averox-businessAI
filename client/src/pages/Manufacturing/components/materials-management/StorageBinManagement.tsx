import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Search, AlertCircle, Plus, X } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

// Form schema definitions
const addStorageBinSchema = z.object({
  bin_code: z.string().min(2, { message: "Bin code must be at least 2 characters" }),
  warehouse_id: z.string().min(1, { message: "Please select a warehouse" }),
  zone_id: z.string().optional(),
  aisle: z.string().optional(),
  rack: z.string().optional(),
  level: z.string().optional(),
  position: z.string().optional(),
  capacity: z.coerce.number().min(0).optional(),
  bin_type: z.string().optional(),
  max_weight: z.coerce.number().min(0).optional(),
  height: z.coerce.number().min(0).optional(),
  width: z.coerce.number().min(0).optional(),
  depth: z.coerce.number().min(0).optional(),
  special_handling_notes: z.string().optional(),
  is_mixing_allowed: z.boolean().default(false)
});

const addWarehouseSchema = z.object({
  name: z.string().min(2, { message: "Warehouse name must be at least 2 characters" }),
  code: z.string().min(2, { message: "Warehouse code must be at least 2 characters" }),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zip: z.string().optional(),
  capacity: z.coerce.number().min(0).optional(),
  is_manufacturing: z.boolean().default(false),
  description: z.string().optional(),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().optional()
});

const addZoneSchema = z.object({
  name: z.string().min(2, { message: "Zone name must be at least 2 characters" }),
  code: z.string().min(2, { message: "Zone code must be at least 2 characters" }),
  description: z.string().optional(),
  warehouse_id: z.string().min(1, { message: "Please select a warehouse" }),
  zone_type: z.string().optional(),
  capacity: z.coerce.number().min(0).optional()
});

const addTransferSchema = z.object({
  product_id: z.string().min(1, { message: "Please select a product" }),
  source_bin_id: z.string().min(1, { message: "Please select a source bin" }),
  destination_bin_id: z.string().min(1, { message: "Please select a destination bin" }),
  quantity: z.coerce.number().min(0.01, { message: "Quantity must be greater than 0" }),
  transfer_reason: z.string().optional(),
  reference_number: z.string().optional(),
  notes: z.string().optional()
});

export default function StorageBinManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('bins');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddBinDialog, setShowAddBinDialog] = useState(false);
  const [showAddWarehouseDialog, setShowAddWarehouseDialog] = useState(false);
  const [showAddZoneDialog, setShowAddZoneDialog] = useState(false);
  const [showAddTransferDialog, setShowAddTransferDialog] = useState(false);
  
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
    }
  });

  // Extract storage data from PostgreSQL response
  const storageData = storageBinsResponse || [];

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
    }
  });
  
  // Extract warehouses data from PostgreSQL response
  const warehousesData = warehousesResponse || [];
  
  // Fetch zones
  const {
    data: zonesResponse,
    isLoading: isLoadingZones,
    isError: isZonesError,
    error: zonesError
  } = useQuery({
    queryKey: ['/api/manufacturing/warehouse/zones'],
    queryFn: async () => {
      const response = await fetch('/api/manufacturing/warehouse/zones');
      if (!response.ok) {
        throw new Error('Failed to fetch zones data');
      }
      return response.json();
    }
  });
  
  const zonesData = zonesResponse || [];
  
  // Fetch products for transfer dialog
  const {
    data: productsResponse,
    isLoading: isLoadingProducts
  } = useQuery({
    queryKey: ['/api/manufacturing/products'],
    queryFn: async () => {
      const response = await fetch('/api/manufacturing/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products data');
      }
      return response.json();
    }
  });
  
  const productsData = productsResponse || [];
  
  // Fetch transfers data
  const {
    data: transfersResponse,
    isLoading: isLoadingTransfers,
    isError: isTransfersError,
    error: transfersError
  } = useQuery({
    queryKey: ['/api/manufacturing/warehouse/transfers'],
    queryFn: async () => {
      const response = await fetch('/api/manufacturing/warehouse/transfers');
      if (!response.ok) {
        throw new Error('Failed to fetch transfers data');
      }
      return response.json();
    },
    enabled: activeTab === 'transfers'
  });
  
  const transfersData = transfersResponse || [];
  
  // Storage Bin Form
  const storageBinForm = useForm<z.infer<typeof addStorageBinSchema>>({
    resolver: zodResolver(addStorageBinSchema),
    defaultValues: {
      bin_code: '',
      warehouse_id: '',
      zone_id: '',
      aisle: '',
      rack: '',
      level: '',
      position: '',
      capacity: 0,
      bin_type: 'Standard',
      max_weight: 0,
      height: 0,
      width: 0,
      depth: 0,
      special_handling_notes: '',
      is_mixing_allowed: false
    }
  });
  
  // Warehouse Form
  const warehouseForm = useForm<z.infer<typeof addWarehouseSchema>>({
    resolver: zodResolver(addWarehouseSchema),
    defaultValues: {
      name: '',
      code: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zip: '',
      capacity: 0,
      is_manufacturing: false,
      description: '',
      contact_person: '',
      contact_phone: '',
      contact_email: ''
    }
  });
  
  // Zone Form
  const zoneForm = useForm<z.infer<typeof addZoneSchema>>({
    resolver: zodResolver(addZoneSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      warehouse_id: '',
      zone_type: 'Standard',
      capacity: 0
    }
  });
  
  // Transfer Form
  const transferForm = useForm<z.infer<typeof addTransferSchema>>({
    resolver: zodResolver(addTransferSchema),
    defaultValues: {
      product_id: '',
      source_bin_id: '',
      destination_bin_id: '',
      quantity: 0,
      transfer_reason: '',
      reference_number: '',
      notes: ''
    }
  });
  
  // Mutations
  const addStorageBinMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addStorageBinSchema>) => {
      const response = await fetch('/api/manufacturing/warehouse/bins/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add storage bin');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/warehouse/bins'] });
      toast({
        title: "Storage bin added",
        description: "The storage bin has been successfully added",
      });
      setShowAddBinDialog(false);
      storageBinForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const addWarehouseMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addWarehouseSchema>) => {
      const response = await fetch('/api/manufacturing/storage/locations/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add warehouse');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/storage/locations'] });
      toast({
        title: "Warehouse added",
        description: "The warehouse has been successfully added",
      });
      setShowAddWarehouseDialog(false);
      warehouseForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const addZoneMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addZoneSchema>) => {
      const response = await fetch('/api/manufacturing/warehouse/zones/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add zone');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/warehouse/zones'] });
      toast({
        title: "Zone added",
        description: "The storage zone has been successfully added",
      });
      setShowAddZoneDialog(false);
      zoneForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const addTransferMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addTransferSchema>) => {
      const response = await fetch('/api/manufacturing/warehouse/transfers/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process material transfer');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/warehouse/transfers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/warehouse/bins'] });
      toast({
        title: "Transfer completed",
        description: "The material transfer has been processed successfully",
      });
      setShowAddTransferDialog(false);
      transferForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const isLoading = (activeTab === 'bins' && isLoadingStorageBins) || 
                    (activeTab === 'warehouses' && isLoadingWarehouses) ||
                    (activeTab === 'zones' && isLoadingZones) ||
                    (activeTab === 'transfers' && isLoadingTransfers);
  
  const isError = (activeTab === 'bins' && isStorageBinsError) || 
                  (activeTab === 'warehouses' && isWarehousesError) ||
                  (activeTab === 'zones' && isZonesError) ||
                  (activeTab === 'transfers' && isTransfersError);
  
  const error = activeTab === 'bins' 
    ? storageBinsError 
    : activeTab === 'warehouses'
    ? warehousesError
    : activeTab === 'zones'
    ? zonesError
    : transfersError;

  // Filter storage bins based on search term
  const filteredStorageBins = storageData && searchTerm
    ? storageData.filter((bin: any) => 
        bin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bin.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bin.parent_name && bin.parent_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : storageData;

  // Filter warehouses to only show top-level locations
  const warehouses = warehousesData?.filter((location: any) => 
    location.type === 'Warehouse' || !location.parentId
  );
  
  // Form submission handlers
  const onSubmitStorageBin = (data: z.infer<typeof addStorageBinSchema>) => {
    addStorageBinMutation.mutate(data);
  };
  
  const onSubmitWarehouse = (data: z.infer<typeof addWarehouseSchema>) => {
    addWarehouseMutation.mutate(data);
  };
  
  const onSubmitZone = (data: z.infer<typeof addZoneSchema>) => {
    addZoneMutation.mutate(data);
  };
  
  const onSubmitTransfer = (data: z.infer<typeof addTransferSchema>) => {
    addTransferMutation.mutate(data);
  };

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
                <Button onClick={() => setShowAddBinDialog(true)}>
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
                <Button onClick={() => setShowAddWarehouseDialog(true)}>
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
                <Button onClick={() => setShowAddZoneDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Zone
                </Button>
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
                <Button onClick={() => setShowAddTransferDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Transfer
                </Button>
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
      
      {/* Add Storage Bin Dialog */}
      <Dialog open={showAddBinDialog} onOpenChange={setShowAddBinDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Storage Bin</DialogTitle>
            <DialogDescription>
              Create a new storage bin in your warehouse
            </DialogDescription>
          </DialogHeader>
          
          <Form {...storageBinForm}>
            <form onSubmit={storageBinForm.handleSubmit(onSubmitStorageBin)} className="space-y-4">
              <FormField
                control={storageBinForm.control}
                name="bin_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bin Code*</FormLabel>
                    <FormControl>
                      <Input placeholder="BIN001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={storageBinForm.control}
                name="warehouse_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warehouse*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a warehouse" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehousesData?.map((warehouse: any) => (
                          <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={storageBinForm.control}
                name="zone_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zone (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a zone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {zonesData?.map((zone: any) => (
                          <SelectItem key={zone.id} value={zone.id.toString()}>
                            {zone.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={storageBinForm.control}
                  name="aisle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aisle</FormLabel>
                      <FormControl>
                        <Input placeholder="A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={storageBinForm.control}
                  name="rack"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rack</FormLabel>
                      <FormControl>
                        <Input placeholder="01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={storageBinForm.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <FormControl>
                        <Input placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={storageBinForm.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={storageBinForm.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={storageBinForm.control}
                name="bin_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bin Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bin type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Bulk">Bulk</SelectItem>
                        <SelectItem value="High Value">High Value</SelectItem>
                        <SelectItem value="Refrigerated">Refrigerated</SelectItem>
                        <SelectItem value="Hazardous">Hazardous</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={storageBinForm.formState.isSubmitting || addStorageBinMutation.isPending}
                >
                  {(storageBinForm.formState.isSubmitting || addStorageBinMutation.isPending) ? 
                    'Creating...' : 'Create Bin'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Add Warehouse Dialog */}
      <Dialog open={showAddWarehouseDialog} onOpenChange={setShowAddWarehouseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Warehouse</DialogTitle>
            <DialogDescription>
              Create a new warehouse in your inventory system
            </DialogDescription>
          </DialogHeader>
          
          <Form {...warehouseForm}>
            <form onSubmit={warehouseForm.handleSubmit(onSubmitWarehouse)} className="space-y-4">
              <FormField
                control={warehouseForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warehouse Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Main Warehouse" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={warehouseForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warehouse Code*</FormLabel>
                    <FormControl>
                      <Input placeholder="WH-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={warehouseForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Storage St." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={warehouseForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={warehouseForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={warehouseForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={warehouseForm.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal/ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={warehouseForm.formState.isSubmitting || addWarehouseMutation.isPending}
                >
                  {(warehouseForm.formState.isSubmitting || addWarehouseMutation.isPending) ? 
                    'Creating...' : 'Create Warehouse'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Add Zone Dialog */}
      <Dialog open={showAddZoneDialog} onOpenChange={setShowAddZoneDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Storage Zone</DialogTitle>
            <DialogDescription>
              Create a new zone within a warehouse
            </DialogDescription>
          </DialogHeader>
          
          <Form {...zoneForm}>
            <form onSubmit={zoneForm.handleSubmit(onSubmitZone)} className="space-y-4">
              <FormField
                control={zoneForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zone Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Refrigerated Zone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={zoneForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zone Code*</FormLabel>
                    <FormControl>
                      <Input placeholder="ZONE-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={zoneForm.control}
                name="warehouse_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warehouse*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a warehouse" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehousesData?.map((warehouse: any) => (
                          <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={zoneForm.control}
                name="zone_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zone Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select zone type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Bulk">Bulk Storage</SelectItem>
                        <SelectItem value="Refrigerated">Refrigerated</SelectItem>
                        <SelectItem value="Hazardous">Hazardous Materials</SelectItem>
                        <SelectItem value="Picking">Picking Area</SelectItem>
                        <SelectItem value="Receiving">Receiving Area</SelectItem>
                        <SelectItem value="Shipping">Shipping Area</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={zoneForm.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={zoneForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter description for this zone" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={zoneForm.formState.isSubmitting || addZoneMutation.isPending}
                >
                  {(zoneForm.formState.isSubmitting || addZoneMutation.isPending) ? 
                    'Creating...' : 'Create Zone'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Add Material Transfer Dialog */}
      <Dialog open={showAddTransferDialog} onOpenChange={setShowAddTransferDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Material Transfer</DialogTitle>
            <DialogDescription>
              Transfer materials between storage locations
            </DialogDescription>
          </DialogHeader>
          
          <Form {...transferForm}>
            <form onSubmit={transferForm.handleSubmit(onSubmitTransfer)} className="space-y-4">
              <FormField
                control={transferForm.control}
                name="product_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {productsData?.map((product: any) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={transferForm.control}
                name="source_bin_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Bin*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source bin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {storageData?.map((bin: any) => (
                          <SelectItem key={bin.id} value={bin.id.toString()}>
                            {bin.code} - {bin.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={transferForm.control}
                name="destination_bin_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Bin*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination bin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {storageData?.map((bin: any) => (
                          <SelectItem key={bin.id} value={bin.id.toString()}>
                            {bin.code} - {bin.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={transferForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity*</FormLabel>
                    <FormControl>
                      <Input type="number" min="0.01" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={transferForm.control}
                name="reference_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number</FormLabel>
                    <FormControl>
                      <Input placeholder="TR-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={transferForm.control}
                name="transfer_reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transfer Reason</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Rebalancing">Inventory Rebalancing</SelectItem>
                        <SelectItem value="StockRotation">Stock Rotation</SelectItem>
                        <SelectItem value="Production">Production Need</SelectItem>
                        <SelectItem value="Quality">Quality Control</SelectItem>
                        <SelectItem value="Shipping">Shipping Preparation</SelectItem>
                        <SelectItem value="Receiving">Receiving Process</SelectItem>
                        <SelectItem value="Other">Other Reason</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={transferForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes about this transfer" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={transferForm.formState.isSubmitting || addTransferMutation.isPending}
                >
                  {(transferForm.formState.isSubmitting || addTransferMutation.isPending) ? 
                    'Processing...' : 'Process Transfer'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}