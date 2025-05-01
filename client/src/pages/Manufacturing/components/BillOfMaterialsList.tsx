import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function BillOfMaterialsList() {
  // In a real implementation, this would fetch BoM data from the API
  const { data: bomList, isLoading, error } = useQuery({
    queryKey: ['/api/manufacturing/bom'],
    // This queryFn would be enabled when the API is ready
    queryFn: async () => {
      return []; // Placeholder for actual API call
    },
    enabled: false, // Disable this query until the API is ready
  });

  // Sample data for demonstration
  const sampleBomList = [
    {
      id: 1,
      name: 'Standard Office Chair',
      description: 'Standard office chair with armrests and adjustable height',
      version: '1.2',
      status: 'Active',
      product_id: 101,
      product_name: 'Office Chair - Standard',
      created_at: '2025-01-15T09:30:00Z',
      updated_at: '2025-03-02T14:45:00Z',
      components: [
        { id: 201, name: 'Chair Base', quantity: 1, unit: 'Each', required: true },
        { id: 202, name: 'Chair Wheels', quantity: 5, unit: 'Each', required: true },
        { id: 203, name: 'Chair Seat Cushion', quantity: 1, unit: 'Each', required: true },
        { id: 204, name: 'Chair Back Support', quantity: 1, unit: 'Each', required: true },
        { id: 205, name: 'Arm Rests', quantity: 2, unit: 'Each', required: true },
        { id: 206, name: 'Hydraulic Lift Mechanism', quantity: 1, unit: 'Each', required: true },
        { id: 207, name: 'Screws M5x10', quantity: 12, unit: 'Each', required: true },
        { id: 208, name: 'Assembly Manual', quantity: 1, unit: 'Each', required: false },
      ]
    },
    {
      id: 2,
      name: 'Executive Office Chair',
      description: 'Premium executive office chair with leather upholstery',
      version: '2.0',
      status: 'Active',
      product_id: 102,
      product_name: 'Office Chair - Executive',
      created_at: '2025-01-20T11:15:00Z',
      updated_at: '2025-03-05T16:30:00Z',
      components: [
        { id: 301, name: 'Premium Chair Base', quantity: 1, unit: 'Each', required: true },
        { id: 302, name: 'Premium Chair Wheels', quantity: 5, unit: 'Each', required: true },
        { id: 303, name: 'Leather Seat Cushion', quantity: 1, unit: 'Each', required: true },
        { id: 304, name: 'Leather Back Support', quantity: 1, unit: 'Each', required: true },
        { id: 305, name: 'Premium Arm Rests', quantity: 2, unit: 'Each', required: true },
        { id: 306, name: 'Enhanced Hydraulic Lift', quantity: 1, unit: 'Each', required: true },
        { id: 307, name: 'Screws M5x12', quantity: 16, unit: 'Each', required: true },
        { id: 308, name: 'Assembly Manual', quantity: 1, unit: 'Each', required: false },
        { id: 309, name: 'Warranty Card', quantity: 1, unit: 'Each', required: true },
      ]
    },
    {
      id: 3,
      name: 'Basic Office Desk',
      description: 'Standard office desk with drawer',
      version: '1.0',
      status: 'Active',
      product_id: 103,
      product_name: 'Office Desk - Standard',
      created_at: '2025-02-05T10:00:00Z',
      updated_at: '2025-03-10T09:20:00Z',
      components: [
        { id: 401, name: 'Desk Top Surface', quantity: 1, unit: 'Each', required: true },
        { id: 402, name: 'Desk Legs', quantity: 4, unit: 'Each', required: true },
        { id: 403, name: 'Desk Drawer', quantity: 1, unit: 'Each', required: true },
        { id: 404, name: 'Drawer Handles', quantity: 2, unit: 'Each', required: true },
        { id: 405, name: 'Screws M6x20', quantity: 18, unit: 'Each', required: true },
        { id: 406, name: 'Assembly Manual', quantity: 1, unit: 'Each', required: false },
      ]
    }
  ];

  const displayData = bomList || sampleBomList;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading bill of materials...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load bill of materials data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Bill of Materials</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New BOM
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayData.map((bom) => (
          <Card key={bom.id} className="hover:bg-accent/50 cursor-pointer transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{bom.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {bom.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product:</span>
                  <span className="font-medium">{bom.product_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <span className="font-medium">{bom.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium ${bom.status === 'Active' ? 'text-green-600' : 'text-amber-600'}`}>
                    {bom.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Components:</span>
                  <span className="font-medium">{bom.components.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="font-medium">{new Date(bom.updated_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full">View Details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}