// Simple wrapper to run the reset-and-seed-database.ts script 
// with proper TypeScript support using tsx

import { resetAndSeedDatabase } from './reset-and-seed-database.js';

async function main() {
  try {
    console.log('Starting database reset and seed process...');
    const result = await resetAndSeedDatabase();
    console.log('Reset and seed process result:', result);
  } catch (error) {
    console.error('Failed to reset and seed database:', error);
  }
}

main();