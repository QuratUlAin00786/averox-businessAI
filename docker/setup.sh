#!/bin/bash

# Create necessary directories
mkdir -p volumes/crm-db

# Set proper permissions for PostgreSQL data directory
chmod -R 777 volumes/crm-db

echo "Docker setup completed successfully!"
echo "You can now run 'docker-compose up -d' to start the application."