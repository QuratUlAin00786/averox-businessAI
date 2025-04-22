/**
 * @file Configuration settings for the AVEROX CRM application
 * @description Centralizes all environment variables and configuration settings
 * @module config
 */

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Application configuration object with all settings
 */
export const config = {
  /**
   * Server configuration
   */
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },
  
  /**
   * Database configuration
   */
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  /**
   * Authentication configuration
   */
  auth: {
    sessionSecret: process.env.SESSION_SECRET || 'averox-default-secret',
    // In production, please ensure SESSION_SECRET is set to a secure random string
    cookieMaxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  /**
   * Third-party API keys and configuration
   */
  apis: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY || '',
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'no-reply@averox.com',
    },
  },
  
  /**
   * Security configuration
   */
  security: {
    bcryptSaltRounds: 10,
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5000'],
  },
  
  /**
   * Feature flags - enable/disable features
   */
  features: {
    openAiIntegration: process.env.FEATURE_OPENAI === 'true',
    socialMediaIntegration: process.env.FEATURE_SOCIAL_MEDIA === 'true',
    stripeIntegration: process.env.FEATURE_STRIPE === 'true' || true,
  },
};

/**
 * Validates that all required configuration values are present
 * @returns {boolean} True if configuration is valid
 */
export function validateConfig(): boolean {
  const requiredValues = [
    { value: config.database.url, name: 'DATABASE_URL' },
  ];

  // Only validate API keys if the feature is enabled
  if (config.features.stripeIntegration) {
    requiredValues.push({ value: config.apis.stripe.secretKey, name: 'STRIPE_SECRET_KEY' });
  }
  
  if (config.features.openAiIntegration) {
    requiredValues.push({ value: config.apis.openai.apiKey, name: 'OPENAI_API_KEY' });
  }

  // Check for missing required values
  const missingValues = requiredValues
    .filter(item => !item.value)
    .map(item => item.name);

  if (missingValues.length) {
    console.warn(`Missing required configuration values: ${missingValues.join(', ')}`);
    return false;
  }

  return true;
}

export default config;