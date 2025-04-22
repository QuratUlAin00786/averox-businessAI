/**
 * @file Configuration
 * @description Central configuration for the application
 * @module config
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

/**
 * Get a required environment variable
 * @param key Environment variable name
 * @returns Environment variable value
 * @throws Error if environment variable is not set
 */
function requiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get an optional environment variable
 * @param key Environment variable name
 * @param defaultValue Default value if not set
 * @returns Environment variable value or default
 */
function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Application configuration
 */
export const config: {
  server: {
    port: string | number;
    env: string;
    isProduction: boolean;
  };
  database: {
    url: string;
  };
  auth: {
    sessionSecret: string;
    cookieMaxAge: number;
  };
  apis: {
    stripe: {
      secretKey: string;
      webhookSecret: string;
    };
    openai: {
      apiKey: string;
      defaultModel: string;
    };
    sendgrid: {
      apiKey: string;
      fromEmail: string;
    };
  };
  security: {
    corsOrigins: string[];
    bcryptRounds: number;
  };
  features: {
    openAiIntegration: boolean;
    stripeIntegration: boolean;
    emailNotifications: boolean;
  };
  logs: {
    level: string;
  };
} = {
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/averox',
  },
  
  auth: {
    sessionSecret: optionalEnv('SESSION_SECRET', 'averox-session-secret'),
    cookieMaxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
  
  apis: {
    stripe: {
      secretKey: optionalEnv('STRIPE_SECRET_KEY', ''),
      webhookSecret: optionalEnv('STRIPE_WEBHOOK_SECRET', ''),
    },
    
    openai: {
      apiKey: optionalEnv('OPENAI_API_KEY', ''),
      defaultModel: optionalEnv('OPENAI_DEFAULT_MODEL', 'gpt-4o'),
    },
    
    sendgrid: {
      apiKey: optionalEnv('SENDGRID_API_KEY', ''),
      fromEmail: optionalEnv('SENDGRID_FROM_EMAIL', 'noreply@averox-crm.com'),
    },
  },
  
  security: {
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5000'],
    bcryptRounds: parseInt(optionalEnv('BCRYPT_ROUNDS', '10')),
  },
  
  features: {
    openAiIntegration: optionalEnv('FEATURE_OPENAI_INTEGRATION', 'true') === 'true',
    stripeIntegration: optionalEnv('FEATURE_STRIPE_INTEGRATION', 'true') === 'true',
    emailNotifications: optionalEnv('FEATURE_EMAIL_NOTIFICATIONS', 'true') === 'true',
  },
  
  logs: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
};

/**
 * Validate critical configuration
 * Ensure required values are set
 */
export function validateConfig(): void {
  // Check database URL
  if (!config.database.url) {
    throw new Error('Database URL is required');
  }
  
  // Check session secret
  if (!config.auth.sessionSecret) {
    throw new Error('Session secret is required');
  }
  
  // Validate enabled feature dependencies
  if (config.features.stripeIntegration && !config.apis.stripe.secretKey) {
    throw new Error('Stripe integration is enabled but secret key is missing');
  }
  
  if (config.features.openAiIntegration && !config.apis.openai.apiKey) {
    throw new Error('OpenAI integration is enabled but API key is missing');
  }
  
  if (config.features.emailNotifications && !config.apis.sendgrid.apiKey) {
    throw new Error('Email notifications are enabled but SendGrid API key is missing');
  }
}