import { db } from "../server/db";
import { subscriptionPackages, type InsertSubscriptionPackage } from "../shared/schema";
import { eq } from "drizzle-orm";

export async function initDatabase() {
  console.log("Initializing database with default data...");
  
  // Check if we need to add subscription packages
  const existingPackages = await db.select().from(subscriptionPackages);
  
  if (existingPackages.length === 0) {
    console.log("Creating default subscription packages...");
    await createDefaultSubscriptionPackages();
  } else {
    console.log(`Found ${existingPackages.length} existing subscription packages`);
  }

  // Add an admin user if no users exist
  const userCount = await db.execute(`SELECT COUNT(*) FROM users`);
  const count = parseInt(userCount.rows[0].count as string, 10);

  if (count === 0) {
    console.log("Creating default admin user...");
    await createDefaultAdminUser();
  } else {
    console.log(`Found ${count} existing users`);
  }
  
  console.log("Database initialization complete!");
}

async function createDefaultSubscriptionPackages() {
  const packages: InsertSubscriptionPackage[] = [
    {
      name: "Starter",
      description: "Basic CRM for small businesses",
      price: "29.99",
      interval: "monthly",
      features: ["Contact Management", "Lead Tracking", "Task Management", "Basic Reports"],
      maxUsers: 2,
      maxContacts: 500,
      maxStorage: 5,
      isActive: true,
      displayOrder: 1,
    },
    {
      name: "Professional",
      description: "Advanced CRM with sales automation",
      price: "59.99",
      interval: "monthly",
      features: ["Everything in Starter", "Opportunity Management", "Sales Automation", "Advanced Reports", "Calendar Integration"],
      maxUsers: 5,
      maxContacts: 2500,
      maxStorage: 20,
      isActive: true,
      displayOrder: 2,
    },
    {
      name: "Enterprise",
      description: "Complete CRM solution with AI insights",
      price: "99.99",
      interval: "monthly",
      features: ["Everything in Professional", "AI-Powered Insights", "Custom Reports", "Workflow Automation", "API Access"],
      maxUsers: 10,
      maxContacts: 10000,
      maxStorage: 50,
      isActive: true,
      displayOrder: 3,
    },
    {
      name: "Starter Annual",
      description: "Basic CRM for small businesses (annual billing)",
      price: "299.99",
      interval: "yearly",
      features: ["Contact Management", "Lead Tracking", "Task Management", "Basic Reports"],
      maxUsers: 2,
      maxContacts: 500,
      maxStorage: 5,
      isActive: true,
      displayOrder: 4,
    },
    {
      name: "Professional Annual",
      description: "Advanced CRM with sales automation (annual billing)",
      price: "599.99",
      interval: "yearly",
      features: ["Everything in Starter", "Opportunity Management", "Sales Automation", "Advanced Reports", "Calendar Integration"],
      maxUsers: 5,
      maxContacts: 2500,
      maxStorage: 20,
      isActive: true,
      displayOrder: 5,
    },
    {
      name: "Enterprise Annual",
      description: "Complete CRM solution with AI insights (annual billing)",
      price: "999.99",
      interval: "yearly",
      features: ["Everything in Professional", "AI-Powered Insights", "Custom Reports", "Workflow Automation", "API Access"],
      maxUsers: 10,
      maxContacts: 10000,
      maxStorage: 50,
      isActive: true,
      displayOrder: 6,
    },
  ];
  
  for (const pkg of packages) {
    await db.insert(subscriptionPackages).values(pkg);
  }
  
  console.log(`Created ${packages.length} subscription packages`);
}

async function createDefaultAdminUser() {
  // Create a default admin user with password hashing
  // In a real app, would use proper password hashing
  await db.execute(`
    INSERT INTO users (
      username, 
      password, 
      first_name, 
      last_name, 
      email, 
      role, 
      is_active, 
      is_verified
    ) VALUES (
      'admin',
      '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8.e5ac7b61e7a12f91f351bed4', -- password
      'Admin',
      'User',
      'admin@averox.com',
      'Admin',
      true,
      true
    )
  `);
  
  console.log("Created default admin user (username: admin, password: password)");
}

// Export the function to be used in server/index.ts
export default initDatabase;