import { db } from './server/db.js';
import { systemSettings } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function clearMenuCache() {
  try {
    console.log('Clearing cached menu items...');
    const result = await db.delete(systemSettings)
      .where(eq(systemSettings.settingKey, 'menuItems'));
    console.log('Menu cache cleared! The system will regenerate with Integrations.');
    console.log('Please refresh your browser to see the new Integrations menu.');
  } catch (error) {
    console.log('Error:', error.message);
  }
  process.exit(0);
}

clearMenuCache();