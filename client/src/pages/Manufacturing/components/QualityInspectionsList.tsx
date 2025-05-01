import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Clipboard, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function QualityInspectionsList() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Quality Inspections</h2>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Inspection
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Quality Inspections Module</CardTitle>
          <CardDescription>
            Track and manage quality control processes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Clipboard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">This feature is coming soon</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              The Quality Inspections module will allow you to create inspection checklists,
              record quality results, and track defects for continuous improvement.
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