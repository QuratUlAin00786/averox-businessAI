import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

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
      <h1 className="text-3xl font-bold">Manufacturing Data Test</h1>
      
      {/* BOM Data */}
      <Card>
        <CardHeader>
          <CardTitle>Bills of Materials (Raw Data)</CardTitle>
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
              <p className="text-sm text-muted-foreground mt-2">
                Raw response: {JSON.stringify(boms)}
              </p>
            </div>
          ) : (
            <div className="overflow-auto max-h-96">
              <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(boms, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* MRP Data */}
      <Card>
        <CardHeader>
          <CardTitle>MRP Dashboard Data (Raw Data)</CardTitle>
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
          ) : !mrpData ? (
            <div className="p-4 text-center">
              <p>No MRP data available.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Raw response: {JSON.stringify(mrpData)}
              </p>
            </div>
          ) : (
            <div className="overflow-auto max-h-96">
              <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(mrpData, null, 2)}</pre>
              
              {/* Show specific sections of MRP data if available */}
              {mrpData && typeof mrpData === 'object' && 'lowStockItems' in mrpData && Array.isArray(mrpData.lowStockItems) && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-lg font-medium mb-2">Low Stock Items ({mrpData.lowStockItems.length})</h3>
                  <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(mrpData.lowStockItems, null, 2)}</pre>
                </div>
              )}
              
              {mrpData && typeof mrpData === 'object' && 'forecasts' in mrpData && Array.isArray(mrpData.forecasts) && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-lg font-medium mb-2">Forecasts ({mrpData.forecasts.length})</h3>
                  <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(mrpData.forecasts, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}