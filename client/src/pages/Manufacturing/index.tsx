import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Factory, Boxes, Settings, ChevronRight, TrendingUp, BarChart3, FileSpreadsheet, Layers, FileText } from 'lucide-react';

type ManufacturingModule = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  highlighted?: boolean;
};

export default function ManufacturingIndex() {
  const [, setLocation] = useLocation();
  
  const handleModuleClick = (path: string) => {
    console.log('Manufacturing module clicked:', path);
    try {
      setLocation(path);
      console.log('Navigation successful to:', path);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const modules: ManufacturingModule[] = [
    {
      id: 'materials',
      name: 'Materials Management',
      description: 'Comprehensive inventory, procurement, and logistics control',
      icon: <Boxes className="h-12 w-12 text-primary" />,
      path: '/manufacturing/materials'
    },
    {
      id: 'production',
      name: 'Production Management',
      description: 'Work orders, scheduling, production lines, and quality control',
      icon: <Factory className="h-12 w-12 text-primary" />,
      path: '/manufacturing/production'
    },
    {
      id: 'boms',
      name: 'Bill of Materials',
      description: 'Design and manage product structures, components, and assemblies',
      icon: <Layers className="h-12 w-12 text-primary" />,
      path: '/manufacturing/boms',
      highlighted: true
    },
    {
      id: 'forecasting',
      name: 'Demand Forecasting',
      description: 'Create and manage material forecasts for production planning',
      icon: <TrendingUp className="h-12 w-12 text-primary" />,
      path: '/manufacturing/forecasting',
      highlighted: true
    },
    {
      id: 'planning',
      name: 'Production Planning',
      description: 'Long-term capacity planning and resource allocation',
      icon: <FileSpreadsheet className="h-12 w-12 text-primary" />,
      path: '/manufacturing/planning'
    },
    {
      id: 'analytics',
      name: 'Manufacturing Analytics',
      description: 'Real-time KPIs, efficiency metrics, and trend analysis',
      icon: <BarChart3 className="h-12 w-12 text-primary" />,
      path: '/manufacturing/analytics'
    },
    {
      id: 'compliance',
      name: 'Compliance & Documentation',
      description: 'Industry-specific compliance and documentation management',
      icon: <FileSpreadsheet className="h-12 w-12 text-primary" />,
      path: '/manufacturing/compliance'
    },
    {
      id: 'configuration',
      name: 'System Configuration',
      description: 'Configure manufacturing settings, templates, and defaults',
      icon: <Settings className="h-12 w-12 text-primary" />,
      path: '/manufacturing/configuration'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Manufacturing Management</h1>
        <p className="text-muted-foreground mt-2">
          Enterprise-grade manufacturing management with advanced MRP, production control, 
          and industry-specific workflows
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card 
            key={module.id}
            className={`h-full cursor-pointer transition-colors ${
              module.highlighted 
                ? "border-primary border-2 shadow-md" 
                : "hover:bg-slate-50"
            }`}
            onClick={() => handleModuleClick(module.path)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                {module.icon}
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardTitle className="mt-4">{module.name}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant={module.highlighted ? "default" : "outline"} 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleModuleClick(module.path);
                }}
              >
                Manage {module.name}
              </Button>
            </CardContent>
          </Card>
        ))}
        
        {/* Debug card for viewing raw data */}
        <Link href="/manufacturing/test-data">
          <Card className="h-full cursor-pointer transition-colors border-red-300 border-2 hover:bg-slate-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <FileText className="h-12 w-12 text-red-500" />
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardTitle className="mt-4">Data Viewer</CardTitle>
              <CardDescription>View raw manufacturing data from API (debugging tool)</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-red-300">
                View Raw Data
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}