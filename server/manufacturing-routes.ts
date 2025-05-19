import { Request, Response, Router } from 'express';
import { db } from './db';
import { and, eq, like, desc, sql } from 'drizzle-orm';
import { 
  materials, 
  materialCategories,
  storageLocations,
  vendors,
  vendorContracts,
  vendorProducts,
  batchLots,
  materialValuations,
  materialValuationMethods,
  mrpForecasts,
  mrpForecastItems,
  materialRequirements
} from '../shared/manufacturing-schema';

const router = Router();

// MATERIALS

// Get all materials
router.get('/materials', async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(materials)
      .leftJoin(materialCategories, eq(materials.categoryId, materialCategories.id));
    
    return res.json(result);
  } catch (error) {
    console.error('Error fetching materials:', error);
    return res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

// Get material by ID
router.get('/materials/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await db.select().from(materials)
      .where(eq(materials.id, parseInt(id)))
      .leftJoin(materialCategories, eq(materials.categoryId, materialCategories.id));
    
    if (!result) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    return res.json(result);
  } catch (error) {
    console.error('Error fetching material:', error);
    return res.status(500).json({ error: 'Failed to fetch material' });
  }
});

// Create material
router.post('/materials', async (req: Request, res: Response) => {
  try {
    const materialData = req.body;
    
    // Add audit fields
    materialData.createdBy = req.user?.id || null;
    
    const [result] = await db.insert(materials).values(materialData).returning();
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating material:', error);
    return res.status(500).json({ error: 'Failed to create material' });
  }
});

// Update material
router.put('/materials/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const materialData = req.body;
    
    // Add audit fields
    materialData.updatedAt = new Date();
    materialData.updatedBy = req.user?.id || null;
    
    const [result] = await db.update(materials)
      .set(materialData)
      .where(eq(materials.id, parseInt(id)))
      .returning();
    
    if (!result) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    return res.json(result);
  } catch (error) {
    console.error('Error updating material:', error);
    return res.status(500).json({ error: 'Failed to update material' });
  }
});

// Delete material
router.delete('/materials/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.delete(materials)
      .where(eq(materials.id, parseInt(id)))
      .returning();
    
    if (!result) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    return res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Error deleting material:', error);
    return res.status(500).json({ error: 'Failed to delete material' });
  }
});

// STORAGE LOCATIONS

// Get all storage locations with hierarchical structure
router.get('/storage/locations', async (req: Request, res: Response) => {
  try {
    // This is a simplistic approach - for a full hierarchical query, you would need a recursive CTE
    const result = await db.select().from(storageLocations)
      .orderBy(storageLocations.parentId, storageLocations.name);
    
    // Build hierarchy
    const locationMap = new Map();
    result.forEach(location => {
      locationMap.set(location.id, { ...location, children: [] });
    });
    
    const rootLocations = [];
    result.forEach(location => {
      const locationWithChildren = locationMap.get(location.id);
      if (location.parentId && locationMap.has(location.parentId)) {
        locationMap.get(location.parentId).children.push(locationWithChildren);
      } else {
        rootLocations.push(locationWithChildren);
      }
    });
    
    return res.json(rootLocations);
  } catch (error) {
    console.error('Error fetching storage locations:', error);
    return res.status(500).json({ error: 'Failed to fetch storage locations' });
  }
});

// Get all storage bins with utilization data
router.get('/warehouse/bins', async (req: Request, res: Response) => {
  try {
    // SQL query to get storage bins with utilization data
    const bins = await db.execute(sql`
      WITH bin_utilization AS (
        SELECT 
          s.id, 
          COALESCE(SUM(b.quantity), 0) as used_capacity,
          s.capacity as total_capacity
        FROM ${storageLocations} s
        LEFT JOIN ${batchLots} b ON s.id = b.location_id
        WHERE s.type = 'Bin'
        GROUP BY s.id, s.capacity
      )
      SELECT 
        s.*,
        p.name as parent_name,
        bu.used_capacity,
        bu.total_capacity,
        CASE 
          WHEN bu.total_capacity > 0 THEN ROUND((bu.used_capacity / bu.total_capacity) * 100)
          ELSE 0
        END as utilization_percentage
      FROM ${storageLocations} s
      LEFT JOIN ${storageLocations} p ON s.parent_id = p.id
      LEFT JOIN bin_utilization bu ON s.id = bu.id
      WHERE s.type = 'Bin'
      ORDER BY s.name
    `);
    
    return res.json(bins);
  } catch (error) {
    console.error('Error fetching storage bins:', error);
    return res.status(500).json({ error: 'Failed to fetch storage bins' });
  }
});

// Create storage location
router.post('/storage/locations', async (req: Request, res: Response) => {
  try {
    const locationData = req.body;
    
    // Add audit fields
    locationData.createdBy = req.user?.id || null;
    
    const [result] = await db.insert(storageLocations).values(locationData).returning();
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating storage location:', error);
    return res.status(500).json({ error: 'Failed to create storage location' });
  }
});

// VENDORS

// Get all vendors
router.get('/vendors', async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(vendors);
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
    
    const [vendor] = await db.select().from(vendors)
      .where(eq(vendors.id, parseInt(id)));
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    const contracts = await db.select().from(vendorContracts)
      .where(eq(vendorContracts.vendorId, parseInt(id)));
    
    const products = await db.select({
      ...vendorProducts,
      materialName: materials.name
    })
    .from(vendorProducts)
    .leftJoin(materials, eq(vendorProducts.materialId, materials.id))
    .where(eq(vendorProducts.vendorId, parseInt(id)));
    
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

// Create vendor
router.post('/vendors', async (req: Request, res: Response) => {
  try {
    const vendorData = req.body;
    
    // Add audit fields
    vendorData.createdBy = req.user?.id || null;
    
    const [result] = await db.insert(vendors).values(vendorData).returning();
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating vendor:', error);
    return res.status(500).json({ error: 'Failed to create vendor' });
  }
});

// BATCH LOTS

// Get all batch lots
router.get('/batch-lots', async (req: Request, res: Response) => {
  try {
    const result = await db.select({
      ...batchLots,
      materialName: materials.name,
      materialCode: materials.code,
      locationName: storageLocations.name,
      vendorName: vendors.name
    })
    .from(batchLots)
    .leftJoin(materials, eq(batchLots.materialId, materials.id))
    .leftJoin(storageLocations, eq(batchLots.locationId, storageLocations.id))
    .leftJoin(vendors, eq(batchLots.vendorId, vendors.id))
    .orderBy(desc(batchLots.createdAt));
    
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
    
    const result = await db.select({
      ...batchLots,
      materialName: materials.name,
      locationName: storageLocations.name,
      daysRemaining: sql`DATE_PART('day', ${batchLots.expirationDate}::timestamp - CURRENT_DATE::timestamp)::integer`
    })
    .from(batchLots)
    .leftJoin(materials, eq(batchLots.materialId, materials.id))
    .leftJoin(storageLocations, eq(batchLots.locationId, storageLocations.id))
    .where(
      and(
        sql`${batchLots.expirationDate} IS NOT NULL`,
        sql`${batchLots.expirationDate} >= CURRENT_DATE`,
        sql`${batchLots.expirationDate} <= '${futureDate.toISOString()}'::date`
      )
    )
    .orderBy(batchLots.expirationDate);
    
    return res.json(result);
  } catch (error) {
    console.error('Error fetching expiring batch lots:', error);
    return res.status(500).json({ error: 'Failed to fetch expiring batch lots' });
  }
});

// Create batch lot
router.post('/batch-lots', async (req: Request, res: Response) => {
  try {
    const batchData = req.body;
    
    // Add audit fields
    batchData.createdBy = req.user?.id || null;
    
    // Ensure remainingQuantity equals quantity for new batches
    if (!batchData.remainingQuantity) {
      batchData.remainingQuantity = batchData.quantity;
    }
    
    const [result] = await db.insert(batchLots).values(batchData).returning();
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating batch lot:', error);
    return res.status(500).json({ error: 'Failed to create batch lot' });
  }
});

// MATERIAL VALUATIONS

// Get valuation methods
router.get('/valuation-methods', async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(materialValuationMethods);
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
    
    let query = db.select({
      ...materialValuations,
      materialName: materials.name,
      materialCode: materials.code,
      valuationMethodName: materialValuationMethods.name
    })
    .from(materialValuations)
    .leftJoin(materials, eq(materialValuations.materialId, materials.id))
    .leftJoin(materialValuationMethods, eq(materialValuations.valuationMethod, materialValuationMethods.name));
    
    if (method) {
      query = query.where(eq(materialValuations.valuationMethod, method));
    }
    
    const result = await query.orderBy(materials.name);
    
    return res.json(result);
  } catch (error) {
    console.error('Error fetching material valuations:', error);
    return res.status(500).json({ error: 'Failed to fetch material valuations' });
  }
});

// Calculate and save material valuations
router.post('/valuations/calculate', async (req: Request, res: Response) => {
  try {
    const { methodId, materialIds } = req.body;
    
    // Here you would implement your valuation calculation logic based on the method
    // This is a simplified example
    const [method] = await db.select().from(materialValuationMethods).where(eq(materialValuationMethods.id, methodId));
    
    if (!method) {
      return res.status(404).json({ error: 'Valuation method not found' });
    }
    
    let materialsQuery = db.select().from(materials);
    if (materialIds && materialIds.length > 0) {
      materialsQuery = materialsQuery.where(sql`${materials.id} IN (${materialIds.join(',')})`);
    }
    
    const materialsToValue = await materialsQuery;
    
    // Perform valuation calculation
    const valuationDate = new Date();
    const valuations = [];
    
    for (const material of materialsToValue) {
      // This would be replaced with your actual valuation logic
      // For example, calculating FIFO, LIFO, Moving Average, etc.
      
      // Placeholder calculation for demo purposes
      const batches = await db.select().from(batchLots).where(eq(batchLots.materialId, material.id));
      const totalQuantity = batches.reduce((sum, batch) => sum + parseFloat(batch.remainingQuantity.toString()), 0);
      const totalCost = batches.reduce((sum, batch) => {
        if (batch.cost) {
          return sum + (parseFloat(batch.remainingQuantity.toString()) * parseFloat(batch.cost.toString()));
        }
        return sum;
      }, 0);
      
      const unitValue = totalQuantity > 0 ? totalCost / totalQuantity : parseFloat(material.price?.toString() || '0');
      const totalValue = unitValue * totalQuantity;
      
      // Save valuation
      const [valuation] = await db.insert(materialValuations).values({
        materialId: material.id,
        valuationMethod: method.name,
        valuationDate,
        unitValue,
        totalValue,
        quantity: totalQuantity,
        createdAt: new Date(),
        createdBy: req.user?.id || null
      }).returning();
      
      valuations.push(valuation);
    }
    
    // Update the last calculated timestamp
    await db.update(materialValuationMethods)
      .set({ lastCalculated: new Date(), updatedAt: new Date(), updatedBy: req.user?.id || null })
      .where(eq(materialValuationMethods.id, methodId));
    
    return res.json(valuations);
  } catch (error) {
    console.error('Error calculating valuations:', error);
    return res.status(500).json({ error: 'Failed to calculate valuations' });
  }
});

// MRP DASHBOARD

// Get MRP dashboard data
router.get('/mrp/dashboard', async (req: Request, res: Response) => {
  try {
    // Get active forecasts
    const forecasts = await db.select().from(mrpForecasts)
      .where(eq(mrpForecasts.status, 'Active'))
      .orderBy(desc(mrpForecasts.createdAt))
      .limit(5);
    
    // Get material requirements
    const requirements = await db.select({
      ...materialRequirements,
      materialName: materials.name,
      materialCode: materials.code
    })
    .from(materialRequirements)
    .leftJoin(materials, eq(materialRequirements.materialId, materials.id))
    .where(eq(materialRequirements.fulfilled, false))
    .orderBy(materialRequirements.requirementDate)
    .limit(10);
    
    // Get low stock materials
    const lowStockItems = await db.execute(sql`
      WITH current_stock AS (
        SELECT 
          m.id as material_id,
          m.name as material_name,
          m.code as material_code,
          m.reorder_point,
          m.min_stock,
          COALESCE(SUM(b.remaining_quantity), 0) as current_quantity
        FROM ${materials} m
        LEFT JOIN ${batchLots} b ON m.id = b.material_id AND b.status = 'Available'
        GROUP BY m.id, m.name, m.code, m.reorder_point, m.min_stock
      )
      SELECT *
      FROM current_stock
      WHERE current_quantity <= COALESCE(reorder_point, 0)
      ORDER BY current_quantity ASC
      LIMIT 10
    `);
    
    // Get upcoming material requirements
    const upcomingRequirements = await db.execute(sql`
      WITH material_needs AS (
        SELECT 
          m.id as material_id,
          m.name as material_name,
          m.code as material_code,
          COALESCE(SUM(r.quantity), 0) as required_quantity,
          MIN(r.requirement_date) as earliest_required_date,
          COALESCE(SUM(b.remaining_quantity), 0) as available_quantity
        FROM ${materials} m
        LEFT JOIN ${materialRequirements} r ON m.id = r.material_id AND r.fulfilled = false
        LEFT JOIN ${batchLots} b ON m.id = b.material_id AND b.status = 'Available'
        WHERE r.requirement_date IS NOT NULL
        GROUP BY m.id, m.name, m.code
      )
      SELECT 
        material_id,
        material_name,
        material_code,
        required_quantity,
        available_quantity,
        earliest_required_date,
        CASE 
          WHEN available_quantity >= required_quantity THEN 'Sufficient'
          ELSE 'Shortage'
        END as status,
        CASE
          WHEN available_quantity >= required_quantity THEN 100
          WHEN required_quantity > 0 THEN ROUND((available_quantity / required_quantity) * 100)
          ELSE 0
        END as coverage_percentage
      FROM material_needs
      WHERE required_quantity > 0
      ORDER BY earliest_required_date ASC
      LIMIT 10
    `);
    
    return res.json({
      forecasts,
      requirements,
      lowStockItems,
      upcomingRequirements
    });
  } catch (error) {
    console.error('Error fetching MRP dashboard data:', error);
    return res.status(500).json({ error: 'Failed to fetch MRP dashboard data' });
  }
});

export default router;