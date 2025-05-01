import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Warehouse, TrendingUp, Users, BarChart2, Calculator, PackageOpen, Briefcase } from 'lucide-react';

// Import individual material management components
import MRPDashboard from './components/materials-management/MRPDashboard';
import VendorManagement from './components/materials-management/VendorManagement';
import StorageBinManagement from './components/materials-management/StorageBinManagement';
import BatchLotManagement from './components/materials-management/BatchLotManagement';
import MaterialValuationList from './components/materials-management/MaterialValuationList';
import ReturnsManagement from './components/materials-management/ReturnsManagement';
import TradeComplianceList from './components/materials-management/TradeComplianceList';

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
      description: 'Advanced planning for material requirements and production scheduling',
      icon: <TrendingUp className="h-10 w-10 text-primary" />,
      path: '/manufacturing/materials/mrp'
    },
    {
      id: 'vendors',
      name: 'Vendor Management',
      description: 'Manage suppliers, contracts, and performance metrics',
      icon: <Users className="h-10 w-10 text-primary" />,
      path: '/manufacturing/materials/vendors'
    },
    {
      id: 'storage-bins',
      name: 'Storage Bin Management',
      description: 'Organize warehouse storage locations with precise bin control',
      icon: <Warehouse className="h-10 w-10 text-primary" />,
      path: '/manufacturing/materials/storage-bins'
    },
    {
      id: 'batch-lots',
      name: 'Batch/Lot Control',
      description: 'Track material batches with full traceability and expiration monitoring',
      icon: <BarChart2 className="h-10 w-10 text-primary" />,
      path: '/manufacturing/materials/batch-lots'
    },
    {
      id: 'valuations',
      name: 'Material Valuations',
      description: 'Manage multiple valuation approaches (FIFO, LIFO, Moving Average)',
      icon: <Calculator className="h-10 w-10 text-primary" />,
      path: '/manufacturing/materials/valuations'
    },
    {
      id: 'returns',
      name: 'Returns Management',
      description: 'Process material returns with quality assessment and disposition',
      icon: <PackageOpen className="h-10 w-10 text-primary" />,
      path: '/manufacturing/materials/returns'
    },
    {
      id: 'trade',
      name: 'Global Trade Compliance',
      description: 'Manage import/export regulations, tariffs, and customs documentation',
      icon: <Briefcase className="h-10 w-10 text-primary" />,
      path: '/manufacturing/materials/trade'
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
        Advanced SAP-level materials management capabilities with comprehensive control over inventory, 
        procurement, and logistics processes.
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