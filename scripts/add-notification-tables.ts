import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { notifications, messages } from '../shared/schema';
import { sql } from 'drizzle-orm';

/**
 * This script adds notification and messages tables to the database
 * to make the system fully database-driven without static data
 */
async function addNotificationTables() {
  console.log('Adding notification and message tables to the database...');
  
  // Connect to the database
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  const client = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(client);
  
  try {
    // Create enum type for notification_type if it doesn't exist
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
          CREATE TYPE notification_type AS ENUM (
            'task', 'meeting', 'opportunity', 'lead', 'system', 'message'
          );
        END IF;
      END
      $$;
    `);
    
    console.log('Created notification_type enum if needed');
    
    // Create notifications table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        type notification_type DEFAULT 'system'::notification_type,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        link TEXT,
        related_to_type TEXT,
        related_to_id INTEGER
      );
    `);
    
    console.log('Created notifications table if needed');
    
    // Create messages table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id),
        recipient_id INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        urgent BOOLEAN DEFAULT false
      );
    `);
    
    console.log('Created messages table if needed');
    
    // Add some sample notifications for existing users
    const users = await db.execute(sql`SELECT id FROM users`);
    
    if (users.length > 0) {
      const adminId = users[0].id;
      
      // Check if notifications already exist
      const existingNotifications = await db.execute(sql`SELECT COUNT(*) as count FROM notifications`);
      
      if (existingNotifications[0].count === 0) {
        // Add sample notifications only if none exist yet
        await db.execute(sql`
          INSERT INTO notifications (user_id, type, title, description, read, link)
          VALUES
            (${adminId}, 'task'::notification_type, 'Task reminder', 'You have a task "Client follow-up" due today', false, '/tasks'),
            (${adminId}, 'meeting'::notification_type, 'Meeting scheduled', 'Product demo with Acme Corp at 2:00 PM', false, '/calendar'),
            (${adminId}, 'opportunity'::notification_type, 'Opportunity updated', 'Deal "Enterprise solution" moved to Qualification stage', true, '/opportunities'),
            (${adminId}, 'system'::notification_type, 'System update', 'New features available - Accounting module now live', true, '/accounting'),
            (${adminId}, 'task'::notification_type, 'Task assigned', 'You have been assigned to "Prepare quarterly report"', true, '/tasks')
        `);
        
        console.log('Added sample notifications for admin user');
      } else {
        console.log('Notifications already exist, skipping sample data');
      }
      
      // Add sample messages if none exist
      const existingMessages = await db.execute(sql`SELECT COUNT(*) as count FROM messages`);
      
      if (existingMessages[0].count === 0 && users.length >= 2) {
        // Get a second user to be the sender
        const secondUserId = users.length > 1 ? users[1].id : adminId;
        
        await db.execute(sql`
          INSERT INTO messages (sender_id, recipient_id, content, read, urgent)
          VALUES
            (${secondUserId}, ${adminId}, 'Hi there, can we discuss the proposal for XYZ Corp?', false, true),
            (${secondUserId}, ${adminId}, 'The client meeting went well. They''re interested in our premium package.', false, false),
            (${secondUserId}, ${adminId}, 'Please review the latest design mockups when you get a chance.', true, false),
            (${secondUserId}, ${adminId}, 'Just following up on our conversation from yesterday about the marketing strategy.', true, false)
        `);
        
        console.log('Added sample messages between users');
      } else {
        console.log('Messages already exist, skipping sample data');
      }
    }
    
    console.log('Notification and messages tables setup complete');
  } catch (error) {
    console.error('Error setting up notification tables:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the function immediately
addNotificationTables()
  .then(() => {
    console.log('Notification tables setup successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error setting up notification tables:', error);
    process.exit(1);
  });

export { addNotificationTables };