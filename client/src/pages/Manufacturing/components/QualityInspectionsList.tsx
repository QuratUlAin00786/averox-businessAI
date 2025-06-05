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
import { Loader2, Plus, Search, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function QualityInspectionsList() {
  // Fetch quality inspections from the API
  const { data: qualityInspections, isLoading, error } = useQuery({
    queryKey: ['/api/manufacturing/quality-inspections'],
    queryFn: async () => {
      const response = await fetch('/api/manufacturing/quality-inspections');
      if (!response.ok) {
        throw new Error('Failed to fetch quality inspections');
      }
      return response.json();
    }
  });

  // Use only authentic database data
  const displayData = qualityInspections || [];

  const getResultBadge = (result: string | null) => {
    switch (result) {
      case 'Pass':
        return (
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            <Badge className="bg-green-100 text-green-800">Pass</Badge>
          </div>
        );
      case 'Fail':
        return (
          <div className="flex items-center">
            <XCircle className="h-4 w-4 text-red-500 mr-1" />
            <Badge className="bg-red-100 text-red-800">Fail</Badge>
          </div>
        );
      case 'PendingReview':
        return (
          <div className="flex items-center">
            <Search className="h-4 w-4 text-blue-500 mr-1" />
            <Badge className="bg-blue-100 text-blue-800">Pending Review</Badge>
          </div>
        );
      case 'Acceptable':
        return (
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
            <Badge className="bg-amber-100 text-amber-800">Acceptable</Badge>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <Badge className="bg-gray-100 text-gray-800">Not Inspected</Badge>
          </div>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'InProgress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading quality inspections...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load quality inspection data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Quality Inspections</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Inspection
        </Button>
      </div>

      {displayData.length === 0 ? (
        <Card className="p-8 text-center">
          <CardContent>
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quality Inspections</h3>
            <p className="text-gray-600 mb-4">
              No quality inspections have been created yet. Create your first inspection to get started.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create First Inspection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayData.map((inspection: any) => (
            <Card key={inspection.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{inspection.inspection_number}</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-1">{inspection.reference_name}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(inspection.status)}>
                    {inspection.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Type:</p>
                    <p className="font-medium">{inspection.type}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Batch:</p>
                    <p className="font-medium">{inspection.batch_number}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Inspector:</p>
                    <p className="font-medium">{inspection.inspector_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Date:</p>
                    <p className="font-medium">{formatDate(inspection.inspection_date)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Result:</span>
                    {getResultBadge(inspection.result)}
                  </div>
                  
                  {inspection.sample_size && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Sample Results:</span>
                      <span className="font-medium">
                        {inspection.pass_count || 0} / {inspection.sample_size} passed
                      </span>
                    </div>
                  )}
                </div>

                {inspection.notes && (
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">Notes:</p>
                    <p className="text-gray-700 line-clamp-2">{inspection.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}