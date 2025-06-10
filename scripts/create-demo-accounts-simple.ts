import { db } from "../server/db";
import { users, accounts, contacts, leads, opportunities, tasks, events, activities } from "../shared/schema";
import { hashPassword } from "../server/auth";

/**
 * Creates demo accounts with all necessary data for a complete demo experience
 * This script:
 * 1. Creates a demo admin account
 * 2. Creates a demo user account
 * 3. Populates both accounts with sample data
 * 
 * To run this script: npx tsx scripts/create-demo-accounts-simple.ts
 */
async function createDemoAccounts() {
  console.log("Creating demo accounts for the AVEROX CRM system...");

  // Check if demo accounts already exist
  const existingAdmin = await db.select().from(users).where({ username: 'demoadmin' });
  const existingUser = await db.select().from(users).where({ username: 'demouser' });

  // Create demo admin account if doesn't exist
  let demoAdminId = existingAdmin.length > 0 ? existingAdmin[0].id : 0;
  
  if (demoAdminId === 0) {
    // Create demo admin
    const [demoAdmin] = await db.insert(users).values({
      username: "demoadmin",
      password: await hashPassword("demoadmin123"),
      firstName: "Demo",
      lastName: "Admin",
      email: "demoadmin@averox.com",
      role: "Admin",
      isActive: true,
      isVerified: true,
      createdAt: new Date()
    }).returning();
    
    demoAdminId = demoAdmin.id;
    console.log(`Created demo admin account with ID: ${demoAdminId}`);
  } else {
    console.log(`Using existing demo admin account with ID: ${demoAdminId}`);
  }

  // Create demo user account if doesn't exist
  let demoUserId = existingUser.length > 0 ? existingUser[0].id : 0;
  
  if (demoUserId === 0) {
    // Create demo user
    const [demoUser] = await db.insert(users).values({
      username: "demouser",
      password: await hashPassword("demouser123"),
      firstName: "Demo",
      lastName: "User",
      email: "demouser@averox.com",
      role: "User",
      isActive: true,
      isVerified: true,
      createdAt: new Date()
    }).returning();
    
    demoUserId = demoUser.id;
    console.log(`Created demo user account with ID: ${demoUserId}`);
  } else {
    console.log(`Using existing demo user account with ID: ${demoUserId}`);
  }

  // If we already have data for both accounts, we can exit early
  const existingAccounts = await db.select().from(accounts).where({ ownerId: demoAdminId }).orWhere({ ownerId: demoUserId });
  if (existingAccounts.length >= 10) {
    console.log("Demo accounts already have sufficient data. No additional seeding needed.");
    return;
  }

  console.log("Populating demo accounts with sample data...");
  
  // Hard-coded sample data for demonstration
  const demoAccountsData = [
    {
      name: "Acme Demo Corporation",
      industry: "Technology",
      website: "https://acme-demo.example.com",
      phone: "123-456-7890",
      email: "info@acme-demo.example.com",
      billingAddress: "123 Demo Street, Suite 100",
      billingCity: "Demo City",
      billingState: "DS",
      billingZip: "12345",
      billingCountry: "United States",
      address: "123 Demo Street, Suite 100",
      city: "Demo City",
      state: "DS",
      zip: "12345",
      country: "United States",
      ownerId: demoAdminId,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      annualRevenue: 5000000,
      employeeCount: 250,
      notes: "Demo account for AVEROX CRM showcase",
      isActive: true,
      type: "Customer"
    },
    {
      name: "TechDemo Solutions",
      industry: "Software",
      website: "https://techdemo.example.com",
      phone: "234-567-8901",
      email: "info@techdemo.example.com",
      billingAddress: "456 Demo Avenue",
      billingCity: "Example Town",
      billingState: "ET",
      billingZip: "67890",
      billingCountry: "United States",
      address: "456 Demo Avenue",
      city: "Example Town",
      state: "ET",
      zip: "67890",
      country: "United States",
      ownerId: demoAdminId,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
      annualRevenue: 3000000,
      employeeCount: 150,
      notes: "B2B software provider, interested in enterprise solution",
      isActive: true,
      type: "Prospect"
    },
    {
      name: "Demo Healthcare Group",
      industry: "Healthcare",
      website: "https://demohealthcare.example.com",
      phone: "345-678-9012",
      email: "contact@demohealthcare.example.com",
      billingAddress: "789 Medical Drive",
      billingCity: "Healthcare City",
      billingState: "HC",
      billingZip: "34567",
      billingCountry: "United States",
      address: "789 Medical Drive",
      city: "Healthcare City",
      state: "HC",
      zip: "34567",
      country: "United States",
      ownerId: demoUserId,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      annualRevenue: 8000000,
      employeeCount: 500,
      notes: "Large healthcare provider looking for patient management solutions",
      isActive: true,
      type: "Customer"
    },
    {
      name: "Demo Financial Services",
      industry: "Finance",
      website: "https://demofinance.example.com",
      phone: "456-789-0123",
      email: "info@demofinance.example.com",
      billingAddress: "101 Banking Blvd",
      billingCity: "Finance City",
      billingState: "FC",
      billingZip: "45678",
      billingCountry: "United States",
      address: "101 Banking Blvd",
      city: "Finance City",
      state: "FC",
      zip: "45678",
      country: "United States",
      ownerId: demoUserId,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      annualRevenue: 12000000,
      employeeCount: 350,
      notes: "Banking institution interested in client management tools",
      isActive: true,
      type: "Prospect"
    },
    {
      name: "Demo Manufacturing Inc",
      industry: "Manufacturing",
      website: "https://demomanufacturing.example.com",
      phone: "567-890-1234",
      email: "info@demomanufacturing.example.com",
      billingAddress: "202 Factory Lane",
      billingCity: "Industrial Park",
      billingState: "IP",
      billingZip: "56789",
      billingCountry: "United States",
      address: "202 Factory Lane",
      city: "Industrial Park",
      state: "IP",
      zip: "56789",
      country: "United States",
      ownerId: demoAdminId,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      annualRevenue: 7500000,
      employeeCount: 450,
      notes: "Manufacturing company looking for supply chain management",
      isActive: true,
      type: "Customer"
    }
  ];
  
  const seededAccounts = await db.insert(accounts).values(demoAccountsData).returning();
  console.log(`Created ${seededAccounts.length} demo accounts`);

  // Seed contacts for the accounts
  const demoContactsData = [
    {
      firstName: "John",
      lastName: "DemoContact",
      email: "john@acme-demo.example.com",
      phone: "123-456-7890",
      title: "Chief Technology Officer",
      accountId: seededAccounts[0].id,
      ownerId: demoAdminId,
      createdAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
      notes: "Primary technical contact",
      address: "123 Demo Street, Suite 100",
      city: "Demo City",
      state: "DS",
      zip: "12345",
      country: "United States",
      isActive: true,
      leadSource: "Website",
    },
    {
      firstName: "Sarah",
      lastName: "DemoManager",
      email: "sarah@acme-demo.example.com",
      phone: "123-456-7891",
      title: "Project Manager",
      accountId: seededAccounts[0].id,
      ownerId: demoAdminId,
      createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      notes: "Project implementation contact",
      address: "123 Demo Street, Suite 100",
      city: "Demo City",
      state: "DS",
      zip: "12345",
      country: "United States",
      isActive: true,
      leadSource: "Referral",
    },
    {
      firstName: "Michael",
      lastName: "DemoTech",
      email: "michael@techdemo.example.com",
      phone: "234-567-8901",
      title: "Technical Director",
      accountId: seededAccounts[1].id,
      ownerId: demoAdminId,
      createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
      notes: "Main technical decision maker",
      address: "456 Demo Avenue",
      city: "Example Town",
      state: "ET",
      zip: "67890",
      country: "United States",
      isActive: true,
      leadSource: "Conference",
    },
    {
      firstName: "Emily",
      lastName: "DemoHealth",
      email: "emily@demohealthcare.example.com",
      phone: "345-678-9012",
      title: "Director of IT",
      accountId: seededAccounts[2].id,
      ownerId: demoUserId,
      createdAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
      notes: "IT department head, handles all technology procurement",
      address: "789 Medical Drive",
      city: "Healthcare City",
      state: "HC",
      zip: "34567",
      country: "United States",
      isActive: true,
      leadSource: "LinkedIn",
    },
    {
      firstName: "Robert",
      lastName: "DemoFinance",
      email: "robert@demofinance.example.com",
      phone: "456-789-0123",
      title: "CFO",
      accountId: seededAccounts[3].id,
      ownerId: demoUserId,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      notes: "Financial decision maker",
      address: "101 Banking Blvd",
      city: "Finance City",
      state: "FC",
      zip: "45678",
      country: "United States",
      isActive: true,
      leadSource: "Cold Call",
    },
    {
      firstName: "Jennifer",
      lastName: "DemoManufacturing",
      email: "jennifer@demomanufacturing.example.com",
      phone: "567-890-1234",
      title: "Operations Director",
      accountId: seededAccounts[4].id,
      ownerId: demoAdminId,
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      notes: "Handles operations and supply chain",
      address: "202 Factory Lane",
      city: "Industrial Park",
      state: "IP",
      zip: "56789",
      country: "United States",
      isActive: true,
      leadSource: "Webinar",
    },
    {
      firstName: "David",
      lastName: "DemoManufacturing",
      email: "david@demomanufacturing.example.com",
      phone: "567-890-1235",
      title: "Procurement Manager",
      accountId: seededAccounts[4].id,
      ownerId: demoAdminId,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      notes: "Handles purchasing decisions",
      address: "202 Factory Lane",
      city: "Industrial Park",
      state: "IP",
      zip: "56789",
      country: "United States",
      isActive: true,
      leadSource: "Trade Show",
    }
  ];
  
  const seededContacts = await db.insert(contacts).values(demoContactsData).returning();
  console.log(`Created ${seededContacts.length} demo contacts`);

  // Seed leads
  const demoLeadsData = [
    {
      firstName: "Alex",
      lastName: "DemoLead",
      email: "alex@newprospect.example.com",
      phone: "678-901-2345",
      company: "New Prospect LLC",
      title: "Director of Sales",
      status: "New",
      source: "Website",
      ownerId: demoAdminId,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      notes: "Interested in our CRM solution",
      estimatedValue: 25000,
      isConverted: false
    },
    {
      firstName: "Patricia",
      lastName: "DemoLead",
      email: "patricia@growthco.example.com",
      phone: "789-012-3456",
      company: "Growth Company Inc",
      title: "CEO",
      status: "Contacted",
      source: "Referral",
      ownerId: demoAdminId,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      notes: "CEO of a growing startup, looking for CRM with marketing features",
      estimatedValue: 50000,
      isConverted: false
    },
    {
      firstName: "Marcus",
      lastName: "DemoLead",
      email: "marcus@techstartup.example.com",
      phone: "890-123-4567",
      company: "Tech Startup XYZ",
      title: "Founder",
      status: "Qualified",
      source: "LinkedIn",
      ownerId: demoUserId,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      notes: "Startup founder looking for scalable CRM solution",
      estimatedValue: 35000,
      isConverted: false
    },
    {
      firstName: "Laura",
      lastName: "DemoLead",
      email: "laura@retailcorp.example.com",
      phone: "901-234-5678",
      company: "Retail Corp",
      title: "Head of Marketing",
      status: "Unqualified",
      source: "Cold Call",
      ownerId: demoUserId,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      notes: "Not a good fit for our solution at this time",
      estimatedValue: 15000,
      isConverted: false
    }
  ];
  
  const seededLeads = await db.insert(leads).values(demoLeadsData).returning();
  console.log(`Created ${seededLeads.length} demo leads`);

  // Seed opportunities
  const demoOpportunitiesData = [
    {
      name: "Acme Demo - Enterprise CRM Implementation",
      accountId: seededAccounts[0].id,
      amount: 75000,
      stage: "Proposal",
      probability: 70,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in future
      ownerId: demoAdminId,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      notes: "Enterprise-wide CRM implementation with custom modules",
      isClosed: false,
      isWon: false
    },
    {
      name: "TechDemo - Annual Subscription",
      accountId: seededAccounts[1].id,
      amount: 45000,
      stage: "Negotiation",
      probability: 85,
      expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days in future
      ownerId: demoAdminId,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      notes: "Annual subscription with premium support package",
      isClosed: false,
      isWon: false
    },
    {
      name: "Healthcare - Patient Management Module",
      accountId: seededAccounts[2].id,
      amount: 120000,
      stage: "Qualification",
      probability: 50,
      expectedCloseDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days in future
      ownerId: demoUserId,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      notes: "Custom healthcare patient management module development",
      isClosed: false,
      isWon: false
    },
    {
      name: "Finance - Banking CRM Solution",
      accountId: seededAccounts[3].id,
      amount: 200000,
      stage: "Lead Generation",
      probability: 30,
      expectedCloseDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days in future
      ownerId: demoUserId,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      notes: "Complete banking CRM solution with compliance features",
      isClosed: false,
      isWon: false
    },
    {
      name: "Manufacturing - Supply Chain Integration",
      accountId: seededAccounts[4].id,
      amount: 85000,
      stage: "Closing",
      probability: 95,
      expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in future
      ownerId: demoAdminId,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      notes: "CRM integration with existing supply chain management system",
      isClosed: false,
      isWon: false
    },
    {
      name: "Acme Demo - Training Package",
      accountId: seededAccounts[0].id,
      amount: 25000,
      stage: "Closing",
      probability: 100,
      expectedCloseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      ownerId: demoAdminId,
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      notes: "Staff training package for CRM implementation",
      isClosed: true,
      isWon: true
    }
  ];
  
  const seededOpportunities = await db.insert(opportunities).values(demoOpportunitiesData).returning();
  console.log(`Created ${seededOpportunities.length} demo opportunities`);

  // Seed tasks
  const demoTasksData = [
    {
      title: "Follow up on proposal",
      description: "Send updated pricing and terms to the client",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days in future
      priority: "High",
      status: "Open",
      assignedTo: demoAdminId,
      relatedToType: "opportunity",
      relatedToId: seededOpportunities[0].id,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      completedAt: null
    },
    {
      title: "Schedule product demo",
      description: "Arrange a product demonstration for the technical team",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days in future
      priority: "Medium",
      status: "Open",
      assignedTo: demoAdminId,
      relatedToType: "opportunity",
      relatedToId: seededOpportunities[1].id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedAt: null
    },
    {
      title: "Prepare requirements document",
      description: "Create detailed requirements documentation for the custom module",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in future
      priority: "Medium",
      status: "Open",
      assignedTo: demoUserId,
      relatedToType: "opportunity",
      relatedToId: seededOpportunities[2].id,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      completedAt: null
    },
    {
      title: "Initial discovery call",
      description: "Conduct initial discovery call to understand requirements",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days in future
      priority: "High",
      status: "Open",
      assignedTo: demoUserId,
      relatedToType: "opportunity",
      relatedToId: seededOpportunities[3].id,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      completedAt: null
    },
    {
      title: "Finalize contract",
      description: "Review and finalize contract terms",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day in future
      priority: "High",
      status: "Open",
      assignedTo: demoAdminId,
      relatedToType: "opportunity",
      relatedToId: seededOpportunities[4].id,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      completedAt: null
    },
    {
      title: "Prepare training materials",
      description: "Create custom training materials for the client's team",
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      priority: "Medium",
      status: "Completed",
      assignedTo: demoAdminId,
      relatedToType: "opportunity",
      relatedToId: seededOpportunities[5].id,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
    },
    {
      title: "Contact new lead",
      description: "Make initial contact with new lead",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day in future
      priority: "High",
      status: "Open",
      assignedTo: demoAdminId,
      relatedToType: "lead",
      relatedToId: seededLeads[0].id,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      completedAt: null
    },
    {
      title: "Qualify new lead",
      description: "Determine if lead meets our target customer profile",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days in future
      priority: "Medium",
      status: "Open",
      assignedTo: demoAdminId,
      relatedToType: "lead",
      relatedToId: seededLeads[1].id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedAt: null
    }
  ];
  
  const seededTasks = await db.insert(tasks).values(demoTasksData).returning();
  console.log(`Created ${seededTasks.length} demo tasks`);

  // Seed events
  const demoEventsData = [
    {
      title: "Proposal Review Meeting",
      description: "Review the proposal with the client's executive team",
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days in future
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours duration
      location: "Virtual / Zoom",
      organizer: demoAdminId,
      attendees: "1, 2, 3",
      relatedToType: "opportunity",
      relatedToId: seededOpportunities[0].id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isAllDay: false,
      status: "Scheduled"
    },
    {
      title: "Product Demo",
      description: "Demonstrate our product's key features",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in future
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours duration
      location: "Client's Office",
      organizer: demoAdminId,
      attendees: "1, 2",
      relatedToType: "opportunity",
      relatedToId: seededOpportunities[1].id,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isAllDay: false,
      status: "Scheduled"
    },
    {
      title: "Requirements Workshop",
      description: "Gather detailed requirements for the custom development",
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days in future
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 6 hours duration
      location: "Our Office",
      organizer: demoUserId,
      attendees: "1, 3, 4",
      relatedToType: "opportunity",
      relatedToId: seededOpportunities[2].id,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isAllDay: true,
      status: "Scheduled"
    },
    {
      title: "Discovery Call",
      description: "Initial discovery call with the prospect",
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days in future
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000), // 1 hour duration
      location: "Phone Call",
      organizer: demoUserId,
      attendees: "4",
      relatedToType: "lead",
      relatedToId: seededLeads[0].id,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      isAllDay: false,
      status: "Scheduled"
    },
    {
      title: "Contract Signing",
      description: "Final contract signing meeting",
      startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day in future
      endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours duration
      location: "Client's Office",
      organizer: demoAdminId,
      attendees: "1, 2, 3",
      relatedToType: "opportunity",
      relatedToId: seededOpportunities[4].id,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isAllDay: false,
      status: "Scheduled"
    },
    {
      title: "Training Session",
      description: "Staff training on CRM usage",
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours duration
      location: "Client's Office",
      organizer: demoAdminId,
      attendees: "1, 2, 3",
      relatedToType: "opportunity",
      relatedToId: seededOpportunities[5].id,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      isAllDay: false,
      status: "Completed"
    }
  ];
  
  const seededEvents = await db.insert(events).values(demoEventsData).returning();
  console.log(`Created ${seededEvents.length} demo events`);

  // Seed activities
  const demoActivitiesData = [
    {
      userId: demoAdminId,
      action: "Created an opportunity",
      entityType: "opportunity",
      entityId: seededOpportunities[0].id,
      details: "Created new opportunity: Enterprise CRM Implementation",
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
    },
    {
      userId: demoAdminId,
      action: "Updated an opportunity",
      entityType: "opportunity",
      entityId: seededOpportunities[0].id,
      details: "Updated opportunity stage to Proposal",
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    },
    {
      userId: demoAdminId,
      action: "Scheduled a meeting",
      entityType: "opportunity",
      entityId: seededOpportunities[0].id,
      details: "Scheduled proposal review meeting",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      userId: demoAdminId,
      action: "Made a call",
      entityType: "contact",
      entityId: seededContacts[0].id,
      details: "Discussed proposal details",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    {
      userId: demoAdminId,
      action: "Sent an email",
      entityType: "contact",
      entityId: seededContacts[0].id,
      details: "Sent follow-up email with additional information",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      userId: demoAdminId,
      action: "Created a task",
      entityType: "opportunity",
      entityId: seededOpportunities[0].id,
      details: "Created task: Follow up on proposal",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      userId: demoUserId,
      action: "Created a lead",
      entityType: "lead",
      entityId: seededLeads[2].id,
      details: "Added new lead: Marcus DemoLead",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    },
    {
      userId: demoUserId,
      action: "Made a call",
      entityType: "lead",
      entityId: seededLeads[2].id,
      details: "Initial qualification call",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      userId: demoUserId,
      action: "Updated a lead",
      entityType: "lead",
      entityId: seededLeads[2].id,
      details: "Updated lead status to Qualified",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      userId: demoUserId,
      action: "Created an opportunity",
      entityType: "opportunity",
      entityId: seededOpportunities[2].id,
      details: "Created new opportunity: Patient Management Module",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      userId: demoAdminId,
      action: "Won an opportunity",
      entityType: "opportunity",
      entityId: seededOpportunities[5].id,
      details: "Opportunity marked as won: Training Package",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      userId: demoAdminId,
      action: "Completed a task",
      entityType: "task",
      entityId: seededTasks[5].id,
      details: "Completed task: Prepare training materials",
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
    }
  ];
  
  const seededActivities = await db.insert(activities).values(demoActivitiesData).returning();
  console.log(`Created ${seededActivities.length} demo activities`);

  console.log("\nDemo accounts setup completed successfully!");
  console.log("\nDemo Admin Credentials:");
  console.log("Username: demoadmin");
  console.log("Password: demoadmin123");
  console.log("\nDemo User Credentials:");
  console.log("Username: demouser");
  console.log("Password: demouser123");
}

// Run the script
createDemoAccounts()
  .catch(e => {
    console.error("Error creating demo accounts:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });