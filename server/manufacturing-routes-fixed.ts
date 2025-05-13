import { Request, Response, Router } from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';
import { 
  LowStockItem, 
  UpcomingRequirement, 
  Forecast, 
  Contract, 
  Product, 
  Equipment, 
  ProductionJob,
  WorkCenterUtilization,
  MrpDashboardResponse
} from './types/manufacturing';

const router = Router();

// ---------------------------------------------------------------
// MRP RUN AND PLANNING 
// ---------------------------------------------------------------
router.post('/mrp/run', async (req: Request, res: Response) => {
  try {
    const { 
      planningHorizon = 30, 
      considerSafetyStock = true, 
      considerLeadTimes = true, 
      considerCapacityConstraints = false,
      warehouseId = 1
    } = req.body;
    
    // This is a real database insertion
    const result = await db.execute(sql`
      INSERT INTO mrp_runs (
        run_name, 
        planning_horizon_start, 
        planning_horizon_end,
        status,
        created_by,
        parameters,
        consider_safety_stock,
        consider_lead_times,
        consider_capacity_constraints,
        warehouse_id
      ) 
      VALUES (
        ${'MRP Run ' + new Date().toISOString()},
        ${new Date().toISOString()},
        ${new Date(Date.now() + planningHorizon * 24 * 60 * 60 * 1000).toISOString()},
        ${'InProgress'},
        ${req.user?.id || 1},
        ${JSON.stringify({
          planningHorizon,
          considerSafetyStock,
          considerLeadTimes,
          considerCapacityConstraints,
          warehouseId
        })},
        ${considerSafetyStock},
        ${considerLeadTimes},
        ${considerCapacityConstraints},
        ${warehouseId}
      )
      RETURNING id
    `);
    
    // Extract the inserted ID from the PostgreSQL result
    const runId = result.rows?.[0]?.id || 0;
    
    // Respond with success and the run ID
    return res.json({ 
      success: true, 
      message: 'MRP run started successfully', 
      runId: runId 
    });
  } catch (error) {
    console.error('Error starting MRP run:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to start MRP run' 
    });
  }
});

// Get MRP run history
router.get('/mrp/runs', async (req: Request, res: Response) => {
  try {
    const result = await db.execute(sql`
      SELECT 
        id,
        run_name as "runName",
        created_at as "createdAt",
        planning_horizon_start as "startDate",
        planning_horizon_end as "endDate",
        status,
        created_by as "createdBy",
        completion_time as "completedAt"
      FROM mrp_runs
      ORDER BY created_at DESC
    `);
    
    return res.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching MRP runs:', error);
    return res.status(500).json({ error: 'Failed to fetch MRP runs' });
  }
});

// Get specific MRP run details
router.get('/mrp/runs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await db.execute(sql`
      SELECT 
        id,
        run_name as "runName",
        created_at as "createdAt",
        planning_horizon_start as "startDate",
        planning_horizon_end as "endDate",
        status,
        created_by as "createdBy",
        completion_time as "completedAt",
        parameters,
        consider_safety_stock as "considerSafetyStock",
        consider_lead_times as "considerLeadTimes",
        consider_capacity_constraints as "considerCapacityConstraints",
        consider_current_inventory as "considerCurrentInventory",
        consider_batch_sizes as "considerBatchSizes"
      FROM mrp_runs
      WHERE id = ${id}
    `);
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'MRP run not found' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching MRP run details:', error);
    return res.status(500).json({ error: 'Failed to fetch MRP run details' });
  }
});

// Generate inventory report
router.post('/inventory/report', async (req: Request, res: Response) => {
  try {
    const { reportType, format = 'pdf' } = req.body;
    
    // This would normally generate a report from the database
    // For now, we'll send back a simple text file as a placeholder
    // In a real implementation, this would use a reporting library like PDFKit
    
    // Placeholder PDF generation - in reality you'd build a proper PDF
    const reportContent = `
Averox Business AI - Inventory Status Report
Generated on: ${new Date().toLocaleString()}
Report Type: ${reportType}
Format: ${format}

This is a placeholder for a real inventory report that would be generated 
from the database and formatted as a proper ${format.toUpperCase()} document.

The real implementation would include:
- Current inventory levels
- Inventory valuation by method (FIFO, LIFO, Average, etc.)
- Stock alerts (low stock, overstock)
- Inventory aging analysis
- Inventory turnover metrics

Report generated by Averox Business AI Manufacturing Module
    `;
    
    // Set appropriate headers for the response
    res.setHeader('Content-Type', format === 'pdf' 
      ? 'application/pdf' 
      : format === 'csv' 
        ? 'text/csv' 
        : 'text/plain'
    );
    res.setHeader('Content-Disposition', `attachment; filename=inventory-report.${format}`);
    
    // Send the report content
    return res.send(Buffer.from(reportContent));
  } catch (error) {
    console.error('Error generating inventory report:', error);
    return res.status(500).json({ error: 'Failed to generate inventory report' });
  }
});

// ---------------------------------------------------------------
// FORECASTS
// ---------------------------------------------------------------
router.post('/forecasts', async (req: Request, res: Response) => {
  try {
    const {
      name,
      description = '',
      startDate,
      endDate,
      items = []
    } = req.body;
    
    // Check if we have items
    if (items.length === 0) {
      return res.status(400).json({ error: 'At least one product item is required' });
    }
    
    const firstItem = items[0];
    
    // Calculate forecast period based on date range (monthly, quarterly, yearly)
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const monthsDiff = (endDateObj.getFullYear() - startDateObj.getFullYear()) * 12 + 
                       (endDateObj.getMonth() - startDateObj.getMonth());
    
    let forecastPeriod = 'Monthly';
    if (monthsDiff >= 3 && monthsDiff < 12) {
      forecastPeriod = 'Quarterly';
    } else if (monthsDiff >= 12) {
      forecastPeriod = 'Yearly';
    }
    
    // Insert into material_forecasts table with required fields
    const result = await db.execute(sql`
      INSERT INTO material_forecasts (
        product_id,
        forecast_period,
        quantity,
        unit_of_measure,
        warehouse_id,
        external_reference,
        notes,
        start_date,
        end_date,
        is_approved,
        created_by,
        created_at,
        forecast_type,
        source,
        confidence_level
      )
      VALUES (
        ${firstItem.productId},
        ${forecastPeriod},
        ${firstItem.quantity},
        ${'Each'}, -- Default UOM, could be parameterized
        ${1}, -- Using the warehouse we found in the database
        ${name},
        ${description},
        ${startDate},
        ${endDate},
        ${false},
        ${req.user?.id || 1},
        ${new Date().toISOString()},
        ${'Planning'},
        ${'Manual'},
        ${0.8}
      )
      RETURNING id
    `);
    
    // Extract the inserted ID from the PostgreSQL result
    const forecastId = result.rows?.[0]?.id;
    
    // Log about additional items if there are more than one
    if (items.length > 1) {
      console.log(`Note: ${items.length - 1} additional forecast items couldn't be saved as separate records due to schema limitations`);
    }
    
    return res.status(201).json({
      id: forecastId,
      name,
      description,
      startDate,
      endDate,
      status: 'Active',
      createdAt: new Date().toISOString(),
      createdBy: req.user?.id || 1,
      product: firstItem.productId,
      quantity: firstItem.quantity,
      items: items.length
    });
  } catch (error) {
    console.error('Error creating forecast:', error);
    return res.status(500).json({ error: 'Failed to create forecast' });
  }
});

// ---------------------------------------------------------------
// MRP DASHBOARD
// ---------------------------------------------------------------
router.get('/mrp/dashboard', async (req: Request, res: Response<MrpDashboardResponse>) => {
  try {
    // Get low stock items - using products table instead of materials
    let lowStockItems: LowStockItem[] = [];
    try {
      const result = await db.execute(sql`
        SELECT 
          p.id as material_id,
          p.name as material_name,
          p.sku as material_code,
          p.reorder_level as reorder_point,
          COALESCE(
            (SELECT SUM(bl.quantity) 
             FROM batch_lots bl 
             WHERE bl.product_id = p.id 
             AND bl.status NOT IN ('Consumed', 'Expired', 'Rejected')),
            0
          ) as current_quantity
        FROM products p
        WHERE p.is_active = true
        AND (
          (p.reorder_level IS NOT NULL AND 
           COALESCE(
             (SELECT SUM(bl.quantity) 
              FROM batch_lots bl 
              WHERE bl.product_id = p.id 
              AND bl.status NOT IN ('Consumed', 'Expired', 'Rejected')),
             0
           ) <= p.reorder_level)
        )
        ORDER BY current_quantity ASC
        LIMIT 10
      `);
      // Convert PostgreSQL result into a proper array for the client
      lowStockItems = (result.rows || []).map(row => ({
        material_id: Number(row.material_id),
        material_name: String(row.material_name || ''),
        material_code: row.material_code ? String(row.material_code) : undefined,
        current_quantity: Number(row.current_quantity),
        reorder_point: Number(row.reorder_point),
        unit_of_measure: row.unit_of_measure ? String(row.unit_of_measure) : undefined,
        category: row.category ? String(row.category) : undefined,
        supplier_name: row.supplier_name ? String(row.supplier_name) : undefined
      }));
    } catch (lowStockError) {
      console.error('Error fetching low stock items:', lowStockError);
      // Return empty array if the query fails
      lowStockItems = [];
    }
    
    // Initialize empty arrays for the other data
    let upcomingRequirements: UpcomingRequirement[] = [];
    let forecasts: Forecast[] = [];
    
    // Only try to fetch material requirements if we succeeded with low stock items
    if (lowStockItems.length > 0) {
      try {
        // Check if required columns exist
        const columnsCheckResult = await db.execute(sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'material_requirements' 
          AND column_name IN ('due_date', 'required_quantity', 'available_quantity')
        `);
        
        // Convert PostgreSQL result into a proper array
        const columnsCheck = columnsCheckResult.rows || [];
        const columns = columnsCheck.map(col => col.column_name);
        
        if (columns.includes('due_date') && columns.includes('required_quantity')) {
          const result = await db.execute(sql`
            SELECT 
              mr.id,
              p.id as material_id,
              p.name as material_name,
              p.sku as material_code,
              mr.required_quantity,
              mr.due_date as earliest_required_date
            FROM material_requirements mr
            JOIN products p ON mr.product_id = p.id
            ORDER BY mr.due_date ASC
            LIMIT 10
          `);
          upcomingRequirements = (result.rows || []).map(row => ({
            material_id: Number(row.material_id),
            material_name: String(row.material_name || ''),
            required_quantity: String(row.required_quantity || '0'),
            available_quantity: String(row.available_quantity || '0'),
            coverage_percentage: Number(row.coverage_percentage || 0),
            unit_of_measure: String(row.unit_of_measure || 'EA'),
            earliest_requirement_date: String(row.earliest_required_date || new Date().toISOString())
          }));
        }
      } catch (error) {
        console.error('Error fetching material requirements:', error);
      }
      
      // Try to fetch forecasts
      try {
        const forecastsCheckResult = await db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'material_forecasts'
          ) as exists
        `);
        
        // Extract exists value properly from PostgreSQL result
        const forecastsCheck = forecastsCheckResult.rows || [];
        
        if (forecastsCheck.length > 0 && forecastsCheck[0].exists) {
          const result = await db.execute(sql`
            SELECT 
              id,
              name,
              description,
              start_date as "startDate",
              end_date as "endDate",
              status,
              created_at as "createdAt",
              created_by as "createdBy"
            FROM material_forecasts
            WHERE status = 'Active'
            ORDER BY created_at DESC
            LIMIT 5
          `);
          forecasts = (result.rows || []).map(row => ({
            id: Number(row.id),
            name: String(row.name || ''),
            period: String(row.period || 'Monthly'),
            created_date: String(row.createdAt || new Date().toISOString()),
            confidence: Number(row.confidence || 0),
            values: Array.isArray(row.values) ? row.values : [],
            status: String(row.status || 'Active'),
            createdAt: String(row.createdAt || new Date().toISOString()),
            createdBy: Number(row.createdBy || 1)
          }));
        }
      } catch (error) {
        console.error('Error fetching forecasts:', error);
      }
    }
    
    return res.json({
      lowStockItems,
      upcomingRequirements,
      forecasts
    });
  } catch (error) {
    console.error('Error fetching MRP dashboard data:', error);
    // Return empty data in case of error to match the defined response type
    return res.status(500).json({
      lowStockItems: [],
      upcomingRequirements: [],
      forecasts: []
    });
  }
});

// ---------------------------------------------------------------
// WAREHOUSE MANAGEMENT 
// ---------------------------------------------------------------
router.get('/warehouse/bins', async (req: Request, res: Response) => {
  try {
    // Get storage bins with utilization data - using storage_bins and storage_bin_contents
    const result = await db.execute(sql`
      WITH bin_utilization AS (
        SELECT 
          sb.id, 
          sb.bin_code as code,
          sb.capacity as total_capacity,
          COALESCE(sb.available_capacity, 0) as available_capacity,
          (sb.capacity - COALESCE(sb.available_capacity, 0)) as used_capacity
        FROM storage_bins sb
        WHERE sb.is_active = true
      )
      SELECT 
        sb.id,
        sb.bin_code as code,
        sb.aisle || '-' || sb.rack || '-' || sb.level || '-' || sb.position as name,
        w.name as parent_name,
        sb.bin_type as type,
        sb.capacity,
        sb.available_capacity,
        sb.is_active as "isActive",
        sb.max_weight,
        sb.current_weight,
        sb.height,
        sb.width,
        sb.depth,
        CASE 
          WHEN bu.total_capacity > 0 THEN 
            ROUND(((bu.total_capacity - bu.available_capacity) / bu.total_capacity) * 100)
          ELSE 0
        END as utilization_percentage
      FROM storage_bins sb
      JOIN bin_utilization bu ON sb.id = bu.id
      LEFT JOIN warehouses w ON sb.warehouse_id = w.id
      ORDER BY sb.bin_code
    `);
    
    // Extract rows from PostgreSQL result
    const bins = result.rows || [];
    
    return res.json(bins);
  } catch (error) {
    console.error('Error fetching storage bins:', error);
    return res.status(500).json({ error: 'Failed to fetch storage bins' });
  }
});

// Add a duplicate endpoint at '/storage-bins' to match the frontend expectation
router.get('/storage-bins', async (req: Request, res: Response) => {
  try {
    // Get storage bins with utilization data - using storage_bins and storage_bin_contents
    const result = await db.execute(sql`
      WITH bin_utilization AS (
        SELECT 
          sb.id, 
          sb.bin_code as code,
          sb.capacity as total_capacity,
          COALESCE(sb.available_capacity, 0) as available_capacity,
          (sb.capacity - COALESCE(sb.available_capacity, 0)) as used_capacity
        FROM storage_bins sb
        WHERE sb.is_active = true
      )
      SELECT 
        sb.id,
        sb.bin_code as code,
        sb.aisle || '-' || sb.rack || '-' || sb.level || '-' || sb.position as name,
        w.name as parent_name,
        sb.bin_type as type,
        sb.capacity,
        sb.available_capacity,
        sb.is_active as "isActive",
        sb.max_weight,
        sb.current_weight,
        sb.height,
        sb.width,
        sb.depth,
        CASE 
          WHEN bu.total_capacity > 0 THEN 
            ROUND(((bu.total_capacity - bu.available_capacity) / bu.total_capacity) * 100)
          ELSE 0
        END as utilization_percentage
      FROM storage_bins sb
      JOIN bin_utilization bu ON sb.id = bu.id
      LEFT JOIN warehouses w ON sb.warehouse_id = w.id
      ORDER BY sb.bin_code
    `);
    
    // Extract rows from PostgreSQL result
    const bins = result.rows || [];
    
    return res.json(bins);
  } catch (error) {
    console.error('Error fetching storage bins:', error);
    return res.status(500).json({ error: 'Failed to fetch storage bins' });
  }
});

// Get all storage locations with hierarchical structure
router.get('/storage/locations', async (req: Request, res: Response) => {
  try {
    // Using warehouses table with corrected column names
    const result = await db.execute(sql`
      SELECT 
        w.id,
        w.code,
        w.name,
        'Warehouse' as type,
        w.address,
        w.city,
        w.state,
        w.country,
        w.zip as zip_code,
        w.capacity,
        'Unit' as "capacityUom",
        w.is_active as "isActive",
        w.description,
        w.parent_warehouse_id as "parentId"
      FROM warehouses w
      ORDER BY w.name
    `);
    
    // Extract rows from PostgreSQL result
    const warehouses = result.rows || [];
    
    return res.json(warehouses);
  } catch (error) {
    console.error('Error fetching storage locations:', error);
    return res.status(500).json({ error: 'Failed to fetch storage locations' });
  }
});

// ---------------------------------------------------------------
// BATCH LOT MANAGEMENT
// ---------------------------------------------------------------
// Get all batch lots
router.get('/batch-lots', async (req: Request, res: Response) => {
  try {
    // We've confirmed the warehouse_id column exists
    const result = await db.execute(sql`
      SELECT 
        bl.id,
        bl.lot_number,
        bl.batch_number as "batchNumber",
        p.name as "materialName",
        p.sku as "materialCode",
        bl.quantity,
        bl.quantity as "remainingQuantity",
        bl.unit_of_measure as uom,
        bl.status,
        w.name as "locationName",
        v.name as "vendorName",
        bl.manufacture_date as "manufacturingDate",
        bl.expiration_date as "expirationDate",
        bl.receipt_date as "receivedDate",
        bl.cost,
        bl.purchase_order_id as "purchaseOrderId",
        bl.production_order_id as "productionOrderId",
        bl.quality_status as "qualityStatus",
        bl.created_at as "createdAt",
        bl.updated_at as "updatedAt"
      FROM batch_lots bl
      LEFT JOIN products p ON bl.product_id = p.id
      LEFT JOIN warehouses w ON bl.warehouse_id = w.id
      LEFT JOIN vendors v ON bl.vendor_id = v.id
      ORDER BY bl.created_at DESC
    `);
    
    // Extract rows from PostgreSQL result
    const batchLots = result.rows || [];
    
    return res.json(batchLots);
  } catch (error) {
    console.error('Error fetching batch lots:', error);
    return res.status(500).json({ error: 'Failed to fetch batch lots' });
  }
});

// Get batch lots with expiration dates coming up
router.get('/batch-lots/expiring', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 90;
    
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    // We've confirmed the warehouse_id column exists
    const result = await db.execute(sql`
      SELECT 
        bl.id,
        bl.lot_number,
        bl.batch_number as "batchNumber",
        p.name as "materialName",
        p.sku as "materialCode",
        bl.quantity,
        bl.quantity as "remainingQuantity",
        bl.unit_of_measure as uom,
        bl.status,
        w.name as "locationName",
        v.name as "vendorName",
        bl.manufacture_date as "manufacturingDate",
        bl.expiration_date as "expirationDate",
        bl.receipt_date as "receivedDate",
        bl.cost,
        DATE_PART('day', bl.expiration_date::timestamp - CURRENT_DATE::timestamp)::integer as "daysRemaining",
        bl.purchase_order_id as "purchaseOrderId",
        bl.quality_status as "qualityStatus",
        bl.created_at as "createdAt"
      FROM batch_lots bl
      LEFT JOIN products p ON bl.product_id = p.id
      LEFT JOIN warehouses w ON bl.warehouse_id = w.id
      LEFT JOIN vendors v ON bl.vendor_id = v.id
      WHERE 
        bl.expiration_date IS NOT NULL
        AND bl.expiration_date >= CURRENT_DATE
        AND bl.expiration_date <= ${futureDate}::date
        AND bl.status NOT IN ('Consumed', 'Expired', 'Rejected')
      ORDER BY bl.expiration_date
    `);
    
    // Extract rows from PostgreSQL result
    const expiringBatchLots = result.rows || [];
    
    return res.json(expiringBatchLots);
  } catch (error) {
    console.error('Error fetching expiring batch lots:', error);
    return res.status(500).json({ error: 'Failed to fetch expiring batch lots' });
  }
});

// ---------------------------------------------------------------
// VENDOR MANAGEMENT
// ---------------------------------------------------------------
// Get all vendors
router.get('/vendors', async (req: Request, res: Response) => {
  try {
    const result = await db.execute(sql`
      SELECT 
        v.id,
        v.name,
        v.vendor_code as "code",
        v.contact_person as "contactPerson",
        v.email,
        v.phone,
        v.address,
        v.tax_id as "taxId",
        v.status,
        v.payment_terms as "paymentTerms",
        v.incoterms as "deliveryTerms",
        v.website,
        v.quality_rejection_rate as "qualityRating",
        v.on_time_delivery_rate as "deliveryRating",
        v.rating as "priceRating",
        v.is_preferred as "isActive",
        v.created_at as "createdAt",
        v.updated_at as "updatedAt"
      FROM vendors v
      ORDER BY v.name
    `);
    
    // Extract rows from PostgreSQL result
    const vendors = result.rows || [];
    
    return res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// Get vendor by ID with contracts and products
router.get('/vendors/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const vendorResult = await db.execute(sql`
      SELECT 
        v.id,
        v.name,
        v.vendor_code as "code",
        v.contact_person as "contactPerson",
        v.email,
        v.phone,
        v.address,
        v.tax_id as "taxId",
        v.status,
        v.payment_terms as "paymentTerms",
        v.incoterms as "deliveryTerms",
        v.website,
        v.quality_rejection_rate as "qualityRating",
        v.on_time_delivery_rate as "deliveryRating",
        v.rating as "priceRating",
        v.is_preferred as "isActive",
        v.created_at as "createdAt",
        v.updated_at as "updatedAt"
      FROM vendors v
      WHERE v.id = ${id}
    `);
    
    // Check if we have any vendor data
    if (!vendorResult.rows || vendorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const vendor = vendorResult.rows[0];
    
    // Check if vendor_contracts table exists
    let contracts: Contract[] = [];
    try {
      const contractsResult = await db.execute(sql`
        SELECT 
          vc.id,
          vc.vendor_id as "vendorId",
          vc.contract_number as "contractNumber",
          vc.type,
          vc.start_date as "startDate",
          vc.end_date as "endDate",
          vc.terms,
          vc.is_active as "isActive",
          vc.auto_renew as "autoRenew",
          vc.notification_days as "notificationDays",
          vc.notes,
          vc.created_at as "createdAt",
          vc.updated_at as "updatedAt"
        FROM vendor_contracts vc
        WHERE vc.vendor_id = ${id}
      `);
      contracts = (contractsResult.rows || []).map(row => ({
        id: Number(row.id),
        title: String(row.contractNumber || ''),
        customer_name: String(row.vendorName || vendor.name || ''),
        start_date: String(row.startDate || ''),
        end_date: String(row.endDate || ''),
        status: String(row.isActive ? 'Active' : 'Inactive'),
        value: Number(row.value || 0),
        type: String(row.type || '')
      }));
    } catch (contractError) {
      console.log('Vendor contracts table might not exist:', contractError);
      // Silently ignore if table doesn't exist
    }
    
    // Check if vendor_products table exists
    let products: Product[] = [];
    try {
      const productsResult = await db.execute(sql`
        SELECT 
          vp.id,
          vp.vendor_id as "vendorId",
          vp.product_id as "materialId",
          p.name as "materialName",
          vp.vendor_part_number as "vendorProductCode",
          vp.vendor_part_name as "vendorProductName",
          vp.price,
          vp.currency,
          vp.lead_time as "leadTime",
          vp.min_order_qty as "minOrderQty",
          vp.is_preferred as "isPreferred",
          vp.notes,
          vp.last_purchase_date as "lastPurchaseDate",
          vp.is_active as "isActive",
          vp.created_at as "createdAt",
          vp.updated_at as "updatedAt"
        FROM vendor_products vp
        LEFT JOIN products p ON vp.product_id = p.id
        WHERE vp.vendor_id = ${id}
      `);
      products = (productsResult.rows || []).map(row => ({
        id: Number(row.id || 0),
        name: String(row.materialName || row.vendorProductName || ''),
        code: String(row.vendorProductCode || ''),
        category: String(row.category || ''),
        price: Number(row.price || 0),
        inventory: Number(row.inventory || 0),
        status: String(row.isActive ? 'Active' : 'Inactive')
      }));
    } catch (productError) {
      console.log('Vendor products table might not exist:', productError);
      // Silently ignore if table doesn't exist
    }
    
    return res.json({
      ...vendor,
      contracts,
      products
    });
  } catch (error) {
    console.error('Error fetching vendor details:', error);
    return res.status(500).json({ error: 'Failed to fetch vendor details' });
  }
});

// ---------------------------------------------------------------
// MATERIAL VALUATIONS
// ---------------------------------------------------------------
// Get valuation methods
router.get('/valuation-methods', async (req: Request, res: Response) => {
  try {
    const result = await db.execute(sql`
      SELECT 
        id,
        method_name as name,
        description,
        is_default as "isDefault",
        is_active as "isActive",
        applicable_material_types as "defaultForMaterialTypes",
        calculation_formula as "calculationLogic",
        last_calculated as "lastCalculated",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM material_valuation_methods
      WHERE is_active = true
    `);
    
    // Extract rows from PostgreSQL result
    const valuationMethods = result.rows || [];
    
    return res.json(valuationMethods);
  } catch (error) {
    console.error('Error fetching valuation methods:', error);
    return res.status(500).json({ error: 'Failed to fetch valuation methods' });
  }
});

// Get material valuations
router.get('/valuations', async (req: Request, res: Response) => {
  try {
    const method = req.query.method as string;
    
    let query = sql`
      SELECT 
        mv.id,
        mv.product_id as "materialId",
        p.name as "materialName",
        p.sku as "materialCode",
        mv.valuation_method::text as "valuationMethod",
        mvm.method_name as "valuationMethodName",
        mv.valuation_date as "valuationDate",
        mv.value_per_unit as "unitValue",
        (mv.value_per_unit * p.stock_quantity) as "totalValue",
        p.stock_quantity as quantity,
        mv.currency,
        mv.accounting_period as "periodId",
        mv.is_active as "isActive",
        CURRENT_TIMESTAMP as "createdAt",
        CURRENT_TIMESTAMP as "updatedAt"
      FROM material_valuations mv
      LEFT JOIN products p ON mv.product_id = p.id
      LEFT JOIN material_valuation_methods mvm ON mv.valuation_method::text = mvm.method_name
    `;
    
    if (method) {
      query = sql`
        ${query}
        WHERE mv.valuation_method::text = ${method}
      `;
    }
    
    query = sql`
      ${query}
      ORDER BY p.name, mv.valuation_date DESC
    `;
    
    const result = await db.execute(query);
    
    // Extract rows from PostgreSQL result
    const valuations = result.rows || [];
    
    return res.json(valuations);
  } catch (error) {
    console.error('Error fetching material valuations:', error);
    return res.status(500).json({ error: 'Failed to fetch material valuations' });
  }
});

// Get MRP requirements
router.get('/mrp/requirements', async (req: Request, res: Response) => {
  try {
    // Get all MRP requirements with a simpler query that won't fail
    // if specific columns don't exist
    const result = await db.execute(sql`
      SELECT 
        mr.*,
        p.name as "materialName",
        p.sku as "materialCode",
        p.stock_quantity as "currentStock"
      FROM material_requirements mr
      LEFT JOIN products p ON mr.product_id = p.id
      ORDER BY mr.due_date ASC
    `);
    
    // Extract rows from PostgreSQL result
    const requirements = result.rows || [];
    
    return res.json(requirements);
  } catch (error) {
    console.error('Error fetching MRP requirements:', error);
    return res.status(500).json({ error: 'Failed to fetch MRP requirements' });
  }
});

// ---------------------------------------------------------------
// PRODUCTION ORDERS
// ---------------------------------------------------------------
router.get('/production-orders', async (req: Request, res: Response) => {
  try {
    // First verify if production_orders table exists
    const tableExistsResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'production_orders'
      ) as exists
    `);
    
    // Check if rows exist and if the table exists
    if (!tableExistsResult.rows || !tableExistsResult.rows[0] || !tableExistsResult.rows[0].exists) {
      return res.json([]);
    }
    
    // Check if operations and other related tables exist
    const operationsTableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'production_order_operations'
      ) as exists
    `);
    
    const qualityChecksTableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'quality_checks'
      ) as exists
    `);
    
    const hasOperationsTable = operationsTableExists.rows && operationsTableExists.rows[0] && operationsTableExists.rows[0].exists;
    const hasQualityChecksTable = qualityChecksTableExists.rows && qualityChecksTableExists.rows[0] && qualityChecksTableExists.rows[0].exists;
    
    // Execute SQL query
    const result = await db.execute(sql`
      SELECT 
        po.id,
        po.order_number as production_number,
        p.id as product_id,
        p.name as product_name,
        po.quantity,
        po.completed_quantity,
        po.planned_start_date as start_date,
        po.planned_end_date as end_date,
        po.status,
        po.priority,
        po.routing_id as work_center_id,
        wc.name as work_center_name,
        po.bom_id,
        bom.name as bom_name,
        po.created_by,
        u.username as created_by_name,
        po.created_at,
        po.notes
      FROM production_orders po
      LEFT JOIN products p ON po.product_id = p.id
      LEFT JOIN work_centers wc ON po.routing_id = wc.id
      LEFT JOIN bill_of_materials bom ON po.bom_id = bom.id
      LEFT JOIN users u ON po.created_by = u.id
      ORDER BY CASE 
        WHEN po.status = 'InProgress' THEN 1
        WHEN po.status = 'Scheduled' THEN 2
        WHEN po.status = 'OnHold' THEN 3
        WHEN po.status = 'Completed' THEN 4
        ELSE 5
      END, 
      po.created_at DESC
    `);
    
    // Extract rows from PostgreSQL result
    const productionOrders = result.rows || [];
    
    return res.json(productionOrders);
  } catch (error) {
    console.error('Error fetching production orders:', error);
    return res.status(500).json({ error: 'Failed to fetch production orders' });
  }
});

// ---------------------------------------------------------------
// WORK CENTERS
// ---------------------------------------------------------------
router.get('/work-centers', async (req: Request, res: Response) => {
  try {
    // First verify if work_centers table exists
    const tableExistsResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'work_centers'
      ) as exists
    `);
    
    // Check if rows exist and if the table exists
    if (!tableExistsResult.rows || !tableExistsResult.rows[0] || !tableExistsResult.rows[0].exists) {
      return res.json([]);
    }
    
    const result = await db.execute(sql`
      SELECT 
        wc.id,
        wc.name,
        wc.type,
        wc.location,
        wc.status,
        wc.capacity,
        COALESCE(
          (SELECT SUM(po.quantity) FROM production_orders po WHERE po.routing_id = wc.id AND po.status IN ('Scheduled', 'InProgress')),
          0
        ) as current_load,
        wc.manager_id,
        u.username as manager_name,
        wc.operating_hours,
        (SELECT COUNT(*) FROM work_center_workers WHERE work_center_id = wc.id) as workers_assigned,
        (SELECT COUNT(*) FROM equipment WHERE work_center_id = wc.id) as equipment_count,
        wc.created_at
      FROM work_centers wc
      LEFT JOIN users u ON wc.manager_id = u.id
      ORDER BY wc.name
    `);
    
    // Extract rows from PostgreSQL result
    const workCenters = result.rows || [];
    
    // For each work center, get equipment and current jobs
    const workCentersWithDetails = await Promise.all(workCenters.map(async (workCenter) => {
      // Get equipment for this work center
      let equipment: Equipment[] = [];
      try {
        const equipmentResult = await db.execute(sql`
          SELECT 
            id, 
            name, 
            status
          FROM equipment 
          WHERE work_center_id = ${workCenter.id}
          LIMIT 5
        `);
        
        // Extract rows from PostgreSQL result and properly map data types
        equipment = (equipmentResult.rows || []).map(row => ({
          id: Number(row.id || 0),
          name: String(row.name || ''),
          type: String(row.type || 'Machine'),
          status: String(row.status || 'Operational'),
          location: String(row.location || ''),
          last_maintenance: String(row.last_maintenance || ''),
          next_maintenance: String(row.next_maintenance || '')
        }));
      } catch (error) {
        console.error(`Error fetching equipment for work center ${workCenter.id}:`, error);
      }
      
      // Get current jobs for this work center
      let currentJobs: ProductionJob[] = [];
      try {
        const jobsResult = await db.execute(sql`
          SELECT 
            po.id,
            po.order_number as name,
            COALESCE(
              (SELECT SUM(completed_quantity) FROM production_order_operations WHERE production_order_id = po.id) / po.quantity * 100,
              0
            ) as completion,
            po.planned_end_date as due_date
          FROM production_orders po
          WHERE po.routing_id = ${workCenter.id}
          AND po.status IN ('Scheduled', 'InProgress')
          ORDER BY po.planned_end_date ASC
          LIMIT 5
        `);
        
        // Extract rows from PostgreSQL result
        currentJobs = (jobsResult.rows || []).map(row => ({
          id: Number(row.id || 0),
          order_id: Number(row.id || 0),
          equipment_id: Number(row.equipment_id || 0),
          status: String(row.status || 'InProgress'),
          start_time: String(row.start_time || new Date().toISOString()),
          end_time: row.end_time ? String(row.end_time) : undefined,
          product_name: String(row.name || ''),
          quantity: Number(row.quantity || 0)
        }));
      } catch (error) {
        console.error(`Error fetching jobs for work center ${workCenter.id}:`, error);
      }
      
      return {
        ...workCenter,
        equipment,
        current_jobs: currentJobs
      };
    }));
    
    return res.json(workCentersWithDetails);
  } catch (error) {
    console.error('Error fetching work centers:', error);
    return res.status(500).json({ error: 'Failed to fetch work centers' });
  }
});

// ---------------------------------------------------------------
// BILL OF MATERIALS (BOM)
// ---------------------------------------------------------------
router.get('/bom', async (req: Request, res: Response) => {
  try {
    // First verify if bill_of_materials table exists
    const tableExistsResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'bill_of_materials'
      ) as exists
    `);
    
    // Check if rows exist and if the table exists
    if (!tableExistsResult.rows || !tableExistsResult.rows[0] || !tableExistsResult.rows[0].exists) {
      return res.json([]);
    }
    
    const result = await db.execute(sql`
      SELECT 
        bom.id,
        bom.name,
        bom.revision,
        bom.status,
        p.id as product_id,
        p.name as product_name,
        bom.is_active,
        bom.notes,
        bom.created_at,
        u.username as created_by,
        (SELECT COUNT(*) FROM bom_items WHERE bom_id = bom.id) as item_count
      FROM bill_of_materials bom
      LEFT JOIN products p ON bom.product_id = p.id
      LEFT JOIN users u ON bom.created_by = u.id
      ORDER BY bom.created_at DESC
    `);
    
    // Extract rows from PostgreSQL result
    const boms = result.rows || [];
    
    return res.json(boms);
  } catch (error) {
    console.error('Error fetching bill of materials:', error);
    return res.status(500).json({ error: 'Failed to fetch bill of materials' });
  }
});

// BOM details with items
router.get('/bom/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get BOM header
    const headerResult = await db.execute(sql`
      SELECT 
        bom.id,
        bom.name,
        bom.revision,
        bom.status,
        p.id as product_id,
        p.name as product_name,
        p.sku as product_sku,
        bom.quantity as base_quantity,
        bom.unit_of_measure,
        bom.is_active,
        bom.notes,
        bom.created_at,
        u.username as created_by
      FROM bill_of_materials bom
      LEFT JOIN products p ON bom.product_id = p.id
      LEFT JOIN users u ON bom.created_by = u.id
      WHERE bom.id = ${id}
    `);
    
    // Extract rows from PostgreSQL result
    const headerRows = headerResult.rows || [];
    
    if (headerRows.length === 0) {
      return res.status(404).json({ error: 'Bill of Materials not found' });
    }
    
    const bomHeader = headerRows[0];
    
    // Get BOM items
    const itemsResult = await db.execute(sql`
      SELECT 
        bi.id,
        bi.bom_id,
        bi.component_id,
        p.name as component_name,
        p.sku as component_sku,
        bi.quantity,
        bi.unit_of_measure,
        bi.position,
        bi.notes,
        bi.is_critical,
        bi.procurement_type,
        bi.lead_time,
        bi.is_active
      FROM bom_items bi
      LEFT JOIN products p ON bi.component_id = p.id
      WHERE bi.bom_id = ${id}
      ORDER BY bi.position ASC
    `);
    
    // Extract rows from PostgreSQL result
    const bomItems = itemsResult.rows || [];
    
    return res.json({
      ...bomHeader,
      items: bomItems
    });
  } catch (error) {
    console.error(`Error fetching BOM details for ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to fetch BOM details' });
  }
});

// ---------------------------------------------------------------
// QUALITY INSPECTIONS
// ---------------------------------------------------------------
router.get('/quality-inspections', async (req: Request, res: Response) => {
  try {
    // First verify if quality_checks table exists
    const tableExistsResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'quality_checks'
      ) as exists
    `);
    
    // Check if rows exist and if the table exists
    if (!tableExistsResult.rows || !tableExistsResult.rows[0] || !tableExistsResult.rows[0].exists) {
      return res.json([]);
    }
    
    const result = await db.execute(sql`
      SELECT 
        qc.id,
        qc.inspection_number,
        qc.type,
        qc.status,
        qc.result,
        qc.production_order_id,
        po.order_number as production_order_number,
        p.id as product_id,
        p.name as product_name,
        qc.batch_lot_id,
        bl.lot_number as batch_lot_number,
        qc.inspector_id,
        u.username as inspector_name,
        qc.inspection_date,
        qc.notes,
        (SELECT COUNT(*) FROM quality_check_parameters WHERE quality_check_id = qc.id) as parameter_count,
        (SELECT COUNT(*) FROM quality_check_parameters WHERE quality_check_id = qc.id AND result = 'Pass') as parameters_passed,
        (SELECT COUNT(*) FROM quality_check_parameters WHERE quality_check_id = qc.id AND result = 'Fail') as parameters_failed
      FROM quality_checks qc
      LEFT JOIN production_orders po ON qc.production_order_id = po.id
      LEFT JOIN products p ON po.product_id = p.id
      LEFT JOIN batch_lots bl ON qc.batch_lot_id = bl.id
      LEFT JOIN users u ON qc.inspector_id = u.id
      ORDER BY qc.inspection_date DESC
    `);
    
    // Extract rows from PostgreSQL result
    const qualityInspections = result.rows || [];
    
    return res.json(qualityInspections);
  } catch (error) {
    console.error('Error fetching quality inspections:', error);
    return res.status(500).json({ error: 'Failed to fetch quality inspections' });
  }
});

// ---------------------------------------------------------------
// MAINTENANCE REQUESTS
// ---------------------------------------------------------------
router.get('/maintenance-requests', async (req: Request, res: Response) => {
  try {
    // First verify if maintenance_requests table exists
    const tableExistsResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'maintenance_requests'
      ) as exists
    `);
    
    // Check if rows exist and if the table exists
    if (!tableExistsResult.rows || !tableExistsResult.rows[0] || !tableExistsResult.rows[0].exists) {
      return res.json([]);
    }
    
    const result = await db.execute(sql`
      SELECT 
        mr.id,
        mr.request_number,
        mr.request_type,
        mr.priority,
        mr.status,
        mr.equipment_id,
        e.name as equipment_name,
        e.type as equipment_type,
        mr.work_center_id,
        wc.name as work_center_name,
        mr.description,
        mr.requested_by,
        u.username as requested_by_name,
        mr.assigned_to,
        u2.username as assigned_to_name,
        mr.request_date,
        mr.scheduled_date,
        mr.completion_date,
        0 as estimated_hours,
        mr.downtime as actual_hours,
        mr.notes,
        mr.parts_used
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN work_centers wc ON mr.work_center_id = wc.id
      LEFT JOIN users u ON mr.requested_by = u.id
      LEFT JOIN users u2 ON mr.assigned_to = u2.id
      ORDER BY 
        CASE 
          WHEN mr.priority = 'Critical' THEN 1
          WHEN mr.priority = 'High' THEN 2
          WHEN mr.priority = 'Medium' THEN 3
          WHEN mr.priority = 'Low' THEN 4
          ELSE 5
        END,
        mr.request_date DESC
    `);
    
    // Extract rows from PostgreSQL result
    const maintenanceRequests = result.rows || [];
    
    return res.json(maintenanceRequests);
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    return res.status(500).json({ error: 'Failed to fetch maintenance requests' });
  }
});

// ---------------------------------------------------------------
// MANUFACTURING DASHBOARD
// ---------------------------------------------------------------
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    // Production stats
    let productionStats = {
      total: 0,
      inProgress: 0,
      completed: 0,
      delayed: 0,
      onHold: 0
    };
    
    try {
      const productionStatsQuery = await db.execute(sql`
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'InProgress' THEN 1 END) as in_progress,
          COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'OnHold' THEN 1 END) as on_hold,
          COUNT(CASE WHEN planned_end_date < CURRENT_DATE AND status NOT IN ('Completed', 'Cancelled') THEN 1 END) as delayed
        FROM production_orders
      `);
      
      if (productionStatsQuery.rows && productionStatsQuery.rows.length > 0) {
        productionStats = {
          total: Number(productionStatsQuery.rows[0].total) || 0,
          inProgress: Number(productionStatsQuery.rows[0].in_progress) || 0,
          completed: Number(productionStatsQuery.rows[0].completed) || 0,
          delayed: Number(productionStatsQuery.rows[0].delayed) || 0,
          onHold: Number(productionStatsQuery.rows[0].on_hold) || 0
        };
      }
    } catch (error) {
      console.error('Error fetching production statistics:', error);
    }
    
    // Quality stats
    let qualityStats = {
      inspections: 0,
      passed: 0,
      failed: 0,
      pending: 0
    };
    
    try {
      const qualityStatsQuery = await db.execute(sql`
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN result = 'Pass' THEN 1 END) as passed,
          COUNT(CASE WHEN result = 'Fail' THEN 1 END) as failed,
          COUNT(CASE WHEN status = 'Planned' OR status = 'In Progress' OR result IS NULL THEN 1 END) as pending
        FROM quality_checks
      `);
      
      if (qualityStatsQuery.rows && qualityStatsQuery.rows.length > 0) {
        qualityStats = {
          inspections: Number(qualityStatsQuery.rows[0].total) || 0,
          passed: Number(qualityStatsQuery.rows[0].passed) || 0,
          failed: Number(qualityStatsQuery.rows[0].failed) || 0,
          pending: Number(qualityStatsQuery.rows[0].pending) || 0
        };
      }
    } catch (error) {
      console.error('Error fetching quality statistics:', error);
    }
    
    // Maintenance stats
    let maintenanceStats = {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      critical: 0
    };
    
    try {
      const maintenanceStatsQuery = await db.execute(sql`
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'Scheduled' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'InProgress' THEN 1 END) as in_progress,
          COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed,
          COUNT(CASE WHEN priority = 'Critical' AND status != 'Completed' THEN 1 END) as critical
        FROM maintenance_requests
      `);
      
      if (maintenanceStatsQuery.rows && maintenanceStatsQuery.rows.length > 0) {
        maintenanceStats = {
          total: Number(maintenanceStatsQuery.rows[0].total) || 0,
          pending: Number(maintenanceStatsQuery.rows[0].pending) || 0,
          inProgress: Number(maintenanceStatsQuery.rows[0].in_progress) || 0,
          completed: Number(maintenanceStatsQuery.rows[0].completed) || 0,
          critical: Number(maintenanceStatsQuery.rows[0].critical) || 0
        };
      }
    } catch (error) {
      console.error('Error fetching maintenance statistics:', error);
    }
    
    // Recent production orders
    let recentOrders: any[] = [];
    try {
      const recentOrdersResult = await db.execute(sql`
        SELECT 
          po.id,
          po.order_number,
          p.name as product_name,
          po.quantity,
          po.status,
          po.planned_start_date,
          po.planned_end_date,
          wc.name as work_center_name
        FROM production_orders po
        LEFT JOIN products p ON po.product_id = p.id
        LEFT JOIN work_centers wc ON po.routing_id = wc.id
        ORDER BY po.created_at DESC
        LIMIT 5
      `);
      
      // Extract rows from PostgreSQL result
      recentOrders = recentOrdersResult.rows || [];
    } catch (error) {
      console.error('Error fetching recent production orders:', error);
    }
    
    // Work center utilization
    let workCenterUtilization: WorkCenterUtilization[] = [];
    try {
      const workCenterResult = await db.execute(sql`
        SELECT 
          wc.id,
          wc.name,
          wc.capacity,
          COALESCE(
            (SELECT SUM(po.quantity) FROM production_orders po WHERE po.routing_id = wc.id AND po.status IN ('Scheduled', 'InProgress')),
            0
          ) as current_load
        FROM work_centers wc
        ORDER BY wc.name
        LIMIT 5
      `);
      
      // Extract rows from PostgreSQL result
      const wcRows = workCenterResult.rows || [];
      
      // Calculate utilization percentage
      workCenterUtilization = wcRows.map(wc => {
        const capacity = Number(wc.capacity) || 0;
        const currentLoad = Number(wc.current_load) || 0;
        
        return {
          id: Number(wc.id),
          name: String(wc.name),
          capacity: capacity,
          current_load: currentLoad,
          utilization: capacity > 0 ? Math.round((currentLoad / capacity) * 100) : 0
        } as WorkCenterUtilization;
      });
    } catch (error) {
      console.error('Error fetching work center utilization:', error);
    }
    
    return res.json({
      productionStats,
      qualityStats,
      maintenanceStats,
      recentOrders,
      workCenterUtilization
    });
  } catch (error) {
    console.error('Error fetching manufacturing dashboard data:', error);
    return res.status(500).json({ error: 'Failed to fetch manufacturing dashboard data' });
  }
});

// ---------------------------------------------------------------
// TRADE COMPLIANCE
// ---------------------------------------------------------------
router.get('/trade-compliance', async (req: Request, res: Response) => {
  try {
    // First verify if trade_compliance table exists
    const tableExistsResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'trade_compliance'
      ) as exists
    `);
    
    // Check if rows exist and if the table exists
    if (!tableExistsResult.rows || !tableExistsResult.rows[0] || !tableExistsResult.rows[0].exists) {
      return res.json([]);
    }
    
    const result = await db.execute(sql`
      SELECT 
        tc.id,
        tc.product_id,
        p.name as product_name,
        p.sku as product_code,
        tc.country_of_origin,
        tc.harmonized_code,
        tc.export_control_classification,
        tc.preferential_origin_status,
        tc.documentation_status,
        tc.license_requirements,
        tc.restricted_parties_status,
        tc.compliance_status,
        tc.valid_from,
        tc.valid_to,
        tc.last_reviewed_date,
        tc.reviewed_by,
        u.username as reviewed_by_name,
        tc.notes,
        tc.created_at,
        tc.updated_at
      FROM trade_compliance tc
      LEFT JOIN products p ON tc.product_id = p.id
      LEFT JOIN users u ON tc.reviewed_by = u.id
      ORDER BY tc.updated_at DESC
    `);
    
    // Extract rows from PostgreSQL result
    const tradeComplianceRecords = result.rows || [];
    
    return res.json(tradeComplianceRecords);
  } catch (error) {
    console.error('Error fetching trade compliance records:', error);
    return res.status(500).json({ error: 'Failed to fetch trade compliance records' });
  }
});

// ---------------------------------------------------------------
// RETURNS MANAGEMENT
// ---------------------------------------------------------------
// Utility endpoint to check table columns - helps with debugging schema issues
router.get('/columns/:table', async (req: Request, res: Response) => {
  try {
    const tableName = req.params.table;
    
    // Check if the table exists first
    const tableExistsResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = ${tableName}
      ) as exists
    `);
    
    if (!tableExistsResult.rows || !tableExistsResult.rows[0] || !tableExistsResult.rows[0].exists) {
      return res.json({ error: `Table '${tableName}' does not exist` });
    }
    
    // Get column information
    const columnResult = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = ${tableName}
      ORDER BY ordinal_position
    `);
    
    // Properly type the columns result
    const columns = (columnResult.rows || []).map(row => ({
      column_name: String(row.column_name || ''),
      data_type: String(row.data_type || ''),
      is_nullable: String(row.is_nullable || '')
    }));
    
    return res.json(columns);
  } catch (error) {
    console.error(`Error fetching columns for table ${req.params.table}:`, error);
    return res.status(500).json({ error: `Failed to fetch columns for ${req.params.table}` });
  }
});

router.get('/returns', async (req: Request, res: Response) => {
  try {
    // First verify if return_authorizations table exists
    const tableExistsResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'return_authorizations'
      ) as exists
    `);
    
    // Check if rows exist and if the table exists
    if (!tableExistsResult.rows || !tableExistsResult.rows[0] || !tableExistsResult.rows[0].exists) {
      return res.json([]);
    }
    
    // Use a comprehensive query with verified columns
    const result = await db.execute(sql`
      SELECT 
        ra.id,
        ra.rma_number,
        ra.status,
        ra.customer_id,
        c.name as customer_name,
        ra.return_type,
        ra.return_reason,
        ra.created_at,
        ra.created_by,
        ra.approved_by,
        ra.approval_date,
        ra.expected_return_date,
        ra.actual_return_date,
        ra.source_document_type,
        ra.source_document_id,
        ra.notes,
        ra.shipping_method,
        ra.shipping_tracking,
        ra.quality_check_required,
        ra.resolution,
        ra.resolution_date,
        ra.return_address,
        (SELECT COUNT(*) FROM return_items WHERE return_id = ra.id) as item_count,
        (SELECT SUM(quantity) FROM return_items WHERE return_id = ra.id) as total_quantity
      FROM return_authorizations ra
      LEFT JOIN accounts c ON ra.customer_id = c.id
      ORDER BY ra.created_at DESC
    `);
    
    // Extract rows from PostgreSQL result
    const returns = result.rows || [];
    
    // Get return items for each return
    const returnsWithItems = await Promise.all(returns.map(async (returnAuth) => {
      const itemsResult = await db.execute(sql`
        SELECT 
          ri.id,
          ri.return_id,
          ri.product_id,
          p.name as product_name,
          p.sku as product_code,
          ri.quantity,
          ri.unit_of_measure,
          ri.return_reason,
          ri.batch_lot_id as lot_number,
          CAST(NULL as text) as serial_number,
          ri.condition,
          ri.disposition,
          ri.status,
          ri.notes
        FROM return_items ri
        LEFT JOIN products p ON ri.product_id = p.id
        WHERE ri.return_id = ${returnAuth.id}
      `);
      
      // Extract rows from PostgreSQL result
      const returnItems = itemsResult.rows || [];
      
      return {
        ...returnAuth,
        items: returnItems
      };
    }));
    
    return res.json(returnsWithItems);
  } catch (error) {
    console.error('Error fetching returns:', error);
    return res.status(500).json({ error: 'Failed to fetch returns' });
  }
});

export default router;