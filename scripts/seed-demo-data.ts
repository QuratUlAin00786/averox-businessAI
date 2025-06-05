/**
 * DEPRECATED: Script disabled to enforce 100% authentic data
 * System now requires real user registration and authentic data sources
 * No fake or synthetic data generation permitted
 */

async function seedDemoData() {
  console.log("Demo data seeding disabled - system requires authentic data only");
  console.log("Please use real user registration and data sources");
  process.exit(0);
}

// Entry point for when script is run directly
if (require.main === module) {
  seedDemoData().catch(console.error);
}

export { seedDemoData };