import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Plus, 
  Package2, 
  Home, 
  MapPin, 
  Phone, 
  Mail,
  Users,
  BarChart3,
  ArrowUpDown,
  Pencil,
  Trash2
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import WarehouseForm from './WarehouseForm';

export default function WarehousesList() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const { toast } = useToast();
  
  // Fetch warehouses from the API
  const { data: warehouses, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/manufacturing/warehouses'],
    queryFn: async () => {
      const response = await fetch('/api/manufacturing/warehouses');
      if (!response.ok) {
        throw new Error('Failed to fetch warehouses');
      }
      return response.json();
    }
  });

  // Sample data for demonstration (will be replaced by actual API data when available)
  const sampleWarehouses = [
    {
      id: 1,
      name: 'Main Production Warehouse',
      code: 'MPW-001',
      description: 'Primary warehouse for finished goods and raw materials',
      address: '1234 Manufacturing Blvd',
      city: 'Industrial City',
      state: 'TX',
      zip: '75001',
      country: 'USA',
      contactPerson: 'John Smith',
      contactPhone: '(555) 123-4567',
      contactEmail: 'jsmith@averox.com',
      isActive: true,
      capacity: 10000,
      utilizationRate: 65,
      isManufacturing: true,
      zoneCount: 5,
      itemCount: 1245,
      valueTotal: '$1,245,000'
    },
    {
      id: 2,
      name: 'Secondary Storage',
      code: 'SS-002',
      description: 'Overflow warehouse for seasonal inventory',
      address: '5678 Storage Dr',
      city: 'Industrial City',
      state: 'TX',
      zip: '75001',
      country: 'USA',
      contactPerson: 'Jane Doe',
      contactPhone: '(555) 987-6543',
      contactEmail: 'jdoe@averox.com',
      isActive: true,
      capacity: 8000,
      utilizationRate: 25,
      isManufacturing: false,
      zoneCount: 3,
      itemCount: 578,
      valueTotal: '$450,000'
    },
    {
      id: 3,
      name: 'Distribution Center',
      code: 'DC-003',
      description: 'Primary shipping and distribution center',
      address: '9101 Logistics Way',
      city: 'Commerce',
      state: 'CA',
      zip: '90023',
      country: 'USA',
      contactPerson: 'Robert Johnson',
      contactPhone: '(555) 456-7890',
      contactEmail: 'rjohnson@averox.com',
      isActive: true,
      capacity: 15000,
      utilizationRate: 80,
      isManufacturing: false,
      zoneCount: 8,
      itemCount: 3400,
      valueTotal: '$2,800,000'
    },
    {
      id: 4,
      name: 'Equipment Storage',
      code: 'EQ-004',
      description: 'Warehouse for equipment and spare parts',
      address: '1122 Maintenance Rd',
      city: 'Industrial City',
      state: 'TX',
      zip: '75001',
      country: 'USA',
      contactPerson: 'Sarah Williams',
      contactPhone: '(555) 234-5678',
      contactEmail: 'swilliams@averox.com',
      isActive: true,
      capacity: 5000,
      utilizationRate: 50,
      isManufacturing: false,
      zoneCount: 4,
      itemCount: 820,
      valueTotal: '$1,200,000'
    },
    {
      id: 5,
      name: 'International Hub',
      code: 'IH-005',
      description: 'International shipping and receiving warehouse',
      address: '3344 Global Lane',
      city: 'Miami',
      state: 'FL',
      zip: '33101',
      country: 'USA',
      contactPerson: 'Michael Chen',
      contactPhone: '(555) 876-5432',
      contactEmail: 'mchen@averox.com',
      isActive: true,
      capacity: 12000,
      utilizationRate: 70,
      isManufacturing: false,
      zoneCount: 6,
      itemCount: 2100,
      valueTotal: '$1,950,000'
    },
    {
      id: 6,
      name: 'Raw Materials Depot',
      code: 'RM-006',
      description: 'Storage for raw materials and components',
      address: '5566 Resource Pkwy',
      city: 'Industrial City',
      state: 'TX',
      zip: '75001',
      country: 'USA',
      contactPerson: 'Emily Rodriguez',
      contactPhone: '(555) 345-6789',
      contactEmail: 'erodriguez@averox.com',
      isActive: false,
      capacity: 7500,
      utilizationRate: 0,
      isManufacturing: false,
      zoneCount: 3,
      itemCount: 0,
      valueTotal: '$0'
    }
  ];

  const displayData = warehouses || sampleWarehouses;

  const getUtilizationColorClass = (rate) => {
    if (rate >= 90) return 'bg-red-500';
    if (rate >= 75) return 'bg-yellow-500';
    if (rate >= 50) return 'bg-blue-500';
    return 'bg-green-500';
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

  // Function to handle delete warehouse
  const handleDeleteWarehouse = async (warehouseId: number) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      try {
        const response = await fetch(`/api/manufacturing/warehouses/${warehouseId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete warehouse');
        }
        
        // Refetch the warehouses after deletion
        refetch();
        
        toast({
          title: "Warehouse deleted",
          description: "The warehouse has been successfully deleted.",
        });
      } catch (error) {
        console.error('Error deleting warehouse:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete warehouse. Please try again.",
        });
      }
    }
  };

  // Function to handle edit warehouse
  const handleEditWarehouse = (warehouse: any) => {
    setSelectedWarehouse(warehouse);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Warehouses</h3>
        <Button onClick={() => {
          setSelectedWarehouse(null);
          setFormOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Warehouse
        </Button>
      </div>

      {/* Warehouse Form Dialog */}
      <WarehouseForm 
        open={formOpen} 
        onOpenChange={setFormOpen} 
        initialData={selectedWarehouse} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayData.map((warehouse) => (
          <Card key={warehouse.id} className={`shadow-sm hover:shadow-md transition-shadow duration-200 ${!warehouse.isActive ? 'opacity-70' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Package2 className="h-5 w-5 mr-2 text-primary" />
                    {warehouse.name}
                  </CardTitle>
                  <CardDescription>{warehouse.code}</CardDescription>
                </div>
                <div className="flex gap-1 items-start">
                  {warehouse.isManufacturing && (
                    <Badge className="bg-purple-100 text-purple-800">
                      Manufacturing
                    </Badge>
                  )}
                  {!warehouse.isActive && (
                    <Badge variant="outline" className="border-red-200 text-red-800">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {warehouse.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-start text-sm">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                  <div>
                    <p className="line-clamp-1">{warehouse.address}</p>
                    <p className="line-clamp-1">{warehouse.city}, {warehouse.state} {warehouse.zip}</p>
                    <p className="line-clamp-1">{warehouse.country}</p>
                  </div>
                </div>
                
                {warehouse.contactPerson && (
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="line-clamp-1">{warehouse.contactPerson}</span>
                  </div>
                )}
                
                {warehouse.contactPhone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{warehouse.contactPhone}</span>
                  </div>
                )}
                
                {warehouse.contactEmail && (
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="line-clamp-1">{warehouse.contactEmail}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Utilization:</span>
                  <span className="font-medium">{warehouse.utilizationRate}%</span>
                </div>
                <Progress 
                  value={warehouse.utilizationRate} 
                  className="h-2"
                  indicatorClassName={getUtilizationColorClass(warehouse.utilizationRate)} 
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{Math.round(warehouse.capacity * warehouse.utilizationRate / 100)} m³ used</span>
                  <span>{warehouse.capacity} m³ total</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="bg-slate-50 p-2 rounded-md text-center">
                  <p className="text-xs text-muted-foreground">Zones</p>
                  <p className="font-semibold">{warehouse.zoneCount}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-md text-center">
                  <p className="text-xs text-muted-foreground">Items</p>
                  <p className="font-semibold">{warehouse.itemCount}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-md text-center">
                  <p className="text-xs text-muted-foreground">Value</p>
                  <p className="font-semibold">{warehouse.valueTotal}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => handleEditWarehouse(warehouse)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => handleDeleteWarehouse(warehouse.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}