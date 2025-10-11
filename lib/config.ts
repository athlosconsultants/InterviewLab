/**
 * T147 - Environment Configuration & Validation
 * Validates required environment variables on app startup
 */

import { logger } from './logger';

interface EnvironmentConfig {
  // Supabase
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;

  // OpenAI
  openaiApiKey: string;

  // Stripe
  stripeSecretKey: string;
  stripePublishableKey: string;
  stripeWebhookSecret: string;

  // Site
  siteUrl: string;
  nodeEnv: string;
}

/**
 * Validate that all required environment variables are set
 */
function validateEnvironment(): EnvironmentConfig {
  const requiredVars = {
    // Support both NEXT_PUBLIC_* and direct Supabase vars (Vercel integration)
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  };

  const missing: string[] = [];

  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const error = `Missing required environment variables: ${missing.join(', ')}`;
    logger.error('[CONFIG] Environment validation failed', new Error(error));
    throw new Error(error);
  }

  // Validate format of critical vars
  if (!requiredVars.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must start with https://');
  }

  if (!requiredVars.OPENAI_API_KEY?.startsWith('sk-')) {
    throw new Error('OPENAI_API_KEY must start with sk-');
  }

  logger.info('[CONFIG] Environment validated successfully', {
    nodeEnv: process.env.NODE_ENV,
  });

  return {
    supabaseUrl: requiredVars.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: requiredVars.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    supabaseServiceRoleKey: requiredVars.SUPABASE_SERVICE_ROLE_KEY!,
    openaiApiKey: requiredVars.OPENAI_API_KEY!,
    stripeSecretKey: requiredVars.STRIPE_SECRET_KEY!,
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    siteUrl: requiredVars.NEXT_PUBLIC_SITE_URL!,
    nodeEnv: process.env.NODE_ENV || 'development',
  };
}

// Export validated config
export const config = validateEnvironment();

// Export helper to check if in production
export const isProduction = config.nodeEnv === 'production';
export const isDevelopment = config.nodeEnv === 'development';
export const isTest = config.nodeEnv === 'test';

