import { db } from "../server/db";
import { users, accounts, contacts, leads, opportunities, tasks, events, activities } from "../shared/schema";
import { hashPassword } from "../server/auth";
// Removed faker.js to enforce authentic data only

/**
 * DEPRECATED: This script contains faker.js generated data
 * System now enforces 100% authentic data only
 * Use real user registration and authentic data sources instead
 */
async function createDemoAccounts() {
  console.log("WARNING: Demo account creation disabled - system requires authentic data only");
  return { success: false, message: "Fake data generation disabled" };

  // Check if demo accounts already exist
  const existingAdmin = await db.select().from(users).where({ username: 'demoadmin' });
  const existingUser = await db.select().from(users).where({ username: 'demouser' });

  if (existingAdmin.length > 0 && existingUser.length > 0) {
    console.log("Demo accounts already exist. No action needed.");
    return;
  }

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
  }

  // If we already have data for both accounts, we can exit early
  const existingAccounts = await db.select().from(accounts).where({ ownerId: demoAdminId }).orWhere({ ownerId: demoUserId });
  if (existingAccounts.length >= 10) {
    console.log("Demo accounts already have sufficient data. No additional seeding needed.");
    return;
  }

  console.log("Populating demo accounts with sample data...");
  
  // Seed accounts for both users
  const demoAccountsData = [];
  for (let i = 0; i < 5; i++) {
    demoAccountsData.push({
      name: faker.company.name(),
      industry: faker.helpers.arrayElement(['Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Education']),
      website: faker.internet.url(),
      phone: faker.phone.number(),
      email: faker.internet.email(),
      billingAddress: faker.location.streetAddress(),
      billingCity: faker.location.city(),
      billingState: faker.location.state(),
      billingZip: faker.location.zipCode(),
      billingCountry: faker.location.country(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zip: faker.location.zipCode(),
      country: faker.location.country(),
      ownerId: i < 3 ? demoAdminId : demoUserId, // Assign 3 accounts to admin, 2 to user
      createdAt: faker.date.recent({ days: 30 }),
      annualRevenue: Number(faker.finance.amount(100000, 10000000, 2)),
      employeeCount: faker.number.int({ min: 10, max: 5000 }),
      notes: faker.lorem.paragraph(),
      isActive: true,
      type: faker.helpers.arrayElement(['Customer', 'Partner', 'Prospect', 'Vendor']),
    });
  }
  
  const seededAccounts = await db.insert(accounts).values(demoAccountsData).returning();
  console.log(`Created ${seededAccounts.length} demo accounts`);

  // Seed contacts for the accounts
  const demoContactsData = [];
  for (const account of seededAccounts) {
    // Generate 2-4 contacts per account
    const numContacts = faker.number.int({ min: 2, max: 4 });
    for (let i = 0; i < numContacts; i++) {
      demoContactsData.push({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        title: faker.person.jobTitle(),
        accountId: account.id,
        ownerId: account.ownerId,
        createdAt: faker.date.recent({ days: 20 }),
        notes: faker.lorem.paragraph(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zip: faker.location.zipCode(),
        country: faker.location.country(),
        isActive: true,
        leadSource: faker.helpers.arrayElement(['Website', 'Referral', 'LinkedIn', 'Conference', 'Cold Call']),
      });
    }
  }
  
  const seededContacts = await db.insert(contacts).values(demoContactsData).returning();
  console.log(`Created ${seededContacts.length} demo contacts`);

  // No demo leads created to maintain data integrity
  console.log('Demo lead creation skipped - maintaining data integrity policy');

  // Seed opportunities
  const demoOpportunitiesData = [];
  for (const account of seededAccounts) {
    // Generate 1-2 opportunities per account
    const numOpps = faker.number.int({ min: 1, max: 2 });
    for (let i = 0; i < numOpps; i++) {
      const isClosed = faker.datatype.boolean(0.3); // 30% chance of being closed
      const isWon = isClosed ? faker.datatype.boolean(0.7) : false; // 70% chance of won if closed
      
      demoOpportunitiesData.push({
        name: faker.helpers.arrayElement([
          `${account.name} - Product Implementation`,
          `${account.name} - Software License`,
          `${account.name} - Consulting Services`,
          `${account.name} - Maintenance Contract`,
          `${account.name} - System Upgrade`
        ]),
        accountId: account.id,
        amount: Number(faker.finance.amount(5000, 250000, 2)),
        stage: faker.helpers.arrayElement([
          'Lead Generation',
          'Qualification',
          'Proposal',
          'Negotiation',
          'Closing'
        ]),
        probability: faker.number.int({ min: 10, max: 100 }),
        expectedCloseDate: faker.date.future({ years: 0.5 }),
        ownerId: account.ownerId,
        createdAt: faker.date.recent({ days: 60 }),
        notes: faker.lorem.paragraph(),
        isClosed: isClosed,
        isWon: isWon,
        lostReason: isClosed && !isWon ? 
          faker.helpers.arrayElement(['Price', 'Competitor', 'No Budget', 'No Decision', 'Other']) : null,
      });
    }
  }
  
  const seededOpportunities = await db.insert(opportunities).values(demoOpportunitiesData).returning();
  console.log(`Created ${seededOpportunities.length} demo opportunities`);

  // Seed tasks
  const demoTasksData = [];
  const allEntities = [
    ...seededAccounts.map(a => ({ type: 'account', id: a.id, ownerId: a.ownerId })),
    ...seededLeads.map(l => ({ type: 'lead', id: l.id, ownerId: l.ownerId })),
    ...seededOpportunities.map(o => ({ type: 'opportunity', id: o.id, ownerId: o.ownerId })),
    ...seededContacts.map(c => ({ type: 'contact', id: c.id, ownerId: c.ownerId }))
  ];
  
  for (let i = 0; i < 15; i++) {
    const entity = faker.helpers.arrayElement(allEntities);
    const dueDate = faker.date.between({ from: new Date(), to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
    const isCompleted = faker.datatype.boolean(0.4); // 40% chance of being completed
    
    demoTasksData.push({
      title: faker.helpers.arrayElement([
        'Follow up on proposal',
        'Schedule product demo',
        'Send pricing information',
        'Update contact information',
        'Prepare presentation',
        'Conduct discovery call',
        'Review contract terms',
        'Send meeting notes',
        'Check on implementation progress',
        'Send thank you email'
      ]),
      description: faker.lorem.paragraph(),
      dueDate: dueDate,
      priority: faker.helpers.arrayElement(['High', 'Medium', 'Low']),
      status: isCompleted ? 'Completed' : 'Open',
      assignedTo: entity.ownerId,
      relatedToType: entity.type,
      relatedToId: entity.id,
      createdAt: faker.date.recent({ days: 10 }),
      completedAt: isCompleted ? new Date() : null,
    });
  }
  
  const seededTasks = await db.insert(tasks).values(demoTasksData).returning();
  console.log(`Created ${seededTasks.length} demo tasks`);

  // Seed events/meetings
  const demoEventsData = [];
  for (let i = 0; i < 10; i++) {
    const entity = faker.helpers.arrayElement(allEntities);
    const startDate = faker.date.between({ 
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
      to: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) 
    });
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + faker.number.int({ min: 1, max: 3 }));
    
    demoEventsData.push({
      title: faker.helpers.arrayElement([
        'Kickoff meeting',
        'Product demo',
        'Contract negotiation',
        'Discovery session',
        'Project review',
        'Training session',
        'Executive briefing',
        'Quarterly business review',
        'Follow-up call',
        'Implementation planning'
      ]),
      description: faker.lorem.paragraph(),
      startDate: startDate,
      endDate: endDate,
      location: faker.helpers.arrayElement([
        'Virtual / Zoom',
        'Client office',
        'Our office',
        'Conference center',
        'Phone call'
      ]),
      organizer: entity.ownerId,
      attendees: faker.helpers.arrayElement([
        '2, 3, 4',
        '1, 3',
        '2, 4',
        '1, 2, 3',
        '3, 4'
      ]),
      relatedToType: entity.type,
      relatedToId: entity.id,
      createdAt: faker.date.recent({ days: 15 }),
      isAllDay: faker.datatype.boolean(0.2), // 20% chance of all-day event
      status: faker.helpers.arrayElement(['Scheduled', 'Completed', 'Cancelled']),
    });
  }
  
  const seededEvents = await db.insert(events).values(demoEventsData).returning();
  console.log(`Created ${seededEvents.length} demo events`);

  // Seed activities
  const demoActivitiesData = [];
  const userIds = [demoAdminId, demoUserId];
  const actionTypes = [
    'Made a call',
    'Sent an email',
    'Created a task',
    'Updated an opportunity',
    'Created a new lead',
    'Converted a lead',
    'Updated contact information',
    'Scheduled a meeting',
    'Added a note',
    'Created a proposal',
    'Updated account details',
    'Assigned a task',
    'Changed opportunity stage',
    'Created a new account',
    'Completed a task'
  ];
  
  for (let i = 0; i < 30; i++) {
    const entity = faker.helpers.arrayElement(allEntities);
    
    demoActivitiesData.push({
      userId: faker.helpers.arrayElement(userIds),
      action: faker.helpers.arrayElement(actionTypes),
      entityType: entity.type,
      entityId: entity.id,
      details: faker.lorem.sentence(),
      createdAt: faker.date.recent({ days: 20 }),
    });
  }
  
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