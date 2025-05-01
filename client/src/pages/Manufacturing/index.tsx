import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import DashboardLayout from '@/layouts/DashboardLayout';
import WarehousesList from './components/WarehousesList';
import WorkCentersList from './components/WorkCentersList';
import BOMList from './components/BOMList';
import ProductionOrdersList from './components/ProductionOrdersList';
import EquipmentList from './components/EquipmentList';
import QualityInspectionsList from './components/QualityInspectionsList';
import MaintenanceRequestsList from './components/MaintenanceRequestsList';
import ManufacturingDashboard from './components/ManufacturingDashboard';

export default function ManufacturingPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Manufacturing</h2>
        </div>
        <Separator />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
            <TabsTrigger value="workcenters">Work Centers</TabsTrigger>
            <TabsTrigger value="bom">BOM</TabsTrigger>
            <TabsTrigger value="production">Production</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="space-y-4">
            <ManufacturingDashboard />
          </TabsContent>
          <TabsContent value="warehouses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Warehouses</CardTitle>
                <CardDescription>
                  Manage your warehouses, zones and storage locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WarehousesList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="workcenters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Work Centers</CardTitle>
                <CardDescription>
                  Manage work centers and production facilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WorkCentersList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="bom" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bill of Materials</CardTitle>
                <CardDescription>
                  Manage product recipes and material requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BOMList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="production" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Production Orders</CardTitle>
                <CardDescription>
                  Manage manufacturing orders and production runs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductionOrdersList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="equipment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Equipment</CardTitle>
                <CardDescription>
                  Manage machinery and production equipment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EquipmentList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="quality" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quality Inspections</CardTitle>
                <CardDescription>
                  Manage quality control inspections and parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QualityInspectionsList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Requests</CardTitle>
                <CardDescription>
                  Manage equipment maintenance and service requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MaintenanceRequestsList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}