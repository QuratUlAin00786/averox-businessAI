#!/bin/bash

# AVEROX Business AI Deployment Preparation Script

echo "====== AVEROX Business AI Deployment Preparation ======"
echo "This script will prepare your application for deployment by removing Replit-specific files and configurations."

# Create a deployment directory
DEPLOY_DIR="./averox-business-ai-deploy"
echo "Creating deployment directory: $DEPLOY_DIR"
mkdir -p $DEPLOY_DIR

# Copy all files except Replit-specific ones
echo "Copying files to deployment directory..."
rsync -av --progress ./ $DEPLOY_DIR/ --exclude node_modules --exclude .git --exclude .replit --exclude replit.nix --exclude "deployment-*"

# Replace package.json with deployment version
echo "Updating package.json..."
cp deployment-package.json $DEPLOY_DIR/package.json

# Replace vite.config.ts with deployment version
echo "Updating vite.config.ts..."
cp deployment-vite.config.ts $DEPLOY_DIR/vite.config.ts

# Create .env template
echo "Creating .env template..."
cat > $DEPLOY_DIR/.env.template << EOL
# Database connection
DATABASE_URL=your_postgresql_connection_string

# API Keys
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# Optional
SENDGRID_API_KEY=your_sendgrid_api_key
EOL

# Copy deployment guide
echo "Copying deployment guide..."
cp DEPLOYMENT.md $DEPLOY_DIR/

# Ensure CryptoSphere SDK is copied
echo "Copying CryptoSphere SDK..."
node scripts/copy-sdk-files.js

echo ""
echo "====== Preparation Complete ======"
echo "Your deployment-ready application is available in: $DEPLOY_DIR"
echo "Please follow the instructions in DEPLOYMENT.md to deploy your application."
echo ""
echo "Don't forget to:"
echo "1. Create a .env file based on .env.template"
echo "2. Install dependencies with: npm install"
echo "3. Build the application with: npm run build"
echo "4. Start the application with: npm start"
echo "====== Good luck with your deployment! ======"