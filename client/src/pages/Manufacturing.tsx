import { useEffect } from 'react';
import ManufacturingIndex from './Manufacturing/index';
import MaterialsManagement from './Manufacturing/MaterialsManagement';
import ProductionManagement from './Manufacturing/ProductionManagement';
import BillOfMaterialsPage from './Manufacturing/BillOfMaterialsPage';
import ForecastingPage from './Manufacturing/ForecastingPage';
import MRPPage from './Manufacturing/MaterialsManagement/MRPPage';
import StorageBinPage from './Manufacturing/MaterialsManagement/StorageBinPage';
import BatchLotPage from './Manufacturing/MaterialsManagement/BatchLotPage';
import VendorPage from './Manufacturing/MaterialsManagement/VendorPage';
import ValuationsPage from './Manufacturing/MaterialsManagement/ValuationsPage';
import ReturnsPage from './Manufacturing/MaterialsManagement/ReturnsPage';
import TradeCompliancePage from './Manufacturing/MaterialsManagement/TradeCompliancePage';
import TestDataView from './Manufacturing/TestDataView';

type ManufacturingProps = {
  subPath?: string;
};

export default function Manufacturing({ subPath }: ManufacturingProps = {}) {
  // Default render the index page if no subpath
  if (!subPath) {
    return <ManufacturingIndex />;
  }

  // Handle Materials Management section
  if (subPath === 'materials') {
    return <MaterialsManagement />;
  }

  // Handle Production Management section
  if (subPath === 'production') {
    return <ProductionManagement />;
  }

  // Handle Production Management subsections
  if (subPath === 'production/production-lines') {
    return <ProductionManagement />;
  }

  if (subPath === 'production/workcenters') {
    return <ProductionManagement />;
  }

  if (subPath === 'production/bom') {
    return <ProductionManagement />;
  }

  if (subPath === 'production/work-orders') {
    return <ProductionManagement />;
  }

  if (subPath === 'production/quality') {
    return <ProductionManagement />;
  }

  // Handle BOM Management
  if (subPath === 'boms') {
    return <BillOfMaterialsPage />;
  }

  // Handle Materials Management subsections
  if (subPath === 'materials/mrp') {
    return <MRPPage />;
  }

  if (subPath === 'materials/storage-bins') {
    return <StorageBinPage />;
  }

  if (subPath === 'materials/batch-lot') {
    return <BatchLotPage />;
  }

  if (subPath === 'materials/vendors') {
    return <VendorPage />;
  }

  if (subPath === 'materials/valuations') {
    return <ValuationsPage />;
  }

  if (subPath === 'materials/returns') {
    return <ReturnsPage />;
  }

  if (subPath === 'materials/compliance') {
    return <TradeCompliancePage />;
  }
  
  // Add forecasting route
  if (subPath === 'forecasting') {
    return <ForecastingPage />;
  }
  
  // Add production planning route
  if (subPath === 'planning') {
    return <ProductionManagement />;
  }
  
  // Add manufacturing analytics route - redirect to reports for analytics
  if (subPath === 'analytics') {
    window.location.href = '/reports';
    return null;
  }
  
  // Add compliance route
  if (subPath === 'compliance') {
    return <TradeCompliancePage />;
  }
  
  // Add test data view route
  if (subPath === 'test-data') {
    return <TestDataView />;
  }

  // If no match, default to index
  return <ManufacturingIndex />;
}