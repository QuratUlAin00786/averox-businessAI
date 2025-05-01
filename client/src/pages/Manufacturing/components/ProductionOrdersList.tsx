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
import { Progress } from '@/components/ui/progress';
import { Loader2, Plus, Factory, Calendar, ClipboardList } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ProductionOrdersList() {
  // In a real implementation, this would fetch production orders from the API
  const { data: productionOrders, isLoading, error } = useQuery({
    queryKey: ['/api/manufacturing/production-orders'],
    // This queryFn would be enabled when the API is ready
    queryFn: async () => {
      return []; // Placeholder for actual API call
    },
    enabled: false, // Disable this query until the API is ready
  });

  // Sample data for demonstration
  const sampleProductionOrders = [
    {
      id: 1,
      production_number: 'PO-2025-0001',
      product_id: 1,
      product_name: 'Standard Office Chair',
      quantity: 50,
      completed_quantity: 35,
      start_date: '2025-04-15T08:00:00Z',
      end_date: '2025-05-20T17:00:00Z',
      status: 'InProgress',
      priority: 'Medium',
      work_center_id: 1,
      work_center_name: 'Assembly Line A',
      bom_id: 1,
      bom_name: 'Standard Office Chair BOM v1.2',
      created_by: 1,
      created_by_name: 'Admin User',
      created_at: '2025-04-10T10:30:00Z',
      notes: 'Regular production batch for Q2',
      quality_check_required: true,
      quality_checks_passed: 30,
      quality_checks_failed: 2
    },
    {
      id: 2,
      production_number: 'PO-2025-0002',
      product_id: 2,
      product_name: 'Executive Office Chair',
      quantity: 25,
      completed_quantity: 10,
      start_date: '2025-04-20T08:00:00Z',
      end_date: '2025-05-25T17:00:00Z',
      status: 'InProgress',
      priority: 'High',
      work_center_id: 1,
      work_center_name: 'Assembly Line A',
      bom_id: 2,
      bom_name: 'Executive Office Chair BOM v2.0',
      created_by: 1,
      created_by_name: 'Admin User',
      created_at: '2025-04-12T14:15:00Z',
      notes: 'Priority order for corporate client',
      quality_check_required: true,
      quality_checks_passed: 8,
      quality_checks_failed: 0
    },
    {
      id: 3,
      production_number: 'PO-2025-0003',
      product_id: 3,
      product_name: 'Basic Office Desk',
      quantity: 30,
      completed_quantity: 0,
      start_date: '2025-05-05T08:00:00Z',
      end_date: '2025-06-10T17:00:00Z',
      status: 'Scheduled',
      priority: 'Medium',
      work_center_id: 2,
      work_center_name: 'Assembly Line B',
      bom_id: 3,
      bom_name: 'Basic Office Desk BOM v1.0',
      created_by: 1,
      created_by_name: 'Admin User',
      created_at: '2025-04-18T09:45:00Z',
      notes: 'Standard production batch',
      quality_check_required: true,
      quality_checks_passed: 0,
      quality_checks_failed: 0
    },
    {
      id: 4,
      production_number: 'PO-2025-0004',
      product_id: 4,
      product_name: 'Conference Table',
      quantity: 15,
      completed_quantity: 15,
      start_date: '2025-03-10T08:00:00Z',
      end_date: '2025-04-05T17:00:00Z',
      status: 'Completed',
      priority: 'High',
      work_center_id: 2,
      work_center_name: 'Assembly Line B',
      bom_id: 4,
      bom_name: 'Conference Table BOM v1.1',
      created_by: 1,
      created_by_name: 'Admin User',
      created_at: '2025-03-05T11:30:00Z',
      notes: 'Corporate order for TechCorp HQ',
      quality_check_required: true,
      quality_checks_passed: 15,
      quality_checks_failed: 1
    },
    {
      id: 5,
      production_number: 'PO-2025-0005',
      product_id: 5,
      product_name: 'Filing Cabinet',
      quantity: 40,
      completed_quantity: 0,
      start_date: '2025-05-25T08:00:00Z',
      end_date: '2025-06-20T17:00:00Z',
      status: 'Scheduled',
      priority: 'Low',
      work_center_id: 1,
      work_center_name: 'Assembly Line A',
      bom_id: 5,
      bom_name: 'Filing Cabinet BOM v1.0',
      created_by: 1,
      created_by_name: 'Admin User',
      created_at: '2025-04-25T15:20:00Z',
      notes: 'Standard production batch for Q3',
      quality_check_required: true,
      quality_checks_passed: 0,
      quality_checks_failed: 0
    },
    {
      id: 6,
      production_number: 'PO-2025-0006',
      product_id: 3,
      product_name: 'Basic Office Desk',
      quantity: 20,
      completed_quantity: 0,
      start_date: '2025-05-15T08:00:00Z',
      end_date: '2025-06-05T17:00:00Z',
      status: 'OnHold',
      priority: 'Medium',
      work_center_id: 2,
      work_center_name: 'Assembly Line B',
      bom_id: 3,
      bom_name: 'Basic Office Desk BOM v1.0',
      created_by: 1,
      created_by_name: 'Admin User',
      created_at: '2025-04-28T13:10:00Z',
      notes: 'On hold pending material availability',
      quality_check_required: true,
      quality_checks_passed: 0,
      quality_checks_failed: 0
    }
  ];

  const displayData = productionOrders || sampleProductionOrders;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'InProgress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'OnHold':
        return 'bg-orange-100 text-orange-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'text-red-600';
      case 'High':
        return 'text-orange-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateTimeRemaining = (endDateString) => {
    const today = new Date();
    const endDate = new Date(endDateString);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Overdue', className: 'text-red-600 font-medium' };
    } else if (diffDays === 0) {
      return { text: 'Due today', className: 'text-orange-600 font-medium' };
    } else if (diffDays === 1) {
      return { text: '1 day remaining', className: 'text-orange-600' };
    } else if (diffDays <= 5) {
      return { text: `${diffDays} days remaining`, className: 'text-yellow-600' };
    } else {
      return { text: `${diffDays} days remaining`, className: 'text-green-600' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading production orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load production order data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Production Orders</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Production Order
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayData.map((order) => {
          const completionPercentage = Math.round((order.completed_quantity / order.quantity) * 100);
          const timeRemaining = calculateTimeRemaining(order.end_date);
          
          return (
            <Card key={order.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{order.production_number}</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-1">{order.product_name}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Quantity:</p>
                    <p className="font-medium">{order.completed_quantity} of {order.quantity}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Priority:</p>
                    <p className={`font-medium ${getPriorityColor(order.priority)}`}>{order.priority}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Start Date:</p>
                    <p className="font-medium">{formatDate(order.start_date)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">End Date:</p>
                    <p className="font-medium">{formatDate(order.end_date)}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress:</span>
                    <span className="font-medium">{completionPercentage}%</span>
                  </div>
                  <Progress 
                    value={completionPercentage} 
                    className="h-2"
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Work Center:</span>
                    <span className="font-medium">{order.work_center_name}</span>
                  </div>
                </div>
                
                {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                  <div className="text-sm text-right">
                    <span className={timeRemaining.className}>{timeRemaining.text}</span>
                  </div>
                )}
                
                {order.notes && (
                  <div className="text-sm bg-slate-50 p-2 rounded-md">
                    <p className="text-muted-foreground font-medium mb-1">Notes:</p>
                    <p className="line-clamp-2">{order.notes}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2 pt-0">
                <Button variant="outline" size="sm" className="flex-1">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Details
                </Button>
                {order.status === 'InProgress' && (
                  <Button variant="outline" size="sm" className="flex-1">
                    Update Progress
                  </Button>
                )}
                {order.status === 'Draft' && (
                  <Button variant="outline" size="sm" className="flex-1">
                    Start Production
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