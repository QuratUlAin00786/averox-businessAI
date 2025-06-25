#!/bin/bash

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until nc -z postgres 5432; do
  echo "PostgreSQL not ready yet - waiting..."
  sleep 2
done
echo "PostgreSQL is ready."

# Initialize the database schema
echo "Setting up database schema..."
npm run db:push

# Seed the database with initial data
echo "Seeding database with initial data..."
npx tsx scripts/init-database.ts

# Create demo accounts if needed (optional)
if [ "$CREATE_DEMO_ACCOUNTS" = "true" ]; then
  echo "Creating demo accounts..."
  npx tsx scripts/create-demo-accounts-simple.ts
fi

# Start the server
echo "Starting server..."
exec "$@"