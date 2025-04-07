# AVEROX CRM - Self-hosted Version

This is the self-hosted version of AVEROX CRM, a comprehensive customer relationship management system.

## Setup Instructions

1. **Prerequisites:**
   - Node.js 16 or higher
   - PostgreSQL database
   - Set DATABASE_URL environment variable with your PostgreSQL connection string

2. **Installation:**
   ```
   npm install
   ```

3. **Setup Database:**
   ```
   npm run db:setup
   ```

4. **Create Demo Data (Optional):**
   ```
   npm run db:seed
   ```

5. **Start Server:**
   ```
   npm start
   ```

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

Create a `.env` file with the following variables:

```
DATABASE_URL=postgres://user:password@host:port/database
PORT=5000 (optional, defaults to 5000)
SESSION_SECRET=your-secret-key
```

## Support

For support, please contact support@averox.com

