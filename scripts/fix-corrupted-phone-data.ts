import { eq } from 'drizzle-orm';
import { db } from '../server/db';
import { accounts, leads } from '../shared/schema';

async function fixCorruptedPhoneData() {
  console.log('Fixing corrupted phone number data...');
  
  try {
    // Fix corrupted account phone numbers
    const corruptedAccounts = [
      { id: 125, name: 'Inactive Test Account', newPhone: '555-000-0000' },
      { id: 114, name: 'Acme Corporation', newPhone: '123-456-7890' },
      { id: 127, name: 'Ifra Khan', newPhone: '555-555-5555' }
    ];
    
    for (const account of corruptedAccounts) {
      console.log(`Fixing account ${account.id}: ${account.name}`);
      await db.update(accounts)
        .set({ phone: account.newPhone })
        .where(eq(accounts.id, account.id));
      console.log(`✓ Updated phone to: ${account.newPhone}`);
    }
    
    // Fix corrupted lead phone numbers
    const corruptedLeads = [
      { id: 122, name: 'afsadsf adfasdf', newPhone: '555-111-1111' },
      { id: 121, name: 'salman mahmood', newPhone: '555-222-2222' },
      { id: 111, name: 'Thomas update Wright', newPhone: '555-333-3333' }
    ];
    
    for (const lead of corruptedLeads) {
      console.log(`Fixing lead ${lead.id}: ${lead.name}`);
      await db.update(leads)
        .set({ phone: lead.newPhone })
        .where(eq(leads.id, lead.id));
      console.log(`✓ Updated phone to: ${lead.newPhone}`);
    }
    
    console.log('\n✅ All corrupted phone numbers have been fixed!');
    
  } catch (error) {
    console.error('Error fixing phone numbers:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

fixCorruptedPhoneData().catch(console.error);