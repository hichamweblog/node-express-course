# Lesson 04: DevJobs Pro Complete Error System

## Introduction

> **Hook**: Putting it all together—DevJobs Pro complete error system

You've learned Express 5 async error handling, custom error classes, and global error handlers. Now it's time to wire everything together into a production-ready error system for DevJobs Pro.

This is where theory meets reality. By the end of this lesson, you'll have a complete, tested, documented error handling architecture.

---

## Learning Objectives

By the end of this lesson, you will:

- ✅ Implement the complete error system for DevJobs Pro
- ✅ Wire error handlers correctly in the Express app
- ✅ Update controllers to use proper error classes
- ✅ Test error responses with curl
- ✅ Document error responses for API consumers

---

## The Theory: Error Handling as Cross-Cutting Concern

Error handling isn't a feature—it's infrastructure that touches every part of your application. Like authentication or logging, it needs to be:

- **Consistent**: Same error format everywhere
- **Centralized**: One place for error logic
- **Transparent**: Doesn't pollute business logic
- **Testable**: Easy to verify error scenarios

### Error Middleware Placement

The order of middleware in Express matters. Your error handler must be **LAST**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EXPRESS MIDDLEWARE ORDER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   app.ts Configuration Order:                                               │
│                                                                             │
│   1. ┌──────────────────────────────┐                                       │
│      │  Core Middleware              │  express.json(), cors(), helmet()    │
│      └──────────────┬───────────────┘                                       │
│                     │                                                       │
│   2. ┌──────────────▼───────────────┐                                       │
│      │  Request Logging              │  morgan, custom logger               │
│      └──────────────┬───────────────┘                                       │
│                     │                                                       │
│   3. ┌──────────────▼───────────────┐                                       │
│      │  Auth Middleware (optional)   │  passport, JWT verification          │
│      └──────────────┬───────────────┘                                       │
│                     │                                                       │
│   4. ┌──────────────▼───────────────┐                                       │
│      │  API Routes                   │  /api/v1/jobs, /api/v1/auth, etc.   │
│      └──────────────┬───────────────┘                                       │
│                     │                                                       │
│   5. ┌──────────────▼───────────────┐                                       │
│      │  404 Handler (notFound)       │  Catches unmatched routes            │
│      └──────────────┬───────────────┘                                       │
│                     │                                                       │
│   6. ┌──────────────▼───────────────┐                                       │
│      │  ERROR HANDLER (LAST!)        │  Catches ALL errors from above       │
│      └──────────────────────────────┘                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ASCII Diagram: Complete DevJobs Pro Error Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  DEVJOBS PRO ERROR ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  src/                                                                       │
│  ├── utils/                                                                 │
│  │   ├── errors.ts ─────────────────────────────────────────────────┐      │
│  │   │   • AppError (base class)                                     │      │
│  │   │   • NotFoundError, ValidationError, etc.                      │      │
│  │   │   • Domain errors: JobNotFoundError, etc.                     │      │
│  │   │   • Type guards: isAppError, isOperationalError               │      │
│  │   │                                                               │      │
│  │   └── catchAsync.ts ─────────────────────────────────────────────┐│      │
│  │       • Optional wrapper for Express 4 compatibility             ││      │
│  │       • Express 5 makes this mostly unnecessary                  ││      │
│  │                                                                   ││      │
│  ├── middleware/                                                     ││      │
│  │   ├── errorHandler.ts ◄──────────────────────────────────────────┼┘      │
│  │   │   • Normalize all error types to AppError                    │       │
│  │   │   • Transform Zod, JWT, DB errors                            │       │
│  │   │   • Log errors appropriately                                 │       │
│  │   │   • Send dev/prod formatted response                         │       │
│  │   │                                                              │       │
│  │   └── notFound.ts                                                │       │
│  │       • Catch unmatched routes                                   │       │
│  │       • Throw NotFoundError                                      │       │
│  │                                                                  │       │
│  ├── controllers/                                                   │       │
│  │   ├── jobController.ts ─────┬────────────────────────────────────┘       │
│  │   ├── authController.ts ────┤  Import error classes                      │
│  │   ├── userController.ts ────┤  throw new XxxError()                      │
│  │   └── applicationController.ts                                           │
│  │                                                                          │
│  └── app.ts                                                                 │
│      • Wire middleware in correct order                                     │
│      • errorHandler MUST be LAST                                            │
│                                                                             │
│  Request Flow:                                                              │
│  ─────────────                                                              │
│                                                                             │
│  HTTP Request ──► Middleware ──► Route Handler ──► Controller               │
│                                        │                                    │
│                    ┌───────────────────┴───────────────────┐                │
│                    │                                       │                │
│                    ▼ Success                               ▼ Error          │
│               res.json(data)         throw new NotFoundError(id)            │
│                    │                                       │                │
│                    │                    Express 5 catches automatically     │
│                    │                                       │                │
│                    │                                       ▼                │
│                    │                              errorHandler.ts           │
│                    │                                       │                │
│                    ▼                                       ▼                │
│               HTTP 200 OK                           HTTP 404 Not Found      │
│               { success: true }                     { success: false }      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Practice: Implement Complete Error System for DevJobs Pro

### File 1: `src/utils/errors.ts` (All Error Classes)

```typescript
// src/utils/errors.ts
// ========================================
// COMPLETE ERROR CLASSES FOR DEVJOBS PRO
// ========================================

/**
 * Options for creating an AppError
 */
export interface AppErrorOptions {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
  cause?: Error;
}

/**
 * Base application error class.
 * All custom errors in DevJobs Pro extend from this.
 *
 * @example
 * throw new AppError('Something went wrong', { statusCode: 500 });
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;
  public readonly timestamp: Date;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, { cause: options.cause });

    const {
      statusCode = 500,
      isOperational = true,
      code = "INTERNAL_ERROR",
    } = options;

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.timestamp = new Date();

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
  }

  /**
   * Serialize error for JSON response
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

// ========================================
// 4XX CLIENT ERRORS
// ========================================

/**
 * 400 Bad Request
 * Use when request syntax is malformed
 */
export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, { statusCode: 400, code: "BAD_REQUEST" });
  }
}

/**
 * 400 Validation Error
 * Use when input validation fails
 * Includes field-level error details
 */
export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(
    message = "Validation failed",
    errors: Record<string, string[]> = {},
  ) {
    super(message, { statusCode: 400, code: "VALIDATION_ERROR" });
    this.errors = errors;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      errors: this.errors,
    };
  }
}

/**
 * 401 Unauthorized
 * Use when authentication is required but missing or invalid
 */
export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, { statusCode: 401, code: "UNAUTHORIZED" });
  }
}

/**
 * 403 Forbidden
 * Use when authenticated but not authorized to access resource
 */
export class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super(message, { statusCode: 403, code: "FORBIDDEN" });
  }
}

/**
 * 404 Not Found
 * Use when requested resource doesn't exist
 */
export class NotFoundError extends AppError {
  public readonly resourceType?: string;
  public readonly resourceId?: string | number;

  constructor(
    message = "Resource not found",
    resourceType?: string,
    resourceId?: string | number,
  ) {
    super(message, { statusCode: 404, code: "NOT_FOUND" });
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }

  override toJSON(): Record<string, unknown> {
    const json = super.toJSON();
    if (this.resourceType) json.resourceType = this.resourceType;
    if (this.resourceId) json.resourceId = this.resourceId;
    return json;
  }
}

/**
 * 409 Conflict
 * Use when resource already exists or version conflict
 */
export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, { statusCode: 409, code: "CONFLICT" });
  }
}

/**
 * 429 Too Many Requests
 * Use when rate limit exceeded
 */
export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(message = "Too many requests", retryAfter = 60) {
    super(message, { statusCode: 429, code: "RATE_LIMITED" });
    this.retryAfter = retryAfter;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
    };
  }
}

// ========================================
// 5XX SERVER ERRORS
// ========================================

/**
 * 500 Internal Server Error
 * Use for unexpected server-side errors (bugs)
 * Note: isOperational = false
 */
export class InternalError extends AppError {
  constructor(message = "Internal server error", cause?: Error) {
    super(message, {
      statusCode: 500,
      code: "INTERNAL_ERROR",
      isOperational: false,
      cause,
    });
  }
}

/**
 * 503 Service Unavailable
 * Use when server is temporarily overloaded
 */
export class ServiceUnavailableError extends AppError {
  public readonly retryAfter?: number;

  constructor(
    message = "Service temporarily unavailable",
    retryAfter?: number,
  ) {
    super(message, { statusCode: 503, code: "SERVICE_UNAVAILABLE" });
    this.retryAfter = retryAfter;
  }
}

// ========================================
// DEVJOBS DOMAIN-SPECIFIC ERRORS
// ========================================

// --- Job Errors ---

export class JobNotFoundError extends NotFoundError {
  constructor(jobId: string | number) {
    super(`Job with ID '${jobId}' not found`, "job", jobId);
  }
}

export class JobExpiredError extends AppError {
  constructor(jobId: string | number) {
    super(`Job posting '${jobId}' has expired`, {
      statusCode: 410, // Gone
      code: "JOB_EXPIRED",
    });
  }
}

export class JobClosedError extends AppError {
  constructor(jobId: string | number) {
    super(`Job '${jobId}' is no longer accepting applications`, {
      statusCode: 400,
      code: "JOB_CLOSED",
    });
  }
}

// --- Application Errors ---

export class ApplicationNotFoundError extends NotFoundError {
  constructor(applicationId: string | number) {
    super(
      `Application with ID '${applicationId}' not found`,
      "application",
      applicationId,
    );
  }
}

export class DuplicateApplicationError extends ConflictError {
  constructor(jobId: string | number) {
    super(`You have already applied to job '${jobId}'`);
  }
}

export class InvalidApplicationStatusError extends BadRequestError {
  constructor(currentStatus: string, newStatus: string) {
    super(
      `Cannot change application status from '${currentStatus}' to '${newStatus}'`,
    );
  }
}

// --- User/Auth Errors ---

export class UserNotFoundError extends NotFoundError {
  constructor(userId: string | number) {
    super(`User with ID '${userId}' not found`, "user", userId);
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super("Invalid email or password");
  }
}

export class EmailAlreadyExistsError extends ConflictError {
  constructor(email: string) {
    super(`User with email '${email}' already exists`);
  }
}

export class TokenExpiredError extends UnauthorizedError {
  constructor() {
    super("Your session has expired. Please log in again.");
  }
}

export class InvalidTokenError extends UnauthorizedError {
  constructor() {
    super("Invalid or malformed token");
  }
}

// --- Company Errors ---

export class CompanyNotFoundError extends NotFoundError {
  constructor(companyId: string | number) {
    super(`Company with ID '${companyId}' not found`, "company", companyId);
  }
}

// ========================================
// TYPE GUARDS & UTILITIES
// ========================================

/**
 * Type guard to check if error is our AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if error is operational (expected)
 */
export function isOperationalError(error: unknown): boolean {
  return isAppError(error) && error.isOperational;
}

/**
 * Factory function for creating NotFoundError
 */
export function notFound(resource: string, id: string | number): NotFoundError {
  return new NotFoundError(
    `${resource} with ID '${id}' not found`,
    resource.toLowerCase(),
    id,
  );
}

/**
 * Factory function for creating ValidationError from field errors
 */
export function validationFailed(
  errors: Record<string, string | string[]>,
): ValidationError {
  const normalizedErrors: Record<string, string[]> = {};

  for (const [field, messages] of Object.entries(errors)) {
    normalizedErrors[field] = Array.isArray(messages) ? messages : [messages];
  }

  return new ValidationError("Validation failed", normalizedErrors);
}
```

### File 2: `src/utils/catchAsync.ts` (Optional Wrapper)

```typescript
// src/utils/catchAsync.ts
// ========================================
// OPTIONAL ASYNC WRAPPER
// Express 5 makes this mostly unnecessary, but included for reference
// ========================================

import type { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

/**
 * Wrapper for async route handlers.
 *
 * In Express 5, this is OPTIONAL because Promise rejections are auto-caught.
 * Use this only if:
 * - You're mixing Express 4 and 5 code
 * - You need explicit error transformation at the handler level
 * - You're using callback-based code inside async handlers
 *
 * @example
 * // Without catchAsync (Express 5 - preferred)
 * router.get('/jobs', async (req, res) => {
 *   const jobs = await getJobs();
 *   res.json(jobs);
 * });
 *
 * // With catchAsync (optional)
 * router.get('/jobs', catchAsync(async (req, res) => {
 *   const jobs = await getJobs();
 *   res.json(jobs);
 * }));
 */
export function catchAsync(fn: AsyncHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Alternative: Higher-order function version
 * Useful when you want to add custom pre/post processing
 */
export function withErrorHandling<T extends AsyncHandler>(
  handler: T,
  options?: {
    onError?: (error: Error, req: Request) => void;
  },
): RequestHandler {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      if (options?.onError && error instanceof Error) {
        options.onError(error, req);
      }
      next(error);
    }
  };
}
```

### File 3: `src/middleware/errorHandler.ts` (Global Handler)

```typescript
// src/middleware/errorHandler.ts
// ========================================
// GLOBAL ERROR HANDLER FOR DEVJOBS PRO
// ========================================

import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import { ZodError } from "zod";
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  isAppError,
} from "../utils/errors";

// ========================================
// CONFIGURATION
// ========================================

const NODE_ENV = process.env.NODE_ENV ?? "development";
const isDevelopment = NODE_ENV === "development";
const isProduction = NODE_ENV === "production";
const isTest = NODE_ENV === "test";

// ========================================
// ERROR TRANSFORMERS
// ========================================

/**
 * Transform Zod validation errors to our ValidationError format
 */
function transformZodError(err: ZodError): ValidationError {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of err.issues) {
    const field = issue.path.length > 0 ? issue.path.join(".") : "_root";

    if (!fieldErrors[field]) {
      fieldErrors[field] = [];
    }
    fieldErrors[field].push(issue.message);
  }

  return new ValidationError("Validation failed", fieldErrors);
}

/**
 * Transform JWT errors to UnauthorizedError
 */
function transformJwtError(err: Error): UnauthorizedError {
  if (err.name === "TokenExpiredError") {
    return new UnauthorizedError(
      "Your session has expired. Please log in again.",
    );
  }
  return new UnauthorizedError("Invalid or malformed authentication token.");
}

/**
 * Check if error is database-related
 */
function isDatabaseError(err: Error): boolean {
  const dbErrorNames = [
    "PostgresError",
    "DrizzleError",
    "DatabaseError",
    "SequelizeError",
    "MongoError",
  ];

  if (dbErrorNames.includes(err.name)) return true;

  const msg = err.message.toLowerCase();
  return (
    msg.includes("database") ||
    msg.includes("constraint") ||
    msg.includes("sql") ||
    msg.includes("connection refused")
  );
}

/**
 * Transform database errors to appropriate AppError
 */
function transformDatabaseError(err: Error): AppError {
  const msg = err.message.toLowerCase();

  // Unique constraint violation
  if (msg.includes("unique") || msg.includes("duplicate")) {
    return new AppError("A record with this value already exists", {
      statusCode: 409,
      code: "DUPLICATE_ENTRY",
    });
  }

  // Foreign key violation
  if (msg.includes("foreign key") || msg.includes("violates")) {
    return new AppError("Referenced record does not exist", {
      statusCode: 400,
      code: "INVALID_REFERENCE",
    });
  }

  // Connection errors
  if (msg.includes("connection") || msg.includes("econnrefused")) {
    return new AppError("Database connection error", {
      statusCode: 503,
      code: "DATABASE_UNAVAILABLE",
      isOperational: false,
    });
  }

  // Generic database error
  return new AppError("A database error occurred", {
    statusCode: 500,
    code: "DATABASE_ERROR",
    isOperational: false,
    cause: err,
  });
}

// ========================================
// ERROR NORMALIZATION
// ========================================

/**
 * Normalize any error into an AppError
 */
function normalizeError(err: unknown): AppError {
  // Already our error type
  if (isAppError(err)) {
    return err;
  }

  // Not an Error instance
  if (!(err instanceof Error)) {
    return new AppError(
      typeof err === "string" ? err : "An unknown error occurred",
      {
        statusCode: 500,
        code: "UNKNOWN_ERROR",
        isOperational: false,
      },
    );
  }

  // Zod validation error
  if (err instanceof ZodError) {
    return transformZodError(err);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return transformJwtError(err);
  }

  // Database errors
  if (isDatabaseError(err)) {
    return transformDatabaseError(err);
  }

  // Syntax error (malformed JSON body)
  if (err instanceof SyntaxError && "body" in err) {
    return new AppError("Invalid JSON in request body", {
      statusCode: 400,
      code: "INVALID_JSON",
    });
  }

  // CORS error
  if (err.message.includes("CORS")) {
    return new AppError("CORS error: Origin not allowed", {
      statusCode: 403,
      code: "CORS_ERROR",
    });
  }

  // Payload too large
  if (err.message.includes("too large") || err.message.includes("limit")) {
    return new AppError("Request payload too large", {
      statusCode: 413,
      code: "PAYLOAD_TOO_LARGE",
    });
  }

  // Unknown error
  return new AppError(err.message || "An unexpected error occurred", {
    statusCode: 500,
    code: "INTERNAL_ERROR",
    isOperational: false,
    cause: err,
  });
}

// ========================================
// LOGGING
// ========================================

interface LogContext {
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  code: string;
  message: string;
  userId?: string | number;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  stack?: string;
}

/**
 * Log error with appropriate metadata
 */
function logError(
  normalizedError: AppError,
  originalError: unknown,
  req: Request,
): void {
  // Skip logging in test environment
  if (isTest) return;

  const context: LogContext = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    statusCode: normalizedError.statusCode,
    code: normalizedError.code,
    message: normalizedError.message,
    userId: (req as any).user?.id,
    ip: req.ip ?? req.socket.remoteAddress,
    userAgent: req.get("user-agent"),
    requestId: req.get("x-request-id") ?? req.get("x-correlation-id"),
  };

  // Non-operational errors need full debugging info
  if (!normalizedError.isOperational) {
    const fullContext = {
      ...context,
      stack: originalError instanceof Error ? originalError.stack : undefined,
      originalError: String(originalError),
    };

    console.error("🚨 [CRITICAL] Non-Operational Error:", fullContext);

    // In production, also send to error tracking service
    // Example: Sentry.captureException(originalError, { extra: fullContext });
    return;
  }

  // Server errors (5xx) always logged
  if (normalizedError.statusCode >= 500) {
    console.error("❌ [ERROR] Server Error:", context);
    return;
  }

  // In development, log client errors too for debugging
  if (isDevelopment) {
    console.warn("⚠️  [WARN] Client Error:", context);
  }
}

// ========================================
// RESPONSE BUILDER
// ========================================

interface ErrorResponseBody {
  success: false;
  code: string;
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
  debug?: {
    originalName?: string;
    isOperational: boolean;
    timestamp: string;
  };
}

/**
 * Build the error response body
 */
function buildResponseBody(
  normalizedError: AppError,
  originalError: unknown,
): ErrorResponseBody {
  const response: ErrorResponseBody = {
    success: false,
    code: normalizedError.code,
    message:
      normalizedError.isOperational || isDevelopment
        ? normalizedError.message
        : "An unexpected error occurred. Please try again later.",
  };

  // Include validation errors
  if (normalizedError instanceof ValidationError) {
    response.errors = normalizedError.errors;
  }

  // Include debug info in development
  if (isDevelopment) {
    response.stack =
      originalError instanceof Error ? originalError.stack : undefined;
    response.debug = {
      originalName:
        originalError instanceof Error
          ? originalError.constructor.name
          : typeof originalError,
      isOperational: normalizedError.isOperational,
      timestamp: normalizedError.timestamp.toISOString(),
    };
  }

  return response;
}

// ========================================
// MAIN ERROR HANDLER
// ========================================

/**
 * Express error handling middleware for DevJobs Pro.
 *
 * Handles all errors thrown in route handlers and middleware.
 * MUST be registered LAST in the middleware chain.
 *
 * @example
 * // In app.ts
 * app.use('/api/v1/jobs', jobRoutes);
 * app.use(notFoundHandler);
 * app.use(errorHandler); // <-- LAST
 */
export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // If headers already sent, delegate to Express default handler
  if (res.headersSent) {
    return next(err);
  }

  // Normalize error to AppError
  const normalizedError = normalizeError(err);

  // Log the error
  logError(normalizedError, err, req);

  // Set additional headers for rate limiting
  if (
    normalizedError.code === "RATE_LIMITED" &&
    "retryAfter" in normalizedError
  ) {
    res.set("Retry-After", String((normalizedError as any).retryAfter));
  }

  // Build and send response
  const responseBody = buildResponseBody(normalizedError, err);
  res.status(normalizedError.statusCode).json(responseBody);
};
```

### File 4: `src/middleware/notFound.ts` (404 Handler)

```typescript
// src/middleware/notFound.ts
// ========================================
// 404 HANDLER FOR UNMATCHED ROUTES
// ========================================

import type { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../utils/errors";

/**
 * Handle 404 for unmatched routes.
 *
 * MUST be placed AFTER all route definitions
 * and BEFORE the error handler.
 *
 * @example
 * // In app.ts
 * app.use('/api/v1/jobs', jobRoutes);
 * app.use(notFoundHandler); // <-- After routes
 * app.use(errorHandler);    // <-- After notFound
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const error = new NotFoundError(
    `Cannot ${req.method} ${req.originalUrl}`,
    "route",
    req.originalUrl,
  );

  next(error);
};
```

### File 5: `src/app.ts` (Wire Everything Together)

```typescript
// src/app.ts
// ========================================
// DEVJOBS PRO EXPRESS APPLICATION
// ========================================

import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Middleware
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";

// Routes
import jobRoutes from "./routes/jobRoutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import companyRoutes from "./routes/companyRoutes";

const app: Express = express();

// ========================================
// 1. CORE MIDDLEWARE
// ========================================

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "*",
    credentials: true,
  }),
);

// Body parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ========================================
// 2. REQUEST LOGGING
// ========================================

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));
}

// ========================================
// 3. HEALTH CHECK
// ========================================

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ========================================
// 4. API ROUTES
// ========================================

const API_V1 = "/api/v1";

app.use(`${API_V1}/jobs`, jobRoutes);
app.use(`${API_V1}/auth`, authRoutes);
app.use(`${API_V1}/users`, userRoutes);
app.use(`${API_V1}/applications`, applicationRoutes);
app.use(`${API_V1}/companies`, companyRoutes);

// ========================================
// 5. 404 HANDLER (Catches unmatched routes)
// ========================================

app.use(notFoundHandler);

// ========================================
// 6. ERROR HANDLER (MUST BE LAST!)
// ========================================

app.use(errorHandler);

export default app;
```

### Update Controllers to Use Error Classes

```typescript
// src/controllers/jobController.ts
import type { Request, Response } from "express";
import { db } from "../db";
import { jobs } from "../db/schema";
import { eq } from "drizzle-orm";
import {
  JobNotFoundError,
  ValidationError,
  ForbiddenError,
} from "../utils/errors";

export const getJobById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const jobId = Number(req.params.id);

  if (isNaN(jobId) || jobId <= 0) {
    throw new ValidationError("Invalid job ID", {
      id: ["Job ID must be a positive number"],
    });
  }

  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));

  if (!job) {
    throw new JobNotFoundError(jobId);
  }

  res.json({
    success: true,
    data: job,
  });
};

export const updateJob = async (req: Request, res: Response): Promise<void> => {
  const jobId = Number(req.params.id);
  const userId = (req as any).user?.id;

  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));

  if (!job) {
    throw new JobNotFoundError(jobId);
  }

  // Only the job poster can update
  if (job.userId !== userId) {
    throw new ForbiddenError("You can only edit your own job postings");
  }

  const { title, company, location, salary, description } = req.body;

  const [updatedJob] = await db
    .update(jobs)
    .set({
      title: title ?? job.title,
      company: company ?? job.company,
      location: location ?? job.location,
      salary: salary ?? job.salary,
      description: description ?? job.description,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, jobId))
    .returning();

  res.json({
    success: true,
    data: updatedJob,
  });
};

export const deleteJob = async (req: Request, res: Response): Promise<void> => {
  const jobId = Number(req.params.id);
  const userId = (req as any).user?.id;

  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));

  if (!job) {
    throw new JobNotFoundError(jobId);
  }

  if (job.userId !== userId) {
    throw new ForbiddenError("You can only delete your own job postings");
  }

  await db.delete(jobs).where(eq(jobs.id, jobId));

  res.status(204).send();
};
```

---

## Examples: Testing Error Responses with curl

### Test 1: 404 Not Found

```bash
# Request a job that doesn't exist
curl -X GET http://localhost:3000/api/v1/jobs/99999 \
  -H "Content-Type: application/json" | jq

# Expected Response:
{
  "success": false,
  "code": "NOT_FOUND",
  "message": "Job with ID '99999' not found",
  "resourceType": "job",
  "resourceId": 99999
}
```

### Test 2: Validation Error

```bash
# Create job with invalid data
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "", "salary": "not-a-number"}' | jq

# Expected Response:
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": {
    "title": ["Title is required", "Title must be at least 3 characters"],
    "salary": ["Expected number, received string"]
  }
}
```

### Test 3: Unauthorized

```bash
# Access protected route without token
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{"title": "Developer"}' | jq

# Expected Response:
{
  "success": false,
  "code": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

### Test 4: Forbidden

```bash
# Try to delete someone else's job
curl -X DELETE http://localhost:3000/api/v1/jobs/5 \
  -H "Authorization: Bearer $TOKEN" | jq

# Expected Response:
{
  "success": false,
  "code": "FORBIDDEN",
  "message": "You can only delete your own job postings"
}
```

### Test 5: Duplicate Resource (Conflict)

```bash
# Try to apply to the same job twice
curl -X POST http://localhost:3000/api/v1/jobs/1/apply \
  -H "Authorization: Bearer $TOKEN" | jq

# Expected Response (second request):
{
  "success": false,
  "code": "CONFLICT",
  "message": "You have already applied to job '1'"
}
```

### Test 6: Route Not Found

```bash
# Request non-existent route
curl -X GET http://localhost:3000/api/v1/nonexistent | jq

# Expected Response:
{
  "success": false,
  "code": "NOT_FOUND",
  "message": "Cannot GET /api/v1/nonexistent",
  "resourceType": "route",
  "resourceId": "/api/v1/nonexistent"
}
```

### Test 7: Invalid JSON

```bash
# Send malformed JSON
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d 'not valid json' | jq

# Expected Response:
{
  "success": false,
  "code": "INVALID_JSON",
  "message": "Invalid JSON in request body"
}
```

---

## Pro Tips

### 1. Test Every Error Code Path

```typescript
// tests/errors.test.ts
describe("Error Handling", () => {
  it("returns 404 for non-existent job", async () => {
    const response = await request(app).get("/api/v1/jobs/99999");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("NOT_FOUND");
  });

  it("returns 400 for invalid job ID", async () => {
    const response = await request(app).get("/api/v1/jobs/invalid");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 401 for missing auth", async () => {
    const response = await request(app).post("/api/v1/jobs");
    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
  });
});
```

### 2. Document Error Responses in API Docs

```typescript
/**
 * @route GET /api/v1/jobs/:id
 * @description Get job by ID
 *
 * @success 200 - Job found
 * @error 400 - Invalid job ID format
 * @error 404 - Job not found
 * @error 500 - Server error
 *
 * @example success
 * {
 *   "success": true,
 *   "data": { "id": 1, "title": "Developer", ... }
 * }
 *
 * @example error (404)
 * {
 *   "success": false,
 *   "code": "NOT_FOUND",
 *   "message": "Job with ID '999' not found"
 * }
 */
```

### 3. Use OpenAPI/Swagger for Error Documentation

```yaml
# openapi.yaml
components:
  schemas:
    Error:
      type: object
      required:
        - success
        - code
        - message
      properties:
        success:
          type: boolean
          example: false
        code:
          type: string
          example: NOT_FOUND
        message:
          type: string
          example: Job with ID '999' not found
        errors:
          type: object
          additionalProperties:
            type: array
            items:
              type: string

    NotFoundError:
      allOf:
        - $ref: "#/components/schemas/Error"
        - properties:
            resourceType:
              type: string
            resourceId:
              type: string
```

### 4. Add Request ID for Debugging

```typescript
// middleware/requestId.ts
import { randomUUID } from "crypto";
import type { Request, Response, NextFunction } from "express";

export const requestId = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const id = req.get("x-request-id") ?? randomUUID();
  req.headers["x-request-id"] = id;
  res.set("x-request-id", id);
  next();
};

// In app.ts
app.use(requestId);

// In error logs
console.error({
  requestId: req.get("x-request-id"),
  // ... other context
});
```

---

## 5-Minute Debugger: Common Error System Issues

### Problem 1: Error Handler Not Being Called

**Check list:**

```typescript
// 1. Is it registered LAST?
app.use(jobRoutes);
app.use(errorHandler); // ✅ After routes

// 2. Does it have 4 parameters?
app.use((err, req, res, next) => { ... }); // ✅ All 4

// 3. Are you calling next(error)?
throw new Error('will be caught in Express 5');
next(new Error('also works'));
```

### Problem 2: Stack Trace Showing in Production

**Fix:**

```typescript
// Always check NODE_ENV
if (process.env.NODE_ENV === "development") {
  response.stack = err.stack;
}
```

### Problem 3: Custom Error Properties Not in Response

**Fix: Override toJSON()**

```typescript
class CustomError extends AppError {
  customField: string;

  override toJSON() {
    return {
      ...super.toJSON(),
      customField: this.customField, // Include custom properties
    };
  }
}
```

### Problem 4: Async Errors in Callbacks Not Caught

**Fix: Use promisified versions or explicit try/catch**

```typescript
// ❌ Not caught by Express 5
fs.readFile(path, (err, data) => {
  if (err) throw err;
});

// ✅ Use promises
import { readFile } from "fs/promises";
const data = await readFile(path);
```

---

## Definition of Done

Before moving to the next module, verify you have:

- [ ] `src/utils/errors.ts` with all error classes
- [ ] `src/utils/catchAsync.ts` (optional wrapper)
- [ ] `src/middleware/errorHandler.ts` (global handler)
- [ ] `src/middleware/notFound.ts` (404 handler)
- [ ] Updated `src/app.ts` with correct middleware order
- [ ] Controllers throwing appropriate error classes
- [ ] Tested all error scenarios with curl
- [ ] Understand dev vs production error responses

---

## Key Takeaways

1. **Error handling is infrastructure**, not a feature—it touches everything
2. **Middleware order matters**: error handler MUST be LAST
3. **Custom error classes** make controllers clean and consistent
4. **Environment awareness** protects production from exposing internals
5. **Test every error path**—users will find them if you don't
6. **Document error responses**—API consumers need to know what to expect

---

## What's Next?

In **Module 08: MongoDB & Mongoose**, you'll:

- Set up MongoDB database connection
- Create Mongoose schemas for DevJobs Pro
- Handle database-specific errors
- Integrate with the error system you just built

Your error handling foundation is ready. Time to persist some data! 🚀

---

## Navigation

← [Lesson 03: Global Error Handler](./03-global-error-handler.md) | [Module 08: MongoDB & Mongoose](../08-mongodb-mongoose/README.md) →
