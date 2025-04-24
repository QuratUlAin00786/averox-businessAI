# AVEROX Business AI Deployment Guide

This document outlines the steps needed to deploy the AVEROX Business AI application in a production environment.

## Pre-Deployment Checklist

1. **Remove Replit-specific dependencies and files:**
   - Replace `package.json` with `deployment-package.json` (renaming it to `package.json`)
   - Replace `vite.config.ts` with `deployment-vite.config.ts` (renaming it to `vite.config.ts`)
   - Remove `.replit` and `replit.nix` files

2. **Environment Variables:**
   Ensure these environment variables are set in your production environment:
   ```
   # Database connection
   DATABASE_URL=your_postgresql_connection_string
   
   # API Keys
   OPENAI_API_KEY=your_openai_api_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   
   # Optional
   SENDGRID_API_KEY=your_sendgrid_api_key (if using email features)
   ```

3. **Database Setup:**
   - Ensure PostgreSQL is properly set up and accessible
   - Run `npm run db:push` to initialize the database schema
   - If needed, seed initial data with appropriate scripts

## Deployment Steps

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Build the Application:**
   ```bash
   npm run build
   ```

3. **Start the Application:**
   ```bash
   npm start
   ```

## Deployment Options

### Option 1: Self-Hosted Server
1. Clone the repository to your server
2. Follow the pre-deployment checklist and deployment steps
3. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start npm --name "averox-business-ai" -- start
   ```
4. Configure Nginx/Apache as a reverse proxy

### Option 2: Cloud Providers
The application can be deployed to various cloud providers:

#### AWS
- Use Elastic Beanstalk for a managed environment
- Use EC2 for more control
- RDS for PostgreSQL database

#### Google Cloud
- Cloud Run for containerized deployment
- App Engine for managed environments
- Cloud SQL for PostgreSQL database

#### Microsoft Azure
- Azure App Service
- Azure Database for PostgreSQL

#### DigitalOcean
- App Platform
- Droplets with PM2
- Managed PostgreSQL database

### Option 3: Docker Deployment
1. Create a Docker image using the provided Dockerfile
2. Push to your container registry
3. Deploy using Docker or Kubernetes

## SSL Configuration
For production environments, configure SSL certificates:
- Use Let's Encrypt for free certificates
- Configure your reverse proxy to handle HTTPS traffic

## Monitoring and Maintenance
- Set up monitoring for the application and database
- Configure regular database backups
- Set up logging for tracking errors and performance