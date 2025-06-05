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

  // Only use authentic database data - no fallback data

  // Use only authentic database data
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