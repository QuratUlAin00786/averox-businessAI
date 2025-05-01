import { Request, Response, Router } from 'express';
import { db } from './db';
import { eq, desc, or, like } from 'drizzle-orm';
import { z } from 'zod';
import { 
  warehouses, 
  warehouse_zones as warehouseZones, 
  storage_bins as storageBins, 
  vendors,
  vendor_products as vendorProducts,
  vendor_contracts as vendorContracts,
  material_valuations as materialValuations,
  material_valuation_method as valuationMethodEnum,
  batch_lots as batchLots,
  quality_inspections as qualityInspections,
  return_authorizations as returnOrders,
  return_items as returnItems,
  trade_compliance as tradeCompliance,
  shipment_compliance as shipmentCompliance,
  material_requirements as materialRequirements,
  material_forecasts as materialForecasts,
  insertShipmentComplianceSchema,
  inventoryTransactions,
  inventoryTransactions
} from '@shared/schema';
import { eq, desc, and, like, or } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

const router = Router();

// ============= WAREHOUSES API ==================
// Get all warehouses
router.get('/warehouses', async (req: Request, res: Response) => {
  try {
    const allWarehouses = await db.select().from(warehouses).orderBy(desc(warehouses.id));
    res.json(allWarehouses);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
});

// Get a single warehouse by ID
router.get('/warehouses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [warehouse] = await db.select().from(warehouses).where(eq(warehouses.id, Number(id)));
    
    if (!warehouse) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }
    
    res.json(warehouse);
  } catch (error) {
    console.error('Error fetching warehouse:', error);
    res.status(500).json({ error: 'Failed to fetch warehouse' });
  }
});

// Create a new warehouse
router.post('/warehouses', async (req: Request, res: Response) => {
  try {
    const warehouseSchema = createInsertSchema(warehouses);
    const validatedData = warehouseSchema.parse(req.body);
    
    const [newWarehouse] = await db.insert(warehouses).values(validatedData).returning();
    res.status(201).json(newWarehouse);
  } catch (error) {
    console.error('Error creating warehouse:', error);
    res.status(500).json({ error: 'Failed to create warehouse' });
  }
});

// Update a warehouse
router.put('/warehouses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const warehouseSchema = createInsertSchema(warehouses);
    const validatedData = warehouseSchema.parse(req.body);
    
    const [updatedWarehouse] = await db
      .update(warehouses)
      .set(validatedData)
      .where(eq(warehouses.id, Number(id)))
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

// Delete a warehouse
router.delete('/warehouses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await db.delete(warehouses).where(eq(warehouses.id, Number(id)));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting warehouse:', error);
    res.status(500).json({ error: 'Failed to delete warehouse' });
  }
});

// ============= WAREHOUSE ZONES API ==================
// Get all zones for a warehouse
router.get('/warehouse-zones', async (req: Request, res: Response) => {
  try {
    const { warehouseId } = req.query;
    
    let query = db.select().from(warehouseZones);
    
    if (warehouseId) {
      query = query.where(eq(warehouseZones.warehouseId, Number(warehouseId)));
    }
    
    const zones = await query.orderBy(warehouseZones.name);
    res.json(zones);
  } catch (error) {
    console.error('Error fetching warehouse zones:', error);
    res.status(500).json({ error: 'Failed to fetch warehouse zones' });
  }
});

// Create a new warehouse zone
router.post('/warehouse-zones', async (req: Request, res: Response) => {
  try {
    const zoneSchema = createInsertSchema(warehouseZones);
    const validatedData = zoneSchema.parse(req.body);
    
    const [newZone] = await db.insert(warehouseZones).values(validatedData).returning();
    res.status(201).json(newZone);
  } catch (error) {
    console.error('Error creating warehouse zone:', error);
    res.status(500).json({ error: 'Failed to create warehouse zone' });
  }
});

// ============= STORAGE BINS API ==================
// Get all storage bins
router.get('/storage-bins', async (req: Request, res: Response) => {
  try {
    const { warehouseId, zoneId } = req.query;
    
    let query = db.select().from(storageBins);
    
    if (warehouseId) {
      query = query.where(eq(storageBins.warehouseId, Number(warehouseId)));
    }
    
    if (zoneId) {
      query = query.where(eq(storageBins.zoneId, Number(zoneId)));
    }
    
    const bins = await query.orderBy(storageBins.id);
    res.json(bins);
  } catch (error) {
    console.error('Error fetching storage bins:', error);
    res.status(500).json({ error: 'Failed to fetch storage bins' });
  }
});

// Create a new storage bin
router.post('/storage-bins', async (req: Request, res: Response) => {
  try {
    const binSchema = createInsertSchema(storageBins);
    const validatedData = binSchema.parse(req.body);
    
    const [newBin] = await db.insert(storageBins).values(validatedData).returning();
    res.status(201).json(newBin);
  } catch (error) {
    console.error('Error creating storage bin:', error);
    res.status(500).json({ error: 'Failed to create storage bin' });
  }
});

// ============= VENDORS API ==================
// Get all vendors
router.get('/vendors', async (req: Request, res: Response) => {
  try {
    const { search, status } = req.query;
    
    let query = db.select().from(vendors);
    
    if (search) {
      query = query.where(
        or(
          like(vendors.name, `%${search}%`),
          like(vendors.contactPerson, `%${search}%`),
          like(vendors.email, `%${search}%`)
        )
      );
    }
    
    if (status) {
      query = query.where(eq(vendors.status, String(status)));
    }
    
    const allVendors = await query.orderBy(desc(vendors.id));
    res.json(allVendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// Get a single vendor by ID
router.get('/vendors/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, Number(id)));
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    res.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ error: 'Failed to fetch vendor' });
  }
});

// Create a new vendor
router.post('/vendors', async (req: Request, res: Response) => {
  try {
    const vendorSchema = createInsertSchema(vendors);
    const validatedData = vendorSchema.parse(req.body);
    
    const [newVendor] = await db.insert(vendors).values(validatedData).returning();
    res.status(201).json(newVendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ error: 'Failed to create vendor' });
  }
});

// ============= VENDOR PRODUCTS API ==================
// Get all vendor products
router.get('/vendor-products', async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.query;
    
    let query = db.select().from(vendorProducts);
    
    if (vendorId) {
      query = query.where(eq(vendorProducts.vendorId, Number(vendorId)));
    }
    
    const products = await query.orderBy(vendorProducts.id);
    res.json(products);
  } catch (error) {
    console.error('Error fetching vendor products:', error);
    res.status(500).json({ error: 'Failed to fetch vendor products' });
  }
});

// ============= VENDOR CONTRACTS API ==================
// Get all vendor contracts
router.get('/vendor-contracts', async (req: Request, res: Response) => {
  try {
    const { vendorId, status } = req.query;
    
    let query = db.select().from(vendorContracts);
    
    if (vendorId) {
      query = query.where(eq(vendorContracts.vendorId, Number(vendorId)));
    }
    
    if (status) {
      query = query.where(eq(vendorContracts.status, String(status)));
    }
    
    const contracts = await query.orderBy(desc(vendorContracts.id));
    res.json(contracts);
  } catch (error) {
    console.error('Error fetching vendor contracts:', error);
    res.status(500).json({ error: 'Failed to fetch vendor contracts' });
  }
});

// ============= MATERIAL VALUATIONS API ==================
// Get all material valuations
router.get('/material-valuations', async (req: Request, res: Response) => {
  try {
    const { materialId, method } = req.query;
    
    let query = db.select().from(materialValuations);
    
    if (materialId) {
      query = query.where(eq(materialValuations.materialId, Number(materialId)));
    }
    
    if (method) {
      query = query.where(eq(materialValuations.valuationMethod, String(method)));
    }
    
    const valuations = await query.orderBy(desc(materialValuations.updatedAt));
    res.json(valuations);
  } catch (error) {
    console.error('Error fetching material valuations:', error);
    res.status(500).json({ error: 'Failed to fetch material valuations' });
  }
});

// Get valuation methods
router.get('/valuation-methods', async (req: Request, res: Response) => {
  try {
    // Since we're using an enum, return the enum values directly
    const methods = ['FIFO', 'LIFO', 'MovingAverage', 'StandardCost', 'BatchSpecific'];
    
    // Format as objects to maintain consistency with other endpoints
    const formattedMethods = methods.map(method => ({
      id: method,
      name: method,
      description: getValuationMethodDescription(method)
    }));
    
    res.json(formattedMethods);
  } catch (error) {
    console.error('Error fetching valuation methods:', error);
    res.status(500).json({ error: 'Failed to fetch valuation methods' });
  }
});

// Helper function to get descriptions for valuation methods
function getValuationMethodDescription(method: string): string {
  switch (method) {
    case 'FIFO':
      return 'First In, First Out - Assets produced or acquired first are sold, used, or disposed of first';
    case 'LIFO':
      return 'Last In, First Out - Assets produced or acquired last are sold, used, or disposed of first';
    case 'MovingAverage':
      return 'Calculates a new average cost after each purchase';
    case 'StandardCost':
      return 'Uses predetermined costs for valuation regardless of actual costs';
    case 'BatchSpecific':
      return 'Each batch is valued independently based on its actual cost';
    default:
      return '';
  }
}

// ============= BATCH/LOT MANAGEMENT API ==================
// Get all batches/lots
router.get('/batch-lots', async (req: Request, res: Response) => {
  try {
    const { materialId, status, expiryBefore } = req.query;
    
    let query = db.select().from(batchLots);
    
    if (materialId) {
      query = query.where(eq(batchLots.materialId, Number(materialId)));
    }
    
    if (status) {
      query = query.where(eq(batchLots.status, String(status)));
    }
    
    if (expiryBefore) {
      query = query.where(eq(batchLots.expiryDate, String(expiryBefore)));
    }
    
    const batches = await query.orderBy(desc(batchLots.id));
    res.json(batches);
  } catch (error) {
    console.error('Error fetching batch/lots:', error);
    res.status(500).json({ error: 'Failed to fetch batch/lots' });
  }
});

// Get QA inspections for batches
router.get('/quality-inspections', async (req: Request, res: Response) => {
  try {
    const { batchId, status } = req.query;
    
    let query = db.select().from(qualityInspections);
    
    if (batchId) {
      query = query.where(eq(qualityInspections.batchId, Number(batchId)));
    }
    
    if (status) {
      query = query.where(eq(qualityInspections.status, String(status)));
    }
    
    const inspections = await query.orderBy(desc(qualityInspections.id));
    res.json(inspections);
  } catch (error) {
    console.error('Error fetching quality inspections:', error);
    res.status(500).json({ error: 'Failed to fetch quality inspections' });
  }
});

// ============= RETURNS MANAGEMENT API ==================
// Get all return orders
router.get('/return-orders', async (req: Request, res: Response) => {
  try {
    const { type, status } = req.query;
    
    let query = db.select().from(returnOrders);
    
    if (type) {
      query = query.where(eq(returnOrders.type, String(type)));
    }
    
    if (status) {
      query = query.where(eq(returnOrders.status, String(status)));
    }
    
    const returns = await query.orderBy(desc(returnOrders.id));
    res.json(returns);
  } catch (error) {
    console.error('Error fetching return orders:', error);
    res.status(500).json({ error: 'Failed to fetch return orders' });
  }
});

// Get return items by return order
router.get('/return-items', async (req: Request, res: Response) => {
  try {
    const { returnId } = req.query;
    
    let query = db.select().from(returnItems);
    
    if (returnId) {
      query = query.where(eq(returnItems.returnId, Number(returnId)));
    }
    
    const items = await query.orderBy(returnItems.id);
    res.json(items);
  } catch (error) {
    console.error('Error fetching return items:', error);
    res.status(500).json({ error: 'Failed to fetch return items' });
  }
});

// ============= GLOBAL TRADE COMPLIANCE API ==================
// Get all trade compliance documents
router.get('/trade-documents', async (req: Request, res: Response) => {
  try {
    const { type, materialId, status } = req.query;
    
    let query = db.select().from(tradeCompliance);
    
    if (type) {
      query = query.where(eq(tradeCompliance.documentType, String(type)));
    }
    
    if (materialId) {
      query = query.where(eq(tradeCompliance.materialId, Number(materialId)));
    }
    
    if (status) {
      query = query.where(eq(tradeCompliance.documentStatus, String(status)));
    }
    
    const documents = await query.orderBy(desc(tradeCompliance.id));
    res.json(documents);
  } catch (error) {
    console.error('Error fetching trade compliance documents:', error);
    res.status(500).json({ error: 'Failed to fetch trade compliance documents' });
  }
});

// Get all shipment compliance records
router.get('/shipment-compliance', async (req: Request, res: Response) => {
  try {
    const { type, status, destination } = req.query;
    
    let query = db.select().from(shipmentCompliance);
    
    // Apply filters based on query parameters
    if (type) {
      query = query.where(eq(shipmentCompliance.type, type.toString() as any));
    }
    
    if (status) {
      query = query.where(eq(shipmentCompliance.document_status, status.toString() as any));
    }
    
    if (destination) {
      const searchTerm = destination.toString().toLowerCase();
      query = query.where(
        or(
          like(shipmentCompliance.destination, `%${searchTerm}%`),
          like(shipmentCompliance.country, `%${searchTerm}%`)
        )
      );
    }
    
    const shipments = await query.orderBy(desc(shipmentCompliance.id));
    
    // If no records exist yet, create some initial data
    if (shipments.length === 0) {
      const initialShipments = [
        {
          shipment_id: "SHP-001",
          type: "Export" as const,
          document_status: "Approved" as const,
          country: "Germany",
          destination: "Berlin",
          document_count: 5,
          compliance_level: "Full" as const,
          last_updated: new Date(),
          next_review_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          required_documents: JSON.stringify(["Export Declaration", "Certificate of Origin", "Commercial Invoice", "Packing List", "Dangerous Goods Declaration"]),
          customs_value: 125000,
          created_by: 1,
          notes: "All documentation complete and approved."
        },
        {
          shipment_id: "SHP-002",
          type: "Import" as const,
          document_status: "Pending" as const,
          country: "China",
          destination: "Shanghai",
          document_count: 7,
          compliance_level: "Partial" as const,
          last_updated: new Date(),
          next_review_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          required_documents: JSON.stringify(["Import License", "Certificate of Origin", "Commercial Invoice", "Packing List", "Bill of Lading", "Import Declaration", "Inspection Certificate"]),
          obtained_documents: JSON.stringify(["Commercial Invoice", "Packing List", "Bill of Lading"]),
          missing_documents: JSON.stringify(["Import License", "Certificate of Origin", "Import Declaration", "Inspection Certificate"]),
          customs_value: 85000,
          created_by: 1,
          notes: "Missing critical documentation."
        },
        {
          shipment_id: "SHP-003",
          type: "Export" as const,
          document_status: "Rejected" as const,
          country: "Brazil",
          destination: "Sao Paulo",
          document_count: 3,
          compliance_level: "Non-Compliant" as const,
          last_updated: new Date(),
          next_review_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          required_documents: JSON.stringify(["Export Declaration", "Certificate of Origin", "Commercial Invoice"]),
          obtained_documents: JSON.stringify(["Commercial Invoice"]),
          missing_documents: JSON.stringify(["Export Declaration", "Certificate of Origin"]),
          customs_value: 45000,
          created_by: 1,
          notes: "Export declaration rejected due to incorrect HS codes."
        }
      ];
      
      for (const shipment of initialShipments) {
        await db.insert(shipmentCompliance).values(shipment);
      }
      
      // Fetch the newly inserted data
      const newShipments = await db.select().from(shipmentCompliance).orderBy(desc(shipmentCompliance.id));
      res.json(newShipments);
    } else {
      res.json(shipments);
    }
  } catch (error) {
    console.error('Error fetching shipment compliance records:', error);
    res.status(500).json({ error: 'Failed to fetch shipment compliance records' });
  }
});

// Add new shipment compliance record
router.post('/shipment-compliance', async (req: Request, res: Response) => {
  try {
    const shipmentData = insertShipmentComplianceSchema.parse(req.body);
    
    const [newShipment] = await db.insert(shipmentCompliance)
      .values({
        ...shipmentData,
        created_by: req.user?.id || 1,
        last_updated: new Date(),
        created_at: new Date()
      })
      .returning();
    
    res.status(201).json(newShipment);
  } catch (error) {
    console.error('Error creating shipment compliance record:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create shipment compliance record' });
    }
  }
});

// Get shipment compliance by ID
router.get('/shipment-compliance/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [shipment] = await db.select()
      .from(shipmentCompliance)
      .where(eq(shipmentCompliance.id, Number(id)));
    
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment compliance record not found' });
    }
    
    res.json(shipment);
  } catch (error) {
    console.error('Error fetching shipment compliance record:', error);
    res.status(500).json({ error: 'Failed to fetch shipment compliance record' });
  }
});

// Update shipment compliance record
router.put('/shipment-compliance/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const shipmentData = req.body;
    
    const [updatedShipment] = await db.update(shipmentCompliance)
      .set({
        ...shipmentData,
        updated_by: req.user?.id || 1,
        updated_at: new Date(),
        last_updated: new Date()
      })
      .where(eq(shipmentCompliance.id, Number(id)))
      .returning();
    
    if (!updatedShipment) {
      return res.status(404).json({ error: 'Shipment compliance record not found' });
    }
    
    res.json(updatedShipment);
  } catch (error) {
    console.error('Error updating shipment compliance record:', error);
    res.status(500).json({ error: 'Failed to update shipment compliance record' });
  }
});

// ============= MRP API ==================
// Get all inventory transactions
router.get('/inventory-transactions', async (req: Request, res: Response) => {
  try {
    const { materialId, type, fromDate, toDate } = req.query;
    
    let query = db.select().from(inventoryTransactions);
    
    if (materialId) {
      query = query.where(eq(inventoryTransactions.materialId, Number(materialId)));
    }
    
    if (type) {
      query = query.where(eq(inventoryTransactions.type, String(type)));
    }
    
    // Add date range filtering if needed
    
    const transactions = await query.orderBy(desc(inventoryTransactions.createdAt));
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching inventory transactions:', error);
    res.status(500).json({ error: 'Failed to fetch inventory transactions' });
  }
});

// Get MRP forecasts
router.get('/mrp-forecasts', async (req: Request, res: Response) => {
  try {
    // This would be a complex calculation in a real system
    // For now, we return sample data
    const forecastData = [
      { month: 'Jan', forecasted: 120, actual: 115 },
      { month: 'Feb', forecasted: 140, actual: 132 },
      { month: 'Mar', forecasted: 135, actual: 142 },
      { month: 'Apr', forecasted: 150, actual: 145 },
      { month: 'May', forecasted: 165, actual: 160 },
      { month: 'Jun', forecasted: 180, actual: 175 },
    ];
    
    res.json(forecastData);
  } catch (error) {
    console.error('Error calculating MRP forecasts:', error);
    res.status(500).json({ error: 'Failed to calculate MRP forecasts' });
  }
});

// Get material requirements
router.get('/material-requirements', async (req: Request, res: Response) => {
  try {
    // This would be a complex calculation in a real system
    // For now, we return sample data
    const materialRequirements = [
      { 
        id: 'MR-001', 
        name: 'Raw Material A', 
        currentStock: 250,
        safetyStock: 100,
        required: 400,
        orderPoint: 150,
        status: 'Sufficient'
      },
      { 
        id: 'MR-002', 
        name: 'Component B', 
        currentStock: 120,
        safetyStock: 75,
        required: 300,
        orderPoint: 100,
        status: 'Low'
      },
      { 
        id: 'MR-003', 
        name: 'Semifinished C', 
        currentStock: 30,
        safetyStock: 50,
        required: 150,
        orderPoint: 60,
        status: 'Critical'
      }
    ];
    
    res.json(materialRequirements);
  } catch (error) {
    console.error('Error calculating material requirements:', error);
    res.status(500).json({ error: 'Failed to calculate material requirements' });
  }
});

export default router;