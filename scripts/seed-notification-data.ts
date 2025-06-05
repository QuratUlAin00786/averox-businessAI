/**
 * DEPRECATED: Script disabled to enforce 100% authentic data
 * System now requires real user registration and authentic data sources
 * No fake or synthetic data generation permitted
 */

async function seedNotificationData() {
  console.log("Notification seeding disabled - system requires authentic data only");
  console.log("Please use real user registration and data sources");
  process.exit(0);
}

// Entry point for when script is run directly
if (require.main === module) {
  seedNotificationData().catch(console.error);
}

export { seedNotificationData };