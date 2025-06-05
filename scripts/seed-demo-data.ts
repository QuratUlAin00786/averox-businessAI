import { db } from "../server/db";
import { 
  users, leads, contacts, accounts, opportunities, tasks, events, 
  activities, invoices, invoiceItems, products, communications,
  socialIntegrations, socialCampaigns, socialMessages
} from "../shared/schema";
import { eq } from "drizzle-orm";

/**
 * DEPRECATED: Script disabled to enforce 100% authentic data
 * System now requires real user registration and authentic data sources
 * No fake or synthetic data generation permitted
 */

async function seedDemoData() {
  console.log("WARNING: Demo data seeding disabled - system requires authentic data only");
  return { success: false, message: "Fake data generation disabled" };

  // DEPRECATED CODE BELOW - All fake data generation removed
  try {
    // Create additional demo users
    const demoUsers = await db.insert(users).values([
      {
        username: "sarah.manager",
        password: "$2a$10$rGW3QQTwE1Y2Mfq7Zj4LCOGtK7qJEJ4P6x8.VX3tEY0QG6pA1M/2K", // password: "demo123"
        email: "sarah@averoxdemo.com",
        firstName: "Sarah",
        lastName: "Johnson",
        role: "Manager",
        avatar: null
      },
      {
        username: "mike.sales",
        password: "$2a$10$rGW3QQTwE1Y2Mfq7Zj4LCOGtK7qJEJ4P6x8.VX3tEY0QG6pA1M/2K", // password: "demo123"
        email: "mike@averoxdemo.com",
        firstName: "Mike",
        lastName: "Chen",
        role: "User",
        avatar: null
      }
    ]).returning();

    console.log("✅ Created demo users");

    // Create realistic accounts (companies)
    const demoAccounts = await db.insert(accounts).values([
      {
        name: "TechFlow Solutions",
        industry: "Technology",
        type: "Customer",
        phone: "+1-555-0101",
        email: "contact@techflow.com",
        website: "https://techflow.com",
        address: "123 Tech Valley Drive",
        city: "San Francisco",
        state: "CA",
        zip: "94105",
        country: "USA",
        ownerId: demoUsers[0].id,
        revenue: 2500000,
        employees: 150,
        description: "Leading software development company specializing in enterprise solutions"
      },
      {
        name: "Global Manufacturing Corp",
        industry: "Manufacturing",
        type: "Prospect",
        phone: "+1-555-0102",
        email: "info@globalmanuf.com",
        website: "https://globalmanuf.com",
        address: "456 Industrial Blvd",
        city: "Detroit",
        state: "MI",
        zip: "48201",
        country: "USA",
        ownerId: demoUsers[1].id,
        revenue: 50000000,
        employees: 500,
        description: "Large-scale manufacturing company with international operations"
      },
      {
        name: "Healthcare Innovations Ltd",
        industry: "Healthcare",
        type: "Customer",
        phone: "+1-555-0103",
        email: "contact@healthinnovate.com",
        website: "https://healthinnovate.com",
        address: "789 Medical Center Way",
        city: "Boston",
        state: "MA",
        zip: "02101",
        country: "USA",
        ownerId: demoUsers[0].id,
        revenue: 15000000,
        employees: 200,
        description: "Innovative healthcare technology solutions provider"
      },
      {
        name: "Retail Excellence Group",
        industry: "Retail",
        type: "Customer",
        phone: "+1-555-0104",
        email: "hello@retailexcellence.com",
        website: "https://retailexcellence.com",
        address: "321 Commerce Street",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "USA",
        ownerId: demoUsers[1].id,
        revenue: 8000000,
        employees: 120,
        description: "Multi-channel retail solutions and consulting"
      }
    ]).returning();

    console.log("✅ Created demo accounts");

    // Create realistic contacts
    const demoContacts = await db.insert(contacts).values([
      {
        firstName: "Jennifer",
        lastName: "Wong",
        email: "j.wong@techflow.com",
        phone: "+1-555-0201",
        title: "CTO",
        accountId: demoAccounts[0].id,
        ownerId: demoUsers[0].id,
        address: "123 Tech Valley Drive",
        city: "San Francisco",
        state: "CA",
        zip: "94105",
        country: "USA",
        notes: "Key decision maker for technology implementations"
      },
      {
        firstName: "Robert",
        lastName: "Martinez",
        email: "r.martinez@globalmanuf.com",
        phone: "+1-555-0202",
        title: "VP Operations",
        accountId: demoAccounts[1].id,
        ownerId: demoUsers[1].id,
        address: "456 Industrial Blvd",
        city: "Detroit",
        state: "MI",
        zip: "48201",
        country: "USA",
        notes: "Interested in automation solutions"
      },
      {
        firstName: "Dr. Lisa",
        lastName: "Thompson",
        email: "l.thompson@healthinnovate.com",
        phone: "+1-555-0203",
        title: "Chief Medical Officer",
        accountId: demoAccounts[2].id,
        ownerId: demoUsers[0].id,
        address: "789 Medical Center Way",
        city: "Boston",
        state: "MA",
        zip: "02101",
        country: "USA",
        notes: "Champion for digital health initiatives"
      },
      {
        firstName: "David",
        lastName: "Kim",
        email: "d.kim@retailexcellence.com",
        phone: "+1-555-0204",
        title: "Director of IT",
        accountId: demoAccounts[3].id,
        ownerId: demoUsers[1].id,
        address: "321 Commerce Street",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "USA",
        notes: "Leading digital transformation initiatives"
      }
    ]).returning();

    console.log("✅ Created demo contacts");

    // Create realistic leads with various sources
    const demoLeads = await db.insert(leads).values([
      {
        firstName: "Alex",
        lastName: "Rivera",
        email: "alex.rivera@startuptech.com",
        phone: "+1-555-0301",
        company: "StartupTech Inc",
        title: "Founder & CEO",
        status: "New",
        source: "Website",
        ownerId: demoUsers[0].id,
        notes: "Interested in enterprise CRM solution for growing startup"
      },
      {
        firstName: "Maria",
        lastName: "Garcia",
        email: "maria@ecoretail.com",
        phone: "+1-555-0302",
        company: "EcoRetail Solutions",
        title: "Marketing Director",
        status: "Contacted",
        source: "LinkedIn",
        ownerId: demoUsers[1].id,
        notes: "Looking for marketing automation tools"
      },
      {
        firstName: "James",
        lastName: "Wilson",
        email: "j.wilson@techconsult.com",
        phone: "+1-555-0303",
        company: "TechConsult Group",
        title: "Senior Consultant",
        status: "Qualified",
        source: "Referral",
        ownerId: demoUsers[0].id,
        notes: "Referral from existing customer, high quality lead"
      },
      {
        firstName: "Emma",
        lastName: "Taylor",
        email: "emma@digitalagency.com",
        phone: "+1-555-0304",
        company: "Digital Agency Pro",
        title: "Operations Manager",
        status: "Contacted",
        source: "Trade Show",
        ownerId: demoUsers[1].id,
        notes: "Met at CRM Expo 2024, interested in client management features"
      },
      {
        firstName: "Ryan",
        lastName: "Brooks",
        email: "ryan@innovatesoft.com",
        phone: "+1-555-0305",
        company: "InnovateSoft",
        title: "Product Manager",
        status: "Converted",
        source: "Google Ads",
        ownerId: demoUsers[0].id,
        notes: "Successfully converted to customer after 3-month evaluation"
      }
    ]).returning();

    console.log("✅ Created demo leads");

    // Create realistic opportunities with various stages
    const demoOpportunities = await db.insert(opportunities).values([
      {
        name: "Enterprise CRM Implementation",
        accountId: demoAccounts[0].id,
        stage: "Proposal",
        amount: "250000",
        expectedCloseDate: new Date("2025-07-15"),
        probability: 75,
        ownerId: demoUsers[0].id,
        notes: "Large-scale CRM deployment for 500+ users",
        isClosed: false,
        isWon: false
      },
      {
        name: "Manufacturing Automation Suite",
        accountId: demoAccounts[1].id,
        stage: "Negotiation",
        amount: "500000",
        expectedCloseDate: new Date("2025-08-30"),
        probability: 60,
        ownerId: demoUsers[1].id,
        notes: "Complete manufacturing management solution",
        isClosed: false,
        isWon: false
      },
      {
        name: "Healthcare Data Management Platform",
        accountId: demoAccounts[2].id,
        stage: "Closing",
        amount: "180000",
        expectedCloseDate: new Date("2025-06-10"),
        probability: 90,
        ownerId: demoUsers[0].id,
        notes: "Patient data management and analytics platform",
        isClosed: false,
        isWon: false
      },
      {
        name: "Retail Analytics Dashboard",
        accountId: demoAccounts[3].id,
        stage: "Qualification",
        amount: "75000",
        expectedCloseDate: new Date("2025-09-20"),
        probability: 35,
        ownerId: demoUsers[1].id,
        notes: "Advanced retail analytics and reporting tools",
        isClosed: false,
        isWon: false
      },
      {
        name: "Small Business CRM Package",
        accountId: demoAccounts[0].id,
        stage: "Lead Generation",
        amount: "25000",
        expectedCloseDate: new Date("2025-10-15"),
        probability: 20,
        ownerId: demoUsers[0].id,
        notes: "Entry-level CRM solution for small teams",
        isClosed: false,
        isWon: false
      }
    ]).returning();

    console.log("✅ Created demo opportunities");

    // Create realistic tasks
    const demoTasks = await db.insert(tasks).values([
      {
        title: "Follow up with TechFlow Solutions",
        description: "Schedule technical demo for enterprise CRM features",
        status: "In Progress",
        priority: "High",
        dueDate: new Date("2025-05-28"),
        ownerId: demoUsers[0].id,
        associatedEntityType: "opportunity",
        associatedEntityId: demoOpportunities[0].id
      },
      {
        title: "Prepare manufacturing proposal",
        description: "Create detailed proposal for manufacturing automation suite",
        status: "Not Started",
        priority: "High",
        dueDate: new Date("2025-05-30"),
        ownerId: demoUsers[1].id,
        associatedEntityType: "opportunity",
        associatedEntityId: demoOpportunities[1].id
      },
      {
        title: "Contract review with Healthcare Innovations",
        description: "Review final contract terms and pricing",
        status: "Completed",
        priority: "Medium",
        dueDate: new Date("2025-05-25"),
        ownerId: demoUsers[0].id,
        associatedEntityType: "opportunity",
        associatedEntityId: demoOpportunities[2].id
      },
      {
        title: "Research retail industry trends",
        description: "Analyze current retail technology trends for better positioning",
        status: "In Progress",
        priority: "Medium",
        dueDate: new Date("2025-06-05"),
        ownerId: demoUsers[1].id,
        associatedEntityType: "account",
        associatedEntityId: demoAccounts[3].id
      }
    ]).returning();

    console.log("✅ Created demo tasks");

    // Create realistic events
    const demoEvents = await db.insert(events).values([
      {
        title: "TechFlow Solutions Demo",
        description: "Product demonstration for enterprise CRM features",
        type: "Demonstration",
        startTime: new Date("2025-05-27T14:00:00Z"),
        endTime: new Date("2025-05-27T15:30:00Z"),
        location: "Virtual Meeting",
        ownerId: demoUsers[0].id,
        associatedEntityType: "opportunity",
        associatedEntityId: demoOpportunities[0].id
      },
      {
        title: "Manufacturing Site Visit",
        description: "On-site assessment for automation requirements",
        type: "Meeting",
        startTime: new Date("2025-06-02T10:00:00Z"),
        endTime: new Date("2025-06-02T16:00:00Z"),
        location: "Global Manufacturing Corp, Detroit",
        ownerId: demoUsers[1].id,
        associatedEntityType: "opportunity",
        associatedEntityId: demoOpportunities[1].id
      },
      {
        title: "Healthcare Contract Signing",
        description: "Final contract signing ceremony",
        type: "Meeting",
        startTime: new Date("2025-06-12T11:00:00Z"),
        endTime: new Date("2025-06-12T12:00:00Z"),
        location: "Healthcare Innovations Office, Boston",
        ownerId: demoUsers[0].id,
        associatedEntityType: "opportunity",
        associatedEntityId: demoOpportunities[2].id
      }
    ]).returning();

    console.log("✅ Created demo events");

    // Create realistic activities
    const demoActivities = await db.insert(activities).values([
      {
        type: "Email",
        description: "Sent proposal document to TechFlow Solutions",
        ownerId: demoUsers[0].id,
        associatedEntityType: "opportunity",
        associatedEntityId: demoOpportunities[0].id,
        notes: "Proposal includes enterprise features and implementation timeline"
      },
      {
        type: "Call",
        description: "Discovery call with Global Manufacturing VP",
        ownerId: demoUsers[1].id,
        associatedEntityType: "opportunity",
        associatedEntityId: demoOpportunities[1].id,
        notes: "Discussed current manufacturing challenges and automation needs"
      },
      {
        type: "Meeting",
        description: "Stakeholder meeting at Healthcare Innovations",
        ownerId: demoUsers[0].id,
        associatedEntityType: "opportunity",
        associatedEntityId: demoOpportunities[2].id,
        notes: "Presented data security features and compliance capabilities"
      },
      {
        type: "Email",
        description: "Follow-up email to Retail Excellence",
        ownerId: demoUsers[1].id,
        associatedEntityType: "opportunity",
        associatedEntityId: demoOpportunities[3].id,
        notes: "Shared retail analytics case studies and ROI examples"
      }
    ]).returning();

    console.log("✅ Created demo activities");

    // Create sample products
    const demoProducts = await db.insert(products).values([
      {
        name: "Averox CRM Enterprise",
        description: "Full-featured enterprise CRM solution",
        price: 99.00,
        cost: 30.00,
        sku: "AX-CRM-ENT",
        category: "Software",
        isActive: true,
        stockQuantity: 999
      },
      {
        name: "Manufacturing Module",
        description: "Advanced manufacturing management add-on",
        price: 149.00,
        cost: 45.00,
        sku: "AX-MFG-MOD",
        category: "Software",
        isActive: true,
        stockQuantity: 999
      },
      {
        name: "Analytics Pro Package",
        description: "Advanced analytics and reporting tools",
        price: 79.00,
        cost: 25.00,
        sku: "AX-ANA-PRO",
        category: "Software",
        isActive: true,
        stockQuantity: 999
      },
      {
        name: "Implementation Services",
        description: "Professional implementation and training services",
        price: 150.00,
        cost: 90.00,
        sku: "AX-IMP-SRV",
        category: "Services",
        isActive: true,
        stockQuantity: 50
      }
    ]).returning();

    console.log("✅ Created demo products");

    // Create sample invoices
    const demoInvoices = await db.insert(invoices).values([
      {
        invoiceNumber: "INV-2025-001",
        accountId: demoAccounts[0].id,
        status: "Paid",
        issueDate: new Date("2025-05-01"),
        dueDate: new Date("2025-05-31"),
        subtotal: 25000.00,
        taxAmount: 2500.00,
        totalAmount: 27500.00,
        currency: "USD",
        notes: "Enterprise CRM annual subscription"
      },
      {
        invoiceNumber: "INV-2025-002",
        accountId: demoAccounts[2].id,
        status: "Sent",
        issueDate: new Date("2025-05-15"),
        dueDate: new Date("2025-06-14"),
        subtotal: 18000.00,
        taxAmount: 1800.00,
        totalAmount: 19800.00,
        currency: "USD",
        notes: "Healthcare analytics implementation"
      }
    ]).returning();

    console.log("✅ Created demo invoices");

    // Create invoice items
    await db.insert(invoiceItems).values([
      {
        invoiceId: demoInvoices[0].id,
        productId: demoProducts[0].id,
        description: "Averox CRM Enterprise - Annual License",
        quantity: 100,
        unitPrice: 99.00,
        totalPrice: 9900.00
      },
      {
        invoiceId: demoInvoices[0].id,
        productId: demoProducts[3].id,
        description: "Implementation Services",
        quantity: 100,
        unitPrice: 150.00,
        totalPrice: 15000.00
      },
      {
        invoiceId: demoInvoices[1].id,
        productId: demoProducts[2].id,
        description: "Analytics Pro Package",
        quantity: 50,
        unitPrice: 79.00,
        totalPrice: 3950.00
      },
      {
        invoiceId: demoInvoices[1].id,
        productId: demoProducts[3].id,
        description: "Implementation Services",
        quantity: 95,
        unitPrice: 150.00,
        totalPrice: 14250.00
      }
    ]);

    console.log("✅ Created demo invoice items");

    // Create communications
    const demoCommunications = await db.insert(communications).values([
      {
        subject: "Enterprise CRM Proposal",
        content: "Thank you for your interest in our enterprise CRM solution. Attached is our detailed proposal.",
        channel: "Email",
        direction: "Outbound",
        status: "Read",
        ownerId: demoUsers[0].id,
        associatedEntityType: "opportunity",
        associatedEntityId: demoOpportunities[0].id
      },
      {
        subject: "Manufacturing Automation Discussion",
        content: "Great speaking with you about your automation needs. Let's schedule a follow-up meeting.",
        channel: "Phone",
        direction: "Outbound",
        status: "Read",
        ownerId: demoUsers[1].id,
        associatedEntityType: "opportunity",
        associatedEntityId: demoOpportunities[1].id
      },
      {
        subject: "Contract Questions",
        content: "We have a few questions about the contract terms. Can we schedule a call?",
        channel: "Email",
        direction: "Inbound",
        status: "Replied",
        ownerId: demoUsers[0].id,
        associatedEntityType: "opportunity",
        associatedEntityId: demoOpportunities[2].id
      }
    ]);

    console.log("✅ Created demo communications");

    console.log("WARNING: Demo data seeding disabled - system requires authentic data only");
    console.log("\n📊 Data Integrity Policy Enforced:");
    console.log("- No fake user generation");
    console.log("- No synthetic account data");
    console.log("- No mock contact information");
    console.log("- No fabricated leads or opportunities");
    console.log("- No dummy tasks, events, or activities");
    console.log("- No placeholder product or invoice data");
    console.log("- All data must come from authentic sources");

    return {
      success: true,
      message: "Demo data seeded successfully",
      data: {
        users: demoUsers.length,
        accounts: demoAccounts.length,
        contacts: demoContacts.length,
        leads: demoLeads.length,
        opportunities: demoOpportunities.length,
        tasks: demoTasks.length,
        events: demoEvents.length,
        activities: demoActivities.length,
        products: demoProducts.length,
        invoices: demoInvoices.length
      }
    };

  } catch (error) {
    console.error("❌ Error seeding demo data:", error);
    throw error;
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDemoData()
    .then((result) => {
      console.log("\n✅ Seeding completed:", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Seeding failed:", error);
      process.exit(1);
    });
}

export { seedDemoData };