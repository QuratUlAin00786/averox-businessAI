# Averox Business AI - Replit Guide

## Overview

Averox Business AI is a comprehensive, AI-powered customer relationship management (CRM) and business solution platform. It provides modular, scalable infrastructure for enterprise management with intelligent insights and automation capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration
- **State Management**: TanStack Query for server state, Redux Toolkit for client state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js server
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Passport.js with local strategy and express-session
- **API Design**: RESTful APIs with modular route structure
- **Security**: AES-256 encryption with custom CryptoSphere SDK

### Data Storage Solutions
- **Primary Database**: PostgreSQL with comprehensive schema
- **ORM**: Drizzle with type-safe query building
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Storage Layers**: Dual storage implementation (MemStorage for development, DatabaseStorage for production)

## Key Components

### Core Business Modules
1. **Customer Relationship Management**
   - Contact management with encryption for PII
   - Account hierarchy and relationship tracking
   - Lead management with conversion workflows

2. **Sales Pipeline**
   - Opportunity tracking with stage-based workflows
   - Proposal generation system with collaborative editing
   - Quote and invoice management

3. **Task & Activity Management**
   - Task assignment and tracking
   - Calendar events integration
   - Activity logging and reporting

4. **AI Assistant Integration**
   - OpenAI GPT-4 integration for business insights
   - Automated analysis and recommendations
   - Natural language query processing

5. **Communication Hub**
   - Multi-channel communication (email, SMS, social media)
   - Social media integrations
   - Telephony services via Twilio

6. **Manufacturing & Inventory**
   - Material Requirements Planning (MRP)
   - Bill of Materials (BOM) management
   - Warehouse and inventory tracking
   - Vendor management and procurement

7. **Marketing Automation**
   - Campaign management across multiple channels
   - Workflow automation with triggers and actions
   - Email template management
   - Audience segmentation

### Security & Encryption
- **Data Protection**: Custom CryptoSphere SDK for field-level encryption
- **Authentication**: Secure password hashing with scrypt
- **Session Management**: Express-session with secure configuration
- **API Security**: Role-based access control and permissions

## Data Flow

### Request Processing Flow
1. Client request → Express middleware stack
2. Authentication verification → Passport.js
3. Permission checking → Custom permission system
4. Route handling → Modular route handlers
5. Business logic → Service layer with storage abstraction
6. Data persistence → Drizzle ORM → PostgreSQL
7. Response formatting → JSON with encryption if needed

### Storage Abstraction
The application uses a dual storage system:
- **Development**: MemStorage for rapid development and testing
- **Production**: DatabaseStorage for persistent data with PostgreSQL

### Encryption Flow
1. Sensitive data identification via field patterns
2. Encryption using CryptoSphere SDK with AES-256-GCM
3. Secure storage with IV and metadata
4. Transparent decryption on data retrieval

## External Dependencies

### Required APIs
- **OpenAI API**: For AI assistant functionality and business insights
- **Stripe API**: Payment processing and subscription management
- **Twilio API**: Telephony services (calls and SMS)
- **SendGrid API**: Email delivery service

### Optional Integrations
- **Slack API**: Team communication integration
- **PayPal SDK**: Alternative payment processing
- **Notion API**: Document and knowledge management

### Development Dependencies
- **TypeScript**: Type safety and development experience
- **ESBuild**: Fast bundling for production builds
- **TSX**: TypeScript execution for development
- **Drizzle Kit**: Database schema management

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 and PostgreSQL 16 modules
- **Hot Reload**: Vite dev server with HMR
- **Database**: Neon PostgreSQL with connection pooling
- **File System**: Standard Replit file structure

### Production Deployment
- **Build Process**: Vite build for frontend, ESBuild for backend
- **Environment Preparation**: Swap replit-specific files with production versions
- **Database**: PostgreSQL with encrypted connection strings
- **Docker Support**: Multi-stage builds available for containerization

### Environment Configuration
The application supports multiple deployment configurations:
- **Replit**: Development with hot reload and debug tools
- **Self-hosted**: Complete control with custom infrastructure
- **Docker**: Containerized deployment with docker-compose

### Migration Strategy
- **Development to Production**: Use `deployment-package.json` and `deployment-vite.config.ts`
- **Database Migrations**: Drizzle Kit handles schema evolution
- **Environment Variables**: Template-based configuration for secure credential management

Changelog:
- June 13, 2025. Initial setup
- June 16, 2025. Fixed multiple button functionalities:
  - Training help buttons: "Learn More", "Watch Now", "Read Docs" now functional
  - Email editor bullet point formatting now preserves line breaks correctly
  - Fixed authentication security vulnerability by disabling auto-login bypass
  - Added complete forgot password functionality with email reset system
  - Resolved login authentication issue - system now properly accepts correct credentials
  - Enhanced subscription system with proper confirmation flow and payment method information
  - Added current subscription status display and prevented duplicate subscriptions

## User Preferences

Preferred communication style: Simple, everyday language.