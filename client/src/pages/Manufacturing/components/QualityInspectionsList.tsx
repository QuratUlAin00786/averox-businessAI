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

  // We'll use an empty array if no data is available
  const sampleQualityInspections = [
    {
      id: 1,
      inspection_number: 'QI-2025-0001',
      type: 'ProductionOrder',
      reference_id: 1,
      reference_name: 'PO-2025-0001 - Standard Office Chair',
      inspection_date: '2025-04-20T09:30:00Z',
      inspector_id: 5,
      inspector_name: 'Sarah Johnson',
      result: 'Pass',
      batch_number: 'B2025-0125',
      sample_size: 5,
      pass_count: 5,
      fail_count: 0,
      status: 'Completed',
      notes: 'All samples meet quality standards',
      created_at: '2025-04-20T09:00:00Z',
      criteria: [
        { id: 1, name: 'Assembly Quality', result: 'Pass', notes: 'Properly assembled' },
        { id: 2, name: 'Finish Quality', result: 'Pass', notes: 'No visible defects' },
        { id: 3, name: 'Function Test', result: 'Pass', notes: 'All mechanisms working properly' },
        { id: 4, name: 'Weight Test', result: 'Pass', notes: 'Supports required weight' },
        { id: 5, name: 'Dimension Check', result: 'Pass', notes: 'Meets specifications' }
      ]
    },
    {
      id: 2,
      inspection_number: 'QI-2025-0002',
      type: 'ProductionOrder',
      reference_id: 1,
      reference_name: 'PO-2025-0001 - Standard Office Chair',
      inspection_date: '2025-04-25T10:15:00Z',
      inspector_id: 6,
      inspector_name: 'Michael Brown',
      result: 'Fail',
      batch_number: 'B2025-0126',
      sample_size: 5,
      pass_count: 3,
      fail_count: 2,
      status: 'Completed',
      notes: 'Two samples failed the durability test',
      created_at: '2025-04-25T10:00:00Z',
      criteria: [
        { id: 6, name: 'Assembly Quality', result: 'Pass', notes: 'Properly assembled' },
        { id: 7, name: 'Finish Quality', result: 'Pass', notes: 'Minor scratches on two samples' },
        { id: 8, name: 'Function Test', result: 'Pass', notes: 'All mechanisms working properly' },
        { id: 9, name: 'Durability Test', result: 'Fail', notes: 'Two samples failed after 500 cycles' },
        { id: 10, name: 'Dimension Check', result: 'Pass', notes: 'Meets specifications' }
      ]
    },
    {
      id: 3,
      inspection_number: 'QI-2025-0003',
      type: 'RawMaterial',
      reference_id: 101,
      reference_name: 'Steel Frames - Supplier XYZ',
      inspection_date: '2025-04-15T14:30:00Z',
      inspector_id: 5,
      inspector_name: 'Sarah Johnson',
      result: 'Pass',
      batch_number: 'RM-2025-0056',
      sample_size: 10,
      pass_count: 10,
      fail_count: 0,
      status: 'Completed',
      notes: 'All samples meet specifications',
      created_at: '2025-04-15T14:00:00Z',
      criteria: [
        { id: 11, name: 'Material Composition', result: 'Pass', notes: 'Matches specifications' },
        { id: 12, name: 'Dimensional Accuracy', result: 'Pass', notes: 'Within tolerance' },
        { id: 13, name: 'Surface Finish', result: 'Pass', notes: 'No visible defects' },
        { id: 14, name: 'Weight Check', result: 'Pass', notes: 'Within specification range' }
      ]
    },
    {
      id: 4,
      inspection_number: 'QI-2025-0004',
      type: 'ProductionOrder',
      reference_id: 2,
      reference_name: 'PO-2025-0002 - Executive Office Chair',
      inspection_date: '2025-04-28T11:00:00Z',
      inspector_id: 6,
      inspector_name: 'Michael Brown',
      result: 'PendingReview',
      batch_number: 'B2025-0130',
      sample_size: 3,
      pass_count: 2,
      fail_count: 1,
      status: 'InProgress',
      notes: 'One sample shows inconsistent stitching on leather upholstery',
      created_at: '2025-04-28T10:45:00Z',
      criteria: [
        { id: 15, name: 'Assembly Quality', result: 'Pass', notes: 'Properly assembled' },
        { id: 16, name: 'Upholstery Quality', result: 'Fail', notes: 'Inconsistent stitching on one sample' },
        { id: 17, name: 'Function Test', result: 'Pass', notes: 'All mechanisms working properly' },
        { id: 18, name: 'Finish Quality', result: 'PendingReview', notes: 'Additional inspection needed' },
        { id: 19, name: 'Dimension Check', result: 'Pass', notes: 'Meets specifications' }
      ]
    },
    {
      id: 5,
      inspection_number: 'QI-2025-0005',
      type: 'RawMaterial',
      reference_id: 102,
      reference_name: 'Foam Cushioning - Supplier ABC',
      inspection_date: '2025-05-01T09:00:00Z',
      inspector_id: 5,
      inspector_name: 'Sarah Johnson',
      result: 'Acceptable',
      batch_number: 'RM-2025-0062',
      sample_size: 8,
      pass_count: 6,
      fail_count: 2,
      status: 'Completed',
      notes: 'Two samples slightly below density requirements but within acceptable range',
      created_at: '2025-05-01T08:45:00Z',
      criteria: [
        { id: 20, name: 'Density Test', result: 'Acceptable', notes: '2 samples slightly below requirements' },
        { id: 21, name: 'Fire Resistance', result: 'Pass', notes: 'All samples pass fire resistance test' },
        { id: 22, name: 'Dimensional Accuracy', result: 'Pass', notes: 'Within tolerance' },
        { id: 23, name: 'Compression Test', result: 'Pass', notes: 'All samples recover properly after compression' }
      ]
    },
    {
      id: 6,
      inspection_number: 'QI-2025-0006',
      type: 'ProductionOrder',
      reference_id: 3,
      reference_name: 'PO-2025-0003 - Basic Office Desk',
      inspection_date: null,
      inspector_id: 6,
      inspector_name: 'Michael Brown',
      result: null,
      batch_number: 'B2025-0135',
      sample_size: 4,
      pass_count: 0,
      fail_count: 0,
      status: 'Scheduled',
      notes: 'Scheduled for next week',
      created_at: '2025-05-02T15:30:00Z',
      criteria: []
    }
  ];

  // Use real database data with fallback to empty array
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

  const getStatusColor = (status) => {
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

  const getCriterionResultColor = (result) => {
    switch (result) {
      case 'Pass':
        return 'text-green-600';
      case 'Fail':
        return 'text-red-600';
      case 'PendingReview':
        return 'text-blue-600';
      case 'Acceptable':
        return 'text-amber-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayData.map((inspection) => {
          return (
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
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Result:</span>
                    <span>{getResultBadge(inspection.result)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sample size:</span>
                    <span className="font-medium">{inspection.sample_size}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pass/Fail:</span>
                    <span className="font-medium">
                      <span className="text-green-600">{inspection.pass_count}</span>
                      <span className="mx-1">/</span>
                      <span className="text-red-600">{inspection.fail_count}</span>
                    </span>
                  </div>
                </div>
                
                {inspection.criteria.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Inspection Criteria:</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                      {inspection.criteria.slice(0, 3).map((criterion) => (
                        <div key={criterion.id} className="text-xs flex justify-between items-center py-1 border-b border-gray-100">
                          <span>{criterion.name}</span>
                          <span className={`font-medium ${getCriterionResultColor(criterion.result)}`}>
                            {criterion.result}
                          </span>
                        </div>
                      ))}
                      {inspection.criteria.length > 3 && (
                        <div className="text-xs text-center text-muted-foreground pt-1">
                          + {inspection.criteria.length - 3} more criteria
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {inspection.notes && (
                  <div className="text-sm bg-slate-50 p-2 rounded-md">
                    <p className="text-muted-foreground font-medium mb-1">Notes:</p>
                    <p className="line-clamp-2">{inspection.notes}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2 pt-0">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                {inspection.status === 'InProgress' && (
                  <Button variant="outline" size="sm" className="flex-1">
                    Update Inspection
                  </Button>
                )}
                {inspection.status === 'Scheduled' && (
                  <Button variant="outline" size="sm" className="flex-1">
                    Start Inspection
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}