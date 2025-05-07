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
  Clock, 
  Wrench, 
  User, 
  Calendar, 
  AlertTriangle, 
  WrenchIcon,
  CheckCircle,
  TimerIcon,
  Settings
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function MaintenanceRequestsList() {
  // Fetch maintenance requests from the API
  const { data: maintenanceRequests, isLoading, error } = useQuery({
    queryKey: ['/api/manufacturing/maintenance-requests'],
    queryFn: async () => {
      const response = await fetch('/api/manufacturing/maintenance-requests');
      if (!response.ok) {
        throw new Error('Failed to fetch maintenance requests');
      }
      return response.json();
    }
  });

  // Use real database data with fallback to empty array
  const displayData = maintenanceRequests || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            <Badge className="bg-green-100 text-green-800">Completed</Badge>
          </div>
        );
      case 'InProgress':
        return (
          <div className="flex items-center">
            <WrenchIcon className="h-4 w-4 text-yellow-500 mr-1" />
            <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
          </div>
        );
      case 'Scheduled':
        return (
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-blue-500 mr-1" />
            <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
          </div>
        );
      case 'Deferred':
        return (
          <div className="flex items-center">
            <TimerIcon className="h-4 w-4 text-orange-500 mr-1" />
            <Badge className="bg-orange-100 text-orange-800">Deferred</Badge>
          </div>
        );
      case 'Cancelled':
        return (
          <div className="flex items-center">
            <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
          </div>
        );
    }
  };

  const getMaintenanceTypeIcon = (type: string) => {
    switch (type) {
      case 'Preventive':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'Corrective':
        return <WrenchIcon className="h-4 w-4 text-red-500" />;
      case 'Predictive':
        return <Clock className="h-4 w-4 text-green-500" />;
      case 'Condition-Based':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'text-red-600 font-medium';
      case 'High':
        return 'text-orange-600 font-medium';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
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
        <span className="ml-2">Loading maintenance requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load maintenance request data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Maintenance Requests</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Maintenance Request
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayData.map((request: any) => {
          return (
            <Card key={request.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{request.request_number}</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-1">{request.equipment_name}</CardDescription>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      {getMaintenanceTypeIcon(request.type)}
                      <p className="ml-1 text-muted-foreground">Type:</p>
                    </div>
                    <p className="font-medium">{request.type}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Priority:</p>
                    <p className={getPriorityColor(request.priority)}>{request.priority}</p>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Description:</p>
                  <p className="line-clamp-2">{request.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-blue-500 mr-1" />
                      <p className="text-muted-foreground">Requested by:</p>
                    </div>
                    <p className="font-medium">{request.requested_by_name}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-green-500 mr-1" />
                      <p className="text-muted-foreground">Assigned to:</p>
                    </div>
                    <p className="font-medium">{request.assigned_to_name || 'Not assigned'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-blue-500 mr-1" />
                      <p className="text-muted-foreground">Scheduled:</p>
                    </div>
                    <p className="font-medium">{formatDate(request.scheduled_date)}</p>
                  </div>
                  {request.completion_date && (
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        <p className="text-muted-foreground">Completed:</p>
                      </div>
                      <p className="font-medium">{formatDate(request.completion_date)}</p>
                    </div>
                  )}
                </div>
                
                {request.parts_used.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm font-medium">Parts used:</p>
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1 bg-slate-50 p-2 rounded-md">
                      {request.parts_used.map((part: any, index: number) => (
                        <div key={part.id} className="text-xs flex justify-between items-center">
                          <span>{part.name}</span>
                          <div className="flex items-center">
                            <span className="font-medium">x{part.quantity}</span>
                            {part.status && (
                              <Badge className="ml-1 text-[10px] py-0 h-5" variant="outline">
                                {part.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {request.notes && (
                  <div className="text-sm bg-slate-50 p-2 rounded-md">
                    <p className="text-muted-foreground font-medium mb-1">Notes:</p>
                    <p className="line-clamp-2">{request.notes}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2 pt-0">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                {request.status === 'InProgress' && (
                  <Button variant="outline" size="sm" className="flex-1">
                    Update Status
                  </Button>
                )}
                {request.status === 'Scheduled' && (
                  <Button variant="outline" size="sm" className="flex-1">
                    Start Work
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