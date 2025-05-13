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
import bomRouter from './manufacturing/bom-routes';

const router = Router();

// Import and use the BOM routes
router.use('/boms', bomRouter);

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
// Get all forecasts
router.get('/forecasts', async (req: Request, res: Response) => {
  try {
    const result = await db.execute(sql`
      SELECT 
        id,
        external_reference as name,
        notes as description,
        forecast_period as period,
        confidence_level as confidence,
        start_date as "startDate",
        end_date as "endDate",
        CASE WHEN is_approved THEN 'Approved' ELSE 'Active' END as status,
        created_at as "createdAt",
        created_by as "createdBy",
        product_id as "productId",
        quantity
      FROM material_forecasts
      ORDER BY created_at DESC
      LIMIT 20
    `);
    
    return res.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching forecasts:', error);
    return res.status(500).json({ error: 'Failed to fetch forecasts' });
  }
});

// Get all products for dropdown selection
router.get('/products', async (req: Request, res: Response) => {
  try {
    // Fetch all products from the database
    const result = await db.execute(sql`
      SELECT 
        id, 
        name, 
        sku, 
        description, 
        price,
        category_id,
        stock_quantity
      FROM products 
      ORDER BY name ASC
    `);
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get forecast details
router.get('/forecasts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await db.execute(sql`
      SELECT 
        mf.id,
        mf.external_reference as name,
        mf.notes as description,
        mf.forecast_period as period,
        mf.confidence_level as confidence,
        mf.start_date as "startDate",
        mf.end_date as "endDate",
        CASE WHEN mf.is_approved THEN 'Approved' ELSE 'Active' END as status,
        mf.created_at as "createdAt",
        mf.created_by as "createdBy",
        mf.product_id as "productId",
        mf.quantity,
        mf.unit_of_measure as "unitOfMeasure",
        p.name as "productName",
        p.sku as "productSku",
        u.username as "createdByUsername"
      FROM material_forecasts mf
      LEFT JOIN products p ON mf.product_id = p.id
      LEFT JOIN users u ON mf.created_by = u.id
      WHERE mf.id = ${id}
    `);
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Forecast not found' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching forecast details:', error);
    return res.status(500).json({ error: 'Failed to fetch forecast details' });
  }
});

// Create a forecast
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
// INVENTORY MANAGEMENT
// ---------------------------------------------------------------
// Get inventory transactions
router.get('/inventory/transactions', async (req: Request, res: Response) => {
  try {
    const result = await db.execute(sql`
      SELECT 
        it.id,
        it.product_id,
        p.name as product_name,
        p.sku as product_sku,
        it.quantity,
        it.type,
        it.reference_id,
        it.reference_type,
        it.unit_cost,
        it.created_at,
        it.created_by,
        u.username as created_by_name,
        it.notes,
        it.location,
        it.batch_id,
        it.expiry_date
      FROM inventory_transactions it
      LEFT JOIN products p ON it.product_id = p.id
      LEFT JOIN users u ON it.created_by = u.id
      ORDER BY it.created_at DESC
      LIMIT 100
    `);
    
    return res.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching inventory transactions:', error);
    return res.status(500).json({ error: 'Failed to fetch inventory transactions' });
  }
});

// Add inventory transaction
router.post('/inventory/transactions', async (req: Request, res: Response) => {
  try {
    const {
      product_id,
      quantity = 0,
      type = 'Purchase', // Default type
      reference_id = null,
      reference_type = null,
      unit_cost = null,
      expiry_date = null,
      batch_id = null,
      notes = '',
      location = null
    } = req.body;
    
    // Validate required fields
    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    if (quantity === 0) {
      return res.status(400).json({ error: 'Quantity cannot be zero' });
    }
    
    // Validate transaction type
    const validTypes = ['Purchase', 'Sale', 'Adjustment', 'Return', 'Transfer', 'Production', 'Consumption', 'QualityReject', 'ScrapDisposal', 'IntakeForProduction', 'ProductionOutput'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid transaction type',
        validValues: validTypes
      });
    }
    
    // Insert inventory transaction
    const result = await db.execute(sql`
      INSERT INTO inventory_transactions (
        product_id,
        quantity,
        type,
        reference_id,
        reference_type,
        unit_cost,
        created_at,
        created_by,
        expiry_date,
        batch_id,
        notes,
        location
      )
      VALUES (
        ${product_id},
        ${quantity},
        ${type},
        ${reference_id},
        ${reference_type},
        ${unit_cost},
        ${new Date().toISOString()},
        ${req.user?.id || 1},
        ${expiry_date},
        ${batch_id},
        ${notes},
        ${location}
      )
      RETURNING id
    `);
    
    // Get the ID of the inserted transaction
    const transactionId = result.rows?.[0]?.id;
    
    return res.status(201).json({
      id: transactionId,
      product_id,
      quantity,
      type,
      created_at: new Date().toISOString(),
      message: 'Inventory transaction recorded successfully'
    });
  } catch (error) {
    console.error('Error creating inventory transaction:', error);
    return res.status(500).json({ error: 'Failed to record inventory transaction' });
  }
});

// Get current inventory levels
router.get('/inventory/levels', async (req: Request, res: Response) => {
  try {
    // Calculate current inventory levels based on transactions
    const result = await db.execute(sql`
      WITH inventory_sums AS (
        SELECT 
          product_id,
          SUM(CASE WHEN type IN ('Purchase', 'Return', 'Adjustment', 'Transfer', 'Production', 'ProductionOutput') THEN quantity ELSE 0 END) AS inflows,
          SUM(CASE WHEN type IN ('Sale', 'Consumption', 'QualityReject', 'ScrapDisposal', 'IntakeForProduction') THEN quantity ELSE 0 END) AS outflows
        FROM inventory_transactions
        GROUP BY product_id
      )
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.description,
        COALESCE(is_sums.inflows, 0) - COALESCE(is_sums.outflows, 0) as current_quantity,
        p.reorder_level,
        CASE 
          WHEN (COALESCE(is_sums.inflows, 0) - COALESCE(is_sums.outflows, 0)) <= p.reorder_level THEN true 
          ELSE false 
        END as needs_reorder,
        p.price as unit_cost
      FROM products p
      LEFT JOIN inventory_sums is_sums ON p.id = is_sums.product_id
      ORDER BY p.name
    `);
    
    return res.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching inventory levels:', error);
    return res.status(500).json({ error: 'Failed to fetch inventory levels' });
  }
});

// Get inventory valuation
router.get('/inventory/valuation', async (req: Request, res: Response) => {
  try {
    // Calculate inventory valuation based on transactions and costs
    const result = await db.execute(sql`
      WITH inventory_sums AS (
        SELECT 
          product_id,
          SUM(CASE WHEN type IN ('Purchase', 'Return', 'Adjustment', 'Transfer', 'Production', 'ProductionOutput') THEN quantity ELSE 0 END) AS inflows,
          SUM(CASE WHEN type IN ('Sale', 'Consumption', 'QualityReject', 'ScrapDisposal', 'IntakeForProduction') THEN quantity ELSE 0 END) AS outflows,
          AVG(unit_cost) as avg_unit_cost
        FROM inventory_transactions
        WHERE unit_cost IS NOT NULL
        GROUP BY product_id
      )
      SELECT 
        p.id,
        p.name,
        p.sku,
        COALESCE(is_sums.inflows, 0) - COALESCE(is_sums.outflows, 0) as current_quantity,
        COALESCE(is_sums.avg_unit_cost, p.price) as unit_cost,
        (COALESCE(is_sums.inflows, 0) - COALESCE(is_sums.outflows, 0)) * COALESCE(is_sums.avg_unit_cost, p.price) as total_value
      FROM products p
      LEFT JOIN inventory_sums is_sums ON p.id = is_sums.product_id
      WHERE (COALESCE(is_sums.inflows, 0) - COALESCE(is_sums.outflows, 0)) > 0
      ORDER BY total_value DESC
    `);
    
    // Calculate total inventory value
    let totalInventoryValue = 0;
    if (result.rows && result.rows.length > 0) {
      totalInventoryValue = result.rows.reduce((sum, item) => sum + Number(item.total_value || 0), 0);
    }
    
    return res.json({
      items: result.rows || [],
      totalValue: totalInventoryValue,
      valuationDate: new Date().toISOString(),
      valuationMethod: 'Average Cost'
    });
  } catch (error) {
    console.error('Error calculating inventory valuation:', error);
    return res.status(500).json({ error: 'Failed to calculate inventory valuation' });
  }
});

// ---------------------------------------------------------------
// PRODUCTION ORDERS
// ---------------------------------------------------------------
// Get all production orders
router.get('/production-orders', async (req: Request, res: Response) => {
  try {
    const result = await db.execute(sql`
      SELECT 
        po.id,
        po.order_number,
        po.product_id,
        p.name as product_name,
        p.sku as product_sku,
        po.quantity,
        po.unit_of_measure,
        po.status,
        po.priority,
        po.planned_start_date,
        po.planned_end_date,
        po.actual_start_date,
        po.actual_end_date,
        po.batch_number,
        po.notes,
        po.completed_quantity,
        po.rejected_quantity,
        po.created_at,
        po.created_by,
        u.username as created_by_name,
        po.warehouse_id,
        po.bom_id,
        po.routing_id,
        po.industry_type
      FROM production_orders po
      LEFT JOIN products p ON po.product_id = p.id
      LEFT JOIN users u ON po.created_by = u.id
      ORDER BY po.created_at DESC
      LIMIT 100
    `);
    
    return res.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching production orders:', error);
    return res.status(500).json({ error: 'Failed to fetch production orders' });
  }
});

// Get production order details
router.get('/production-orders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await db.execute(sql`
      SELECT 
        po.id,
        po.order_number,
        po.product_id,
        p.name as product_name,
        p.sku as product_sku,
        po.quantity,
        po.unit_of_measure,
        po.status,
        po.priority,
        po.planned_start_date,
        po.planned_end_date,
        po.actual_start_date,
        po.actual_end_date,
        po.batch_number,
        po.notes,
        po.completed_quantity,
        po.rejected_quantity,
        po.created_at,
        po.created_by,
        u.username as created_by_name,
        po.warehouse_id,
        w.name as warehouse_name,
        po.bom_id,
        po.routing_id,
        po.industry_type,
        r.name as routing_name
      FROM production_orders po
      LEFT JOIN products p ON po.product_id = p.id
      LEFT JOIN users u ON po.created_by = u.id
      LEFT JOIN warehouses w ON po.warehouse_id = w.id
      LEFT JOIN routings r ON po.routing_id = r.id
      WHERE po.id = ${id}
    `);
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Production order not found' });
    }
    
    // Get BOM items if available
    let bomItems = [];
    if (result.rows[0].bom_id) {
      const bomResult = await db.execute(sql`
        SELECT 
          bi.id,
          bi.component_id,
          p.name as component_name,
          p.sku as component_sku,
          bi.quantity,
          bi.unit_of_measure,
          bi.scrap_rate,
          bi.is_optional,
          bi.operation,
          bi.notes
        FROM bom_items bi
        LEFT JOIN products p ON bi.component_id = p.id
        WHERE bi.bom_id = ${result.rows[0].bom_id}
        ORDER BY bi.position
      `);
      bomItems = bomResult.rows || [];
    }
    
    return res.json({
      ...result.rows[0],
      bomItems
    });
  } catch (error) {
    console.error('Error fetching production order details:', error);
    return res.status(500).json({ error: 'Failed to fetch production order details' });
  }
});

// Create a production order
router.post('/production-orders', async (req: Request, res: Response) => {
  try {
    const {
      product_id,
      quantity = 0,
      unit_of_measure = 'Each',
      planned_start_date,
      planned_end_date,
      status = 'Draft',
      priority = 'Medium',
      warehouse_id = 1,
      bom_id = null,
      routing_id = null,
      batch_number = null,
      notes = '',
      industry_type = 'Manufacturing'
    } = req.body;
    
    // Validate required fields
    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than zero' });
    }
    
    // Generate order number (Format: PO-YYYY-XXXX)
    const year = new Date().getFullYear();
    // Get the current highest order number to increment
    const orderNumberResult = await db.execute(sql`
      SELECT order_number
      FROM production_orders
      WHERE order_number LIKE ${'PO-' + year + '-%'}
      ORDER BY order_number DESC
      LIMIT 1
    `);
    
    let nextOrderNumber;
    
    if (orderNumberResult.rows && orderNumberResult.rows.length > 0) {
      // Extract the numeric part of the last order number and increment it
      const lastOrderNumber = orderNumberResult.rows[0].order_number;
      const lastOrderSequence = parseInt(lastOrderNumber.split('-')[2], 10);
      nextOrderNumber = 'PO-' + year + '-' + String(lastOrderSequence + 1).padStart(4, '0');
    } else {
      // No existing orders for this year, start with 0001
      nextOrderNumber = 'PO-' + year + '-0001';
    }
    
    // Insert the production order
    const result = await db.execute(sql`
      INSERT INTO production_orders (
        order_number,
        product_id,
        quantity,
        unit_of_measure,
        status,
        priority,
        planned_start_date,
        planned_end_date,
        created_at,
        created_by,
        warehouse_id,
        bom_id,
        routing_id,
        batch_number,
        notes,
        industry_type,
        completed_quantity,
        rejected_quantity
      )
      VALUES (
        ${nextOrderNumber},
        ${product_id},
        ${quantity},
        ${unit_of_measure},
        ${status},
        ${priority},
        ${planned_start_date},
        ${planned_end_date},
        ${new Date().toISOString()},
        ${req.user?.id || 1},
        ${warehouse_id},
        ${bom_id},
        ${routing_id},
        ${batch_number},
        ${notes},
        ${industry_type},
        ${0},
        ${0}
      )
      RETURNING id
    `);
    
    // Get the ID of the inserted production order
    const productionOrderId = result.rows?.[0]?.id;
    
    return res.status(201).json({
      id: productionOrderId,
      order_number: nextOrderNumber,
      product_id,
      quantity,
      status,
      created_at: new Date().toISOString(),
      message: 'Production order created successfully'
    });
  } catch (error) {
    console.error('Error creating production order:', error);
    return res.status(500).json({ error: 'Failed to create production order' });
  }
});

// Update production order status
router.patch('/production-orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, completed_quantity = null, rejected_quantity = null, actual_start_date = null, actual_end_date = null } = req.body;
    
    // Validate status value
    const validStatuses = ['Draft', 'Scheduled', 'InProgress', 'Completed', 'OnHold', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status value',
        validValues: validStatuses
      });
    }
    
    // Get the current production order to check previous status
    const orderQuery = await db.execute(sql`
      SELECT po.*, p.name as product_name, p.sku as product_sku
      FROM production_orders po
      LEFT JOIN products p ON po.product_id = p.id
      WHERE po.id = ${id}
    `);
    
    if (!orderQuery.rows || orderQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Production order not found' });
    }
    
    const productionOrder = orderQuery.rows[0];
    const previousStatus = productionOrder.status;
    const completedQuantity = completed_quantity || productionOrder.quantity || 0;
    
    // Build the update SQL query based on provided fields
    let updateFields = sql`status = ${status}`;
    
    if (completed_quantity !== null) {
      updateFields = sql`${updateFields}, completed_quantity = ${completed_quantity}`;
    }
    
    if (rejected_quantity !== null) {
      updateFields = sql`${updateFields}, rejected_quantity = ${rejected_quantity}`;
    }
    
    // Update timestamps based on status
    if (status === 'InProgress' && actual_start_date === null) {
      updateFields = sql`${updateFields}, actual_start_date = ${new Date().toISOString()}`;
    }
    
    if (status === 'Completed' && actual_end_date === null) {
      updateFields = sql`${updateFields}, actual_end_date = ${new Date().toISOString()}`;
    }
    
    // If explicit dates are provided, use those
    if (actual_start_date !== null) {
      updateFields = sql`${updateFields}, actual_start_date = ${actual_start_date}`;
    }
    
    if (actual_end_date !== null) {
      updateFields = sql`${updateFields}, actual_end_date = ${actual_end_date}`;
    }
    
    // If status is changing to Completed, handle inventory updates
    let inventoryUpdated = false;
    if (status === 'Completed' && previousStatus !== 'Completed') {
      try {
        // Begin transaction for inventory updates
        await db.execute(sql`BEGIN`);
        
        // Create inventory transaction for the produced product
        await db.execute(sql`
          INSERT INTO inventory_transactions (
            product_id,
            quantity,
            type,
            reference_id,
            reference_type,
            unit_cost,
            created_at,
            created_by,
            notes,
            location
          )
          VALUES (
            ${productionOrder.product_id},
            ${completedQuantity},
            'ProductionOutput',
            ${id},
            'production_order',
            ${productionOrder.unit_cost || null},
            ${new Date().toISOString()},
            ${req.user?.id || 1},
            ${`Produced in production order #${id} (${productionOrder.order_number})`},
            ${productionOrder.location || productionOrder.warehouse_id || null}
          )
        `);
        
        // Check if there's a BOM (Bill of Materials) for the product
        const bomResult = await db.execute(sql`
          SELECT bi.*, p.name as component_name, p.sku as component_sku
          FROM bom_items bi
          JOIN products p ON bi.component_id = p.id
          WHERE bi.bom_id = ${productionOrder.bom_id || 0}
        `);
        
        const bomItems = bomResult.rows || [];
        
        // For each BOM item, create an inventory transaction to consume the components
        for (const item of bomItems) {
          const requiredQuantity = parseFloat(item.quantity || 0) * completedQuantity;
          
          // Create inventory transaction for consuming the component
          await db.execute(sql`
            INSERT INTO inventory_transactions (
              product_id,
              quantity,
              type,
              reference_id,
              reference_type,
              created_at,
              created_by,
              notes,
              location
            )
            VALUES (
              ${item.component_id},
              ${requiredQuantity},
              'IntakeForProduction',
              ${id},
              'production_order',
              ${new Date().toISOString()},
              ${req.user?.id || 1},
              ${`Used in production order #${id} (${productionOrder.order_number}) for ${productionOrder.product_name}`},
              ${productionOrder.location || productionOrder.warehouse_id || null}
            )
          `);
        }
        
        // Commit transaction
        await db.execute(sql`COMMIT`);
        inventoryUpdated = true;
      } catch (error) {
        // Rollback transaction in case of error
        await db.execute(sql`ROLLBACK`);
        console.error('Error updating inventory for production completion:', error);
        return res.status(500).json({ 
          error: 'Failed to update inventory for production completion. Transaction rolled back.' 
        });
      }
    }
    
    // Execute the update
    const result = await db.execute(sql`
      UPDATE production_orders
      SET ${updateFields}
      WHERE id = ${id}
      RETURNING id, order_number, status, completed_quantity, rejected_quantity, actual_start_date, actual_end_date
    `);
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Production order not found' });
    }
    
    let message = 'Production order status updated successfully';
    if (inventoryUpdated) {
      message += '. Inventory has been updated automatically.';
    }
    
    return res.json({
      ...result.rows[0],
      message: message
    });
    
  } catch (error) {
    console.error('Error updating production order status:', error);
    return res.status(500).json({ error: 'Failed to update production order status' });
  }
});

// ---------------------------------------------------------------
// MRP DASHBOARD
// ---------------------------------------------------------------
router.get('/mrp/dashboard', async (req: Request, res: Response<MrpDashboardResponse>) => {
  try {
    // Initialize empty arrays for all data
    let lowStockItems: LowStockItem[] = [];
    let upcomingRequirements: UpcomingRequirement[] = [];
    let forecasts: Forecast[] = [];
    
    // Get low stock items - simplified query for testing
    try {
      const result = await db.execute(sql`
        SELECT 
          p.id as material_id,
          p.name as material_name,
          p.sku as material_code,
          p.reorder_level as reorder_point,
          p.stock_quantity as current_quantity
        FROM products p
        ORDER BY p.id
        LIMIT 10
      `);
      
      // Convert PostgreSQL result into a proper array for the client
      lowStockItems = (result.rows || []).map(row => ({
        id: Number(row.material_id),
        material_id: Number(row.material_id),
        material_name: String(row.material_name || ''),
        material_code: row.material_code ? String(row.material_code) : undefined,
        current_stock: Number(row.current_quantity || 0),
        minimum_stock: 0, // Default value
        reorder_level: Number(row.reorder_point || 0),
        unit_of_measure: 'Each', // Default value
        category: 'Material', // Default value
        supplier_name: 'Default Supplier' // Default value
      }));
    } catch (lowStockError) {
      console.error('Error fetching low stock items:', lowStockError);
      // Continue with empty array if query fails
    }
    
    // Get material requirements - simplified
    try {
      upcomingRequirements = [];  // Simplified for now
    } catch (error) {
      console.error('Error fetching material requirements:', error);
    }
    
    // Get forecasts - no conditions, always try to fetch
    try {
      console.log('Fetching material forecasts...');
      const result = await db.execute(sql`
        SELECT 
          id,
          external_reference as name,
          notes as description,
          forecast_period as period,
          confidence_level as confidence,
          start_date as "startDate",
          end_date as "endDate",
          CASE WHEN is_approved THEN 'Approved' ELSE 'Active' END as status,
          created_at as "createdAt",
          created_by as "createdBy"
        FROM material_forecasts
        ORDER BY created_at DESC
        LIMIT 5
      `);
      
      // Log raw response from the database
      console.log('Forecast result rows:', JSON.stringify(result.rows || []));
      
      forecasts = (result.rows || []).map(row => ({
        id: Number(row.id || 0),
        name: String(row.name || ''),
        period: String(row.period || 'Monthly'),
        created_date: String(row.createdAt || new Date().toISOString()),
        confidence: Number(row.confidence || 0),
        values: [],  // No values column in our schema
        status: String(row.status || 'Active'),
        createdAt: String(row.createdAt || new Date().toISOString()),
        createdBy: Number(row.createdBy || 1)
      }));
      
      // Log mapped forecasts
      console.log('Mapped forecasts:', JSON.stringify(forecasts));
    } catch (error) {
      console.error('Error fetching forecasts:', error);
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
router.post('/warehouse/bins/add', async (req: Request, res: Response) => {
  try {
    const { 
      bin_code, 
      warehouse_id, 
      zone_id,
      aisle, 
      rack, 
      level, 
      position, 
      capacity, 
      bin_type, 
      max_weight, 
      height, 
      width, 
      depth,
      is_mixing_allowed,
      special_handling_notes 
    } = req.body;

    // Validate required fields
    if (!bin_code || !warehouse_id) {
      return res.status(400).json({ error: 'Bin code and warehouse ID are required' });
    }

    // Calculate available capacity - initially equals full capacity
    const available_capacity = capacity;

    // Add record to storage_bins table
    const result = await db.execute(sql`
      INSERT INTO storage_bins (
        bin_code, 
        warehouse_id, 
        zone_id,
        aisle, 
        rack, 
        level, 
        position, 
        capacity, 
        available_capacity,
        bin_type, 
        max_weight, 
        height, 
        width, 
        depth,
        is_mixing_allowed,
        special_handling_notes,
        is_active,
        created_at
      )
      VALUES (
        ${bin_code}, 
        ${warehouse_id}, 
        ${zone_id || null},
        ${aisle || null}, 
        ${rack || null}, 
        ${level || null}, 
        ${position || null}, 
        ${capacity || 0}, 
        ${available_capacity || 0},
        ${bin_type || 'Standard'},
        ${max_weight || null}, 
        ${height || null}, 
        ${width || null}, 
        ${depth || null},
        ${is_mixing_allowed || false},
        ${special_handling_notes || null},
        true,
        NOW()
      )
      RETURNING id, bin_code, warehouse_id
    `);

    const newBin = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Storage bin created successfully',
      bin: newBin
    });
  } catch (error) {
    console.error('Error creating storage bin:', error);
    res.status(500).json({ error: 'Failed to create storage bin' });
  }
});

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

// Storage zone management endpoint
router.post('/warehouse/zones/add', async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      code,
      description,
      warehouse_id,
      zone_type,
      capacity,
      is_active
    } = req.body;

    // Validate required fields
    if (!name || !code || !warehouse_id) {
      return res.status(400).json({ error: 'Zone name, code, and warehouse ID are required' });
    }

    // Add record to warehouse_zones table
    const result = await db.execute(sql`
      INSERT INTO warehouse_zones (
        name,
        code,
        description,
        warehouse_id,
        zone_type,
        capacity,
        is_active,
        created_at
      )
      VALUES (
        ${name},
        ${code},
        ${description || null},
        ${warehouse_id},
        ${zone_type || 'Standard'},
        ${capacity || 0},
        ${is_active !== undefined ? is_active : true},
        NOW()
      )
      RETURNING id, name, code, warehouse_id
    `);

    const newZone = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Storage zone created successfully',
      zone: newZone
    });
  } catch (error) {
    console.error('Error creating storage zone:', error);
    res.status(500).json({ error: 'Failed to create storage zone' });
  }
});

// Get all storage zones
router.get('/warehouse/zones', async (req: Request, res: Response) => {
  try {
    const result = await db.execute(sql`
      SELECT 
        z.id,
        z.code,
        z.name,
        z.description,
        z.zone_type,
        z.capacity,
        z.is_active as "isActive",
        z.warehouse_id,
        w.name as warehouse_name,
        w.code as warehouse_code
      FROM warehouse_zones z
      LEFT JOIN warehouses w ON z.warehouse_id = w.id
      ORDER BY z.name
    `);
    
    // Extract rows from PostgreSQL result
    const zones = result.rows || [];
    
    return res.json(zones);
  } catch (error) {
    console.error('Error fetching storage zones:', error);
    return res.status(500).json({ error: 'Failed to fetch storage zones' });
  }
});

// Get all storage locations with hierarchical structure
router.post('/storage/locations/add', async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      code,
      address,
      city,
      state,
      country,
      zip,
      capacity,
      is_manufacturing,
      description,
      contact_person,
      contact_phone,
      contact_email,
      parent_warehouse_id
    } = req.body;

    // Validate required fields
    if (!name || !code) {
      return res.status(400).json({ error: 'Warehouse name and code are required' });
    }

    // Add record to warehouses table
    const result = await db.execute(sql`
      INSERT INTO warehouses (
        name,
        code,
        address,
        city,
        state,
        country,
        zip,
        capacity,
        is_manufacturing,
        description,
        contact_person,
        contact_phone,
        contact_email,
        parent_warehouse_id,
        is_active,
        created_at
      )
      VALUES (
        ${name},
        ${code},
        ${address || null},
        ${city || null},
        ${state || null},
        ${country || null},
        ${zip || null},
        ${capacity || 0},
        ${is_manufacturing || false},
        ${description || null},
        ${contact_person || null},
        ${contact_phone || null},
        ${contact_email || null},
        ${parent_warehouse_id || null},
        true,
        NOW()
      )
      RETURNING id, name, code
    `);

    const newWarehouse = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Warehouse created successfully',
      warehouse: newWarehouse
    });
  } catch (error) {
    console.error('Error creating warehouse:', error);
    res.status(500).json({ error: 'Failed to create warehouse' });
  }
});

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

// Create a new batch lot
router.post('/batch-lots', async (req: Request, res: Response) => {
  try {
    const {
      product_id,
      lot_number,
      batch_number,
      quantity,
      unit_of_measure,
      warehouse_id,
      vendor_id,
      manufacture_date,
      expiration_date,
      receipt_date,
      cost,
      purchase_order_id,
      production_order_id,
      status,
      quality_status,
      country_of_origin,
      is_quarantine,
      quarantine_reason,
      notes
    } = req.body;
    
    // Validate required fields
    if (!product_id || !lot_number || !quantity || !unit_of_measure) {
      return res.status(400).json({ 
        error: 'Missing required fields. Product ID, lot number, quantity, and unit of measure are required.' 
      });
    }
    
    // Generate a unique batch number if not provided
    const batchNumberToUse = batch_number || `BN-${Date.now().toString().slice(-8)}`;
    
    // Insert the new batch lot
    const result = await db.execute(sql`
      INSERT INTO batch_lots (
        product_id,
        lot_number,
        batch_number,
        quantity,
        unit_of_measure,
        warehouse_id,
        vendor_id,
        manufacture_date,
        expiration_date,
        receipt_date,
        cost,
        purchase_order_id,
        production_order_id,
        status,
        quality_status,
        country_of_origin,
        is_quarantine,
        quarantine_reason,
        notes,
        created_at,
        updated_at,
        created_by
      )
      VALUES (
        ${product_id},
        ${lot_number},
        ${batchNumberToUse},
        ${quantity},
        ${unit_of_measure},
        ${warehouse_id || null},
        ${vendor_id || null},
        ${manufacture_date ? new Date(manufacture_date) : null},
        ${expiration_date ? new Date(expiration_date) : null},
        ${receipt_date ? new Date(receipt_date) : new Date()},
        ${cost || null},
        ${purchase_order_id || null},
        ${production_order_id || null},
        ${status || 'Available'},
        ${quality_status || 'Pending'},
        ${country_of_origin || null},
        ${is_quarantine || false},
        ${quarantine_reason || null},
        ${notes || null},
        NOW(),
        NOW(),
        ${req.user?.id || null}
      )
      RETURNING *
    `);
    
    const newBatchLot = result.rows[0];
    
    // Also create an inventory transaction if warehouse is specified
    if (warehouse_id) {
      await db.execute(sql`
        INSERT INTO inventory_transactions (
          product_id,
          type,
          quantity,
          reference_id,
          reference_type,
          notes,
          location,
          created_at,
          created_by,
          batch_id
        )
        VALUES (
          ${product_id},
          'Receive',
          ${quantity},
          ${newBatchLot.id},
          'Batch',
          ${`Received batch/lot ${lot_number}`},
          ${warehouse_id},
          NOW(),
          ${req.user?.id || null},
          ${newBatchLot.id}
        )
      `);
    }
    
    return res.status(201).json({
      success: true,
      message: 'Batch lot created successfully',
      batchLot: newBatchLot
    });
  } catch (error) {
    console.error('Error creating batch lot:', error);
    return res.status(500).json({ error: 'Failed to create batch lot' });
  }
});

// Update a batch lot
router.patch('/batch-lots/:id', async (req: Request, res: Response) => {
  try {
    const batchLotId = parseInt(req.params.id);
    
    if (isNaN(batchLotId)) {
      return res.status(400).json({ error: 'Invalid batch lot ID' });
    }
    
    const {
      quantity,
      warehouse_id,
      status,
      quality_status,
      is_quarantine,
      quarantine_reason,
      quarantine_until,
      notes
    } = req.body;
    
    // Check if the batch lot exists
    const checkResult = await db.execute(sql`
      SELECT * FROM batch_lots WHERE id = ${batchLotId}
    `);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Batch lot not found' });
    }
    
    const existingBatchLot = checkResult.rows[0];
    
    // Build update query dynamically based on provided fields
    let updateFields = [];
    let updateValues = [];
    
    if (quantity !== undefined) {
      updateFields.push('quantity = $' + (updateValues.length + 1));
      updateValues.push(quantity);
    }
    
    if (warehouse_id !== undefined) {
      updateFields.push('warehouse_id = $' + (updateValues.length + 1));
      updateValues.push(warehouse_id);
    }
    
    if (status !== undefined) {
      updateFields.push('status = $' + (updateValues.length + 1));
      updateValues.push(status);
    }
    
    if (quality_status !== undefined) {
      updateFields.push('quality_status = $' + (updateValues.length + 1));
      updateValues.push(quality_status);
    }
    
    if (is_quarantine !== undefined) {
      updateFields.push('is_quarantine = $' + (updateValues.length + 1));
      updateValues.push(is_quarantine);
    }
    
    if (quarantine_reason !== undefined) {
      updateFields.push('quarantine_reason = $' + (updateValues.length + 1));
      updateValues.push(quarantine_reason);
    }
    
    if (quarantine_until !== undefined) {
      updateFields.push('quarantine_until = $' + (updateValues.length + 1));
      updateValues.push(new Date(quarantine_until));
    }
    
    if (notes !== undefined) {
      updateFields.push('notes = $' + (updateValues.length + 1));
      updateValues.push(notes);
    }
    
    // Always update the updated_at timestamp
    updateFields.push('updated_at = NOW()');
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    // Execute the update query
    const updateQuery = `
      UPDATE batch_lots
      SET ${updateFields.join(', ')}
      WHERE id = $${updateValues.length + 1}
      RETURNING *
    `;
    
    updateValues.push(batchLotId);
    
    const result = await db.execute({
      text: updateQuery,
      values: updateValues
    });
    
    const updatedBatchLot = result.rows[0];
    
    // If warehouse_id changed, create a transfer transaction
    if (warehouse_id !== undefined && warehouse_id !== existingBatchLot.warehouse_id) {
      await db.execute(sql`
        INSERT INTO inventory_transactions (
          product_id,
          type,
          quantity,
          reference_id,
          reference_type,
          notes,
          location,
          created_at,
          created_by,
          batch_id
        )
        VALUES (
          ${existingBatchLot.product_id},
          'Transfer',
          ${quantity || existingBatchLot.quantity},
          ${batchLotId},
          'Batch',
          ${`Batch/lot ${existingBatchLot.lot_number} transferred to new location`},
          ${warehouse_id},
          NOW(),
          ${req.user?.id || null},
          ${batchLotId}
        )
      `);
    }
    
    // If status changed to Consumed, create a consumption transaction
    if (status === 'Consumed' && existingBatchLot.status !== 'Consumed') {
      await db.execute(sql`
        INSERT INTO inventory_transactions (
          product_id,
          type,
          quantity,
          reference_id,
          reference_type,
          notes,
          location,
          created_at,
          created_by,
          batch_id
        )
        VALUES (
          ${existingBatchLot.product_id},
          'Consume',
          ${-1 * (quantity || existingBatchLot.quantity)},
          ${batchLotId},
          'Batch',
          ${`Batch/lot ${existingBatchLot.lot_number} marked as consumed`},
          ${existingBatchLot.warehouse_id},
          NOW(),
          ${req.user?.id || null},
          ${batchLotId}
        )
      `);
    }
    
    return res.json({
      success: true,
      message: 'Batch lot updated successfully',
      batchLot: updatedBatchLot
    });
  } catch (error) {
    console.error('Error updating batch lot:', error);
    return res.status(500).json({ error: 'Failed to update batch lot' });
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

// ---------------------------------------------------------------
// BOM MANAGEMENT (BILL OF MATERIALS)
// ---------------------------------------------------------------

// Get all BOMs
router.get('/boms', async (req: Request, res: Response) => {
  try {
    const result = await db.execute(sql`
      SELECT 
        b.id,
        b.product_id,
        p.name as product_name,
        p.sku as product_sku,
        b.version,
        b.name,
        b.description,
        b.is_active,
        b.created_at,
        b.created_by,
        u.username as created_by_name,
        b.approved_by,
        a.username as approved_by_name,
        b.approval_date as approved_at,
        b.manufacturing_type as industry_type,
        b.notes,
        (SELECT COUNT(*) FROM bom_items WHERE bom_id = b.id) as component_count
      FROM bill_of_materials b
      LEFT JOIN products p ON b.product_id = p.id
      LEFT JOIN users u ON b.created_by = u.id
      LEFT JOIN users a ON b.approved_by = a.id
      ORDER BY b.created_at DESC
    `);
    
    return res.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching BOMs:', error);
    return res.status(500).json({ error: 'Failed to fetch BOMs' });
  }
});

// Get BOM by ID
router.get('/boms/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get BOM header
    const bomResult = await db.execute(sql`
      SELECT 
        b.id,
        b.product_id,
        p.name as product_name,
        p.sku as product_sku,
        b.version,
        b.name,
        b.description,
        b.is_active,
        b.created_at,
        b.created_by,
        u.username as created_by_name,
        b.approved_by,
        a.username as approved_by_name,
        b.approval_date as approved_at,
        b.manufacturing_type as industry_type,
        b.yield,
        b.total_cost,
        b.notes,
        b.revision_notes as revision
      FROM bill_of_materials b
      LEFT JOIN products p ON b.product_id = p.id
      LEFT JOIN users u ON b.created_by = u.id
      LEFT JOIN users a ON b.approved_by = a.id
      WHERE b.id = ${id}
    `);
    
    if (!bomResult.rows || bomResult.rows.length === 0) {
      return res.status(404).json({ error: 'BOM not found' });
    }
    
    // Get BOM items
    const bomItemsResult = await db.execute(sql`
      SELECT 
        bi.id,
        bi.component_id,
        p.name as component_name,
        p.sku as component_sku,
        bi.quantity,
        bi.unit_of_measure,
        bi.position,
        bi.is_optional,
        bi.is_sub_assembly,
        bi.scrap_rate,
        bi.operation,
        bi.notes,
        bi.work_center_id,
        w.name as work_center_name,
        p.price as unit_cost,
        (p.price * bi.quantity) as total_cost
      FROM bom_items bi
      LEFT JOIN products p ON bi.component_id = p.id
      LEFT JOIN work_centers w ON bi.work_center_id = w.id
      WHERE bi.bom_id = ${id}
      ORDER BY bi.position
    `);
    
    const bom = {
      ...bomResult.rows[0],
      items: bomItemsResult.rows || []
    };
    
    return res.json(bom);
  } catch (error) {
    console.error('Error fetching BOM:', error);
    return res.status(500).json({ error: 'Failed to fetch BOM' });
  }
});

// Create BOM
router.post('/boms', async (req: Request, res: Response) => {
  try {
    const {
      product_id,
      version = '1.0',
      name,
      description = '',
      is_active = true,
      manufacturing_type = null,
      notes = '',
      revision_notes = '',
      yield_percentage = 100,
      total_cost = 0
    } = req.body;
    
    // Validate required fields
    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    if (!name) {
      return res.status(400).json({ error: 'BOM name is required' });
    }
    
    // Check if the product exists
    const productCheck = await db.execute(sql`
      SELECT id, name FROM products WHERE id = ${product_id}
    `);
    
    if (!productCheck.rows || productCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Product not found' });
    }
    
    // Check if a BOM already exists for this product with the same version
    const existingBomCheck = await db.execute(sql`
      SELECT id FROM bill_of_materials WHERE product_id = ${product_id} AND version = ${version}
    `);
    
    if (existingBomCheck.rows && existingBomCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: 'A BOM with this product and version already exists',
        existingBomId: existingBomCheck.rows[0].id
      });
    }
    
    // Insert the BOM
    const result = await db.execute(sql`
      INSERT INTO bill_of_materials (
        product_id,
        version,
        name,
        description,
        is_active,
        created_at,
        created_by,
        manufacturing_type,
        notes,
        revision_notes,
        yield,
        total_cost,
        is_default
      )
      VALUES (
        ${product_id},
        ${version},
        ${name},
        ${description},
        ${is_active},
        ${new Date().toISOString()},
        ${req.user?.id || 1},
        ${manufacturing_type || 'Discrete'},
        ${notes},
        ${revision_notes},
        ${yield_percentage},
        ${total_cost},
        ${false}
      )
      RETURNING id
    `);
    
    const bomId = result.rows?.[0]?.id;
    
    return res.status(201).json({
      id: bomId,
      product_id,
      version,
      name,
      created_at: new Date().toISOString(),
      created_by: req.user?.id || 1,
      message: 'BOM created successfully'
    });
  } catch (error) {
    console.error('Error creating BOM:', error);
    return res.status(500).json({ error: 'Failed to create BOM' });
  }
});

// Add BOM item
router.post('/boms/:id/items', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      component_id,
      quantity = 1,
      unit_of_measure = 'Each',
      position = 1,
      is_optional = false,
      is_sub_assembly = false,
      scrap_rate = 0,
      operation = null,
      notes = null,
      work_center_id = null
    } = req.body;
    
    // Validate required fields
    if (!component_id) {
      return res.status(400).json({ error: 'Component ID is required' });
    }
    
    // Check if the BOM exists
    const bomCheck = await db.execute(sql`
      SELECT id, product_id FROM boms WHERE id = ${id}
    `);
    
    if (!bomCheck.rows || bomCheck.rows.length === 0) {
      return res.status(404).json({ error: 'BOM not found' });
    }
    
    // Check if the component exists
    const componentCheck = await db.execute(sql`
      SELECT id, name FROM products WHERE id = ${component_id}
    `);
    
    if (!componentCheck.rows || componentCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Component product not found' });
    }
    
    // Check if the component is the same as the BOM's product (prevent circular reference)
    if (bomCheck.rows[0].product_id === component_id) {
      return res.status(400).json({ error: 'Cannot add the product itself as a component' });
    }
    
    // Get the next position if not specified
    let nextPosition = position;
    if (!position) {
      const positionResult = await db.execute(sql`
        SELECT COALESCE(MAX(position), 0) + 1 as next_position
        FROM bom_items
        WHERE bom_id = ${id}
      `);
      nextPosition = positionResult.rows?.[0]?.next_position || 1;
    }
    
    // Insert the BOM item
    const result = await db.execute(sql`
      INSERT INTO bom_items (
        bom_id,
        component_id,
        quantity,
        unit_of_measure,
        position,
        is_optional,
        is_sub_assembly,
        scrap_rate,
        operation,
        notes,
        work_center_id
      )
      VALUES (
        ${id},
        ${component_id},
        ${quantity},
        ${unit_of_measure},
        ${nextPosition},
        ${is_optional},
        ${is_sub_assembly},
        ${scrap_rate},
        ${operation},
        ${notes},
        ${work_center_id}
      )
      RETURNING id
    `);
    
    const itemId = result.rows?.[0]?.id;
    
    // Get component details for response
    const componentDetails = await db.execute(sql`
      SELECT name, sku FROM products WHERE id = ${component_id}
    `);
    
    const componentName = componentDetails.rows?.[0]?.name || '';
    const componentSku = componentDetails.rows?.[0]?.sku || '';
    
    return res.status(201).json({
      id: itemId,
      bom_id: id,
      component_id,
      component_name: componentName,
      component_sku: componentSku,
      quantity,
      unit_of_measure,
      position: nextPosition,
      message: 'BOM item added successfully'
    });
  } catch (error) {
    console.error('Error adding BOM item:', error);
    return res.status(500).json({ error: 'Failed to add BOM item' });
  }
});

// Update BOM
router.patch('/boms/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      is_active,
      effective_date,
      expiration_date,
      revision,
      industry_type,
      approved_by,
      approved_at
    } = req.body;
    
    // Build the update SQL query based on provided fields
    let updateFields = sql``;
    let isFirstField = true;
    
    if (name !== undefined) {
      updateFields = sql`${updateFields}${isFirstField ? '' : ', '}name = ${name}`;
      isFirstField = false;
    }
    
    if (description !== undefined) {
      updateFields = sql`${updateFields}${isFirstField ? '' : ', '}description = ${description}`;
      isFirstField = false;
    }
    
    if (is_active !== undefined) {
      updateFields = sql`${updateFields}${isFirstField ? '' : ', '}is_active = ${is_active}`;
      isFirstField = false;
    }
    
    if (effective_date !== undefined) {
      updateFields = sql`${updateFields}${isFirstField ? '' : ', '}effective_date = ${effective_date}`;
      isFirstField = false;
    }
    
    if (expiration_date !== undefined) {
      updateFields = sql`${updateFields}${isFirstField ? '' : ', '}expiration_date = ${expiration_date}`;
      isFirstField = false;
    }
    
    if (revision !== undefined) {
      updateFields = sql`${updateFields}${isFirstField ? '' : ', '}revision = ${revision}`;
      isFirstField = false;
    }
    
    if (industry_type !== undefined) {
      updateFields = sql`${updateFields}${isFirstField ? '' : ', '}industry_type = ${industry_type}`;
      isFirstField = false;
    }
    
    if (approved_by !== undefined) {
      updateFields = sql`${updateFields}${isFirstField ? '' : ', '}approved_by = ${approved_by}`;
      isFirstField = false;
    }
    
    if (approved_at !== undefined) {
      updateFields = sql`${updateFields}${isFirstField ? '' : ', '}approved_at = ${approved_at}`;
      isFirstField = false;
    }
    
    // If no fields were provided to update
    if (isFirstField) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }
    
    // Check if the BOM exists
    const bomCheck = await db.execute(sql`
      SELECT id FROM boms WHERE id = ${id}
    `);
    
    if (!bomCheck.rows || bomCheck.rows.length === 0) {
      return res.status(404).json({ error: 'BOM not found' });
    }
    
    // Execute the update
    const result = await db.execute(sql`
      UPDATE boms
      SET ${updateFields}
      WHERE id = ${id}
      RETURNING id, name, is_active, revision
    `);
    
    return res.json({
      ...result.rows[0],
      message: 'BOM updated successfully'
    });
  } catch (error) {
    console.error('Error updating BOM:', error);
    return res.status(500).json({ error: 'Failed to update BOM' });
  }
});

// Delete BOM item
router.delete('/boms/:bomId/items/:itemId', async (req: Request, res: Response) => {
  try {
    const { bomId, itemId } = req.params;
    
    // Check if the BOM exists
    const bomCheck = await db.execute(sql`
      SELECT id FROM boms WHERE id = ${bomId}
    `);
    
    if (!bomCheck.rows || bomCheck.rows.length === 0) {
      return res.status(404).json({ error: 'BOM not found' });
    }
    
    // Check if the BOM item exists
    const itemCheck = await db.execute(sql`
      SELECT id FROM bom_items WHERE id = ${itemId} AND bom_id = ${bomId}
    `);
    
    if (!itemCheck.rows || itemCheck.rows.length === 0) {
      return res.status(404).json({ error: 'BOM item not found' });
    }
    
    // Delete the BOM item
    await db.execute(sql`
      DELETE FROM bom_items WHERE id = ${itemId}
    `);
    
    return res.json({
      id: itemId,
      bom_id: bomId,
      message: 'BOM item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting BOM item:', error);
    return res.status(500).json({ error: 'Failed to delete BOM item' });
  }
});

// Copy BOM (create a new version)
router.post('/boms/:id/copy', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { new_version, new_name } = req.body;
    
    if (!new_version) {
      return res.status(400).json({ error: 'New version is required' });
    }
    
    // Check if the source BOM exists
    const bomCheck = await db.execute(sql`
      SELECT product_id, name, description, industry_type FROM boms WHERE id = ${id}
    `);
    
    if (!bomCheck.rows || bomCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Source BOM not found' });
    }
    
    const sourceBom = bomCheck.rows[0];
    
    // Check if a BOM with the new version already exists
    const versionCheck = await db.execute(sql`
      SELECT id FROM boms WHERE product_id = ${sourceBom.product_id} AND version = ${new_version}
    `);
    
    if (versionCheck.rows && versionCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: 'A BOM with this product and version already exists',
        existingBomId: versionCheck.rows[0].id
      });
    }
    
    // Start a transaction
    await db.execute(sql`BEGIN`);
    
    try {
      // Insert the new BOM
      const newBomResult = await db.execute(sql`
        INSERT INTO boms (
          product_id,
          version,
          name,
          description,
          is_active,
          created_at,
          created_by,
          revision,
          industry_type
        )
        VALUES (
          ${sourceBom.product_id},
          ${new_version},
          ${new_name || `${sourceBom.name} (${new_version})`},
          ${sourceBom.description},
          true,
          ${new Date().toISOString()},
          ${req.user?.id || 1},
          '1',
          ${sourceBom.industry_type}
        )
        RETURNING id
      `);
      
      const newBomId = newBomResult.rows?.[0]?.id;
      
      // Copy all BOM items
      await db.execute(sql`
        INSERT INTO bom_items (
          bom_id,
          component_id,
          quantity,
          unit_of_measure,
          position,
          is_optional,
          is_sub_assembly,
          scrap_rate,
          operation,
          notes,
          work_center_id
        )
        SELECT 
          ${newBomId},
          component_id,
          quantity,
          unit_of_measure,
          position,
          is_optional,
          is_sub_assembly,
          scrap_rate,
          operation,
          notes,
          work_center_id
        FROM bom_items
        WHERE bom_id = ${id}
      `);
      
      // Commit the transaction
      await db.execute(sql`COMMIT`);
      
      return res.status(201).json({
        id: newBomId,
        product_id: sourceBom.product_id,
        version: new_version,
        name: new_name || `${sourceBom.name} (${new_version})`,
        copied_from: id,
        message: 'BOM copied successfully'
      });
    } catch (error) {
      // Rollback the transaction in case of error
      await db.execute(sql`ROLLBACK`);
      throw error;
    }
  } catch (error) {
    console.error('Error copying BOM:', error);
    return res.status(500).json({ error: 'Failed to copy BOM' });
  }
});

// Material transfers endpoint
router.post('/warehouse/transfers/add', async (req: Request, res: Response) => {
  try {
    const { 
      product_id,
      source_bin_id,
      destination_bin_id,
      quantity,
      transfer_reason,
      reference_number,
      notes
    } = req.body;

    // Validate required fields
    if (!product_id || !source_bin_id || !destination_bin_id || !quantity) {
      return res.status(400).json({ 
        error: 'Product ID, source bin, destination bin, and quantity are required' 
      });
    }

    // Begin a transaction
    await db.execute(sql`BEGIN`);

    try {
      // Get product details
      const productResult = await db.execute(sql`
        SELECT id, name, sku FROM products WHERE id = ${product_id}
      `);
      
      if (productResult.rows.length === 0) {
        await db.execute(sql`ROLLBACK`);
        return res.status(404).json({ error: 'Product not found' });
      }
      
      const product = productResult.rows[0];
      
      // Check if source bin exists and has enough stock
      const sourceBinResult = await db.execute(sql`
        SELECT bin_code, available_capacity FROM storage_bins WHERE id = ${source_bin_id}
      `);
      
      if (sourceBinResult.rows.length === 0) {
        await db.execute(sql`ROLLBACK`);
        return res.status(404).json({ error: 'Source bin not found' });
      }
      
      // Check if destination bin exists
      const destBinResult = await db.execute(sql`
        SELECT bin_code, available_capacity FROM storage_bins WHERE id = ${destination_bin_id}
      `);
      
      if (destBinResult.rows.length === 0) {
        await db.execute(sql`ROLLBACK`);
        return res.status(404).json({ error: 'Destination bin not found' });
      }

      // Update source bin capacity
      await db.execute(sql`
        UPDATE storage_bins 
        SET available_capacity = available_capacity - ${quantity}
        WHERE id = ${source_bin_id}
      `);
      
      // Update destination bin capacity
      await db.execute(sql`
        UPDATE storage_bins 
        SET available_capacity = available_capacity + ${quantity}
        WHERE id = ${destination_bin_id}
      `);
      
      // Create a record of the outbound transfer
      const transferOutResult = await db.execute(sql`
        INSERT INTO inventory_transactions (
          product_id,
          type,
          quantity,
          reference_id,
          reference_type,
          notes,
          location,
          created_at
        )
        VALUES (
          ${product_id},
          'Transfer',
          ${-quantity}, -- negative for outbound
          ${reference_number || null},
          'Transfer',
          ${notes ? `Source bin: ${source_bin_id}, ${notes}` : `Source bin: ${source_bin_id}`},
          ${source_bin_id},
          NOW()
        )
        RETURNING id
      `);
      
      // Create the incoming transfer record
      const transferInResult = await db.execute(sql`
        INSERT INTO inventory_transactions (
          product_id,
          type,
          quantity,
          reference_id,
          reference_type,
          notes,
          location,
          created_at
        )
        VALUES (
          ${product_id},
          'Transfer',
          ${quantity}, -- positive for inbound
          ${reference_number || null},
          'Transfer',
          ${notes ? `Destination bin: ${destination_bin_id}, ${notes}` : `Destination bin: ${destination_bin_id}`},
          ${destination_bin_id},
          NOW()
        )
        RETURNING id
      `);
      
      const transferOutId = transferOutResult.rows[0].id;
      const transferInId = transferInResult.rows[0].id;
      
      // Commit the transaction
      await db.execute(sql`COMMIT`);
      
      res.status(201).json({
        success: true,
        message: 'Material transfer completed successfully',
        transfer: {
          ids: {
            outbound: transferOutId,
            inbound: transferInId
          },
          product: product.name,
          quantity,
          source_bin: sourceBinResult.rows[0].bin_code,
          destination_bin: destBinResult.rows[0].bin_code,
          date: new Date()
        }
      });
    } catch (error) {
      // If anything goes wrong, roll back the transaction
      await db.execute(sql`ROLLBACK`);
      throw error;
    }
  } catch (error) {
    console.error('Error creating material transfer:', error);
    res.status(500).json({ error: 'Failed to create material transfer' });
  }
});

// Get transfers history
router.get('/warehouse/transfers', async (req: Request, res: Response) => {
  try {
    const result = await db.execute(sql`
      SELECT 
        t.id,
        t.created_at as transaction_date,
        t.quantity,
        t.type as transaction_type,
        t.reference_id as reference_number,
        t.notes,
        p.name as product_name,
        p.sku as product_code,
        t.location as bin_location
      FROM inventory_transactions t
      LEFT JOIN products p ON t.product_id = p.id
      WHERE t.type = 'Transfer' OR t.reference_type = 'Transfer'
      ORDER BY t.created_at DESC
    `);
    
    const transfers = result.rows || [];
    
    return res.json(transfers);
  } catch (error) {
    console.error('Error fetching material transfers:', error);
    return res.status(500).json({ error: 'Failed to fetch material transfers' });
  }
});

export default router;