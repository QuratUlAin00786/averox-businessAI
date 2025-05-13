// Bill of Materials routes for the manufacturing module
import { Router, Request, Response } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";

// Initialize Router
const router = Router();

// Get all BOMs
router.get('/', async (req: Request, res: Response) => {
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
router.get('/:id', async (req: Request, res: Response) => {
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
        b.yield as yield_percentage,
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
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      product_id,
      version = '1.0',
      name,
      description = '',
      is_active = true,
      manufacturing_type = 'Discrete',
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
        ${manufacturing_type},
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
router.post('/:id/items', async (req: Request, res: Response) => {
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
      SELECT id, product_id FROM bill_of_materials WHERE id = ${id}
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
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      is_active,
      manufacturing_type,
      notes,
      revision_notes,
      yield_percentage,
      total_cost,
      approved_by,
      approval_date
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
    
    if (manufacturing_type !== undefined) {
      updateFields = sql`${updateFields}${isFirstField ? '' : ', '}manufacturing_type = ${manufacturing_type}`;
      isFirstField = false;
    }
    
    if (notes !== undefined) {
      updateFields = sql`${updateFields}${isFirstField ? '' : ', '}notes = ${notes}`;
      isFirstField = false;
    }
    
    if (revision_notes !== undefined) {
      updateFields = sql`${updateFields}${isFirstField ? '' : ', '}revision_notes = ${revision_notes}`;
      isFirstField = false;
    }
    
    if (yield_percentage !== undefined) {
      updateFields = sql`${updateFields}${isFirstField ? '' : ', '}yield = ${yield_percentage}`;
      isFirstField = false;
    }
    
    if (total_cost !== undefined) {
      updateFields = sql`${updateFields}${isFirstField ? '' : ', '}total_cost = ${total_cost}`;
      isFirstField = false;
    }
    
    if (approved_by !== undefined) {
      updateFields = sql`${updateFields}${isFirstField ? '' : ', '}approved_by = ${approved_by}`;
      isFirstField = false;
    }
    
    if (approval_date !== undefined) {
      updateFields = sql`${updateFields}${isFirstField ? '' : ', '}approval_date = ${approval_date}`;
      isFirstField = false;
    }
    
    // If no fields were provided to update
    if (isFirstField) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }
    
    // Check if the BOM exists
    const bomCheck = await db.execute(sql`
      SELECT id FROM bill_of_materials WHERE id = ${id}
    `);
    
    if (!bomCheck.rows || bomCheck.rows.length === 0) {
      return res.status(404).json({ error: 'BOM not found' });
    }
    
    // Execute the update
    const result = await db.execute(sql`
      UPDATE bill_of_materials
      SET ${updateFields}
      WHERE id = ${id}
      RETURNING id, name, is_active, revision_notes
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
router.delete('/:bomId/items/:itemId', async (req: Request, res: Response) => {
  try {
    const { bomId, itemId } = req.params;
    
    // Check if the BOM exists
    const bomCheck = await db.execute(sql`
      SELECT id FROM bill_of_materials WHERE id = ${bomId}
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
router.post('/:id/copy', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { new_version, new_name } = req.body;
    
    if (!new_version) {
      return res.status(400).json({ error: 'New version is required' });
    }
    
    // Check if the source BOM exists
    const bomCheck = await db.execute(sql`
      SELECT product_id, name, description, manufacturing_type FROM bill_of_materials WHERE id = ${id}
    `);
    
    if (!bomCheck.rows || bomCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Source BOM not found' });
    }
    
    const sourceBom = bomCheck.rows[0];
    
    // Check if a BOM with the new version already exists
    const versionCheck = await db.execute(sql`
      SELECT id FROM bill_of_materials WHERE product_id = ${sourceBom.product_id} AND version = ${new_version}
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
        INSERT INTO bill_of_materials (
          product_id,
          version,
          name,
          description,
          is_active,
          created_at,
          created_by,
          revision_notes,
          manufacturing_type
        )
        VALUES (
          ${sourceBom.product_id},
          ${new_version},
          ${new_name || `${sourceBom.name} (${new_version})`},
          ${sourceBom.description},
          true,
          ${new Date().toISOString()},
          ${req.user?.id || 1},
          'Copied from version ${id}',
          ${sourceBom.manufacturing_type}
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

export default router;