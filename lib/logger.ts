/**
 * T143 - Structured Logging with PII Redaction
 * Centralized logging system with request IDs and sensitive data protection
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  action?: string;
  [key: string]: any;
}

/**
 * Redact PII from log data
 */
function redactPII(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const redacted = { ...data };
  const piiFields = [
    'password',
    'token',
    'apiKey',
    'api_key',
    'secret',
    'authorization',
    'cookie',
    'session',
  ];

  for (const key in redacted) {
    const lowerKey = key.toLowerCase();
    
    // Redact known PII fields
    if (piiFields.some((field) => lowerKey.includes(field))) {
      redacted[key] = '[REDACTED]';
      continue;
    }

    // Partially redact email addresses
    if (lowerKey.includes('email') && typeof redacted[key] === 'string') {
      const email = redacted[key] as string;
      const [user, domain] = email.split('@');
      if (user && domain) {
        const maskedUser = user.slice(0, 2) + '***';
        redacted[key] = `${maskedUser}@${domain}`;
      }
      continue;
    }

    // Partially redact user IDs (show first 8 chars)
    if (lowerKey.includes('userid') || lowerKey === 'user_id') {
      const id = redacted[key] as string;
      if (typeof id === 'string' && id.length > 8) {
        redacted[key] = id.slice(0, 8) + '***';
      }
      continue;
    }

    // Recursively redact nested objects
    if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      redacted[key] = redactPII(redacted[key]);
    }
  }

  return redacted;
}

/**
 * Format log entry
 */
function formatLog(
  level: LogLevel,
  message: string,
  context?: LogContext
): string {
  const timestamp = new Date().toISOString();
  const redactedContext = context ? redactPII(context) : {};

  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    message,
    ...redactedContext,
  };

  return JSON.stringify(logEntry);
}

/**
 * Log debug messages (development only)
 */
export function logDebug(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(formatLog('debug', message, context));
  }
}

/**
 * Log info messages
 */
export function logInfo(message: string, context?: LogContext): void {
  console.log(formatLog('info', message, context));
}

/**
 * Log warnings
 */
export function logWarn(message: string, context?: LogContext): void {
  console.warn(formatLog('warn', message, context));
}

/**
 * Log errors
 */
export function logError(
  message: string,
  error?: Error | unknown,
  context?: LogContext
): void {
  const errorContext = {
    ...context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : String(error),
  };

  console.error(formatLog('error', message, errorContext));
}

/**
 * Create a logger with pre-set context
 */
export function createLogger(baseContext: LogContext) {
  return {
    debug: (message: string, context?: LogContext) =>
      logDebug(message, { ...baseContext, ...context }),
    info: (message: string, context?: LogContext) =>
      logInfo(message, { ...baseContext, ...context }),
    warn: (message: string, context?: LogContext) =>
      logWarn(message, { ...baseContext, ...context }),
    error: (message: string, error?: Error | unknown, context?: LogContext) =>
      logError(message, error, { ...baseContext, ...context }),
  };
}

/**
 * Log performance metrics
 */
export function logPerformance(
  operation: string,
  durationMs: number,
  context?: LogContext
): void {
  const level = durationMs > 3000 ? 'warn' : 'info';
  const message = `[PERF] ${operation} took ${durationMs}ms`;
  
  if (level === 'warn') {
    logWarn(message, { ...context, durationMs, operation });
  } else {
    logInfo(message, { ...context, durationMs, operation });
  }
}

/**
 * Measure execution time of async function
 */
export async function measureAsync<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: LogContext
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    logPerformance(operation, duration, context);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logError(`[PERF] ${operation} failed after ${duration}ms`, error, context);
    throw error;
  }
}

// Export default logger
export const logger = {
  debug: logDebug,
  info: logInfo,
  warn: logWarn,
  error: logError,
  performance: logPerformance,
  measureAsync,
  create: createLogger,
};

