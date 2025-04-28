import { db } from "./db";
import { users } from "../shared/schema";
import { hashPassword } from "./auth";
import { eq } from "drizzle-orm";

/**
 * Creates demo user accounts for the AVEROX CRM system
 * This script:
 * 1. Creates a demo admin account
 * 2. Creates a demo user account
 * 
 * To run this script: npx tsx server/create-demo-users.ts
 */
async function createDemoUsers() {
  console.log("Creating demo user accounts for the AVEROX CRM system...");

  // Check if demo admin account already exists
  const existingAdmin = await db.select().from(users).where(eq(users.username, 'demoadmin'));
  
  // Create demo admin account if it doesn't exist
  if (existingAdmin.length === 0) {
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
    
    console.log(`Created demo admin account with ID: ${demoAdmin.id}`);
  } else {
    console.log(`Demo admin account already exists with ID: ${existingAdmin[0].id}`);
  }

  // Check if demo user account already exists
  const existingUser = await db.select().from(users).where(eq(users.username, 'demouser'));
  
  // Create demo user account if it doesn't exist
  if (existingUser.length === 0) {
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
    
    console.log(`Created demo user account with ID: ${demoUser.id}`);
  } else {
    console.log(`Demo user account already exists with ID: ${existingUser[0].id}`);
  }

  console.log("\nDemo accounts creation completed!");
  console.log("\nDemo Admin Credentials:");
  console.log("Username: demoadmin");
  console.log("Password: demoadmin123");
  console.log("\nDemo User Credentials:");
  console.log("Username: demouser");
  console.log("Password: demouser123");
}

// Run the script
createDemoUsers()
  .catch(e => {
    console.error("Error creating demo users:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });