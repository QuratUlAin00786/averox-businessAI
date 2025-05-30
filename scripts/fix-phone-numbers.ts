import { db } from '../server/db';
import { accounts, contacts, leads } from '../shared/schema';

async function fixPhoneNumbers() {
  console.log('Checking and fixing phone number formatting...');
  
  try {
    // Get all accounts with potential phone number issues
    const allAccounts = await db.select().from(accounts);
    console.log(`Found ${allAccounts.length} accounts to check`);
    
    for (const account of allAccounts) {
      console.log(`Account ${account.id}: "${account.name}" - Phone: "${account.phone}"`);
      
      // Check if phone number has unusual characters or length
      if (account.phone && (account.phone.length > 20 || /[^0-9\-\(\)\+\.\s]/.test(account.phone))) {
        console.log(`⚠️  Suspicious phone number for ${account.name}: "${account.phone}"`);
        
        // Clean up phone number - keep only digits, dashes, parentheses, plus, and spaces
        const cleanPhone = account.phone.replace(/[^0-9\-\(\)\+\.\s]/g, '').trim();
        if (cleanPhone !== account.phone) {
          console.log(`  → Cleaning: "${account.phone}" → "${cleanPhone}"`);
          // You could uncomment this to actually update:
          // await db.update(accounts).set({ phone: cleanPhone }).where(eq(accounts.id, account.id));
        }
      }
    }
    
    // Check contacts
    const allContacts = await db.select().from(contacts);
    console.log(`\nFound ${allContacts.length} contacts to check`);
    
    for (const contact of allContacts) {
      if (contact.phone) {
        console.log(`Contact ${contact.id}: "${contact.firstName} ${contact.lastName}" - Phone: "${contact.phone}"`);
        
        if (contact.phone.length > 20 || /[^0-9\-\(\)\+\.\s]/.test(contact.phone)) {
          console.log(`⚠️  Suspicious phone number for ${contact.firstName} ${contact.lastName}: "${contact.phone}"`);
        }
      }
    }
    
    // Check leads
    const allLeads = await db.select().from(leads);
    console.log(`\nFound ${allLeads.length} leads to check`);
    
    for (const lead of allLeads) {
      if (lead.phone) {
        console.log(`Lead ${lead.id}: "${lead.firstName} ${lead.lastName}" - Phone: "${lead.phone}"`);
        
        if (lead.phone.length > 20 || /[^0-9\-\(\)\+\.\s]/.test(lead.phone)) {
          console.log(`⚠️  Suspicious phone number for ${lead.firstName} ${lead.lastName}: "${lead.phone}"`);
        }
      }
    }
    
    console.log('\nPhone number check completed!');
    
  } catch (error) {
    console.error('Error checking phone numbers:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

fixPhoneNumbers().catch(console.error);