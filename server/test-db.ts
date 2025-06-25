// Add this to your server/index.ts or create a separate test file
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found in environment variables');
      return;
    }
    
    // Parse the connection string to show user info (without password)
    const url = new URL(process.env.DATABASE_URL);
    console.log('📊 Connection Details:');
    console.log(`   Host: ${url.hostname}`);
    console.log(`   Port: ${url.port || 5432}`);
    console.log(`   Database: ${url.pathname.slice(1)}`);
    console.log(`   Username: ${url.username}`);
    console.log(`   Password: ${'*'.repeat(url.password?.length || 0)}`);
    
    // Test the actual connection
    const sql = neon(process.env.DATABASE_URL);
    
    // Query to get current user and database info
    const result = await sql`
      SELECT 
        current_user as username,
        current_database() as database_name,
        version() as postgres_version,
        now() as current_time
    `;
    
    console.log('✅ Database connection successful!');
    console.log('📋 Connection Info:', result[0]);
    
    // Test a simple query to ensure permissions
    const permissionTest = await sql`
      SELECT 
        has_database_privilege(current_user, current_database(), 'CREATE') as can_create,
        has_database_privilege(current_user, current_database(), 'CONNECT') as can_connect,
        current_setting('is_superuser') as is_superuser
    `;
    
    console.log('🔐 User Permissions:', permissionTest[0]);
    
    return true;
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Provide specific error handling
    if (error.message.includes('password authentication failed')) {
      console.error('🔑 Issue: Wrong username or password');
    } else if (error.message.includes('does not exist')) {
      console.error('🗄️  Issue: Database or user does not exist');
    } else if (error.message.includes('connection refused')) {
      console.error('🌐 Issue: Cannot connect to database server');
    } else if (error.message.includes('timeout')) {
      console.error('⏱️  Issue: Connection timeout - check network/firewall');
    }
    
    return false;
  }
}

// Run the test
testDatabaseConnection();