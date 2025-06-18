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
  - Fixed payment page routing and URL parameter extraction for plan selection
  - Resolved false "Payment Setup Failed" error notifications by implementing proper initialization flow
  - Enhanced payment system with user-triggered initialization instead of automatic loading
  - Fixed Stripe Elements lifecycle management to prevent prop change warnings
  - Improved error handling with detailed payment failure messages
  - Restored Averox logo with Business AI description to landing page hero section
  - Partially fixed payment form by switching from PaymentElement to CardElement approach
  - Payment backend confirmed working (payment intent creation successful), frontend processing partially resolved
- June 17, 2025. Fixed PayPal button functionality:
  - Replaced mock PayPal implementation with official PayPal Server SDK integration
  - Added proper credential validation and graceful error handling for missing API keys
  - PayPal button now shows clear "unavailable - contact support" message instead of SDK errors
  - Implemented full PayPal checkout flow ready for when credentials are provided
  - Fixed ERR_INIT_SDK_CLIENT_TOKEN_INVALID error by handling missing credentials properly
  - Fixed "Continue to Payment" button error with comprehensive error handling and loading states
  - Successfully resolved email decryption issue in contacts display - API now returns properly decrypted email values
  - Fixed decryption for all sensitive contact fields (email, phone, address, notes) using correct CryptoSphere integration
  - Fixed bullet point formatting inconsistency between development and deployment environments by implementing proper HTML list structures
  - Fixed numbering button functionality to create proper numbered list items instead of single lines for selected text
  - Simplified text parsing logic for more reliable numbering functionality across all environments
  - Fixed image button functionality with complete file upload and insertion system for email editor
  - Enhanced image functionality for deployment reliability with cross-browser compatibility and robust error handling
  - Fixed text alignment button functionality (left, center, right) with intelligent block element detection and selection handling
  - Fixed page refresh navigation issues in Manufacturing modules by replacing window.location.href with proper client-side routing
  - Reordered Manufacturing routes in App.tsx for proper route matching (most specific routes first)
  - Enhanced sidebar Manufacturing submenu visibility logic to show on all Manufacturing sub-pages
  - Fixed numbering button functionality in email editor with enhanced HTML parsing and text processing
  - Improved numbering logic to properly extract text from div, p, and li elements for separate list items
  - Enhanced HTML structure detection to handle contentEditable div elements correctly
  - Added comprehensive debugging and fallback options for reliable numbering functionality
  - Fixed numbering button functionality to properly convert selected text into numbered list items instead of inserting default placeholder text
  - Fixed link button functionality in email editor with proper URL prompts and link creation for both selected text and new links
- June 18, 2025. Successfully resolved link button clickability issue:
  - Fixed link button to create proper clickable links within contentEditable email editor
  - Enhanced URL validation with automatic https:// prefix addition
  - Implemented onMouseDown event handler to enable link clicking in contentEditable context
  - Links now open in new tabs with proper security attributes (target="_blank", rel="noopener noreferrer")
  - Maintained all existing editor functionality while enabling proper link interaction
- June 18, 2025. Successfully fixed numbering button functionality:
  - Fixed numbering button to preserve all original text content without data loss
  - Enhanced text processing to detect actual separate div elements for multi-item lists
  - Implemented data integrity protection to prevent content modification during numbering
  - Button now properly converts selected text into numbered lists while maintaining exact user input
  - Resolved issue where text was being incorrectly split or truncated during list conversion
  - Completely fixed content capture to handle ALL child nodes including text nodes and elements
  - Numbering now works correctly for any amount of content (4 lines, 100 lines, etc.) with accurate numbering
  - Final solution captures all content without losing any lines or data during list conversion

## User Preferences

Preferred communication style: Simple, everyday language.