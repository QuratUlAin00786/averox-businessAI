import postgres from 'postgres';
import 'dotenv/config';
import { fileURLToPath } from 'url';

// Get current file URL and convert to path
const __filename = fileURLToPath(import.meta.url);

async function seedAccountData() {
  console.log('Seeding sample account data...');

  try {
    // Connect to database
    const sql = postgres(process.env.DATABASE_URL!);

    // Sample account data
    const sampleAccounts = [
      {
        name: 'Acme Corporation',
        industry: 'Technology',
        website: 'https://acmecorp.example.com',
        phone: '123-456-7890',
        email: 'info@acmecorp.example.com',
        billingAddress: '123 Billing St',
        billingCity: 'Billing City',
        billingState: 'BS',
        billingZip: '12345',
        billingCountry: 'USA',
        address: '456 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94107',
        country: 'USA',
        ownerId: 2, // Assuming user ID 2 exists
        annualRevenue: 5000000,
        employeeCount: 150,
        notes: 'Key enterprise account with multiple product lines',
        isActive: true,
        type: 'Enterprise',
        numberOfEmployees: 150
      },
      {
        name: 'Global Industries',
        industry: 'Manufacturing',
        website: 'https://globalind.example.com',
        phone: '987-654-3210',
        email: 'contact@globalind.example.com',
        billingAddress: '789 Invoice Rd',
        billingCity: 'Invoice City',
        billingState: 'IN',
        billingZip: '67890',
        billingCountry: 'USA',
        address: '101 Factory Ave',
        city: 'Chicago',
        state: 'IL',
        zip: '60601',
        country: 'USA',
        ownerId: 2, // Assuming user ID 2 exists
        annualRevenue: 12000000,
        employeeCount: 350,
        notes: 'Manufacturing partner with international presence',
        isActive: true,
        type: 'Enterprise',
        numberOfEmployees: 350
      },
      {
        name: 'Startup Innovations',
        industry: 'Software',
        website: 'https://startupinnovations.example.com',
        phone: '555-123-4567',
        email: 'hello@startupinnovations.example.com',
        billingAddress: '42 Startup Blvd',
        billingCity: 'Austin',
        billingState: 'TX',
        billingZip: '73301',
        billingCountry: 'USA',
        address: '42 Startup Blvd',
        city: 'Austin',
        state: 'TX',
        zip: '73301',
        country: 'USA',
        ownerId: 2, // Assuming user ID 2 exists
        annualRevenue: 750000,
        employeeCount: 25,
        notes: 'Growing SaaS company with innovative AI products',
        isActive: true,
        type: 'SMB',
        numberOfEmployees: 25
      }
    ];

    // First check if we already have accounts
    const existingAccounts = await sql`SELECT COUNT(*) FROM accounts`;
    if (existingAccounts[0].count > 0) {
      console.log(`Found ${existingAccounts[0].count} existing accounts. Skipping seed.`);
      await sql.end();
      return;
    }

    // Insert sample accounts
    for (const account of sampleAccounts) {
      await sql`
        INSERT INTO accounts ${sql(account)}
      `;
    }

    console.log(`Successfully seeded ${sampleAccounts.length} accounts.`);
    await sql.end();
  } catch (error) {
    console.error('Error seeding account data:', error);
    process.exit(1);
  }
}

// Self-execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedAccountData()
    .then(() => {
      console.log('Account data seeding completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export default seedAccountData;