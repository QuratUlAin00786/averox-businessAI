import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Plus, Factory, Settings, Users, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function WorkCentersList() {
  // In a real implementation, this would fetch work centers from the API
  const { data: workCenters, isLoading, error } = useQuery({
    queryKey: ['/api/manufacturing/work-centers'],
    // This queryFn would be enabled when the API is ready
    queryFn: async () => {
      return []; // Placeholder for actual API call
    },
    enabled: false, // Disable this query until the API is ready
  });

  // Sample data for demonstration
  const sampleWorkCenters = [
    {
      id: 1,
      name: 'Assembly Line A',
      type: 'Assembly',
      location: 'Building A, Floor 1',
      status: 'Active',
      capacity: 100,
      current_load: 75,
      manager_id: 1,
      manager_name: 'Jane Smith',
      operating_hours: '08:00-20:00',
      workers_assigned: 12,
      equipment_count: 8,
      created_at: '2025-01-05T08:00:00Z',
      equipment: [
        { id: 1, name: 'Conveyor Belt System', status: 'Operational' },
        { id: 2, name: 'Robotic Arm A1', status: 'Operational' },
        { id: 3, name: 'Robotic Arm A2', status: 'Maintenance' },
        { id: 4, name: 'Quality Inspection Scanner', status: 'Operational' }
      ],
      current_jobs: [
        { id: 101, name: 'Office Chair Assembly', completion: 65, due_date: '2025-05-10T16:00:00Z' },
        { id: 102, name: 'Executive Desk Assembly', completion: 30, due_date: '2025-05-15T16:00:00Z' }
      ]
    },
    {
      id: 2,
      name: 'Machining Center B',
      type: 'Machining',
      location: 'Building B, Floor 1',
      status: 'Active',
      capacity: 80,
      current_load: 70,
      manager_id: 2,
      manager_name: 'Michael Johnson',
      operating_hours: '00:00-24:00',
      workers_assigned: 8,
      equipment_count: 12,
      created_at: '2025-01-10T09:30:00Z',
      equipment: [
        { id: 5, name: 'CNC Machine B1', status: 'Operational' },
        { id: 6, name: 'CNC Machine B2', status: 'Operational' },
        { id: 7, name: 'Drilling Station', status: 'Operational' },
        { id: 8, name: 'Cutting Station', status: 'Operational' }
      ],
      current_jobs: [
        { id: 103, name: 'Metal Chair Legs Production', completion: 85, due_date: '2025-05-08T14:00:00Z' },
        { id: 104, name: 'Table Frame Components', completion: 45, due_date: '2025-05-12T14:00:00Z' }
      ]
    },
    {
      id: 3,
      name: 'Finishing Department C',
      type: 'Finishing',
      location: 'Building A, Floor 2',
      status: 'Maintenance',
      capacity: 60,
      current_load: 0,
      manager_id: 3,
      manager_name: 'Sarah Williams',
      operating_hours: '08:00-18:00',
      workers_assigned: 10,
      equipment_count: 6,
      created_at: '2025-01-15T14:15:00Z',
      equipment: [
        { id: 9, name: 'Paint Booth C1', status: 'Maintenance' },
        { id: 10, name: 'Paint Booth C2', status: 'Maintenance' },
        { id: 11, name: 'Drying Oven', status: 'Operational' },
        { id: 12, name: 'Quality Inspection Station', status: 'Operational' }
      ],
      current_jobs: []
    },
    {
      id: 4,
      name: 'Packaging Line D',
      type: 'Packaging',
      location: 'Building C, Floor 1',
      status: 'Active',
      capacity: 120,
      current_load: 90,
      manager_id: 4,
      manager_name: 'Robert Brown',
      operating_hours: '07:00-19:00',
      workers_assigned: 15,
      equipment_count: 10,
      created_at: '2025-02-01T10:00:00Z',
      equipment: [
        { id: 13, name: 'Packaging Machine D1', status: 'Operational' },
        { id: 14, name: 'Packaging Machine D2', status: 'Operational' },
        { id: 15, name: 'Label Printer', status: 'Operational' },
        { id: 16, name: 'Shrink Wrap Machine', status: 'Operational' }
      ],
      current_jobs: [
        { id: 105, name: 'Office Chair Packaging', completion: 70, due_date: '2025-05-09T17:00:00Z' },
        { id: 106, name: 'Desk Packaging', completion: 25, due_date: '2025-05-14T17:00:00Z' },
        { id: 107, name: 'Filing Cabinet Packaging', completion: 10, due_date: '2025-05-20T17:00:00Z' }
      ]
    }
  ];

  const displayData = workCenters || sampleWorkCenters;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      case 'AtCapacity':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Assembly':
        return <Factory className="h-4 w-4 text-blue-500" />;
      case 'Machining':
        return <Settings className="h-4 w-4 text-amber-500" />;
      case 'Finishing':
        return <Settings className="h-4 w-4 text-purple-500" />;
      case 'Packaging':
        return <Factory className="h-4 w-4 text-green-500" />;
      default:
        return <Factory className="h-4 w-4 text-gray-500" />;
    }
  };

  const getUtilizationColor = (percentage) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const calculateDaysRemaining = (dueDateString) => {
    const today = new Date();
    const dueDate = new Date(dueDateString);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading work centers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load work center data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Work Centers</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Work Center
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayData.map((workCenter) => {
          const utilizationPercentage = Math.round((workCenter.current_load / workCenter.capacity) * 100);
          
          return (
            <Card key={workCenter.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(workCenter.type)}
                      <CardTitle>{workCenter.name}</CardTitle>
                    </div>
                    <CardDescription>{workCenter.location}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(workCenter.status)}>
                    {workCenter.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Utilization bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Utilization:</span>
                      <span className="font-medium">{utilizationPercentage}%</span>
                    </div>
                    <Progress 
                      value={utilizationPercentage} 
                      className={`h-2 ${utilizationPercentage >= 80 ? 'bg-red-200' : utilizationPercentage >= 50 ? 'bg-yellow-200' : 'bg-gray-200'}`}
                      indicatorClassName={getUtilizationColor(utilizationPercentage)}
                    />
                  </div>
                  
                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex flex-col items-center p-2 bg-slate-50 rounded-md">
                      <Users className="h-4 w-4 mb-1 text-blue-500" />
                      <span className="font-medium">{workCenter.workers_assigned}</span>
                      <span className="text-xs text-muted-foreground">Workers</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-slate-50 rounded-md">
                      <Settings className="h-4 w-4 mb-1 text-amber-500" />
                      <span className="font-medium">{workCenter.equipment_count}</span>
                      <span className="text-xs text-muted-foreground">Equipment</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-slate-50 rounded-md">
                      <Clock className="h-4 w-4 mb-1 text-green-500" />
                      <span className="font-medium">{workCenter.operating_hours}</span>
                      <span className="text-xs text-muted-foreground">Hours</span>
                    </div>
                  </div>
                  
                  {/* Current jobs */}
                  {workCenter.current_jobs.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold">Current Jobs:</h4>
                      {workCenter.current_jobs.map(job => {
                        const daysRemaining = calculateDaysRemaining(job.due_date);
                        const urgencyColor = daysRemaining <= 2 ? 'text-red-600' : 
                                          daysRemaining <= 5 ? 'text-amber-600' : 'text-green-600';
                        
                        return (
                          <div key={job.id} className="bg-slate-50 p-2 rounded-md">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-sm">{job.name}</span>
                              <span className={`text-xs font-medium ${urgencyColor}`}>
                                {daysRemaining} days left
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full">
                              <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: `${job.completion}%` }}
                              ></div>
                            </div>
                            <div className="text-right text-xs text-muted-foreground mt-1">
                              {job.completion}% complete
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-slate-50 rounded-md text-sm text-muted-foreground">
                      No active jobs
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">View Details</Button>
                    <Button variant="outline" size="sm" className="flex-1">Assign Job</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}