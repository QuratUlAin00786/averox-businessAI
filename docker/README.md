# AVEROX CRM Docker Setup

This directory contains Docker configuration files for running the AVEROX CRM system with separate containers for client, server, and database components.

## Directory Structure

```
crm/
├── client/            # React client application
├── server/            # Node.js Express server
├── shared/            # Shared code between client and server
├── docker/            # Docker configuration files
│   ├── nginx.conf     # Nginx configuration for client
│   └── setup.sh       # Setup script for Docker environment
├── volumes/           # Persistent data volumes
│   └── crm-db/        # PostgreSQL data files
├── Dockerfile.client  # Dockerfile for client container
├── Dockerfile.server  # Dockerfile for server container
├── docker-compose.yml # Docker Compose configuration
└── .env               # Environment variables
```

## Prerequisites

- Docker and Docker Compose installed on your system
- Git to clone the repository

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd crm
   ```

2. Set up the Docker environment:
   ```bash
   chmod +x docker/setup.sh
   ./docker/setup.sh
   ```

3. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - Web UI: http://localhost
   - API: http://localhost/api

## Environment Variables

All environment variables are defined in the `.env` file. You can modify these to suit your needs:

- `POSTGRES_USER`: Database username
- `POSTGRES_PASSWORD`: Database password
- `POSTGRES_DB`: Database name
- `DATABASE_URL`: Full database connection URL
- `NODE_ENV`: Node.js environment (development, production)
- `PORT`: The port the server runs on

## Accessing the Database

The PostgreSQL database is exposed on port 5432. You can connect to it using:

```bash
docker exec -it crm-postgres psql -U crmuser -d crmdb
```

## Data Persistence

Database data is stored in `./volumes/crm-db` and will persist between container restarts.

## Stopping the Application

To stop the containers:

```bash
docker-compose down
```

To stop and remove all containers, networks, and volumes:

```bash
docker-compose down -v
```