# Lesson 03: Global Error Handler

## Introduction

> **Hook**: One place to catch them all—central error handling

You've got Express 5 catching errors. You've got custom error classes with status codes. But where do these errors actually get handled? How do you send the right response?

Enter the global error handler: a single middleware that intercepts ALL errors in your application, transforms them into proper API responses, logs what needs logging, and keeps your internals hidden in production.

---

## Learning Objectives

By the end of this lesson, you will:

- ✅ Understand Express error-handling middleware (the 4-parameter signature)
- ✅ Build environment-aware error responses (dev vs production)
- ✅ Handle different error types (validation, database, JWT, unknown)
- ✅ Implement proper error logging
- ✅ Create the DevJobs Pro global error handler

---

## The Theory: Express Error-Handling Middleware

### The Magic 4-Parameter Signature

Express identifies error-handling middleware by its 4 parameters:

```typescript
// Normal middleware: 3 params
app.use((req, res, next) => { ... });

// Error middleware: 4 params - MUST have all 4!
app.use((err, req, res, next) => { ... });
```

**Critical**: Even if you don't use `next`, you MUST include it in the signature for Express to recognize this as error middleware.

### How Errors Flow to the Handler

```typescript
// Any error thrown or passed to next() goes to error middleware
app.get("/job/:id", async (req, res) => {
  throw new NotFoundError("Job not found"); // → Goes to error handler
});

app.get("/legacy", (req, res, next) => {
  next(new Error("Old style error")); // → Also goes to error handler
});
```

### Middleware Placement Matters

Error handling middleware MUST be defined **LAST**, after all routes and other middleware:

```typescript
// app.ts - ORDER MATTERS!

// 1. Body parsing
app.use(express.json());

// 2. Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);

// 3. 404 handler for unmatched routes
app.use(notFoundHandler);

// 4. Error handler - LAST!
app.use(errorHandler);
```

---

## ASCII Diagram: Error Flow from Handler → Error Middleware → Response

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     COMPLETE ERROR FLOW IN EXPRESS 5                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   HTTP Request                                                              │
│       │                                                                     │
│       ▼                                                                     │
│   ┌──────────────┐                                                          │
│   │   Middleware │  (body parser, auth, etc.)                               │
│   └──────┬───────┘                                                          │
│          │                                                                  │
│          ▼                                                                  │
│   ┌──────────────────────────────────────────────────────────────────┐     │
│   │                      Route Handler                                │     │
│   │                                                                  │     │
│   │   // Success path                                                │     │
│   │   res.json({ data }) ─────────────────────────────────────────────┼──┐  │
│   │                                                                  │  │  │
│   │   // Error paths (all caught by Express 5)                       │  │  │
│   │   throw new NotFoundError()  ─────────────────┐                  │  │  │
│   │   throw new ValidationError() ────────────────┤                  │  │  │
│   │   await db.query() [throws] ──────────────────┤                  │  │  │
│   │   next(error) ────────────────────────────────┤                  │  │  │
│   └───────────────────────────────────────────────┼──────────────────┘  │  │
│                                                   │                     │  │
│                            ┌──────────────────────┘                     │  │
│                            │                                            │  │
│                            ▼                                            │  │
│   ┌──────────────────────────────────────────────────────────────────┐ │  │
│   │              GLOBAL ERROR HANDLER                                │ │  │
│   │   (err: Error, req: Request, res: Response, next: NextFunction)  │ │  │
│   │                                                                  │ │  │
│   │   ┌────────────────────────────────────────────────────────────┐ │ │  │
│   │   │  1. LOG ERROR                                              │ │ │  │
│   │   │     • Console (dev)                                        │ │ │  │
│   │   │     • Logger service (prod)                                │ │ │  │
│   │   │     • Error tracking (Sentry, etc.)                        │ │ │  │
│   │   └────────────────────────────────────────────────────────────┘ │ │  │
│   │                            │                                     │ │  │
│   │                            ▼                                     │ │  │
│   │   ┌────────────────────────────────────────────────────────────┐ │ │  │
│   │   │  2. TRANSFORM ERROR                                        │ │ │  │
│   │   │     • Check error type (AppError, Zod, JWT, etc.)          │ │ │  │
│   │   │     • Extract status code                                  │ │ │  │
│   │   │     • Format error message                                 │ │ │  │
│   │   │     • Check isOperational                                  │ │ │  │
│   │   └────────────────────────────────────────────────────────────┘ │ │  │
│   │                            │                                     │ │  │
│   │                            ▼                                     │ │  │
│   │   ┌────────────────────────────────────────────────────────────┐ │ │  │
│   │   │  3. BUILD RESPONSE                                         │ │ │  │
│   │   │                                                            │ │ │  │
│   │   │   Development:          Production:                        │ │ │  │
│   │   │   {                     {                                  │ │ │  │
│   │   │     success: false,       success: false,                  │ │ │  │
│   │   │     message: "...",       message: "...",                  │ │ │  │
│   │   │     code: "NOT_FOUND",    code: "NOT_FOUND"                │ │ │  │
│   │   │     stack: "Error...",  }                                  │ │ │  │
│   │   │     details: {...}      (no stack, no internals)           │ │ │  │
│   │   │   }                                                        │ │ │  │
│   │   └────────────────────────────────────────────────────────────┘ │ │  │
│   └─────────────────────────────────┬────────────────────────────────┘ │  │
│                                     │                                   │  │
│                                     ▼                                   ▼  │
│                            ┌───────────────────────────────────────────────┤
│                            │              HTTP Response                    │
│                            │  Status: 404 / 400 / 401 / 500 / etc.        │
│                            │  Content-Type: application/json               │
│                            └───────────────────────────────────────────────┘
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Examples

### Example 1: Basic Error Handler

```typescript
// middleware/errorHandler.ts
import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import { AppError } from "../utils/errors";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Default values
  let statusCode = 500;
  let message = "Internal server error";
  let code = "INTERNAL_ERROR";

  // If it's our custom AppError, use its properties
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  }

  // Log the error
  console.error(`[ERROR] ${statusCode} - ${message}`, err);

  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    code,
  });
};
```

### Example 2: Development vs Production Mode

```typescript
// middleware/errorHandler.ts
import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import { AppError, isAppError, isOperationalError } from "../utils/errors";

interface ErrorResponse {
  success: false;
  message: string;
  code: string;
  stack?: string;
  details?: unknown;
}

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Development error response - show everything
 */
function sendDevError(err: Error, res: Response, statusCode: number): void {
  const response: ErrorResponse = {
    success: false,
    message: err.message,
    code: isAppError(err) ? err.code : "INTERNAL_ERROR",
    stack: err.stack,
    details: err,
  };

  res.status(statusCode).json(response);
}

/**
 * Production error response - hide internals
 */
function sendProdError(err: Error, res: Response, statusCode: number): void {
  // Operational error: safe to show to user
  if (isOperationalError(err)) {
    const appErr = err as AppError;
    res.status(statusCode).json({
      success: false,
      message: appErr.message,
      code: appErr.code,
    });
    return;
  }

  // Programmer error: don't leak details
  console.error("💥 PROGRAMMER ERROR:", err);
  res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again later.",
    code: "INTERNAL_ERROR",
  });
}

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Determine status code
  const statusCode = isAppError(err) ? err.statusCode : 500;

  // Log all errors in dev, only non-operational in prod
  if (isDevelopment || !isOperationalError(err)) {
    console.error(`[${new Date().toISOString()}] Error:`, {
      statusCode,
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Send appropriate response
  if (isDevelopment) {
    sendDevError(err, res, statusCode);
  } else {
    sendProdError(err, res, statusCode);
  }
};
```

### Example 3: Handling Different Error Types

```typescript
// middleware/errorHandler.ts
import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import { ZodError } from "zod";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  isAppError,
  isOperationalError,
} from "../utils/errors";

/**
 * Convert Zod validation errors to our ValidationError format
 */
function handleZodError(err: ZodError): ValidationError {
  const errors: Record<string, string[]> = {};

  for (const issue of err.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }

  return new ValidationError("Validation failed", errors);
}

/**
 * Convert JWT errors to UnauthorizedError
 */
function handleJwtError(err: JsonWebTokenError): UnauthorizedError {
  if (err instanceof TokenExpiredError) {
    return new UnauthorizedError("Token has expired. Please log in again.");
  }
  return new UnauthorizedError("Invalid token. Please log in again.");
}

/**
 * Handle Drizzle/Database errors
 */
function handleDatabaseError(err: Error): AppError {
  // Check for specific database errors
  const message = err.message.toLowerCase();

  if (message.includes("unique constraint") || message.includes("duplicate")) {
    return new AppError("Resource already exists", {
      statusCode: 409,
      code: "DUPLICATE_ENTRY",
    });
  }

  if (message.includes("foreign key") || message.includes("reference")) {
    return new AppError("Related resource not found", {
      statusCode: 400,
      code: "INVALID_REFERENCE",
    });
  }

  // Generic database error - not operational (might be a bug)
  return new AppError("Database error", {
    statusCode: 500,
    code: "DATABASE_ERROR",
    isOperational: false,
    cause: err,
  });
}

/**
 * Normalize any error to AppError
 */
function normalizeError(err: Error): AppError {
  // Already an AppError
  if (isAppError(err)) {
    return err;
  }

  // Zod validation error
  if (err instanceof ZodError) {
    return handleZodError(err);
  }

  // JWT errors
  if (err instanceof JsonWebTokenError) {
    return handleJwtError(err);
  }

  // Database errors (Drizzle, etc.)
  if (
    err.name === "PostgresError" ||
    err.name === "DrizzleError" ||
    err.message.includes("SQLITE") ||
    err.message.includes("constraint")
  ) {
    return handleDatabaseError(err);
  }

  // Syntax errors (malformed JSON, etc.)
  if (err instanceof SyntaxError && "body" in err) {
    return new AppError("Invalid JSON in request body", {
      statusCode: 400,
      code: "INVALID_JSON",
    });
  }

  // Unknown error - not operational
  return new AppError(err.message || "An unexpected error occurred", {
    statusCode: 500,
    code: "INTERNAL_ERROR",
    isOperational: false,
    cause: err,
  });
}

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Normalize error to AppError
  const normalizedError = normalizeError(err);

  const isDev = process.env.NODE_ENV === "development";
  const { statusCode, message, code, isOperational } = normalizedError;

  // Logging
  if (isDev || !isOperational) {
    console.error(`[ERROR] ${req.method} ${req.path}`, {
      statusCode,
      code,
      message,
      ...(isDev && { stack: err.stack }),
    });
  }

  // Response
  const response: Record<string, unknown> = {
    success: false,
    code,
    message: isOperational || isDev ? message : "Something went wrong",
  };

  // Add validation errors if present
  if (normalizedError instanceof ValidationError) {
    response.errors = normalizedError.errors;
  }

  // Add stack in development
  if (isDev) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
```

### Example 4: Error Logging Integration

```typescript
// middleware/errorHandler.ts
import type { ErrorRequestHandler } from "express";
import { AppError, isAppError, isOperationalError } from "../utils/errors";

// Simple logger interface (replace with pino, winston, etc.)
interface Logger {
  info(message: string, meta?: object): void;
  warn(message: string, meta?: object): void;
  error(message: string, meta?: object): void;
}

const logger: Logger = {
  info: (msg, meta) => console.log(`[INFO] ${msg}`, meta),
  warn: (msg, meta) => console.warn(`[WARN] ${msg}`, meta),
  error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta),
};

export const errorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next,
): void => {
  const normalizedError = isAppError(err)
    ? err
    : new AppError(err.message, { isOperational: false, cause: err });

  const { statusCode, message, code, isOperational } = normalizedError;

  // Build log context
  const logContext = {
    statusCode,
    code,
    message,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id,
    requestId: req.headers["x-request-id"],
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  // Log based on error type
  if (!isOperational) {
    // 🚨 Bug! This needs investigation
    logger.error("Programmer Error - Investigation Required", {
      ...logContext,
      stack: err.stack,
      originalError: err.toString(),
    });

    // In production, you might:
    // - Send to Sentry/Bugsnag
    // - Alert PagerDuty
    // - Send Slack notification
  } else if (statusCode >= 500) {
    logger.error("Server Error", logContext);
  } else if (statusCode >= 400) {
    logger.warn("Client Error", logContext);
  } else {
    logger.info("Unexpected Error", logContext);
  }

  // Send response
  const isDev = process.env.NODE_ENV === "development";

  res.status(statusCode).json({
    success: false,
    code,
    message: isOperational || isDev ? message : "Something went wrong",
    ...(isDev && { stack: err.stack }),
  });
};
```

---

## Mini-Tutorial: Build Comprehensive Error Handler with Environment Awareness

Let's build the complete, production-ready error handler for DevJobs Pro.

### Step 1: Create Error Response Types

```typescript
// middleware/errorHandler.ts
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

// Environment detection
const NODE_ENV = process.env.NODE_ENV ?? "development";
const isDevelopment = NODE_ENV === "development";
const isProduction = NODE_ENV === "production";
const isTest = NODE_ENV === "test";
```

### Step 2: Create Error Transformers

```typescript
// middleware/errorHandler.ts (continued)

/**
 * Transform Zod validation errors
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
 * Transform JWT errors
 */
function transformJwtError(err: Error): AppError {
  const message =
    err.name === "TokenExpiredError"
      ? "Your session has expired. Please log in again."
      : "Invalid authentication token.";

  return new UnauthorizedError(message);
}

/**
 * Transform database errors (Drizzle, PostgreSQL, etc.)
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

  // Connection error
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

/**
 * Check if error is database-related
 */
function isDatabaseError(err: Error): boolean {
  return (
    err.name === "PostgresError" ||
    err.name === "DrizzleError" ||
    err.constructor.name === "DatabaseError" ||
    err.message.toLowerCase().includes("database") ||
    err.message.toLowerCase().includes("constraint") ||
    err.message.toLowerCase().includes("sql")
  );
}
```

### Step 3: Create the Main Error Handler

```typescript
// middleware/errorHandler.ts (continued)

/**
 * Normalize any error into an AppError
 */
function normalizeError(err: unknown): AppError {
  // Already our error
  if (isAppError(err)) {
    return err;
  }

  // Not an Error object
  if (!(err instanceof Error)) {
    return new AppError(String(err), {
      statusCode: 500,
      code: "UNKNOWN_ERROR",
      isOperational: false,
    });
  }

  // Zod validation
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

  // Unknown error
  return new AppError(err.message || "An unexpected error occurred", {
    statusCode: 500,
    code: "INTERNAL_ERROR",
    isOperational: false,
    cause: err,
  });
}

/**
 * Log error with appropriate metadata
 */
function logError(err: AppError, originalError: unknown, req: Request): void {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    statusCode: err.statusCode,
    code: err.code,
    message: err.message,
    userId: (req as any).user?.id ?? "anonymous",
    ip: req.ip ?? req.socket.remoteAddress,
    userAgent: req.get("user-agent"),
  };

  // Always log non-operational errors with full details
  if (!err.isOperational) {
    console.error("🚨 Non-Operational Error:", {
      ...logData,
      stack: originalError instanceof Error ? originalError.stack : undefined,
      originalError: String(originalError),
    });
    return;
  }

  // Log operational errors at appropriate levels
  if (err.statusCode >= 500) {
    console.error("❌ Server Error:", logData);
  } else if (isDevelopment) {
    console.warn("⚠️ Client Error:", logData);
  }
  // In production, we might not log 4xx errors to avoid noise
}

/**
 * Build the response object
 */
function buildResponse(err: AppError, originalError: unknown): object {
  const response: Record<string, unknown> = {
    success: false,
    code: err.code,
    message: err.isOperational ? err.message : "An unexpected error occurred",
  };

  // Include validation errors
  if (err instanceof ValidationError && err.errors) {
    response.errors = err.errors;
  }

  // Include extra details in development
  if (isDevelopment) {
    response.message = err.message; // Always show real message in dev
    response.stack =
      originalError instanceof Error ? originalError.stack : undefined;
    response.debug = {
      originalName:
        originalError instanceof Error
          ? originalError.constructor.name
          : typeof originalError,
      isOperational: err.isOperational,
    };
  }

  return response;
}

/**
 * Express error handling middleware
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

  // Normalize error
  const normalizedError = normalizeError(err);

  // Log error
  if (!isTest) {
    logError(normalizedError, err, req);
  }

  // Build and send response
  const response = buildResponse(normalizedError, err);
  res.status(normalizedError.statusCode).json(response);
};
```

### Step 4: Create 404 Handler for Unmatched Routes

```typescript
// middleware/notFound.ts
import type { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../utils/errors";

/**
 * Handle 404 for unmatched routes
 * Place AFTER all route definitions, BEFORE error handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
};
```

---

## Practice: Create DevJobs Pro Error Handler

### Complete Implementation

Create `src/middleware/errorHandler.ts` with all the features above:

```typescript
// src/middleware/errorHandler.ts
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

// ============================================
// CONFIGURATION
// ============================================

const NODE_ENV = process.env.NODE_ENV ?? "development";
const isDevelopment = NODE_ENV === "development";
const isProduction = NODE_ENV === "production";
const isTest = NODE_ENV === "test";

// ============================================
// ERROR TRANSFORMERS
// ============================================

function transformZodError(err: ZodError): ValidationError {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const field = issue.path.length > 0 ? issue.path.join(".") : "_root";
    fieldErrors[field] = fieldErrors[field] ?? [];
    fieldErrors[field].push(issue.message);
  }
  return new ValidationError("Validation failed", fieldErrors);
}

function transformJwtError(err: Error): UnauthorizedError {
  return new UnauthorizedError(
    err.name === "TokenExpiredError"
      ? "Session expired. Please log in again."
      : "Invalid authentication token.",
  );
}

function isDatabaseError(err: Error): boolean {
  return (
    ["PostgresError", "DrizzleError", "DatabaseError"].includes(err.name) ||
    /database|constraint|sql/i.test(err.message)
  );
}

function transformDatabaseError(err: Error): AppError {
  const msg = err.message.toLowerCase();

  if (msg.includes("unique") || msg.includes("duplicate")) {
    return new AppError("A record with this value already exists", {
      statusCode: 409,
      code: "DUPLICATE_ENTRY",
    });
  }
  if (msg.includes("foreign key")) {
    return new AppError("Referenced record does not exist", {
      statusCode: 400,
      code: "INVALID_REFERENCE",
    });
  }

  return new AppError("Database error", {
    statusCode: 500,
    code: "DATABASE_ERROR",
    isOperational: false,
    cause: err,
  });
}

// ============================================
// NORMALIZE ERROR
// ============================================

function normalizeError(err: unknown): AppError {
  if (isAppError(err)) return err;
  if (!(err instanceof Error)) {
    return new AppError(String(err), { statusCode: 500, isOperational: false });
  }
  if (err instanceof ZodError) return transformZodError(err);
  if (["JsonWebTokenError", "TokenExpiredError"].includes(err.name)) {
    return transformJwtError(err);
  }
  if (isDatabaseError(err)) return transformDatabaseError(err);
  if (err instanceof SyntaxError && "body" in err) {
    return new AppError("Invalid JSON", {
      statusCode: 400,
      code: "INVALID_JSON",
    });
  }

  return new AppError(err.message || "Unexpected error", {
    statusCode: 500,
    isOperational: false,
    cause: err,
  });
}

// ============================================
// LOGGER
// ============================================

function logError(err: AppError, original: unknown, req: Request): void {
  if (isTest) return;

  const ctx = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    statusCode: err.statusCode,
    code: err.code,
    message: err.message,
    userId: (req as any).user?.id,
    ip: req.ip,
  };

  if (!err.isOperational) {
    console.error("🚨 PROGRAMMER ERROR:", {
      ...ctx,
      stack: original instanceof Error ? original.stack : undefined,
    });
  } else if (err.statusCode >= 500 || isDevelopment) {
    console.error("❌ Error:", ctx);
  }
}

// ============================================
// RESPONSE BUILDER
// ============================================

function buildResponse(err: AppError, original: unknown): object {
  const response: Record<string, unknown> = {
    success: false,
    code: err.code,
    message:
      err.isOperational || isDevelopment ? err.message : "Something went wrong",
  };

  if (err instanceof ValidationError && err.errors) {
    response.errors = err.errors;
  }

  if (isDevelopment) {
    response.stack = original instanceof Error ? original.stack : undefined;
  }

  return response;
}

// ============================================
// MAIN ERROR HANDLER
// ============================================

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (res.headersSent) return next(err);

  const normalized = normalizeError(err);
  logError(normalized, err, req);

  const response = buildResponse(normalized, err);
  res.status(normalized.statusCode).json(response);
};
```

### Wire It Up in app.ts

```typescript
// src/app.ts
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";

// Routes
import jobRoutes from "./routes/jobRoutes";
import authRoutes from "./routes/authRoutes";
import applicationRoutes from "./routes/applicationRoutes";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/applications", applicationRoutes);

// 404 handler - catches all unmatched routes
app.use(notFoundHandler);

// Error handler - MUST BE LAST
app.use(errorHandler);

export default app;
```

---

## Pro Tips

### 1. Never Leak Stack Traces in Production

```typescript
// ❌ NEVER
res.json({ error: err.stack });

// ✅ ALWAYS check environment
if (process.env.NODE_ENV === "development") {
  response.stack = err.stack;
}
```

### 2. Always Log Full Error Internally

```typescript
// Even if you show generic message to user, LOG the real error
console.error("Full error:", err); // For ops/debugging
res.json({ message: "Something went wrong" }); // For user
```

### 3. Use Structured Logging in Production

```typescript
// Replace console.error with a proper logger
import pino from "pino";
const logger = pino({ level: process.env.LOG_LEVEL ?? "info" });

logger.error(
  {
    err: {
      message: err.message,
      stack: err.stack,
      code: err.code,
    },
    req: {
      method: req.method,
      url: req.url,
      userId: req.user?.id,
    },
  },
  "Request error",
);
```

### 4. Consider Error Tracking Services

```typescript
// Sentry integration example
import * as Sentry from "@sentry/node";

if (!err.isOperational) {
  Sentry.captureException(err, {
    extra: {
      path: req.path,
      method: req.method,
      userId: req.user?.id,
    },
  });
}
```

---

## 5-Minute Debugger

### Problem 1: Error Handler Not Triggered

**Symptoms**: Errors don't reach your error handler, request hangs

**Possible causes**:

1. **Wrong parameter count**

   ```typescript
   // ❌ Only 3 params - NOT an error handler!
   app.use((err, req, res) => { ... });

   // ✅ Must have 4 params
   app.use((err, req, res, next) => { ... });
   ```

2. **Declared before routes**

   ```typescript
   // ❌ Wrong order
   app.use(errorHandler);
   app.use("/api", routes);

   // ✅ Error handler LAST
   app.use("/api", routes);
   app.use(errorHandler);
   ```

### Problem 2: "next(err)" Forgotten

**Symptoms**: Error in middleware doesn't reach error handler

**Fix**:

```typescript
// ❌ Error swallowed
app.use((req, res, next) => {
  try {
    someSync();
  } catch (err) {
    console.log(err); // Just logged, not forwarded
  }
  next();
});

// ✅ Forward to error handler
app.use((req, res, next) => {
  try {
    someSync();
    next();
  } catch (err) {
    next(err); // Forward to error handler
  }
});
```

### Problem 3: Headers Already Sent

**Symptoms**: "Cannot set headers after they are sent"

**Fix**:

```typescript
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Always check this first!
  if (res.headersSent) {
    return next(err); // Let Express handle it
  }

  res.status(500).json({ error: err.message });
};
```

### Problem 4: Wrong Content-Type in Error Response

**Symptoms**: Error comes back as HTML instead of JSON

**Check**: Make sure you're calling `res.json()`, not `res.send()`:

```typescript
// ❌ Might send HTML based on Accept header
res.status(500).send({ error: "message" });

// ✅ Always sends JSON
res.status(500).json({ error: "message" });
```

---

## Definition of Done

Before moving to the next lesson, verify you can:

- [ ] Explain why error middleware needs 4 parameters
- [ ] Know that error middleware must be defined LAST
- [ ] Build environment-aware error responses (dev shows stack, prod hides it)
- [ ] Handle multiple error types (Zod, JWT, database, unknown)
- [ ] Implement proper error logging
- [ ] Have `src/middleware/errorHandler.ts` and `src/middleware/notFound.ts` created

---

## Key Takeaways

1. **4 parameters** identify error-handling middleware: `(err, req, res, next)`
2. **Placement matters**: Error handlers must be defined AFTER all routes
3. **Transform errors** from libraries (Zod, JWT) into your AppError format
4. **Environment awareness**: Full details in dev, sanitized in production
5. **Always log internally**, even when showing generic messages to users

---

## Navigation

← [Lesson 02: Custom Error Classes](./02-custom-error-classes.md) | [Lesson 04: DevJobs Error System](./04-devjobs-error-system.md) →
