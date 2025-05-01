import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ManufacturingDashboard from './components/ManufacturingDashboard';
import WarehousesList from './components/WarehousesList';
import WorkCentersList from './components/WorkCentersList';
import ProductionOrdersList from './components/ProductionOrdersList';
import BillOfMaterialsList from './components/BillOfMaterialsList';
import EquipmentList from './components/EquipmentList';
import MaintenanceRequestsList from './components/MaintenanceRequestsList';
import QualityInspectionsList from './components/QualityInspectionsList';

type ManufacturingProps = {
  subPath?: string;
};

export default function Manufacturing({ subPath }: ManufacturingProps = {}) {
  const [, setLocation] = useLocation();
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Update tab based on subPath
  useEffect(() => {
    // If subPath is provided, set the tab accordingly
    if (subPath) {
      setCurrentTab(subPath);
    }
  }, [subPath]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    // Update URL to reflect the current tab
    if (value === 'dashboard') {
      setLocation('/manufacturing');
    } else {
      setLocation(`/manufacturing/${value}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Manufacturing</h2>
        <p className="text-muted-foreground">
          Manage your manufacturing operations, work centers, equipment, and production orders.
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          <TabsTrigger value="work-centers">Work Centers</TabsTrigger>
          <TabsTrigger value="production-orders">Production Orders</TabsTrigger>
          <TabsTrigger value="bom">Bill of Materials</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
        </TabsList>

        {currentTab === 'dashboard' && <ManufacturingDashboard />}
        {currentTab === 'warehouses' && <WarehousesList />}
        {currentTab === 'work-centers' && <WorkCentersList />}
        {currentTab === 'production-orders' && <ProductionOrdersList />}
        {currentTab === 'bom' && <BillOfMaterialsList />}
        {currentTab === 'equipment' && <EquipmentList />}
        {currentTab === 'maintenance' && <MaintenanceRequestsList />}
        {currentTab === 'quality' && <QualityInspectionsList />}
      </Tabs>
    </div>
  );
}