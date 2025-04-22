# AVEROX CRM Backend Structure

## Overview

This directory contains the backend code for the AVEROX CRM system, organized according to modern Node.js application design principles. The code follows a modular architecture pattern to ensure maintainability, readability, and scalability.

## Directory Structure

```
server/src/
├── config/          # Application configuration settings
├── controllers/     # Request handlers that process HTTP requests
├── middleware/      # Express middleware functions
├── models/          # Database models and schema definitions
├── routes/          # API route definitions
├── services/        # Business logic layer
├── utils/           # Utility functions and helpers
├── app.ts           # Express application setup
├── index.ts         # Application entry point
└── server.ts        # HTTP server configuration
```

## Layer Responsibilities

### Config Layer
- Manages environment variables and application settings
- Configures global application behavior
- Sets up third-party integrations and connections

### Controllers Layer
- Handles HTTP requests and responses
- Validates and sanitizes input data
- Delegates business logic to services
- Formats and returns API responses

### Middleware Layer
- Processes requests before they reach route handlers
- Handles authentication and authorization
- Performs logging and request tracking
- Manages error handling

### Models Layer
- Defines database schema using Drizzle ORM
- Implements data validation rules
- Provides type definitions for data objects

### Routes Layer
- Defines API endpoints and HTTP methods
- Maps routes to controller functions
- Groups related endpoints

### Services Layer
- Implements business logic
- Interacts with database through models
- Handles complex operations and transformations
- Enforces business rules and constraints

### Utils Layer
- Provides helper functions and utilities
- Implements logging, error handling, and other cross-cutting concerns
- Offers reusable code for common tasks

## Key Files

- `app.ts`: Configures the Express application and middleware
- `server.ts`: Sets up the HTTP server and handles process signals
- `index.ts`: Application entry point that initializes everything
- `config/index.ts`: Centralizes all configuration settings
- `routes/index.ts`: Registers all API routes
- `utils/db.ts`: Database connection management
- `utils/error-handler.ts`: Centralized error handling
- `utils/logger.ts`: Application logging utilities

## Design Principles

1. **Separation of Concerns**: Each layer has a distinct responsibility
2. **Single Responsibility Principle**: Each file and function does one thing well
3. **Dependency Injection**: Dependencies are passed in rather than imported directly
4. **Error Handling**: Centralized error management for consistent responses
5. **Logging**: Comprehensive logging throughout the application
6. **Type Safety**: TypeScript types for all objects and functions
7. **Modularity**: Components can be tested and replaced independently

## Adding New Features

When adding new functionality to the system:

1. Define the data model in the appropriate schema file
2. Create or update service methods to handle business logic
3. Implement controller functions to handle HTTP interactions
4. Define routes to expose the functionality via API endpoints
5. Register new routes in `routes/index.ts`

## Error Handling

All errors should be handled using the `ApiError` class and the `handleControllerError` function from `utils/error-handler.ts`. This ensures consistent error responses across the API.

## Logging

Use the `logger` object from `utils/logger.ts` to log information, warnings, and errors. This centralizes log formatting and ensures consistent log messages.

## Authentication

Authentication is implemented using Passport.js with a local strategy. The setup is in `config/auth.setup.ts` and middleware for protecting routes is in `middleware/auth.middleware.ts`.