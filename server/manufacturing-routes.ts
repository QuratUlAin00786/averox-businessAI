import express from 'express';
import { db } from './db';
import { eq } from 'drizzle-orm';
import {
  warehouses,
  warehouse_zones,
  work_centers,
  bill_of_materials,
  bom_items,
  routings,
  routing_operations,
  production_orders,
  production_order_operations,
  material_consumptions,
  quality_inspections,
  quality_parameters,
  equipment,
  maintenance_requests
} from '../shared/manufacturing-schema';
import { isAuthenticated } from './middleware/auth';
import { requirePermission } from './permissions-manager';

// Create router
const router = express.Router();

// Middleware to authenticate and check permission
const checkManufacturingPermission = (action: string) => [
  isAuthenticated,
  requirePermission('manufacturing', action)
];

// Warehouses Routes
router.get('/warehouses', checkManufacturingPermission('view'), async (req, res) => {
  try {
    const warehousesData = await db.select().from(warehouses);
    res.json(warehousesData);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
});

router.get('/warehouses/:id', checkManufacturingPermission('view'), async (req, res) => {
  try {
    const { id } = req.params;
    const [warehouseData] = await db.select().from(warehouses).where(eq(warehouses.id, parseInt(id)));
    
    if (!warehouseData) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }
    
    // Get zones for this warehouse
    const zonesData = await db.select().from(warehouse_zones)
      .where(eq(warehouse_zones.warehouse_id, parseInt(id)));
    
    // Get work centers for this warehouse
    const workCentersData = await db.select().from(work_centers)
      .where(eq(work_centers.warehouse_id, parseInt(id)));
    
    res.json({
      ...warehouseData,
      zones: zonesData,
      workCenters: workCentersData
    });
  } catch (error) {
    console.error('Error fetching warehouse details:', error);
    res.status(500).json({ error: 'Failed to fetch warehouse details' });
  }
});

router.post('/warehouses', checkManufacturingPermission('create'), async (req, res) => {
  try {
    const warehouseData = req.body;
    const [newWarehouse] = await db.insert(warehouses).values({
      ...warehouseData,
      created_at: new Date(),
      owner_id: req.user.id
    }).returning();
    
    res.status(201).json(newWarehouse);
  } catch (error) {
    console.error('Error creating warehouse:', error);
    res.status(500).json({ error: 'Failed to create warehouse' });
  }
});

router.put('/warehouses/:id', checkManufacturingPermission('update'), async (req, res) => {
  try {
    const { id } = req.params;
    const warehouseData = req.body;
    
    const [updatedWarehouse] = await db.update(warehouses)
      .set({
        ...warehouseData,
        updated_at: new Date()
      })
      .where(eq(warehouses.id, parseInt(id)))
      .returning();
    
    if (!updatedWarehouse) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }
    
    res.json(updatedWarehouse);
  } catch (error) {
    console.error('Error updating warehouse:', error);
    res.status(500).json({ error: 'Failed to update warehouse' });
  }
});

router.delete('/warehouses/:id', checkManufacturingPermission('delete'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(warehouses).where(eq(warehouses.id, parseInt(id)));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting warehouse:', error);
    res.status(500).json({ error: 'Failed to delete warehouse' });
  }
});

// Work Centers Routes
router.get('/work-centers', checkManufacturingPermission('view'), async (req, res) => {
  try {
    const workCentersData = await db.select().from(work_centers);
    res.json(workCentersData);
  } catch (error) {
    console.error('Error fetching work centers:', error);
    res.status(500).json({ error: 'Failed to fetch work centers' });
  }
});

router.get('/work-centers/:id', checkManufacturingPermission('view'), async (req, res) => {
  try {
    const { id } = req.params;
    const [workCenterData] = await db.select().from(work_centers)
      .where(eq(work_centers.id, parseInt(id)));
    
    if (!workCenterData) {
      return res.status(404).json({ error: 'Work center not found' });
    }
    
    // Get equipment for this work center
    const equipmentData = await db.select().from(equipment)
      .where(eq(equipment.work_center_id, parseInt(id)));
    
    res.json({
      ...workCenterData,
      equipment: equipmentData
    });
  } catch (error) {
    console.error('Error fetching work center details:', error);
    res.status(500).json({ error: 'Failed to fetch work center details' });
  }
});

router.post('/work-centers', checkManufacturingPermission('create'), async (req, res) => {
  try {
    const workCenterData = req.body;
    const [newWorkCenter] = await db.insert(work_centers).values({
      ...workCenterData,
      created_at: new Date()
    }).returning();
    
    res.status(201).json(newWorkCenter);
  } catch (error) {
    console.error('Error creating work center:', error);
    res.status(500).json({ error: 'Failed to create work center' });
  }
});

router.put('/work-centers/:id', checkManufacturingPermission('update'), async (req, res) => {
  try {
    const { id } = req.params;
    const workCenterData = req.body;
    
    const [updatedWorkCenter] = await db.update(work_centers)
      .set({
        ...workCenterData,
        updated_at: new Date()
      })
      .where(eq(work_centers.id, parseInt(id)))
      .returning();
    
    if (!updatedWorkCenter) {
      return res.status(404).json({ error: 'Work center not found' });
    }
    
    res.json(updatedWorkCenter);
  } catch (error) {
    console.error('Error updating work center:', error);
    res.status(500).json({ error: 'Failed to update work center' });
  }
});

router.delete('/work-centers/:id', checkManufacturingPermission('delete'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(work_centers).where(eq(work_centers.id, parseInt(id)));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting work center:', error);
    res.status(500).json({ error: 'Failed to delete work center' });
  }
});

// Bill of Materials Routes
router.get('/bom', checkManufacturingPermission('view'), async (req, res) => {
  try {
    const bomData = await db.select().from(bill_of_materials);
    res.json(bomData);
  } catch (error) {
    console.error('Error fetching bill of materials:', error);
    res.status(500).json({ error: 'Failed to fetch bill of materials' });
  }
});

router.get('/bom/:id', checkManufacturingPermission('view'), async (req, res) => {
  try {
    const { id } = req.params;
    const [bomData] = await db.select().from(bill_of_materials)
      .where(eq(bill_of_materials.id, parseInt(id)));
    
    if (!bomData) {
      return res.status(404).json({ error: 'Bill of materials not found' });
    }
    
    // Get items for this BOM
    const bomItemsData = await db.select().from(bom_items)
      .where(eq(bom_items.bom_id, parseInt(id)));
    
    // Get routings for this BOM
    const routingsData = await db.select().from(routings)
      .where(eq(routings.bom_id, parseInt(id)));
    
    res.json({
      ...bomData,
      items: bomItemsData,
      routings: routingsData
    });
  } catch (error) {
    console.error('Error fetching BOM details:', error);
    res.status(500).json({ error: 'Failed to fetch BOM details' });
  }
});

router.post('/bom', checkManufacturingPermission('create'), async (req, res) => {
  try {
    const bomData = req.body;
    
    // First, insert the BOM header
    const [newBom] = await db.insert(bill_of_materials).values({
      ...bomData,
      created_at: new Date(),
      created_by: req.user.id
    }).returning();
    
    // If items are provided, insert them
    if (bomData.items && Array.isArray(bomData.items)) {
      for (const item of bomData.items) {
        await db.insert(bom_items).values({
          ...item,
          bom_id: newBom.id
        });
      }
    }
    
    res.status(201).json(newBom);
  } catch (error) {
    console.error('Error creating BOM:', error);
    res.status(500).json({ error: 'Failed to create BOM' });
  }
});

router.put('/bom/:id', checkManufacturingPermission('update'), async (req, res) => {
  try {
    const { id } = req.params;
    const bomData = req.body;
    
    // Update BOM header
    const [updatedBom] = await db.update(bill_of_materials)
      .set({
        ...bomData,
        updated_at: new Date()
      })
      .where(eq(bill_of_materials.id, parseInt(id)))
      .returning();
    
    if (!updatedBom) {
      return res.status(404).json({ error: 'Bill of materials not found' });
    }
    
    res.json(updatedBom);
  } catch (error) {
    console.error('Error updating BOM:', error);
    res.status(500).json({ error: 'Failed to update BOM' });
  }
});

router.delete('/bom/:id', checkManufacturingPermission('delete'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete related BOM items first
    await db.delete(bom_items).where(eq(bom_items.bom_id, parseInt(id)));
    
    // Then delete the BOM header
    await db.delete(bill_of_materials).where(eq(bill_of_materials.id, parseInt(id)));
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting BOM:', error);
    res.status(500).json({ error: 'Failed to delete BOM' });
  }
});

// Production Order Routes
router.get('/production-orders', checkManufacturingPermission('view'), async (req, res) => {
  try {
    const productionOrdersData = await db.select().from(production_orders);
    res.json(productionOrdersData);
  } catch (error) {
    console.error('Error fetching production orders:', error);
    res.status(500).json({ error: 'Failed to fetch production orders' });
  }
});

router.get('/production-orders/:id', checkManufacturingPermission('view'), async (req, res) => {
  try {
    const { id } = req.params;
    const [productionOrderData] = await db.select().from(production_orders)
      .where(eq(production_orders.id, parseInt(id)));
    
    if (!productionOrderData) {
      return res.status(404).json({ error: 'Production order not found' });
    }
    
    // Get operations for this production order
    const operationsData = await db.select().from(production_order_operations)
      .where(eq(production_order_operations.production_order_id, parseInt(id)));
    
    // Get material consumptions for this production order
    const materialConsumptionsData = await db.select().from(material_consumptions)
      .where(eq(material_consumptions.production_order_id, parseInt(id)));
    
    // Get quality inspections for this production order
    const qualityInspectionsData = await db.select().from(quality_inspections)
      .where(eq(quality_inspections.reference_id, parseInt(id)))
      .where(eq(quality_inspections.reference_type, 'production_order'));
    
    res.json({
      ...productionOrderData,
      operations: operationsData,
      materialConsumptions: materialConsumptionsData,
      qualityInspections: qualityInspectionsData
    });
  } catch (error) {
    console.error('Error fetching production order details:', error);
    res.status(500).json({ error: 'Failed to fetch production order details' });
  }
});

router.post('/production-orders', checkManufacturingPermission('create'), async (req, res) => {
  try {
    const productionOrderData = req.body;
    
    // Generate order number if not provided
    if (!productionOrderData.order_number) {
      const timestamp = Date.now().toString();
      productionOrderData.order_number = `PO-${timestamp.substring(timestamp.length - 8)}`;
    }
    
    // First, insert the production order header
    const [newProductionOrder] = await db.insert(production_orders).values({
      ...productionOrderData,
      created_at: new Date(),
      created_by: req.user.id
    }).returning();
    
    // If operations are provided, insert them
    if (productionOrderData.operations && Array.isArray(productionOrderData.operations)) {
      for (const operation of productionOrderData.operations) {
        await db.insert(production_order_operations).values({
          ...operation,
          production_order_id: newProductionOrder.id
        });
      }
    }
    
    res.status(201).json(newProductionOrder);
  } catch (error) {
    console.error('Error creating production order:', error);
    res.status(500).json({ error: 'Failed to create production order' });
  }
});

router.put('/production-orders/:id', checkManufacturingPermission('update'), async (req, res) => {
  try {
    const { id } = req.params;
    const productionOrderData = req.body;
    
    // Update production order header
    const [updatedProductionOrder] = await db.update(production_orders)
      .set({
        ...productionOrderData,
        updated_at: new Date()
      })
      .where(eq(production_orders.id, parseInt(id)))
      .returning();
    
    if (!updatedProductionOrder) {
      return res.status(404).json({ error: 'Production order not found' });
    }
    
    res.json(updatedProductionOrder);
  } catch (error) {
    console.error('Error updating production order:', error);
    res.status(500).json({ error: 'Failed to update production order' });
  }
});

router.delete('/production-orders/:id', checkManufacturingPermission('delete'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete related records first
    await db.delete(production_order_operations)
      .where(eq(production_order_operations.production_order_id, parseInt(id)));
    
    await db.delete(material_consumptions)
      .where(eq(material_consumptions.production_order_id, parseInt(id)));
    
    // Then delete the production order header
    await db.delete(production_orders)
      .where(eq(production_orders.id, parseInt(id)));
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting production order:', error);
    res.status(500).json({ error: 'Failed to delete production order' });
  }
});

// Quality Inspection Routes
router.get('/quality-inspections', checkManufacturingPermission('view'), async (req, res) => {
  try {
    const qualityInspectionsData = await db.select().from(quality_inspections);
    res.json(qualityInspectionsData);
  } catch (error) {
    console.error('Error fetching quality inspections:', error);
    res.status(500).json({ error: 'Failed to fetch quality inspections' });
  }
});

router.post('/quality-inspections', checkManufacturingPermission('create'), async (req, res) => {
  try {
    const inspectionData = req.body;
    
    const [newInspection] = await db.insert(quality_inspections).values({
      ...inspectionData,
      inspection_date: new Date(),
      inspected_by: req.user.id
    }).returning();
    
    res.status(201).json(newInspection);
  } catch (error) {
    console.error('Error creating quality inspection:', error);
    res.status(500).json({ error: 'Failed to create quality inspection' });
  }
});

// Equipment Routes
router.get('/equipment', checkManufacturingPermission('view'), async (req, res) => {
  try {
    const equipmentData = await db.select().from(equipment);
    res.json(equipmentData);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

router.get('/equipment/:id', checkManufacturingPermission('view'), async (req, res) => {
  try {
    const { id } = req.params;
    const [equipmentData] = await db.select().from(equipment)
      .where(eq(equipment.id, parseInt(id)));
    
    if (!equipmentData) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    // Get maintenance requests for this equipment
    const maintenanceRequestsData = await db.select().from(maintenance_requests)
      .where(eq(maintenance_requests.equipment_id, parseInt(id)));
    
    res.json({
      ...equipmentData,
      maintenanceRequests: maintenanceRequestsData
    });
  } catch (error) {
    console.error('Error fetching equipment details:', error);
    res.status(500).json({ error: 'Failed to fetch equipment details' });
  }
});

router.post('/equipment', checkManufacturingPermission('create'), async (req, res) => {
  try {
    const equipmentData = req.body;
    
    const [newEquipment] = await db.insert(equipment).values({
      ...equipmentData,
      created_at: new Date(),
      created_by: req.user.id
    }).returning();
    
    res.status(201).json(newEquipment);
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({ error: 'Failed to create equipment' });
  }
});

router.put('/equipment/:id', checkManufacturingPermission('update'), async (req, res) => {
  try {
    const { id } = req.params;
    const equipmentData = req.body;
    
    const [updatedEquipment] = await db.update(equipment)
      .set({
        ...equipmentData,
        updated_at: new Date()
      })
      .where(eq(equipment.id, parseInt(id)))
      .returning();
    
    if (!updatedEquipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    res.json(updatedEquipment);
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
});

// Maintenance Request Routes
router.get('/maintenance-requests', checkManufacturingPermission('view'), async (req, res) => {
  try {
    const maintenanceRequestsData = await db.select().from(maintenance_requests);
    res.json(maintenanceRequestsData);
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance requests' });
  }
});

router.post('/maintenance-requests', checkManufacturingPermission('create'), async (req, res) => {
  try {
    const requestData = req.body;
    
    const [newRequest] = await db.insert(maintenance_requests).values({
      ...requestData,
      request_date: new Date(),
      created_at: new Date(),
      requested_by: req.user.id
    }).returning();
    
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    res.status(500).json({ error: 'Failed to create maintenance request' });
  }
});

router.put('/maintenance-requests/:id', checkManufacturingPermission('update'), async (req, res) => {
  try {
    const { id } = req.params;
    const requestData = req.body;
    
    const [updatedRequest] = await db.update(maintenance_requests)
      .set({
        ...requestData,
        updated_at: new Date()
      })
      .where(eq(maintenance_requests.id, parseInt(id)))
      .returning();
    
    if (!updatedRequest) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }
    
    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating maintenance request:', error);
    res.status(500).json({ error: 'Failed to update maintenance request' });
  }
});

// Dashboard and Reports
router.get('/dashboard', checkManufacturingPermission('view'), async (req, res) => {
  try {
    // Get counts of various entities
    const [warehouseCount] = await db.select({ count: db.fn.count() }).from(warehouses);
    const [workCenterCount] = await db.select({ count: db.fn.count() }).from(work_centers);
    const [equipmentCount] = await db.select({ count: db.fn.count() }).from(equipment);
    
    // Get production orders by status
    const productionOrdersByStatus = await db.select({
      status: production_orders.status,
      count: db.fn.count()
    })
    .from(production_orders)
    .groupBy(production_orders.status);
    
    // Get recent production orders
    const recentProductionOrders = await db.select()
      .from(production_orders)
      .orderBy(db.sql`${production_orders.created_at} DESC`)
      .limit(5);
    
    // Get maintenance requests by status
    const maintenanceRequestsByStatus = await db.select({
      status: maintenance_requests.status,
      count: db.fn.count()
    })
    .from(maintenance_requests)
    .groupBy(maintenance_requests.status);
    
    res.json({
      counts: {
        warehouses: warehouseCount.count,
        workCenters: workCenterCount.count,
        equipment: equipmentCount.count
      },
      productionOrdersByStatus,
      recentProductionOrders,
      maintenanceRequestsByStatus
    });
  } catch (error) {
    console.error('Error fetching manufacturing dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch manufacturing dashboard data' });
  }
});

export default router;