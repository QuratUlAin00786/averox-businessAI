import postgres from 'postgres';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file URL and convert to path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function addLocationFields() {
  console.log('Adding location fields to accounts table...');

  try {
    // Connect to database
    const sql = postgres(process.env.DATABASE_URL!);

    // Check if columns already exist
    const checkResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'accounts' AND column_name = 'address'
    `;

    if (checkResult.length > 0) {
      console.log('Location fields already exist in accounts table.');
      await sql.end();
      return;
    }

    // Add new columns
    await sql`
      ALTER TABLE accounts
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS city TEXT,
      ADD COLUMN IF NOT EXISTS state TEXT,
      ADD COLUMN IF NOT EXISTS zip TEXT,
      ADD COLUMN IF NOT EXISTS country TEXT
    `;

    console.log('Location fields successfully added to accounts table.');
    await sql.end();
  } catch (error) {
    console.error('Error adding location fields:', error);
    process.exit(1);
  }
}

// Self-execute if run directly
// In ESM, there is no direct equivalent to require.main === module
// so we check if the import.meta.url is the same as the process.argv[1]
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  addLocationFields()
    .then(() => {
      console.log('Location fields migration completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default addLocationFields;