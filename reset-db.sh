#!/bin/bash
# This script resets and seeds the database with sample data

echo "Starting database reset and seed process..."
tsx server/index.ts --reset-db
echo "Database reset and seed process completed."
