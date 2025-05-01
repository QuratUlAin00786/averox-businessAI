import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3, Package, Users, Boxes, ClipboardList, Truck, FileText, Calculator, Undo } from 'lucide-react';

type MaterialsFeature = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  path: string;
};

export default function MaterialsManagement() {
  const features: MaterialsFeature[] = [
    {
      id: 'mrp',
      name: 'MRP Planning',
      description: 'Materials Requirements Planning with advanced forecasting',
      icon: <BarChart3 className="h-10 w-10 text-primary" />,
      path: '/manufacturing/materials/mrp'
    },
    {
      id: 'warehouse',
      name: 'Warehouse Management',
      description: 'Manage storage locations, zones, and bins',
      icon: <Boxes className="h-10 w-10 text-primary" />,
      path: '/manufacturing/materials/storage-bins'
    },
    {
      id: 'vendors',
      name: 'Vendor Management',
      description: 'Supplier management with contracts and performance tracking',
      icon: <Users className="h-10 w-10 text-primary" />,
      path: '/manufacturing/materials/vendors'
    },
    {
      id: 'batch-lot',
      name: 'Batch/Lot Control',
      description: 'Advanced lot tracking and expiration management',
      icon: <ClipboardList className="h-10 w-10 text-primary" />,
      path: '/manufacturing/materials/batch-lot'
    },
    {
      id: 'valuations',
      name: 'Material Valuation',
      description: 'Multiple valuation methods (FIFO, LIFO, moving average)',
      icon: <Calculator className="h-10 w-10 text-primary" />,
      path: '/manufacturing/materials/valuations'
    },
    {
      id: 'returns',
      name: 'Returns Management',
      description: 'Process returns and manage return merchandise authorizations',
      icon: <Undo className="h-10 w-10 text-primary" />,
      path: '/manufacturing/materials/returns'
    },
    {
      id: 'compliance',
      name: 'Global Trade Compliance',
      description: 'International trade compliance and documentation',
      icon: <FileText className="h-10 w-10 text-primary" />,
      path: '/manufacturing/materials/compliance'
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
          <h2 className="text-2xl font-bold">Materials Management</h2>
        </div>
      </div>
      
      <p className="text-muted-foreground">
        Comprehensive materials management with advanced MRP, warehouse management, vendor tracking, 
        and global trade compliance capabilities.
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