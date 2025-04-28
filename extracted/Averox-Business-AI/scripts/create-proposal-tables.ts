import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('Creating proposal tables in the database...');
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 1 });
  
  try {
    // Create enum types
    await createEnumTypes(sql);
    
    // Create tables
    await createTables(sql);
    
    console.log('Proposal tables created successfully');
  } catch (error) {
    console.error('Error creating proposal tables:', error);
  } finally {
    await sql.end();
  }
}

async function createEnumTypes(sql: postgres.Sql) {
  const enumQueries = [
    `DO $$ BEGIN
      CREATE TYPE proposal_status AS ENUM ('Draft', 'Sent', 'Accepted', 'Rejected', 'Expired', 'Revoked');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    
    `DO $$ BEGIN
      CREATE TYPE proposal_element_type AS ENUM ('Header', 'Text', 'Image', 'Table', 'List', 'Quote', 'ProductList', 'Signature', 'PageBreak', 'Custom');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`
  ];
  
  try {
    for (const query of enumQueries) {
      await sql.unsafe(query);
    }
    console.log('Proposal enum types created successfully');
  } catch (error) {
    console.error('Error creating proposal enum types:', error);
    throw error;
  }
}

async function createTables(sql: postgres.Sql) {
  const tableQueries = [
    // Proposal Templates table
    `CREATE TABLE IF NOT EXISTS proposal_templates (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      content JSONB NOT NULL,
      thumbnail TEXT,
      is_default BOOLEAN DEFAULT FALSE,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE,
      category TEXT,
      tags TEXT[]
    )`,
    
    // Proposals table
    `CREATE TABLE IF NOT EXISTS proposals (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      opportunity_id INTEGER REFERENCES opportunities(id) NOT NULL,
      account_id INTEGER REFERENCES accounts(id) NOT NULL,
      status proposal_status DEFAULT 'Draft',
      content JSONB NOT NULL,
      template_id INTEGER REFERENCES proposal_templates(id),
      created_by INTEGER REFERENCES users(id) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP,
      sent_at TIMESTAMP,
      expires_at TIMESTAMP,
      accepted_at TIMESTAMP,
      rejected_at TIMESTAMP,
      total_amount NUMERIC,
      currency TEXT DEFAULT 'USD',
      version_number INTEGER DEFAULT 1,
      previous_version_id INTEGER REFERENCES proposals(id),
      settings JSONB,
      metadata JSONB
    )`,
    
    // Proposal Elements table
    `CREATE TABLE IF NOT EXISTS proposal_elements (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      element_type proposal_element_type NOT NULL,
      content JSONB NOT NULL,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP,
      is_global BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      category TEXT DEFAULT 'General',
      thumbnail TEXT,
      proposal_id INTEGER REFERENCES proposals(id),
      sort_order INTEGER
    )`,
    
    // Proposal Collaborators table
    `CREATE TABLE IF NOT EXISTS proposal_collaborators (
      id SERIAL PRIMARY KEY,
      proposal_id INTEGER REFERENCES proposals(id) NOT NULL,
      user_id INTEGER REFERENCES users(id) NOT NULL,
      role TEXT DEFAULT 'Editor',
      added_by INTEGER REFERENCES users(id),
      added_at TIMESTAMP DEFAULT NOW(),
      last_accessed TIMESTAMP,
      notifications BOOLEAN DEFAULT TRUE
    )`,
    
    // Proposal Comments table
    `CREATE TABLE IF NOT EXISTS proposal_comments (
      id SERIAL PRIMARY KEY,
      proposal_id INTEGER REFERENCES proposals(id) NOT NULL,
      user_id INTEGER REFERENCES users(id) NOT NULL,
      content TEXT NOT NULL,
      element_path TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP,
      parent_id INTEGER REFERENCES proposal_comments(id),
      resolved BOOLEAN DEFAULT FALSE,
      resolved_by INTEGER REFERENCES users(id),
      resolved_at TIMESTAMP
    )`,
    
    // Proposal Activities table
    `CREATE TABLE IF NOT EXISTS proposal_activities (
      id SERIAL PRIMARY KEY,
      proposal_id INTEGER REFERENCES proposals(id) NOT NULL,
      user_id INTEGER REFERENCES users(id),
      activity_type TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      metadata JSONB
    )`
  ];
  
  try {
    for (const query of tableQueries) {
      await sql.unsafe(query);
    }
    console.log('Proposal tables created successfully');
  } catch (error) {
    console.error('Error creating proposal tables:', error);
    throw error;
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});