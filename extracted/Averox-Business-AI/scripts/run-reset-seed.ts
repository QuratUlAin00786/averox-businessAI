import { resetAndSeedDatabase } from './reset-and-seed-database';

// Execute the reset and seed function
resetAndSeedDatabase()
  .then((result) => {
    console.log(result.message);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Error executing reset and seed script:', error);
    process.exit(1);
  });