import { sql } from 'drizzle-orm';
import { pool, db } from '../server/db';
import { hashPassword } from '../server/auth';
import {
  users,
  contacts,
  accounts,
  leads,
  opportunities,
  tasks,
  events,
  activities,
  socialIntegrations,
  socialMessages,
  leadSources,
  socialCampaigns,
  subscriptionPackages,
  userSubscriptions,
  apiKeys
} from '../shared/schema';

async function resetDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Resetting database...');
    
    // Start a transaction
    await client.query('BEGIN');
    
    // Function to safely truncate a table if it exists
    const safeTruncate = async (tableName: string) => {
      // Check if table exists before truncating
      const tableExists = await client.query(
        `SELECT EXISTS (
           SELECT FROM information_schema.tables 
           WHERE table_schema = 'public' 
           AND table_name = $1
         )`,
        [tableName]
      );
      
      if (tableExists.rows[0].exists) {
        console.log(`Truncating table: ${tableName}`);
        await client.query(`TRUNCATE ${tableName} CASCADE`);
      } else {
        console.log(`Table ${tableName} does not exist, skipping.`);
      }
    };
    
    // Delete all data from tables
    await safeTruncate('social_messages');
    await safeTruncate('social_integrations');
    await safeTruncate('lead_sources');
    await safeTruncate('social_campaigns');
    await safeTruncate('activities');
    await safeTruncate('events');
    await safeTruncate('tasks');
    await safeTruncate('opportunities');
    await safeTruncate('leads');
    await safeTruncate('contacts');
    await safeTruncate('accounts');
    await safeTruncate('api_keys');
    await safeTruncate('communications');
    
    // Don't truncate users and subscription-related tables to keep the admin user
    // Only delete non-admin users
    const usersTableExists = await client.query(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables 
         WHERE table_schema = 'public' 
         AND table_name = 'users'
       )`
    );
    
    if (usersTableExists.rows[0].exists) {
      console.log('Deleting non-admin users');
      await client.query("DELETE FROM users WHERE role != 'Admin'");
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.log('Database reset completed successfully');
  } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error('Error resetting database:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function seedAccounts() {
  console.log('Seeding accounts...');
  
  const accountsData = [
    { name: 'Acme Corporation', industry: 'Manufacturing', phone: '123-456-7890', website: 'https://acme.example.com', employeeCount: 500, isActive: true },
    { name: 'TechNova Solutions', industry: 'Technology', phone: '234-567-8901', website: 'https://technova.example.com', employeeCount: 150, isActive: true },
    { name: 'Global Shipping Inc', industry: 'Transportation', phone: '345-678-9012', website: 'https://globalshipping.example.com', employeeCount: 1200, isActive: true },
    { name: 'Emerald Healthcare', industry: 'Healthcare', phone: '456-789-0123', website: 'https://emerald.example.com', employeeCount: 450, isActive: true },
    { name: 'Metro Financial Group', industry: 'Finance', phone: '567-890-1234', website: 'https://metrofinancial.example.com', employeeCount: 320, isActive: true },
    { name: 'Brilliant Education Systems', industry: 'Education', phone: '678-901-2345', website: 'https://brilliant-edu.example.com', employeeCount: 85, isActive: true },
    { name: 'Oceanic Resorts', industry: 'Hospitality', phone: '789-012-3456', website: 'https://oceanic.example.com', employeeCount: 750, isActive: true },
    { name: 'GreenLeaf Agricultural Co', industry: 'Agriculture', phone: '890-123-4567', website: 'https://greenleaf.example.com', employeeCount: 180, isActive: true },
    { name: 'Quantum Energy Ltd', industry: 'Energy', phone: '901-234-5678', website: 'https://quantum-energy.example.com', employeeCount: 420, isActive: true },
    { name: 'Stellar Communication Systems', industry: 'Telecommunications', phone: '012-345-6789', website: 'https://stellar-comm.example.com', employeeCount: 310, isActive: true },
  ];
  
  for (const accountData of accountsData) {
    await db.insert(accounts).values({
      ...accountData,
      createdAt: new Date(),
      billingAddress: '123 Main St, Suite 100, Business City, 12345',
      shippingAddress: '123 Main St, Suite 100, Business City, 12345',
      notes: 'Sample account data'
    });
  }
  
  console.log(`Successfully seeded ${accountsData.length} accounts`);
}

async function seedContacts() {
  console.log('Seeding contacts...');
  
  // Get account IDs
  const accountResults = await db.select({ id: accounts.id }).from(accounts).limit(10);
  const accountIds = accountResults.map(a => a.id);
  
  const contactsData = [
    { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '123-456-7890', title: 'CEO', accountId: accountIds[0] },
    { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phone: '234-567-8901', title: 'CTO', accountId: accountIds[1] },
    { firstName: 'Robert', lastName: 'Johnson', email: 'robert.johnson@example.com', phone: '345-678-9012', title: 'CFO', accountId: accountIds[2] },
    { firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@example.com', phone: '456-789-0123', title: 'COO', accountId: accountIds[3] },
    { firstName: 'Michael', lastName: 'Wilson', email: 'michael.wilson@example.com', phone: '567-890-1234', title: 'Director of Sales', accountId: accountIds[4] },
    { firstName: 'Sarah', lastName: 'Brown', email: 'sarah.brown@example.com', phone: '678-901-2345', title: 'Marketing Manager', accountId: accountIds[5] },
    { firstName: 'David', lastName: 'Miller', email: 'david.miller@example.com', phone: '789-012-3456', title: 'IT Manager', accountId: accountIds[6] },
    { firstName: 'Jennifer', lastName: 'Taylor', email: 'jennifer.taylor@example.com', phone: '890-123-4567', title: 'HR Director', accountId: accountIds[7] },
    { firstName: 'Christopher', lastName: 'Anderson', email: 'christopher.anderson@example.com', phone: '901-234-5678', title: 'Operations Manager', accountId: accountIds[8] },
    { firstName: 'Jessica', lastName: 'Thomas', email: 'jessica.thomas@example.com', phone: '012-345-6789', title: 'Customer Service Manager', accountId: accountIds[9] },
  ];
  
  for (const contactData of contactsData) {
    await db.insert(contacts).values({
      ...contactData,
      status: 'Active',
      createdAt: new Date(),
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
      socialProfiles: {
        linkedin: `https://linkedin.com/in/${contactData.firstName.toLowerCase()}-${contactData.lastName.toLowerCase()}`,
        twitter: `https://twitter.com/${contactData.firstName.toLowerCase()}${contactData.lastName.toLowerCase()}`
      }
    });
  }
  
  console.log(`Successfully seeded ${contactsData.length} contacts`);
}

async function seedLeads() {
  console.log('Seeding leads...');
  
  // Get user IDs for assigned reps
  const userResults = await db.select({ id: users.id }).from(users).limit(3);
  const userIds = userResults.map(u => u.id);
  const assignedTo = userIds.length > 0 ? userIds[0] : null;
  
  const leadsData = [
    { firstName: 'Thomas', lastName: 'Wright', email: 'thomas.wright@example.com', phone: '123-555-7890', company: 'Innovate Tech', jobTitle: 'CTO', status: 'New', source: 'Website', score: 85 },
    { firstName: 'Amanda', lastName: 'Lee', email: 'amanda.lee@example.com', phone: '234-555-8901', company: 'Digital Solutions', jobTitle: 'Marketing Director', status: 'Contacted', source: 'Referral', score: 70 },
    { firstName: 'Richard', lastName: 'Harris', email: 'richard.harris@example.com', phone: '345-555-9012', company: 'Global Enterprises', jobTitle: 'CEO', status: 'Qualified', source: 'Conference', score: 90 },
    { firstName: 'Elizabeth', lastName: 'Clark', email: 'elizabeth.clark@example.com', phone: '456-555-0123', company: 'Smart Systems', jobTitle: 'Operations Manager', status: 'New', source: 'LinkedIn', score: 65 },
    { firstName: 'Daniel', lastName: 'Lewis', email: 'daniel.lewis@example.com', phone: '567-555-1234', company: 'Future Finance', jobTitle: 'CFO', status: 'Contacted', source: 'Facebook', score: 75 },
    { firstName: 'Michelle', lastName: 'Walker', email: 'michelle.walker@example.com', phone: '678-555-2345', company: 'Edu Systems', jobTitle: 'Director', status: 'Qualified', source: 'Email Campaign', score: 80 },
    { firstName: 'James', lastName: 'Hall', email: 'james.hall@example.com', phone: '789-555-3456', company: 'Resort Vacations', jobTitle: 'Sales Manager', status: 'New', source: 'Website', score: 60 },
    { firstName: 'Patricia', lastName: 'Young', email: 'patricia.young@example.com', phone: '890-555-4567', company: 'Organic Farming', jobTitle: 'Owner', status: 'Contacted', source: 'Trade Show', score: 85 },
    { firstName: 'Robert', lastName: 'King', email: 'robert.king@example.com', phone: '901-555-5678', company: 'Power Solutions', jobTitle: 'Engineering Lead', status: 'Qualified', source: 'Google Ads', score: 95 },
    { firstName: 'Linda', lastName: 'Scott', email: 'linda.scott@example.com', phone: '012-555-6789', company: 'Telecom Express', jobTitle: 'Product Manager', status: 'New', source: 'Cold Call', score: 70 },
  ];
  
  for (const leadData of leadsData) {
    await db.insert(leads).values({
      ...leadData,
      assignedTo,
      createdAt: new Date(),
      lastContacted: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date in last 30 days
      isQualified: leadData.status === 'Qualified',
      budget: Math.floor(Math.random() * 5 + 1) * 10000, // Random budget between 10k and 50k
      timeline: ['1-3 months', '3-6 months', '6-12 months'][Math.floor(Math.random() * 3)],
      requirements: 'Looking for a comprehensive solution that integrates with existing systems',
      notes: 'Initial contact made. Follow up needed.',
      tags: ['potential', 'follow-up', leadData.source.toLowerCase()],
      socialProfiles: {
        linkedin: `https://linkedin.com/in/${leadData.firstName.toLowerCase()}-${leadData.lastName.toLowerCase()}`,
        twitter: `https://twitter.com/${leadData.firstName.toLowerCase()}${leadData.lastName.toLowerCase()}`
      }
    });
  }
  
  console.log(`Successfully seeded ${leadsData.length} leads`);
}

async function seedOpportunities() {
  console.log('Seeding opportunities...');
  
  // Get account IDs
  const accountResults = await db.select({ id: accounts.id }).from(accounts).limit(10);
  const accountIds = accountResults.map(a => a.id);
  
  // Get user IDs for assigned reps
  const userResults = await db.select({ id: users.id }).from(users).limit(3);
  const userIds = userResults.map(u => u.id);
  const assignedTo = userIds.length > 0 ? userIds[0] : null;
  
  const opportunitiesData = [
    { name: 'Enterprise Software Implementation', accountId: accountIds[0], stage: 'Discovery', amount: 125000, probability: 20, expectedCloseDate: new Date(2025, 5, 15) },
    { name: 'Cloud Migration Services', accountId: accountIds[1], stage: 'Proposal', amount: 85000, probability: 50, expectedCloseDate: new Date(2025, 4, 30) },
    { name: 'Logistics Software Upgrade', accountId: accountIds[2], stage: 'Negotiation', amount: 150000, probability: 75, expectedCloseDate: new Date(2025, 4, 10) },
    { name: 'Patient Management System', accountId: accountIds[3], stage: 'Discovery', amount: 95000, probability: 25, expectedCloseDate: new Date(2025, 6, 20) },
    { name: 'Financial Reporting Tools', accountId: accountIds[4], stage: 'Proposal', amount: 65000, probability: 60, expectedCloseDate: new Date(2025, 5, 5) },
    { name: 'Educational Platform License', accountId: accountIds[5], stage: 'Closed Won', amount: 45000, probability: 100, expectedCloseDate: new Date(2025, 3, 25) },
    { name: 'Hospitality Management Suite', accountId: accountIds[6], stage: 'Negotiation', amount: 110000, probability: 80, expectedCloseDate: new Date(2025, 4, 15) },
    { name: 'Agricultural Analytics Platform', accountId: accountIds[7], stage: 'Discovery', amount: 70000, probability: 30, expectedCloseDate: new Date(2025, 7, 10) },
    { name: 'Energy Monitoring Solutions', accountId: accountIds[8], stage: 'Proposal', amount: 130000, probability: 55, expectedCloseDate: new Date(2025, 6, 1) },
    { name: 'Telecommunications Infrastructure', accountId: accountIds[9], stage: 'Closed Lost', amount: 200000, probability: 0, expectedCloseDate: new Date(2025, 3, 30) },
  ];
  
  for (const opportunityData of opportunitiesData) {
    await db.insert(opportunities).values({
      ...opportunityData,
      ownerId: assignedTo,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000), // Random date in last 60 days
      description: 'Opportunity for providing services and solutions to meet client needs.',
      nextStep: 'Schedule follow-up meeting to discuss requirements in detail',
      competitors: 'Major competitors in this space include CompetitorA and CompetitorB',
      notes: 'Initial discussions have been positive. Client has expressed strong interest.',
      tags: [opportunityData.stage.toLowerCase().replace(' ', '-'), 'priority']
    });
  }
  
  console.log(`Successfully seeded ${opportunitiesData.length} opportunities`);
}

async function seedTasks() {
  console.log('Seeding tasks...');
  
  // Get user IDs for owner assignment
  const userResults = await db.select({ id: users.id }).from(users).limit(3);
  const userIds = userResults.map(u => u.id);
  const ownerId = userIds.length > 0 ? userIds[0] : null;
  
  const tasksData = [
    { title: 'Prepare sales presentation', status: 'Not Started', priority: 'High', dueDate: new Date(2025, 4, 15) },
    { title: 'Follow up with client about proposal', status: 'In Progress', priority: 'High', dueDate: new Date(2025, 4, 10) },
    { title: 'Research competitor pricing', status: 'Completed', priority: 'Medium', dueDate: new Date(2025, 4, 5) },
    { title: 'Update CRM data', status: 'Not Started', priority: 'Normal', dueDate: new Date(2025, 4, 20) },
    { title: 'Schedule product demo', status: 'In Progress', priority: 'High', dueDate: new Date(2025, 4, 12) },
    { title: 'Send contract for signature', status: 'Not Started', priority: 'High', dueDate: new Date(2025, 4, 18) },
    { title: 'Prepare quarterly report', status: 'In Progress', priority: 'Medium', dueDate: new Date(2025, 4, 25) },
    { title: 'Organize team meeting', status: 'Completed', priority: 'Normal', dueDate: new Date(2025, 4, 3) },
    { title: 'Review new lead sources', status: 'Not Started', priority: 'Medium', dueDate: new Date(2025, 4, 22) },
    { title: 'Create training materials', status: 'In Progress', priority: 'Normal', dueDate: new Date(2025, 4, 28) },
  ];
  
  for (const taskData of tasksData) {
    await db.insert(tasks).values({
      ...taskData,
      ownerId,
      createdAt: new Date(),
      description: 'This is a sample task description that outlines the work to be done.',
      relatedTo: 'opportunity',
      relatedToId: Math.floor(Math.random() * 10) + 1, // Random ID between 1-10
      reminderDate: new Date(taskData.dueDate.getTime() - 24 * 60 * 60 * 1000) // 1 day before due date
    });
  }
  
  console.log(`Successfully seeded ${tasksData.length} tasks`);
}

async function seedEvents() {
  console.log('Seeding events...');
  
  // Get user IDs for owner assignment
  const userResults = await db.select({ id: users.id }).from(users).limit(3);
  const userIds = userResults.map(u => u.id);
  const ownerId = userIds.length > 0 ? userIds[0] : null;
  
  const now = new Date();
  
  const eventsData = [
    { title: 'Client kickoff meeting', startDate: new Date(2025, 4, 10, 10, 0), endDate: new Date(2025, 4, 10, 11, 30), location: 'Conference Room A', status: 'Confirmed' },
    { title: 'Sales team strategy session', startDate: new Date(2025, 4, 12, 13, 0), endDate: new Date(2025, 4, 12, 15, 0), location: 'Main Office', status: 'Confirmed' },
    { title: 'Product demo for TechNova', startDate: new Date(2025, 4, 15, 14, 0), endDate: new Date(2025, 4, 15, 15, 0), location: 'Virtual/Zoom', status: 'Tentative' },
    { title: 'Quarterly business review', startDate: new Date(2025, 4, 18, 9, 0), endDate: new Date(2025, 4, 18, 12, 0), location: 'Board Room', status: 'Confirmed' },
    { title: 'Industry conference', startDate: new Date(2025, 4, 20, 8, 0), endDate: new Date(2025, 4, 22, 17, 0), location: 'Convention Center', status: 'Confirmed' },
    { title: 'Training workshop', startDate: new Date(2025, 4, 25, 9, 0), endDate: new Date(2025, 4, 25, 16, 0), location: 'Training Room', status: 'Confirmed' },
    { title: 'Contract negotiation meeting', startDate: new Date(2025, 4, 27, 11, 0), endDate: new Date(2025, 4, 27, 12, 30), location: 'Client Office', status: 'Tentative' },
    { title: 'Marketing campaign review', startDate: new Date(2025, 4, 29, 13, 30), endDate: new Date(2025, 4, 29, 15, 0), location: 'Marketing Department', status: 'Confirmed' },
    { title: 'Team building event', startDate: new Date(2025, 5, 2, 14, 0), endDate: new Date(2025, 5, 2, 17, 0), location: 'City Park', status: 'Confirmed' },
    { title: 'Executive leadership meeting', startDate: new Date(2025, 5, 5, 10, 0), endDate: new Date(2025, 5, 5, 12, 0), location: 'Executive Suite', status: 'Confirmed' },
  ];
  
  for (const eventData of eventsData) {
    await db.insert(events).values({
      ...eventData,
      ownerId,
      createdAt: new Date(),
      description: 'This is a sample event description outlining the purpose and agenda.',
      relatedTo: 'account',
      relatedToId: Math.floor(Math.random() * 10) + 1, // Random ID between 1-10
      isAllDay: false,
      reminderMinutes: 15,
      participants: ['user1@example.com', 'user2@example.com'],
      recurringRule: null
    });
  }
  
  console.log(`Successfully seeded ${eventsData.length} events`);
}

async function seedActivities() {
  console.log('Seeding activities...');
  
  // Get entity IDs for relating activities
  const leadResults = await db.select({ id: leads.id }).from(leads).limit(5);
  const leadIds = leadResults.map(l => l.id);
  
  const accountResults = await db.select({ id: accounts.id }).from(accounts).limit(5);
  const accountIds = accountResults.map(a => a.id);
  
  const opportunityResults = await db.select({ id: opportunities.id }).from(opportunities).limit(5);
  const opportunityIds = opportunityResults.map(o => o.id);
  
  // Get user IDs for activity performers
  const userResults = await db.select({ id: users.id }).from(users).limit(3);
  const userIds = userResults.map(u => u.id);
  const userId = userIds.length > 0 ? userIds[0] : 1;
  
  const activitiesData = [
    { type: 'Call', entityType: 'lead', entityId: leadIds[0], subject: 'Introduction call', description: 'Made initial contact to introduce our services', outcome: 'Positive response, scheduled follow-up' },
    { type: 'Email', entityType: 'lead', entityId: leadIds[1], subject: 'Product information', description: 'Sent detailed product information', outcome: 'No response yet' },
    { type: 'Meeting', entityType: 'account', entityId: accountIds[0], subject: 'Quarterly review', description: 'Conducted quarterly business review', outcome: 'Identified new opportunity' },
    { type: 'Email', entityType: 'opportunity', entityId: opportunityIds[0], subject: 'Proposal follow-up', description: 'Sent follow-up regarding proposal', outcome: 'Client requested modifications' },
    { type: 'Call', entityType: 'lead', entityId: leadIds[2], subject: 'Qualification call', description: 'Called to qualify lead requirements', outcome: 'Lead qualified, moved to opportunity' },
    { type: 'Meeting', entityType: 'account', entityId: accountIds[1], subject: 'Demo presentation', description: 'Presented product demo to key stakeholders', outcome: 'Client impressed, requested pricing' },
    { type: 'Email', entityType: 'opportunity', entityId: opportunityIds[1], subject: 'Contract details', description: 'Sent contract details for review', outcome: 'Awaiting feedback' },
    { type: 'Call', entityType: 'account', entityId: accountIds[2], subject: 'Service follow-up', description: 'Called to ensure satisfaction with services', outcome: 'Positive feedback received' },
    { type: 'Email', entityType: 'lead', entityId: leadIds[3], subject: 'Case study sharing', description: 'Shared relevant case studies', outcome: 'Lead expressed increased interest' },
    { type: 'Meeting', entityType: 'opportunity', entityId: opportunityIds[2], subject: 'Negotiation meeting', description: 'Met to negotiate final terms', outcome: 'Agreement reached on key points' },
  ];
  
  for (const activityData of activitiesData) {
    await db.insert(activities).values({
      ...activityData,
      userId,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date in last 30 days
      duration: Math.floor(Math.random() * 60) + 15 // Random duration between 15-75 minutes
    });
  }
  
  console.log(`Successfully seeded ${activitiesData.length} activities`);
}

async function seedSocialIntegrations() {
  console.log('Seeding social integrations...');
  
  // Get user ID for ownership
  const [user] = await db.select().from(users).where(sql`role = 'Admin'`).limit(1);
  const userId = user?.id || 1;
  
  const integrationsData = [
    { platform: 'Facebook', name: 'Facebook Company Page', accessToken: 'sample_fb_token_123', details: { pageId: '123456789', pageName: 'AVEROX CRM' } },
    { platform: 'LinkedIn', name: 'LinkedIn Company Profile', accessToken: 'sample_li_token_456', details: { companyId: '987654321', companyName: 'AVEROX' } },
    { platform: 'Twitter', name: 'Twitter Business Account', accessToken: 'sample_tw_token_789', details: { username: '@averoxcrm' } },
    { platform: 'Instagram', name: 'Instagram Business Profile', accessToken: 'sample_ig_token_012', details: { username: 'averoxcrm', businessId: '567891234' } },
    { platform: 'WhatsApp', name: 'WhatsApp Business Account', accessToken: 'sample_wa_token_345', details: { phoneNumber: '+1234567890', businessName: 'AVEROX Support' } },
    { platform: 'Email', name: 'Marketing Email Integration', accessToken: 'sample_email_token_678', details: { emailAddress: 'marketing@averox.example.com' } },
    { platform: 'Messenger', name: 'Facebook Messenger', accessToken: 'sample_messenger_token_901', details: { pageId: '123456789' } },
  ];
  
  for (const integrationData of integrationsData) {
    await db.insert(socialIntegrations).values({
      ...integrationData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      refreshToken: `refresh_${integrationData.accessToken}`,
      tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      settings: { autoReply: true, notificationEmail: 'alerts@averox.example.com' }
    });
  }
  
  console.log(`Successfully seeded ${integrationsData.length} social integrations`);
}

async function seedLeadSources() {
  console.log('Seeding lead sources...');
  
  const sourcesData = [
    { name: 'Company Website', platform: 'Other', description: 'Leads generated from contact forms on our website' },
    { name: 'Facebook Lead Ads', platform: 'Facebook', description: 'Lead generation campaigns on Facebook' },
    { name: 'LinkedIn Campaigns', platform: 'LinkedIn', description: 'Professional network outreach and sponsored content' },
    { name: 'Twitter Engagement', platform: 'Twitter', description: 'Leads from Twitter conversations and promotions' },
    { name: 'Instagram Stories', platform: 'Instagram', description: 'Story ads with swipe-up functionality' },
    { name: 'WhatsApp Business', platform: 'WhatsApp', description: 'Inquiries through WhatsApp business channel' },
    { name: 'Email Newsletter', platform: 'Email', description: 'Subscribers from our monthly newsletter' },
    { name: 'Messenger Chatbot', platform: 'Messenger', description: 'Automated lead capture through Facebook Messenger' },
    { name: 'Trade Shows', platform: 'Other', description: 'In-person lead collection at industry events' },
    { name: 'Referral Program', platform: 'Other', description: 'Customer referrals through our loyalty program' },
  ];
  
  for (const sourceData of sourcesData) {
    await db.insert(leadSources).values({
      ...sourceData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      conversionRate: Math.random() * 0.2 + 0.05, // Random conversion rate between 5-25%
      leadCount: Math.floor(Math.random() * 200) + 50, // Random count between 50-250
      settings: { 
        autoTagging: true, 
        scoreThreshold: 50,
        autoAssignment: true,
        notificationRecipients: ['sales@averox.example.com']
      }
    });
  }
  
  console.log(`Successfully seeded ${sourcesData.length} lead sources`);
}

async function seedSocialCampaigns() {
  console.log('Seeding social campaigns...');
  
  // Get user ID for ownership
  const [user] = await db.select().from(users).where(sql`role = 'Admin'`).limit(1);
  const userId = user?.id || 1;
  
  // Get source IDs for relations
  const sources = await db.select().from(leadSources).limit(5);
  
  const campaignsData = [
    { name: 'Spring Promotion', platform: 'Facebook', status: 'Active', budget: 5000, startDate: new Date(2025, 3, 1), endDate: new Date(2025, 4, 30) },
    { name: 'B2B Outreach', platform: 'LinkedIn', status: 'Active', budget: 8000, startDate: new Date(2025, 3, 15), endDate: new Date(2025, 6, 15) },
    { name: 'Product Launch', platform: 'Twitter', status: 'Planned', budget: 3500, startDate: new Date(2025, 5, 1), endDate: new Date(2025, 5, 31) },
    { name: 'Visual Showcase', platform: 'Instagram', status: 'Active', budget: 2500, startDate: new Date(2025, 4, 1), endDate: new Date(2025, 5, 15) },
    { name: 'Customer Support Channel', platform: 'WhatsApp', status: 'Active', budget: 1000, startDate: new Date(2025, 3, 1), endDate: new Date(2025, 12, 31) },
    { name: 'Monthly Newsletter', platform: 'Email', status: 'Active', budget: 1500, startDate: new Date(2025, 1, 1), endDate: new Date(2025, 12, 31) },
    { name: 'Chat Automation', platform: 'Messenger', status: 'Active', budget: 2000, startDate: new Date(2025, 2, 15), endDate: new Date(2025, 12, 31) },
    { name: 'Summer Special', platform: 'Facebook', status: 'Planned', budget: 4500, startDate: new Date(2025, 5, 15), endDate: new Date(2025, 7, 15) },
    { name: 'Industry Webinar', platform: 'LinkedIn', status: 'Draft', budget: 3000, startDate: new Date(2025, 6, 1), endDate: new Date(2025, 6, 30) },
    { name: 'Holiday Promotion', platform: 'Email', status: 'Draft', budget: 5000, startDate: new Date(2025, 11, 1), endDate: new Date(2025, 12, 31) },
  ];
  
  for (const [index, campaignData] of campaignsData.entries()) {
    const sourceId = sources[index % sources.length]?.id || null;
    
    await db.insert(socialCampaigns).values({
      ...campaignData,
      sourceId,
      ownerId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: campaignData.status === 'Active',
      description: `Campaign targeting ${campaignData.platform} users with focused messaging and offers.`,
      objectives: ['increase_leads', 'brand_awareness', 'engagement'],
      targetAudience: {
        demographics: {
          ageRange: '25-54',
          locations: ['United States', 'Canada', 'United Kingdom'],
          interests: ['Business', 'Technology', 'Marketing']
        },
        targeting: {
          includeKeywords: ['business solutions', 'productivity', 'efficiency'],
          excludeKeywords: ['free', 'cheap']
        }
      },
      performanceMetrics: {
        impressions: Math.floor(Math.random() * 100000) + 5000,
        clicks: Math.floor(Math.random() * 5000) + 500,
        leads: Math.floor(Math.random() * 200) + 20,
        conversion: Math.random() * 0.1 + 0.02 // 2-12% conversion rate
      }
    });
  }
  
  console.log(`Successfully seeded ${campaignsData.length} social campaigns`);
}

async function seedSocialMessages() {
  console.log('Seeding social messages...');
  
  // Get integration IDs
  const integrations = await db.select().from(socialIntegrations).limit(7);
  
  // Get contact IDs
  const contactResults = await db.select({ id: contacts.id }).from(contacts).limit(5);
  const contactIds = contactResults.map(c => c.id);
  
  // Get lead IDs
  const leadResults = await db.select({ id: leads.id }).from(leads).limit(5);
  const leadIds = leadResults.map(l => l.id);
  
  // Create an array of messages for each platform
  const messagesData = [];
  
  // For each integration, create sample messages
  for (const integration of integrations) {
    // Determine if this is for a contact or lead (alternate)
    const useContact = integrations.indexOf(integration) % 2 === 0;
    
    // Get the right entity ID
    const entityIds = useContact ? contactIds : leadIds;
    
    // Create multiple messages for each integration
    for (let i = 0; i < 3; i++) {
      const isInbound = i % 2 === 0; // Alternate between inbound/outbound
      const entityId = entityIds[i % entityIds.length]; // Cycle through available IDs
      
      let messageText = '';
      let status: 'Unread' | 'Read' | 'Replied' | 'Archived' = 'Unread';
      
      // Create platform-specific sample messages
      switch (integration.platform) {
        case 'Facebook':
          messageText = isInbound 
            ? 'Hi there! I saw your post about AVEROX CRM. Can you tell me more about its features?' 
            : 'Thanks for reaching out! AVEROX CRM offers comprehensive lead management, contact tracking, and AI-powered insights. Would you like a demo?';
          status = isInbound ? 'Unread' : 'Sent';
          break;
        case 'LinkedIn':
          messageText = isInbound 
            ? 'Hello, I\'m interested in learning more about how AVEROX CRM can help my B2B sales team.' 
            : 'Great to connect! AVEROX CRM is designed to boost B2B sales efficiency with our workflow automation and analytics. When would be a good time to show you our platform?';
          status = isInbound ? 'Read' : 'Sent';
          break;
        case 'Twitter':
          messageText = isInbound 
            ? 'Just came across @averoxcrm - does your platform integrate with our existing marketing tools?' 
            : 'Yes! We pride ourselves on our open API and pre-built integrations with all major marketing platforms. Which tools are you currently using?';
          status = isInbound ? 'Replied' : 'Sent';
          break;
        case 'Instagram':
          messageText = isInbound 
            ? 'Your dashboard screenshots look amazing! Is there a mobile app version?' 
            : 'Thank you! Yes, we have fully-featured iOS and Android apps that give you the same powerful features on the go.';
          status = isInbound ? 'Read' : 'Sent';
          break;
        case 'WhatsApp':
          messageText = isInbound 
            ? 'Hi, I need some help setting up my team in AVEROX CRM. Are you available for a quick chat?' 
            : 'Absolutely! I can help you set up your team right now. How many team members do you need to add?';
          status = isInbound ? 'Replied' : 'Sent';
          break;
        case 'Email':
          messageText = isInbound 
            ? 'Subject: Pricing Question\n\nHello AVEROX team,\n\nI\'m evaluating CRM solutions and would like to know more about your pricing tiers for a 20-person team.\n\nRegards,\nPotential Customer' 
            : 'Subject: Re: Pricing Question\n\nHi there,\n\nThanks for your interest in AVEROX CRM! For a 20-person team, our Business Plan would be the most cost-effective at $49/user/month. I\'ve attached a detailed pricing breakdown for your review.\n\nBest regards,\nAVEROX Sales Team';
          status = isInbound ? 'Read' : 'Sent';
          break;
        case 'Messenger':
          messageText = isInbound 
            ? 'Quick question - do you offer a trial period?' 
            : 'Yes! We offer a full-featured 14-day trial with no credit card required. Would you like me to set that up for you?';
          status = isInbound ? 'Unread' : 'Sent';
          break;
        default:
          messageText = isInbound 
            ? 'I have a question about your services.' 
            : 'Thank you for your question. How can we help you today?';
          status = isInbound ? 'Unread' : 'Sent';
      }
      
      // Create message object
      const message = {
        integrationId: integration.id,
        externalId: `ext_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        message: messageText,
        sender: isInbound ? 'user' : 'system',
        recipient: isInbound ? 'system' : 'user',
        status,
        createdAt: new Date(Date.now() - (3 - i) * 24 * 60 * 60 * 1000), // Spread out over last 3 days
        receivedAt: isInbound ? new Date(Date.now() - (3 - i) * 24 * 60 * 60 * 1000) : null,
        attachments: null,
        metadata: {
          platform: integration.platform,
          messageType: integration.platform === 'Email' ? 'email' : 'chat'
        },
        isDeleted: false
      };
      
      // Add either contactId or leadId
      if (useContact) {
        message['contactId'] = entityId;
      } else {
        message['leadId'] = entityId;
      }
      
      messagesData.push(message);
    }
  }
  
  // Insert all messages
  for (const message of messagesData) {
    await db.insert(socialMessages).values(message);
  }
  
  console.log(`Successfully seeded ${messagesData.length} social messages`);
}

// This function has been commented out since there is no workflows table in the schema yet
/* 
async function seedWorkflows() {
  console.log('Seeding workflows...');
  
  const workflowsData = [
    { 
      name: 'New Lead Follow-up', 
      description: 'Automated workflow for initial lead engagement',
      type: 'lead',
      triggerType: 'automatic',
      active: true,
      steps: [
        { type: 'delay', config: { duration: 30, unit: 'minutes' }, name: 'Initial delay' },
        { type: 'email', config: { template: 'welcome_email', subject: 'Welcome to AVEROX' }, name: 'Send welcome email' },
        { type: 'delay', config: { duration: 2, unit: 'days' }, name: 'Follow-up delay' },
        { type: 'task', config: { title: 'Call new lead', assignee: 'owner', priority: 'High' }, name: 'Create follow-up task' }
      ]
    },
    { 
      name: 'Opportunity Stage Advancement', 
      description: 'Process for moving opportunities through sales stages',
      type: 'opportunity',
      triggerType: 'manual',
      active: true,
      steps: [
        { type: 'task', config: { title: 'Update opportunity details', assignee: 'owner', priority: 'Medium' }, name: 'Review opportunity' },
        { type: 'approval', config: { approver: 'manager', timeout: 24 }, name: 'Manager approval' },
        { type: 'condition', config: { field: 'amount', operator: '>', value: 50000 }, name: 'Check deal size' },
        { type: 'branch', config: {
          condition: 'value > 50000',
          truePath: [
            { type: 'task', config: { title: 'Schedule executive review', assignee: 'owner', priority: 'High' }, name: 'Executive involvement' }
          ],
          falsePath: [
            { type: 'task', config: { title: 'Prepare standard proposal', assignee: 'owner', priority: 'Normal' }, name: 'Standard process' }
          ]
        }, name: 'Deal size branch' }
      ]
    },
    { 
      name: 'Customer Onboarding', 
      description: 'Steps to onboard new customers after sale',
      type: 'account',
      triggerType: 'automatic',
      active: true,
      steps: [
        { type: 'email', config: { template: 'onboarding_welcome', subject: 'Welcome to the AVEROX family!' }, name: 'Welcome email' },
        { type: 'task', config: { title: 'Schedule kickoff call', assignee: 'owner', priority: 'High' }, name: 'Kickoff planning' },
        { type: 'task', config: { title: 'Set up customer in system', assignee: 'implementation', priority: 'High' }, name: 'System setup' },
        { type: 'delay', config: { duration: 7, unit: 'days' }, name: 'Week 1 check-in delay' },
        { type: 'task', config: { title: 'Week 1 check-in call', assignee: 'owner', priority: 'Medium' }, name: 'Initial follow-up' }
      ]
    },
    { 
      name: 'Contract Renewal', 
      description: 'Process for handling upcoming contract renewals',
      type: 'account',
      triggerType: 'scheduled',
      active: true,
      steps: [
        { type: 'delay', config: { duration: 60, unit: 'days', beforeField: 'contractEndDate' }, name: '60-day reminder' },
        { type: 'email', config: { template: 'renewal_reminder', subject: 'Your AVEROX subscription renewal' }, name: 'Renewal notification' },
        { type: 'task', config: { title: 'Contact for renewal discussion', assignee: 'owner', priority: 'High' }, name: 'Renewal outreach' },
        { type: 'delay', config: { duration: 30, unit: 'days' }, name: '30-day follow-up delay' },
        { type: 'condition', config: { field: 'renewalStatus', operator: '==', value: 'pending' }, name: 'Check renewal status' },
        { type: 'branch', config: {
          condition: 'renewalStatus == "pending"',
          truePath: [
            { type: 'task', config: { title: 'Escalate renewal priority', assignee: 'manager', priority: 'High' }, name: 'Escalation' }
          ],
          falsePath: []
        }, name: 'Pending renewal branch' }
      ]
    },
    { 
      name: 'Lead Nurturing Campaign', 
      description: 'Multi-touch campaign for lead nurturing',
      type: 'lead',
      triggerType: 'automatic',
      active: true,
      steps: [
        { type: 'email', config: { template: 'lead_nurture_1', subject: 'Discover AVEROX CRM capabilities' }, name: 'Initial nurture email' },
        { type: 'delay', config: { duration: 3, unit: 'days' }, name: 'Wait 3 days' },
        { type: 'email', config: { template: 'lead_nurture_2', subject: 'AVEROX case studies and success stories' }, name: 'Case studies email' },
        { type: 'delay', config: { duration: 4, unit: 'days' }, name: 'Wait 4 days' },
        { type: 'email', config: { template: 'lead_nurture_3', subject: 'Special offer for AVEROX CRM' }, name: 'Offer email' },
        { type: 'delay', config: { duration: 5, unit: 'days' }, name: 'Wait 5 days' },
        { type: 'task', config: { title: 'Follow up with nurtured lead', assignee: 'owner', priority: 'Medium' }, name: 'Sales follow-up' }
      ]
    },
    { 
      name: 'Feedback Collection', 
      description: 'Process to gather and act on customer feedback',
      type: 'account',
      triggerType: 'scheduled',
      active: true,
      steps: [
        { type: 'email', config: { template: 'satisfaction_survey', subject: 'We value your feedback on AVEROX CRM' }, name: 'Survey request' },
        { type: 'delay', config: { duration: 3, unit: 'days' }, name: 'Wait for responses' },
        { type: 'condition', config: { field: 'surveyResponded', operator: '==', value: true }, name: 'Check for response' },
        { type: 'branch', config: {
          condition: 'surveyResponded == true',
          truePath: [
            { type: 'task', config: { title: 'Review customer feedback', assignee: 'owner', priority: 'Medium' }, name: 'Feedback review' }
          ],
          falsePath: [
            { type: 'email', config: { template: 'survey_reminder', subject: 'Reminder: We value your feedback' }, name: 'Survey reminder' }
          ]
        }, name: 'Response branch' }
      ]
    },
    { 
      name: 'Deal Lost Analysis', 
      description: 'Follow-up process for lost opportunities',
      type: 'opportunity',
      triggerType: 'automatic',
      active: true,
      steps: [
        { type: 'task', config: { title: 'Complete loss reason analysis', assignee: 'owner', priority: 'Medium' }, name: 'Loss analysis' },
        { type: 'delay', config: { duration: 1, unit: 'days' }, name: 'Short delay' },
        { type: 'email', config: { template: 'loss_feedback', subject: 'We appreciate your consideration' }, name: 'Thank you email' },
        { type: 'delay', config: { duration: 90, unit: 'days' }, name: '90-day cool off' },
        { type: 'task', config: { title: 'Reassess opportunity potential', assignee: 'owner', priority: 'Low' }, name: 'Reassessment task' }
      ]
    },
    { 
      name: 'High-Value Prospect Engagement', 
      description: 'Executive engagement for high-value prospects',
      type: 'lead',
      triggerType: 'manual',
      active: true,
      steps: [
        { type: 'condition', config: { field: 'estimatedValue', operator: '>', value: 100000 }, name: 'Value qualification' },
        { type: 'branch', config: {
          condition: 'estimatedValue > 100000',
          truePath: [
            { type: 'task', config: { title: 'Executive outreach planning', assignee: 'manager', priority: 'High' }, name: 'Executive planning' },
            { type: 'task', config: { title: 'Custom presentation preparation', assignee: 'owner', priority: 'High' }, name: 'Custom materials' },
            { type: 'task', config: { title: 'Schedule executive meeting', assignee: 'owner', priority: 'High' }, name: 'Executive meeting' }
          ],
          falsePath: [
            { type: 'task', config: { title: 'Standard lead qualification', assignee: 'owner', priority: 'Medium' }, name: 'Standard process' }
          ]
        }, name: 'Value-based routing' }
      ]
    },
    { 
      name: 'Sales Team Assignment', 
      description: 'Route leads to appropriate sales team members',
      type: 'lead',
      triggerType: 'automatic',
      active: true,
      steps: [
        { type: 'condition', config: { field: 'industry', operator: '==', value: 'Technology' }, name: 'Tech industry check' },
        { type: 'branch', config: {
          condition: 'industry == "Technology"',
          truePath: [
            { type: 'assignment', config: { assignee: 'tech_team', notifyAssignee: true }, name: 'Assign to tech team' }
          ],
          falsePath: [
            { type: 'condition', config: { field: 'industry', operator: '==', value: 'Healthcare' }, name: 'Healthcare check' },
            { type: 'branch', config: {
              condition: 'industry == "Healthcare"',
              truePath: [
                { type: 'assignment', config: { assignee: 'healthcare_team', notifyAssignee: true }, name: 'Assign to healthcare team' }
              ],
              falsePath: [
                { type: 'assignment', config: { assignee: 'general_team', notifyAssignee: true }, name: 'Assign to general team' }
              ]
            }, name: 'Healthcare branch' }
          ]
        }, name: 'Industry-based routing' }
      ]
    },
    { 
      name: 'Content Download Follow-up', 
      description: 'Follow up with leads who download resources',
      type: 'lead',
      triggerType: 'automatic',
      active: true,
      steps: [
        { type: 'email', config: { template: 'content_thank_you', subject: 'Thank you for downloading our resource' }, name: 'Thank you email' },
        { type: 'delay', config: { duration: 2, unit: 'days' }, name: 'Initial delay' },
        { type: 'email', config: { template: 'related_content', subject: 'More resources you might enjoy' }, name: 'Related content' },
        { type: 'delay', config: { duration: 5, unit: 'days' }, name: 'Second delay' },
        { type: 'task', config: { title: 'Follow up on content interest', assignee: 'owner', priority: 'Medium' }, name: 'Sales follow-up' }
      ]
    }
  ];
  
  /* 
  // This section is commented out because the workflows table doesn't exist in the schema yet
  for (const workflowData of workflowsData) {
    await db.insert(workflows).values({
      ...workflowData,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 1, // Assuming admin user ID is 1
      updatedBy: 1,
      version: 1,
      entityFilter: JSON.stringify({ status: 'active' }),
      settings: {
        notifications: { email: true, inApp: true },
        runLimit: 1,
        errorHandling: { retryCount: 3, failureAction: 'notify_admin' }
      }
    });
  }
  
  // console.log(`Successfully seeded ${workflowsData.length} workflows`);
  */
}

async function seedApiKeys() {
  console.log('Seeding API keys...');
  
  // Get admin user for ownership
  const [admin] = await db.select().from(users).where(sql`role = 'Admin'`).limit(1);
  const adminId = admin?.id || 1;
  
  const apiKeysData = [
    { name: 'Production API Key', provider: 'internal', usageCount: 1250 },
    { name: 'Development API Key', provider: 'internal', usageCount: 3680 },
    { name: 'Mobile App Integration', provider: 'internal', usageCount: 5430 },
    { name: 'Website Integration', provider: 'internal', usageCount: 2870 },
    { name: 'Partner Integration - TechNova', provider: 'partner', usageCount: 980 },
    { name: 'Partner Integration - GlobalShipping', provider: 'partner', usageCount: 450 },
    { name: 'Marketing Automation', provider: 'internal', usageCount: 3210 },
    { name: 'Analytics Integration', provider: 'internal', usageCount: 1890 },
    { name: 'Reporting Tool', provider: 'internal', usageCount: 760 },
    { name: 'Legacy System Integration', provider: 'internal', usageCount: 120 },
  ];
  
  for (const keyData of apiKeysData) {
    // Generate a random API key and secret
    const keyString = `key_${Math.random().toString(36).substring(2, 15)}`;
    const secretString = `sec_${Math.random().toString(36).substring(2, 15)}`;
    
    await db.insert(apiKeys).values({
      ...keyData,
      ownerId: adminId,
      key: keyString,
      secret: secretString,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000), // Random date in last 90 days
      updatedAt: new Date(),
      lastUsed: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000), // Random date in last 7 days
      isActive: true
    });
  }
  
  console.log(`Successfully seeded ${apiKeysData.length} API keys`);
}

export async function resetAndSeedDatabase() {
  try {
    // Reset all database tables
    await resetDatabase();
    
    // Seed each entity type
    await seedAccounts();
    await seedContacts();
    await seedLeads();
    await seedOpportunities();
    await seedTasks();
    await seedEvents();
    await seedActivities();
    await seedSocialIntegrations();
    await seedLeadSources();
    await seedSocialCampaigns();
    await seedSocialMessages();
    // Removed seedWorkflows() call as the workflows table doesn't exist yet
    await seedApiKeys();
    
    console.log('Database reset and seed completed successfully!');
    
    return { success: true, message: 'Database reset and seed completed successfully!' };
  } catch (error) {
    console.error('Error during database reset and seed:', error);
    return { success: false, message: `Database reset and seed failed: ${error.message}` };
  }
}

// No need for additional exports, the function is already exported above