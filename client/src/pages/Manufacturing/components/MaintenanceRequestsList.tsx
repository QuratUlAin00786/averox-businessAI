import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Wrench, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function MaintenanceRequestsList() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Maintenance Requests</h2>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Maintenance Request
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Management</CardTitle>
          <CardDescription>
            Track equipment maintenance requests and schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">This feature is coming soon</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              The Maintenance Management module will allow you to schedule preventive maintenance,
              process maintenance requests, and track repair histories for all equipment.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Module under development</AlertTitle>
            <AlertDescription>
              This module is currently being developed and will be available in a future update.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>
    </div>
  );
}