import { db } from "../server/db";
import { notifications, messages } from "../shared/schema";

// This script pushes schema updates to the database
async function main() {
  console.log("Pushing schema updates...");
  
  try {
    // Run the db:push command
    await db.execute(`
      -- Ensure notifications table exists
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "type" notification_type DEFAULT 'system',
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "read" BOOLEAN DEFAULT false,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "link" TEXT,
        "related_to_type" TEXT,
        "related_to_id" INTEGER
      );
      
      -- Ensure messages table exists
      CREATE TABLE IF NOT EXISTS "messages" (
        "id" SERIAL PRIMARY KEY,
        "sender_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "recipient_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "content" TEXT NOT NULL,
        "read" BOOLEAN DEFAULT false,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "urgent" BOOLEAN DEFAULT false
      );
    `);
    
    console.log("Schema updates applied successfully!");
  } catch (error) {
    console.error("Error pushing schema:", error);
  }
}

main()
  .then(() => {
    console.log("Done");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error pushing schema:", error);
    process.exit(1);
  });