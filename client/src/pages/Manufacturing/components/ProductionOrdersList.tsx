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
import { Loader2, Plus, Factory, Calendar, ClipboardList, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function ProductionOrdersList() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch production orders from the API
  const { data: productionOrders, isLoading, error } = useQuery({
    queryKey: ['/api/manufacturing/production-orders'],
    queryFn: async () => {
      const response = await fetch('/api/manufacturing/production-orders');
      if (!response.ok) {
        throw new Error('Failed to fetch production orders');
      }
      return response.json();
    }
  });

  const handleDetailsClick = (order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  // Keep sample data for now but it will be removed when database is fully populated
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

  // Use real database data with fallback to empty array (not sample data)
  const displayData = productionOrders || [];

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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleDetailsClick(order)}
                >
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

      {/* Production Order Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5" />
              Production Order Details - {selectedOrder?.production_number}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Overview Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">Order Number:</p>
                        <p className="font-semibold">{selectedOrder.production_number}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Status:</p>
                        <Badge className={getStatusColor(selectedOrder.status)}>
                          {selectedOrder.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Priority:</p>
                        <p className={`font-semibold ${getPriorityColor(selectedOrder.priority)}`}>
                          {selectedOrder.priority}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Created:</p>
                        <p>{formatDate(selectedOrder.created_at)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Product Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div>
                        <p className="font-medium text-muted-foreground">Product:</p>
                        <p className="font-semibold">{selectedOrder.product_name}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="font-medium text-muted-foreground">Total Quantity:</p>
                          <p className="font-semibold">{selectedOrder.quantity}</p>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">Completed:</p>
                          <p className="font-semibold">{selectedOrder.completed_quantity}</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Progress:</p>
                        <Progress 
                          value={Math.round((selectedOrder.completed_quantity / selectedOrder.quantity) * 100)} 
                          className="h-3"
                        />
                        <p className="text-xs text-right mt-1">
                          {Math.round((selectedOrder.completed_quantity / selectedOrder.quantity) * 100)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Production Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="font-medium text-muted-foreground">Start Date</p>
                      <p className="text-lg font-semibold">{formatDate(selectedOrder.start_date)}</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="font-medium text-muted-foreground">End Date</p>
                      <p className="text-lg font-semibold">{formatDate(selectedOrder.end_date)}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="font-medium text-muted-foreground">Time Remaining</p>
                      <p className={`text-lg font-semibold ${calculateTimeRemaining(selectedOrder.end_date).className}`}>
                        {calculateTimeRemaining(selectedOrder.end_date).text}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Work Center & BOM Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Work Center</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="font-medium text-muted-foreground">Center:</p>
                        <p className="font-semibold">{selectedOrder.work_center_name}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Center ID:</p>
                        <p>{selectedOrder.work_center_id}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bill of Materials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="font-medium text-muted-foreground">BOM:</p>
                        <p className="font-semibold">{selectedOrder.bom_name}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">BOM ID:</p>
                        <p>{selectedOrder.bom_id}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quality Control Section (if applicable) */}
              {selectedOrder.quality_check_required && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quality Control</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{selectedOrder.quality_checks_passed}</p>
                        <p className="text-sm text-muted-foreground">Passed</p>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{selectedOrder.quality_checks_failed}</p>
                        <p className="text-sm text-muted-foreground">Failed</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedOrder.quality_checks_passed + selectedOrder.quality_checks_failed}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Checks</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes Section */}
              {selectedOrder.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Created By Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Created By</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{selectedOrder.created_by_name}</p>
                      <p className="text-sm text-muted-foreground">User ID: {selectedOrder.created_by}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Created on</p>
                      <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}