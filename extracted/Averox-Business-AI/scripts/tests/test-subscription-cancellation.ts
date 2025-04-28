import fetch from 'node-fetch';
import { storage } from '../../server/storage';
import dotenv from 'dotenv';
import Stripe from 'stripe';

// Load environment variables
dotenv.config();

const API_BASE_URL = 'http://localhost:3000/api';

// Mock credentials for testing
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'adminpass'
};

async function main() {
  try {
    console.log('🔍 Testing Subscription Cancellation...');
    console.log('=====================================');

    // Initialize Stripe client
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });

    // Step 1: Set up testing environment
    console.log('1️⃣ Setting up test environment...');
    
    // Create a test user
    const loginResponse = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ADMIN_CREDENTIALS),
      credentials: 'include'
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Failed to log in: ${loginResponse.status} ${loginResponse.statusText}`);
    }
    
    const user = await loginResponse.json();
    console.log(`✅ Logged in as admin (id: ${user.id})`);

    // Step 2: Create a subscription package
    console.log('2️⃣ Creating test subscription package...');
    
    const testPackage = {
      name: 'Test Package',
      description: 'Test package for cancellation testing',
      price: '99.99',
      interval: 'monthly',
      stripePriceId: 'price_test_123',
      features: ['Feature 1', 'Feature 2'],
      maxUsers: 5,
      maxContacts: 1000,
      maxStorage: 10,
      isActive: true,
      displayOrder: 999
    };
    
    const packageResponse = await fetch(`${API_BASE_URL}/subscription-packages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPackage),
      credentials: 'include'
    });
    
    if (!packageResponse.ok) {
      throw new Error(`Failed to create package: ${packageResponse.status} ${packageResponse.statusText}`);
    }
    
    const createdPackage = await packageResponse.json();
    console.log(`✅ Created test package (id: ${createdPackage.id})`);

    // Step 3: Create a user subscription directly (skipping Stripe for test)
    console.log('3️⃣ Creating test user subscription...');
    
    const subscriptionData = {
      userId: user.id,
      packageId: createdPackage.id,
      stripeSubscriptionId: 'sub_test_123',
      status: 'Active',
      startDate: new Date(),
      endDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days later
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)),
      canceledAt: null,
      trialEndsAt: null
    };
    
    const subscription = await storage.createUserSubscription(subscriptionData);
    console.log(`✅ Created test subscription (id: ${subscription.id})`);

    // Step 4: Test cancellation
    console.log('4️⃣ Testing subscription cancellation...');
    
    // Mock the Stripe subscription cancellation
    console.log('🔹 Mocking Stripe subscription cancellation...');
    console.log(`This would normally call: stripe.subscriptions.cancel('${subscriptionData.stripeSubscriptionId}')`);
    
    // Call our API endpoint for cancellation
    const cancelResponse = await fetch(`${API_BASE_URL}/user-subscriptions/${subscription.id}/cancel`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!cancelResponse.ok) {
      throw new Error(`Failed to cancel subscription: ${cancelResponse.status} ${cancelResponse.statusText}`);
    }
    
    const canceledSubscription = await cancelResponse.json();
    console.log('✅ Subscription cancellation response:', canceledSubscription);

    // Step 5: Verify cancellation
    console.log('5️⃣ Verifying cancellation state...');
    
    const verifyResponse = await fetch(`${API_BASE_URL}/user-subscriptions/${subscription.id}`, {
      credentials: 'include'
    });
    
    if (!verifyResponse.ok) {
      throw new Error(`Failed to verify subscription: ${verifyResponse.status} ${verifyResponse.statusText}`);
    }
    
    const verifiedSubscription = await verifyResponse.json();
    console.log('📋 Verified subscription state:', verifiedSubscription);
    
    if (verifiedSubscription.status !== 'Canceled') {
      throw new Error(`Subscription status is not 'Canceled', found '${verifiedSubscription.status}' instead`);
    }
    
    if (!verifiedSubscription.canceledAt) {
      throw new Error('Subscription canceledAt date is not set');
    }
    
    console.log('✅ Subscription cancellation successful!');
    console.log('=====================================');

    // Step 6: Clean up
    console.log('6️⃣ Cleaning up test data...');
    
    // Delete the test subscription from database
    try {
      await storage.deleteUserSubscription(subscription.id);
      console.log('✅ Deleted test subscription');
    } catch (error) {
      console.log('⚠️ Could not delete test subscription:', error);
    }
    
    // Delete the test package
    try {
      await fetch(`${API_BASE_URL}/subscription-packages/${createdPackage.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      console.log('✅ Deleted test package');
    } catch (error) {
      console.log('⚠️ Could not delete test package:', error);
    }
    
    console.log('🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

main();