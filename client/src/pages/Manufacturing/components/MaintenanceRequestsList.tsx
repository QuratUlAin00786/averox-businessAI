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
  TimerIcon
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function MaintenanceRequestsList() {
  // In a real implementation, this would fetch maintenance requests from the API
  const { data: maintenanceRequests, isLoading, error } = useQuery({
    queryKey: ['/api/manufacturing/maintenance-requests'],
    // This queryFn would be enabled when the API is ready
    queryFn: async () => {
      return []; // Placeholder for actual API call
    },
    enabled: false, // Disable this query until the API is ready
  });

  // Sample data for demonstration
  const sampleMaintenanceRequests = [
    {
      id: 1,
      request_number: 'MR-2025-0001',
      equipment_id: 1,
      equipment_name: 'Conveyor Belt System - Assembly Line A',
      request_date: '2025-04-10T08:30:00Z',
      type: 'Preventive',
      status: 'Completed',
      description: 'Regular 3-month maintenance check for conveyor system',
      requested_by: 5,
      requested_by_name: 'Sarah Johnson',
      assigned_to: 8,
      assigned_to_name: 'Robert Chen',
      scheduled_date: '2025-04-15T09:00:00Z',
      completion_date: '2025-04-15T11:30:00Z',
      notes: 'Replaced worn belt sections and lubricated moving parts. System operating at optimal performance.',
      created_at: '2025-04-10T08:30:00Z',
      priority: 'Medium',
      estimated_hours: 3,
      actual_hours: 2.5,
      parts_used: [
        { id: 1, name: 'Conveyor Belt Section (2m)', quantity: 2 },
        { id: 2, name: 'Lubricant (500ml)', quantity: 1 }
      ]
    },
    {
      id: 2,
      request_number: 'MR-2025-0002',
      equipment_id: 3,
      equipment_name: 'Robotic Arm A2 - Assembly Line A',
      request_date: '2025-04-20T14:15:00Z',
      type: 'Corrective',
      status: 'InProgress',
      description: 'Robotic arm showing reduced range of movement in axis 3',
      requested_by: 5,
      requested_by_name: 'Sarah Johnson',
      assigned_to: 10,
      assigned_to_name: 'Lisa Wong',
      scheduled_date: '2025-04-25T10:00:00Z',
      completion_date: null,
      notes: 'Initial inspection suggests worn servo motor. Replacement part ordered.',
      created_at: '2025-04-20T14:15:00Z',
      priority: 'High',
      estimated_hours: 6,
      actual_hours: 3,
      parts_used: [
        { id: 3, name: 'Servo Motor MX-5000', quantity: 1, status: 'Ordered' }
      ]
    },
    {
      id: 3,
      request_number: 'MR-2025-0003',
      equipment_id: 9,
      equipment_name: 'Paint Booth C1 - Finishing Department',
      request_date: '2025-04-22T09:45:00Z',
      type: 'Condition-Based',
      status: 'Scheduled',
      description: 'Ventilation system showing reduced efficiency based on sensors',
      requested_by: 6,
      requested_by_name: 'Michael Brown',
      assigned_to: 9,
      assigned_to_name: 'David Martinez',
      scheduled_date: '2025-05-05T08:00:00Z',
      completion_date: null,
      notes: 'Scheduled full inspection and filter replacement',
      created_at: '2025-04-22T09:45:00Z',
      priority: 'Medium',
      estimated_hours: 4,
      actual_hours: 0,
      parts_used: [
        { id: 4, name: 'HEPA Filter Set', quantity: 1, status: 'In Stock' },
        { id: 5, name: 'Carbon Filter', quantity: 2, status: 'In Stock' }
      ]
    },
    {
      id: 4,
      request_number: 'MR-2025-0004',
      equipment_id: 5,
      equipment_name: 'CNC Machine B1 - Machining Center',
      request_date: '2025-04-25T11:30:00Z',
      type: 'Predictive',
      status: 'Scheduled',
      description: 'Predictive maintenance based on operation hours (2000 hours)',
      requested_by: 7,
      requested_by_name: 'James Wilson',
      assigned_to: 8,
      assigned_to_name: 'Robert Chen',
      scheduled_date: '2025-05-10T08:00:00Z',
      completion_date: null,
      notes: 'Full system check and calibration scheduled',
      created_at: '2025-04-25T11:30:00Z',
      priority: 'Low',
      estimated_hours: 8,
      actual_hours: 0,
      parts_used: []
    },
    {
      id: 5,
      request_number: 'MR-2025-0005',
      equipment_id: 13,
      equipment_name: 'Packaging Machine D1 - Packaging Line',
      request_date: '2025-04-28T15:00:00Z',
      type: 'Corrective',
      status: 'Completed',
      description: 'Inconsistent sealing on packages',
      requested_by: 6,
      requested_by_name: 'Michael Brown',
      assigned_to: 10,
      assigned_to_name: 'Lisa Wong',
      scheduled_date: '2025-04-29T09:00:00Z',
      completion_date: '2025-04-29T12:30:00Z',
      notes: 'Replaced heating element and recalibrated pressure settings',
      created_at: '2025-04-28T15:00:00Z',
      priority: 'Critical',
      estimated_hours: 4,
      actual_hours: 3.5,
      parts_used: [
        { id: 6, name: 'Heating Element', quantity: 1 },
        { id: 7, name: 'Thermal Sensor', quantity: 1 }
      ]
    },
    {
      id: 6,
      request_number: 'MR-2025-0006',
      equipment_id: 16,
      equipment_name: 'Shrink Wrap Machine - Packaging Line',
      request_date: '2025-05-01T08:45:00Z',
      type: 'Preventive',
      status: 'Deferred',
      description: 'Regular 6-month maintenance check',
      requested_by: 7,
      requested_by_name: 'James Wilson',
      assigned_to: null,
      assigned_to_name: null,
      scheduled_date: '2025-05-15T10:00:00Z',
      completion_date: null,
      notes: 'Deferred due to production priorities. Rescheduled for June',
      created_at: '2025-05-01T08:45:00Z',
      priority: 'Low',
      estimated_hours: 2,
      actual_hours: 0,
      parts_used: []
    }
  ];

  const displayData = maintenanceRequests || sampleMaintenanceRequests;

  const getStatusBadge = (status) => {
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

  const getMaintenanceTypeIcon = (type) => {
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
        return <Tool className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
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
        {displayData.map((request) => {
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
                      {request.parts_used.map((part, index) => (
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