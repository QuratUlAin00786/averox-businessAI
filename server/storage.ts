import { 
  users, type User, type InsertUser,
  contacts, type Contact, type InsertContact,
  accounts, type Account, type InsertAccount,
  leads, type Lead, type InsertLead,
  opportunities, type Opportunity, type InsertOpportunity,
  tasks, type Task, type InsertTask,
  events, type Event, type InsertEvent,
  activities, type Activity, type InsertActivity,
  subscriptionPackages, type SubscriptionPackage, type InsertSubscriptionPackage,
  userSubscriptions, type UserSubscription, type InsertUserSubscription,
  socialIntegrations, type SocialIntegration, type InsertSocialIntegration,
  socialMessages, type SocialMessage, type InsertSocialMessage,
  leadSources, type LeadSource, type InsertLeadSource,
  socialCampaigns, type SocialCampaign, type InsertSocialCampaign,
  apiKeys, type ApiKey, type InsertApiKey,
  workflows, type Workflow, type InsertWorkflow,
  productCategoriesTable, type ProductCategory, type InsertProductCategory,
  products, type Product, type InsertProduct,
  inventoryTransactions, type InventoryTransaction, type InsertInventoryTransaction,
  systemSettings, type SystemSetting, type InsertSystemSetting, type SystemSettings, type MenuVisibilitySettings,
  invoices, type Invoice, type InsertInvoice,
  invoiceItems, type InvoiceItem, type InsertInvoiceItem,
  purchaseOrders, type PurchaseOrder, type InsertPurchaseOrder,
  purchaseOrderItems, type PurchaseOrderItem, type InsertPurchaseOrderItem,
  // Proposal schemas
  proposalTemplates, type ProposalTemplate, type InsertProposalTemplate,
  proposals, type Proposal, type InsertProposal,
  proposalElements, type ProposalElement, type InsertProposalElement,
  proposalCollaborators, type ProposalCollaborator, type InsertProposalCollaborator,
  proposalComments, type ProposalComment, type InsertProposalComment,
  proposalActivities, type ProposalActivity, type InsertProposalActivity,
  // Permission schemas
  modulePermissions, type ModulePermission, type InsertModulePermission,
  rolePermissions, type RolePermission, type InsertRolePermission,
  userPermissions, type UserPermission, type InsertUserPermission,
  teams, type Team, type InsertTeam,
  teamMembers, type TeamMember, type InsertTeamMember,
  assignments, type Assignment, type InsertAssignment
} from "@shared/schema";
import { 
  MemStorageSocialMediaIntegrations, 
  DatabaseStorageSocialMediaIntegrations 
} from './social-media-storage';
import {
  addCommunicationsToMemStorage,
  addCommunicationsToDatabase
} from './communication-integration';
import { eq, and, desc, asc, sql, gte } from "drizzle-orm";
import { db } from './db';
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { pool } from './db';

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Import Communication types
import { Communication, CommunicationContact } from "./communication-integration";
import { InsertCommunication } from "@shared/schema";

export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // System Settings
  getSystemSettings(userId: number): Promise<SystemSettings>;
  saveSystemSettings(userId: number, settings: SystemSettings): Promise<SystemSettings>;
  
  // Communication center methods
  getAllCommunications(): Promise<Communication[]>;
  getContactCommunications(contactId: number, contactType: 'lead' | 'customer'): Promise<Communication[]>;
  getRelatedCommunications(relatedToType: string, relatedToId: number): Promise<Communication[]>;
  updateCommunicationStatus(id: number, status: 'unread' | 'read' | 'replied' | 'archived'): Promise<Communication | null>;
  createCommunication(data: {
    contactId: number;
    contactType: 'lead' | 'customer';
    channel: string;
    direction: 'inbound' | 'outbound';
    content: string;
    status?: 'unread' | 'read' | 'replied' | 'archived';
    sentAt?: Date;
    receivedAt?: Date;
    attachments?: Array<{name: string, url: string}>;
    relatedToType?: string;
    relatedToId?: number;
  }): Promise<Communication>;
  
  // Contacts
  getContact(id: number): Promise<Contact | undefined>;
  listContacts(filter?: Partial<Contact>): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;
  
  // Accounts
  getAccount(id: number): Promise<Account | undefined>;
  listAccounts(filter?: Partial<Account>): Promise<Account[]>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined>;
  deleteAccount(id: number): Promise<boolean>;
  
  // Leads
  getLead(id: number): Promise<Lead | undefined>;
  listLeads(filter?: Partial<Lead>): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;
  convertLead(id: number, convertTo: { contact?: InsertContact, account?: InsertAccount, opportunity?: InsertOpportunity }): Promise<{ contact?: Contact, account?: Account, opportunity?: Opportunity, lead: Lead }>;
  
  // Opportunities
  getOpportunity(id: number): Promise<Opportunity | undefined>;
  listOpportunities(filter?: Partial<Opportunity>): Promise<Opportunity[]>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  updateOpportunity(id: number, opportunity: Partial<InsertOpportunity>): Promise<Opportunity | undefined>;
  deleteOpportunity(id: number): Promise<boolean>;
  
  // Tasks
  getTask(id: number): Promise<Task | undefined>;
  listTasks(filter?: Partial<Task>): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Events
  getEvent(id: number): Promise<Event | undefined>;
  listEvents(filter?: Partial<Event>): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Activities
  getActivity(id: number): Promise<Activity | undefined>;
  listActivities(filter?: Partial<Activity>): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Dashboard
  getDashboardStats(): Promise<{
    newLeads: number;
    conversionRate: string;
    revenue: string;
    openDeals: number;
  }>;
  getSalesPipeline(): Promise<{
    stages: {
      name: string;
      value: string;
      percentage: number;
    }[];
  }>;
  
  // Reports
  getSalesReport(timeRange: string): Promise<{
    monthlyData: {
      name: string;
      deals: number;
      value: number;
    }[];
    pipelineStages: {
      name: string;
      value: number;
    }[];
  }>;
  
  getLeadsReport(timeRange: string): Promise<{
    sourceData: {
      name: string;
      value: number;
    }[];
    trendData: {
      name: string;
      newLeads: number;
      converted: number;
    }[];
  }>;
  
  getConversionReport(timeRange: string): Promise<{
    conversionRate: number;
    previousRate: number;
    avgTimeToConvert: number;
    previousTime: number;
    bestChannel: {
      name: string;
      rate: number;
    };
    weeklyData: {
      name: string;
      newLeads: number;
      converted: number;
    }[];
  }>;
  
  getTeamPerformanceReport(timeRange: string): Promise<{
    teamMembers: {
      name: string;
      deals: number;
      revenue: number;
      conversion: number;
    }[];
  }>;
  
  // Subscription Packages
  getSubscriptionPackage(id: number): Promise<SubscriptionPackage | undefined>;
  listSubscriptionPackages(filter?: Partial<SubscriptionPackage>): Promise<SubscriptionPackage[]>;
  createSubscriptionPackage(pkg: InsertSubscriptionPackage): Promise<SubscriptionPackage>;
  updateSubscriptionPackage(id: number, pkg: Partial<InsertSubscriptionPackage>): Promise<SubscriptionPackage | undefined>;
  deleteSubscriptionPackage(id: number): Promise<boolean>;
  
  // User Subscriptions
  getUserSubscription(id: number): Promise<UserSubscription | undefined>;
  getUserActiveSubscription(userId: number): Promise<UserSubscription | undefined>;
  listUserSubscriptions(filter?: Partial<UserSubscription>): Promise<UserSubscription[]>;
  createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription>;
  updateUserSubscription(id: number, subscription: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined>;
  cancelUserSubscription(id: number): Promise<UserSubscription | undefined>;
  deleteUserSubscription(id: number): Promise<boolean>;
  
  // User Account Management
  updateUserStripeInfo(userId: number, stripeInfo: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User | undefined>;
  updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User | undefined>;
  
  // Social Media Integrations
  getSocialIntegration(id: number): Promise<SocialIntegration | undefined>;
  listSocialIntegrations(filter?: Partial<SocialIntegration>): Promise<SocialIntegration[]>;
  getUserSocialIntegrations(userId: number): Promise<SocialIntegration[]>;
  createSocialIntegration(integration: InsertSocialIntegration): Promise<SocialIntegration>;
  updateSocialIntegration(id: number, integration: Partial<InsertSocialIntegration>): Promise<SocialIntegration | undefined>;
  deleteSocialIntegration(id: number): Promise<boolean>;
  
  // Team Management
  listTeams(): Promise<Team[]>;
  getAllTeams(): Promise<Team[]>;
  getTeamById(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, updates: Partial<InsertTeam>): Promise<Team>;
  deleteTeam(id: number): Promise<boolean>;
  
  // Team Members
  getTeamMembers(teamId: number): Promise<(TeamMember & { user?: User })[]>;
  addTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: number, updates: Partial<InsertTeamMember>): Promise<TeamMember>;
  removeTeamMember(id: number): Promise<boolean>;
  
  // Assignments
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  getAssignmentsByEntity(entityType: string, entityId: number): Promise<Assignment[]>;
  deleteAssignment(id: number): Promise<boolean>;
  
  // Social Media Messages
  getSocialMessage(id: number): Promise<SocialMessage | undefined>;
  listSocialMessages(filter?: Partial<SocialMessage>): Promise<SocialMessage[]>;
  getLeadSocialMessages(leadId: number): Promise<SocialMessage[]>;
  getContactSocialMessages(contactId: number): Promise<SocialMessage[]>;
  createSocialMessage(message: InsertSocialMessage): Promise<SocialMessage>;
  updateSocialMessage(id: number, message: Partial<InsertSocialMessage>): Promise<SocialMessage | undefined>;
  deleteSocialMessage(id: number): Promise<boolean>;
  
  // Lead Sources
  getLeadSource(id: number): Promise<LeadSource | undefined>;
  listLeadSources(filter?: Partial<LeadSource>): Promise<LeadSource[]>;
  createLeadSource(source: InsertLeadSource): Promise<LeadSource>;
  updateLeadSource(id: number, source: Partial<InsertLeadSource>): Promise<LeadSource | undefined>;
  deleteLeadSource(id: number): Promise<boolean>;
  
  // Social Media Campaigns
  getSocialCampaign(id: number): Promise<SocialCampaign | undefined>;
  listSocialCampaigns(filter?: Partial<SocialCampaign>): Promise<SocialCampaign[]>;
  createSocialCampaign(campaign: InsertSocialCampaign): Promise<SocialCampaign>;
  updateSocialCampaign(id: number, campaign: Partial<InsertSocialCampaign>): Promise<SocialCampaign | undefined>;
  deleteSocialCampaign(id: number): Promise<boolean>;
  
  // API Keys
  getApiKey(id: number): Promise<ApiKey | undefined>;
  listApiKeys(filter?: Partial<ApiKey>): Promise<ApiKey[]>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  updateApiKey(id: number, apiKey: Partial<InsertApiKey>): Promise<ApiKey | undefined>;
  deleteApiKey(id: number): Promise<boolean>;
  
  // Workflows
  getWorkflow(id: number): Promise<Workflow | undefined>;
  listWorkflows(filter?: Partial<Workflow>): Promise<Workflow[]>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, workflow: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: number): Promise<boolean>;
  
  // Communications Center
  getAllCommunications(filter?: Partial<Communication>): Promise<Communication[]>;
  getCommunication(id: number): Promise<Communication | undefined>;
  getContactCommunications(contactId: number): Promise<Communication[]>;

  // Product Categories
  getProductCategory(id: number): Promise<ProductCategory | undefined>;
  listProductCategories(filter?: Partial<ProductCategory>): Promise<ProductCategory[]>;
  createProductCategory(category: InsertProductCategory): Promise<ProductCategory>;
  updateProductCategory(id: number, category: Partial<InsertProductCategory>): Promise<ProductCategory | undefined>;
  deleteProductCategory(id: number): Promise<boolean>;

  // Products
  getProduct(id: number): Promise<Product | undefined>;
  listProducts(filter?: Partial<Product>): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Inventory Transactions
  getInventoryTransaction(id: number): Promise<InventoryTransaction | undefined>;
  listInventoryTransactions(filter?: Partial<InventoryTransaction>): Promise<InventoryTransaction[]>;
  createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction>;
  getProductInventory(productId: number): Promise<number>; // Returns current inventory level for a product
  getProductInventoryHistory(productId: number): Promise<InventoryTransaction[]>; // Returns inventory history for a product
  getInventorySummary(): Promise<{products: Array<{id: number, name: string, sku: string, stock: number, value: number}>}>;

  // Invoices
  getInvoice(id: number): Promise<Invoice | undefined>;
  listInvoices(filter?: Partial<Invoice>): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;
  getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  updateInvoiceItem(id: number, item: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined>;
  deleteInvoiceItem(id: number): Promise<boolean>;

  // Purchase Orders
  getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined>;
  listPurchaseOrders(filter?: Partial<PurchaseOrder>): Promise<PurchaseOrder[]>;
  createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: number, order: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined>;
  deletePurchaseOrder(id: number): Promise<boolean>;
  getPurchaseOrderItems(orderId: number): Promise<PurchaseOrderItem[]>;
  createPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem>;
  updatePurchaseOrderItem(id: number, item: Partial<InsertPurchaseOrderItem>): Promise<PurchaseOrderItem | undefined>;
  deletePurchaseOrderItem(id: number): Promise<boolean>;
  
  // Inventory
  getInventorySummary(): Promise<{products: Array<{id: number, name: string, sku: string, stock: number, value: number}>}>;
  
  // System Settings
  getSystemSettings(userId: number): Promise<SystemSettings>;
  saveSystemSettings(userId: number, settings: SystemSettings): Promise<SystemSettings>;
  
  // Proposal Management
  // Templates
  getProposalTemplate(id: number): Promise<ProposalTemplate | undefined>;
  listProposalTemplates(filter?: Partial<ProposalTemplate>): Promise<ProposalTemplate[]>;
  createProposalTemplate(template: InsertProposalTemplate): Promise<ProposalTemplate>;
  updateProposalTemplate(id: number, template: Partial<InsertProposalTemplate>): Promise<ProposalTemplate | undefined>;
  deleteProposalTemplate(id: number): Promise<boolean>;
  
  // Proposals
  getProposal(id: number): Promise<Proposal | undefined>;
  listProposals(filter?: Partial<Proposal>): Promise<Proposal[]>;
  getOpportunityProposals(opportunityId: number): Promise<Proposal[]>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  updateProposal(id: number, proposal: Partial<InsertProposal>): Promise<Proposal | undefined>;
  deleteProposal(id: number): Promise<boolean>;
  
  // Proposal Elements (reusable blocks)
  getProposalElement(id: number): Promise<ProposalElement | undefined>;
  listProposalElements(filter?: Partial<ProposalElement>): Promise<ProposalElement[]>;
  createProposalElement(element: InsertProposalElement): Promise<ProposalElement>;
  updateProposalElement(id: number, element: Partial<InsertProposalElement>): Promise<ProposalElement | undefined>;
  deleteProposalElement(id: number): Promise<boolean>;
  
  // Proposal Collaborators
  getProposalCollaborators(proposalId: number): Promise<(ProposalCollaborator & { user?: User })[]>;
  addProposalCollaborator(collaborator: InsertProposalCollaborator): Promise<ProposalCollaborator>;
  updateProposalCollaborator(id: number, collaborator: Partial<InsertProposalCollaborator>): Promise<ProposalCollaborator | undefined>;
  removeProposalCollaborator(id: number): Promise<boolean>;
  
  // Proposal Comments
  getProposalComments(proposalId: number): Promise<(ProposalComment & { user?: User })[]>;
  createProposalComment(comment: InsertProposalComment): Promise<ProposalComment>;
  updateProposalComment(id: number, comment: Partial<InsertProposalComment>): Promise<ProposalComment | undefined>;
  deleteProposalComment(id: number): Promise<boolean>;
  resolveProposalComment(id: number, userId: number): Promise<ProposalComment | undefined>;
  
  // Proposal Activities
  getProposalActivities(proposalId: number): Promise<(ProposalActivity & { user?: User })[]>;
  createProposalActivity(activity: InsertProposalActivity): Promise<ProposalActivity>;
  
  // Permission Management
  getModuleByName(moduleName: string): Promise<ModulePermission | undefined>;
  getUserPermission(userId: number, moduleId: number, action: string): Promise<UserPermission | undefined>;
  getRolePermission(role: string, moduleId: number, action: string): Promise<RolePermission | undefined>;
  checkUserEntityAccess(userId: number, entityType: string, entityId: number): Promise<boolean>;
  checkTeamEntityAccess(userId: number, entityType: string, entityId: number): Promise<boolean>;
  getEntityById(entityType: string, entityId: number): Promise<any>;
  initializePermissions(): Promise<void>;
  
  // Module Permissions
  listModules(): Promise<ModulePermission[]>;
  createModule(module: InsertModulePermission): Promise<ModulePermission>;
  updateModule(id: number, module: Partial<InsertModulePermission>): Promise<ModulePermission | undefined>;
  
  // Role Permissions
  listRolePermissions(role: string): Promise<RolePermission[]>;
  createRolePermission(permission: InsertRolePermission): Promise<RolePermission>;
  updateRolePermission(id: number, permission: Partial<InsertRolePermission>): Promise<RolePermission | undefined>;
  
  // User Permissions
  listUserPermissions(userId: number): Promise<UserPermission[]>;
  createUserPermission(permission: InsertUserPermission): Promise<UserPermission>;
  updateUserPermission(id: number, permission: Partial<InsertUserPermission>): Promise<UserPermission | undefined>;
  
  // Teams Management
  getTeam(id: number): Promise<Team | undefined>;
  listTeams(): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, team: Partial<InsertTeam>): Promise<Team | undefined>;
  deleteTeam(id: number): Promise<boolean>;
  
  // Team Members
  getTeamMember(id: number): Promise<TeamMember | undefined>;
  listTeamMembers(teamId: number): Promise<TeamMember[]>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: number, member: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: number): Promise<boolean>;
  
  // Assignments
  getAssignment(id: number): Promise<Assignment | undefined>;
  listAssignments(entityType: string, entityId: number): Promise<Assignment[]>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  deleteAssignment(id: number): Promise<boolean>;
  
  // Module Permissions
  getModulePermissions(): Promise<ModulePermission[]>;
  getModuleByName(moduleName: string): Promise<ModulePermission | undefined>;
  createModulePermission(moduleData: Partial<ModulePermission>): Promise<ModulePermission>;
  updateModulePermission(id: number, moduleData: Partial<ModulePermission>): Promise<ModulePermission | undefined>;
  deleteModulePermission(id: number): Promise<boolean>;
  
  // Role Permissions
  getRolePermissions(role: string): Promise<RolePermission[]>;
  getRolePermission(role: string, moduleId: number, action: string): Promise<RolePermission | undefined>;
  createRolePermission(permissionData: Partial<RolePermission>): Promise<RolePermission>;
  updateRolePermission(id: number, permissionData: Partial<RolePermission>): Promise<RolePermission | undefined>;
  deleteRolePermission(id: number): Promise<boolean>;
  
  // User Permissions
  getUserPermissions(userId: number): Promise<UserPermission[]>;
  getUserPermission(userId: number, moduleId: number, action: string): Promise<UserPermission | undefined>;
  createUserPermission(permissionData: Partial<UserPermission>): Promise<UserPermission>;
  updateUserPermission(id: number, permissionData: Partial<UserPermission>): Promise<UserPermission | undefined>;
  deleteUserPermission(id: number): Promise<boolean>;
  
  // Entity Access
  checkUserEntityAccess(userId: number, entityType: string, entityId: number): Promise<boolean>;
  checkTeamEntityAccess(userId: number, entityType: string, entityId: number): Promise<boolean>;
  getEntityById(entityType: string, entityId: number): Promise<any>;
  initializePermissions(): Promise<void>;
  
  // Proposal Templates
  getProposalTemplate(id: number): Promise<ProposalTemplate | undefined>;
  listProposalTemplates(): Promise<ProposalTemplate[]>;
  createProposalTemplate(template: InsertProposalTemplate): Promise<ProposalTemplate>;
  updateProposalTemplate(id: number, template: Partial<InsertProposalTemplate>): Promise<ProposalTemplate | undefined>;
  deleteProposalTemplate(id: number): Promise<boolean>;
  
  // Proposals
  getProposal(id: number): Promise<Proposal | undefined>;
  listProposals(filter?: Partial<Proposal>): Promise<Proposal[]>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  updateProposal(id: number, proposal: Partial<InsertProposal>): Promise<Proposal | undefined>;
  deleteProposal(id: number): Promise<boolean>;
  
  // Proposal Elements
  getProposalElement(id: number): Promise<ProposalElement | undefined>;
  listProposalElements(proposalId: number): Promise<ProposalElement[]>;
  createProposalElement(element: InsertProposalElement): Promise<ProposalElement>;
  updateProposalElement(id: number, element: Partial<InsertProposalElement>): Promise<ProposalElement | undefined>;
  deleteProposalElement(id: number): Promise<boolean>;
  
  // Proposal Collaborators
  getProposalCollaborator(id: number): Promise<ProposalCollaborator | undefined>;
  getProposalCollaborators(proposalId: number): Promise<(ProposalCollaborator & { user?: User })[]>;
  addProposalCollaborator(collaborator: InsertProposalCollaborator): Promise<ProposalCollaborator>;
  updateProposalCollaborator(id: number, collaborator: Partial<InsertProposalCollaborator>): Promise<ProposalCollaborator | undefined>;
  deleteProposalCollaborator(id: number): Promise<boolean>;
  
  // Proposal Comments
  getProposalComment(id: number): Promise<ProposalComment | undefined>;
  getProposalComments(proposalId: number): Promise<(ProposalComment & { user?: User })[]>;
  createProposalComment(comment: InsertProposalComment): Promise<ProposalComment>;
  updateProposalComment(id: number, comment: Partial<InsertProposalComment>): Promise<ProposalComment | undefined>;
  deleteProposalComment(id: number): Promise<boolean>;
  
  // Proposal Activities
  createProposalActivity(activity: InsertProposalActivity): Promise<ProposalActivity>;
  getProposalActivities(proposalId: number): Promise<(ProposalActivity & { user?: User })[]>;
}

export class MemStorage implements IStorage {
  // Session store for authentication
  public sessionStore: session.Store;
  
  // Maps to store entity data
  public users: Map<number, User>; // Make users map public for auth module direct access
  private systemSettingsMap: Map<string, SystemSettings>;
  private contacts: Map<number, Contact>;
  private accounts: Map<number, Account>;
  private leads: Map<number, Lead>;
  
  // Communication center properties will be added through the mixin pattern
  private opportunities: Map<number, Opportunity>;
  private tasks: Map<number, Task>;
  private events: Map<number, Event>;
  private activities: Map<number, Activity>;
  private subscriptionPackages: Map<number, SubscriptionPackage>;
  private userSubscriptions: Map<number, UserSubscription>;
  private socialIntegrations: Map<number, SocialIntegration>;
  private socialMessages: Map<number, SocialMessage>;
  private leadSources: Map<number, LeadSource>;
  private socialCampaigns: Map<number, SocialCampaign>;
  private apiKeys: Map<number, ApiKey>;
  private workflows: Map<number, Workflow>;
  // Communications map already initialized
  
  // Proposal system maps
  private proposalTemplates: Map<number, ProposalTemplate>;
  private proposals: Map<number, Proposal>;
  private proposalElements: Map<number, ProposalElement>;
  private proposalCollaborators: Map<number, ProposalCollaborator>;
  private proposalComments: Map<number, ProposalComment>;
  private proposalActivities: Map<number, ProposalActivity>;
  
  // Business accounting maps
  private productCategoriesMap: Map<number, ProductCategory>;
  private products: Map<number, Product>;
  private inventoryTransactions: Map<number, InventoryTransaction>;
  private invoices: Map<number, Invoice>;
  private invoiceItems: Map<number, InvoiceItem>;
  private purchaseOrders: Map<number, PurchaseOrder>;
  private purchaseOrderItems: Map<number, PurchaseOrderItem>;
  
  // Permission management maps
  private modulePermissions: Map<number, ModulePermission>;
  private rolePermissions: Map<number, RolePermission>;
  private userPermissions: Map<number, UserPermission>;
  private teams: Map<number, Team>;
  private teamMembers: Map<number, TeamMember>;
  private assignments: Map<number, Assignment>;
  
  // Counter for IDs
  private userIdCounter: number;
  private contactIdCounter: number;
  private accountIdCounter: number;
  private leadIdCounter: number;
  private opportunityIdCounter: number;
  private taskIdCounter: number;
  private eventIdCounter: number;
  private activityIdCounter: number;
  private subscriptionPackageIdCounter: number;
  private userSubscriptionIdCounter: number;
  private socialIntegrationIdCounter: number;
  private socialMessageIdCounter: number;
  private leadSourceIdCounter: number;
  private socialCampaignIdCounter: number;
  private apiKeyIdCounter: number;
  private workflowIdCounter: number;
  // Communication ID counter already initialized
  
  // Business accounting ID counters
  private productCategoryIdCounter: number;
  private productIdCounter: number;
  private inventoryTransactionIdCounter: number;
  private invoiceIdCounter: number;
  private invoiceItemIdCounter: number;
  private purchaseOrderIdCounter: number;
  private purchaseOrderItemIdCounter: number;
  
  // Proposal system ID counters
  private proposalTemplateIdCounter: number;
  private proposalIdCounter: number;
  private proposalElementIdCounter: number;
  private proposalCollaboratorIdCounter: number;
  private proposalCommentIdCounter: number;
  private proposalActivityIdCounter: number;
  
  // Permission management ID counters
  private modulePermissionIdCounter: number;
  private rolePermissionIdCounter: number;
  private userPermissionIdCounter: number;
  private teamIdCounter: number;
  private teamMemberIdCounter: number;
  private assignmentIdCounter: number;

  constructor() {
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize maps
    this.users = new Map();
    this.contacts = new Map();
    this.accounts = new Map();
    this.leads = new Map();
    this.opportunities = new Map();
    this.tasks = new Map();
    this.events = new Map();
    this.activities = new Map();
    this.subscriptionPackages = new Map();
    this.userSubscriptions = new Map();
    this.socialIntegrations = new Map();
    this.socialMessages = new Map();
    this.leadSources = new Map();
    this.socialCampaigns = new Map();
    this.apiKeys = new Map();
    this.workflows = new Map();
    this.systemSettingsMap = new Map();
    // Communications map already initialized in the mixin
    
    // Initialize proposal system maps
    this.proposalTemplates = new Map();
    this.proposals = new Map();
    this.proposalElements = new Map();
    this.proposalCollaborators = new Map();
    this.proposalComments = new Map();
    this.proposalActivities = new Map();
    
    // Initialize business accounting maps
    this.productCategoriesMap = new Map();
    this.products = new Map();
    this.inventoryTransactions = new Map();
    this.invoices = new Map();
    this.invoiceItems = new Map();
    this.purchaseOrders = new Map();
    this.purchaseOrderItems = new Map();
    
    // Initialize permission management maps
    this.modulePermissions = new Map();
    this.rolePermissions = new Map();
    this.userPermissions = new Map();
    this.teams = new Map();
    this.teamMembers = new Map();
    this.assignments = new Map();
    
    // Initialize ID counters
    this.userIdCounter = 1;
    this.contactIdCounter = 1;
    this.accountIdCounter = 1;
    this.leadIdCounter = 1;
    this.opportunityIdCounter = 1;
    this.taskIdCounter = 1;
    this.eventIdCounter = 1;
    this.activityIdCounter = 1;
    this.subscriptionPackageIdCounter = 1;
    this.userSubscriptionIdCounter = 1;
    this.socialIntegrationIdCounter = 1;
    this.socialMessageIdCounter = 1;
    this.leadSourceIdCounter = 1;
    this.socialCampaignIdCounter = 1;
    this.apiKeyIdCounter = 1;
    this.workflowIdCounter = 1;
    // Communication ID counter already initialized in the mixin
    
    // Initialize proposal system ID counters
    this.proposalTemplateIdCounter = 1;
    this.proposalIdCounter = 1;
    this.proposalElementIdCounter = 1;
    this.proposalCollaboratorIdCounter = 1;
    this.proposalCommentIdCounter = 1;
    this.proposalActivityIdCounter = 1;
    
    // Initialize business accounting ID counters
    this.productCategoryIdCounter = 1;
    this.productIdCounter = 1;
    this.inventoryTransactionIdCounter = 1;
    this.invoiceIdCounter = 1;
    this.invoiceItemIdCounter = 1;
    this.purchaseOrderIdCounter = 1;
    this.purchaseOrderItemIdCounter = 1;
    
    // Initialize permission management ID counters
    this.modulePermissionIdCounter = 1;
    this.rolePermissionIdCounter = 1;
    this.userPermissionIdCounter = 1;
    this.teamIdCounter = 1;
    this.teamMemberIdCounter = 1;
    this.assignmentIdCounter = 1;
    
    // Create default data
    this.initializeData();
  }

  private initializeData() {
    // Create a default admin user
    this.createUser({
      username: "admin",
      password: "password",
      firstName: "Admin",
      lastName: "User",
      email: "admin@averox.com",
      role: "Administrator",
      avatar: ""
    });
    
    // Create a sample sales manager
    this.createUser({
      username: "sales.manager",
      password: "password",
      firstName: "Sales",
      lastName: "Manager",
      email: "sales@averox.com",
      role: "Sales Manager",
      avatar: ""
    });
    
    // Create some sample accounts (just a few for demonstration)
    const account1 = this.createAccount({
      name: "Acme Corporation",
      industry: "Technology",
      website: "https://acme.example.com",
      phone: "555-123-4567",
      billingAddress: "123 Main St",
      billingCity: "San Francisco",
      billingState: "CA",
      billingZip: "94105",
      billingCountry: "USA",
      ownerId: 1,
      annualRevenue: 5000000,
      employeeCount: 250,
      notes: "Major technology provider",
      isActive: true
    });
    
    const account2 = this.createAccount({
      name: "GlobalTech Inc.",
      industry: "Software",
      website: "https://globaltech.example.com",
      phone: "555-987-6543",
      billingAddress: "456 Market St",
      billingCity: "New York",
      billingState: "NY",
      billingZip: "10001",
      billingCountry: "USA",
      ownerId: 2,
      annualRevenue: 12000000,
      employeeCount: 500,
      notes: "Enterprise software solutions",
      isActive: true
    });
    
    // Create sample contacts
    this.createContact({
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@acme.example.com",
      phone: "555-111-2222",
      title: "CTO",
      accountId: account1.id,
      ownerId: 1,
      address: "123 Main St",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "USA",
      notes: "Key decision maker",
      isActive: true
    });
    
    this.createContact({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@globaltech.example.com",
      phone: "555-333-4444",
      title: "Director of Sales",
      accountId: account2.id,
      ownerId: 2,
      address: "456 Market St",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "USA",
      notes: "Interested in our premium plan",
      isActive: true
    });
    
    // Initialize permissions
    this.initializePermissions().catch(error => {
      console.error("Failed to initialize permissions:", error);
    });
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    
    // Default values for fields not in InsertUser but required in User
    const user: User = {
      ...insertUser,
      id,
      createdAt,
      isActive: true,
      isVerified: false,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      role: insertUser.role || "User",
      avatar: insertUser.avatar || null,
      lastLogin: null,
      company: null,
      packageId: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null
    };
    
    this.users.set(id, user);
    return user;
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      return undefined;
    }
    
    const updatedUser = {
      ...existingUser,
      ...userData
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Contact Methods
  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async listContacts(filter?: Partial<Contact>): Promise<Contact[]> {
    let contacts = Array.from(this.contacts.values());
    
    if (filter) {
      contacts = contacts.filter(contact => {
        for (const [key, value] of Object.entries(filter)) {
          if (contact[key as keyof Contact] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return contacts;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.contactIdCounter++;
    const createdAt = new Date();
    
    const contact: Contact = {
      ...insertContact,
      id,
      createdAt,
      email: insertContact.email || null,
      phone: insertContact.phone || null,
      title: insertContact.title || null,
      accountId: insertContact.accountId || null,
      ownerId: insertContact.ownerId || null,
      address: insertContact.address || null,
      city: insertContact.city || null,
      state: insertContact.state || null,
      zip: insertContact.zip || null,
      country: insertContact.country || null,
      notes: insertContact.notes || null,
      isActive: insertContact.isActive === undefined ? true : insertContact.isActive
    };
    
    this.contacts.set(id, contact);
    return contact;
  }

  async updateContact(id: number, contactData: Partial<InsertContact>): Promise<Contact | undefined> {
    const existingContact = this.contacts.get(id);
    if (!existingContact) {
      return undefined;
    }
    
    const updatedContact = {
      ...existingContact,
      ...contactData
    };
    
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }

  async deleteContact(id: number): Promise<boolean> {
    return this.contacts.delete(id);
  }

  // Account Methods
  async getAccount(id: number): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async listAccounts(filter?: Partial<Account>): Promise<Account[]> {
    let accounts = Array.from(this.accounts.values());
    
    if (filter) {
      accounts = accounts.filter(account => {
        for (const [key, value] of Object.entries(filter)) {
          if (account[key as keyof Account] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return accounts;
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = this.accountIdCounter++;
    const createdAt = new Date();
    
    const account: Account = {
      ...insertAccount,
      id,
      createdAt,
      industry: insertAccount.industry || null,
      website: insertAccount.website || null,
      phone: insertAccount.phone || null,
      billingAddress: insertAccount.billingAddress || null,
      billingCity: insertAccount.billingCity || null,
      billingState: insertAccount.billingState || null,
      billingZip: insertAccount.billingZip || null,
      billingCountry: insertAccount.billingCountry || null,
      ownerId: insertAccount.ownerId || null,
      annualRevenue: insertAccount.annualRevenue || null,
      employeeCount: insertAccount.employeeCount || null,
      notes: insertAccount.notes || null,
      isActive: insertAccount.isActive === undefined ? true : insertAccount.isActive
    };
    
    this.accounts.set(id, account);
    return account;
  }

  async updateAccount(id: number, accountData: Partial<InsertAccount>): Promise<Account | undefined> {
    const existingAccount = this.accounts.get(id);
    if (!existingAccount) {
      return undefined;
    }
    
    const updatedAccount = {
      ...existingAccount,
      ...accountData
    };
    
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async deleteAccount(id: number): Promise<boolean> {
    return this.accounts.delete(id);
  }

  // Lead Methods
  async getLead(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async listLeads(filter?: Partial<Lead>): Promise<Lead[]> {
    let leads = Array.from(this.leads.values());
    
    if (filter) {
      leads = leads.filter(lead => {
        for (const [key, value] of Object.entries(filter)) {
          if (lead[key as keyof Lead] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return leads;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = this.leadIdCounter++;
    const createdAt = new Date();
    
    const lead: Lead = { 
      ...insertLead,
      id,
      createdAt,
      email: insertLead.email || null,
      phone: insertLead.phone || null,
      company: insertLead.company || null,
      title: insertLead.title || null,
      status: insertLead.status || "New",
      source: insertLead.source || null,
      ownerId: insertLead.ownerId || null,
      notes: insertLead.notes || null,
      isConverted: false,
      convertedToContactId: null,
      convertedToAccountId: null,
      convertedToOpportunityId: null
    };
    
    this.leads.set(id, lead);
    return lead;
  }

  async updateLead(id: number, leadData: Partial<InsertLead>): Promise<Lead | undefined> {
    const existingLead = this.leads.get(id);
    if (!existingLead) {
      return undefined;
    }
    
    const updatedLead = {
      ...existingLead,
      ...leadData
    };
    
    this.leads.set(id, updatedLead);
    return updatedLead;
  }

  async deleteLead(id: number): Promise<boolean> {
    return this.leads.delete(id);
  }

  async convertLead(
    id: number, 
    convertTo: { 
      contact?: InsertContact, 
      account?: InsertAccount, 
      opportunity?: InsertOpportunity 
    }
  ): Promise<{ 
    contact?: Contact;
    account?: Account;
    opportunity?: Opportunity;
    lead: Lead;
  }> {
    const lead = this.leads.get(id);
    if (!lead) {
      throw new Error(`Lead with ID ${id} not found`);
    }
    
    const result: {
      contact?: Contact;
      account?: Account;
      opportunity?: Opportunity;
      lead: Lead;
    } = {
      lead: { ...lead }
    };
    
    // Create contact if provided
    if (convertTo.contact) {
      const contactData = {
        ...convertTo.contact
      };
      
      // Use lead data for missing fields
      if (!contactData.firstName) contactData.firstName = lead.firstName;
      if (!contactData.lastName) contactData.lastName = lead.lastName;
      if (!contactData.email) contactData.email = lead.email;
      if (!contactData.phone) contactData.phone = lead.phone;
      
      const contact = await this.createContact(contactData);
      result.contact = contact;
      lead.convertedToContactId = contact.id;
    }
    
    // Create account if provided
    if (convertTo.account) {
      const accountData = {
        ...convertTo.account
      };
      
      // Use lead data for missing fields
      if (!accountData.name && lead.company) accountData.name = lead.company;
      
      const account = await this.createAccount(accountData);
      result.account = account;
      lead.convertedToAccountId = account.id;
      
      // Link contact to account if both were created
      if (result.contact && !result.contact.accountId) {
        const updatedContact = {
          ...result.contact,
          accountId: account.id
        };
        this.contacts.set(result.contact.id, updatedContact);
        result.contact = updatedContact;
      }
    }
    
    // Create opportunity if provided
    if (convertTo.opportunity) {
      const opportunityData = {
        ...convertTo.opportunity
      };
      
      // Use lead data for missing fields
      if (!opportunityData.name && lead.company) {
        opportunityData.name = `${lead.company} Opportunity`;
      } else if (!opportunityData.name) {
        opportunityData.name = `${lead.firstName} ${lead.lastName} Opportunity`;
      }
      
      // Link to account if created
      if (result.account && !opportunityData.accountId) {
        opportunityData.accountId = result.account.id;
      }
      
      const opportunity = await this.createOpportunity(opportunityData);
      result.opportunity = opportunity;
      lead.convertedToOpportunityId = opportunity.id;
    }
    
    // Mark lead as converted
    lead.isConverted = true;
    this.leads.set(id, lead);
    result.lead = lead;
    
    return result;
  }

  // Opportunity Methods
  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    return this.opportunities.get(id);
  }

  async listOpportunities(filter?: Partial<Opportunity>): Promise<Opportunity[]> {
    let opportunities = Array.from(this.opportunities.values());
    
    if (filter) {
      opportunities = opportunities.filter(opportunity => {
        for (const [key, value] of Object.entries(filter)) {
          if (opportunity[key as keyof Opportunity] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return opportunities;
  }

  async createOpportunity(insertOpportunity: InsertOpportunity): Promise<Opportunity> {
    const id = this.opportunityIdCounter++;
    const createdAt = new Date();
    
    const opportunity: Opportunity = { 
      ...insertOpportunity,
      id,
      createdAt,
      accountId: insertOpportunity.accountId || null,
      stage: insertOpportunity.stage || "Lead Generation",
      amount: insertOpportunity.amount || null,
      expectedCloseDate: insertOpportunity.expectedCloseDate || null,
      probability: insertOpportunity.probability || null,
      ownerId: insertOpportunity.ownerId || null,
      notes: insertOpportunity.notes || null,
      isClosed: false,
      isWon: false
    };
    
    this.opportunities.set(id, opportunity);
    return opportunity;
  }

  async updateOpportunity(id: number, opportunityData: Partial<InsertOpportunity>): Promise<Opportunity | undefined> {
    const existingOpportunity = this.opportunities.get(id);
    if (!existingOpportunity) {
      return undefined;
    }
    
    const updatedOpportunity = {
      ...existingOpportunity,
      ...opportunityData
    };
    
    this.opportunities.set(id, updatedOpportunity);
    return updatedOpportunity;
  }

  async deleteOpportunity(id: number): Promise<boolean> {
    return this.opportunities.delete(id);
  }

  // Task Methods
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async listTasks(filter?: Partial<Task>): Promise<Task[]> {
    let tasks = Array.from(this.tasks.values());
    
    if (filter) {
      tasks = tasks.filter(task => {
        for (const [key, value] of Object.entries(filter)) {
          if (task[key as keyof Task] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return tasks;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const createdAt = new Date();
    
    // Process dates
    let processedTask = { ...insertTask };
    if (typeof processedTask.reminderDate === 'string') {
      processedTask.reminderDate = new Date(processedTask.reminderDate);
    }
    
    const task: Task = {
      ...processedTask,
      id,
      createdAt,
      description: processedTask.description || null,
      dueDate: processedTask.dueDate || null,
      priority: processedTask.priority || "Normal",
      status: processedTask.status || "Not Started",
      ownerId: processedTask.ownerId || null,
      relatedToType: processedTask.relatedToType || null,
      relatedToId: processedTask.relatedToId || null,
      isReminder: processedTask.isReminder || false,
      reminderDate: processedTask.reminderDate || null
    };
    
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) {
      return undefined;
    }
    
    // Process dates
    let processedData = { ...taskData };
    if (typeof processedData.reminderDate === 'string') {
      processedData.reminderDate = new Date(processedData.reminderDate);
    }
    
    const updatedTask = {
      ...existingTask,
      ...processedData
    };
    
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Event Methods
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async listEvents(filter?: Partial<Event>): Promise<Event[]> {
    let events = Array.from(this.events.values());
    
    if (filter) {
      events = events.filter(event => {
        for (const [key, value] of Object.entries(filter)) {
          if (event[key as keyof Event] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    // Sort by start date
    events.sort((a, b) => {
      // Handle null values
      if (!a.startDate) return 1;
      if (!b.startDate) return -1;
      
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateA - dateB;
    });
    
    return events;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const createdAt = new Date();
    
    // Process dates
    const startDate = typeof insertEvent.startDate === 'string' 
      ? new Date(insertEvent.startDate) 
      : insertEvent.startDate;
    
    const endDate = typeof insertEvent.endDate === 'string' 
      ? new Date(insertEvent.endDate) 
      : insertEvent.endDate;
    
    const event: Event = {
      ...insertEvent,
      id,
      createdAt,
      startDate,
      endDate,
      description: insertEvent.description || null,
      location: insertEvent.location || null,
      locationType: insertEvent.locationType || "physical",
      eventType: insertEvent.eventType || "Meeting",
      status: insertEvent.status || "Confirmed",
      ownerId: insertEvent.ownerId || null,
      isAllDay: insertEvent.isAllDay || false,
      isRecurring: insertEvent.isRecurring || false,
      recurringRule: insertEvent.recurringRule || null
    };
    
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const existingEvent = this.events.get(id);
    if (!existingEvent) {
      return undefined;
    }
    
    // Process dates
    let processedData = { ...eventData };
    if (typeof processedData.startDate === 'string') {
      processedData.startDate = new Date(processedData.startDate);
    }
    
    if (typeof processedData.endDate === 'string') {
      processedData.endDate = new Date(processedData.endDate);
    }
    
    const updatedEvent = {
      ...existingEvent,
      ...processedData
    };
    
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Activity Methods
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async listActivities(filter?: Partial<Activity>): Promise<Activity[]> {
    let activities = Array.from(this.activities.values());
    
    if (filter) {
      activities = activities.filter(activity => {
        for (const [key, value] of Object.entries(filter)) {
          if (activity[key as keyof Activity] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    // Sort by creation date (newest first)
    activities.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
    
    return activities;
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const createdAt = new Date();
    
    const activity: Activity = {
      ...insertActivity,
      id,
      createdAt,
      userId: insertActivity.userId || null,
      detail: insertActivity.detail || null,
      relatedToType: insertActivity.relatedToType || null,
      relatedToId: insertActivity.relatedToId || null,
      icon: insertActivity.icon || "added"
    };
    
    this.activities.set(id, activity);
    return activity;
  }

  // Dashboard Methods
  async getDashboardStats(): Promise<{
    newLeads: number;
    conversionRate: string;
    revenue: string;
    openDeals: number;
  }> {
    // Get counts
    const leads = Array.from(this.leads.values());
    const opportunities = Array.from(this.opportunities.values());
    
    // Calculate stats
    const newLeads = leads.filter(lead => 
      lead.status === "New" && 
      lead.createdAt && 
      new Date(lead.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;
    
    const totalLeads = leads.length;
    const convertedLeads = leads.filter(lead => lead.isConverted).length;
    const conversionRate = totalLeads > 0 
      ? ((convertedLeads / totalLeads) * 100).toFixed(1)
      : "0.0";
    
    const totalRevenue = opportunities
      .filter(opp => opp.isWon)
      .reduce((sum, opp) => sum + parseFloat(opp.amount || "0"), 0);
    
    const revenue = totalRevenue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    const openDeals = opportunities.filter(opp => !opp.isClosed).length;
    
    return {
      newLeads,
      conversionRate: conversionRate + "%",
      revenue,
      openDeals
    };
  }

  async getSalesPipeline(): Promise<{
    stages: {
      name: string;
      value: string;
      percentage: number;
    }[];
  }> {
    const opportunities = Array.from(this.opportunities.values());
    const stages = [
      "Lead Generation",
      "Qualification",
      "Proposal",
      "Negotiation",
      "Closing"
    ];
    
    const totalValue = opportunities.reduce((sum, opp) => 
      sum + parseFloat(opp.amount || "0"), 0);
    
    const pipelineData = stages.map(stageName => {
      const stageOpps = opportunities.filter(opp => opp.stage === stageName);
      const stageValue = stageOpps.reduce((sum, opp) => 
        sum + parseFloat(opp.amount || "0"), 0);
      
      const percentage = totalValue > 0 
        ? Math.round((stageValue / totalValue) * 100)
        : 0;
      
      return {
        name: stageName,
        value: stageValue.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }),
        percentage
      };
    });
    
    return { stages: pipelineData };
  }

  // Report Methods
  async getSalesReport(timeRange: string): Promise<{
    monthlyData: {
      name: string;
      deals: number;
      value: number;
    }[];
    pipelineStages: {
      name: string;
      value: number;
    }[];
  }> {
    const opportunities = Array.from(this.opportunities.values());
    
    // Calculate date range
    let startDate = new Date();
    switch (timeRange) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1); // Default to month
    }
    
    // Filter by date range
    const filteredOpps = opportunities.filter(opp => {
      if (!opp.createdAt) return false;
      return new Date(opp.createdAt) >= startDate;
    });
    
    // Generate monthly data
    const months = timeRange === 'year' ? 12 : timeRange === 'quarter' ? 3 : 1;
    const monthlyData = [];
    
    for (let i = 0; i < months; i++) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      
      const monthName = monthDate.toLocaleString('en-US', { month: 'short' });
      const monthYear = monthDate.getFullYear();
      
      const monthOpps = filteredOpps.filter(opp => {
        if (!opp.createdAt) return false;
        const oppDate = new Date(opp.createdAt);
        return oppDate.getMonth() === monthDate.getMonth() &&
               oppDate.getFullYear() === monthDate.getFullYear();
      });
      
      const deals = monthOpps.length;
      const value = monthOpps.reduce((sum, opp) => 
        sum + parseFloat(opp.amount || "0"), 0);
      
      monthlyData.unshift({
        name: `${monthName} ${monthYear}`,
        deals,
        value
      });
    }
    
    // Generate pipeline stages data
    const stageNames = [
      "Lead Generation",
      "Qualification",
      "Proposal",
      "Negotiation",
      "Closing"
    ];
    
    const pipelineStages = stageNames.map(stage => {
      const stageOpps = filteredOpps.filter(opp => opp.stage === stage);
      const value = stageOpps.reduce((sum, opp) => 
        sum + parseFloat(opp.amount || "0"), 0);
      
      return {
        name: stage,
        value
      };
    });
    
    return {
      monthlyData,
      pipelineStages
    };
  }

  async getLeadsReport(timeRange: string): Promise<{
    sourceData: {
      name: string;
      value: number;
    }[];
    trendData: {
      name: string;
      newLeads: number;
      converted: number;
    }[];
  }> {
    const leads = Array.from(this.leads.values());
    
    // Calculate date range
    let startDate = new Date();
    switch (timeRange) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1); // Default to month
    }
    
    // Filter by date range
    const filteredLeads = leads.filter(lead => {
      if (!lead.createdAt) return false;
      return new Date(lead.createdAt) >= startDate;
    });
    
    // Generate source data
    const sourceCounts = new Map<string, number>();
    
    filteredLeads.forEach(lead => {
      const source = lead.source || "Unknown";
      sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
    });
    
    const sourceData = Array.from(sourceCounts.entries()).map(([name, value]) => ({
      name,
      value
    }));
    
    // Sort by count (highest first)
    sourceData.sort((a, b) => b.value - a.value);
    
    // Generate trend data (last 6 weeks or months)
    const periods = timeRange === 'week' ? 6 : timeRange === 'month' || timeRange === 'quarter' ? 3 : 12;
    const periodType = timeRange === 'week' ? 'week' : 'month';
    
    const trendData = [];
    
    for (let i = 0; i < periods; i++) {
      const periodDate = new Date();
      
      if (periodType === 'week') {
        periodDate.setDate(periodDate.getDate() - (7 * i));
        
        // Get start and end of week
        const startOfWeek = new Date(periodDate);
        startOfWeek.setDate(periodDate.getDate() - periodDate.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        // Count leads for this week
        const weekLeads = leads.filter(lead => {
          if (!lead.createdAt) return false;
          const leadDate = new Date(lead.createdAt);
          return leadDate >= startOfWeek && leadDate <= endOfWeek;
        });
        
        const newLeads = weekLeads.length;
        const converted = weekLeads.filter(lead => lead.isConverted).length;
        
        // Format week name (e.g., "May 1-7")
        const startMonth = startOfWeek.toLocaleString('en-US', { month: 'short' });
        const endMonth = endOfWeek.toLocaleString('en-US', { month: 'short' });
        
        const weekName = startMonth === endMonth
          ? `${startMonth} ${startOfWeek.getDate()}-${endOfWeek.getDate()}`
          : `${startMonth} ${startOfWeek.getDate()}-${endMonth} ${endOfWeek.getDate()}`;
        
        trendData.unshift({
          name: weekName,
          newLeads,
          converted
        });
      } else {
        // Monthly data
        periodDate.setMonth(periodDate.getMonth() - i);
        
        const monthName = periodDate.toLocaleString('en-US', { month: 'short' });
        const monthYear = periodDate.getFullYear();
        
        const monthLeads = leads.filter(lead => {
          if (!lead.createdAt) return false;
          const leadDate = new Date(lead.createdAt);
          return leadDate.getMonth() === periodDate.getMonth() &&
                 leadDate.getFullYear() === periodDate.getFullYear();
        });
        
        const newLeads = monthLeads.length;
        const converted = monthLeads.filter(lead => lead.isConverted).length;
        
        trendData.unshift({
          name: `${monthName} ${monthYear}`,
          newLeads,
          converted
        });
      }
    }
    
    return {
      sourceData,
      trendData
    };
  }

  async getConversionReport(timeRange: string): Promise<{
    conversionRate: number;
    previousRate: number;
    avgTimeToConvert: number;
    previousTime: number;
    bestChannel: {
      name: string;
      rate: number;
    };
    weeklyData: {
      name: string;
      newLeads: number;
      converted: number;
    }[];
  }> {
    const leads = Array.from(this.leads.values());
    const opportunities = Array.from(this.opportunities.values());
    
    // Calculate current period date range
    let currentStartDate = new Date();
    let previousStartDate = new Date();
    
    switch (timeRange) {
      case 'week':
        currentStartDate.setDate(currentStartDate.getDate() - 7);
        previousStartDate.setDate(previousStartDate.getDate() - 14);
        break;
      case 'month':
        currentStartDate.setMonth(currentStartDate.getMonth() - 1);
        previousStartDate.setMonth(previousStartDate.getMonth() - 2);
        break;
      case 'quarter':
        currentStartDate.setMonth(currentStartDate.getMonth() - 3);
        previousStartDate.setMonth(previousStartDate.getMonth() - 6);
        break;
      case 'year':
        currentStartDate.setFullYear(currentStartDate.getFullYear() - 1);
        previousStartDate.setFullYear(previousStartDate.getFullYear() - 2);
        break;
      default:
        currentStartDate.setMonth(currentStartDate.getMonth() - 1);
        previousStartDate.setMonth(previousStartDate.getMonth() - 2);
    }
    
    // Filter leads by current period
    const currentPeriodLeads = leads.filter(lead => {
      if (!lead.createdAt) return false;
      const leadDate = new Date(lead.createdAt);
      return leadDate >= currentStartDate;
    });
    
    // Filter leads by previous period
    const previousPeriodLeads = leads.filter(lead => {
      if (!lead.createdAt) return false;
      const leadDate = new Date(lead.createdAt);
      return leadDate >= previousStartDate && leadDate < currentStartDate;
    });
    
    // Calculate conversion rates
    const currentConvertedCount = currentPeriodLeads.filter(lead => lead.isConverted).length;
    const previousConvertedCount = previousPeriodLeads.filter(lead => lead.isConverted).length;
    
    const conversionRate = currentPeriodLeads.length > 0
      ? Math.round((currentConvertedCount / currentPeriodLeads.length) * 100)
      : 0;
    
    const previousRate = previousPeriodLeads.length > 0
      ? Math.round((previousConvertedCount / previousPeriodLeads.length) * 100)
      : 0;
    
    // Calculate average time to convert
    const convertedLeads = currentPeriodLeads.filter(lead => 
      lead.isConverted && lead.convertedToOpportunityId !== null
    );
    
    let totalDaysToConvert = 0;
    let convertedCount = 0;
    
    for (const lead of convertedLeads) {
      if (!lead.createdAt) continue;
      
      // Find the opportunity created from this lead
      const opportunity = lead.convertedToOpportunityId 
        ? opportunities.find(opp => opp.id === lead.convertedToOpportunityId)
        : null;
      
      if (opportunity && opportunity.createdAt) {
        const leadDate = new Date(lead.createdAt);
        const oppDate = new Date(opportunity.createdAt);
        const daysDiff = Math.floor((oppDate.getTime() - leadDate.getTime()) / (1000 * 60 * 60 * 24));
        
        totalDaysToConvert += daysDiff;
        convertedCount++;
      }
    }
    
    const avgTimeToConvert = convertedCount > 0
      ? Math.round(totalDaysToConvert / convertedCount)
      : 0;
    
    // Calculate previous average time to convert
    const prevConvertedLeads = previousPeriodLeads.filter(lead => 
      lead.isConverted && lead.convertedToOpportunityId !== null
    );
    
    let prevTotalDaysToConvert = 0;
    let prevConvertedCount = 0;
    
    for (const lead of prevConvertedLeads) {
      if (!lead.createdAt) continue;
      
      const opportunity = lead.convertedToOpportunityId 
        ? opportunities.find(opp => opp.id === lead.convertedToOpportunityId)
        : null;
      
      if (opportunity && opportunity.createdAt) {
        const leadDate = new Date(lead.createdAt);
        const oppDate = new Date(opportunity.createdAt);
        const daysDiff = Math.floor((oppDate.getTime() - leadDate.getTime()) / (1000 * 60 * 60 * 24));
        
        prevTotalDaysToConvert += daysDiff;
        prevConvertedCount++;
      }
    }
    
    const previousTime = prevConvertedCount > 0
      ? Math.round(prevTotalDaysToConvert / prevConvertedCount)
      : 0;
    
    // Find best performing channel
    const channelStats = new Map<string, { total: number, converted: number }>();
    
    currentPeriodLeads.forEach(lead => {
      const source = lead.source || "Unknown";
      
      if (!channelStats.has(source)) {
        channelStats.set(source, { total: 0, converted: 0 });
      }
      
      const stats = channelStats.get(source)!;
      stats.total++;
      
      if (lead.isConverted) {
        stats.converted++;
      }
    });
    
    let bestChannel = { name: "Unknown", rate: 0 };
    
    channelStats.forEach((stats, channel) => {
      if (stats.total >= 5) { // Minimum threshold to consider a channel
        const rate = Math.round((stats.converted / stats.total) * 100);
        
        if (rate > bestChannel.rate) {
          bestChannel = {
            name: channel,
            rate
          };
        }
      }
    });
    
    // Generate weekly data
    const weeklyData = [];
    const weeksToShow = 6;
    
    for (let i = 0; i < weeksToShow; i++) {
      const weekEndDate = new Date();
      weekEndDate.setDate(weekEndDate.getDate() - (7 * i));
      
      const weekStartDate = new Date(weekEndDate);
      weekStartDate.setDate(weekEndDate.getDate() - 6);
      
      // Count leads for this week
      const weekLeads = leads.filter(lead => {
        if (!lead.createdAt) return false;
        const leadDate = new Date(lead.createdAt);
        return leadDate >= weekStartDate && leadDate <= weekEndDate;
      });
      
      const newLeads = weekLeads.length;
      const converted = weekLeads.filter(lead => lead.isConverted).length;
      
      // Format week name (e.g., "May 1-7")
      const startMonth = weekStartDate.toLocaleString('en-US', { month: 'short' });
      const endMonth = weekEndDate.toLocaleString('en-US', { month: 'short' });
      
      const weekName = startMonth === endMonth
        ? `${startMonth} ${weekStartDate.getDate()}-${weekEndDate.getDate()}`
        : `${startMonth} ${weekStartDate.getDate()}-${endMonth} ${weekEndDate.getDate()}`;
      
      weeklyData.unshift({
        name: weekName,
        newLeads,
        converted
      });
    }
    
    return {
      conversionRate,
      previousRate,
      avgTimeToConvert,
      previousTime,
      bestChannel,
      weeklyData
    };
  }

  async getTeamPerformanceReport(timeRange: string): Promise<{
    teamMembers: {
      name: string;
      deals: number;
      revenue: number;
      conversion: number;
    }[];
  }> {
    // Get all opportunities
    const opportunities = Array.from(this.opportunities.values());
    
    // Get all leads
    const leads = Array.from(this.leads.values());
    
    // Get all users
    const users = Array.from(this.users.values());
    
    // Create a map to track performance by user
    const performanceByUser = new Map<number, {
      name: string;
      deals: number;
      revenue: number;
      leadsAssigned: number;
      leadsConverted: number;
    }>();
    
    // Initialize performance tracking for each user
    users.forEach(user => {
      if (user.id) {
        performanceByUser.set(user.id, {
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || `User ${user.id}`,
          deals: 0,
          revenue: 0,
          leadsAssigned: 0,
          leadsConverted: 0
        });
      }
    });
    
    // Calculate date range
    let startDate = new Date();
    switch (timeRange) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1); // Default to month
    }
    
    // Track opportunities by owner
    opportunities.forEach(opp => {
      // Skip if no owner or if opportunity was created before the time range
      if (!opp.ownerId || (opp.createdAt && new Date(opp.createdAt) < startDate)) {
        return;
      }
      
      const userPerf = performanceByUser.get(opp.ownerId);
      if (userPerf) {
        userPerf.deals += 1;
        userPerf.revenue += parseFloat(opp.amount || '0');
      }
    });
    
    // Track leads by owner
    leads.forEach(lead => {
      // Skip if no owner or if lead was created before the time range
      if (!lead.ownerId || (lead.createdAt && new Date(lead.createdAt) < startDate)) {
        return;
      }
      
      const userPerf = performanceByUser.get(lead.ownerId);
      if (userPerf) {
        userPerf.leadsAssigned += 1;
        if (lead.isConverted) {
          userPerf.leadsConverted += 1;
        }
      }
    });
    
    // Calculate conversion rates and prepare final data
    const teamMembers = Array.from(performanceByUser.values()).map(user => {
      const conversion = user.leadsAssigned > 0 
        ? Math.round((user.leadsConverted / user.leadsAssigned) * 100) 
        : 0;
      
      return {
        name: user.name,
        deals: user.deals,
        revenue: user.revenue,
        conversion
      };
    });
    
    // Sort by revenue (highest first)
    teamMembers.sort((a, b) => b.revenue - a.revenue);
    
    return { teamMembers };
  }

  // Subscription Package Methods
  async getSubscriptionPackage(id: number): Promise<SubscriptionPackage | undefined> {
    return this.subscriptionPackages.get(id);
  }

  async listSubscriptionPackages(filter?: Partial<SubscriptionPackage>): Promise<SubscriptionPackage[]> {
    let packages = Array.from(this.subscriptionPackages.values());
    
    if (filter) {
      packages = packages.filter(pkg => {
        for (const [key, value] of Object.entries(filter)) {
          if (pkg[key as keyof SubscriptionPackage] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    // Sort by display order
    return packages.sort((a, b) => {
      if (a.displayOrder === null) return 1;
      if (b.displayOrder === null) return -1;
      return a.displayOrder - b.displayOrder;
    });
  }

  async createSubscriptionPackage(packageData: InsertSubscriptionPackage): Promise<SubscriptionPackage> {
    const id = this.subscriptionPackageIdCounter++;
    const createdAt = new Date();
    
    const subscriptionPackage: SubscriptionPackage = {
      ...packageData,
      id,
      createdAt,
      isActive: packageData.isActive ?? true,
      displayOrder: packageData.displayOrder ?? 0
    };
    
    this.subscriptionPackages.set(id, subscriptionPackage);
    return subscriptionPackage;
  }

  async updateSubscriptionPackage(id: number, packageData: Partial<InsertSubscriptionPackage>): Promise<SubscriptionPackage | undefined> {
    const existingPackage = this.subscriptionPackages.get(id);
    if (!existingPackage) {
      return undefined;
    }
    
    const updatedPackage: SubscriptionPackage = {
      ...existingPackage,
      ...packageData
    };
    
    this.subscriptionPackages.set(id, updatedPackage);
    return updatedPackage;
  }

  async deleteSubscriptionPackage(id: number): Promise<boolean> {
    return this.subscriptionPackages.delete(id);
  }

  // User Subscription Methods
  async getUserSubscription(id: number): Promise<UserSubscription | undefined> {
    return this.userSubscriptions.get(id);
  }

  async getUserActiveSubscription(userId: number): Promise<UserSubscription | undefined> {
    const userSubscriptions = Array.from(this.userSubscriptions.values());
    return userSubscriptions.find(sub => 
      sub.userId === userId && 
      sub.status === "Active" &&
      (!sub.endDate || new Date(sub.endDate) > new Date())
    );
  }

  async listUserSubscriptions(filter?: Partial<UserSubscription>): Promise<UserSubscription[]> {
    let subscriptions = Array.from(this.userSubscriptions.values());
    
    if (filter) {
      subscriptions = subscriptions.filter(sub => {
        for (const [key, value] of Object.entries(filter)) {
          if (sub[key as keyof UserSubscription] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    // Sort by creation date (newest first)
    return subscriptions.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async createUserSubscription(subscriptionData: InsertUserSubscription): Promise<UserSubscription> {
    const id = this.userSubscriptionIdCounter++;
    const createdAt = new Date();
    
    const startDate = new Date(subscriptionData.startDate);
    const endDate = subscriptionData.endDate ? new Date(subscriptionData.endDate) : undefined;
    
    const userSubscription: UserSubscription = {
      ...subscriptionData,
      id,
      createdAt,
      startDate,
      endDate,
      status: subscriptionData.status || "Pending"
    };
    
    this.userSubscriptions.set(id, userSubscription);
    return userSubscription;
  }

  async updateUserSubscription(id: number, subscriptionData: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined> {
    const existingSubscription = this.userSubscriptions.get(id);
    if (!existingSubscription) {
      return undefined;
    }
    
    let updatedSubscription: UserSubscription = {
      ...existingSubscription
    };
    
    if (subscriptionData.startDate) {
      updatedSubscription.startDate = new Date(subscriptionData.startDate);
    }
    
    if (subscriptionData.endDate) {
      updatedSubscription.endDate = new Date(subscriptionData.endDate);
    }
    
    updatedSubscription = {
      ...updatedSubscription,
      ...subscriptionData
    };
    
    this.userSubscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  async cancelUserSubscription(id: number): Promise<UserSubscription | undefined> {
    const subscription = this.userSubscriptions.get(id);
    if (!subscription) {
      return undefined;
    }
    
    const updatedSubscription: UserSubscription = {
      ...subscription,
      status: "Canceled",
      canceledAt: new Date()
    };
    
    this.userSubscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }
  
  async deleteUserSubscription(id: number): Promise<boolean> {
    if (!this.userSubscriptions.has(id)) {
      return false;
    }
    
    return this.userSubscriptions.delete(id);
  }

  // User Account Management Methods
  async updateUserStripeInfo(userId: number, stripeInfo: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) {
      return undefined;
    }
    
    const updatedUser: User = {
      ...user,
      stripeCustomerId: stripeInfo.stripeCustomerId,
      stripeSubscriptionId: stripeInfo.stripeSubscriptionId
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) {
      return undefined;
    }
    
    const updatedUser: User = {
      ...user,
      stripeCustomerId
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Workflow Methods
  async getWorkflow(id: number): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  // Product Category Methods
  async getProductCategory(id: number): Promise<ProductCategory | undefined> {
    return this.productCategoriesMap.get(id);
  }

  async listProductCategories(filter?: Partial<ProductCategory>): Promise<ProductCategory[]> {
    let categories = Array.from(this.productCategoriesMap.values());
    
    if (filter) {
      categories = categories.filter(category => {
        for (const [key, value] of Object.entries(filter)) {
          if (category[key as keyof ProductCategory] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return categories;
  }

  async createProductCategory(insertProductCategory: InsertProductCategory): Promise<ProductCategory> {
    const id = this.productCategoryIdCounter++;
    const createdAt = new Date();
    
    const productCategory: ProductCategory = {
      ...insertProductCategory,
      id,
      createdAt,
      parentCategoryId: insertProductCategory.parentCategoryId || null,
      description: insertProductCategory.description || null,
      isActive: insertProductCategory.isActive === undefined ? true : insertProductCategory.isActive
    };
    
    this.productCategoriesMap.set(id, productCategory);
    return productCategory;
  }

  async updateProductCategory(id: number, categoryData: Partial<InsertProductCategory>): Promise<ProductCategory | undefined> {
    const existingCategory = this.productCategoriesMap.get(id);
    if (!existingCategory) {
      return undefined;
    }
    
    const updatedCategory = {
      ...existingCategory,
      ...categoryData
    };
    
    this.productCategoriesMap.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteProductCategory(id: number): Promise<boolean> {
    return this.productCategoriesMap.delete(id);
  }

  // Product Methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async listProducts(filter?: Partial<Product>): Promise<Product[]> {
    let products = Array.from(this.products.values());
    
    if (filter) {
      products = products.filter(product => {
        for (const [key, value] of Object.entries(filter)) {
          if (product[key as keyof Product] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return products;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const createdAt = new Date();
    
    const product: Product = {
      ...insertProduct,
      id,
      createdAt,
      categoryId: insertProduct.categoryId || null,
      description: insertProduct.description || null,
      sku: insertProduct.sku || null,
      price: insertProduct.price || null,
      cost: insertProduct.cost || null,
      quantity: insertProduct.quantity || 0,
      imageUrl: insertProduct.imageUrl || null,
      isActive: insertProduct.isActive === undefined ? true : insertProduct.isActive,
      createdBy: insertProduct.createdBy || null,
      updatedBy: insertProduct.updatedBy || null,
      updatedAt: null
    };
    
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) {
      return undefined;
    }
    
    const updatedProduct = {
      ...existingProduct,
      ...productData,
      updatedAt: new Date()
    };
    
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  async getProductInventory(productId: number): Promise<number> {
    let totalQuantity = 0;
    
    // Calculate based on inventory transactions
    for (const transaction of this.inventoryTransactions.values()) {
      if (transaction.productId === productId) {
        if (['Purchase', 'Return', 'Adjustment'].includes(transaction.type)) {
          totalQuantity += parseInt(transaction.quantity);
        } else {
          totalQuantity -= parseInt(transaction.quantity);
        }
      }
    }
    
    return totalQuantity;
  }
  
  async getInventorySummary(): Promise<{products: Array<{id: number, name: string, sku: string, stock: number, value: number}>}> {
    const allProducts = Array.from(this.products.values());
    
    const productsWithStock = await Promise.all(
      allProducts.map(async (product) => {
        const stock = await this.getProductInventory(product.id);
        const price = typeof product.price === 'string' ? parseFloat(product.price) : (product.price || 0);
        
        return {
          id: product.id,
          name: product.name,
          sku: product.sku || '',
          stock,
          value: stock * price
        };
      })
    );
    
    return { products: productsWithStock };
  }

  // Inventory Transaction Methods
  async getInventoryTransaction(id: number): Promise<InventoryTransaction | undefined> {
    return this.inventoryTransactions.get(id);
  }

  async listInventoryTransactions(filter?: Partial<InventoryTransaction>): Promise<InventoryTransaction[]> {
    let transactions = Array.from(this.inventoryTransactions.values());
    
    if (filter) {
      transactions = transactions.filter(transaction => {
        for (const [key, value] of Object.entries(filter)) {
          if (transaction[key as keyof InventoryTransaction] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return transactions;
  }

  async createInventoryTransaction(insertTransaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    const id = this.inventoryTransactionIdCounter++;
    const createdAt = new Date();
    
    const transaction: InventoryTransaction = {
      ...insertTransaction,
      id,
      createdAt,
      notes: insertTransaction.notes || null,
      referenceId: insertTransaction.referenceId || null,
      createdBy: insertTransaction.createdBy || null
    };
    
    // Update product quantity based on transaction type
    if (transaction.productId) {
      const product = this.products.get(transaction.productId);
      if (product) {
        let newQuantity = product.quantity || 0;
        
        switch (transaction.type) {
          case 'Purchase':
          case 'Return':
            newQuantity += transaction.quantity;
            break;
          case 'Sale':
          case 'Adjustment':
            newQuantity -= transaction.quantity;
            break;
          case 'Transfer':
            // Handle transfers separately if there's a source and destination
            break;
        }
        
        this.updateProduct(product.id, { quantity: newQuantity });
      }
    }
    
    this.inventoryTransactions.set(id, transaction);
    return transaction;
  }

  async updateInventoryTransaction(id: number, transactionData: Partial<InsertInventoryTransaction>): Promise<InventoryTransaction | undefined> {
    const existingTransaction = this.inventoryTransactions.get(id);
    if (!existingTransaction) {
      return undefined;
    }
    
    // Don't allow changing product or quantity as it would affect inventory
    const { productId, quantity, type, ...allowedChanges } = transactionData;
    
    const updatedTransaction = {
      ...existingTransaction,
      ...allowedChanges
    };
    
    this.inventoryTransactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteInventoryTransaction(id: number): Promise<boolean> {
    // In a real system, we would likely void the transaction rather than delete it
    // For simplicity, we'll just return false to indicate deletion is not allowed
    return false;
  }

  // Invoice Methods
  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async listInvoices(filter?: Partial<Invoice>): Promise<Invoice[]> {
    let invoices = Array.from(this.invoices.values());
    
    if (filter) {
      invoices = invoices.filter(invoice => {
        for (const [key, value] of Object.entries(filter)) {
          if (invoice[key as keyof Invoice] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return invoices;
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.invoiceIdCounter++;
    const createdAt = new Date();
    
    const invoice: Invoice = {
      ...insertInvoice,
      id,
      createdAt,
      accountId: insertInvoice.accountId || null,
      contactId: insertInvoice.contactId || null,
      billingAddress: insertInvoice.billingAddress || null,
      shippingAddress: insertInvoice.shippingAddress || null,
      notes: insertInvoice.notes || null,
      dueDate: insertInvoice.dueDate || null,
      subtotal: insertInvoice.subtotal || 0,
      taxAmount: insertInvoice.taxAmount || 0,
      discountAmount: insertInvoice.discountAmount || 0,
      totalAmount: insertInvoice.totalAmount || 0,
      paidAmount: insertInvoice.paidAmount || 0,
      paymentDate: insertInvoice.paymentDate || null,
      paymentMethod: insertInvoice.paymentMethod || null,
      createdBy: insertInvoice.createdBy || null,
      updatedBy: insertInvoice.updatedBy || null,
      updatedAt: null
    };
    
    this.invoices.set(id, invoice);
    return invoice;
  }

  async updateInvoice(id: number, invoiceData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const existingInvoice = this.invoices.get(id);
    if (!existingInvoice) {
      return undefined;
    }
    
    const updatedInvoice = {
      ...existingInvoice,
      ...invoiceData,
      updatedAt: new Date()
    };
    
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    return this.invoices.delete(id);
  }

  // Invoice Item Methods
  async getInvoiceItem(id: number): Promise<InvoiceItem | undefined> {
    return this.invoiceItems.get(id);
  }

  async listInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    const allItems = Array.from(this.invoiceItems.values());
    return allItems.filter(item => item.invoiceId === invoiceId);
  }

  async createInvoiceItem(insertInvoiceItem: InsertInvoiceItem): Promise<InvoiceItem> {
    const id = this.invoiceItemIdCounter++;
    
    const invoiceItem: InvoiceItem = {
      ...insertInvoiceItem,
      id,
      discount: insertInvoiceItem.discount || 0,
      taxRate: insertInvoiceItem.taxRate || 0,
      taxAmount: insertInvoiceItem.taxAmount || 0,
      createdAt: new Date()
    };
    
    this.invoiceItems.set(id, invoiceItem);
    
    // Update invoice totals
    const invoice = this.invoices.get(invoiceItem.invoiceId);
    if (invoice) {
      const items = await this.listInvoiceItems(invoice.id);
      
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const taxAmount = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
      const discountAmount = items.reduce((sum, item) => {
        const itemDiscount = item.discount || 0;
        return sum + (item.quantity * item.unitPrice * itemDiscount / 100);
      }, 0);
      
      const totalAmount = subtotal + taxAmount - discountAmount;
      
      await this.updateInvoice(invoice.id, {
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount
      });
    }
    
    return invoiceItem;
  }

  async updateInvoiceItem(id: number, itemData: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined> {
    const existingItem = this.invoiceItems.get(id);
    if (!existingItem) {
      return undefined;
    }
    
    const updatedItem = {
      ...existingItem,
      ...itemData
    };
    
    this.invoiceItems.set(id, updatedItem);
    
    // Update invoice totals
    const invoice = this.invoices.get(updatedItem.invoiceId);
    if (invoice) {
      const items = await this.listInvoiceItems(invoice.id);
      
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const taxAmount = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
      const discountAmount = items.reduce((sum, item) => {
        const itemDiscount = item.discount || 0;
        return sum + (item.quantity * item.unitPrice * itemDiscount / 100);
      }, 0);
      
      const totalAmount = subtotal + taxAmount - discountAmount;
      
      await this.updateInvoice(invoice.id, {
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount
      });
    }
    
    return updatedItem;
  }

  async deleteInvoiceItem(id: number): Promise<boolean> {
    const item = this.invoiceItems.get(id);
    if (!item) {
      return false;
    }
    
    const invoiceId = item.invoiceId;
    const deleted = this.invoiceItems.delete(id);
    
    if (deleted) {
      // Update invoice totals
      const invoice = this.invoices.get(invoiceId);
      if (invoice) {
        const items = await this.listInvoiceItems(invoice.id);
        
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const taxAmount = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
        const discountAmount = items.reduce((sum, item) => {
          const itemDiscount = item.discount || 0;
          return sum + (item.quantity * item.unitPrice * itemDiscount / 100);
        }, 0);
        
        const totalAmount = subtotal + taxAmount - discountAmount;
        
        await this.updateInvoice(invoice.id, {
          subtotal,
          taxAmount,
          discountAmount,
          totalAmount
        });
      }
    }
    
    return deleted;
  }

  // Purchase Order Methods
  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    return this.purchaseOrders.get(id);
  }

  async listPurchaseOrders(filter?: Partial<PurchaseOrder>): Promise<PurchaseOrder[]> {
    let orders = Array.from(this.purchaseOrders.values());
    
    if (filter) {
      orders = orders.filter(order => {
        for (const [key, value] of Object.entries(filter)) {
          if (order[key as keyof PurchaseOrder] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return orders;
  }

  async createPurchaseOrder(insertPurchaseOrder: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const id = this.purchaseOrderIdCounter++;
    const createdAt = new Date();
    
    const purchaseOrder: PurchaseOrder = {
      ...insertPurchaseOrder,
      id,
      createdAt,
      vendorId: insertPurchaseOrder.vendorId || null,
      expectedDeliveryDate: insertPurchaseOrder.expectedDeliveryDate || null,
      deliveryAddress: insertPurchaseOrder.deliveryAddress || null,
      notes: insertPurchaseOrder.notes || null,
      subtotal: insertPurchaseOrder.subtotal || 0,
      taxAmount: insertPurchaseOrder.taxAmount || 0,
      discountAmount: insertPurchaseOrder.discountAmount || 0,
      totalAmount: insertPurchaseOrder.totalAmount || 0,
      createdBy: insertPurchaseOrder.createdBy || null,
      updatedBy: insertPurchaseOrder.updatedBy || null,
      updatedAt: null
    };
    
    this.purchaseOrders.set(id, purchaseOrder);
    return purchaseOrder;
  }

  async updatePurchaseOrder(id: number, orderData: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const existingOrder = this.purchaseOrders.get(id);
    if (!existingOrder) {
      return undefined;
    }
    
    const updatedOrder = {
      ...existingOrder,
      ...orderData,
      updatedAt: new Date()
    };
    
    this.purchaseOrders.set(id, updatedOrder);
    return updatedOrder;
  }

  async deletePurchaseOrder(id: number): Promise<boolean> {
    return this.purchaseOrders.delete(id);
  }

  // Purchase Order Item Methods
  async getPurchaseOrderItem(id: number): Promise<PurchaseOrderItem | undefined> {
    return this.purchaseOrderItems.get(id);
  }

  async listPurchaseOrderItems(orderId: number): Promise<PurchaseOrderItem[]> {
    const allItems = Array.from(this.purchaseOrderItems.values());
    return allItems.filter(item => item.purchaseOrderId === orderId);
  }

  async createPurchaseOrderItem(insertItem: InsertPurchaseOrderItem): Promise<PurchaseOrderItem> {
    const id = this.purchaseOrderItemIdCounter++;
    
    const orderItem: PurchaseOrderItem = {
      ...insertItem,
      id,
      receivedQuantity: insertItem.receivedQuantity || 0,
      notes: insertItem.notes || null,
      createdAt: new Date()
    };
    
    this.purchaseOrderItems.set(id, orderItem);
    
    // Update purchase order totals
    const order = this.purchaseOrders.get(orderItem.purchaseOrderId);
    if (order) {
      const items = await this.listPurchaseOrderItems(order.id);
      
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const totalAmount = subtotal; // Add tax calculations if needed
      
      await this.updatePurchaseOrder(order.id, {
        subtotal,
        totalAmount
      });
    }
    
    return orderItem;
  }

  async updatePurchaseOrderItem(id: number, itemData: Partial<InsertPurchaseOrderItem>): Promise<PurchaseOrderItem | undefined> {
    const existingItem = this.purchaseOrderItems.get(id);
    if (!existingItem) {
      return undefined;
    }
    
    const updatedItem = {
      ...existingItem,
      ...itemData
    };
    
    this.purchaseOrderItems.set(id, updatedItem);
    
    // Update purchase order totals
    const order = this.purchaseOrders.get(updatedItem.purchaseOrderId);
    if (order) {
      const items = await this.listPurchaseOrderItems(order.id);
      
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const totalAmount = subtotal; // Add tax calculations if needed
      
      await this.updatePurchaseOrder(order.id, {
        subtotal,
        totalAmount
      });
    }
    
    return updatedItem;
  }

  async deletePurchaseOrderItem(id: number): Promise<boolean> {
    const item = this.purchaseOrderItems.get(id);
    if (!item) {
      return false;
    }
    
    const orderId = item.purchaseOrderId;
    const deleted = this.purchaseOrderItems.delete(id);
    
    if (deleted) {
      // Update purchase order totals
      const order = this.purchaseOrders.get(orderId);
      if (order) {
        const items = await this.listPurchaseOrderItems(order.id);
        
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const totalAmount = subtotal; // Add tax calculations if needed
        
        await this.updatePurchaseOrder(order.id, {
          subtotal,
          totalAmount
        });
      }
    }
    
    return deleted;
  }

  // Receive Purchase Order Items
  async receivePurchaseOrderItems(orderId: number, receivedItems: { itemId: number, quantity: number }[]): Promise<boolean> {
    const order = this.purchaseOrders.get(orderId);
    if (!order) {
      return false;
    }
    
    for (const received of receivedItems) {
      const item = this.purchaseOrderItems.get(received.itemId);
      if (item && item.purchaseOrderId === orderId) {
        // Update received quantity
        const newReceivedQuantity = (item.receivedQuantity || 0) + received.quantity;
        await this.updatePurchaseOrderItem(item.itemId, { receivedQuantity: newReceivedQuantity });
        
        // Create inventory transaction
        if (item.productId) {
          await this.createInventoryTransaction({
            productId: item.productId,
            quantity: typeof received.quantity === 'number' ? received.quantity.toString() : received.quantity,
            type: 'Purchase',
            date: new Date(),
            referenceId: orderId, // Use numeric ID
            referenceType: 'purchase-order', // Specify the type in referenceType
            notes: `Received from purchase order #${orderId}`
          });
        }
      }
    }
    
    // Update order status if all items received
    const allItems = await this.listPurchaseOrderItems(orderId);
    const allReceived = allItems.every(item => (item.receivedQuantity || 0) >= item.quantity);
    const partiallyReceived = allItems.some(item => (item.receivedQuantity || 0) > 0);
    
    let newStatus: 'Received' | 'Partially Received' | undefined;
    
    if (allReceived) {
      newStatus = 'Received';
    } else if (partiallyReceived) {
      newStatus = 'Partially Received';
    }
    
    if (newStatus) {
      await this.updatePurchaseOrder(orderId, { status: newStatus });
    }
    
    return true;
  }

  // Proposal Template Methods
  async getProposalTemplate(id: number): Promise<ProposalTemplate | undefined> {
    return this.proposalTemplates.get(id);
  }

  async listProposalTemplates(): Promise<ProposalTemplate[]> {
    return Array.from(this.proposalTemplates.values());
  }

  async createProposalTemplate(template: InsertProposalTemplate): Promise<ProposalTemplate> {
    const id = this.proposalTemplateIdCounter++;
    const createdAt = new Date();
    
    const proposalTemplate: ProposalTemplate = {
      ...template,
      id,
      createdAt,
      updatedAt: createdAt,
      isActive: template.isActive === undefined ? true : template.isActive
    };
    
    this.proposalTemplates.set(id, proposalTemplate);
    return proposalTemplate;
  }

  async updateProposalTemplate(id: number, template: Partial<InsertProposalTemplate>): Promise<ProposalTemplate | undefined> {
    const existingTemplate = this.proposalTemplates.get(id);
    if (!existingTemplate) {
      return undefined;
    }
    
    const updatedTemplate = {
      ...existingTemplate,
      ...template,
      updatedAt: new Date()
    };
    
    this.proposalTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteProposalTemplate(id: number): Promise<boolean> {
    return this.proposalTemplates.delete(id);
  }

  // Proposal Methods
  async getProposal(id: number): Promise<Proposal | undefined> {
    return this.proposals.get(id);
  }

  async listProposals(filter?: Partial<Proposal>): Promise<Proposal[]> {
    let proposals = Array.from(this.proposals.values());
    
    if (filter) {
      proposals = proposals.filter(proposal => {
        for (const [key, value] of Object.entries(filter)) {
          if (proposal[key as keyof Proposal] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return proposals;
  }

  async createProposal(proposal: InsertProposal): Promise<Proposal> {
    const id = this.proposalIdCounter++;
    const createdAt = new Date();
    
    const newProposal: Proposal = {
      ...proposal,
      id,
      createdAt,
      updatedAt: createdAt,
      status: proposal.status || 'Draft'
    };
    
    this.proposals.set(id, newProposal);
    return newProposal;
  }

  async updateProposal(id: number, proposal: Partial<InsertProposal>): Promise<Proposal | undefined> {
    const existingProposal = this.proposals.get(id);
    if (!existingProposal) {
      return undefined;
    }
    
    const updatedProposal = {
      ...existingProposal,
      ...proposal,
      updatedAt: new Date()
    };
    
    this.proposals.set(id, updatedProposal);
    return updatedProposal;
  }

  async deleteProposal(id: number): Promise<boolean> {
    return this.proposals.delete(id);
  }

  // Proposal Element Methods
  async getProposalElement(id: number): Promise<ProposalElement | undefined> {
    return this.proposalElements.get(id);
  }

  async listProposalElements(proposalId: number): Promise<ProposalElement[]> {
    const elements = Array.from(this.proposalElements.values())
      .filter(element => element.proposalId === proposalId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    
    return elements;
  }

  async createProposalElement(element: InsertProposalElement): Promise<ProposalElement> {
    const id = this.proposalElementIdCounter++;
    const createdAt = new Date();
    
    // Auto-assign sort order if not provided
    let sortOrder = element.sortOrder;
    if (sortOrder === undefined) {
      const existingElements = await this.listProposalElements(element.proposalId);
      sortOrder = existingElements.length > 0 
        ? Math.max(...existingElements.map(e => e.sortOrder || 0)) + 10 
        : 10;
    }
    
    const proposalElement: ProposalElement = {
      ...element,
      id,
      createdAt,
      updatedAt: createdAt,
      sortOrder
    };
    
    this.proposalElements.set(id, proposalElement);
    return proposalElement;
  }

  async updateProposalElement(id: number, element: Partial<InsertProposalElement>): Promise<ProposalElement | undefined> {
    const existingElement = this.proposalElements.get(id);
    if (!existingElement) {
      return undefined;
    }
    
    const updatedElement = {
      ...existingElement,
      ...element,
      updatedAt: new Date()
    };
    
    this.proposalElements.set(id, updatedElement);
    return updatedElement;
  }

  async deleteProposalElement(id: number): Promise<boolean> {
    return this.proposalElements.delete(id);
  }

  // Proposal Collaborator Methods
  async getProposalCollaborator(id: number): Promise<ProposalCollaborator | undefined> {
    return this.proposalCollaborators.get(id);
  }

  async getProposalCollaborators(proposalId: number): Promise<(ProposalCollaborator & { user?: User })[]> {
    const collaborators = Array.from(this.proposalCollaborators.values())
      .filter(collab => collab.proposalId === proposalId);
    
    // Attach user info
    return Promise.all(collaborators.map(async (collab) => {
      const user = await this.getUser(collab.userId);
      return { ...collab, user };
    }));
  }

  async addProposalCollaborator(collaborator: InsertProposalCollaborator): Promise<ProposalCollaborator> {
    const id = this.proposalCollaboratorIdCounter++;
    const createdAt = new Date();
    
    const proposalCollaborator: ProposalCollaborator = {
      ...collaborator,
      id,
      createdAt
    };
    
    this.proposalCollaborators.set(id, proposalCollaborator);
    return proposalCollaborator;
  }

  async updateProposalCollaborator(id: number, collaborator: Partial<InsertProposalCollaborator>): Promise<ProposalCollaborator | undefined> {
    const existingCollaborator = this.proposalCollaborators.get(id);
    if (!existingCollaborator) {
      return undefined;
    }
    
    const updatedCollaborator = {
      ...existingCollaborator,
      ...collaborator
    };
    
    this.proposalCollaborators.set(id, updatedCollaborator);
    return updatedCollaborator;
  }

  async deleteProposalCollaborator(id: number): Promise<boolean> {
    return this.proposalCollaborators.delete(id);
  }

  // Proposal Comment Methods
  async getProposalComment(id: number): Promise<ProposalComment | undefined> {
    return this.proposalComments.get(id);
  }

  async getProposalComments(proposalId: number): Promise<(ProposalComment & { user?: User })[]> {
    const comments = Array.from(this.proposalComments.values())
      .filter(comment => comment.proposalId === proposalId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    // Attach user info
    return Promise.all(comments.map(async (comment) => {
      const user = await this.getUser(comment.userId);
      return { ...comment, user };
    }));
  }

  async createProposalComment(comment: InsertProposalComment): Promise<ProposalComment> {
    const id = this.proposalCommentIdCounter++;
    const createdAt = new Date();
    
    const proposalComment: ProposalComment = {
      ...comment,
      id,
      createdAt
    };
    
    this.proposalComments.set(id, proposalComment);
    return proposalComment;
  }

  async updateProposalComment(id: number, comment: Partial<InsertProposalComment>): Promise<ProposalComment | undefined> {
    const existingComment = this.proposalComments.get(id);
    if (!existingComment) {
      return undefined;
    }
    
    const updatedComment = {
      ...existingComment,
      ...comment
    };
    
    this.proposalComments.set(id, updatedComment);
    return updatedComment;
  }

  async deleteProposalComment(id: number): Promise<boolean> {
    return this.proposalComments.delete(id);
  }

  // Proposal Activity Methods
  async createProposalActivity(activity: InsertProposalActivity): Promise<ProposalActivity> {
    const id = this.proposalActivityIdCounter++;
    const createdAt = new Date();
    
    // Normalize field names to match schema (activityType and description)
    const normalizedActivity = {
      ...activity,
      // If old field names are used, map them to new field names
      activityType: activity.activityType || activity['action'],
      description: activity.description || activity['detail'],
    };
    
    // Remove old field names if present
    if ('action' in normalizedActivity) delete normalizedActivity['action'];
    if ('detail' in normalizedActivity) delete normalizedActivity['detail'];
    
    const proposalActivity: ProposalActivity = {
      ...normalizedActivity,
      id,
      createdAt
    };
    
    this.proposalActivities.set(id, proposalActivity);
    return proposalActivity;
  }

  async getProposalActivities(proposalId: number): Promise<(ProposalActivity & { user?: User })[]> {
    const activities = Array.from(this.proposalActivities.values())
      .filter(activity => activity.proposalId === proposalId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Attach user info
    return Promise.all(activities.map(async (activity) => {
      const user = activity.userId ? await this.getUser(activity.userId) : undefined;
      return { ...activity, user };
    }));
  }

  async listWorkflows(filter?: Partial<Workflow>): Promise<Workflow[]> {
    let workflows = Array.from(this.workflows.values());
    
    if (filter) {
      workflows = workflows.filter(workflow => {
        for (const [key, value] of Object.entries(filter)) {
          if (workflow[key as keyof Workflow] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return workflows;
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const id = this.workflowIdCounter++;
    const createdAt = new Date();
    
    const workflow: Workflow = { 
      ...insertWorkflow,
      id,
      createdAt,
      name: insertWorkflow.name,
      description: insertWorkflow.description || null,
      status: insertWorkflow.status || "Draft",
      steps: insertWorkflow.steps || [],
      triggerType: insertWorkflow.triggerType || null,
      triggerConfig: insertWorkflow.triggerConfig || null,
      ownerId: insertWorkflow.ownerId || null,
      lastExecuted: null,
      isActive: insertWorkflow.isActive === undefined ? true : insertWorkflow.isActive,
      isTemplate: insertWorkflow.isTemplate === undefined ? false : insertWorkflow.isTemplate
    };
    
    this.workflows.set(id, workflow);
    return workflow;
  }

  async updateWorkflow(id: number, workflowData: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const existingWorkflow = this.workflows.get(id);
    if (!existingWorkflow) {
      return undefined;
    }
    
    const updatedWorkflow = {
      ...existingWorkflow,
      ...workflowData
    };
    
    this.workflows.set(id, updatedWorkflow);
    return updatedWorkflow;
  }

  async deleteWorkflow(id: number): Promise<boolean> {
    return this.workflows.delete(id);
  }
}

// Initialize default subscription packages
function initializeSubscriptionPackages(storage: MemStorage) {
  // Create three subscription tiers
  storage.createSubscriptionPackage({
    name: "Starter",
    description: "Basic CRM features for small businesses",
    price: 19.99,
    interval: "monthly",
    features: ["Contact Management", "Basic Lead Tracking", "Task Management"],
    maxUsers: 3,
    maxContacts: 500,
    maxStorage: 5,
    displayOrder: 1,
    stripePriceId: "price_starter_monthly"
  });
  
  storage.createSubscriptionPackage({
    name: "Professional",
    description: "Advanced features for growing businesses",
    price: 49.99,
    interval: "monthly",
    features: ["All Starter Features", "Sales Pipeline", "Opportunity Management", "Basic AI Insights", "Email Templates"],
    maxUsers: 10,
    maxContacts: 2500,
    maxStorage: 20,
    displayOrder: 2,
    stripePriceId: "price_professional_monthly"
  });
  
  storage.createSubscriptionPackage({
    name: "Enterprise",
    description: "Complete solution for established businesses",
    price: 99.99,
    interval: "monthly",
    features: ["All Professional Features", "Advanced AI Insights", "Custom Reporting", "Workflow Automation", "Dedicated Support"],
    maxUsers: 25,
    maxContacts: 10000,
    maxStorage: 100,
    displayOrder: 3,
    stripePriceId: "price_enterprise_monthly"
  });
  
  // Yearly plans (offered at a discount)
  storage.createSubscriptionPackage({
    name: "Starter (Annual)",
    description: "Basic CRM features for small businesses - 20% discount",
    price: 191.88, // 19.99 * 12 * 0.8 (20% off)
    interval: "yearly",
    features: ["Contact Management", "Basic Lead Tracking", "Task Management"],
    maxUsers: 3,
    maxContacts: 500,
    maxStorage: 5,
    displayOrder: 4,
    stripePriceId: "price_starter_yearly"
  });
  
  storage.createSubscriptionPackage({
    name: "Professional (Annual)",
    description: "Advanced features for growing businesses - 20% discount",
    price: 479.88, // 49.99 * 12 * 0.8 (20% off)
    interval: "yearly",
    features: ["All Starter Features", "Sales Pipeline", "Opportunity Management", "Basic AI Insights", "Email Templates"],
    maxUsers: 10,
    maxContacts: 2500,
    maxStorage: 20,
    displayOrder: 5,
    stripePriceId: "price_professional_yearly"
  });
  
  storage.createSubscriptionPackage({
    name: "Enterprise (Annual)",
    description: "Complete solution for established businesses - 20% discount",
    price: 959.88, // 99.99 * 12 * 0.8 (20% off)
    interval: "yearly",
    features: ["All Professional Features", "Advanced AI Insights", "Custom Reporting", "Workflow Automation", "Dedicated Support"],
    maxUsers: 25,
    maxContacts: 10000,
    maxStorage: 100,
    displayOrder: 6,
    stripePriceId: "price_enterprise_yearly"
  });
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // Session store for authentication
  public sessionStore: session.Store;
  private systemSettingsMap: Map<string, SystemSettings>;

  constructor() {
    // Initialize PostgreSQL session store
    this.sessionStore = new PostgresSessionStore({
      pool,
      tableName: 'session', // Name of the table to store sessions
      createTableIfMissing: true // Automatically create the session table if it doesn't exist
    });
    
    // Initialize system settings map
    this.systemSettingsMap = new Map();
  }

  // Implement all methods from IStorage interface with database queries

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Database error in getUser:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      console.log('Searching for user with username:', username);
      const result = await db.select().from(users).where(eq(users.username, username));
      console.log('Database result:', JSON.stringify(result));
      
      if (result.length === 0) {
        console.log('No user found with username:', username);
        return undefined;
      }
      
      const [user] = result;
      console.log('Found user:', user.id, user.username);
      return user;
    } catch (error) {
      console.error('Database error in getUserByUsername:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values({
        ...insertUser,
        createdAt: new Date(),
        isActive: true,
        isVerified: false
      }).returning();
      return user;
    } catch (error) {
      console.error('Database error in createUser:', error);
      throw error;
    }
  }

  async listUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error('Database error in listUsers:', error);
      return [];
    }
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const [updatedUser] = await db.update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error('Database error in updateUser:', error);
      return undefined;
    }
  }

  // User-Stripe methods
  async updateUserStripeInfo(userId: number, stripeInfo: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User | undefined> {
    try {
      const [updatedUser] = await db.update(users)
        .set({
          stripeCustomerId: stripeInfo.stripeCustomerId,
          stripeSubscriptionId: stripeInfo.stripeSubscriptionId
        })
        .where(eq(users.id, userId))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error('Database error in updateUserStripeInfo:', error);
      return undefined;
    }
  }

  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User | undefined> {
    try {
      const [updatedUser] = await db.update(users)
        .set({ stripeCustomerId })
        .where(eq(users.id, userId))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error('Database error in updateStripeCustomerId:', error);
      return undefined;
    }
  }

  // Placeholder methods to satisfy IStorage - implement as needed
  // These would be implemented with proper database queries like the ones above
  // For each entity (contacts, accounts, leads, etc.)
  
  // Contact Methods
  async getContact(id: number): Promise<Contact | undefined> {
    try {
      const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
      return contact || undefined;
    } catch (error) {
      console.error('Database error in getContact:', error);
      return undefined;
    }
  }

  async listContacts(filter?: Partial<Contact>): Promise<Contact[]> {
    try {
      const allContacts = await db.select().from(contacts);
      return allContacts;
    } catch (error) {
      console.error("Error retrieving contacts:", error);
      return [];
    }
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    try {
      const [newContact] = await db.insert(contacts).values({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        address: contact.address,
        city: contact.city,
        state: contact.state,
        zip: contact.zip,
        country: contact.country,
        accountId: contact.accountId,
        title: contact.title,
        department: contact.department,
        leadSource: contact.leadSource,
        assignedTo: contact.assignedTo,
        status: contact.status,
        tags: contact.tags,
        notes: contact.notes,
        socialProfiles: contact.socialProfiles,
        createdAt: new Date(),
      }).returning();
      
      return newContact;
    } catch (error) {
      console.error('Database error in createContact:', error);
      throw new Error('Failed to create contact');
    }
  }

  async updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact | undefined> {
    try {
      const [updatedContact] = await db.update(contacts)
        .set({
          ...contact,
          updatedAt: new Date()
        })
        .where(eq(contacts.id, id))
        .returning();
      return updatedContact;
    } catch (error) {
      console.error('Database error in updateContact:', error);
      return undefined;
    }
  }

  async deleteContact(id: number): Promise<boolean> {
    try {
      const result = await db.delete(contacts)
        .where(eq(contacts.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Database error in deleteContact:', error);
      return false;
    }
  }

  // Account Methods
  async getAccount(id: number): Promise<Account | undefined> {
    try {
      const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
      return account || undefined;
    } catch (error) {
      console.error("Error fetching account:", error);
      return undefined;
    }
  }

  async listAccounts(filter?: Partial<Account>): Promise<Account[]> {
    try {
      const allAccounts = await db.select().from(accounts);
      return allAccounts;
    } catch (error) {
      console.error("Error retrieving accounts:", error);
      return [];
    }
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    try {
      const [newAccount] = await db.insert(accounts).values({
        ...account,
        createdAt: new Date(),
        isActive: account.isActive !== false
      }).returning();
      return newAccount;
    } catch (error) {
      console.error('Database error in createAccount:', error);
      throw error;
    }
  }

  async updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined> {
    try {
      const [updatedAccount] = await db.update(accounts)
        .set({
          ...account,
          updatedAt: new Date()
        })
        .where(eq(accounts.id, id))
        .returning();
      return updatedAccount;
    } catch (error) {
      console.error('Database error in updateAccount:', error);
      return undefined;
    }
  }

  async deleteAccount(id: number): Promise<boolean> {
    try {
      const result = await db.delete(accounts)
        .where(eq(accounts.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Database error in deleteAccount:', error);
      return false;
    }
  }

  // Lead Methods
  async getLead(id: number): Promise<Lead | undefined> {
    try {
      const [lead] = await db.select().from(leads).where(eq(leads.id, id));
      return lead;
    } catch (error) {
      console.error("Error retrieving lead:", error);
      return undefined;
    }
  }

  async listLeads(filter?: Partial<Lead>): Promise<Lead[]> {
    try {
      const allLeads = await db.select().from(leads);
      return allLeads;
    } catch (error) {
      console.error("Error retrieving leads:", error);
      return [];
    }
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    try {
      console.log('Creating lead with data:', lead);
      const [newLead] = await db.insert(leads).values({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        title: lead.title,
        status: lead.status,
        source: lead.source,
        ownerId: lead.ownerId,
        notes: lead.notes,
        // These fields are handled by the database with default values:
        // isConverted, convertedToContactId, convertedToAccountId, convertedToOpportunityId
      }).returning();
      
      console.log('Lead created successfully:', newLead);
      return newLead;
    } catch (error) {
      console.error('Database error in createLead:', error);
      throw new Error(`Failed to create lead: ${error.message}`);
    }
  }

  async updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined> {
    try {
      const [updatedLead] = await db.update(leads)
        .set({
          ...lead,
          updatedAt: new Date()
        })
        .where(eq(leads.id, id))
        .returning();
      return updatedLead;
    } catch (error) {
      console.error('Database error in updateLead:', error);
      return undefined;
    }
  }

  async deleteLead(id: number): Promise<boolean> {
    try {
      const result = await db.delete(leads)
        .where(eq(leads.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Database error in deleteLead:', error);
      return false;
    }
  }

  async convertLead(id: number, convertTo: { contact?: InsertContact, account?: InsertAccount, opportunity?: InsertOpportunity }): Promise<{ contact?: Contact, account?: Account, opportunity?: Opportunity, lead: Lead }> {
    try {
      // Fetch the lead to convert
      const [lead] = await db.select().from(leads).where(eq(leads.id, id));
      
      if (!lead) {
        throw new Error(`Lead with ID ${id} not found`);
      }

      const result: { contact?: Contact, account?: Account, opportunity?: Opportunity, lead: Lead } = {
        lead
      };

      // Start a transaction
      await db.transaction(async (tx) => {
        console.log(`[Lead Conversion] Starting transaction for lead ${id}`);
        
        // Create contact if requested
        if (convertTo.contact) {
          // If no contact data provided, create from lead data
          const contactData = {
            ...convertTo.contact,
            firstName: convertTo.contact.firstName || lead.firstName,
            lastName: convertTo.contact.lastName || lead.lastName,
            email: convertTo.contact.email || lead.email,
            phone: convertTo.contact.phone || lead.phone,
            company: convertTo.contact.company || lead.company,
            title: convertTo.contact.title || lead.title,
            ownerId: convertTo.contact.ownerId || lead.ownerId,
            notes: convertTo.contact.notes || lead.notes,
          };
          
          console.log(`[Lead Conversion] Creating contact from lead ${id}`);
          const [contact] = await tx.insert(contacts).values(contactData).returning();
          result.contact = contact;
        }

        // Create account if requested
        if (convertTo.account) {
          // If no account data provided, create from lead data
          const accountData = {
            ...convertTo.account,
            name: convertTo.account.name || lead.company || `${lead.firstName} ${lead.lastName}'s Account`,
            ownerId: convertTo.account.ownerId || lead.ownerId,
            notes: convertTo.account.notes || lead.notes,
          };
          
          console.log(`[Lead Conversion] Creating account from lead ${id}`);
          const [account] = await tx.insert(accounts).values(accountData).returning();
          result.account = account;
        }

        // Create opportunity if requested
        if (convertTo.opportunity) {
          // If no opportunity data provided, create with basic data
          const opportunityData = {
            ...convertTo.opportunity,
            name: convertTo.opportunity.name || `${lead.firstName} ${lead.lastName} Opportunity`,
            accountId: convertTo.opportunity.accountId || (result.account ? result.account.id : null),
            ownerId: convertTo.opportunity.ownerId || lead.ownerId,
            notes: convertTo.opportunity.notes || lead.notes,
          };
          
          console.log(`[Lead Conversion] Creating opportunity from lead ${id}`);
          const [opportunity] = await tx.insert(opportunities).values(opportunityData).returning();
          result.opportunity = opportunity;
        }

        // Update lead to mark as converted
        const updateData: any = {
          isConverted: true,
          convertedToContactId: result.contact?.id || null,
          convertedToAccountId: result.account?.id || null,
          convertedToOpportunityId: result.opportunity?.id || null,
        };
        
        console.log(`[Lead Conversion] Updating lead ${id} as converted`);
        const [updatedLead] = await tx.update(leads)
          .set(updateData)
          .where(eq(leads.id, id))
          .returning();
          
        result.lead = updatedLead;
      });

      console.log(`[Lead Conversion] Successfully converted lead ${id}`);
      return result;
    } catch (error) {
      console.error('Error converting lead:', error);
      throw error;
    }
  }

  // Opportunity Methods
  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    try {
      const [opportunity] = await db.select().from(opportunities).where(eq(opportunities.id, id));
      return opportunity;
    } catch (error) {
      console.error("Error retrieving opportunity:", error);
      return undefined;
    }
  }

  async listOpportunities(filter?: Partial<Opportunity>): Promise<Opportunity[]> {
    try {
      const allOpportunities = await db.select().from(opportunities);
      return allOpportunities;
    } catch (error) {
      console.error("Error retrieving opportunities:", error);
      return [];
    }
  }

  async createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity> {
    try {
      const [newOpportunity] = await db.insert(opportunities).values({
        ...opportunity,
        createdAt: new Date()
      }).returning();
      
      return newOpportunity;
    } catch (error) {
      console.error('Database error in createOpportunity:', error);
      throw new Error('Failed to create opportunity');
    }
  }

  async updateOpportunity(id: number, opportunity: Partial<InsertOpportunity>): Promise<Opportunity | undefined> {
    try {
      const [updatedOpportunity] = await db.update(opportunities)
        .set({
          ...opportunity,
          updatedAt: new Date()
        })
        .where(eq(opportunities.id, id))
        .returning();
      return updatedOpportunity;
    } catch (error) {
      console.error('Database error in updateOpportunity:', error);
      return undefined;
    }
  }

  async deleteOpportunity(id: number): Promise<boolean> {
    try {
      const result = await db.delete(opportunities)
        .where(eq(opportunities.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Database error in deleteOpportunity:', error);
      return false;
    }
  }

  // Task Methods
  async getTask(id: number): Promise<Task | undefined> {
    try {
      const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
      return task;
    } catch (error) {
      console.error("Error retrieving task:", error);
      return undefined;
    }
  }

  async listTasks(filter?: Partial<Task>): Promise<Task[]> {
    try {
      let query = db.select().from(tasks);
      
      // Apply filters if provided
      if (filter) {
        if (filter.assignedTo !== undefined) {
          query = query.where(eq(tasks.assignedTo, filter.assignedTo));
        }
        if (filter.relatedToId !== undefined && filter.relatedToType !== undefined) {
          query = query.where(
            and(
              eq(tasks.relatedToId, filter.relatedToId),
              eq(tasks.relatedToType, filter.relatedToType)
            )
          );
        }
        if (filter.status !== undefined) {
          query = query.where(eq(tasks.status, filter.status));
        }
        if (filter.priority !== undefined) {
          query = query.where(eq(tasks.priority, filter.priority));
        }
      }
      
      const allTasks = await query;
      return allTasks;
    } catch (error) {
      console.error("Error retrieving tasks:", error);
      return [];
    }
  }

  async createTask(task: InsertTask): Promise<Task> {
    try {
      const [newTask] = await db.insert(tasks).values({
        ...task,
        createdAt: new Date(),
        isCompleted: task.isCompleted || false
      }).returning();
      
      return newTask;
    } catch (error) {
      console.error('Database error in createTask:', error);
      throw new Error('Failed to create task');
    }
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    try {
      const [updatedTask] = await db.update(tasks)
        .set({
          ...task,
          updatedAt: new Date()
        })
        .where(eq(tasks.id, id))
        .returning();
      return updatedTask;
    } catch (error) {
      console.error('Database error in updateTask:', error);
      return undefined;
    }
  }

  async deleteTask(id: number): Promise<boolean> {
    try {
      const result = await db.delete(tasks)
        .where(eq(tasks.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Database error in deleteTask:', error);
      return false;
    }
  }

  // Event Methods
  async getEvent(id: number): Promise<Event | undefined> {
    try {
      const [event] = await db.select().from(events).where(eq(events.id, id));
      return event;
    } catch (error) {
      console.error("Error retrieving event:", error);
      return undefined;
    }
  }

  async listEvents(filter?: Partial<Event>): Promise<Event[]> {
    try {
      let query = db.select().from(events);
      
      // Apply filters if provided
      if (filter) {
        if (filter.createdBy !== undefined) {
          query = query.where(eq(events.createdBy, filter.createdBy));
        }
        if (filter.relatedToId !== undefined && filter.relatedToType !== undefined) {
          query = query.where(
            and(
              eq(events.relatedToId, filter.relatedToId),
              eq(events.relatedToType, filter.relatedToType)
            )
          );
        }
        if (filter.status !== undefined) {
          query = query.where(eq(events.status, filter.status));
        }
        // Filter by date range
        if (filter.startDate !== undefined) {
          query = query.where(gte(events.startDate, filter.startDate));
        }
        if (filter.endDate !== undefined) {
          query = query.where(lte(events.endDate, filter.endDate));
        }
      }
      
      const allEvents = await query;
      return allEvents;
    } catch (error) {
      console.error("Error retrieving events:", error);
      return [];
    }
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    try {
      const [newEvent] = await db.insert(events).values({
        ...event,
        createdAt: new Date()
      }).returning();
      
      return newEvent;
    } catch (error) {
      console.error('Database error in createEvent:', error);
      throw new Error('Failed to create event');
    }
  }

  async updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined> {
    try {
      const [updatedEvent] = await db.update(events)
        .set({
          ...event,
          updatedAt: new Date()
        })
        .where(eq(events.id, id))
        .returning();
      return updatedEvent;
    } catch (error) {
      console.error('Database error in updateEvent:', error);
      return undefined;
    }
  }

  async deleteEvent(id: number): Promise<boolean> {
    try {
      const result = await db.delete(events)
        .where(eq(events.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Database error in deleteEvent:', error);
      return false;
    }
  }

  // Activity Methods
  async getActivity(id: number): Promise<Activity | undefined> {
    try {
      const [activity] = await db.select().from(activities).where(eq(activities.id, id));
      return activity;
    } catch (error) {
      console.error("Error retrieving activity:", error);
      return undefined;
    }
  }

  async listActivities(filter?: Partial<Activity>): Promise<Activity[]> {
    try {
      let query = db.select().from(activities);
      
      // Apply filters if provided
      if (filter) {
        if (filter.userId !== undefined) {
          query = query.where(eq(activities.userId, filter.userId));
        }
        if (filter.relatedToId !== undefined && filter.relatedToType !== undefined) {
          query = query.where(
            and(
              eq(activities.relatedToId, filter.relatedToId),
              eq(activities.relatedToType, filter.relatedToType)
            )
          );
        }
        if (filter.action !== undefined) {
          query = query.where(eq(activities.action, filter.action));
        }
      }
      
      // Always sort by most recent first
      query = query.orderBy(desc(activities.createdAt));
      
      const allActivities = await query;
      return allActivities;
    } catch (error) {
      console.error("Error retrieving activities:", error);
      return [];
    }
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    try {
      const [newActivity] = await db.insert(activities).values({
        ...activity,
        createdAt: new Date()
      }).returning();
      
      return newActivity;
    } catch (error) {
      console.error('Database error in createActivity:', error);
      throw new Error('Failed to create activity');
    }
  }

  // Dashboard Methods
  async getDashboardStats(): Promise<{ newLeads: number; conversionRate: string; revenue: string; openDeals: number; }> {
    try {
      // Get new leads from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const newLeadsResult = await db.select({ count: sql`count(*)` })
        .from(leads)
        .where(
          and(
            eq(leads.status, 'New'),
            gte(leads.createdAt, thirtyDaysAgo)
          )
        );
      
      const newLeads = Number(newLeadsResult[0]?.count || 0);
      
      // Get all leads and count converted ones
      const allLeadsResult = await db.select({ count: sql`count(*)` }).from(leads);
      const convertedLeadsResult = await db.select({ count: sql`count(*)` })
        .from(leads)
        .where(eq(leads.isConverted, true));
      
      const totalLeads = Number(allLeadsResult[0]?.count || 0);
      const convertedLeads = Number(convertedLeadsResult[0]?.count || 0);
      
      const conversionRate = totalLeads > 0
        ? ((convertedLeads / totalLeads) * 100).toFixed(1) + '%'
        : '0%';
      
      // Calculate revenue from won opportunities
      const revenueResult = await db.select({
        total: sql`sum(cast(amount as decimal))` 
      })
      .from(opportunities)
      .where(eq(opportunities.isWon, true));
      
      const totalRevenue = Number(revenueResult[0]?.total || 0);
      
      const revenue = totalRevenue.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
      
      // Count open deals
      const openDealsResult = await db.select({ count: sql`count(*)` })
        .from(opportunities)
        .where(eq(opportunities.isClosed, false));
      
      const openDeals = Number(openDealsResult[0]?.count || 0);
      
      return {
        newLeads,
        conversionRate,
        revenue,
        openDeals
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        newLeads: 0,
        conversionRate: '0%',
        revenue: '$0',
        openDeals: 0
      };
    }
  }

  async getSalesPipeline(): Promise<{ stages: { name: string; value: string; percentage: number; }[]; }> {
    try {
      // Define the pipeline stages
      const stageNames = [
        "Lead Generation",
        "Qualification",
        "Proposal",
        "Negotiation",
        "Closing"
      ];
      
      // Get total opportunity amount
      const totalAmountResult = await db.select({
        total: sql`sum(cast(amount as decimal))`
      })
      .from(opportunities)
      .where(eq(opportunities.isClosed, false));
      
      const totalAmount = Number(totalAmountResult[0]?.total || 0);
      
      // Calculate amount for each stage
      const stages = [];
      for (const stageName of stageNames) {
        const stageAmountResult = await db.select({
          total: sql`sum(cast(amount as decimal))`
        })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.stage, stageName),
            eq(opportunities.isClosed, false)
          )
        );
        
        const stageAmount = Number(stageAmountResult[0]?.total || 0);
        const percentage = totalAmount > 0 ? Math.round((stageAmount / totalAmount) * 100) : 0;
        
        const formattedAmount = stageAmount.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        });
        
        stages.push({
          name: stageName,
          value: formattedAmount,
          percentage
        });
      }
      
      return { stages };
    } catch (error) {
      console.error('Error getting sales pipeline:', error);
      return { stages: [] };
    }
  }

  // Report Methods
  async getSalesReport(timeRange: string): Promise<{ monthlyData: { name: string; deals: number; value: number; }[]; pipelineStages: { name: string; value: number; }[]; }> {
    // Implement with database queries
    return { monthlyData: [], pipelineStages: [] };
  }

  async getLeadsReport(timeRange: string): Promise<{ sourceData: { name: string; value: number; }[]; trendData: { name: string; newLeads: number; converted: number; }[]; }> {
    // Implement with database queries
    return { sourceData: [], trendData: [] };
  }

  async getConversionReport(timeRange: string): Promise<{ conversionRate: number; previousRate: number; avgTimeToConvert: number; previousTime: number; bestChannel: { name: string; rate: number; }; weeklyData: { name: string; newLeads: number; converted: number; }[]; }> {
    // Implement with database queries
    return {
      conversionRate: 0,
      previousRate: 0,
      avgTimeToConvert: 0,
      previousTime: 0,
      bestChannel: { name: '', rate: 0 },
      weeklyData: []
    };
  }

  async getTeamPerformanceReport(timeRange: string): Promise<{ teamMembers: { name: string; deals: number; revenue: number; conversion: number; }[]; }> {
    // Implement with database queries
    return { teamMembers: [] };
  }

  // Workflow Methods
  async getWorkflow(id: number): Promise<Workflow | undefined> {
    try {
      const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id));
      return workflow;
    } catch (error) {
      console.error('Database error in getWorkflow:', error);
      return undefined;
    }
  }

  async listWorkflows(filter?: Partial<Workflow>): Promise<Workflow[]> {
    try {
      let query = db.select().from(workflows);
      
      if (filter) {
        if (filter.isTemplate !== undefined) {
          query = query.where(eq(workflows.isTemplate, filter.isTemplate));
        }
        if (filter.isActive !== undefined) {
          query = query.where(eq(workflows.isActive, filter.isActive));
        }
        if (filter.status) {
          query = query.where(eq(workflows.status, filter.status));
        }
        if (filter.ownerId !== undefined) {
          query = query.where(eq(workflows.ownerId, filter.ownerId));
        }
        if (filter.triggerType) {
          query = query.where(eq(workflows.triggerType, filter.triggerType));
        }
      }
      
      const workflowList = await query;
      return workflowList;
    } catch (error) {
      console.error('Database error in listWorkflows:', error);
      return [];
    }
  }

  async createWorkflow(workflowData: InsertWorkflow): Promise<Workflow> {
    try {
      const [workflow] = await db.insert(workflows).values({
        ...workflowData,
        createdAt: new Date(),
        isActive: workflowData.isActive === undefined ? true : workflowData.isActive,
        isTemplate: workflowData.isTemplate === undefined ? false : workflowData.isTemplate,
        lastExecuted: null
      }).returning();
      
      return workflow;
    } catch (error) {
      console.error('Database error in createWorkflow:', error);
      throw new Error(`Failed to create workflow: ${error}`);
    }
  }

  async updateWorkflow(id: number, workflowData: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    try {
      const [updatedWorkflow] = await db.update(workflows)
        .set(workflowData)
        .where(eq(workflows.id, id))
        .returning();
      
      return updatedWorkflow;
    } catch (error) {
      console.error('Database error in updateWorkflow:', error);
      return undefined;
    }
  }

  async deleteWorkflow(id: number): Promise<boolean> {
    try {
      const result = await db.delete(workflows).where(eq(workflows.id, id));
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Database error in deleteWorkflow:', error);
      return false;
    }
  }

  // Subscription Package Methods
  async getSubscriptionPackage(id: number): Promise<SubscriptionPackage | undefined> {
    try {
      const [package_] = await db.select().from(subscriptionPackages).where(eq(subscriptionPackages.id, id));
      return package_;
    } catch (error) {
      console.error(`Error retrieving subscription package with id ${id}:`, error);
      return undefined;
    }
  }

  async listSubscriptionPackages(filter?: Partial<SubscriptionPackage>): Promise<SubscriptionPackage[]> {
    try {
      const allPackages = await db.select().from(subscriptionPackages);
      return allPackages;
    } catch (error) {
      console.error("Error retrieving subscription packages:", error);
      return [];
    }
  }

  async createSubscriptionPackage(pkg: InsertSubscriptionPackage): Promise<SubscriptionPackage> {
    try {
      const [newPackage] = await db.insert(subscriptionPackages).values({
        ...pkg,
        createdAt: new Date(),
        isActive: pkg.isActive ?? true
      }).returning();
      
      return newPackage;
    } catch (error) {
      console.error('Database error in createSubscriptionPackage:', error);
      throw new Error('Failed to create subscription package');
    }
  }

  async updateSubscriptionPackage(id: number, pkg: Partial<InsertSubscriptionPackage>): Promise<SubscriptionPackage | undefined> {
    try {
      const [updatedPackage] = await db.update(subscriptionPackages)
        .set({
          ...pkg,
          updatedAt: new Date()
        })
        .where(eq(subscriptionPackages.id, id))
        .returning();
      return updatedPackage;
    } catch (error) {
      console.error('Database error in updateSubscriptionPackage:', error);
      return undefined;
    }
  }

  async deleteSubscriptionPackage(id: number): Promise<boolean> {
    try {
      // First check if there are active subscriptions using this package
      const activeSubscriptions = await db.select({ count: sql`count(*)` })
        .from(userSubscriptions)
        .where(
          and(
            eq(userSubscriptions.packageId, id),
            eq(userSubscriptions.status, 'active')
          )
        );
      
      const activeCount = Number(activeSubscriptions[0]?.count || 0);
      
      // Don't delete packages with active subscriptions
      if (activeCount > 0) {
        return false;
      }
      
      const result = await db.delete(subscriptionPackages)
        .where(eq(subscriptionPackages.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Database error in deleteSubscriptionPackage:', error);
      return false;
    }
  }

  // User Subscription Methods
  async getUserSubscription(id: number): Promise<UserSubscription | undefined> {
    try {
      const [subscription] = await db.select().from(userSubscriptions).where(eq(userSubscriptions.id, id));
      return subscription;
    } catch (error) {
      console.error(`Error retrieving user subscription with id ${id}:`, error);
      return undefined;
    }
  }

  async getUserActiveSubscription(userId: number): Promise<UserSubscription | undefined> {
    try {
      const [subscription] = await db.select().from(userSubscriptions)
        .where(and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.status, 'Active')
        ))
        .orderBy(desc(userSubscriptions.startDate))
        .limit(1);
      
      return subscription;
    } catch (error) {
      console.error(`Error retrieving active subscription for user ${userId}:`, error);
      return undefined;
    }
  }

  async listUserSubscriptions(filter?: Partial<UserSubscription>): Promise<UserSubscription[]> {
    try {
      let query = db.select().from(userSubscriptions);
      
      if (filter) {
        if (filter.userId !== undefined) {
          query = query.where(eq(userSubscriptions.userId, filter.userId));
        }
        if (filter.packageId !== undefined) {
          query = query.where(eq(userSubscriptions.packageId, filter.packageId));
        }
        if (filter.status !== undefined) {
          query = query.where(eq(userSubscriptions.status, filter.status));
        }
      }
      
      const subscriptions = await query;
      return subscriptions;
    } catch (error) {
      console.error("Error retrieving user subscriptions:", error);
      return [];
    }
  }

  async createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription> {
    try {
      const [newSubscription] = await db.insert(userSubscriptions).values(subscription).returning();
      return newSubscription;
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  async updateUserSubscription(id: number, subscription: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined> {
    try {
      const [updatedSubscription] = await db.update(userSubscriptions)
        .set({ ...subscription, updatedAt: new Date() })
        .where(eq(userSubscriptions.id, id))
        .returning();
      
      return updatedSubscription;
    } catch (error) {
      console.error(`Error updating subscription ${id}:`, error);
      return undefined;
    }
  }

  async cancelUserSubscription(id: number): Promise<UserSubscription | undefined> {
    try {
      // Update the subscription status to Canceled instead of deleting
      const [canceledSubscription] = await db.update(userSubscriptions)
        .set({ 
          status: 'Canceled',
          updatedAt: new Date(),
          endDate: new Date() // End immediately
        })
        .where(eq(userSubscriptions.id, id))
        .returning();
        
      return canceledSubscription;
    } catch (error) {
      console.error(`Error canceling subscription ${id}:`, error);
      return undefined;
    }
  }
  
  async deleteUserSubscription(id: number): Promise<boolean> {
    try {
      const result = await db.delete(userSubscriptions)
        .where(eq(userSubscriptions.id, id));
      
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error(`Error deleting subscription ${id}:`, error);
      return false;
    }
  }

  // Social Media Integrations
  async getSocialIntegration(id: number): Promise<SocialIntegration | undefined> {
    try {
      const [integration] = await db.select().from(socialIntegrations).where(eq(socialIntegrations.id, id));
      return integration;
    } catch (error) {
      console.error('Database error in getSocialIntegration:', error);
      return undefined;
    }
  }

  async listSocialIntegrations(filter?: Partial<SocialIntegration>): Promise<SocialIntegration[]> {
    try {
      let query = db.select().from(socialIntegrations);
      
      if (filter) {
        // Add conditions dynamically based on filter
        if (filter.userId !== undefined) {
          query = query.where(eq(socialIntegrations.userId, filter.userId));
        }
        if (filter.platform !== undefined) {
          query = query.where(eq(socialIntegrations.platform, filter.platform));
        }
        if (filter.isActive !== undefined) {
          query = query.where(eq(socialIntegrations.isActive, filter.isActive));
        }
      }
      
      return await query;
    } catch (error) {
      console.error('Database error in listSocialIntegrations:', error);
      return [];
    }
  }

  async getUserSocialIntegrations(userId: number): Promise<SocialIntegration[]> {
    try {
      return await db.select().from(socialIntegrations).where(eq(socialIntegrations.userId, userId));
    } catch (error) {
      console.error('Database error in getUserSocialIntegrations:', error);
      return [];
    }
  }

  async createSocialIntegration(integration: InsertSocialIntegration): Promise<SocialIntegration> {
    try {
      const [newIntegration] = await db.insert(socialIntegrations).values(integration).returning();
      return newIntegration;
    } catch (error) {
      console.error('Database error in createSocialIntegration:', error);
      throw new Error(`Failed to create social integration: ${error.message}`);
    }
  }

  async updateSocialIntegration(id: number, integration: Partial<InsertSocialIntegration>): Promise<SocialIntegration | undefined> {
    try {
      const [updatedIntegration] = await db.update(socialIntegrations)
        .set({ ...integration, updatedAt: new Date() })
        .where(eq(socialIntegrations.id, id))
        .returning();
      return updatedIntegration;
    } catch (error) {
      console.error('Database error in updateSocialIntegration:', error);
      return undefined;
    }
  }

  async deleteSocialIntegration(id: number): Promise<boolean> {
    try {
      const result = await db.delete(socialIntegrations).where(eq(socialIntegrations.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Database error in deleteSocialIntegration:', error);
      return false;
    }
  }

  // Social Media Messages
  async getSocialMessage(id: number): Promise<SocialMessage | undefined> {
    try {
      const [message] = await db.select().from(socialMessages).where(eq(socialMessages.id, id));
      return message;
    } catch (error) {
      console.error('Database error in getSocialMessage:', error);
      return undefined;
    }
  }

  async listSocialMessages(filter?: Partial<SocialMessage>): Promise<SocialMessage[]> {
    try {
      let query = db.select().from(socialMessages);
      
      if (filter) {
        // Add conditions dynamically based on filter
        if (filter.integrationId !== undefined) {
          query = query.where(eq(socialMessages.integrationId, filter.integrationId));
        }
        if (filter.leadId !== undefined) {
          query = query.where(eq(socialMessages.leadId, filter.leadId));
        }
        if (filter.contactId !== undefined) {
          query = query.where(eq(socialMessages.contactId, filter.contactId));
        }
        if (filter.direction !== undefined) {
          query = query.where(eq(socialMessages.direction, filter.direction));
        }
        if (filter.status !== undefined) {
          query = query.where(eq(socialMessages.status, filter.status));
        }
        if (filter.isDeleted !== undefined) {
          query = query.where(eq(socialMessages.isDeleted, filter.isDeleted));
        }
      }
      
      return await query;
    } catch (error) {
      console.error('Database error in listSocialMessages:', error);
      return [];
    }
  }

  async getLeadSocialMessages(leadId: number): Promise<SocialMessage[]> {
    try {
      return await db.select().from(socialMessages).where(eq(socialMessages.leadId, leadId));
    } catch (error) {
      console.error('Database error in getLeadSocialMessages:', error);
      return [];
    }
  }

  async getContactSocialMessages(contactId: number): Promise<SocialMessage[]> {
    try {
      return await db.select().from(socialMessages).where(eq(socialMessages.contactId, contactId));
    } catch (error) {
      console.error('Database error in getContactSocialMessages:', error);
      return [];
    }
  }

  async createSocialMessage(message: InsertSocialMessage): Promise<SocialMessage> {
    try {
      const [newMessage] = await db.insert(socialMessages).values(message).returning();
      return newMessage;
    } catch (error) {
      console.error('Database error in createSocialMessage:', error);
      throw new Error(`Failed to create social message: ${error.message}`);
    }
  }

  async updateSocialMessage(id: number, message: Partial<InsertSocialMessage>): Promise<SocialMessage | undefined> {
    try {
      const [updatedMessage] = await db.update(socialMessages)
        .set(message)
        .where(eq(socialMessages.id, id))
        .returning();
      return updatedMessage;
    } catch (error) {
      console.error('Database error in updateSocialMessage:', error);
      return undefined;
    }
  }

  async deleteSocialMessage(id: number): Promise<boolean> {
    try {
      // Soft delete - update isDeleted flag
      const [updatedMessage] = await db.update(socialMessages)
        .set({ isDeleted: true })
        .where(eq(socialMessages.id, id))
        .returning();
      return !!updatedMessage;
    } catch (error) {
      console.error('Database error in deleteSocialMessage:', error);
      return false;
    }
  }

  // Lead Sources
  async getLeadSource(id: number): Promise<LeadSource | undefined> {
    try {
      const [source] = await db.select().from(leadSources).where(eq(leadSources.id, id));
      return source;
    } catch (error) {
      console.error('Database error in getLeadSource:', error);
      return undefined;
    }
  }

  async listLeadSources(filter?: Partial<LeadSource>): Promise<LeadSource[]> {
    try {
      let query = db.select().from(leadSources);
      
      if (filter) {
        // Add conditions dynamically based on filter
        if (filter.platform !== undefined) {
          query = query.where(eq(leadSources.platform, filter.platform));
        }
        if (filter.isActive !== undefined) {
          query = query.where(eq(leadSources.isActive, filter.isActive));
        }
      }
      
      return await query;
    } catch (error) {
      console.error('Database error in listLeadSources:', error);
      return [];
    }
  }

  async createLeadSource(source: InsertLeadSource): Promise<LeadSource> {
    try {
      const [newSource] = await db.insert(leadSources).values(source).returning();
      return newSource;
    } catch (error) {
      console.error('Database error in createLeadSource:', error);
      throw new Error(`Failed to create lead source: ${error.message}`);
    }
  }

  async updateLeadSource(id: number, source: Partial<InsertLeadSource>): Promise<LeadSource | undefined> {
    try {
      const [updatedSource] = await db.update(leadSources)
        .set({ ...source, updatedAt: new Date() })
        .where(eq(leadSources.id, id))
        .returning();
      return updatedSource;
    } catch (error) {
      console.error('Database error in updateLeadSource:', error);
      return undefined;
    }
  }

  async deleteLeadSource(id: number): Promise<boolean> {
    try {
      const result = await db.delete(leadSources).where(eq(leadSources.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Database error in deleteLeadSource:', error);
      return false;
    }
  }

  // Social Media Campaigns
  async getSocialCampaign(id: number): Promise<SocialCampaign | undefined> {
    try {
      const [campaign] = await db.select().from(socialCampaigns).where(eq(socialCampaigns.id, id));
      return campaign;
    } catch (error) {
      console.error('Database error in getSocialCampaign:', error);
      return undefined;
    }
  }

  async listSocialCampaigns(filter?: Partial<SocialCampaign>): Promise<SocialCampaign[]> {
    try {
      let query = db.select().from(socialCampaigns);
      
      if (filter) {
        // Add conditions dynamically based on filter
        if (filter.platform !== undefined) {
          query = query.where(eq(socialCampaigns.platform, filter.platform));
        }
        if (filter.ownerId !== undefined) {
          query = query.where(eq(socialCampaigns.ownerId, filter.ownerId));
        }
        if (filter.status !== undefined) {
          query = query.where(eq(socialCampaigns.status, filter.status));
        }
        if (filter.isActive !== undefined) {
          query = query.where(eq(socialCampaigns.isActive, filter.isActive));
        }
      }
      
      return await query;
    } catch (error) {
      console.error('Database error in listSocialCampaigns:', error);
      return [];
    }
  }

  async createSocialCampaign(campaign: InsertSocialCampaign): Promise<SocialCampaign> {
    try {
      const [newCampaign] = await db.insert(socialCampaigns).values(campaign).returning();
      return newCampaign;
    } catch (error) {
      console.error('Database error in createSocialCampaign:', error);
      throw new Error(`Failed to create social campaign: ${error.message}`);
    }
  }

  async updateSocialCampaign(id: number, campaign: Partial<InsertSocialCampaign>): Promise<SocialCampaign | undefined> {
    try {
      const [updatedCampaign] = await db.update(socialCampaigns)
        .set({ ...campaign, updatedAt: new Date() })
        .where(eq(socialCampaigns.id, id))
        .returning();
      return updatedCampaign;
    } catch (error) {
      console.error('Database error in updateSocialCampaign:', error);
      return undefined;
    }
  }

  async deleteSocialCampaign(id: number): Promise<boolean> {
    try {
      const result = await db.delete(socialCampaigns).where(eq(socialCampaigns.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Database error in deleteSocialCampaign:', error);
      return false;
    }
  }

  // Product Category methods
  async getProductCategory(id: number): Promise<ProductCategory | undefined> {
    try {
      const [productCategory] = await db.select().from(productCategoriesTable).where(eq(productCategoriesTable.id, id));
      return productCategory;
    } catch (error) {
      console.error('Database error in getProductCategory:', error);
      return undefined;
    }
  }

  async listProductCategories(filter?: Partial<ProductCategory>): Promise<ProductCategory[]> {
    try {
      let query = db.select().from(productCategoriesTable);
      
      if (filter) {
        const whereConditions = [];
        if (filter.id !== undefined) whereConditions.push(eq(productCategoriesTable.id, filter.id));
        if (filter.name !== undefined) whereConditions.push(eq(productCategoriesTable.name, filter.name));
        if (filter.isActive !== undefined) whereConditions.push(eq(productCategoriesTable.isActive, filter.isActive));
        if (filter.ownerId !== undefined) whereConditions.push(eq(productCategoriesTable.ownerId, filter.ownerId));
        
        // Apply where conditions if any exist
        if (whereConditions.length > 0) {
          query = query.where(and(...whereConditions));
        }
      }
      
      return await query;
    } catch (error) {
      console.error('Database error in listProductCategories:', error);
      return [];
    }
  }

  async createProductCategory(category: InsertProductCategory): Promise<ProductCategory> {
    try {
      const [newCategory] = await db.insert(productCategoriesTable).values(category).returning();
      return newCategory;
    } catch (error) {
      console.error('Database error in createProductCategory:', error);
      throw new Error(`Failed to create product category: ${error.message}`);
    }
  }

  async updateProductCategory(id: number, category: Partial<InsertProductCategory>): Promise<ProductCategory | undefined> {
    try {
      const [updatedCategory] = await db.update(productCategoriesTable)
        .set({
          ...category,
          updatedAt: new Date()
        })
        .where(eq(productCategoriesTable.id, id))
        .returning();
      
      return updatedCategory;
    } catch (error) {
      console.error('Database error in updateProductCategory:', error);
      return undefined;
    }
  }

  async deleteProductCategory(id: number): Promise<boolean> {
    try {
      // Check if any products use this category
      const productsWithCategory = await db.select().from(products).where(eq(products.categoryId, id));
      if (productsWithCategory.length > 0) {
        // Category in use, don't delete
        return false;
      }
      
      const result = await db.delete(productCategories).where(eq(productCategoriesTable.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Database error in deleteProductCategory:', error);
      return false;
    }
  }
  
  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    try {
      const [product] = await db.select().from(products).where(eq(products.id, id));
      return product;
    } catch (error) {
      console.error('Database error in getProduct:', error);
      return undefined;
    }
  }

  async listProducts(filter?: Partial<Product>): Promise<Product[]> {
    try {
      // Using a specific column selection to avoid querying columns that might not exist yet
      // This is a temporary fix until the database schema is fully migrated
      let query = db.select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        description: products.description,
        price: products.price,
        cost: products.cost,
        categoryId: products.categoryId,
        isActive: products.isActive,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        inStock: products.inStock,
        stockQuantity: products.stockQuantity,
        reorderLevel: products.reorderLevel,
        attributes: products.attributes,
        images: products.images,
        taxable: products.taxable,
        taxRate: products.taxRate,
        ownerId: products.ownerId
        // Manufacturing-specific fields not included to ensure compatibility
      }).from(products);
      
      if (filter) {
        const whereConditions = [];
        if (filter.id !== undefined) whereConditions.push(eq(products.id, filter.id));
        if (filter.name !== undefined) whereConditions.push(eq(products.name, filter.name));
        if (filter.categoryId !== undefined) whereConditions.push(eq(products.categoryId, filter.categoryId));
        if (filter.isActive !== undefined) whereConditions.push(eq(products.isActive, filter.isActive));
        if (filter.ownerId !== undefined) whereConditions.push(eq(products.ownerId, filter.ownerId));
        
        if (whereConditions.length > 0) {
          query = query.where(and(...whereConditions));
        }
      }
      
      return await query;
    } catch (error) {
      console.error('Database error in listProducts:', error);
      return [];
    }
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    try {
      // Extract only the fields that exist in the current database schema
      // This is a temporary fix until the database schema is fully migrated
      const productToInsert = {
        name: product.name,
        sku: product.sku,
        description: product.description,
        price: product.price,
        cost: product.cost,
        categoryId: product.categoryId,
        isActive: product.isActive,
        inStock: product.inStock,
        stockQuantity: product.stockQuantity,
        reorderLevel: product.reorderLevel,
        attributes: product.attributes,
        images: product.images,
        taxable: product.taxable,
        taxRate: product.taxRate,
        ownerId: product.ownerId,
        weight: product.weight,
        dimensions: product.dimensions,
        barcode: product.barcode,
        tags: product.tags
        // Manufacturing-specific fields not included to ensure compatibility
      };
      
      const [newProduct] = await db.insert(products).values(productToInsert).returning();
      return newProduct;
    } catch (error) {
      console.error('Database error in createProduct:', error);
      throw new Error(`Failed to create product: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    try {
      // Extract only the fields that exist in the current database schema
      // This is a temporary fix until the database schema is fully migrated
      const updateFields: any = {
        updatedAt: new Date()
      };
      
      // Only include fields that are present in the product object
      if (product.name !== undefined) updateFields.name = product.name;
      if (product.sku !== undefined) updateFields.sku = product.sku;
      if (product.description !== undefined) updateFields.description = product.description;
      if (product.price !== undefined) updateFields.price = product.price;
      if (product.cost !== undefined) updateFields.cost = product.cost;
      if (product.categoryId !== undefined) updateFields.categoryId = product.categoryId;
      if (product.isActive !== undefined) updateFields.isActive = product.isActive;
      if (product.inStock !== undefined) updateFields.inStock = product.inStock;
      if (product.stockQuantity !== undefined) updateFields.stockQuantity = product.stockQuantity;
      if (product.reorderLevel !== undefined) updateFields.reorderLevel = product.reorderLevel;
      if (product.attributes !== undefined) updateFields.attributes = product.attributes;
      if (product.images !== undefined) updateFields.images = product.images;
      if (product.taxable !== undefined) updateFields.taxable = product.taxable;
      if (product.taxRate !== undefined) updateFields.taxRate = product.taxRate;
      if (product.ownerId !== undefined) updateFields.ownerId = product.ownerId;
      if (product.weight !== undefined) updateFields.weight = product.weight;
      if (product.dimensions !== undefined) updateFields.dimensions = product.dimensions;
      if (product.barcode !== undefined) updateFields.barcode = product.barcode;
      if (product.tags !== undefined) updateFields.tags = product.tags;
      // Manufacturing-specific fields not included to ensure compatibility
      
      const [updatedProduct] = await db.update(products)
        .set(updateFields)
        .where(eq(products.id, id))
        .returning();
      
      return updatedProduct;
    } catch (error) {
      console.error('Database error in updateProduct:', error);
      return undefined;
    }
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      // Check if product is used in invoices or purchase orders
      const invoiceItems = await db.select().from(invoiceItems).where(eq(invoiceItems.productId, id));
      const purchaseOrderItems = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.productId, id));
      
      if (invoiceItems.length > 0 || purchaseOrderItems.length > 0) {
        // Product in use, don't delete
        return false;
      }
      
      const result = await db.delete(products).where(eq(products.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Database error in deleteProduct:', error);
      return false;
    }
  }
  
  // Inventory Transaction methods
  async getInventoryTransaction(id: number): Promise<InventoryTransaction | undefined> {
    try {
      const [transaction] = await db.select().from(inventoryTransactions).where(eq(inventoryTransactions.id, id));
      return transaction;
    } catch (error) {
      console.error('Database error in getInventoryTransaction:', error);
      return undefined;
    }
  }

  async listInventoryTransactions(filter?: Partial<InventoryTransaction>): Promise<InventoryTransaction[]> {
    try {
      let query = db.select().from(inventoryTransactions).orderBy(desc(inventoryTransactions.createdAt));
      
      if (filter) {
        const whereConditions = [];
        if (filter.id !== undefined) whereConditions.push(eq(inventoryTransactions.id, filter.id));
        if (filter.productId !== undefined) whereConditions.push(eq(inventoryTransactions.productId, filter.productId));
        if (filter.type !== undefined) whereConditions.push(eq(inventoryTransactions.type, filter.type));
        
        if (whereConditions.length > 0) {
          query = query.where(and(...whereConditions));
        }
      }
      
      return await query;
    } catch (error) {
      console.error('Database error in listInventoryTransactions:', error);
      return [];
    }
  }

  async createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    try {
      // Extract numeric part from string IDs like "INV-123" if referenceId is a string
      let processedReferenceId = transaction.referenceId;
      if (typeof processedReferenceId === 'string') {
        // Extract numeric part if it's a string like "INV-123"
        const match = processedReferenceId.match(/\d+/);
        if (match) {
          processedReferenceId = parseInt(match[0], 10);
        } else {
          // If no numeric part found, set to null
          processedReferenceId = null;
        }
      }

      // Ensure quantity is a string as required by the database schema
      const transactionToInsert = {
        productId: transaction.productId,
        quantity: typeof transaction.quantity === 'number' 
          ? transaction.quantity.toString() 
          : transaction.quantity,
        type: transaction.type,
        referenceType: transaction.referenceType,
        referenceId: processedReferenceId,
        notes: transaction.notes,
        createdBy: transaction.createdBy,
        unitCost: transaction.unitCost,
        location: transaction.location,
        batchId: transaction.batchId,
        expiryDate: transaction.expiryDate,
        serialNumber: transaction.serialNumber
        // Removed workCenterId and qualityInspectionId as they might not be in the current DB schema
      };
      
      const [newTransaction] = await db.insert(inventoryTransactions).values(transactionToInsert).returning();
      return newTransaction;
    } catch (error) {
      console.error('Database error in createInventoryTransaction:', error);
      throw new Error(`Failed to create inventory transaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getProductInventory(productId: number): Promise<number> {
    try {
      // Calculate current inventory using sum of transactions
      const result = await db.select({
        total: sql`SUM(CASE 
          WHEN ${inventoryTransactions.type} = 'Purchase' THEN ${inventoryTransactions.quantity}
          WHEN ${inventoryTransactions.type} = 'Return' THEN ${inventoryTransactions.quantity}
          WHEN ${inventoryTransactions.type} = 'Adjustment' THEN 
            CASE WHEN ${inventoryTransactions.quantity} > 0 THEN ${inventoryTransactions.quantity} ELSE ${inventoryTransactions.quantity} END
          WHEN ${inventoryTransactions.type} = 'Sale' THEN -${inventoryTransactions.quantity}
          WHEN ${inventoryTransactions.type} = 'Transfer' THEN -${inventoryTransactions.quantity}
          ELSE 0 END)`
      }).from(inventoryTransactions)
        .where(eq(inventoryTransactions.productId, productId));
      
      return result[0].total || 0;
    } catch (error) {
      console.error('Database error in getProductInventory:', error);
      return 0;
    }
  }

  async getInventorySummary(): Promise<{products: Array<{id: number, name: string, sku: string, stock: number, value: number}>}> {
    try {
      // Get all products
      const allProducts = await db.select().from(products);
      
      // For each product, get the current inventory and calculate value
      const productsWithStock = await Promise.all(
        allProducts.map(async (product) => {
          const stock = await this.getProductInventory(product.id);
          // Convert price/cost from string to number for calculation
          const price = typeof product.price === 'string' ? parseFloat(product.price) : (product.price || 0);
          
          return {
            id: product.id,
            name: product.name,
            sku: product.sku || '',
            stock: stock,
            value: stock * price
          };
        })
      );
      
      return { products: productsWithStock };
    } catch (error) {
      console.error('Database error in getInventorySummary:', error);
      return { products: [] };
    }
  }
  
  // Invoice methods
  async getInvoice(id: number): Promise<Invoice | undefined> {
    try {
      const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
      return invoice;
    } catch (error) {
      console.error('Database error in getInvoice:', error);
      return undefined;
    }
  }

  async listInvoices(filter?: Partial<Invoice>): Promise<Invoice[]> {
    try {
      let query = db.select().from(invoices).orderBy(desc(invoices.issueDate));
      
      if (filter) {
        const whereConditions = [];
        if (filter.id !== undefined) whereConditions.push(eq(invoices.id, filter.id));
        if (filter.accountId !== undefined) whereConditions.push(eq(invoices.accountId, filter.accountId));
        if (filter.status !== undefined) whereConditions.push(eq(invoices.status, filter.status));
        if (filter.ownerId !== undefined) whereConditions.push(eq(invoices.ownerId, filter.ownerId));
        
        if (whereConditions.length > 0) {
          query = query.where(and(...whereConditions));
        }
      }
      
      return await query;
    } catch (error) {
      console.error('Database error in listInvoices:', error);
      return [];
    }
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    try {
      const [newInvoice] = await db.insert(invoices).values(invoice).returning();
      return newInvoice;
    } catch (error) {
      console.error('Database error in createInvoice:', error);
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }

  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    try {
      const [updatedInvoice] = await db.update(invoices)
        .set({
          ...invoice,
          updatedAt: new Date()
        })
        .where(eq(invoices.id, id))
        .returning();
      
      return updatedInvoice;
    } catch (error) {
      console.error('Database error in updateInvoice:', error);
      return undefined;
    }
  }

  async deleteInvoice(id: number): Promise<boolean> {
    try {
      // First delete all invoice items
      await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
      
      // Then delete the invoice
      const result = await db.delete(invoices).where(eq(invoices.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Database error in deleteInvoice:', error);
      return false;
    }
  }
  
  // Invoice Item methods
  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    try {
      return await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
    } catch (error) {
      console.error('Database error in getInvoiceItems:', error);
      return [];
    }
  }

  async createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem> {
    try {
      const [newItem] = await db.insert(invoiceItems).values(item).returning();
      
      // Create inventory transaction for sold product
      if (item.productId) {
        const invoice = await this.getInvoice(item.invoiceId);
        if (invoice) {
          try {
            await this.createInventoryTransaction({
              productId: item.productId,
              quantity: typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity,
              type: 'Sale',
              referenceId: item.invoiceId,
              referenceType: 'invoice',
              notes: `Sold on invoice #${item.invoiceId}`
            });
          } catch (transactionError) {
            // Log the error but don't fail the invoice item creation
            console.warn('Failed to create inventory transaction, but continuing with invoice item creation:', transactionError.message);
          }
        }
      }
      
      return newItem;
    } catch (error) {
      console.error('Database error in createInvoiceItem:', error);
      throw new Error(`Failed to create invoice item: ${error.message}`);
    }
  }

  async updateInvoiceItem(id: number, item: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined> {
    try {
      // First get the original item to handle inventory adjustments
      const [originalItem] = await db.select().from(invoiceItems).where(eq(invoiceItems.id, id));
      
      if (!originalItem) {
        return undefined;
      }
      
      const [updatedItem] = await db.update(invoiceItems)
        .set(item)
        .where(eq(invoiceItems.id, id))
        .returning();
      
      // Handle inventory adjustment if quantity changed
      if (item.quantity !== undefined && originalItem.productId) {
        const invoice = await this.getInvoice(originalItem.invoiceId);
        if (invoice) {
          // Calculate the quantity difference - convert string quantities to numbers for calculation
          const origQty = parseFloat(originalItem.quantity);
          const newQty = typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity);
          const quantityDiff = newQty - origQty;
          
          // Create adjustment transaction if necessary
          if (quantityDiff !== 0) {
            try {
              await this.createInventoryTransaction({
                productId: originalItem.productId,
                quantity: Math.abs(quantityDiff).toString(),
                type: quantityDiff < 0 ? 'Return' : 'Sale',
                referenceId: originalItem.invoiceId,
                referenceType: 'invoice-adjustment',
                notes: `Adjusted quantity on invoice #${originalItem.invoiceId}`
              });
            } catch (transactionError) {
              // Log the error but don't fail the invoice item update
              console.warn('Failed to create inventory transaction for adjustment, but continuing with invoice item update:', transactionError.message);
            }
          }
        }
      }
      
      return updatedItem;
    } catch (error) {
      console.error('Database error in updateInvoiceItem:', error);
      return undefined;
    }
  }

  async deleteInvoiceItem(id: number): Promise<boolean> {
    try {
      // Get the item first to handle inventory
      const [item] = await db.select().from(invoiceItems).where(eq(invoiceItems.id, id));
      
      if (!item) {
        return false;
      }
      
      // Handle inventory adjustment - return item to inventory
      if (item.productId) {
        const invoice = await this.getInvoice(item.invoiceId);
        if (invoice) {
          try {
            await this.createInventoryTransaction({
              productId: item.productId,
              quantity: item.quantity, // quantity is already a string in the database
              type: 'Return',
              referenceId: item.invoiceId,
              referenceType: 'invoice-deletion',
              notes: `Returned from deleted invoice item #${id}`
            });
          } catch (transactionError) {
            // Log the error but don't fail the invoice item deletion
            console.warn('Failed to create inventory transaction for deletion, but continuing with invoice item deletion:', transactionError.message);
          }
        }
      }
      
      const result = await db.delete(invoiceItems).where(eq(invoiceItems.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Database error in deleteInvoiceItem:', error);
      return false;
    }
  }
  
  // Purchase Order methods
  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    try {
      const [order] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
      return order;
    } catch (error) {
      console.error('Database error in getPurchaseOrder:', error);
      return undefined;
    }
  }

  async listPurchaseOrders(filter?: Partial<PurchaseOrder>): Promise<PurchaseOrder[]> {
    try {
      let query = db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.orderDate));
      
      if (filter) {
        const whereConditions = [];
        if (filter.id !== undefined) whereConditions.push(eq(purchaseOrders.id, filter.id));
        if (filter.supplierId !== undefined) whereConditions.push(eq(purchaseOrders.supplierId, filter.supplierId));
        if (filter.status !== undefined) whereConditions.push(eq(purchaseOrders.status, filter.status));
        if (filter.createdBy !== undefined) whereConditions.push(eq(purchaseOrders.createdBy, filter.createdBy));
        
        if (whereConditions.length > 0) {
          query = query.where(and(...whereConditions));
        }
      }
      
      return await query;
    } catch (error) {
      console.error('Database error in listPurchaseOrders:', error);
      return [];
    }
  }

  async createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder> {
    try {
      const [newOrder] = await db.insert(purchaseOrders).values(order).returning();
      return newOrder;
    } catch (error) {
      console.error('Database error in createPurchaseOrder:', error);
      throw new Error(`Failed to create purchase order: ${error.message}`);
    }
  }

  async updatePurchaseOrder(id: number, order: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    try {
      const [updatedOrder] = await db.update(purchaseOrders)
        .set({
          ...order,
          updatedAt: new Date()
        })
        .where(eq(purchaseOrders.id, id))
        .returning();
      
      return updatedOrder;
    } catch (error) {
      console.error('Database error in updatePurchaseOrder:', error);
      return undefined;
    }
  }

  async deletePurchaseOrder(id: number): Promise<boolean> {
    try {
      // First delete all purchase order items
      await db.delete(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, id));
      
      // Then delete the purchase order
      const result = await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Database error in deletePurchaseOrder:', error);
      return false;
    }
  }
  
  // Purchase Order Item methods
  async getPurchaseOrderItems(orderId: number): Promise<PurchaseOrderItem[]> {
    try {
      return await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, orderId));
    } catch (error) {
      console.error('Database error in getPurchaseOrderItems:', error);
      return [];
    }
  }

  async createPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem> {
    try {
      const [newItem] = await db.insert(purchaseOrderItems).values(item).returning();
      return newItem;
    } catch (error) {
      console.error('Database error in createPurchaseOrderItem:', error);
      throw new Error(`Failed to create purchase order item: ${error.message}`);
    }
  }

  async updatePurchaseOrderItem(id: number, item: Partial<InsertPurchaseOrderItem>): Promise<PurchaseOrderItem | undefined> {
    try {
      const [updatedItem] = await db.update(purchaseOrderItems)
        .set(item)
        .where(eq(purchaseOrderItems.id, id))
        .returning();
      
      return updatedItem;
    } catch (error) {
      console.error('Database error in updatePurchaseOrderItem:', error);
      return undefined;
    }
  }

  async deletePurchaseOrderItem(id: number): Promise<boolean> {
    try {
      const result = await db.delete(purchaseOrderItems).where(eq(purchaseOrderItems.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Database error in deletePurchaseOrderItem:', error);
      return false;
    }
  }
  
  async listPurchaseOrderItems(orderId: number): Promise<PurchaseOrderItem[]> {
    try {
      return await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, orderId));
    } catch (error) {
      console.error('Database error in listPurchaseOrderItems:', error);
      return [];
    }
  }
  
  // Special method for receiving purchase order items and updating inventory
  async receivePurchaseOrderItems(orderId: number, receivedItems: { itemId: number, quantity: number }[]): Promise<boolean> {
    try {
      // Get the purchase order
      const order = await this.getPurchaseOrder(orderId);
      if (!order) {
        return false;
      }
      
      // Process each received item
      for (const received of receivedItems) {
        // Get the purchase order item
        const [item] = await db.select().from(purchaseOrderItems)
          .where(and(
            eq(purchaseOrderItems.id, received.itemId),
            eq(purchaseOrderItems.purchaseOrderId, orderId)
          ));
        
        if (item) {
          // Convert quantity values for calculation - properly handle string to number conversions
          const currentReceivedQty = item.receivedQuantity ? parseFloat(item.receivedQuantity) : 0;
          const newReceivedQuantity = (currentReceivedQty + received.quantity).toString();
          
          await this.updatePurchaseOrderItem(item.id, { receivedQuantity: newReceivedQuantity });
          
          // Create inventory transaction
          if (item.productId) {
            try {
              await this.createInventoryTransaction({
                productId: item.productId,
                quantity: received.quantity.toString(), // Ensure quantity is a string
                type: 'Purchase',
                referenceId: orderId,
                referenceType: 'purchase-order',
                notes: `Received from purchase order #${orderId}`
              });
            } catch (transactionError) {
              // Log the error but don't fail the purchase order receipt
              console.warn('Failed to create inventory transaction for purchase, but continuing with purchase order receipt:', transactionError.message);
            }
          }
        }
      }
      
      // Update order status if all items received
      const allItems = await this.listPurchaseOrderItems(orderId);
      const allReceived = allItems.every(item => {
        const receivedQty = item.receivedQuantity ? parseFloat(item.receivedQuantity) : 0;
        const orderQty = parseFloat(item.quantity);
        return receivedQty >= orderQty;
      });
      
      const partiallyReceived = allItems.some(item => {
        const receivedQty = item.receivedQuantity ? parseFloat(item.receivedQuantity) : 0;
        return receivedQty > 0;
      });
      
      let newStatus: 'Received' | 'Partially Received' | undefined;
      
      if (allReceived) {
        newStatus = 'Received';
      } else if (partiallyReceived) {
        newStatus = 'Partially Received';
      }
      
      if (newStatus) {
        await this.updatePurchaseOrder(orderId, { status: newStatus });
      }
      
      return true;
    } catch (error) {
      console.error('Database error in receivePurchaseOrderItems:', error);
      return false;
    }
  }

  // Proposal Template Methods
  async getProposalTemplate(id: number): Promise<ProposalTemplate | undefined> {
    try {
      const [template] = await db.select().from(proposalTemplates).where(eq(proposalTemplates.id, id));
      return template;
    } catch (error) {
      console.error('Database error in getProposalTemplate:', error);
      return undefined;
    }
  }

  async listProposalTemplates(): Promise<ProposalTemplate[]> {
    try {
      return await db.select().from(proposalTemplates);
    } catch (error) {
      console.error('Database error in listProposalTemplates:', error);
      return [];
    }
  }

  async createProposalTemplate(template: InsertProposalTemplate): Promise<ProposalTemplate> {
    try {
      const createdAt = new Date();
      const [newTemplate] = await db.insert(proposalTemplates).values({
        ...template,
        createdAt,
        updatedAt: createdAt,
        isActive: template.isActive === undefined ? true : template.isActive
      }).returning();
      return newTemplate;
    } catch (error) {
      console.error('Database error in createProposalTemplate:', error);
      throw new Error('Failed to create proposal template');
    }
  }

  async updateProposalTemplate(id: number, template: Partial<InsertProposalTemplate>): Promise<ProposalTemplate | undefined> {
    try {
      const [updatedTemplate] = await db.update(proposalTemplates)
        .set({
          ...template,
          updatedAt: new Date()
        })
        .where(eq(proposalTemplates.id, id))
        .returning();
      return updatedTemplate;
    } catch (error) {
      console.error('Database error in updateProposalTemplate:', error);
      return undefined;
    }
  }

  async deleteProposalTemplate(id: number): Promise<boolean> {
    try {
      const result = await db.delete(proposalTemplates).where(eq(proposalTemplates.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Database error in deleteProposalTemplate:', error);
      return false;
    }
  }

  // Proposal Methods
  async getProposal(id: number): Promise<Proposal | undefined> {
    try {
      const [proposal] = await db.select().from(proposals).where(eq(proposals.id, id));
      return proposal;
    } catch (error) {
      console.error('Database error in getProposal:', error);
      return undefined;
    }
  }

  async listProposals(filter?: Partial<Proposal>): Promise<Proposal[]> {
    try {
      let query = db.select().from(proposals);
      
      if (filter) {
        const conditions: SQL<unknown>[] = [];
        
        if (filter.accountId !== undefined) {
          conditions.push(eq(proposals.accountId, filter.accountId));
        }
        
        if (filter.opportunityId !== undefined) {
          conditions.push(eq(proposals.opportunityId, filter.opportunityId));
        }
        
        if (filter.status !== undefined) {
          conditions.push(eq(proposals.status, filter.status));
        }
        
        if (filter.createdBy !== undefined) {
          conditions.push(eq(proposals.createdBy, filter.createdBy));
        }
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
      }
      
      return await query;
    } catch (error) {
      console.error('Database error in listProposals:', error);
      return [];
    }
  }

  async createProposal(proposal: InsertProposal): Promise<Proposal> {
    try {
      console.log("Storage.createProposal called with:", JSON.stringify(proposal, null, 2));
      
      // Validate required fields
      if (!proposal.name) {
        throw new Error("Proposal name is required");
      }
      
      if (!proposal.opportunityId || typeof proposal.opportunityId !== 'number') {
        throw new Error("Valid opportunity ID is required");
      }
      
      if (!proposal.accountId || typeof proposal.accountId !== 'number') {
        throw new Error("Valid account ID is required");
      }
      
      // Set default values if missing
      const createdAt = new Date();
      
      // Ensure expiresAt is handled correctly to prevent date errors
      let parsedExpiresAt = null;
      if (proposal.expiresAt) {
        // If it's a string that looks like an ISO date string, parse it
        if (typeof proposal.expiresAt === 'string' && proposal.expiresAt.match(/^\d{4}-\d{2}-\d{2}/)) {
          parsedExpiresAt = new Date(proposal.expiresAt);
        } 
        // If it's already a Date object, use it directly
        else if (proposal.expiresAt instanceof Date) {
          parsedExpiresAt = proposal.expiresAt;
        }
        
        // Verify the date is valid before using it
        if (parsedExpiresAt && isNaN(parsedExpiresAt.getTime())) {
          console.warn("Invalid date detected, setting expiresAt to null");
          parsedExpiresAt = null;
        }
      }
      
      const proposalData = {
        name: proposal.name,
        opportunityId: proposal.opportunityId,
        accountId: proposal.accountId,
        createdBy: proposal.createdBy,
        status: proposal.status || 'Draft',
        content: proposal.content || {},
        metadata: proposal.metadata || {},
        templateId: proposal.templateId,
        expiresAt: parsedExpiresAt,
        createdAt,
        updatedAt: createdAt
      };
      
      console.log("Validated proposal data for DB insert:", JSON.stringify(proposalData, null, 2));
      
      // Insert into database
      const [newProposal] = await db.insert(proposals).values(proposalData).returning();
      
      console.log("New proposal created successfully:", JSON.stringify(newProposal, null, 2));
      
      // Create activity record for proposal creation
      try {
        await this.createProposalActivity({
          proposalId: newProposal.id,
          userId: proposal.createdBy,
          activityType: 'Created',
          description: 'Proposal was created'
        });
      } catch (activityError) {
        console.error("Failed to create activity log, but proposal was created:", activityError);
        // Continue even if activity creation fails
      }
      
      return newProposal;
    } catch (error: any) {
      console.error('Database error in createProposal:', error);
      
      // Provide more useful error message
      const errorMessage = error.message || 'Failed to create proposal';
      
      // Check for known error codes
      if (error.code) {
        if (error.code === '23503') { // Foreign key violation
          if (error.detail?.includes('opportunityId')) {
            throw new Error('The specified opportunity does not exist');
          } else if (error.detail?.includes('accountId')) {
            throw new Error('The specified account does not exist');
          } else if (error.detail?.includes('createdBy')) {
            throw new Error('The specified user does not exist');
          }
        } else if (error.code === '23502') { // Not null violation
          throw new Error(`Required field missing: ${error.column || errorMessage}`);
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  async updateProposal(id: number, proposal: Partial<InsertProposal>): Promise<Proposal | undefined> {
    try {
      // Get original proposal to track status changes
      const [originalProposal] = await db.select().from(proposals).where(eq(proposals.id, id));
      
      if (!originalProposal) {
        return undefined;
      }
      
      // Handle date fields to ensure they're valid Date objects
      let cleanProposal = { ...proposal };
      
      // Fix expiresAt date if it exists
      if (proposal.expiresAt) {
        // If it's a string that looks like an ISO date string, parse it
        if (typeof proposal.expiresAt === 'string' && proposal.expiresAt.match(/^\d{4}-\d{2}-\d{2}/)) {
          cleanProposal.expiresAt = new Date(proposal.expiresAt);
        } 
        // If it's already a Date object, use it directly
        else if (proposal.expiresAt instanceof Date) {
          cleanProposal.expiresAt = proposal.expiresAt;
        }
        else {
          console.warn("Invalid expiresAt date detected, removing from update data");
          delete cleanProposal.expiresAt;
        }
        
        // Verify the date is valid 
        if (cleanProposal.expiresAt && cleanProposal.expiresAt instanceof Date && isNaN(cleanProposal.expiresAt.getTime())) {
          console.warn("Invalid date detected, removing expiresAt from update data");
          delete cleanProposal.expiresAt;
        }
      }
      
      // Prepare update data
      const updateData: Partial<InsertProposal> & { updatedAt: Date } = {
        ...cleanProposal,
        updatedAt: new Date()
      };
      
      // Add timestamps for status transitions
      if (proposal.status && proposal.status !== originalProposal.status) {
        if (proposal.status === 'Sent') {
          updateData.sentAt = new Date();
        } else if (proposal.status === 'Accepted') {
          updateData.acceptedAt = new Date();
        } else if (proposal.status === 'Rejected') {
          updateData.rejectedAt = new Date();
        }
      }
      
      // Update the proposal
      const [updatedProposal] = await db.update(proposals)
        .set(updateData)
        .where(eq(proposals.id, id))
        .returning();
      
      // Log activity for status change
      if (proposal.status && proposal.status !== originalProposal.status) {
        await this.createProposalActivity({
          proposalId: id,
          userId: proposal.updatedBy || null,
          activityType: 'Status Changed',
          description: `Status changed from ${originalProposal.status} to ${proposal.status}`
        });
      }
      
      return updatedProposal;
    } catch (error) {
      console.error('Database error in updateProposal:', error);
      return undefined;
    }
  }

  async deleteProposal(id: number): Promise<boolean> {
    try {
      console.log('Deleting proposal with ID:', id);
      
      // Delete related records first
      await db.delete(proposalElements).where(eq(proposalElements.proposalId, id));
      await db.delete(proposalCollaborators).where(eq(proposalCollaborators.proposalId, id));
      await db.delete(proposalComments).where(eq(proposalComments.proposalId, id));
      await db.delete(proposalActivities).where(eq(proposalActivities.proposalId, id));
      
      // Delete the proposal
      const result = await db.delete(proposals).where(eq(proposals.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Database error in deleteProposal:', error);
      return false;
    }
  }

  // Proposal Element Methods
  async getProposalElement(id: number): Promise<ProposalElement | undefined> {
    try {
      const [element] = await db.select().from(proposalElements).where(eq(proposalElements.id, id));
      return element;
    } catch (error) {
      console.error('Database error in getProposalElement:', error);
      return undefined;
    }
  }

  async listProposalElements(proposalId: number): Promise<ProposalElement[]> {
    try {
      console.log('Listing proposal elements for proposalId:', proposalId);
      // Now that proposalId is part of the schema, we can properly query elements
      
      return await db.select()
        .from(proposalElements)
        .where(eq(proposalElements.proposalId, proposalId))
        .orderBy(asc(proposalElements.sortOrder));
    } catch (error) {
      console.error('Database error in listProposalElements:', error);
      return [];
    }
  }

  async createProposalElement(element: InsertProposalElement): Promise<ProposalElement> {
    try {
      // Determine sort order if not provided
      let sortOrder = element.sortOrder;
      if (sortOrder === undefined) {
        // Since we now have an empty array from listProposalElements, default to 10
        sortOrder = 10;
      }
      
      const createdAt = new Date();
      const [newElement] = await db.insert(proposalElements).values({
        ...element,
        createdAt,
        updatedAt: createdAt,
        sortOrder
      }).returning();
      
      // Log activity
      await this.createProposalActivity({
        proposalId: element.proposalId,
        userId: element.createdBy || null,
        activityType: 'Element Added',
        description: `Added ${element.elementType} element`
      });
      
      return newElement;
    } catch (error) {
      console.error('Database error in createProposalElement:', error);
      throw new Error('Failed to create proposal element');
    }
  }

  async updateProposalElement(id: number, element: Partial<InsertProposalElement>): Promise<ProposalElement | undefined> {
    try {
      // Get the current element first
      const currentElement = await this.getProposalElement(id);
      if (!currentElement) {
        console.error(`Element with ID ${id} not found`);
        return undefined;
      }
      
      // Log what's coming in for debugging
      console.log(`Updating element ${id} with:`, {
        name: element.name,
        contentType: typeof element.content,
        contentLength: element.content ? 
          (typeof element.content === 'string' ? element.content.length : JSON.stringify(element.content).length) 
          : 0
      });
      
      // Prepare a sanitized update object without Date objects
      let sanitizedContent = element.content;
      
      // Ensure content is properly formatted
      if (sanitizedContent && typeof sanitizedContent === 'object') {
        sanitizedContent = JSON.stringify(sanitizedContent);
      }
      
      // Use a direct query to update the element to avoid timestamp issues
      const result = await db.query.proposalElements.findMany({
        where: eq(proposalElements.id, id),
        limit: 1
      });
      
      if (result.length === 0) {
        console.error(`Element with ID ${id} not found in query`);
        return undefined;
      }
      
      // Execute a simpler update with minimal fields
      const updateResult = await db.execute(sql`
        UPDATE proposal_elements 
        SET 
          name = ${element.name || currentElement.name},
          content = ${sanitizedContent || currentElement.content},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `);
      
      if (!updateResult.rows || updateResult.rows.length === 0) {
        console.error('No rows returned from update');
        return undefined;
      }
      
      // Get the updated element
      const updatedElement = await this.getProposalElement(id);
      
      if (updatedElement && currentElement.proposalId) {
        // Log activity
        await this.createProposalActivity({
          proposalId: currentElement.proposalId,
          userId: element.updatedBy || currentElement.createdBy || null,
          activityType: 'Element Updated',
          description: `Updated ${updatedElement.elementType} element`
        });
      }
      
      return updatedElement;
    } catch (error) {
      console.error('Database error in updateProposalElement:', error);
      return undefined;
    }
  }

  async deleteProposalElement(id: number): Promise<boolean> {
    try {
      // Get element to log activity after deletion
      const [element] = await db.select().from(proposalElements).where(eq(proposalElements.id, id));
      
      if (!element) {
        return false;
      }
      
      const result = await db.delete(proposalElements).where(eq(proposalElements.id, id));
      
      if (result.rowCount > 0) {
        // Log activity
        await this.createProposalActivity({
          proposalId: element.proposalId,
          userId: null, // No user ID available in this context
          activityType: 'Element Removed',
          description: `Removed ${element.elementType} element`
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Database error in deleteProposalElement:', error);
      return false;
    }
  }

  // Proposal Collaborator Methods
  async getProposalCollaborator(id: number): Promise<ProposalCollaborator | undefined> {
    try {
      const [collaborator] = await db.select().from(proposalCollaborators).where(eq(proposalCollaborators.id, id));
      return collaborator;
    } catch (error) {
      console.error('Database error in getProposalCollaborator:', error);
      return undefined;
    }
  }

  async getProposalCollaborators(proposalId: number): Promise<(ProposalCollaborator & { user?: User })[]> {
    try {
      const collaborators = await db.select().from(proposalCollaborators).where(eq(proposalCollaborators.proposalId, proposalId));
      
      // Get user info for each collaborator
      return await Promise.all(collaborators.map(async (collab) => {
        const user = await this.getUser(collab.userId);
        return { ...collab, user };
      }));
    } catch (error) {
      console.error('Database error in getProposalCollaborators:', error);
      return [];
    }
  }

  async addProposalCollaborator(collaborator: InsertProposalCollaborator): Promise<ProposalCollaborator> {
    try {
      // Check if user is already a collaborator
      const existingCollaborators = await db.select()
        .from(proposalCollaborators)
        .where(and(
          eq(proposalCollaborators.proposalId, collaborator.proposalId),
          eq(proposalCollaborators.userId, collaborator.userId)
        ));
      
      if (existingCollaborators.length > 0) {
        throw new Error('User is already a collaborator on this proposal');
      }
      
      // Add collaborator
      const [newCollaborator] = await db.insert(proposalCollaborators).values({
        ...collaborator,
        addedAt: new Date(),
        notifications: collaborator.notifications === undefined ? true : collaborator.notifications
      }).returning();
      
      // Get user info for activity log
      const user = await this.getUser(collaborator.userId);
      
      // Log activity
      await this.createProposalActivity({
        proposalId: collaborator.proposalId,
        userId: collaborator.addedBy,
        activityType: 'Collaborator Added',
        description: `Added ${user?.firstName} ${user?.lastName} as ${collaborator.role} collaborator`
      });
      
      return newCollaborator;
    } catch (error) {
      console.error('Database error in addProposalCollaborator:', error);
      throw new Error('Failed to add collaborator: ' + error.message);
    }
  }

  async updateProposalCollaborator(id: number, collaborator: Partial<InsertProposalCollaborator>): Promise<ProposalCollaborator | undefined> {
    try {
      // Get original data for activity log
      const [originalCollaborator] = await db.select()
        .from(proposalCollaborators)
        .where(eq(proposalCollaborators.id, id));
      
      if (!originalCollaborator) {
        return undefined;
      }
      
      // Update collaborator
      const [updatedCollaborator] = await db.update(proposalCollaborators)
        .set(collaborator)
        .where(eq(proposalCollaborators.id, id))
        .returning();
      
      // Log role change if applicable
      if (collaborator.role && collaborator.role !== originalCollaborator.role) {
        const user = await this.getUser(originalCollaborator.userId);
        
        await this.createProposalActivity({
          proposalId: originalCollaborator.proposalId,
          userId: null, // No user ID available in this context
          activityType: 'Collaborator Updated',
          description: `Changed ${user?.firstName} ${user?.lastName}'s role from ${originalCollaborator.role} to ${collaborator.role}`
        });
      }
      
      return updatedCollaborator;
    } catch (error) {
      console.error('Database error in updateProposalCollaborator:', error);
      return undefined;
    }
  }

  async deleteProposalCollaborator(id: number): Promise<boolean> {
    try {
      // Get collaborator info for activity log
      const [collaborator] = await db.select()
        .from(proposalCollaborators)
        .where(eq(proposalCollaborators.id, id));
      
      if (!collaborator) {
        return false;
      }
      
      // Delete collaborator
      const result = await db.delete(proposalCollaborators).where(eq(proposalCollaborators.id, id));
      
      if (result.rowCount > 0) {
        // Get user info
        const user = await this.getUser(collaborator.userId);
        
        // Log activity
        await this.createProposalActivity({
          proposalId: collaborator.proposalId,
          userId: null, // No user ID available in this context
          activityType: 'Collaborator Removed',
          description: `Removed ${user?.firstName} ${user?.lastName} as collaborator`
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Database error in deleteProposalCollaborator:', error);
      return false;
    }
  }

  // Proposal Comment Methods
  async getProposalComment(id: number): Promise<ProposalComment | undefined> {
    try {
      const [comment] = await db.select().from(proposalComments).where(eq(proposalComments.id, id));
      return comment;
    } catch (error) {
      console.error('Database error in getProposalComment:', error);
      return undefined;
    }
  }

  async getProposalComments(proposalId: number): Promise<(ProposalComment & { user?: User })[]> {
    try {
      const comments = await db.select()
        .from(proposalComments)
        .where(eq(proposalComments.proposalId, proposalId))
        .orderBy(proposalComments.createdAt);
      
      // Get user info for each comment
      return await Promise.all(comments.map(async (comment) => {
        const user = await this.getUser(comment.userId);
        return { ...comment, user };
      }));
    } catch (error) {
      console.error('Database error in getProposalComments:', error);
      return [];
    }
  }

  async createProposalComment(comment: InsertProposalComment): Promise<ProposalComment> {
    try {
      const createdAt = new Date();
      const [newComment] = await db.insert(proposalComments).values({
        ...comment,
        createdAt,
        resolved: false,
        resolvedBy: null,
        resolvedAt: null
      }).returning();
      
      // Log activity for comment
      await this.createProposalActivity({
        proposalId: comment.proposalId,
        userId: comment.userId,
        activityType: 'Comment Added',
        description: comment.parentId ? 'Added reply to comment' : 'Added new comment'
      });
      
      return newComment;
    } catch (error) {
      console.error('Database error in createProposalComment:', error);
      throw new Error('Failed to create comment');
    }
  }

  async updateProposalComment(id: number, comment: Partial<InsertProposalComment>): Promise<ProposalComment | undefined> {
    try {
      const [originalComment] = await db.select().from(proposalComments).where(eq(proposalComments.id, id));
      
      if (!originalComment) {
        return undefined;
      }
      
      // Prepare update data
      const updateData: Record<string, any> = {
        ...comment,
        updatedAt: new Date()
      };
      
      // If we're resolving a comment that wasn't resolved before
      if (comment.resolved === true && originalComment.resolved !== true) {
        updateData.resolvedAt = new Date();
      }
      
      const [updatedComment] = await db.update(proposalComments)
        .set(updateData)
        .where(eq(proposalComments.id, id))
        .returning();
      
      // Log resolution activity
      if (comment.resolved === true && originalComment.resolved !== true) {
        await this.createProposalActivity({
          proposalId: originalComment.proposalId,
          userId: comment.resolvedBy || null,
          activityType: 'Comment Resolved',
          description: 'Resolved comment'
        });
      }
      
      return updatedComment;
    } catch (error) {
      console.error('Database error in updateProposalComment:', error);
      return undefined;
    }
  }

  async deleteProposalComment(id: number): Promise<boolean> {
    try {
      // Get comment info for activity log
      const [comment] = await db.select().from(proposalComments).where(eq(proposalComments.id, id));
      
      if (!comment) {
        return false;
      }
      
      // Delete any replies first
      await db.delete(proposalComments).where(eq(proposalComments.parentId, id));
      
      // Delete the comment
      const result = await db.delete(proposalComments).where(eq(proposalComments.id, id));
      
      if (result.rowCount > 0) {
        // Log activity
        await this.createProposalActivity({
          proposalId: comment.proposalId,
          userId: null, // No user ID available in this context
          activityType: 'Comment Deleted',
          description: 'Deleted comment'
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Database error in deleteProposalComment:', error);
      return false;
    }
  }

  // Proposal Activity Methods
  async createProposalActivity(activity: InsertProposalActivity): Promise<ProposalActivity> {
    try {
      const createdAt = new Date();
      
      // Map action to activityType and detail to description if they exist (for backward compatibility)
      const processedActivity: InsertProposalActivity = {
        ...activity,
        createdAt
      };
      
      // Handle legacy fields (action/detail) if present in the request
      if ('action' in activity && !('activityType' in activity)) {
        processedActivity.activityType = activity['action' as keyof typeof activity] as string;
      }
      
      if ('detail' in activity && !('description' in activity)) {
        processedActivity.description = activity['detail' as keyof typeof activity] as string;
      }
      
      // Remove any legacy fields to avoid SQL errors
      delete (processedActivity as any).action;
      delete (processedActivity as any).detail;
      
      const [newActivity] = await db.insert(proposalActivities).values(processedActivity).returning();
      
      return newActivity;
    } catch (error) {
      console.error('Database error in createProposalActivity:', error);
      throw new Error('Failed to create activity log');
    }
  }

  async getProposalActivities(proposalId: number): Promise<(ProposalActivity & { user?: User })[]> {
    try {
      const activities = await db.select()
        .from(proposalActivities)
        .where(eq(proposalActivities.proposalId, proposalId))
        .orderBy(desc(proposalActivities.createdAt));
      
      // Get user info for each activity
      return await Promise.all(activities.map(async (activity) => {
        const user = activity.userId ? await this.getUser(activity.userId) : undefined;
        return { ...activity, user };
      }));
    } catch (error) {
      console.error('Database error in getProposalActivities:', error);
      return [];
    }
  }

  // Permission Management Methods
  async getModulePermissions(): Promise<ModulePermission[]> {
    return Array.from(this.modulePermissions.values());
  }

  async getModuleByName(moduleName: string): Promise<ModulePermission | undefined> {
    for (const module of this.modulePermissions.values()) {
      if (module.moduleName === moduleName) {
        return module;
      }
    }
    return undefined;
  }

  async createModulePermission(moduleData: Partial<ModulePermission>): Promise<ModulePermission> {
    const id = this.modulePermissionIdCounter++;
    const createdAt = new Date();
    
    const module: ModulePermission = {
      id,
      createdAt,
      moduleName: moduleData.moduleName || '',
      displayName: moduleData.displayName || moduleData.moduleName || '',
      description: moduleData.description || '',
      icon: moduleData.icon || 'box',
      isActive: moduleData.isActive !== undefined ? moduleData.isActive : true,
      order: moduleData.order || 0
    };
    
    this.modulePermissions.set(id, module);
    return module;
  }

  async updateModulePermission(id: number, moduleData: Partial<ModulePermission>): Promise<ModulePermission | undefined> {
    const existingModule = this.modulePermissions.get(id);
    if (!existingModule) {
      return undefined;
    }
    
    const updatedModule = {
      ...existingModule,
      ...moduleData
    };
    
    this.modulePermissions.set(id, updatedModule);
    return updatedModule;
  }

  async deleteModulePermission(id: number): Promise<boolean> {
    return this.modulePermissions.delete(id);
  }
  
  async getRolePermissions(role: string): Promise<RolePermission[]> {
    const permissions: RolePermission[] = [];
    
    for (const permission of this.rolePermissions.values()) {
      if (permission.role === role) {
        permissions.push(permission);
      }
    }
    
    return permissions;
  }
  
  async getRolePermission(role: string, moduleId: number, action: string): Promise<RolePermission | undefined> {
    for (const permission of this.rolePermissions.values()) {
      if (permission.role === role && permission.moduleId === moduleId && permission.action === action) {
        return permission;
      }
    }
    return undefined;
  }
  
  async createRolePermission(permissionData: Partial<RolePermission>): Promise<RolePermission> {
    const id = this.rolePermissionIdCounter++;
    const createdAt = new Date();
    
    const permission: RolePermission = {
      id,
      moduleId: permissionData.moduleId || 0,
      action: permissionData.action || '',
      isAllowed: permissionData.isAllowed !== undefined ? permissionData.isAllowed : false,
      role: permissionData.role || 'User',
      createdAt
    };
    
    this.rolePermissions.set(id, permission);
    return permission;
  }
  
  async updateRolePermission(id: number, permissionData: Partial<RolePermission>): Promise<RolePermission | undefined> {
    const existingPermission = this.rolePermissions.get(id);
    if (!existingPermission) {
      return undefined;
    }
    
    const updatedPermission = {
      ...existingPermission,
      ...permissionData,
      // Ensure we don't overwrite these fields even if provided
      id: existingPermission.id,
      createdAt: existingPermission.createdAt
    };
    
    this.rolePermissions.set(id, updatedPermission);
    return updatedPermission;
  }
  
  async deleteRolePermission(id: number): Promise<boolean> {
    return this.rolePermissions.delete(id);
  }
  
  async getUserPermissions(userId: number): Promise<UserPermission[]> {
    const permissions: UserPermission[] = [];
    
    for (const permission of this.userPermissions.values()) {
      if (permission.userId === userId) {
        permissions.push(permission);
      }
    }
    
    return permissions;
  }
  
  async getUserPermission(userId: number, moduleId: number, action: string): Promise<UserPermission | undefined> {
    for (const permission of this.userPermissions.values()) {
      if (permission.userId === userId && permission.moduleId === moduleId && permission.action === action) {
        return permission;
      }
    }
    return undefined;
  }
  
  async createUserPermission(permissionData: Partial<UserPermission>): Promise<UserPermission> {
    const id = this.userPermissionIdCounter++;
    const createdAt = new Date();
    
    const permission: UserPermission = {
      id,
      userId: permissionData.userId || 0,
      moduleId: permissionData.moduleId || 0,
      action: permissionData.action || '',
      isAllowed: permissionData.isAllowed !== undefined ? permissionData.isAllowed : false,
      createdAt
    };
    
    this.userPermissions.set(id, permission);
    return permission;
  }
  
  async updateUserPermission(id: number, permissionData: Partial<UserPermission>): Promise<UserPermission | undefined> {
    const existingPermission = this.userPermissions.get(id);
    if (!existingPermission) {
      return undefined;
    }
    
    const updatedPermission = {
      ...existingPermission,
      ...permissionData,
      // Ensure we don't overwrite these fields even if provided
      id: existingPermission.id,
      createdAt: existingPermission.createdAt
    };
    
    this.userPermissions.set(id, updatedPermission);
    return updatedPermission;
  }
  
  async deleteUserPermission(id: number): Promise<boolean> {
    return this.userPermissions.delete(id);
  }
  
  async getTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }
  
  async listTeams(): Promise<Team[]> {
    return this.getTeams();
  }
  
  // System Settings Methods
  async getSystemSettings(userId: number): Promise<SystemSettings> {
    const settingsKey = `user_${userId}`;
    const userSettings = this.systemSettingsMap.get(settingsKey);
    
    if (userSettings) {
      return userSettings;
    }
    
    // Return default settings if user has no settings yet
    const defaultSettings: SystemSettings = {
      menuVisibility: {
        contacts: true,
        accounts: true,
        leads: true,
        opportunities: true,
        calendar: true,
        tasks: true,
        communicationCenter: true,
        accounting: true,
        inventory: true,
        supportTickets: true,
        ecommerce: true,
        ecommerceStore: true,
        reports: true,
        intelligence: true,
        workflows: true,
        subscriptions: true,
        training: true
      }
    };
    
    // Store default settings for this user
    this.systemSettingsMap.set(settingsKey, defaultSettings);
    
    return defaultSettings;
  }
  
  async saveSystemSettings(userId: number, settings: SystemSettings): Promise<SystemSettings> {
    const settingsKey = `user_${userId}`;
    this.systemSettingsMap.set(settingsKey, settings);
    return settings;
  }
  
  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }
  
  async createTeam(teamData: Partial<Team>): Promise<Team> {
    const id = this.teamIdCounter++;
    const createdAt = new Date();
    
    const team: Team = {
      id,
      name: teamData.name || '',
      description: teamData.description || '',
      leaderId: teamData.leaderId || 0,
      isActive: teamData.isActive !== undefined ? teamData.isActive : true,
      createdAt
    };
    
    this.teams.set(id, team);
    return team;
  }
  
  async updateTeam(id: number, teamData: Partial<Team>): Promise<Team | undefined> {
    const existingTeam = this.teams.get(id);
    if (!existingTeam) {
      return undefined;
    }
    
    const updatedTeam = {
      ...existingTeam,
      ...teamData,
      // Ensure we don't overwrite these fields even if provided
      id: existingTeam.id,
      createdAt: existingTeam.createdAt
    };
    
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }
  
  async deleteTeam(id: number): Promise<boolean> {
    return this.teams.delete(id);
  }
  
  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    const members: TeamMember[] = [];
    
    for (const member of this.teamMembers.values()) {
      if (member.teamId === teamId) {
        members.push(member);
      }
    }
    
    return members;
  }
  
  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id);
  }
  
  async createTeamMember(memberData: Partial<TeamMember>): Promise<TeamMember> {
    const id = this.teamMemberIdCounter++;
    const createdAt = new Date();
    
    const member: TeamMember = {
      id,
      teamId: memberData.teamId || 0,
      userId: memberData.userId || 0,
      role: memberData.role || 'Member',
      createdAt
    };
    
    this.teamMembers.set(id, member);
    return member;
  }
  
  async updateTeamMember(id: number, memberData: Partial<TeamMember>): Promise<TeamMember | undefined> {
    const existingMember = this.teamMembers.get(id);
    if (!existingMember) {
      return undefined;
    }
    
    const updatedMember = {
      ...existingMember,
      ...memberData,
      // Ensure we don't overwrite these fields even if provided
      id: existingMember.id,
      createdAt: existingMember.createdAt
    };
    
    this.teamMembers.set(id, updatedMember);
    return updatedMember;
  }
  
  async deleteTeamMember(id: number): Promise<boolean> {
    return this.teamMembers.delete(id);
  }
  
  async getAssignments(entityType: string, entityId: number): Promise<Assignment[]> {
    const assignments: Assignment[] = [];
    
    for (const assignment of this.assignments.values()) {
      if (assignment.entityType === entityType && assignment.entityId === entityId) {
        assignments.push(assignment);
      }
    }
    
    return assignments;
  }
  
  async createAssignment(assignmentData: Partial<Assignment>): Promise<Assignment> {
    const id = this.assignmentIdCounter++;
    const assignedAt = new Date();
    
    const assignment: Assignment = {
      id,
      entityType: assignmentData.entityType || '',
      entityId: assignmentData.entityId || 0,
      assignedToType: assignmentData.assignedToType || 'User',
      assignedToId: assignmentData.assignedToId || 0,
      assignedAt
    };
    
    this.assignments.set(id, assignment);
    return assignment;
  }
  
  async deleteAssignment(id: number): Promise<boolean> {
    return this.assignments.delete(id);
  }
  
  async checkUserEntityAccess(userId: number, entityType: string, entityId: number): Promise<boolean> {
    // Check if user is an admin or the entity owner
    const user = await this.getUser(userId);
    if (!user) {
      return false;
    }
    
    // Admins have access to everything
    if (user.role === 'Administrator') {
      return true;
    }
    
    // Get the entity and check ownership
    const entity = await this.getEntityById(entityType, entityId);
    if (!entity) {
      return false;
    }
    
    // If the entity has an ownerId field and it matches the userId, allow access
    if (entity.ownerId === userId) {
      return true;
    }
    
    // Check if the entity is assigned to the user
    const assignments = await this.getAssignments(entityType, entityId);
    const isAssignedToUser = assignments.some(
      (a) => a.assignedToType === 'User' && a.assignedToId === userId
    );
    if (isAssignedToUser) {
      return true;
    }
    
    // Check if the entity is assigned to any team the user is a member of
    const isAssignedToUserTeam = await this.checkTeamEntityAccess(userId, entityType, entityId);
    if (isAssignedToUserTeam) {
      return true;
    }
    
    return false;
  }
  
  async checkTeamEntityAccess(userId: number, entityType: string, entityId: number): Promise<boolean> {
    // Get all teams the user is a member of
    const userTeams: number[] = [];
    for (const member of this.teamMembers.values()) {
      if (member.userId === userId) {
        userTeams.push(member.teamId);
      }
    }
    
    if (userTeams.length === 0) {
      return false;
    }
    
    // Check if the entity is assigned to any of these teams
    const assignments = await this.getAssignments(entityType, entityId);
    const isAssignedToUserTeam = assignments.some(
      (a) => a.assignedToType === 'Team' && userTeams.includes(a.assignedToId)
    );
    
    return isAssignedToUserTeam;
  }
  
  async getEntityById(entityType: string, entityId: number): Promise<any> {
    switch(entityType.toLowerCase()) {
      case 'contact':
        return this.getContact(entityId);
      case 'account':
        return this.getAccount(entityId);
      case 'lead':
        return this.getLead(entityId);
      case 'opportunity':
        return this.getOpportunity(entityId);
      case 'task':
        return this.getTask(entityId);
      case 'event':
        return this.getEvent(entityId);
      case 'product':
        return this.getProduct(entityId);
      case 'invoice':
        return this.getInvoice(entityId);
      case 'purchaseorder':
        return this.getPurchaseOrder(entityId);
      default:
        return undefined;
    }
  }
  
  async initializePermissions(): Promise<void> {
    // Create default modules
    const modules = [
      { moduleName: 'dashboard', displayName: 'Dashboard', icon: 'home', order: 1 },
      { moduleName: 'contacts', displayName: 'Contacts', icon: 'users', order: 2 },
      { moduleName: 'accounts', displayName: 'Accounts', icon: 'briefcase', order: 3 },
      { moduleName: 'leads', displayName: 'Leads', icon: 'user-plus', order: 4 },
      { moduleName: 'opportunities', displayName: 'Opportunities', icon: 'target', order: 5 },
      { moduleName: 'tasks', displayName: 'Tasks', icon: 'check-square', order: 6 },
      { moduleName: 'calendar', displayName: 'Calendar', icon: 'calendar', order: 7 },
      { moduleName: 'communications', displayName: 'Communications', icon: 'message-circle', order: 8 },
      { moduleName: 'reports', displayName: 'Reports', icon: 'bar-chart-2', order: 9 },
      { moduleName: 'products', displayName: 'Products', icon: 'package', order: 10 },
      { moduleName: 'inventory', displayName: 'Inventory', icon: 'database', order: 11 },
      { moduleName: 'invoices', displayName: 'Invoices', icon: 'file-text', order: 12 },
      { moduleName: 'purchaseorders', displayName: 'Purchase Orders', icon: 'shopping-cart', order: 13 },
      { moduleName: 'settings', displayName: 'Settings', icon: 'settings', order: 14 },
      { moduleName: 'workflows', displayName: 'Workflows', icon: 'git-branch', order: 15 },
      { moduleName: 'api', displayName: 'API Management', icon: 'code', order: 16 }
    ];
    
    for (const module of modules) {
      await this.createModulePermission(module);
    }
    
    // Setup default role permissions
    const actions = ['view', 'create', 'update', 'delete', 'export', 'import', 'assign'];
    const roles = ['Administrator', 'Manager', 'User', 'ReadOnly'];
    
    for (const modulePermission of this.modulePermissions.values()) {
      for (const role of roles) {
        for (const action of actions) {
          // Admins can do everything
          let isAllowed = role === 'Administrator';
          
          // Managers can do everything except delete in some modules
          if (role === 'Manager') {
            isAllowed = action !== 'delete' || 
              !['settings', 'api', 'workflows'].includes(modulePermission.moduleName);
          }
          
          // Regular users have limited permissions
          if (role === 'User') {
            if (['settings', 'api', 'workflows'].includes(modulePermission.moduleName)) {
              isAllowed = false;
            } else if (action === 'view' || action === 'create') {
              isAllowed = true;
            } else if (action === 'update' || action === 'assign') {
              isAllowed = !['reports'].includes(modulePermission.moduleName);
            } else {
              isAllowed = false;
            }
          }
          
          // Read-only users can only view
          if (role === 'ReadOnly') {
            isAllowed = action === 'view';
          }
          
          await this.createRolePermission({
            role,
            moduleId: modulePermission.id,
            action,
            isAllowed
          });
        }
      }
    }
  }

  // System Settings Methods
  async getSystemSettings(userId: number): Promise<SystemSettings> {
    try {
      // Define complete default settings with all properties
      const defaultSettings: SystemSettings = {
        menuVisibility: {
          contacts: true,
          accounts: true,
          leads: true,
          opportunities: true,
          calendar: true,
          tasks: true,
          communicationCenter: true,
          accounting: true,
          inventory: true,
          supportTickets: true,
          ecommerce: true,
          ecommerceStore: true,
          reports: true,
          intelligence: true,
          workflows: true,
          subscriptions: true,
          training: true
        },
        dashboardPreferences: {
          showSalesPipeline: true,
          showRecentActivities: true,
          showTasks: true,
          showEvents: true,
          showLeadsStats: true,
          showConversionStats: true,
          showRevenueStats: true,
          showOpportunitiesStats: true,
          pipelineChartType: 'pie',
          revenueChartType: 'line',
          leadsChartType: 'line',
          defaultTimeRange: 'month',
          showAIInsights: true,
          aiInsightTypes: ['leads', 'opportunities', 'revenue'],
          aiInsightsCount: 3
        }
      };
      
      // Get all settings for this user from database
      const userSettingsRecords = await db.select()
        .from(systemSettings)
        .where(eq(systemSettings.userId, userId));
      
      // If no settings exist, create and save default settings
      if (userSettingsRecords.length === 0) {
        console.log(`Creating default settings for user ${userId}`);
        await this.saveSystemSettings(userId, defaultSettings);
        return defaultSettings;
      }
      
      // Process all settings into a map by key
      const settingsMap = new Map<string, any>();
      for (const record of userSettingsRecords) {
        settingsMap.set(record.settingKey, record.settingValue);
      }
      
      // Build the settings object from database values or defaults
      const menuVisibilitySettings = settingsMap.get('menuVisibility') || defaultSettings.menuVisibility;
      const dashboardPreferencesSettings = settingsMap.get('dashboardPreferences') || defaultSettings.dashboardPreferences;
      
      // Combine the settings
      const combinedSettings: SystemSettings = {
        menuVisibility: menuVisibilitySettings,
        dashboardPreferences: dashboardPreferencesSettings
      };
      
      return combinedSettings;
    } catch (error) {
      console.error('Database error in getSystemSettings:', error);
      // Return default settings on error
      return {
        menuVisibility: {
          contacts: true,
          accounts: true,
          leads: true,
          opportunities: true,
          calendar: true,
          tasks: true,
          communicationCenter: true,
          accounting: true,
          inventory: true,
          supportTickets: true,
          ecommerce: true,
          ecommerceStore: true, 
          reports: true,
          intelligence: true,
          workflows: true,
          subscriptions: true,
          training: true
        },
        dashboardPreferences: {
          showSalesPipeline: true,
          showRecentActivities: true,
          showTasks: true,
          showEvents: true,
          showLeadsStats: true,
          showConversionStats: true,
          showRevenueStats: true,
          showOpportunitiesStats: true,
          pipelineChartType: 'pie',
          revenueChartType: 'line',
          leadsChartType: 'line',
          defaultTimeRange: 'month',
          showAIInsights: true,
          aiInsightTypes: ['leads', 'opportunities', 'revenue'],
          aiInsightsCount: 3
        }
      };
    }
  }
  
  async saveSystemSettings(userId: number, settings: SystemSettings): Promise<SystemSettings> {
    try {
      // Handle menu visibility settings
      const existingMenuSettings = await db.select()
        .from(systemSettings)
        .where(eq(systemSettings.userId, userId))
        .where(eq(systemSettings.settingKey, 'menuVisibility'));
      
      const now = new Date();
      
      if (existingMenuSettings.length > 0) {
        // Update existing menu visibility settings
        await db.update(systemSettings)
          .set({
            settingValue: settings.menuVisibility as any,
            updatedAt: now
          })
          .where(eq(systemSettings.id, existingMenuSettings[0].id));
      } else {
        // Insert new menu visibility settings
        await db.insert(systemSettings)
          .values({
            userId: userId,
            settingKey: 'menuVisibility',
            settingValue: settings.menuVisibility as any,
            scope: 'user',
            createdAt: now,
            updatedAt: now
          });
      }
      
      // Handle dashboard preferences settings
      const existingDashboardSettings = await db.select()
        .from(systemSettings)
        .where(eq(systemSettings.userId, userId))
        .where(eq(systemSettings.settingKey, 'dashboardPreferences'));
      
      if (existingDashboardSettings.length > 0) {
        // Update existing dashboard preferences settings
        await db.update(systemSettings)
          .set({
            settingValue: settings.dashboardPreferences as any,
            updatedAt: now
          })
          .where(eq(systemSettings.id, existingDashboardSettings[0].id));
      } else {
        // Insert new dashboard preferences settings
        await db.insert(systemSettings)
          .values({
            userId: userId,
            settingKey: 'dashboardPreferences',
            settingValue: settings.dashboardPreferences as any,
            scope: 'user',
            createdAt: now,
            updatedAt: now
          });
      }
      
      return settings;
    } catch (error) {
      console.error('Database error in saveSystemSettings:', error);
      throw new Error('Failed to save system settings');
    }
  }
}

// Import social integration helper functions
import { addSocialIntegrationsToMemStorage, addSocialIntegrationsToDatabaseStorage } from './social-integrations';
// Import API key integration helper functions
import { addApiKeysToMemStorage, addApiKeysToDatabaseStorage } from './api-keys-integration';
// Import permission helper functions
import { addPermissionsToMemStorage, addPermissionsToDatabaseStorage } from './permissions-manager';

// Team Management - PostgreSQL implementation
DatabaseStorage.prototype.listTeams = async function(): Promise<Team[]> {
  try {
    return await db.select().from(teams);
  } catch (error) {
    console.error('Database error in listTeams:', error);
    return [];
  }
};

DatabaseStorage.prototype.getAllTeams = async function(): Promise<Team[]> {
  return this.listTeams();
};

DatabaseStorage.prototype.getTeamById = async function(id: number): Promise<Team | undefined> {
  try {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  } catch (error) {
    console.error('Database error in getTeamById:', error);
    return undefined;
  }
};

// First implementation of createTeam

DatabaseStorage.prototype.updateTeam = async function(id: number, updates: Partial<InsertTeam>): Promise<Team> {
  try {
    const [updatedTeam] = await db.update(teams)
      .set(updates)
      .where(eq(teams.id, id))
      .returning();
    return updatedTeam;
  } catch (error) {
    console.error('Database error in updateTeam:', error);
    throw error;
  }
};

DatabaseStorage.prototype.deleteTeam = async function(id: number): Promise<boolean> {
  try {
    await db.delete(teams).where(eq(teams.id, id));
    return true;
  } catch (error) {
    console.error('Database error in deleteTeam:', error);
    return false;
  }
};

// Team Members Management - PostgreSQL implementation
DatabaseStorage.prototype.getTeamMembers = async function(teamId: number): Promise<(TeamMember & { user?: User })[]> {
  try {
    const members = await db.select({
      teamMember: teamMembers,
      user: users
    })
    .from(teamMembers)
    .leftJoin(users, eq(teamMembers.userId, users.id))
    .where(eq(teamMembers.teamId, teamId));
    
    return members.map(({ teamMember, user }) => ({ ...teamMember, user }));
  } catch (error) {
    console.error('Database error in getTeamMembers:', error);
    return [];
  }
};

DatabaseStorage.prototype.addTeamMember = async function(member: InsertTeamMember): Promise<TeamMember> {
  try {
    const [newMember] = await db.insert(teamMembers)
      .values(member)
      .returning();
    return newMember;
  } catch (error) {
    console.error('Database error in addTeamMember:', error);
    throw error;
  }
};

DatabaseStorage.prototype.updateTeamMember = async function(id: number, updates: Partial<InsertTeamMember>): Promise<TeamMember> {
  try {
    const [updatedMember] = await db.update(teamMembers)
      .set(updates)
      .where(eq(teamMembers.id, id))
      .returning();
    return updatedMember;
  } catch (error) {
    console.error('Database error in updateTeamMember:', error);
    throw error;
  }
};

DatabaseStorage.prototype.removeTeamMember = async function(id: number): Promise<boolean> {
  try {
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
    return true;
  } catch (error) {
    console.error('Database error in removeTeamMember:', error);
    return false;
  }
};

// Team Management - DatabaseStorage Implementation
DatabaseStorage.prototype.listTeams = async function(): Promise<Team[]> {
  try {
    return await db.select().from(teams).orderBy(teams.name);
  } catch (error) {
    console.error('Database error in listTeams:', error);
    return [];
  }
};

DatabaseStorage.prototype.getAllTeams = async function(): Promise<Team[]> {
  return this.listTeams();
};

DatabaseStorage.prototype.getTeamById = async function(id: number): Promise<Team | undefined> {
  try {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  } catch (error) {
    console.error('Database error in getTeamById:', error);
    return undefined;
  }
};

DatabaseStorage.prototype.createTeam = async function(team: InsertTeam): Promise<Team> {
  try {
    const [newTeam] = await db.insert(teams)
      .values(team)
      .returning();
    return newTeam;
  } catch (error) {
    console.error('Database error in createTeam:', error);
    throw error;
  }
};

DatabaseStorage.prototype.updateTeam = async function(id: number, updates: Partial<InsertTeam>): Promise<Team> {
  try {
    const [updatedTeam] = await db.update(teams)
      .set(updates)
      .where(eq(teams.id, id))
      .returning();
    return updatedTeam;
  } catch (error) {
    console.error('Database error in updateTeam:', error);
    throw error;
  }
};

DatabaseStorage.prototype.deleteTeam = async function(id: number): Promise<boolean> {
  try {
    await db.delete(teams).where(eq(teams.id, id));
    return true;
  } catch (error) {
    console.error('Database error in deleteTeam:', error);
    return false;
  }
};

// Team Members - DatabaseStorage Implementation
DatabaseStorage.prototype.getTeamMembers = async function(teamId: number): Promise<(TeamMember & { user?: User })[]> {
  try {
    const members = await db.select({
      teamMember: teamMembers,
      user: users
    })
    .from(teamMembers)
    .leftJoin(users, eq(teamMembers.userId, users.id))
    .where(eq(teamMembers.teamId, teamId));
    
    return members.map(({ teamMember, user }) => ({ ...teamMember, user }));
  } catch (error) {
    console.error('Database error in getTeamMembers:', error);
    return [];
  }
};

DatabaseStorage.prototype.addTeamMember = async function(member: InsertTeamMember): Promise<TeamMember> {
  try {
    const [newMember] = await db.insert(teamMembers)
      .values(member)
      .returning();
    return newMember;
  } catch (error) {
    console.error('Database error in addTeamMember:', error);
    throw error;
  }
};

DatabaseStorage.prototype.updateTeamMember = async function(id: number, updates: Partial<InsertTeamMember>): Promise<TeamMember> {
  try {
    const [updatedMember] = await db.update(teamMembers)
      .set(updates)
      .where(eq(teamMembers.id, id))
      .returning();
    return updatedMember;
  } catch (error) {
    console.error('Database error in updateTeamMember:', error);
    throw error;
  }
};

DatabaseStorage.prototype.removeTeamMember = async function(id: number): Promise<boolean> {
  try {
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
    return true;
  } catch (error) {
    console.error('Database error in removeTeamMember:', error);
    return false;
  }
};

// Create the appropriate storage implementation
// For development, you can switch between MemStorage and DatabaseStorage
const useDatabase = true; // Set to true to use PostgreSQL database storage

export let storage: IStorage;

if (useDatabase) {
  // Use PostgreSQL for persistent data
  const dbStorage = new DatabaseStorage();
  // Add social media integration methods to database storage
  addSocialIntegrationsToDatabaseStorage(dbStorage);
  // Add API key management methods to database storage
  addApiKeysToDatabaseStorage(dbStorage);
  // Add communication methods to database storage
  addCommunicationsToDatabase(dbStorage);
  // Add permission methods to database storage
  addPermissionsToDatabaseStorage(dbStorage);
  
  // Add method aliases to make DatabaseStorage methods match the IStorage interface
  DatabaseStorage.prototype.listTeamMembers = DatabaseStorage.prototype.getTeamMembers;
  DatabaseStorage.prototype.createTeamMember = DatabaseStorage.prototype.addTeamMember;
  DatabaseStorage.prototype.deleteTeamMember = DatabaseStorage.prototype.removeTeamMember;
  DatabaseStorage.prototype.listAssignments = DatabaseStorage.prototype.getAssignmentsByEntity;
  
  storage = dbStorage;
} else {
  // Use in-memory storage for development/testing
  const memStorage = new MemStorage();
  // Add social media integration methods to memory storage
  addSocialIntegrationsToMemStorage(memStorage);
  // Add API key management methods to memory storage
  addApiKeysToMemStorage(memStorage);
  // Add communication methods to memory storage
  addCommunicationsToMemStorage(memStorage);
  // Add permission methods to memory storage
  addPermissionsToMemStorage(memStorage);
  storage = memStorage;
  // Initialize sample subscription packages for in-memory storage
  initializeSubscriptionPackages(storage);
}

// For database storage, subscription packages would be created via admin UI
// or initialized separately, not needed here