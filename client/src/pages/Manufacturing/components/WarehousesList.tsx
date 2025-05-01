import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Package, Map, Warehouse } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function WarehousesList() {
  // In a real implementation, this would fetch warehouses data from the API
  const { data: warehouses, isLoading, error } = useQuery({
    queryKey: ['/api/manufacturing/warehouses'],
    // This queryFn would be enabled when the API is ready
    queryFn: async () => {
      return []; // Placeholder for actual API call
    },
    enabled: false, // Disable this query until the API is ready
  });

  // Sample data for demonstration
  const sampleWarehouses = [
    {
      id: 1,
      name: 'Main Production Warehouse',
      location: 'Building A, Factory Complex',
      address: '123 Manufacturing Blvd, Industry City, CA 90210',
      type: 'Production',
      status: 'Active',
      capacity: 10000,
      capacity_unit: 'sq.ft',
      current_usage: 6500,
      manager_id: 1,
      manager_name: 'John Doe',
      created_at: '2025-01-10T08:30:00Z',
      sections: [
        { id: 1, name: 'Raw Materials', capacity: 3000, usage: 2200 },
        { id: 2, name: 'Work In Progress', capacity: 4000, usage: 3000 },
        { id: 3, name: 'Finished Goods', capacity: 3000, usage: 1300 }
      ]
    },
    {
      id: 2,
      name: 'Secondary Storage Facility',
      location: 'Building C, Factory Complex',
      address: '125 Manufacturing Blvd, Industry City, CA 90210',
      type: 'Storage',
      status: 'Active',
      capacity: 8000,
      capacity_unit: 'sq.ft',
      current_usage: 2000,
      manager_id: 2,
      manager_name: 'Jane Smith',
      created_at: '2025-02-15T10:45:00Z',
      sections: [
        { id: 4, name: 'Overflow Storage', capacity: 5000, usage: 1200 },
        { id: 5, name: 'Seasonal Inventory', capacity: 3000, usage: 800 }
      ]
    },
    {
      id: 3,
      name: 'Distribution Center',
      location: 'Building D, Factory Complex',
      address: '130 Manufacturing Blvd, Industry City, CA 90210',
      type: 'Distribution',
      status: 'Active',
      capacity: 15000,
      capacity_unit: 'sq.ft',
      current_usage: 12000,
      manager_id: 3,
      manager_name: 'Robert Johnson',
      created_at: '2025-03-01T09:15:00Z',
      sections: [
        { id: 6, name: 'Shipping', capacity: 8000, usage: 7000 },
        { id: 7, name: 'Receiving', capacity: 7000, usage: 5000 }
      ]
    },
    {
      id: 4,
      name: 'Equipment Storage',
      location: 'Building B, Factory Complex',
      address: '124 Manufacturing Blvd, Industry City, CA 90210',
      type: 'Equipment',
      status: 'Maintenance',
      capacity: 5000,
      capacity_unit: 'sq.ft',
      current_usage: 2500,
      manager_id: 4,
      manager_name: 'Sarah Williams',
      created_at: '2025-01-20T11:30:00Z',
      sections: [
        { id: 8, name: 'Machinery Storage', capacity: 3000, usage: 1500 },
        { id: 9, name: 'Tool Storage', capacity: 2000, usage: 1000 }
      ]
    }
  ];

  const displayData = warehouses || sampleWarehouses;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Production':
        return <Warehouse className="h-4 w-4 text-blue-500" />;
      case 'Storage':
        return <Package className="h-4 w-4 text-green-500" />;
      case 'Distribution':
        return <Map className="h-4 w-4 text-purple-500" />;
      case 'Equipment':
        return <Warehouse className="h-4 w-4 text-amber-500" />;
      default:
        return <Warehouse className="h-4 w-4 text-gray-500" />;
    }
  };

  const calculateUsagePercentage = (current, capacity) => {
    return Math.round((current / capacity) * 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading warehouses...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load warehouse data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Warehouses</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Warehouse
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {displayData.map((warehouse) => {
          const usagePercentage = calculateUsagePercentage(warehouse.current_usage, warehouse.capacity);
          
          return (
            <Card key={warehouse.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(warehouse.type)}
                      <CardTitle>{warehouse.name}</CardTitle>
                    </div>
                    <CardDescription>{warehouse.location}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(warehouse.status)}>
                    {warehouse.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Capacity Usage:</span>
                      <span className="font-medium">{warehouse.current_usage} / {warehouse.capacity} {warehouse.capacity_unit}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-full ${getUsageColor(usagePercentage)} rounded-full`} 
                        style={{ width: `${usagePercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Manager:</span>
                      <span className="font-medium">{warehouse.manager_name}</span>
                    </div>
                  </div>
                  
                  <div className="border rounded-md">
                    <Table>
                      <TableCaption>
                        Warehouse Sections
                      </TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Section</TableHead>
                          <TableHead className="text-right">Capacity</TableHead>
                          <TableHead className="text-right">Usage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {warehouse.sections.map((section) => {
                          const sectionUsagePercentage = calculateUsagePercentage(section.usage, section.capacity);
                          
                          return (
                            <TableRow key={section.id}>
                              <TableCell>{section.name}</TableCell>
                              <TableCell className="text-right">{section.capacity}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <span>{section.usage}</span>
                                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                                    <div 
                                      className={`h-full ${getUsageColor(sectionUsagePercentage)} rounded-full`} 
                                      style={{ width: `${sectionUsagePercentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">View Details</Button>
                    <Button variant="outline" className="flex-1">Manage Inventory</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}