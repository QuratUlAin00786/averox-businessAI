import { db, pool } from '../server/db';
import { sql } from 'drizzle-orm';

async function createNotificationTables() {
  try {
    console.log('Checking if notifications table already exists...');
    
    // Check if notifications table exists
    const tableExistsResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'notifications'
      ) as exists
    `);
    
    if (!tableExistsResult.rows?.[0]?.exists) {
      console.log('Creating notifications table...');
      
      // Create notifications table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          link VARCHAR(255),
          read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('Notifications table created successfully!');
    } else {
      console.log('Notifications table already exists.');
    }
    
    // Check if messages table exists
    console.log('Checking if messages table already exists...');
    
    const messagesTableExistsResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'messages'
      ) as exists
    `);
    
    if (!messagesTableExistsResult.rows?.[0]?.exists) {
      console.log('Creating messages table...');
      
      // Create messages table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          read BOOLEAN DEFAULT FALSE,
          urgent BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('Messages table created successfully!');
    } else {
      console.log('Messages table already exists.');
    }
    
    // Add demo data for notifications and messages
    console.log('Adding demo notifications and messages...');
    
    // Get user IDs
    const usersResult = await db.execute(sql`
      SELECT id FROM users LIMIT 4
    `);
    
    if (usersResult.rows && usersResult.rows.length > 0) {
      const users = usersResult.rows;
      const adminId = users[0]?.id;
      
      // Only add demo data if we have users
      if (adminId) {
        // Add notifications for admin
        const notificationsExistResult = await db.execute(sql`
          SELECT COUNT(*) as count FROM notifications WHERE user_id = ${adminId}
        `);
        
        if (notificationsExistResult.rows?.[0]?.count === '0') {
          console.log('Adding demo notifications for admin user...');
          
          await db.execute(sql`
            INSERT INTO notifications (user_id, type, title, description, link, read, created_at)
            VALUES 
              (${adminId}, 'task', 'Task due soon', 'Proposal for ABC Corp is due in 2 days', '/tasks', FALSE, NOW() - INTERVAL '1 HOUR'),
              (${adminId}, 'meeting', 'Upcoming meeting', 'Strategy meeting with the sales team at 2:00 PM', '/calendar', FALSE, NOW() - INTERVAL '2 HOURS'),
              (${adminId}, 'opportunity', 'New opportunity', 'XYZ Inc. has shown interest in our premium plan', '/opportunities', TRUE, NOW() - INTERVAL '1 DAY'),
              (${adminId}, 'system', 'System update', 'The system will be undergoing maintenance tonight at midnight', NULL, TRUE, NOW() - INTERVAL '2 DAYS'),
              (${adminId}, 'task', 'Task completed', 'John Doe completed the quarterly report', '/tasks', TRUE, NOW() - INTERVAL '3 DAYS')
          `);
          
          console.log('Demo notifications added successfully!');
        } else {
          console.log('Admin user already has notifications.');
        }
        
        // Add messages
        const messagesExistResult = await db.execute(sql`
          SELECT COUNT(*) as count FROM messages WHERE recipient_id = ${adminId}
        `);
        
        if (messagesExistResult.rows?.[0]?.count === '0' && users.length > 1) {
          console.log('Adding demo messages...');
          
          // Get IDs for other users to use as senders
          const otherUserIds = users.filter(user => user.id !== adminId).map(user => user.id);
          
          if (otherUserIds.length > 0) {
            await db.execute(sql`
              INSERT INTO messages (sender_id, recipient_id, content, read, urgent, created_at)
              VALUES 
                (${otherUserIds[0]}, ${adminId}, 'Hi there! Just following up on our last conversation about the new project.', FALSE, FALSE, NOW() - INTERVAL '30 MINUTES'),
                (${otherUserIds.length > 1 ? otherUserIds[1] : otherUserIds[0]}, ${adminId}, 'Can you send me the quarterly sales report? I need it for the meeting tomorrow.', FALSE, TRUE, NOW() - INTERVAL '90 MINUTES'),
                (${otherUserIds.length > 2 ? otherUserIds[2] : otherUserIds[0]}, ${adminId}, 'The client loved our proposal! They want to schedule a call to discuss next steps.', TRUE, FALSE, NOW() - INTERVAL '12 HOURS')
            `);
            
            console.log('Demo messages added successfully!');
          } else {
            console.log('Not enough users to add demo messages.');
          }
        } else {
          console.log('Admin user already has messages.');
        }
      }
    }
    
    console.log('Notification tables and demo data setup complete!');
    
  } catch (error) {
    console.error('Error creating notification tables:', error);
  } finally {
    // Close the database connection pool
    await pool.end();
  }
}

// Run the function
createNotificationTables();