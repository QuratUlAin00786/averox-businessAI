import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not defined');
  process.exit(1);
}

async function main() {
  console.log('Starting migration to add relation fields to social_messages table...');
  
  const migrationClient = postgres(DATABASE_URL);
  const db = drizzle(migrationClient);
  
  try {
    // Add related_to_type column
    await migrationClient`
      ALTER TABLE social_messages
      ADD COLUMN IF NOT EXISTS related_to_type TEXT NULL;
    `;
    console.log('Successfully added related_to_type column to social_messages table');
    
    // Add related_to_id column
    await migrationClient`
      ALTER TABLE social_messages
      ADD COLUMN IF NOT EXISTS related_to_id INTEGER NULL;
    `;
    console.log('Successfully added related_to_id column to social_messages table');
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

main().catch((error) => {
  console.error('Unhandled error during migration:', error);
  process.exit(1);
});