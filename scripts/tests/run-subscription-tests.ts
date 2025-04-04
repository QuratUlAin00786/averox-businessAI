#!/usr/bin/env tsx

import { execSync } from 'child_process';
import path from 'path';

// Make sure server is running before running tests
console.log('🚀 Make sure your server is running on http://localhost:3000 before running this test!');
console.log('Press Ctrl+C to abort if the server is not running...');

// Give a few seconds to abort if needed
setTimeout(() => {
  console.log('Running subscription cancellation test...');
  try {
    execSync('tsx scripts/tests/test-subscription-cancellation.ts', { 
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '../..')
    });
    console.log('Subscription cancellation test completed! ✅');
  } catch (error) {
    console.error('Subscription test failed! ❌');
    process.exit(1);
  }
}, 3000);