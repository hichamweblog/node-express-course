import pino from "pino";

import { config } from "../config/index.js";

// ===========================================
// Pino Logger Configuration
// ===========================================

/**
 * Production-ready logger using Pino
 *
 * Features:
 * - Pretty printing in development
 * - JSON output in production (for log aggregation)
 * - Different log levels based on environment
 * - Redaction of sensitive data
 *
 * Usage:
 * import { logger } from './utils/logger.js';
 *
 * logger.info('Server started');
 * logger.info({ userId: 123 }, 'User logged in');
 * logger.error({ err }, 'Database connection failed');
 * logger.warn('Deprecated API called');
 * logger.debug({ data }, 'Debug information');
 */

// Determine transport based on environment
const transport = config.isDevelopment
  ? {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
        singleLine: false,
      },
    }
  : undefined;

// Create logger instance
export const logger = pino({
  // Log level based on environment
  level: config.isDevelopment ? "debug" : "info",

  // Pretty print in development
  transport,

  // Base properties included in every log
  base: {
    env: config.nodeEnv,
  },

  // Redact sensitive data
  redact: {
    paths: [
      "password",
      "passwordConfirm",
      "token",
      "accessToken",
      "refreshToken",
      "authorization",
      "*.password",
      "*.token",
      "req.headers.authorization",
    ],
    censor: "[REDACTED]",
  },

  // Customize serializers
  serializers: {
    // Custom error serializer
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,

    // Custom request serializer
    req: (req) => ({
      method: req.method,
      url: req.url,
      path: req.path,
      parameters: req.params,
      query: req.query,
      // Headers without sensitive data
      headers: {
        host: req.headers.host,
        "user-agent": req.headers["user-agent"],
        "content-type": req.headers["content-type"],
      },
    }),

    // Custom response serializer
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },

  // Timestamp format
  timestamp: pino.stdTimeFunctions.isoTime,
});

// ===========================================
// Logger Utility Functions
// ===========================================

/**
 * Create a child logger with additional context
 *
 * Usage:
 * const reqLogger = createChildLogger({ requestId: 'abc-123' });
 * reqLogger.info('Processing request');
 */
export const createChildLogger = (bindings: Record<string, unknown>) => {
  return logger.child(bindings);
};

/**
 * Log HTTP request/response
 *
 * Usage in middleware:
 * logHttpRequest(req, res, responseTime);
 */
export const logHttpRequest = (
  method: string,
  url: string,
  statusCode: number,
  responseTime: number,
) => {
  const logData = {
    method,
    url,
    statusCode,
    responseTime: `${responseTime}ms`,
  };

  if (statusCode >= 500) {
    logger.error(logData, "HTTP Request - Server Error");
  } else if (statusCode >= 400) {
    logger.warn(logData, "HTTP Request - Client Error");
  } else {
    logger.info(logData, "HTTP Request");
  }
};

// Export types
export type Logger = typeof logger;
