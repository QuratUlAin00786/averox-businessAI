import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function BillOfMaterialsList() {
  // Fetch BOM data from the API
  const { data: bomList, isLoading, error } = useQuery({
    queryKey: ['/api/manufacturing/bom'],
    queryFn: async () => {
      const response = await fetch('/api/manufacturing/bom');
      if (!response.ok) {
        throw new Error('Failed to fetch bill of materials data');
      }
      return response.json();
    }
  });

  // Process the data to correctly format for display
  const processedBomList = bomList?.map(bom => ({
    ...bom,
    // Use the item_count field from the server to show component count
    item_count: parseInt(bom.item_count || '0'),
    // Ensure we have version, description fields for UI compatibility
    version: bom.revision || '1.0',
    description: bom.notes || `Bill of Materials for ${bom.product_name}`,
    // Ensure we have updated_at
    updated_at: bom.updated_at || bom.created_at,
    // Set status with correct formatting
    status: bom.is_active ? 'Active' : 'Inactive'
  })) || [];

  const displayData = processedBomList;

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
                  <span className="font-medium">{bom.item_count || 0}</span>
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