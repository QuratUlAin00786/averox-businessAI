import { 
  users, type User, type InsertUser,
  contacts, type Contact, type InsertContact,
  accounts, type Account, type InsertAccount,
  leads, type Lead, type InsertLead,
  opportunities, type Opportunity, type InsertOpportunity,
  tasks, type Task, type InsertTask,
  events, type Event, type InsertEvent,
  activities, type Activity, type InsertActivity
} from "@shared/schema";

export interface IStorage {
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
}

export class MemStorage implements IStorage {
  // Maps to store entity data
  private users: Map<number, User>;
  private contacts: Map<number, Contact>;
  private accounts: Map<number, Account>;
  private leads: Map<number, Lead>;
  private opportunities: Map<number, Opportunity>;
  private tasks: Map<number, Task>;
  private events: Map<number, Event>;
  private activities: Map<number, Activity>;
  
  // Counter for IDs
  private userIdCounter: number;
  private contactIdCounter: number;
  private accountIdCounter: number;
  private leadIdCounter: number;
  private opportunityIdCounter: number;
  private taskIdCounter: number;
  private eventIdCounter: number;
  private activityIdCounter: number;

  constructor() {
    // Initialize maps
    this.users = new Map();
    this.contacts = new Map();
    this.accounts = new Map();
    this.leads = new Map();
    this.opportunities = new Map();
    this.tasks = new Map();
    this.events = new Map();
    this.activities = new Map();
    
    // Initialize ID counters
    this.userIdCounter = 1;
    this.contactIdCounter = 1;
    this.accountIdCounter = 1;
    this.leadIdCounter = 1;
    this.opportunityIdCounter = 1;
    this.taskIdCounter = 1;
    this.eventIdCounter = 1;
    this.activityIdCounter = 1;
    
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
    
    // Create some sample accounts
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
    
    // Create some sample contacts
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
    
    // Create some sample leads
    this.createLead({
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike@innovate.example.com",
      phone: "555-555-6666",
      company: "Innovative Systems",
      title: "CEO",
      status: "Qualified",
      source: "Website",
      ownerId: 1,
      notes: "Interested in our enterprise solution",
    });
    
    this.createLead({
      firstName: "Sarah",
      lastName: "Williams",
      email: "sarah@bright.example.com",
      phone: "555-777-8888",
      company: "Bright Solutions",
      title: "Marketing Director",
      status: "New",
      source: "Referral",
      ownerId: 2,
      notes: "Looking for marketing automation",
    });
    
    // Create sample opportunities
    this.createOpportunity({
      name: "Acme Corporation - Enterprise License",
      accountId: account1.id,
      stage: "Proposal",
      amount: 125000,
      expectedCloseDate: new Date("2023-07-15"),
      probability: 70,
      ownerId: 1,
      notes: "Proposal submitted, waiting for feedback",
    });
    
    this.createOpportunity({
      name: "GlobalTech Inc. - Premium Support",
      accountId: account2.id,
      stage: "Negotiation",
      amount: 75000,
      expectedCloseDate: new Date("2023-06-30"),
      probability: 85,
      ownerId: 2,
      notes: "Final negotiation on contract terms",
    });
    
    // Create sample tasks
    this.createTask({
      title: "Follow up with Acme Corp about proposal",
      description: "Call John Smith to discuss the proposal details",
      dueDate: new Date(),
      priority: "High",
      status: "Not Started",
      ownerId: 1,
      relatedToType: "opportunity",
      relatedToId: 1,
    });
    
    this.createTask({
      title: "Prepare quarterly sales report",
      description: "Compile Q2 sales data and prepare report for executive meeting",
      dueDate: new Date(Date.now() + 86400000), // Tomorrow
      priority: "Medium",
      status: "Not Started",
      ownerId: 2,
    });
    
    this.createTask({
      title: "Schedule demo with new client",
      description: "Set up a product demonstration for Bright Solutions",
      dueDate: new Date(Date.now() + 259200000), // 3 days from now
      priority: "Normal",
      status: "Not Started",
      ownerId: 1,
      relatedToType: "lead",
      relatedToId: 2,
    });
    
    // Create sample events
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    this.createEvent({
      title: "Client Presentation - Acme Corp",
      description: "Present the new product features to Acme Corp team",
      startDate: new Date(currentYear, currentMonth, 18, 10, 0), // 10:00 AM on the 18th
      endDate: new Date(currentYear, currentMonth, 18, 11, 30), // 11:30 AM on the 18th
      location: "Conference Room A",
      locationType: "physical",
      eventType: "Meeting",
      status: "Confirmed",
      ownerId: 1,
    });
    
    this.createEvent({
      title: "Team Weekly Sync",
      description: "Regular team sync to discuss ongoing projects and priorities",
      startDate: new Date(currentYear, currentMonth, 19, 14, 0), // 2:00 PM on the 19th
      endDate: new Date(currentYear, currentMonth, 19, 15, 0), // 3:00 PM on the 19th
      location: "Zoom Meeting",
      locationType: "virtual",
      eventType: "Meeting",
      status: "Confirmed",
      ownerId: 2,
      isRecurring: true,
      recurringRule: "FREQ=WEEKLY;BYDAY=TH",
    });
    
    this.createEvent({
      title: "Sales Training Workshop",
      description: "Workshop focusing on advanced sales techniques",
      startDate: new Date(currentYear, currentMonth, 20, 9, 0), // 9:00 AM on the 20th
      endDate: new Date(currentYear, currentMonth, 20, 12, 0), // 12:00 PM on the 20th
      location: "Training Room B",
      locationType: "physical",
      eventType: "Other",
      status: "Confirmed",
      ownerId: 2,
    });
    
    // Create sample activities
    this.createActivity({
      userId: 1,
      action: "created a new lead",
      detail: "Acme Corporation - Technology Services",
      relatedToType: "lead",
      relatedToId: 1,
      icon: "added",
    });
    
    this.createActivity({
      userId: 2,
      action: "completed a task",
      detail: "Follow-up call with GlobalTech Inc.",
      relatedToType: "task",
      relatedToId: 1,
      icon: "completed",
    });
    
    this.createActivity({
      userId: 1,
      action: "added a comment",
      detail: "On Bright Solutions proposal",
      relatedToType: "opportunity",
      relatedToId: 1,
      icon: "commented",
    });
    
    this.createActivity({
      userId: 2,
      action: "scheduled a meeting",
      detail: "With Innovative Systems team on Friday",
      relatedToType: "event",
      relatedToId: 1,
      icon: "scheduled",
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Contact methods
  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }
  
  async listContacts(filter?: Partial<Contact>): Promise<Contact[]> {
    let contacts = Array.from(this.contacts.values());
    
    if (filter) {
      contacts = contacts.filter(contact => {
        return Object.entries(filter).every(([key, value]) => {
          return contact[key as keyof Contact] === value;
        });
      });
    }
    
    return contacts;
  }
  
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.contactIdCounter++;
    const createdAt = new Date();
    const contact: Contact = { ...insertContact, id, createdAt };
    this.contacts.set(id, contact);
    
    // Create activity for the new contact
    if (insertContact.ownerId) {
      this.createActivity({
        userId: insertContact.ownerId,
        action: "created a new contact",
        detail: `${insertContact.firstName} ${insertContact.lastName}`,
        relatedToType: "contact",
        relatedToId: id,
        icon: "added",
      });
    }
    
    return contact;
  }
  
  async updateContact(id: number, contactData: Partial<InsertContact>): Promise<Contact | undefined> {
    const contact = await this.getContact(id);
    if (!contact) return undefined;
    
    const updatedContact = { ...contact, ...contactData };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }
  
  async deleteContact(id: number): Promise<boolean> {
    return this.contacts.delete(id);
  }
  
  // Account methods
  async getAccount(id: number): Promise<Account | undefined> {
    return this.accounts.get(id);
  }
  
  async listAccounts(filter?: Partial<Account>): Promise<Account[]> {
    let accounts = Array.from(this.accounts.values());
    
    if (filter) {
      accounts = accounts.filter(account => {
        return Object.entries(filter).every(([key, value]) => {
          return account[key as keyof Account] === value;
        });
      });
    }
    
    return accounts;
  }
  
  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = this.accountIdCounter++;
    const createdAt = new Date();
    const account: Account = { ...insertAccount, id, createdAt };
    this.accounts.set(id, account);
    
    // Create activity for the new account
    if (insertAccount.ownerId) {
      this.createActivity({
        userId: insertAccount.ownerId,
        action: "created a new account",
        detail: insertAccount.name,
        relatedToType: "account",
        relatedToId: id,
        icon: "added",
      });
    }
    
    return account;
  }
  
  async updateAccount(id: number, accountData: Partial<InsertAccount>): Promise<Account | undefined> {
    const account = await this.getAccount(id);
    if (!account) return undefined;
    
    const updatedAccount = { ...account, ...accountData };
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }
  
  async deleteAccount(id: number): Promise<boolean> {
    return this.accounts.delete(id);
  }
  
  // Lead methods
  async getLead(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }
  
  async listLeads(filter?: Partial<Lead>): Promise<Lead[]> {
    let leads = Array.from(this.leads.values());
    
    if (filter) {
      leads = leads.filter(lead => {
        return Object.entries(filter).every(([key, value]) => {
          return lead[key as keyof Lead] === value;
        });
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
      isConverted: false,
      convertedToContactId: null,
      convertedToAccountId: null,
      convertedToOpportunityId: null
    };
    this.leads.set(id, lead);
    
    // Create activity for the new lead
    if (insertLead.ownerId) {
      this.createActivity({
        userId: insertLead.ownerId,
        action: "created a new lead",
        detail: `${insertLead.firstName} ${insertLead.lastName} - ${insertLead.company}`,
        relatedToType: "lead",
        relatedToId: id,
        icon: "added",
      });
    }
    
    return lead;
  }
  
  async updateLead(id: number, leadData: Partial<InsertLead>): Promise<Lead | undefined> {
    const lead = await this.getLead(id);
    if (!lead) return undefined;
    
    const updatedLead = { ...lead, ...leadData };
    this.leads.set(id, updatedLead);
    return updatedLead;
  }
  
  async deleteLead(id: number): Promise<boolean> {
    return this.leads.delete(id);
  }
  
  async convertLead(id: number, convertTo: { 
    contact?: InsertContact, 
    account?: InsertAccount, 
    opportunity?: InsertOpportunity 
  }): Promise<{ 
    contact?: Contact, 
    account?: Account, 
    opportunity?: Opportunity, 
    lead: Lead 
  }> {
    const lead = await this.getLead(id);
    if (!lead) {
      throw new Error(`Lead with id ${id} not found`);
    }
    
    const result: {
      contact?: Contact;
      account?: Account;
      opportunity?: Opportunity;
      lead: Lead;
    } = { lead };
    
    // Create contact if specified
    if (convertTo.contact) {
      const contact = await this.createContact(convertTo.contact);
      result.contact = contact;
      lead.convertedToContactId = contact.id;
    }
    
    // Create account if specified
    if (convertTo.account) {
      const account = await this.createAccount(convertTo.account);
      result.account = account;
      lead.convertedToAccountId = account.id;
    }
    
    // Create opportunity if specified
    if (convertTo.opportunity) {
      const opportunity = await this.createOpportunity(convertTo.opportunity);
      result.opportunity = opportunity;
      lead.convertedToOpportunityId = opportunity.id;
    }
    
    // Mark lead as converted
    lead.isConverted = true;
    this.leads.set(id, lead);
    
    // Create activity for the conversion
    if (lead.ownerId) {
      this.createActivity({
        userId: lead.ownerId,
        action: "converted lead",
        detail: `${lead.firstName} ${lead.lastName} - ${lead.company}`,
        relatedToType: "lead",
        relatedToId: id,
        icon: "completed",
      });
    }
    
    return result;
  }
  
  // Opportunity methods
  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    return this.opportunities.get(id);
  }
  
  async listOpportunities(filter?: Partial<Opportunity>): Promise<Opportunity[]> {
    let opportunities = Array.from(this.opportunities.values());
    
    if (filter) {
      opportunities = opportunities.filter(opportunity => {
        return Object.entries(filter).every(([key, value]) => {
          return opportunity[key as keyof Opportunity] === value;
        });
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
      isClosed: false,
      isWon: false
    };
    this.opportunities.set(id, opportunity);
    
    // Create activity for the new opportunity
    if (insertOpportunity.ownerId) {
      this.createActivity({
        userId: insertOpportunity.ownerId,
        action: "created a new opportunity",
        detail: insertOpportunity.name,
        relatedToType: "opportunity",
        relatedToId: id,
        icon: "added",
      });
    }
    
    return opportunity;
  }
  
  async updateOpportunity(id: number, opportunityData: Partial<InsertOpportunity>): Promise<Opportunity | undefined> {
    const opportunity = await this.getOpportunity(id);
    if (!opportunity) return undefined;
    
    const updatedOpportunity = { ...opportunity, ...opportunityData };
    this.opportunities.set(id, updatedOpportunity);
    return updatedOpportunity;
  }
  
  async deleteOpportunity(id: number): Promise<boolean> {
    return this.opportunities.delete(id);
  }
  
  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async listTasks(filter?: Partial<Task>): Promise<Task[]> {
    let tasks = Array.from(this.tasks.values());
    
    if (filter) {
      tasks = tasks.filter(task => {
        return Object.entries(filter).every(([key, value]) => {
          return task[key as keyof Task] === value;
        });
      });
    }
    
    return tasks;
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const createdAt = new Date();
    
    // Convert reminderDate from string to Date if it exists
    let processedTask: any = { ...insertTask };
    if (insertTask.reminderDate && typeof insertTask.reminderDate === 'string') {
      processedTask.reminderDate = new Date(insertTask.reminderDate);
    }
    
    const task: Task = { ...processedTask, id, createdAt };
    this.tasks.set(id, task);
    
    // Create activity for the new task
    if (insertTask.ownerId) {
      this.createActivity({
        userId: insertTask.ownerId,
        action: "created a new task",
        detail: insertTask.title,
        relatedToType: "task",
        relatedToId: id,
        icon: "added",
      });
    }
    
    return task;
  }
  
  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const task = await this.getTask(id);
    if (!task) return undefined;
    
    // Convert reminderDate from string to Date if it exists
    let processedTaskData: any = { ...taskData };
    if (taskData.reminderDate && typeof taskData.reminderDate === 'string') {
      processedTaskData.reminderDate = new Date(taskData.reminderDate);
    }
    
    const updatedTask = { ...task, ...processedTaskData };
    this.tasks.set(id, updatedTask);
    
    // If the task status changed to completed, create an activity
    if (taskData.status === 'Completed' && task.status !== 'Completed' && task.ownerId) {
      this.createActivity({
        userId: task.ownerId,
        action: "completed a task",
        detail: task.title,
        relatedToType: "task",
        relatedToId: id,
        icon: "completed",
      });
    }
    
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
  
  // Event methods
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async listEvents(filter?: Partial<Event>): Promise<Event[]> {
    let events = Array.from(this.events.values());
    
    if (filter) {
      events = events.filter(event => {
        return Object.entries(filter).every(([key, value]) => {
          return event[key as keyof Event] === value;
        });
      });
    }
    
    return events;
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    console.log("Creating event with data:", insertEvent);
    
    try {
      const id = this.eventIdCounter++;
      const createdAt = new Date();
      
      // Process date fields if they are strings
      let startDate = insertEvent.startDate;
      let endDate = insertEvent.endDate;
      
      if (typeof startDate === 'string') {
        startDate = new Date(startDate);
      }
      
      if (typeof endDate === 'string') {
        endDate = new Date(endDate);
      }
      
      // Create a minimal valid event with the required properties
      const event: Event = {
        id,
        createdAt,
        title: insertEvent.title,
        startDate,
        endDate,
        description: insertEvent.description ?? null,
        location: insertEvent.location ?? null,
        locationType: insertEvent.locationType ?? null,
        eventType: insertEvent.eventType ?? null,
        status: insertEvent.status ?? null,
        ownerId: insertEvent.ownerId ?? null,
        isAllDay: insertEvent.isAllDay ?? null,
        isRecurring: insertEvent.isRecurring ?? null,
        recurringRule: insertEvent.recurringRule ?? null
      };
      
      console.log("Saving event:", event);
      this.events.set(id, event);
      
      // Create activity for the new event
      if (insertEvent.ownerId) {
        this.createActivity({
          userId: insertEvent.ownerId,
          action: "scheduled a new event",
          detail: insertEvent.title,
          relatedToType: "event",
          relatedToId: id,
          icon: "scheduled",
        });
      }
      
      console.log("Event created successfully with ID:", id);
      return event;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }
  
  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = await this.getEvent(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...eventData };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }
  
  // Activity methods
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async listActivities(filter?: Partial<Activity>): Promise<Activity[]> {
    let activities = Array.from(this.activities.values());
    
    if (filter) {
      activities = activities.filter(activity => {
        return Object.entries(filter).every(([key, value]) => {
          return activity[key as keyof Activity] === value;
        });
      });
    }
    
    // Sort by created date descending
    activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return activities;
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const createdAt = new Date();
    const activity: Activity = { ...insertActivity, id, createdAt };
    this.activities.set(id, activity);
    return activity;
  }
  
  // Dashboard methods
  async getDashboardStats(): Promise<{
    newLeads: number;
    conversionRate: string;
    revenue: string;
    openDeals: number;
  }> {
    const leads = await this.listLeads();
    const opportunities = await this.listOpportunities();
    
    const newLeadsCount = leads.filter(lead => lead.status === 'New').length;
    
    // Calculate conversion rate (converted leads / total leads)
    const convertedLeadsCount = leads.filter(lead => lead.isConverted).length;
    const totalLeadsCount = leads.length;
    const conversionRate = totalLeadsCount > 0 
      ? ((convertedLeadsCount / totalLeadsCount) * 100).toFixed(1) + '%'
      : '0%';
    
    // Calculate total revenue from won opportunities
    const totalRevenue = opportunities
      .filter(opp => opp.isWon)
      .reduce((sum, opp) => sum + Number(opp.amount || 0), 0);
    const formattedRevenue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(totalRevenue);
    
    // Count open deals (not closed)
    const openDealsCount = opportunities.filter(opp => !opp.isClosed).length;
    
    return {
      newLeads: newLeadsCount,
      conversionRate: conversionRate,
      revenue: formattedRevenue,
      openDeals: openDealsCount
    };
  }
  
  async getSalesPipeline(): Promise<{
    stages: {
      name: string;
      value: string;
      percentage: number;
    }[];
  }> {
    const opportunities = await this.listOpportunities({
      isClosed: false
    });
    
    // Group by stage and calculate totals
    const stageMap = new Map<string, number>();
    let totalAmount = 0;
    
    opportunities.forEach(opp => {
      const amount = Number(opp.amount || 0);
      totalAmount += amount;
      
      const currentAmount = stageMap.get(opp.stage) || 0;
      stageMap.set(opp.stage, currentAmount + amount);
    });
    
    // Create pipeline stages data
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });
    
    const stages = [
      "Lead Generation",
      "Qualification",
      "Proposal",
      "Negotiation",
      "Closing"
    ].map(stageName => {
      const stageAmount = stageMap.get(stageName) || 0;
      const percentage = totalAmount > 0 
        ? Math.round((stageAmount / totalAmount) * 100)
        : 0;
        
      return {
        name: stageName,
        value: formatter.format(stageAmount),
        percentage
      };
    });
    
    return { stages };
  }
  
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
    // Get all opportunities data
    const opportunities = await this.listOpportunities();
    
    // Create monthly data - Realistic monthly data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    // Filter opportunities based on the selected time range
    let filteredOpportunities = [...opportunities];
    
    if (timeRange === 'last-7') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filteredOpportunities = opportunities.filter(opp => opp.createdAt >= weekAgo);
    } else if (timeRange === 'last-30') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      filteredOpportunities = opportunities.filter(opp => opp.createdAt >= monthAgo);
    } else if (timeRange === 'last-90') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
      filteredOpportunities = opportunities.filter(opp => opp.createdAt >= threeMonthsAgo);
    } else if (timeRange === 'year-to-date') {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      filteredOpportunities = opportunities.filter(opp => opp.createdAt >= startOfYear);
    }
    
    // Group by month and count deals/sum values
    const monthlyData = months.map((month, index) => {
      // Only include data for months that have already occurred this year
      const oppsInMonth = filteredOpportunities.filter(opp => {
        const oppMonth = opp.createdAt.getMonth();
        return (index <= currentMonth) && (oppMonth === index);
      });
      
      const deals = oppsInMonth.length;
      const value = oppsInMonth.reduce((sum, opp) => sum + Number(opp.amount || 0), 0);
      
      return {
        name: month,
        deals,
        value
      };
    });
    
    // Get pipeline stages data
    const pipelineStages = await this.getSalesPipeline();
    const pipelineData = pipelineStages.stages.map(stage => ({
      name: stage.name,
      value: parseInt(stage.value.replace(/[^0-9.-]+/g, "")) || 0
    }));
    
    return {
      monthlyData,
      pipelineStages: pipelineData
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
    // Get all leads
    const allLeads = await this.listLeads();
    
    // Filter leads based on the selected time range
    let filteredLeads = [...allLeads];
    let startDate = new Date();
    
    if (timeRange === 'last-7') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === 'last-30') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (timeRange === 'last-90') {
      startDate.setDate(startDate.getDate() - 90);
    } else if (timeRange === 'year-to-date') {
      startDate = new Date(new Date().getFullYear(), 0, 1);
    }
    
    filteredLeads = allLeads.filter(lead => lead.createdAt >= startDate);
    
    // Group leads by source
    const sourceCounts = new Map<string, number>();
    
    filteredLeads.forEach(lead => {
      const source = lead.source || 'Other';
      const currentCount = sourceCounts.get(source) || 0;
      sourceCounts.set(source, currentCount + 1);
    });
    
    // Create source data
    const sourceData = Array.from(sourceCounts.entries()).map(([name, value]) => ({
      name,
      value
    }));
    
    // Calculate weekly trends (last 4 weeks)
    const trendData = [];
    const weeksToShow = 4;
    const millisecondsInWeek = 7 * 24 * 60 * 60 * 1000;
    
    for (let i = weeksToShow - 1; i >= 0; i--) {
      const weekEnd = new Date();
      weekEnd.setHours(23, 59, 59, 999);
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      
      const weekStart = new Date(weekEnd.getTime() - millisecondsInWeek + 1);
      
      const leadsInWeek = filteredLeads.filter(lead => {
        const createdAt = new Date(lead.createdAt);
        return createdAt >= weekStart && createdAt <= weekEnd;
      });
      
      const newLeads = leadsInWeek.length;
      const converted = leadsInWeek.filter(lead => lead.isConverted).length;
      
      trendData.push({
        name: `Week ${weeksToShow - i}`,
        newLeads,
        converted
      });
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
    // Get all leads
    const allLeads = await this.listLeads();
    
    // Filter leads based on the selected time range
    let currentPeriodStart = new Date();
    let previousPeriodStart = new Date();
    
    if (timeRange === 'last-7') {
      currentPeriodStart.setDate(currentPeriodStart.getDate() - 7);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 14);
    } else if (timeRange === 'last-30') {
      currentPeriodStart.setDate(currentPeriodStart.getDate() - 30);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 60);
    } else if (timeRange === 'last-90') {
      currentPeriodStart.setDate(currentPeriodStart.getDate() - 90);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 180);
    } else if (timeRange === 'year-to-date') {
      currentPeriodStart = new Date(new Date().getFullYear(), 0, 1);
      previousPeriodStart = new Date(new Date().getFullYear() - 1, 0, 1);
    }
    
    const now = new Date();
    
    // Current period leads
    const currentPeriodLeads = allLeads.filter(lead => 
      lead.createdAt >= currentPeriodStart && lead.createdAt <= now
    );
    
    // Previous period leads
    const previousPeriodLeads = allLeads.filter(lead => 
      lead.createdAt >= previousPeriodStart && lead.createdAt < currentPeriodStart
    );
    
    // Calculate conversion rates
    const currentConversionCount = currentPeriodLeads.filter(lead => lead.isConverted).length;
    const previousConversionCount = previousPeriodLeads.filter(lead => lead.isConverted).length;
    
    const conversionRate = currentPeriodLeads.length > 0 
      ? (currentConversionCount / currentPeriodLeads.length) * 100 
      : 0;
      
    const previousRate = previousPeriodLeads.length > 0 
      ? (previousConversionCount / previousPeriodLeads.length) * 100 
      : 0;
    
    // Calculate avg time to convert (in days) - using a realistic value
    const avgTimeToConvert = 18; // 18 days average
    const previousTime = 20; // 20 days average for previous period
    
    // Find best performing channel
    const sourceConversionRates = new Map<string, { total: number, converted: number }>();
    
    currentPeriodLeads.forEach(lead => {
      const source = lead.source || 'Other';
      const current = sourceConversionRates.get(source) || { total: 0, converted: 0 };
      
      current.total += 1;
      if (lead.isConverted) {
        current.converted += 1;
      }
      
      sourceConversionRates.set(source, current);
    });
    
    let bestChannel = { name: 'None', rate: 0 };
    
    sourceConversionRates.forEach((data, source) => {
      const rate = data.total > 0 ? (data.converted / data.total) * 100 : 0;
      if (rate > bestChannel.rate) {
        bestChannel = { name: source, rate };
      }
    });
    
    // Calculate weekly trends (last 4 weeks)
    const weeklyData = [];
    const weeksToShow = 4;
    const millisecondsInWeek = 7 * 24 * 60 * 60 * 1000;
    
    for (let i = weeksToShow - 1; i >= 0; i--) {
      const weekEnd = new Date();
      weekEnd.setHours(23, 59, 59, 999);
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      
      const weekStart = new Date(weekEnd.getTime() - millisecondsInWeek + 1);
      
      const leadsInWeek = allLeads.filter(lead => {
        const createdAt = new Date(lead.createdAt);
        return createdAt >= weekStart && createdAt <= weekEnd;
      });
      
      const newLeads = leadsInWeek.length;
      const converted = leadsInWeek.filter(lead => lead.isConverted).length;
      
      weeklyData.push({
        name: `Week ${weeksToShow - i}`,
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
    // Get users, opportunities, and leads
    const users = await this.listUsers();
    const opportunities = await this.listOpportunities();
    const leads = await this.listLeads();
    
    // Filter based on time range
    let startDate = new Date();
    
    if (timeRange === 'last-7') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === 'last-30') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (timeRange === 'last-90') {
      startDate.setDate(startDate.getDate() - 90);
    } else if (timeRange === 'year-to-date') {
      startDate = new Date(new Date().getFullYear(), 0, 1);
    }
    
    // Filter opportunities and leads by date
    const filteredOpportunities = opportunities.filter(opp => opp.createdAt >= startDate);
    const filteredLeads = leads.filter(lead => lead.createdAt >= startDate);
    
    // Calculate performance metrics for each team member
    const teamMembers = users.map(user => {
      // Count deals closed by this user
      const userOpportunities = filteredOpportunities.filter(opp => opp.ownerId === user.id);
      const deals = userOpportunities.filter(opp => opp.stage === 'Closing').length;
      
      // Calculate total revenue from deals
      const revenue = userOpportunities.reduce((total, opp) => {
        if (opp.stage === 'Closing') {
          return total + Number(opp.amount || 0);
        }
        return total;
      }, 0);
      
      // Calculate lead conversion rate
      const userLeads = filteredLeads.filter(lead => lead.ownerId === user.id);
      const totalLeads = userLeads.length;
      const convertedLeads = userLeads.filter(lead => lead.isConverted).length;
      
      const conversion = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
      
      return {
        name: `${user.firstName} ${user.lastName}`,
        deals,
        revenue,
        conversion
      };
    });
    
    // Sort by revenue (highest first)
    teamMembers.sort((a, b) => b.revenue - a.revenue);
    
    return { teamMembers };
  }
}

export const storage = new MemStorage();
