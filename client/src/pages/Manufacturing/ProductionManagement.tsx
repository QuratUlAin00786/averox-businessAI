import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Settings, Truck, FileText, CheckSquare, Workflow, Factory } from 'lucide-react';

// Import production management components 
import WorkCentersList from './components/WorkCentersList';
import ProductionOrdersList from './components/ProductionOrdersList';
import BillOfMaterialsList from './components/BillOfMaterialsList';
import QualityInspectionsList from './components/QualityInspectionsList';

type ProductionFeature = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  path: string;
};

export default function ProductionManagement() {
  const features: ProductionFeature[] = [
    {
      id: 'production-lines',
      name: 'Production Lines',
      description: 'Manage and monitor production lines and work centers',
      icon: <Factory className="h-10 w-10 text-primary" />,
      path: '/manufacturing/production/production-lines'
    },
    {
      id: 'workcenters',
      name: 'Work Centers',
      description: 'Configure work centers with capacity, resources, and schedules',
      icon: <Settings className="h-10 w-10 text-primary" />,
      path: '/manufacturing/production/workcenters'
    },
    {
      id: 'bom',
      name: 'Bill of Materials',
      description: 'Create and manage multi-level product structures',
      icon: <FileText className="h-10 w-10 text-primary" />,
      path: '/manufacturing/production/bom'
    },
    {
      id: 'work-orders',
      name: 'Work Orders',
      description: 'Plan and execute production orders with real-time status tracking',
      icon: <Workflow className="h-10 w-10 text-primary" />,
      path: '/manufacturing/production/work-orders'
    },
    {
      id: 'quality',
      name: 'Quality Control',
      description: 'Manage inspections, sampling plans, and compliance requirements',
      icon: <CheckSquare className="h-10 w-10 text-primary" />,
      path: '/manufacturing/production/quality'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/manufacturing">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold">Production Management</h2>
        </div>
      </div>
      
      <p className="text-muted-foreground">
        End-to-end production management with work centers, bill of materials, quality control, 
        and comprehensive work order processing.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Link key={feature.id} href={feature.path}>
            <Card className="h-full cursor-pointer hover:bg-slate-50 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  {feature.icon}
                </div>
                <CardTitle className="mt-2">{feature.name}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Open {feature.name}
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}