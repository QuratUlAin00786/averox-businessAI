import { useState, useEffect } from 'react';
import { useLocation, useRoute, Link, Route, Switch } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';

// Import all manufacturing components
import ManufacturingDashboard from './components/ManufacturingDashboard';
import WorkCentersList from './components/WorkCentersList';
import WarehousesList from './components/WarehousesList';
import BillOfMaterialsList from './components/BillOfMaterialsList';
import ProductionOrdersList from './components/ProductionOrdersList';
import QualityInspectionsList from './components/QualityInspectionsList';
import MaintenanceRequestsList from './components/MaintenanceRequestsList';

export default function Manufacturing() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute('/manufacturing/:subPath');
  const subPath = match ? params.subPath : '';

  // Initialize selected tab based on URL
  const [selectedTab, setSelectedTab] = useState<string>('dashboard');

  // Update selected tab when URL changes
  useEffect(() => {
    if (subPath) {
      setSelectedTab(subPath);
    } else {
      // Default to dashboard if no subPath
      setSelectedTab('dashboard');
    }
  }, [subPath]);

  // Navigate when tab changes
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    setLocation(`/manufacturing/${value}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold">Manufacturing</h2>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-background border-b grid grid-cols-7 rounded-none w-full justify-start">
          <TabsTrigger value="dashboard" className="text-sm">Dashboard</TabsTrigger>
          <TabsTrigger value="workcenters" className="text-sm">Work Centers</TabsTrigger>
          <TabsTrigger value="warehouses" className="text-sm">Warehouses</TabsTrigger>
          <TabsTrigger value="bom" className="text-sm">Bill of Materials</TabsTrigger>
          <TabsTrigger value="production" className="text-sm">Production Orders</TabsTrigger>
          <TabsTrigger value="quality" className="text-sm">Quality Control</TabsTrigger>
          <TabsTrigger value="maintenance" className="text-sm">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0">
          <ManufacturingDashboard />
        </TabsContent>
        
        <TabsContent value="workcenters" className="mt-0">
          <WorkCentersList />
        </TabsContent>
        
        <TabsContent value="warehouses" className="mt-0">
          <WarehousesList />
        </TabsContent>
        
        <TabsContent value="bom" className="mt-0">
          <BillOfMaterialsList />
        </TabsContent>
        
        <TabsContent value="production" className="mt-0">
          <ProductionOrdersList />
        </TabsContent>
        
        <TabsContent value="quality" className="mt-0">
          <QualityInspectionsList />
        </TabsContent>
        
        <TabsContent value="maintenance" className="mt-0">
          <MaintenanceRequestsList />
        </TabsContent>
      </Tabs>

      {/* Alternative routing approach using wouter Switch/Route if needed */}
      {/* 
      <Switch>
        <Route path="/manufacturing" exact>
          <ManufacturingDashboard />
        </Route>
        <Route path="/manufacturing/workcenters">
          <WorkCentersList />
        </Route>
        <Route path="/manufacturing/warehouses">
          <WarehousesList />
        </Route>
        <Route path="/manufacturing/bom">
          <BillOfMaterialsList />
        </Route>
        <Route path="/manufacturing/production">
          <ProductionOrdersList />
        </Route>
        <Route path="/manufacturing/quality">
          <QualityInspectionsList />
        </Route>
        <Route path="/manufacturing/maintenance">
          <MaintenanceRequestsList />
        </Route>
      </Switch>
      */}
    </div>
  );
}