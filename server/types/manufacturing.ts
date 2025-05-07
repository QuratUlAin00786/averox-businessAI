// Manufacturing module types for the backend

// MRP Dashboard
export interface LowStockItem {
  material_id: number;
  material_name: string;
  material_code?: string;
  current_quantity: number;
  reorder_point: number;
  unit_of_measure?: string;
  category?: string;
  supplier_name?: string;
}

export interface UpcomingRequirement {
  material_id: number;
  material_name: string;
  required_quantity: string;
  available_quantity: string;
  coverage_percentage: number;
  unit_of_measure: string;
  earliest_requirement_date: string;
}

export interface ForecastValue {
  period: string;
  value: number;
}

export interface Forecast {
  id: number;
  name: string;
  period: string;
  created_date: string;
  confidence: number;
  values: ForecastValue[];
  status: string;
  createdAt: string;
  createdBy: number;
}

export interface MrpDashboardResponse {
  lowStockItems: LowStockItem[];
  upcomingRequirements: UpcomingRequirement[];
  forecasts: Forecast[];
  forecastData?: any[];
}

// Equipment
export interface Equipment {
  id: number;
  name: string;
  type: string;
  status: string;
  location: string;
  last_maintenance: string;
  next_maintenance: string;
}

// Production Jobs
export interface ProductionJob {
  id: number;
  order_id: number;
  equipment_id: number;
  status: string;
  start_time: string;
  end_time?: string;
  product_name: string;
  quantity: number;
}

// Contracts
export interface Contract {
  id: number;
  title: string;
  customer_name: string;
  start_date: string;
  end_date: string;
  status: string;
  value: number;
  type: string;
}

// Products
export interface Product {
  id: number;
  name: string;
  code: string;
  category: string;
  price: number;
  inventory: number;
  status: string;
}

// BOM
export interface BillOfMaterials {
  id: number;
  product_id: number;
  product_name: string;
  revision?: string;
  notes?: string;
  item_count: number;
  created_at: string;
  updated_at?: string;
  active: boolean;
}

// Dashboard
export interface ProductionStats {
  total: number;
  inProgress: number;
  completed: number;
  delayed: number;
  onHold: number;
}

export interface QualityStats {
  inspections: number;
  passed: number;
  failed: number;
  pending: number;
}

export interface MaintenanceStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  critical: number;
}

export interface WorkCenterUtilization {
  id: number;
  name: string;
  capacity: number;
  current_load: number;
  utilization: number;
}

export interface DashboardApiResponse {
  productionStats: ProductionStats;
  qualityStats: QualityStats;
  maintenanceStats: MaintenanceStats;
  recentOrders: any[];
  workCenterUtilization: WorkCenterUtilization[];
}