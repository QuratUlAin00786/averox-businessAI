import { Request, Response, Router } from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';

const router = Router();

// ---------------------------------------------------------------
// MRP DASHBOARD
// ---------------------------------------------------------------
router.get('/mrp/dashboard', async (req: Request, res: Response) => {
  try {
    // Get low stock items - using products table instead of materials
    let lowStockItems = [];
    try {
      lowStockItems = await db.execute(sql`
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
    } catch (lowStockError) {
      console.error('Error fetching low stock items:', lowStockError);
      // Fallback to simpler query without batch_lots table
      try {
        lowStockItems = await db.execute(sql`
          SELECT 
            p.id as material_id,
            p.name as material_name,
            p.sku as material_code,
            p.reorder_level as reorder_point,
            p.stock_quantity as current_quantity
          FROM products p
          WHERE p.is_active = true
          AND p.reorder_level IS NOT NULL
          AND p.stock_quantity <= p.reorder_level
          ORDER BY p.stock_quantity ASC
          LIMIT 10
        `);
      } catch (fallbackLowStockError) {
        console.error('Fallback low stock query also failed:', fallbackLowStockError);
        // If even the simple fallback fails, just return an empty array
        lowStockItems = [];
      }
    }
    
    // Initialize empty arrays for the other data
    let upcomingRequirements = [];
    let forecasts = [];
    
    // Only try to fetch material requirements if we succeeded with low stock items
    if (lowStockItems.length > 0) {
      try {
        // Check if required columns exist
        const columnsCheck = await db.execute(sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'material_requirements' 
          AND column_name IN ('due_date', 'required_quantity', 'available_quantity')
        `);
        
        const columns = columnsCheck.map(col => col.column_name);
        
        if (columns.includes('due_date') && columns.includes('required_quantity')) {
          upcomingRequirements = await db.execute(sql`
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
        }
      } catch (error) {
        console.error('Error fetching material requirements:', error);
      }
      
      // Try to fetch forecasts
      try {
        const forecastsCheck = await db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'material_forecasts'
          ) as exists
        `);
        
        if (forecastsCheck[0].exists) {
          forecasts = await db.execute(sql`
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
    return res.status(500).json({ error: 'Failed to fetch MRP dashboard data' });
  }
});

// ---------------------------------------------------------------
// WAREHOUSE MANAGEMENT 
// ---------------------------------------------------------------
router.get('/warehouse/bins', async (req: Request, res: Response) => {
  try {
    // Get storage bins with utilization data - using storage_bins and storage_bin_contents
    const bins = await db.execute(sql`
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
    const warehouses = await db.execute(sql`
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
    
    return res.json(result);
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
        AND bl.expiration_date <= $1::date
        AND bl.status NOT IN ('Consumed', 'Expired', 'Rejected')
      ORDER BY bl.expiration_date
    `, [futureDate.toISOString()]);
    
    return res.json(result);
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
    
    return res.json(result);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// Get vendor by ID with contracts and products
router.get('/vendors/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [vendor] = await db.execute(sql`
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
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    // Check if vendor_contracts table exists
    let contracts = [];
    try {
      contracts = await db.execute(sql`
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
    } catch (contractError) {
      console.log('Vendor contracts table might not exist:', contractError);
      // Silently ignore if table doesn't exist
    }
    
    // Check if vendor_products table exists
    let products = [];
    try {
      products = await db.execute(sql`
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
    
    return res.json(result);
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
        mv.valuation_method as "valuationMethod",
        mvm.method_name as "valuationMethodName",
        mv.valuation_date as "valuationDate",
        mv.unit_value as "unitValue",
        mv.total_value as "totalValue",
        mv.quantity,
        mv.currency,
        mv.calculation_details as "calculationDetails",
        mv.accounting_period_id as "periodId",
        mv.is_active as "isActive",
        mv.created_at as "createdAt",
        mv.updated_at as "updatedAt"
      FROM material_valuations mv
      LEFT JOIN products p ON mv.product_id = p.id
      LEFT JOIN material_valuation_methods mvm ON mv.valuation_method = mvm.method_name
    `;
    
    if (method) {
      query = sql`
        ${query}
        WHERE mv.valuation_method = ${method}
      `;
    }
    
    query = sql`
      ${query}
      ORDER BY p.name, mv.valuation_date DESC
    `;
    
    const result = await db.execute(query);
    
    return res.json(result);
  } catch (error) {
    console.error('Error fetching material valuations:', error);
    return res.status(500).json({ error: 'Failed to fetch material valuations' });
  }
});

export default router;