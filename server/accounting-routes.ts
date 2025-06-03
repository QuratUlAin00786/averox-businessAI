import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { z } from "zod";
import { encryptForDatabase, decryptFromDatabase } from './utils/database-encryption';

// Validation schemas
const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.number().min(0, "Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.number().optional(),
  accountId: z.number(),
  referenceNumber: z.string().optional(),
  tags: z.array(z.string()).default([]),
  contactId: z.number().optional(),
  attachments: z.array(z.string()).default([])
});

const createAccountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  subType: z.string().optional(),
  balance: z.number().default(0),
  currency: z.string().default('USD'),
  isActive: z.boolean().default(true)
});

const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  type: z.enum(['income', 'expense']),
  parentId: z.number().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true)
});

export function registerAccountingRoutes(app: Express) {
  // Error handler
  const handleError = (res: Response, error: unknown) => {
    console.error('Accounting API Error:', error);
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

  // TRANSACTIONS ENDPOINTS
  
  // Get all transactions
  app.get('/api/accounting/transactions', requireAuth, async (req: Request, res: Response) => {
    try {
      console.log('[Accounting] Fetching all transactions');
      const transactions = await storage.getAccountingTransactions();
      const decryptedTransactions = await Promise.all(
        transactions.map(transaction => decryptFromDatabase(transaction, 'accounting_transactions'))
      );
      console.log(`[Accounting] Successfully retrieved ${decryptedTransactions.length} transactions`);
      res.json(decryptedTransactions);
    } catch (error) {
      console.error('[Accounting] Error fetching transactions:', error);
      handleError(res, error);
    }
  });

  // Create new transaction
  app.post('/api/accounting/transactions', requireAuth, async (req: Request, res: Response) => {
    try {
      console.log('[Accounting] Creating new transaction:', req.body);
      const validatedData = createTransactionSchema.parse(req.body);
      
      const encryptedData = await encryptForDatabase(validatedData, 'accounting_transactions');
      const transaction = await storage.createAccountingTransaction(encryptedData);
      const decryptedTransaction = await decryptFromDatabase(transaction, 'accounting_transactions');
      
      console.log(`[Accounting] Successfully created transaction with ID ${transaction.id}`);
      res.status(201).json(decryptedTransaction);
    } catch (error) {
      console.error('[Accounting] Error creating transaction:', error);
      handleError(res, error);
    }
  });

  // Get transaction by ID
  app.get('/api/accounting/transactions/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const transactionId = parseInt(req.params.id);
      console.log(`[Accounting] Fetching transaction ${transactionId}`);
      
      const transaction = await storage.getAccountingTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      const decryptedTransaction = await decryptFromDatabase(transaction, 'accounting_transactions');
      console.log(`[Accounting] Successfully retrieved transaction ${transactionId}`);
      res.json(decryptedTransaction);
    } catch (error) {
      console.error('[Accounting] Error fetching transaction:', error);
      handleError(res, error);
    }
  });

  // ACCOUNTS ENDPOINTS
  
  // Get all accounts
  app.get('/api/accounting/accounts', requireAuth, async (req: Request, res: Response) => {
    try {
      console.log('[Accounting] Fetching all accounts');
      const accounts = await storage.getAccountingAccounts();
      const decryptedAccounts = await Promise.all(
        accounts.map(account => decryptFromDatabase(account, 'accounting_accounts'))
      );
      console.log(`[Accounting] Successfully retrieved ${decryptedAccounts.length} accounts`);
      res.json(decryptedAccounts);
    } catch (error) {
      console.error('[Accounting] Error fetching accounts:', error);
      handleError(res, error);
    }
  });

  // Create new account
  app.post('/api/accounting/accounts', requireAuth, async (req: Request, res: Response) => {
    try {
      console.log('[Accounting] Creating new account:', req.body);
      const validatedData = createAccountSchema.parse(req.body);
      
      const encryptedData = await encryptForDatabase(validatedData, 'accounting_accounts');
      const account = await storage.createAccountingAccount(encryptedData);
      const decryptedAccount = await decryptFromDatabase(account, 'accounting_accounts');
      
      console.log(`[Accounting] Successfully created account with ID ${account.id}`);
      res.status(201).json(decryptedAccount);
    } catch (error) {
      console.error('[Accounting] Error creating account:', error);
      handleError(res, error);
    }
  });

  // CATEGORIES ENDPOINTS
  
  // Get all categories
  app.get('/api/accounting/categories', requireAuth, async (req: Request, res: Response) => {
    try {
      console.log('[Accounting] Fetching all categories');
      const categories = await storage.getAccountingCategories();
      const decryptedCategories = await Promise.all(
        categories.map(category => decryptFromDatabase(category, 'accounting_categories'))
      );
      console.log(`[Accounting] Successfully retrieved ${decryptedCategories.length} categories`);
      res.json(decryptedCategories);
    } catch (error) {
      console.error('[Accounting] Error fetching categories:', error);
      handleError(res, error);
    }
  });

  // Create new category
  app.post('/api/accounting/categories', requireAuth, async (req: Request, res: Response) => {
    try {
      console.log('[Accounting] Creating new category:', req.body);
      const validatedData = createCategorySchema.parse(req.body);
      
      const encryptedData = await encryptForDatabase(validatedData, 'accounting_categories');
      const category = await storage.createAccountingCategory(encryptedData);
      const decryptedCategory = await decryptFromDatabase(category, 'accounting_categories');
      
      console.log(`[Accounting] Successfully created category with ID ${category.id}`);
      res.status(201).json(decryptedCategory);
    } catch (error) {
      console.error('[Accounting] Error creating category:', error);
      handleError(res, error);
    }
  });

  // REPORTS ENDPOINTS
  
  // Get profit & loss report
  app.get('/api/accounting/reports/profit-loss', requireAuth, async (req: Request, res: Response) => {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      console.log(`[Accounting] Generating profit & loss report for ${startDate} to ${endDate}`);
      const report = await storage.getAccountingProfitLossReport(startDate, endDate);
      
      console.log('[Accounting] Successfully generated profit & loss report');
      res.json(report);
    } catch (error) {
      console.error('[Accounting] Error generating profit & loss report:', error);
      handleError(res, error);
    }
  });

  // Get balance sheet
  app.get('/api/accounting/reports/balance-sheet', requireAuth, async (req: Request, res: Response) => {
    try {
      const asOfDate = req.query.asOfDate as string;
      
      console.log(`[Accounting] Generating balance sheet as of ${asOfDate}`);
      const report = await storage.getAccountingBalanceSheet(asOfDate);
      
      console.log('[Accounting] Successfully generated balance sheet');
      res.json(report);
    } catch (error) {
      console.error('[Accounting] Error generating balance sheet:', error);
      handleError(res, error);
    }
  });

  // Get cash flow statement
  app.get('/api/accounting/reports/cash-flow', requireAuth, async (req: Request, res: Response) => {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      console.log(`[Accounting] Generating cash flow statement for ${startDate} to ${endDate}`);
      const report = await storage.getAccountingCashFlowStatement(startDate, endDate);
      
      console.log('[Accounting] Successfully generated cash flow statement');
      res.json(report);
    } catch (error) {
      console.error('[Accounting] Error generating cash flow statement:', error);
      handleError(res, error);
    }
  });

  console.log('[Accounting] Accounting routes registered successfully');
}