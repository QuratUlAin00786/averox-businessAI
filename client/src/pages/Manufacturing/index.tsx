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

// Import new SAP-level materials management components
import MRPDashboard from './components/materials-management/MRPDashboard';
import VendorManagement from './components/materials-management/VendorManagement';
import StorageBinManagement from './components/materials-management/StorageBinManagement';
import BatchLotManagement from './components/materials-management/BatchLotManagement';
import MaterialValuationList from './components/materials-management/MaterialValuationList';
import ReturnsManagement from './components/materials-management/ReturnsManagement';
import TradeComplianceList from './components/materials-management/TradeComplianceList';

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
        <TabsList className="bg-background border-b flex flex-wrap rounded-none w-full justify-start overflow-x-auto">
          <TabsTrigger value="dashboard" className="text-sm">Dashboard</TabsTrigger>
          <TabsTrigger value="workcenters" className="text-sm">Work Centers</TabsTrigger>
          <TabsTrigger value="warehouses" className="text-sm">Warehouses</TabsTrigger>
          <TabsTrigger value="bom" className="text-sm">Bill of Materials</TabsTrigger>
          <TabsTrigger value="production" className="text-sm">Production Orders</TabsTrigger>
          <TabsTrigger value="quality" className="text-sm">Quality Control</TabsTrigger>
          <TabsTrigger value="maintenance" className="text-sm">Maintenance</TabsTrigger>
          
          {/* New SAP-level Materials Management Tabs */}
          <TabsTrigger value="mrp" className="text-sm">MRP Planning</TabsTrigger>
          <TabsTrigger value="vendors" className="text-sm">Vendor Management</TabsTrigger>
          <TabsTrigger value="storage-bins" className="text-sm">Storage Bins</TabsTrigger>
          <TabsTrigger value="batch-lots" className="text-sm">Batch/Lot Control</TabsTrigger>
          <TabsTrigger value="valuations" className="text-sm">Material Valuations</TabsTrigger>
          <TabsTrigger value="returns" className="text-sm">Returns Management</TabsTrigger>
          <TabsTrigger value="trade" className="text-sm">Global Trade</TabsTrigger>
        </TabsList>

        {/* Original Tabs Content */}
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
        
        {/* New SAP-level Materials Management Content */}
        <TabsContent value="mrp" className="mt-0">
          <MRPDashboard />
        </TabsContent>
        
        <TabsContent value="vendors" className="mt-0">
          <VendorManagement />
        </TabsContent>
        
        <TabsContent value="storage-bins" className="mt-0">
          <StorageBinManagement />
        </TabsContent>
        
        <TabsContent value="batch-lots" className="mt-0">
          <BatchLotManagement />
        </TabsContent>
        
        <TabsContent value="valuations" className="mt-0">
          <MaterialValuationList />
        </TabsContent>
        
        <TabsContent value="returns" className="mt-0">
          <ReturnsManagement />
        </TabsContent>
        
        <TabsContent value="trade" className="mt-0">
          <TradeComplianceList />
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