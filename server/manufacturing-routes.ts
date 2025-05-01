import { Request, Response, Router } from 'express';
import { db } from './db';
import { eq, desc, and, like, or } from 'drizzle-orm';
import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
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
  insertShipmentComplianceSchema
} from '@shared/manufacturing-schema';
import { inventoryTransactions } from '@shared/schema';

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
    const { shipmentType, documentStatus, documentType } = req.query;
    
    // Use raw SQL to bypass schema mismatches
    let sql = `SELECT * FROM shipment_compliance`;
    const whereConditions = [];
    const params = [];
    
    if (shipmentType) {
      whereConditions.push(`shipment_type = $${params.length + 1}`);
      params.push(shipmentType.toString());
    }
    
    if (documentStatus) {
      whereConditions.push(`document_status = $${params.length + 1}`);
      params.push(documentStatus.toString());
    }
    
    if (documentType) {
      whereConditions.push(`document_type LIKE $${params.length + 1}`);
      params.push(`%${documentType.toString()}%`);
    }
    
    if (whereConditions.length > 0) {
      sql += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    sql += ` ORDER BY id DESC`;
    
    console.log('Executing SQL:', sql, 'with params:', params);
    
    const result = await db.execute(sql, params);
    const shipments = result.rows;
    
    // If no records exist yet, create some initial data
    if (shipments.length === 0) {
      // Insert initial data using simpler direct SQL without parameters
      const today = new Date().toISOString().split('T')[0];
      const futureDate90 = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const pastDate15 = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const futureDate180 = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const pastDate5 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const futureDate45 = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const nowTimestamp = new Date().toISOString();
      
      // Create the shipment compliance table if it doesn't exist
      await db.execute(`
        CREATE TABLE IF NOT EXISTS shipment_compliance (
          id SERIAL PRIMARY KEY,
          shipment_id INTEGER NOT NULL,
          document_type VARCHAR(100) NOT NULL,
          document_number VARCHAR(100),
          issue_date DATE,
          expiry_date DATE,
          issuing_authority VARCHAR(100),
          compliance_level compliance_level,
          document_status shipment_document_status,
          shipment_type shipment_type,
          notes TEXT,
          digital_copy_url VARCHAR(255),
          created_by INTEGER,
          created_at TIMESTAMP,
          updated_at TIMESTAMP
        )
      `);
      
      // Insert using direct values without parameters
      await db.execute(`
        INSERT INTO shipment_compliance (
          shipment_id, document_type, document_number, 
          issue_date, expiry_date, issuing_authority, 
          compliance_level, document_status, shipment_type, 
          notes, digital_copy_url, created_by, 
          created_at, updated_at
        ) VALUES 
        (
          1001, 'Export Declaration', 'EXP-2025-001', 
          '${today}', '${futureDate90}', 'Commerce Department', 
          'High', 'Verified', 'Export', 
          'All export documentation complete and verified.', 'https://docs.averox.com/exports/EXP-2025-001.pdf', 1, 
          '${nowTimestamp}', '${nowTimestamp}'
        ),
        (
          1002, 'Import License', 'IMP-2025-045', 
          '${pastDate15}', '${futureDate180}', 'Customs Authority', 
          'Medium', 'Pending', 'Import', 
          'Pending final verification from customs authority.', 'https://docs.averox.com/imports/IMP-2025-045.pdf', 1, 
          '${nowTimestamp}', '${nowTimestamp}'
        ),
        (
          1003, 'Certificate of Origin', 'COO-2025-108', 
          '${pastDate5}', '${futureDate45}', 'Chamber of Commerce', 
          'Low', 'Rejected', 'Export', 
          'Document rejected due to incorrect country classification.', 'https://docs.averox.com/certificates/COO-2025-108.pdf', 1, 
          '${nowTimestamp}', '${nowTimestamp}'
        )
      `);
      
      // Fetch the newly inserted data
      const result = await db.execute(`SELECT * FROM shipment_compliance ORDER BY id DESC`);
      const newShipments = result.rows;
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
    // Create a schema based on our actual database columns
    const shipmentComplianceSchema = z.object({
      shipment_id: z.number(),
      document_type: z.string(),
      document_number: z.string().optional(),
      issue_date: z.string().or(z.date()).optional(), // Accept string or date format
      expiry_date: z.string().or(z.date()).optional(), // Accept string or date format
      issuing_authority: z.string().optional(),
      compliance_level: z.enum(['High', 'Medium', 'Low']),
      document_status: z.enum(['Required', 'Submitted', 'Verified', 'Pending', 'Rejected']),
      shipment_type: z.enum(['Import', 'Export', 'Domestic', 'Transit']),
      notes: z.string().optional(),
      digital_copy_url: z.string().optional()
    });
    
    const validatedData = shipmentComplianceSchema.parse(req.body);
    
    // Format dates in the expected format for the database
    const formatDate = (date: string | Date | undefined) => {
      if (!date) return null;
      return date instanceof Date ? date.toISOString().split('T')[0] : date;
    };
    
    const now = new Date().toISOString();
    
    // Build the SQL insert with properly formatted values
    const result = await db.execute(`
      INSERT INTO shipment_compliance (
        shipment_id, document_type, document_number, 
        issue_date, expiry_date, issuing_authority, 
        compliance_level, document_status, shipment_type, 
        notes, digital_copy_url, created_by, 
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      ) RETURNING *
    `, [
      validatedData.shipment_id,
      validatedData.document_type,
      validatedData.document_number || null,
      formatDate(validatedData.issue_date),
      formatDate(validatedData.expiry_date),
      validatedData.issuing_authority || null,
      validatedData.compliance_level,
      validatedData.document_status,
      validatedData.shipment_type,
      validatedData.notes || null,
      validatedData.digital_copy_url || null,
      req.user?.id || 1,
      now,
      now
    ]);
    
    // Return the newly created record
    res.status(201).json(result.rows[0]);
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
    
    // Use direct SQL to avoid schema mismatches
    const result = await db.execute(`
      SELECT * FROM shipment_compliance WHERE id = $1
    `, [id]);
    
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Shipment compliance record not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching shipment compliance record:', error);
    res.status(500).json({ error: 'Failed to fetch shipment compliance record' });
  }
});

// Update shipment compliance record
router.put('/shipment-compliance/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Create a schema for updates based on our actual database columns
    const shipmentComplianceUpdateSchema = z.object({
      shipment_id: z.number().optional(),
      document_type: z.string().optional(),
      document_number: z.string().optional(),
      issue_date: z.string().or(z.date()).optional(), // Accept string or date format
      expiry_date: z.string().or(z.date()).optional(), // Accept string or date format
      issuing_authority: z.string().optional(),
      compliance_level: z.enum(['High', 'Medium', 'Low']).optional(),
      document_status: z.enum(['Required', 'Submitted', 'Verified', 'Pending', 'Rejected']).optional(),
      shipment_type: z.enum(['Import', 'Export', 'Domestic', 'Transit']).optional(),
      notes: z.string().optional(),
      digital_copy_url: z.string().optional()
    });
    
    const validatedData = shipmentComplianceUpdateSchema.parse(req.body);
    
    // Format dates in the expected format for the database
    const formatDate = (date: string | Date | undefined) => {
      if (!date) return null;
      return date instanceof Date ? date.toISOString().split('T')[0] : date;
    };
    
    // First check if the record exists
    const checkResult = await db.execute(`
      SELECT id FROM shipment_compliance WHERE id = $1
    `, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Shipment compliance record not found' });
    }
    
    // Build the update SQL query dynamically based on provided fields
    let updateFields = [];
    let params = [];
    let paramIndex = 1;
    
    if (validatedData.shipment_id !== undefined) {
      updateFields.push(`shipment_id = $${paramIndex++}`);
      params.push(validatedData.shipment_id);
    }
    
    if (validatedData.document_type !== undefined) {
      updateFields.push(`document_type = $${paramIndex++}`);
      params.push(validatedData.document_type);
    }
    
    if (validatedData.document_number !== undefined) {
      updateFields.push(`document_number = $${paramIndex++}`);
      params.push(validatedData.document_number);
    }
    
    if (validatedData.issue_date !== undefined) {
      updateFields.push(`issue_date = $${paramIndex++}`);
      params.push(formatDate(validatedData.issue_date));
    }
    
    if (validatedData.expiry_date !== undefined) {
      updateFields.push(`expiry_date = $${paramIndex++}`);
      params.push(formatDate(validatedData.expiry_date));
    }
    
    if (validatedData.issuing_authority !== undefined) {
      updateFields.push(`issuing_authority = $${paramIndex++}`);
      params.push(validatedData.issuing_authority);
    }
    
    if (validatedData.compliance_level !== undefined) {
      updateFields.push(`compliance_level = $${paramIndex++}`);
      params.push(validatedData.compliance_level);
    }
    
    if (validatedData.document_status !== undefined) {
      updateFields.push(`document_status = $${paramIndex++}`);
      params.push(validatedData.document_status);
    }
    
    if (validatedData.shipment_type !== undefined) {
      updateFields.push(`shipment_type = $${paramIndex++}`);
      params.push(validatedData.shipment_type);
    }
    
    if (validatedData.notes !== undefined) {
      updateFields.push(`notes = $${paramIndex++}`);
      params.push(validatedData.notes);
    }
    
    if (validatedData.digital_copy_url !== undefined) {
      updateFields.push(`digital_copy_url = $${paramIndex++}`);
      params.push(validatedData.digital_copy_url);
    }
    
    // Always update the updated_at timestamp
    updateFields.push(`updated_at = $${paramIndex++}`);
    params.push(new Date().toISOString());
    
    // Add ID as the last parameter
    params.push(Number(id));
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    // Execute the update query
    const result = await db.execute(`
      UPDATE shipment_compliance
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, params);
    
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Shipment compliance record not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating shipment compliance record:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to update shipment compliance record' });
    }
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
    const { productId, period } = req.query;
    
    // Get forecast data from the database
    let query = db.select().from(materialForecasts);
    
    if (productId) {
      query = query.where(eq(materialForecasts.productId, Number(productId)));
    }
    
    // Default to last 6 months if not specified
    const forecastPeriod = period ? Number(period) : 6;
    
    // Get the raw forecast data
    const forecasts = await query.orderBy(materialForecasts.forecastDate);
    
    if (forecasts.length === 0) {
      // If no forecasts exist in the database yet, create initial data
      const today = new Date();
      const baseQuantity = 100 + Math.floor(Math.random() * 50); // Random starting point
      
      const initialForecasts = [];
      for (let i = 0; i < 6; i++) {
        const forecastDate = new Date(today);
        forecastDate.setMonth(today.getMonth() - 6 + i);
        
        // Create some variation in the data with slight increases
        const forecastQuantity = baseQuantity + (i * 10) + Math.floor(Math.random() * 20 - 10);
        const actualQuantity = forecastQuantity + Math.floor(Math.random() * 20 - 10); // Slight random variation from forecast
        
        const forecast = {
          product_id: productId ? Number(productId) : 1,
          forecast_date: forecastDate,
          forecast_quantity: forecastQuantity,
          actual_quantity: actualQuantity,
          forecast_method: "TimeSeries",
          confidence_level: 0.85 + (Math.random() * 0.1),
          created_by: 1,
          created_at: new Date()
        };
        
        initialForecasts.push(forecast);
        await db.insert(materialForecasts).values(forecast);
      }
      
      // Also add future forecasts
      for (let i = 0; i < 6; i++) {
        const forecastDate = new Date(today);
        forecastDate.setMonth(today.getMonth() + i);
        
        // Future forecasts have an upward trend with some variation
        const forecastQuantity = baseQuantity + ((i + 6) * 10) + Math.floor(Math.random() * 20 - 10);
        
        const forecast = {
          product_id: productId ? Number(productId) : 1,
          forecast_date: forecastDate,
          forecast_quantity: forecastQuantity,
          actual_quantity: null, // Future forecasts don't have actuals yet
          forecast_method: "TimeSeries",
          confidence_level: 0.80 - (i * 0.05), // Confidence decreases the further into the future
          created_by: 1,
          created_at: new Date()
        };
        
        initialForecasts.push(forecast);
        await db.insert(materialForecasts).values(forecast);
      }
      
      // Fetch the newly inserted data
      const newForecasts = await db.select().from(materialForecasts)
        .orderBy(materialForecasts.forecastDate);
      
      // Process the forecasts into the expected format
      const formattedForecasts = formatForecasts(newForecasts);
      res.json(formattedForecasts);
    } else {
      // Process the existing forecasts into the expected format
      const formattedForecasts = formatForecasts(forecasts);
      res.json(formattedForecasts);
    }
  } catch (error) {
    console.error('Error calculating MRP forecasts:', error);
    res.status(500).json({ error: 'Failed to calculate MRP forecasts' });
  }
});

// Helper function to format forecasts into the expected response format
function formatForecasts(forecasts) {
  return forecasts.map(forecast => {
    const date = new Date(forecast.forecastDate);
    return {
      month: date.toLocaleString('default', { month: 'short' }),
      year: date.getFullYear(),
      forecasted: forecast.forecastQuantity,
      actual: forecast.actualQuantity,
      method: forecast.forecastMethod,
      confidence: Math.round(forecast.confidenceLevel * 100) / 100,
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
    };
  });
}

// Get material requirements
router.get('/material-requirements', async (req: Request, res: Response) => {
  try {
    const { materialId, mrpRunId } = req.query;
    
    // Get material requirements from the database
    let query = db.select().from(materialRequirements);
    
    if (materialId) {
      query = query.where(eq(materialRequirements.materialId, Number(materialId)));
    }
    
    if (mrpRunId) {
      query = query.where(eq(materialRequirements.mrpRunId, Number(mrpRunId)));
    }
    
    const requirements = await query.orderBy(desc(materialRequirements.createdAt));
    
    if (requirements.length === 0) {
      // If no requirements exist in the database yet, create initial data
      const materials = [
        {
          material_id: 1,
          mrp_run_id: 1,
          material_name: "Raw Material A",
          material_code: "RM-A",
          current_stock: 250,
          safety_stock: 100,
          required_quantity: 400,
          order_point: 150,
          expected_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          status: "Sufficient", 
          created_by: 1,
          created_at: new Date(),
          notes: "Regular supplier with reliable delivery times"
        },
        {
          material_id: 2,
          mrp_run_id: 1,
          material_name: "Component B",
          material_code: "RM-B",
          current_stock: 120,
          safety_stock: 75,
          required_quantity: 300,
          order_point: 100,
          expected_delivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          status: "Low",
          created_by: 1,
          created_at: new Date(),
          notes: "International supplier with longer lead times"
        },
        {
          material_id: 3,
          mrp_run_id: 1,
          material_name: "Semifinished C",
          material_code: "RM-C",
          current_stock: 30,
          safety_stock: 50,
          required_quantity: 150,
          order_point: 60,
          expected_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          status: "Critical",
          created_by: 1,
          created_at: new Date(),
          notes: "Expedited shipping requested"
        }
      ];
      
      for (const material of materials) {
        await db.insert(materialRequirements).values(material);
      }
      
      // Fetch the newly inserted data
      const newRequirements = await db.select().from(materialRequirements)
        .orderBy(desc(materialRequirements.createdAt));
      
      // Process the requirements into the expected format
      const formattedRequirements = formatRequirements(newRequirements);
      res.json(formattedRequirements);
    } else {
      // Process the existing requirements into the expected format
      const formattedRequirements = formatRequirements(requirements);
      res.json(formattedRequirements);
    }
  } catch (error) {
    console.error('Error calculating material requirements:', error);
    res.status(500).json({ error: 'Failed to calculate material requirements' });
  }
});

// Helper function to format material requirements into the expected response format
function formatRequirements(requirements) {
  return requirements.map(req => {
    const currentStock = req.currentStock;
    const safetyStock = req.safetyStock;
    const required = req.requiredQuantity;
    const orderPoint = req.orderPoint;
    
    // Calculate available for planning
    const availableForPlanning = Math.max(0, currentStock - safetyStock);
    
    // Calculate net requirements
    const netRequirements = Math.max(0, required - currentStock);
    
    // Calculate stock coverage (in days) based on daily usage
    const dailyUsage = required / 30; // Assuming monthly requirements
    const stockCoverage = dailyUsage > 0 ? Math.floor(currentStock / dailyUsage) : 999;
    
    // Calculate suggested order quantity
    const suggestedOrderQty = netRequirements > 0 ? Math.max(netRequirements, orderPoint - currentStock) : 0;
    
    return {
      id: req.materialCode || `MR-${req.materialId}`,
      materialId: req.materialId,
      name: req.materialName,
      currentStock: currentStock,
      safetyStock: safetyStock,
      availableForPlanning: availableForPlanning,
      required: required,
      netRequirements: netRequirements,
      orderPoint: orderPoint,
      stockCoverage: stockCoverage,
      suggestedOrderQty: suggestedOrderQty,
      status: req.status,
      expectedDelivery: req.expectedDelivery ? new Date(req.expectedDelivery).toISOString().split('T')[0] : null,
      notes: req.notes
    };
  });
}

export default router;