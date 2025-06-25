/**
 * @file Configuration module
 * @description Centralized application configuration
 * @module config
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Utility function to get environment variables with defaults
function getEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

// Utility function to get boolean environment variables
function getBoolEnv(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

// Utility function to get numeric environment variables
function getNumEnv(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Server configuration
const serverConfig = {
  port: getNumEnv('PORT', 5000),
  host: getEnv('HOST', 'localhost'),
  isProduction: getEnv('NODE_ENV', 'development') === 'production',
  isDevelopment: getEnv('NODE_ENV', 'development') === 'development',
};

// Database configuration
const databaseConfig = {
  url: getEnv('DATABASE_URL', ''),
};

// Authentication configuration
const authConfig = {
  sessionSecret: getEnv('SESSION_SECRET', 'averox-crm-secret-key-change-in-production'),
  cookieMaxAge: getNumEnv('COOKIE_MAX_AGE', 86400000), // 24 hours in milliseconds
  passwordSaltRounds: getNumEnv('PASSWORD_SALT_ROUNDS', 10),
};

// External services configuration
const externalServicesConfig = {
  openai: {
    apiKey: getEnv('OPENAI_API_KEY', ''),
    hasValidKey: !!getEnv('OPENAI_API_KEY', ''),
    defaultModel: getEnv('OPENAI_DEFAULT_MODEL', 'gpt-4o'),
    timeout: getNumEnv('OPENAI_TIMEOUT', 30000),
  },
  stripe: {
    secretKey: getEnv('STRIPE_SECRET_KEY', ''),
    publicKey: getEnv('VITE_STRIPE_PUBLIC_KEY', ''),
    hasValidKeys: !!(getEnv('STRIPE_SECRET_KEY', '') && getEnv('VITE_STRIPE_PUBLIC_KEY', '')),
    webhookSecret: getEnv('STRIPE_WEBHOOK_SECRET', ''),
  },
};

// Logging configuration
const logsConfig = {
  level: getEnv('LOG_LEVEL', 'info'),
  showTimestamp: getBoolEnv('LOG_SHOW_TIMESTAMP', true),
  showColors: getBoolEnv('LOG_SHOW_COLORS', true),
};

// Email configuration
const emailConfig = {
  provider: getEnv('EMAIL_PROVIDER', 'sendgrid'),
  fromEmail: getEnv('EMAIL_FROM', 'no-reply@averox-crm.com'),
  fromName: getEnv('EMAIL_FROM_NAME', 'AVEROX CRM'),
  sendgridApiKey: getEnv('SENDGRID_API_KEY', ''),
};

// File uploads configuration
const uploadsConfig = {
  maxSize: getNumEnv('UPLOAD_MAX_SIZE', 5 * 1024 * 1024), // 5MB
  allowedTypes: getEnv('UPLOAD_ALLOWED_TYPES', 'image/jpeg,image/png,image/gif,application/pdf').split(','),
  storageType: getEnv('UPLOAD_STORAGE_TYPE', 'local'), // 'local', 's3', etc.
};

// Consolidated configuration object
export const config = {
  server: serverConfig,
  database: databaseConfig,
  auth: authConfig,
  externalServices: externalServicesConfig,
  logs: logsConfig,
  email: emailConfig,
  uploads: uploadsConfig,
};

/**
 * Validate critical configuration settings
 * @throws Error if a critical configuration is missing
 */
export function validateConfig(): void {
  const criticalErrors: string[] = [];
  
  // Database is required
  if (!config.database.url) {
    criticalErrors.push('DATABASE_URL is not set');
  }
  
  // Session secret should be changed in production
  if (config.server.isProduction && config.auth.sessionSecret === 'averox-crm-secret-key-change-in-production') {
    criticalErrors.push('Default SESSION_SECRET is being used in production');
  }
  
  // Throw error if any critical errors were found
  if (criticalErrors.length > 0) {
    throw new Error(`Configuration errors: ${criticalErrors.join(', ')}`);
  }
}