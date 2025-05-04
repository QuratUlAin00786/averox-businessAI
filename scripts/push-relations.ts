import { db } from "../server/db";
import { relations } from "drizzle-orm";
import { messages, notifications, users } from "../shared/schema";

// This script is used to push schema relations to the database
console.log("Pushing schema relations...");

// Define the relations for the messages table
const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id],
  }),
}));

// Define the relations for the notifications table
const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

async function main() {
  // Nothing to do here for relations, they're managed by Drizzle ORM
  console.log("Relations defined successfully!");
}

main()
  .then(() => {
    console.log("Done");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error pushing relations:", error);
    process.exit(1);
  });