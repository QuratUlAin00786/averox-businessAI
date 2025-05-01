import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, ChevronDown, Download, FileText, PlusCircle, Search, Warehouse } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function StorageBinManagement() {
  const [activeTab, setActiveTab] = useState('bins');
  const [addBinOpen, setAddBinOpen] = useState(false);
  
  // Sample data for demonstration
  const storageBins = [
    {
      id: 'BIN-A-01-01',
      warehouse: 'Main Warehouse',
      zone: 'Zone A',
      aisle: '01',
      shelf: '01',
      type: 'Pallet',
      dimensions: '1.2m x 1.0m x 1.5m',
      maxWeight: '1000 kg',
      currentWeight: '650 kg',
      currentItems: 4,
      status: 'Active',
      utilizationRate: 65
    },
    {
      id: 'BIN-A-01-02',
      warehouse: 'Main Warehouse',
      zone: 'Zone A',
      aisle: '01',
      shelf: '02',
      type: 'Pallet',
      dimensions: '1.2m x 1.0m x 1.5m',
      maxWeight: '1000 kg',
      currentWeight: '320 kg',
      currentItems: 2,
      status: 'Active',
      utilizationRate: 32
    },
    {
      id: 'BIN-A-02-01',
      warehouse: 'Main Warehouse',
      zone: 'Zone A',
      aisle: '02',
      shelf: '01',
      type: 'Shelf Bin',
      dimensions: '0.6m x 0.4m x 0.3m',
      maxWeight: '100 kg',
      currentWeight: '85 kg',
      currentItems: 8,
      status: 'Active',
      utilizationRate: 85
    },
    {
      id: 'BIN-B-01-01',
      warehouse: 'Main Warehouse',
      zone: 'Zone B',
      aisle: '01',
      shelf: '01',
      type: 'Pallet',
      dimensions: '1.2m x 1.0m x 1.5m',
      maxWeight: '1000 kg',
      currentWeight: '980 kg',
      currentItems: 2,
      status: 'Active',
      utilizationRate: 98
    },
    {
      id: 'BIN-B-01-02',
      warehouse: 'Main Warehouse',
      zone: 'Zone B',
      aisle: '01',
      shelf: '02',
      type: 'Pallet',
      dimensions: '1.2m x 1.0m x 1.5m',
      maxWeight: '1000 kg',
      currentWeight: '0 kg',
      currentItems: 0,
      status: 'Available',
      utilizationRate: 0
    },
    {
      id: 'BIN-C-01-01',
      warehouse: 'Storage Facility',
      zone: 'Zone C',
      aisle: '01',
      shelf: '01',
      type: 'Bulk Storage',
      dimensions: '3.0m x 2.0m x 2.0m',
      maxWeight: '5000 kg',
      currentWeight: '3200 kg',
      currentItems: 1,
      status: 'Active',
      utilizationRate: 64
    }
  ];
  
  const binContents = [
    {
      binId: 'BIN-A-01-01',
      itemCode: 'RM-102',
      itemName: 'Aluminum Sheet',
      quantity: '250 kg',
      lotNumber: 'LOT-AL-25478',
      expiryDate: 'N/A',
      dateAdded: '2025-03-15',
      status: 'Available'
    },
    {
      binId: 'BIN-A-01-01',
      itemCode: 'RM-156',
      itemName: 'Steel Rods',
      quantity: '400 kg',
      lotNumber: 'LOT-ST-32195',
      expiryDate: 'N/A',
      dateAdded: '2025-03-20',
      status: 'Available'
    },
    {
      binId: 'BIN-A-01-02',
      itemCode: 'CMP-2245',
      itemName: 'Electronic Controller',
      quantity: '20 units',
      lotNumber: 'LOT-EC-98765',
      expiryDate: 'N/A',
      dateAdded: '2025-04-02',
      status: 'Available'
    },
    {
      binId: 'BIN-A-02-01',
      itemCode: 'CMP-1562',
      itemName: 'Fasteners',
      quantity: '1000 units',
      lotNumber: 'LOT-FA-14563',
      expiryDate: 'N/A',
      dateAdded: '2025-03-18',
      status: 'Available'
    },
    {
      binId: 'BIN-B-01-01',
      itemCode: 'RM-235',
      itemName: 'Copper Sheets',
      quantity: '980 kg',
      lotNumber: 'LOT-CU-78945',
      expiryDate: 'N/A',
      dateAdded: '2025-03-25',
      status: 'Reserved'
    },
    {
      binId: 'BIN-C-01-01',
      itemCode: 'RM-378',
      itemName: 'Raw Polymer',
      quantity: '3200 kg',
      lotNumber: 'LOT-PO-45632',
      expiryDate: '2025-12-15',
      dateAdded: '2025-02-10',
      status: 'Available'
    }
  ];
  
  const zones = [
    {
      id: 'ZONE-A',
      warehouse: 'Main Warehouse',
      name: 'Zone A',
      type: 'Manufacturing Components',
      binCount: 15,
      utilizationRate: 68,
      temperature: '20-25°C',
      humidity: '45-55%',
      specialHandling: 'None'
    },
    {
      id: 'ZONE-B',
      warehouse: 'Main Warehouse',
      name: 'Zone B',
      type: 'Raw Materials',
      binCount: 12,
      utilizationRate: 75,
      temperature: '15-20°C',
      humidity: '40-50%',
      specialHandling: 'None'
    },
    {
      id: 'ZONE-C',
      warehouse: 'Storage Facility',
      name: 'Zone C',
      type: 'Bulk Storage',
      binCount: 8,
      utilizationRate: 80,
      temperature: 'Ambient',
      humidity: 'Ambient',
      specialHandling: 'None'
    },
    {
      id: 'ZONE-D',
      warehouse: 'Storage Facility',
      name: 'Zone D',
      type: 'Temperature Controlled',
      binCount: 10,
      utilizationRate: 45,
      temperature: '2-8°C',
      humidity: '30-40%',
      specialHandling: 'Cold Chain'
    },
    {
      id: 'ZONE-E',
      warehouse: 'Distribution Center',
      name: 'Zone E',
      type: 'Finished Goods',
      binCount: 20,
      utilizationRate: 62,
      temperature: 'Ambient',
      humidity: 'Ambient',
      specialHandling: 'None'
    }
  ];
  
  // Render status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
      case 'Available':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Available</Badge>;
      case 'Reserved':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Reserved</Badge>;
      case 'Quarantine':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Quarantine</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Render utilization color class
  const getUtilizationColorClass = (rate) => {
    if (rate >= 90) return 'bg-red-500';
    if (rate >= 75) return 'bg-yellow-500';
    if (rate >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Storage Bin Management</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setAddBinOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Bin
          </Button>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>SAP-level Warehouse Management</AlertTitle>
        <AlertDescription>
          Averox provides advanced storage bin management for optimizing warehouse operations, with
          detailed bin tracking, zone management, and real-time inventory visibility. The system 
          supports complex warehouse structures with multiple zones, aisles, and storage types.
        </AlertDescription>
      </Alert>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bins">Storage Bins</TabsTrigger>
          <TabsTrigger value="contents">Bin Contents</TabsTrigger>
          <TabsTrigger value="zones">Warehouse Zones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bins" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Storage Bins</CardTitle>
                  <CardDescription>Manage warehouse storage locations</CardDescription>
                </div>
                <div className="flex">
                  <div className="relative mr-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search bins..."
                      className="w-[200px] pl-8"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Warehouses</SelectItem>
                      <SelectItem value="main">Main Warehouse</SelectItem>
                      <SelectItem value="storage">Storage Facility</SelectItem>
                      <SelectItem value="distribution">Distribution Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bin ID</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {storageBins.map((bin) => (
                    <TableRow key={bin.id}>
                      <TableCell className="font-medium">{bin.id}</TableCell>
                      <TableCell>{bin.warehouse}</TableCell>
                      <TableCell>{bin.zone}</TableCell>
                      <TableCell>Aisle {bin.aisle}, Shelf {bin.shelf}</TableCell>
                      <TableCell>{bin.type}</TableCell>
                      <TableCell>
                        <div className="w-full max-w-[100px]">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{bin.currentWeight}</span>
                            <span>{bin.maxWeight}</span>
                          </div>
                          <Progress 
                            value={bin.utilizationRate} 
                            className="h-2"
                            indicatorClassName={getUtilizationColorClass(bin.utilizationRate)} 
                          />
                        </div>
                      </TableCell>
                      <TableCell>{bin.currentItems}</TableCell>
                      <TableCell>{getStatusBadge(bin.status)}</TableCell>
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
        
        <TabsContent value="contents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Bin Contents</CardTitle>
                  <CardDescription>View and manage items stored in bins</CardDescription>
                </div>
                <div className="flex">
                  <div className="relative mr-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search items..."
                      className="w-[200px] pl-8"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by bin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Bins</SelectItem>
                      {storageBins.map(bin => (
                        <SelectItem key={bin.id} value={bin.id}>{bin.id}</SelectItem>
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
                    <TableHead>Bin ID</TableHead>
                    <TableHead>Item Code</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Lot Number</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {binContents.map((item, index) => (
                    <TableRow key={`${item.binId}-${item.itemCode}-${index}`}>
                      <TableCell>{item.binId}</TableCell>
                      <TableCell className="font-medium">{item.itemCode}</TableCell>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.lotNumber}</TableCell>
                      <TableCell>{item.expiryDate}</TableCell>
                      <TableCell>{item.dateAdded}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="zones" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Warehouse Zones</CardTitle>
                  <CardDescription>Manage warehouse zone configurations</CardDescription>
                </div>
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Zone
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zone ID</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Bin Count</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Temperature</TableHead>
                    <TableHead>Humidity</TableHead>
                    <TableHead>Special Handling</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zones.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell className="font-medium">{zone.id}</TableCell>
                      <TableCell>{zone.warehouse}</TableCell>
                      <TableCell>{zone.name}</TableCell>
                      <TableCell>{zone.type}</TableCell>
                      <TableCell>{zone.binCount}</TableCell>
                      <TableCell>
                        <div className="w-full max-w-[100px]">
                          <Progress 
                            value={zone.utilizationRate} 
                            className="h-2"
                            indicatorClassName={getUtilizationColorClass(zone.utilizationRate)} 
                          />
                          <div className="text-xs text-right mt-1">
                            {zone.utilizationRate}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{zone.temperature}</TableCell>
                      <TableCell>{zone.humidity}</TableCell>
                      <TableCell>{zone.specialHandling}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add Storage Bin Dialog */}
      <Dialog open={addBinOpen} onOpenChange={setAddBinOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add Storage Bin</DialogTitle>
            <DialogDescription>
              Enter storage bin details to add a new storage location.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bin-id" className="text-right">
                Bin ID
              </Label>
              <Input id="bin-id" className="col-span-3" placeholder="e.g. BIN-A-01-03" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="warehouse" className="text-right">
                Warehouse
              </Label>
              <Select>
                <SelectTrigger id="warehouse" className="col-span-3">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Warehouse</SelectItem>
                  <SelectItem value="storage">Storage Facility</SelectItem>
                  <SelectItem value="distribution">Distribution Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="zone" className="text-right">
                Zone
              </Label>
              <Select>
                <SelectTrigger id="zone" className="col-span-3">
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zone-a">Zone A</SelectItem>
                  <SelectItem value="zone-b">Zone B</SelectItem>
                  <SelectItem value="zone-c">Zone C</SelectItem>
                  <SelectItem value="zone-d">Zone D</SelectItem>
                  <SelectItem value="zone-e">Zone E</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="aisle" className="text-right">
                Aisle
              </Label>
              <Input id="aisle" className="col-span-3" placeholder="e.g. 01" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shelf" className="text-right">
                Shelf
              </Label>
              <Input id="shelf" className="col-span-3" placeholder="e.g. 03" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bin-type" className="text-right">
                Bin Type
              </Label>
              <Select>
                <SelectTrigger id="bin-type" className="col-span-3">
                  <SelectValue placeholder="Select bin type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pallet">Pallet</SelectItem>
                  <SelectItem value="shelf">Shelf Bin</SelectItem>
                  <SelectItem value="bulk">Bulk Storage</SelectItem>
                  <SelectItem value="container">Container</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dimensions" className="text-right">
                Dimensions
              </Label>
              <Input id="dimensions" className="col-span-3" placeholder="e.g. 1.2m x 1.0m x 1.5m" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="max-weight" className="text-right">
                Max Weight
              </Label>
              <Input id="max-weight" className="col-span-3" placeholder="e.g. 1000 kg" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddBinOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setAddBinOpen(false)}>
              <Warehouse className="h-4 w-4 mr-2" />
              Add Bin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}