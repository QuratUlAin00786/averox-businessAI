// Manufacturing module type definitions

// Bill of Materials
export interface BillOfMaterials {
  id: number;
  product_id: number;
  product_name: string;
  product_code?: string;
  revision?: string;
  notes?: string;
  item_count: string | number;
  created_at: string;
  updated_at?: string;
  active: boolean;
  components?: any[];
}

// MRP Dashboard
export interface LowStockItem {
  id: number;
  material_id: number;
  material_name: string;
  current_stock: number;
  minimum_stock: number;
  unit_of_measure: string;
  category: string;
  reorder_level: number;
  supplier_name: string;
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

export interface Forecast {
  id: number;
  name: string;
  period: string;
  created_date: string;
  confidence: number;
  values: {
    period: string;
    value: number;
  }[];
}

// Manufacturing Dashboard
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

export interface WarehouseCapacity {
  name: string;
  used: number;
  total: number;
}

export interface DashboardApiResponse {
  productionStats: ProductionStats;
  qualityStats: QualityStats;
  maintenanceStats: MaintenanceStats;
  recentOrders: any[]; // Using any for now
  workCenterUtilization: WorkCenterUtilization[];
}

export interface DashboardDisplay {
  productionSummary: {
    totalOrders: number;
    ordersInProgress: number;
    ordersScheduled: number;
    ordersCompleted: number;
    ordersOnHold: number;
  };
  workCenterUtilization: any[];
  warehouseCapacity: WarehouseCapacity[];
  equipmentStatus: {
    operational: number;
    underMaintenance: number;
    idle: number;
    decommissioned: number;
    faulty: number;
  };
  qualityMetrics: {
    inspections: number;
    passed: number;
    failed: number;
    pendingReview: number;
    passRate: number;
  };
  maintenanceRequests: {
    total: number;
    completed: number;
    inProgress: number;
    scheduled: number;
    deferred: number;
  };
  productionTrend: {
    month: string;
    planned: number;
    actual: number;
  }[];
  alerts: any[];
  recentActivities: {
    id: number | string;
    type: string;
    description: string;
    timestamp: string;
  }[];
  materialStatus?: any;
}

// Route interfaces
export interface ManufacturingRoutesResponse {
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