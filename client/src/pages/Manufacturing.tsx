import { useEffect } from 'react';
import ManufacturingIndex from './Manufacturing/index';
import MaterialsManagement from './Manufacturing/MaterialsManagement';
import ProductionManagement from './Manufacturing/ProductionManagement';
import BillOfMaterialsPage from './Manufacturing/BillOfMaterialsPage';
import MRPPage from './Manufacturing/MaterialsManagement/MRPPage';
import StorageBinPage from './Manufacturing/MaterialsManagement/StorageBinPage';
import BatchLotPage from './Manufacturing/MaterialsManagement/BatchLotPage';
import VendorPage from './Manufacturing/MaterialsManagement/VendorPage';
import ValuationsPage from './Manufacturing/MaterialsManagement/ValuationsPage';
import ReturnsPage from './Manufacturing/MaterialsManagement/ReturnsPage';
import TradeCompliancePage from './Manufacturing/MaterialsManagement/TradeCompliancePage';

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

  // If no match, default to index
  return <ManufacturingIndex />;
}