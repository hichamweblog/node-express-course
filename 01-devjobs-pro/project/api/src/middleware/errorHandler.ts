import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import { ZodError } from "zod";

import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";

// ===========================================
// Custom Error Classes
// ===========================================

/**
 * Base application error class
 * All custom errors should extend this class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * 400 Bad Request - Invalid client input
 */
export class BadRequestError extends AppError {
  constructor(message: string = "Bad request") {
    super(message, 400, true, "BAD_REQUEST");
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * 401 Unauthorized - Authentication required
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, true, "UNAUTHORIZED");
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * 403 Forbidden - Insufficient permissions
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403, true, "FORBIDDEN");
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * 404 Not Found - Resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, true, "NOT_FOUND");
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 409 Conflict - Resource already exists
 */
export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409, true, "CONFLICT");
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * 422 Unprocessable Entity - Validation failed
 */
export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(
    message: string = "Validation failed",
    errors: Record<string, string[]> = {},
  ) {
    super(message, 422, true, "VALIDATION_ERROR");
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export class TooManyRequestsError extends AppError {
  constructor(message: string = "Too many requests, please try again later") {
    super(message, 429, true, "TOO_MANY_REQUESTS");
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);
  }
}

/**
 * 500 Internal Server Error - Unexpected server error
 */
export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super(message, 500, false, "INTERNAL_SERVER_ERROR");
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

// ===========================================
// Error Response Interface
// ===========================================

interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

// ===========================================
// Zod Error Formatter
// ===========================================

const formatZodError = (error: ZodError): Record<string, string[]> => {
  const formatted: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".") || "root";
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }

  return formatted;
};

// ===========================================
// Global Error Handler Middleware
// ===========================================

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    name: err.name,
  });

  // Prepare error response
  const response: ErrorResponse = {
    success: false,
    message: "Internal server error",
  };

  let statusCode = 500;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 422;
    response.message = "Validation failed";
    response.code = "VALIDATION_ERROR";
    response.errors = formatZodError(err);
  }
  // Handle custom AppError and its subclasses
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    response.message = err.message;
    response.code = err.code;

    if (err instanceof ValidationError) {
      response.errors = err.errors;
    }
  }
  // Handle JSON parsing errors
  else if (err instanceof SyntaxError && "body" in err) {
    statusCode = 400;
    response.message = "Invalid JSON";
    response.code = "INVALID_JSON";
  }
  // Handle JWT errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    response.message = "Invalid token";
    response.code = "INVALID_TOKEN";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    response.message = "Token expired";
    response.code = "TOKEN_EXPIRED";
  }
  // Handle PostgreSQL errors
  else if ("code" in err && typeof err.code === "string") {
    const pgCode = err.code;
    if (pgCode === "23505") {
      // Unique violation
      statusCode = 409;
      response.message = "Resource already exists";
      response.code = "DUPLICATE_ENTRY";
    } else if (pgCode === "23503") {
      // Foreign key violation
      statusCode = 400;
      response.message = "Referenced resource not found";
      response.code = "FOREIGN_KEY_VIOLATION";
    }
  }

  // Include stack trace in development
  if (config.isDevelopment) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// ===========================================
// 404 Not Found Handler
// ===========================================

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const error = new NotFoundError(
    `Route ${req.method} ${req.originalUrl} not found`,
  );
  next(error);
};
