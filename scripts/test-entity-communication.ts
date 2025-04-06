import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import { storage } from '../server/storage';

dotenv.config();

async function main() {
  try {
    console.log('Testing entity-related communications functionality...');
    
    // Get first account to use as a test
    const accounts = await storage.listAccounts();
    if (accounts.length === 0) {
      console.error('No accounts found in the database. Please seed some accounts first.');
      return;
    }
    
    const account = accounts[0];
    console.log(`Using account: ${account.name} (ID: ${account.id})`);
    
    // Get first lead to use as a contact for the message
    const leads = await storage.listLeads();
    if (leads.length === 0) {
      console.error('No leads found in the database. Please seed some leads first.');
      return;
    }
    
    const lead = leads[0];
    console.log(`Using lead: ${lead.firstName} ${lead.lastName} (ID: ${lead.id})`);
    
    // Create a message related to the account
    console.log('Creating a new communication linked to the account...');
    const communication = await storage.createCommunication({
      contactId: lead.id,
      contactType: 'lead',
      channel: 'WhatsApp', // Using the value from socialPlatformEnum
      direction: 'Outbound', // Using communicationDirectionEnum value ('Inbound' or 'Outbound') with correct capitalization
      content: 'This is a test message linked to an account',
      status: 'Read', // Using communicationStatusEnum value ('Unread', 'Read', 'Replied', 'Archived') with correct capitalization
      relatedToType: 'account',
      relatedToId: account.id
    });
    
    console.log(`Created communication with ID: ${communication.id}`);
    
    // Fetch related communications for the account
    console.log(`Fetching communications related to account ${account.id}...`);
    const relatedCommunications = await storage.getRelatedCommunications('account', account.id);
    
    console.log(`Found ${relatedCommunications.length} communications related to the account:`);
    console.log(JSON.stringify(relatedCommunications, null, 2));
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

main().catch(console.error);