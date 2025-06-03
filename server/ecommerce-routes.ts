import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { z } from "zod";
import { encryptForDatabase, decryptFromDatabase } from './utils/database-encryption';

// Validation schemas
const createStoreSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  domain: z.string().min(1, "Domain is required"),
  platform: z.enum(['shopify', 'woocommerce', 'magento', 'custom']),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional()
});

const createProductSchema = z.object({
  storeId: z.number(),
  externalId: z.string(),
  title: z.string().min(1, "Product title is required"),
  description: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  price: z.number().min(0, "Price must be positive"),
  compareAtPrice: z.number().optional(),
  inventory: z.number().min(0, "Inventory must be non-negative"),
  status: z.enum(['active', 'draft', 'archived']).default('active'),
  images: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([])
});

const createOrderSchema = z.object({
  storeId: z.number(),
  externalId: z.string(),
  orderNumber: z.string().min(1, "Order number is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Valid email is required"),
  status: z.enum(['pending', 'processing', 'completed', 'cancelled', 'refunded']).default('pending'),
  total: z.number().min(0, "Total must be positive"),
  subtotal: z.number().min(0, "Subtotal must be positive"),
  tax: z.number().min(0, "Tax must be non-negative").default(0),
  shipping: z.number().min(0, "Shipping must be non-negative").default(0),
  items: z.number().min(1, "Must have at least one item"),
  fulfillmentStatus: z.enum(['unfulfilled', 'partial', 'fulfilled']).default('unfulfilled'),
  paymentStatus: z.enum(['paid', 'pending', 'refunded']).default('pending')
});

export function registerEcommerceRoutes(app: Express) {
  // Error handler
  const handleError = (res: Response, error: unknown) => {
    console.error('Ecommerce API Error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation Error", 
        details: error.errors 
      });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: message });
  };

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    next();
  };

  // STORES ENDPOINTS
  
  // Get all stores
  app.get('/api/ecommerce/stores', requireAuth, async (req: Request, res: Response) => {
    try {
      console.log('[Ecommerce] Fetching all stores');
      const stores = await storage.getEcommerceStores();
      const decryptedStores = await Promise.all(
        stores.map(store => decryptFromDatabase(store, 'ecommerce_stores'))
      );
      console.log(`[Ecommerce] Successfully retrieved ${decryptedStores.length} stores`);
      res.json(decryptedStores);
    } catch (error) {
      console.error('[Ecommerce] Error fetching stores:', error);
      handleError(res, error);
    }
  });

  // Create new store
  app.post('/api/ecommerce/stores', requireAuth, async (req: Request, res: Response) => {
    try {
      console.log('[Ecommerce] Creating new store:', req.body);
      const validatedData = createStoreSchema.parse(req.body);
      
      // Encrypt sensitive data before storing
      const encryptedData = await encryptForDatabase(validatedData, 'ecommerce_stores');
      
      const store = await storage.createEcommerceStore({
        ...encryptedData,
        status: 'pending',
        connectedAt: new Date().toISOString()
      });
      
      const decryptedStore = await decryptFromDatabase(store, 'ecommerce_stores');
      console.log(`[Ecommerce] Successfully created store with ID ${store.id}`);
      res.status(201).json(decryptedStore);
    } catch (error) {
      console.error('[Ecommerce] Error creating store:', error);
      handleError(res, error);
    }
  });

  // Sync store data
  app.post('/api/ecommerce/stores/:id/sync', requireAuth, async (req: Request, res: Response) => {
    try {
      const storeId = parseInt(req.params.id);
      console.log(`[Ecommerce] Syncing store ${storeId}`);
      
      const store = await storage.getEcommerceStore(storeId);
      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      // Update store status to active after sync
      await storage.updateEcommerceStore(storeId, { 
        status: 'active',
        connectedAt: new Date().toISOString()
      });

      console.log(`[Ecommerce] Successfully synced store ${storeId}`);
      res.json({ success: true, message: 'Store data synchronized successfully' });
    } catch (error) {
      console.error('[Ecommerce] Error syncing store:', error);
      handleError(res, error);
    }
  });

  // PRODUCTS ENDPOINTS

  // Get products (optionally filtered by store)
  app.get('/api/ecommerce/products', requireAuth, async (req: Request, res: Response) => {
    try {
      const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
      console.log(`[Ecommerce] Fetching products${storeId ? ` for store ${storeId}` : ''}`);
      
      const products = await storage.getEcommerceProducts(storeId);
      const decryptedProducts = await Promise.all(
        products.map(product => decryptFromDatabase(product, 'ecommerce_products'))
      );
      
      console.log(`[Ecommerce] Successfully retrieved ${decryptedProducts.length} products`);
      res.json(decryptedProducts);
    } catch (error) {
      console.error('[Ecommerce] Error fetching products:', error);
      handleError(res, error);
    }
  });

  // Create new product
  app.post('/api/ecommerce/products', requireAuth, async (req: Request, res: Response) => {
    try {
      console.log('[Ecommerce] Creating new product:', req.body);
      const validatedData = createProductSchema.parse(req.body);
      
      const encryptedData = await encryptForDatabase(validatedData, 'ecommerce_products');
      const product = await storage.createEcommerceProduct(encryptedData);
      const decryptedProduct = await decryptFromDatabase(product, 'ecommerce_products');
      
      console.log(`[Ecommerce] Successfully created product with ID ${product.id}`);
      res.status(201).json(decryptedProduct);
    } catch (error) {
      console.error('[Ecommerce] Error creating product:', error);
      handleError(res, error);
    }
  });

  // ORDERS ENDPOINTS

  // Get orders (optionally filtered by store)
  app.get('/api/ecommerce/orders', requireAuth, async (req: Request, res: Response) => {
    try {
      const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
      console.log(`[Ecommerce] Fetching orders${storeId ? ` for store ${storeId}` : ''}`);
      
      const orders = await storage.getEcommerceOrders(storeId);
      const decryptedOrders = await Promise.all(
        orders.map(order => decryptFromDatabase(order, 'ecommerce_orders'))
      );
      
      console.log(`[Ecommerce] Successfully retrieved ${decryptedOrders.length} orders`);
      res.json(decryptedOrders);
    } catch (error) {
      console.error('[Ecommerce] Error fetching orders:', error);
      handleError(res, error);
    }
  });

  // Create new order
  app.post('/api/ecommerce/orders', requireAuth, async (req: Request, res: Response) => {
    try {
      console.log('[Ecommerce] Creating new order:', req.body);
      const validatedData = createOrderSchema.parse(req.body);
      
      const encryptedData = await encryptForDatabase(validatedData, 'ecommerce_orders');
      const order = await storage.createEcommerceOrder(encryptedData);
      const decryptedOrder = await decryptFromDatabase(order, 'ecommerce_orders');
      
      console.log(`[Ecommerce] Successfully created order with ID ${order.id}`);
      res.status(201).json(decryptedOrder);
    } catch (error) {
      console.error('[Ecommerce] Error creating order:', error);
      handleError(res, error);
    }
  });

  // ANALYTICS ENDPOINTS

  // Get analytics data
  app.get('/api/ecommerce/analytics', requireAuth, async (req: Request, res: Response) => {
    try {
      const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
      console.log(`[Ecommerce] Generating analytics${storeId ? ` for store ${storeId}` : ''}`);
      
      const analytics = await storage.getEcommerceAnalytics(storeId);
      
      console.log('[Ecommerce] Successfully generated analytics');
      res.json(analytics);
    } catch (error) {
      console.error('[Ecommerce] Error generating analytics:', error);
      handleError(res, error);
    }
  });

  console.log('[Ecommerce] E-commerce routes registered successfully');
}