/**
 * Script to create demo accounts and create a self-hosted package
 * Run with: node scripts/run-create-demo-accounts.js
 */

import { execSync } from 'child_process';

console.log('Creating AVEROX CRM demo accounts...');

// Use a simpler approach - execSync
try {
  console.log('\n1. Creating sample demo accounts...');
  // The system should already have sample data from previous seeding operations
  // Just create the demo accounts
  console.log('Running database user creation directly...');
  execSync('npx tsx server/create-demo-users.ts', { stdio: 'inherit' });
  
  console.log('\n2. Creating hosted package files...');
  execSync('npx tsx scripts/create-hosted-package.ts', { stdio: 'inherit' });
  
  console.log('\n✅ Successfully created demo accounts and hosting package!');
  console.log('\nDemo Admin Credentials:');
  console.log('Username: demoadmin');
  console.log('Password: demoadmin123');
  console.log('\nDemo User Credentials:');
  console.log('Username: demouser');
  console.log('Password: demouser123');
  console.log('\nUse the files package.hosted.json and README.hosted.md when setting up a self-hosted instance.');
} catch (error) {
  console.error('Error during demo account creation:', error);
  console.log('Attempting to continue with package creation...');
  
  try {
    execSync('npx tsx scripts/create-hosted-package.ts', { stdio: 'inherit' });
    console.log('\nHosted package files created successfully.');
  } catch (packageError) {
    console.error('Error creating hosted package:', packageError);
  }
}