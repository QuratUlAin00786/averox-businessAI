import { useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function TestDataView() {
  const { user, isLoading: authLoading } = useAuth();
  
  // Debug user authentication state
  useEffect(() => {
    console.log("Authentication State:", { user, authLoading });
  }, [user, authLoading]);

  // Simplest possible BOM data fetch
  const { data: boms, isLoading: bomsLoading, error: bomsError } = useQuery({
    queryKey: ['/api/manufacturing/boms'],
  });

  // Simplest possible MRP dashboard data fetch
  const { data: mrpData, isLoading: mrpLoading, error: mrpError } = useQuery({
    queryKey: ['/api/manufacturing/mrp/dashboard'],
  });

  // Handle authentication loading state
  if (authLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Checking authentication...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle not authenticated state
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <p>You must be logged in to view manufacturing data.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Current auth state: {JSON.stringify({ user, authLoading })}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/manufacturing">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Manufacturing Data Overview</h1>
        </div>
      </div>
      
      {/* BOM Data */}
      <Card>
        <CardHeader>
          <CardTitle>Bills of Materials</CardTitle>
        </CardHeader>
        <CardContent>
          {bomsLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading BOM data...</span>
            </div>
          ) : bomsError ? (
            <div className="p-4 border border-red-200 bg-red-50 rounded">
              <p className="text-red-600">Error loading BOM data:</p>
              <pre className="text-sm mt-2 whitespace-pre-wrap">
                {bomsError instanceof Error ? bomsError.message : 'Unknown error'}
              </pre>
            </div>
          ) : !boms || (Array.isArray(boms) && boms.length === 0) ? (
            <div className="p-4 text-center">
              <p>No BOM data available.</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Components</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(boms) && boms.map((bom: any) => (
                    <TableRow key={bom.id}>
                      <TableCell className="font-medium">{bom.id}</TableCell>
                      <TableCell>{bom.product_name}</TableCell>
                      <TableCell>{bom.product_sku}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{bom.version}</Badge>
                      </TableCell>
                      <TableCell>{bom.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{bom.description}</TableCell>
                      <TableCell>
                        <Badge variant={bom.is_active ? "default" : "secondary"}>
                          {bom.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{bom.industry_type}</TableCell>
                      <TableCell>{new Date(bom.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{bom.component_count || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Low Stock Items */}
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Items</CardTitle>
        </CardHeader>
        <CardContent>
          {mrpLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading MRP data...</span>
            </div>
          ) : mrpError ? (
            <div className="p-4 border border-red-200 bg-red-50 rounded">
              <p className="text-red-600">Error loading MRP data:</p>
              <pre className="text-sm mt-2 whitespace-pre-wrap">
                {mrpError instanceof Error ? mrpError.message : 'Unknown error'}
              </pre>
            </div>
          ) : !mrpData || !(mrpData as any).lowStockItems || (mrpData as any).lowStockItems.length === 0 ? (
            <div className="p-4 text-center">
              <p>No low stock items found.</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material ID</TableHead>
                    <TableHead>Material Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Minimum Stock</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Supplier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(mrpData as any).lowStockItems.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.material_id}</TableCell>
                      <TableCell>{item.material_name}</TableCell>
                      <TableCell>{item.material_code}</TableCell>
                      <TableCell>
                        <Badge variant={item.current_stock <= item.reorder_level ? "destructive" : "default"}>
                          {item.current_stock}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.minimum_stock}</TableCell>
                      <TableCell>{item.reorder_level}</TableCell>
                      <TableCell>{item.unit_of_measure}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.supplier_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forecasts */}
      <Card>
        <CardHeader>
          <CardTitle>Material Forecasts</CardTitle>
        </CardHeader>
        <CardContent>
          {mrpLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading forecast data...</span>
            </div>
          ) : !mrpData || !(mrpData as any).forecasts || (mrpData as any).forecasts.length === 0 ? (
            <div className="p-4 text-center">
              <p>No forecasts available.</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Created By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(mrpData as any).forecasts.map((forecast: any) => (
                    <TableRow key={forecast.id}>
                      <TableCell className="font-medium">{forecast.id}</TableCell>
                      <TableCell>{forecast.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{forecast.period}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={forecast.confidence >= 0.8 ? "default" : "secondary"}>
                          {Math.round(forecast.confidence * 100)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={forecast.status === "Active" ? "default" : "secondary"}>
                          {forecast.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(forecast.created_date).toLocaleDateString()}</TableCell>
                      <TableCell>{forecast.createdBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}