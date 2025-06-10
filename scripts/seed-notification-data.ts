import { db } from "../server/db";
import { messages, notifications, users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function seedNotificationData() {
  console.log("Seeding notification and message data...");
  
  try {
    // First check if we have users
    const allUsers = await db.select().from(users);
    
    if (allUsers.length === 0) {
      console.error("No users found in the database. Please seed users first.");
      return;
    }
    
    // Check if we already have notifications
    const existingNotifications = await db.select().from(notifications);
    
    if (existingNotifications.length === 0) {
      console.log("Creating sample notifications...");
      
      for (const user of allUsers) {
        // Create some notifications for each user
        await db.insert(notifications).values([
          {
            userId: user.id,
            type: 'task',
            title: 'Task Reminder',
            description: 'Complete the weekly report by tomorrow',
            read: false,
            link: '/tasks'
          },
          {
            userId: user.id,
            type: 'meeting',
            title: 'Upcoming Meeting',
            description: 'Strategy session scheduled for tomorrow at 10:00 AM',
            read: user.id === 1, // First user has read this
            link: '/calendar'
          },
          {
            userId: user.id,
            type: 'system',
            title: 'System Update',
            description: 'The system will be updated tonight at 12:00 AM',
            read: false
          }
        ]);
      }
      
      console.log("Sample notifications created successfully!");
    } else {
      console.log(`${existingNotifications.length} notifications already exist, skipping sample data`);
    }
    
    // Check if we already have messages
    const existingMessages = await db.select().from(messages);
    
    if (existingMessages.length === 0) {
      console.log("Creating sample messages...");
      
      // Create messages between users
      for (let i = 0; i < allUsers.length; i++) {
        const sender = allUsers[i];
        const recipient = allUsers[(i + 1) % allUsers.length]; // Next user in the list, loops back
        
        await db.insert(messages).values([
          {
            senderId: sender.id,
            recipientId: recipient.id,
            content: `Hello, this is a test message from ${sender.firstName || sender.username}!`,
            read: false,
            urgent: false
          },
          {
            senderId: sender.id,
            recipientId: recipient.id,
            content: `I wanted to discuss our upcoming project plans. Can we schedule a meeting?`,
            read: false,
            urgent: true
          }
        ]);
        
        // Create notification for the message
        await db.insert(notifications).values({
          userId: recipient.id,
          type: 'message',
          title: 'New Message',
          description: `You have new messages from ${sender.firstName || sender.username}`,
          read: false,
          link: '/communication-center'
        });
      }
      
      console.log("Sample messages created successfully!");
    } else {
      console.log(`${existingMessages.length} messages already exist, skipping sample data`);
    }
    
    console.log("Notification and message data seeding complete!");
  } catch (error) {
    console.error("Error seeding notification data:", error);
    throw error;
  }
}

// Run the function immediately
seedNotificationData()
  .then(() => {
    console.log('Notification data seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding notification data:', error);
    process.exit(1);
  });