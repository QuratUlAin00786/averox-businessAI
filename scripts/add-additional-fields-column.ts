import postgres from "postgres";
import { config } from "dotenv";

config();

// Connect to database
const sql = postgres(process.env.DATABASE_URL || "");

async function addAdditionalFieldsColumn() {
  try {
    console.log("Adding additional_fields column to api_keys table...");
    
    // Check if column already exists
    const columnExists = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'api_keys'
      AND column_name = 'additional_fields'
    `;

    if (columnExists.length > 0) {
      console.log("Column additional_fields already exists. Skipping...");
      return;
    }

    // Add the column
    await sql`
      ALTER TABLE api_keys
      ADD COLUMN additional_fields JSONB
    `;

    console.log("Successfully added additional_fields column to api_keys table.");
  } catch (error) {
    console.error("Error adding additional_fields column:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run the migration
addAdditionalFieldsColumn()
  .then(() => {
    console.log("Migration completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });