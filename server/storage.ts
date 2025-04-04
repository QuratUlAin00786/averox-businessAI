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
  userSubscriptions, type UserSubscription, type InsertUserSubscription
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
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
  
  // User Account Management
  updateUserStripeInfo(userId: number, stripeInfo: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User | undefined>;
  updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User | undefined>;
}

export class MemStorage implements IStorage {
  // Session store for authentication
  public sessionStore: session.Store;
  
  // Maps to store entity data
  public users: Map<number, User>; // Make users map public for auth module direct access
  private contacts: Map<number, Contact>;
  private accounts: Map<number, Account>;
  private leads: Map<number, Lead>;
  private opportunities: Map<number, Opportunity>;
  private tasks: Map<number, Task>;
  private events: Map<number, Event>;
  private activities: Map<number, Activity>;
  private subscriptionPackages: Map<number, SubscriptionPackage>;
  private userSubscriptions: Map<number, UserSubscription>;
  
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

export const storage = new MemStorage();

// Initialize subscription packages
initializeSubscriptionPackages(storage);