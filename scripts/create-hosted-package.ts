/**
 * This script creates a package.json specifically for a self-hosted version of the AVEROX CRM system
 * This creates a production-ready package.json with proper scripts for hosting
 */

import fs from 'fs';
import path from 'path';

async function createHostedPackageJson() {
  console.log('Creating package.json for hosted version of AVEROX CRM...');
  
  const originalPackageJsonPath = path.resolve('./package.json');
  const hostedPackageJsonPath = path.resolve('./package.hosted.json');
  
  try {
    // Read the original package.json
    const packageJsonContent = await fs.promises.readFile(originalPackageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    
    // Create a modified version for hosting
    const hostedPackageJson = {
      ...packageJson,
      name: "averox-crm-hosted",
      version: packageJson.version || "1.0.0",
      description: "AVEROX CRM - Self-hosted version",
      scripts: {
        "start": "node dist/server/index.js",
        "build": "tsc && vite build",
        "seed": "node dist/scripts/create-demo-accounts-simple.js",
        "postinstall": "npm run build",
        "db:setup": "node dist/scripts/push-schema-non-interactive.js",
        "db:seed": "node dist/scripts/create-demo-accounts-simple.js"
      },
      engines: {
        "node": ">=16.0.0",
        "npm": ">=7.0.0"
      }
    };
    
    // Create a README file for hosting
    const readmeContent = `# AVEROX CRM - Self-hosted Version

This is the self-hosted version of AVEROX CRM, a comprehensive customer relationship management system.

## Setup Instructions

1. **Prerequisites:**
   - Node.js 16 or higher
   - PostgreSQL database
   - Set DATABASE_URL environment variable with your PostgreSQL connection string

2. **Installation:**
   \`\`\`
   npm install
   \`\`\`

3. **Setup Database:**
   \`\`\`
   npm run db:setup
   \`\`\`

4. **Create Demo Data (Optional):**
   \`\`\`
   npm run db:seed
   \`\`\`

5. **Start Server:**
   \`\`\`
   npm start
   \`\`\`

6. **Access the Application:**
   - Open your browser and navigate to http://localhost:5000

## Demo Accounts

Once you run the seed script, you'll have access to the following demo accounts:

### Admin Access
- Username: demoadmin
- Password: demoadmin123

### User Access
- Username: demouser
- Password: demouser123

## Environment Variables

Create a \`.env\` file with the following variables:

\`\`\`
DATABASE_URL=postgres://user:password@host:port/database
PORT=5000 (optional, defaults to 5000)
SESSION_SECRET=your-secret-key
\`\`\`

## Support

For support, please contact support@averox.com

`;

    // Write the hosted package.json and README
    await fs.promises.writeFile(hostedPackageJsonPath, JSON.stringify(hostedPackageJson, null, 2));
    await fs.promises.writeFile(path.resolve('./README.hosted.md'), readmeContent);
    
    console.log('✅ Created package.hosted.json for self-hosted version');
    console.log('✅ Created README.hosted.md with installation instructions');
    console.log('\nTo create a self-hosted package:');
    console.log('1. Rename package.hosted.json to package.json');
    console.log('2. Rename README.hosted.md to README.md');
    console.log('3. Build the project with npm run build');
    console.log('4. Package the dist directory along with the package.json and README.md');
  } catch (error) {
    console.error('Error creating hosted package files:', error);
  }
}

// Run the function
createHostedPackageJson()
  .catch(console.error)
  .finally(() => process.exit(0));