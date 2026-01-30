# Lesson 4: Error Handling Fundamentals

> **Module 03: TypeScript + Async Patterns**
> Build bulletproof error handling for production TypeScript applications

---

## 🎯 The Hook

**Production code never crashes silently.**

When a job application fails to submit, when a database connection drops, when an API rate limit hits—your code must handle it gracefully. Users need clear error messages. Developers need detailed logs. The system needs to stay up.

In DevJobs Pro, every request could fail in dozens of ways: invalid input, unauthorized access, missing data, external service outages, network timeouts. Without proper error handling, you're building a house of cards.

This lesson teaches you to:

- Create typed, descriptive custom errors
- Handle errors at the right level
- Never swallow errors silently
- Build error utilities that make debugging effortless

---

## 📚 Core Concepts

### try/catch with async/await

```typescript
async function riskyOperation(): Promise<Data> {
  try {
    const result = await someAsyncCall();
    return result;
  } catch (error) {
    // Handle or transform the error
    console.error("Operation failed:", error);
    throw error; // Re-throw to propagate
  } finally {
    // Always runs: cleanup code
    await cleanup();
  }
}
```

### Error Propagation Through Async Call Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│             Error Propagation in Async Functions                     │
└─────────────────────────────────────────────────────────────────────┘

API Request
    │
    ▼
┌─────────────────┐
│  handleRequest  │  ◀── Catches and sends HTTP response
│   try/catch     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  createJob()    │  ◀── Business logic, may transform errors
│   try/catch?    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  db.insert()    │  ◀── Database layer, throws if fails
│                 │
└────────┬────────┘
         │
         ▼
    ┌─────────┐
    │  ERROR! │  Database constraint violation
    └────┬────┘
         │
         │ (Error bubbles UP the call stack)
         │
         ▼
Each level can:
  • Catch and handle (stop propagation)
  • Catch, transform, re-throw (add context)
  • Let it propagate (don't catch)


EXAMPLE FLOW:
─────────────
1. db.insert() throws: "UNIQUE constraint failed: jobs.slug"

2. createJob() catches, transforms:
   throw new ConflictError("A job with this URL already exists");

3. handleRequest() catches, responds:
   res.status(409).json({ error: "A job with this URL already exists" });
```

### Error Types in JavaScript

```typescript
// Built-in Error types
new Error("Generic error");
new TypeError("Expected string, got number");
new RangeError("Value out of range");
new ReferenceError("Variable not defined");
new SyntaxError("Invalid JSON");

// Error properties
const error = new Error("Something failed");
error.message; // "Something failed"
error.name; // "Error"
error.stack; // Stack trace string
error.cause; // ES2022: The underlying cause
```

### Typing Errors in TypeScript

TypeScript's `unknown` in catch blocks:

```typescript
// Before TypeScript 4.4: error was 'any'
// After TypeScript 4.4: error is 'unknown'

async function fetchData(): Promise<Data> {
  try {
    return await api.get("/data");
  } catch (error) {
    // 'error' is 'unknown' - we must narrow it!

    // Option 1: Type guard with instanceof
    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    }

    // Option 2: Type assertion (less safe)
    const message = (error as Error).message;

    // Option 3: Utility function
    const normalizedError = ensureError(error);
    console.error(normalizedError.message);

    throw error;
  }
}

// Utility to normalize unknown to Error
function ensureError(value: unknown): Error {
  if (value instanceof Error) return value;
  if (typeof value === "string") return new Error(value);
  if (typeof value === "object" && value !== null) {
    return new Error(JSON.stringify(value));
  }
  return new Error(String(value));
}
```

### Error.cause (ES2022)

Chain errors to preserve context:

```typescript
async function fetchUserProfile(userId: string): Promise<Profile> {
  try {
    const response = await fetch(`/api/users/${userId}/profile`);
    return await response.json();
  } catch (error) {
    // Preserve the original error as the cause
    throw new Error(`Failed to fetch profile for user ${userId}`, {
      cause: error,
    });
  }
}

// When caught later:
try {
  await fetchUserProfile("123");
} catch (error) {
  if (error instanceof Error) {
    console.error("Error:", error.message);
    // "Error: Failed to fetch profile for user 123"

    console.error("Caused by:", error.cause);
    // The original fetch error with more details
  }
}
```

---

## 💻 Code Examples

### Example 1: Wrapping Async Operations

```typescript
// src/utils/safe-async.ts

interface Result<T, E = Error> {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
}

// Wrap any async function for safe error handling
async function trySafe<T>(
  promise: Promise<T>
): Promise<Result<T>> {
  try {
    const data = await promise;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: ensureError(error) };
  }
}

// Usage: No try/catch needed!
async function getJob(jobId: string) {
  const result = await trySafe(db.job.findUnique({ where: { id: jobId } }));

  if (!result.success) {
    console.error("Database error:", result.error.message);
    return null;
  }

  return result.data;
}

// Alternative: Go-style tuple returns
async function trySafeTuple<T>(
  promise: Promise<T>
): Promise<[Error | null, T | null]> {
  try {
    const data = await promise;
    return [null, data];
  } catch (error) {
    return [ensureError(error), null];
  }
}

// Usage
const [error, job] = await trySafeTuple(db.job.findUnique({ where: { id: jobId } }));

if (error) {
  console.error("Failed:", error.message);
  return;
}

// job is safely narrowed to non-null here
console.log(job.title);
```

### Example 2: Creating Custom AppError Class

```typescript
// src/errors/app-error.ts

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE";

export interface AppErrorOptions {
  code: ErrorCode;
  message: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  cause?: Error;
  isOperational?: boolean;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;

  constructor(options: AppErrorOptions) {
    super(options.message, { cause: options.cause });

    this.name = "AppError";
    this.code = options.code;
    this.statusCode =
      options.statusCode ?? this.getDefaultStatusCode(options.code);
    this.details = options.details;
    this.isOperational = options.isOperational ?? true;
    this.timestamp = new Date();

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  private getDefaultStatusCode(code: ErrorCode): number {
    const statusCodes: Record<ErrorCode, number> = {
      VALIDATION_ERROR: 400,
      NOT_FOUND: 404,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      CONFLICT: 409,
      RATE_LIMITED: 429,
      INTERNAL_ERROR: 500,
      SERVICE_UNAVAILABLE: 503,
    };
    return statusCodes[code];
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      ...(process.env.NODE_ENV === "development" && { stack: this.stack }),
    };
  }
}

// Type guard
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
```

### Example 3: Specialized Error Classes

```typescript
// src/errors/index.ts

import { AppError, type ErrorCode } from "./app-error.js";

// === Not Found Errors ===
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    super({
      code: "NOT_FOUND",
      message: identifier
        ? `${resource} with ID '${identifier}' not found`
        : `${resource} not found`,
      details: { resource, identifier },
    });
    this.name = "NotFoundError";
  }
}

// === Validation Errors ===
export interface ValidationIssue {
  field: string;
  message: string;
  code: string;
}

export class ValidationError extends AppError {
  public readonly issues: ValidationIssue[];

  constructor(message: string, issues: ValidationIssue[] = []) {
    super({
      code: "VALIDATION_ERROR",
      message,
      details: { issues },
    });
    this.name = "ValidationError";
    this.issues = issues;
  }

  static fromZodError(zodError: {
    issues: Array<{ path: (string | number)[]; message: string; code: string }>;
  }): ValidationError {
    const issues: ValidationIssue[] = zodError.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }));
    return new ValidationError("Validation failed", issues);
  }
}

// === Authentication Errors ===
export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super({
      code: "UNAUTHORIZED",
      message,
    });
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super({
      code: "FORBIDDEN",
      message,
    });
    this.name = "ForbiddenError";
  }
}

// === Conflict Errors ===
export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({
      code: "CONFLICT",
      message,
      details,
    });
    this.name = "ConflictError";
  }
}

// === Rate Limit Errors ===
export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(retryAfter: number) {
    super({
      code: "RATE_LIMITED",
      message: `Too many requests. Please retry after ${retryAfter} seconds.`,
      statusCode: 429,
      details: { retryAfter },
    });
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

// === Database Errors ===
export class DatabaseError extends AppError {
  constructor(message: string, cause?: Error) {
    super({
      code: "INTERNAL_ERROR",
      message: "A database error occurred",
      isOperational: false, // These are programmer errors
      cause,
      details: { originalMessage: message },
    });
    this.name = "DatabaseError";
  }
}

// Re-export base class
export { AppError, isAppError } from "./app-error.js";
```

### Example 4: Error Boundary Pattern

```typescript
// src/middleware/error-handler.ts

import type { Request, Response, NextFunction } from "express";
import {
  AppError,
  isAppError,
  ValidationError,
  DatabaseError,
} from "../errors/index.js";

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    stack?: string;
  };
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Log all errors
  console.error(`[${new Date().toISOString()}] Error:`, {
    method: req.method,
    path: req.path,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error.cause && { cause: error.cause }),
    },
  });

  // Handle known operational errors
  if (isAppError(error)) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      },
    };

    res.status(error.statusCode).json(response);
    return;
  }

  // Handle Zod validation errors (if using Zod)
  if (error.name === "ZodError") {
    const validationError = ValidationError.fromZodError(
      error as unknown as {
        issues: Array<{
          path: (string | number)[];
          message: string;
          code: string;
        }>;
      },
    );
    res.status(400).json({
      success: false,
      error: {
        code: validationError.code,
        message: validationError.message,
        details: validationError.details,
      },
    });
    return;
  }

  // Handle unknown/programmer errors
  // In production, don't expose internal error details
  const isProduction = process.env.NODE_ENV === "production";

  const response: ErrorResponse = {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: isProduction ? "An unexpected error occurred" : error.message,
      ...(!isProduction && { stack: error.stack }),
    },
  };

  res.status(500).json(response);

  // For non-operational errors, you might want to:
  // - Alert the team (PagerDuty, Slack)
  // - Restart the process gracefully
  // - Log to error tracking (Sentry, Datadog)
}

// Async error wrapper for Express routes
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

---

## 🛠️ Mini-Tutorial: Create Typed Error Handling Utilities

Let's build a complete error handling system for DevJobs Pro.

### Step 1: Set Up Error Infrastructure

```typescript
// src/errors/utils.ts

/**
 * Ensures any thrown value becomes an Error instance
 */
export function ensureError(value: unknown): Error {
  if (value instanceof Error) {
    return value;
  }

  if (typeof value === "string") {
    return new Error(value);
  }

  if (typeof value === "object" && value !== null) {
    // Try to extract message from object
    const obj = value as Record<string, unknown>;
    if (typeof obj.message === "string") {
      const error = new Error(obj.message);
      if (typeof obj.name === "string") {
        error.name = obj.name;
      }
      return error;
    }
    return new Error(JSON.stringify(value));
  }

  return new Error(String(value));
}

/**
 * Type-safe error checking
 */
export function isErrorWithCode(
  error: unknown,
  code: string,
): error is Error & { code: string } {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as Error & { code: string }).code === code
  );
}

/**
 * Wrap an async function to catch and transform errors
 */
export function withErrorTransform<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  transformer: (error: Error) => Error,
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw transformer(ensureError(error));
    }
  };
}
```

### Step 2: Create Service-Level Error Handling

```typescript
// src/services/job.service.ts

import { db } from "../db/client.js";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  DatabaseError,
} from "../errors/index.js";
import { ensureError, isErrorWithCode } from "../errors/utils.js";

interface CreateJobInput {
  title: string;
  description: string;
  companyId: string;
  salary: { min: number; max: number };
  skills: string[];
}

export async function createJob(
  input: CreateJobInput,
  userId: string,
): Promise<Job> {
  // Validate input
  if (input.salary.min > input.salary.max) {
    throw new ValidationError("Invalid salary range", [
      {
        field: "salary",
        message: "Minimum salary cannot be greater than maximum",
        code: "invalid_range",
      },
    ]);
  }

  // Check company exists and user owns it
  const company = await db.company.findUnique({
    where: { id: input.companyId },
  });

  if (!company) {
    throw new NotFoundError("Company", input.companyId);
  }

  if (company.ownerId !== userId) {
    throw new ForbiddenError("You can only create jobs for your own company");
  }

  // Generate slug
  const slug = generateSlug(input.title);

  // Create job with error handling
  try {
    const job = await db.job.create({
      data: {
        ...input,
        slug,
        status: "draft",
        postedBy: userId,
      },
    });

    return job;
  } catch (error) {
    const err = ensureError(error);

    // Handle unique constraint violation (duplicate slug)
    if (isErrorWithCode(error, "P2002")) {
      throw new ConflictError("A job with a similar title already exists", {
        slug,
      });
    }

    // Handle foreign key constraint (invalid company/user)
    if (isErrorWithCode(error, "P2003")) {
      throw new ValidationError("Invalid reference", [
        {
          field: "companyId",
          message: "Company does not exist",
          code: "invalid_reference",
        },
      ]);
    }

    // Unknown database error - wrap it
    throw new DatabaseError(err.message, err);
  }
}

export async function getJobById(jobId: string): Promise<Job> {
  const job = await db.job.findUnique({
    where: { id: jobId },
    include: { company: true },
  });

  if (!job) {
    throw new NotFoundError("Job", jobId);
  }

  return job;
}

export async function applyToJob(
  jobId: string,
  candidateId: string,
  coverLetter: string,
): Promise<Application> {
  // Get job or throw NotFoundError
  const job = await getJobById(jobId);

  if (job.status !== "published") {
    throw new ValidationError("Cannot apply to this job", [
      {
        field: "jobId",
        message: "Job is not accepting applications",
        code: "job_not_published",
      },
    ]);
  }

  // Check for duplicate application
  const existing = await db.application.findFirst({
    where: { jobId, candidateId },
  });

  if (existing) {
    throw new ConflictError("You have already applied to this job", {
      applicationId: existing.id,
      appliedAt: existing.appliedAt,
    });
  }

  // Create application
  try {
    const application = await db.application.create({
      data: {
        jobId,
        candidateId,
        coverLetter,
        status: "pending",
      },
    });

    return application;
  } catch (error) {
    throw new DatabaseError("Failed to create application", ensureError(error));
  }
}
```

### Step 3: Create Route Handlers with Error Handling

```typescript
// src/routes/jobs.ts

import { Router } from "express";
import { asyncHandler } from "../middleware/error-handler.js";
import * as jobService from "../services/job.service.js";
import { NotFoundError, ValidationError } from "../errors/index.js";

const router = Router();

// GET /jobs/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const job = await jobService.getJobById(req.params.id);
    res.json({ success: true, data: job });
  }),
);

// POST /jobs
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError();
    }

    const job = await jobService.createJob(req.body, userId);
    res.status(201).json({ success: true, data: job });
  }),
);

// POST /jobs/:id/apply
router.post(
  "/:id/apply",
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { coverLetter } = req.body;

    if (!userId) {
      throw new UnauthorizedError();
    }

    const application = await jobService.applyToJob(
      req.params.id,
      userId,
      coverLetter,
    );

    res.status(201).json({ success: true, data: application });
  }),
);

export { router as jobsRouter };
```

---

## 🎯 Practice Challenge

### Challenge: Create DevJobs Pro Base Error Classes

Build a complete error system for DevJobs Pro with these requirements:

**Error Classes to Create:**

1. **AppError** (base class)
   - Properties: code, message, statusCode, details, cause, isOperational
   - Method: toJSON() for API responses

2. **NotFoundError**
   - Takes: resource name, optional identifier
   - Example: `new NotFoundError("Job", "job_123")`

3. **ValidationError**
   - Takes: message, array of field issues
   - Static method: `fromZodError()` to convert Zod errors

4. **AuthError**
   - Takes: message, optional error type ("expired" | "invalid" | "missing")
   - Should be 401 Unauthorized

5. **ForbiddenError**
   - Takes: message, optional resource details
   - Should be 403 Forbidden

**Additional Requirements:**

- All errors extend AppError
- Include type guards for each error type
- Create error handler middleware for Express
- Create asyncHandler wrapper for routes
- All errors should serialize properly for API responses

<details>
<summary>Click to reveal solution</summary>

```typescript
// src/errors/app-error.ts

export type ErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export interface ErrorDetails {
  [key: string]: unknown;
}

export interface AppErrorConfig {
  code: ErrorCode;
  message: string;
  statusCode?: number;
  details?: ErrorDetails;
  cause?: Error;
  isOperational?: boolean;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: ErrorDetails;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  private static readonly STATUS_MAP: Record<ErrorCode, number> = {
    BAD_REQUEST: 400,
    VALIDATION_ERROR: 400,
    NOT_FOUND: 404,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    CONFLICT: 409,
    RATE_LIMITED: 429,
    INTERNAL_ERROR: 500,
  };

  constructor(config: AppErrorConfig) {
    super(config.message, { cause: config.cause });

    this.name = this.constructor.name;
    this.code = config.code;
    this.statusCode = config.statusCode ?? AppError.STATUS_MAP[config.code];
    this.details = config.details;
    this.isOperational = config.isOperational ?? true;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        ...(this.details && { details: this.details }),
        timestamp: this.timestamp,
        ...(process.env.NODE_ENV !== "production" && { stack: this.stack }),
      },
    };
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
```

```typescript
// src/errors/not-found-error.ts

import { AppError } from "./app-error.js";

export class NotFoundError extends AppError {
  public readonly resource: string;
  public readonly identifier?: string;

  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' was not found`
      : `${resource} not found`;

    super({
      code: "NOT_FOUND",
      message,
      details: { resource, identifier },
    });

    this.resource = resource;
    this.identifier = identifier;
  }
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}
```

```typescript
// src/errors/validation-error.ts

import { AppError } from "./app-error.js";

export interface FieldIssue {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export class ValidationError extends AppError {
  public readonly issues: FieldIssue[];

  constructor(message: string, issues: FieldIssue[] = []) {
    super({
      code: "VALIDATION_ERROR",
      message,
      details: { issues },
    });

    this.issues = issues;
  }

  static fromZodError(zodError: {
    issues: Array<{
      path: (string | number)[];
      message: string;
      code: string;
    }>;
  }): ValidationError {
    const issues: FieldIssue[] = zodError.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }));

    return new ValidationError("Validation failed", issues);
  }

  static singleField(
    field: string,
    message: string,
    code = "invalid",
  ): ValidationError {
    return new ValidationError(message, [{ field, message, code }]);
  }
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}
```

```typescript
// src/errors/auth-error.ts

import { AppError } from "./app-error.js";

export type AuthErrorType = "expired" | "invalid" | "missing";

export class AuthError extends AppError {
  public readonly errorType?: AuthErrorType;

  constructor(message = "Authentication required", errorType?: AuthErrorType) {
    super({
      code: "UNAUTHORIZED",
      message,
      details: errorType ? { type: errorType } : undefined,
    });

    this.errorType = errorType;
  }

  static expired(): AuthError {
    return new AuthError("Authentication token has expired", "expired");
  }

  static invalid(): AuthError {
    return new AuthError("Invalid authentication token", "invalid");
  }

  static missing(): AuthError {
    return new AuthError("Authentication token is required", "missing");
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}
```

```typescript
// src/errors/forbidden-error.ts

import { AppError } from "./app-error.js";

export class ForbiddenError extends AppError {
  public readonly resource?: string;
  public readonly action?: string;

  constructor(
    message = "You do not have permission to perform this action",
    options?: { resource?: string; action?: string },
  ) {
    super({
      code: "FORBIDDEN",
      message,
      details: options,
    });

    this.resource = options?.resource;
    this.action = options?.action;
  }
}

export function isForbiddenError(error: unknown): error is ForbiddenError {
  return error instanceof ForbiddenError;
}
```

```typescript
// src/errors/index.ts

// Base error
export {
  AppError,
  isAppError,
  type ErrorCode,
  type ErrorDetails,
} from "./app-error.js";

// Specific errors
export { NotFoundError, isNotFoundError } from "./not-found-error.js";
export {
  ValidationError,
  isValidationError,
  type FieldIssue,
} from "./validation-error.js";
export { AuthError, isAuthError, type AuthErrorType } from "./auth-error.js";
export { ForbiddenError, isForbiddenError } from "./forbidden-error.js";

// Utilities
export { ensureError } from "./utils.js";
```

```typescript
// src/middleware/error-handler.ts

import type { Request, Response, NextFunction } from "express";
import {
  AppError,
  isAppError,
  isValidationError,
  ensureError,
} from "../errors/index.js";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const error = ensureError(err);

  // Log error
  console.error(`[ERROR] ${req.method} ${req.path}:`, {
    message: error.message,
    stack: error.stack,
    ...(error.cause && { cause: error.cause }),
  });

  // Handle AppError instances
  if (isAppError(error)) {
    res.status(error.statusCode).json(error.toJSON());
    return;
  }

  // Handle Zod errors
  if (error.name === "ZodError") {
    const zodError = error as unknown as {
      issues: Array<{
        path: (string | number)[];
        message: string;
        code: string;
      }>;
    };
    const validationError = ValidationError.fromZodError(zodError);
    res.status(validationError.statusCode).json(validationError.toJSON());
    return;
  }

  // Unknown errors - hide details in production
  const isProd = process.env.NODE_ENV === "production";

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: isProd ? "An unexpected error occurred" : error.message,
      timestamp: new Date().toISOString(),
      ...(!isProd && { stack: error.stack }),
    },
  });
}

// Wrap async route handlers
export function asyncHandler<T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

</details>

---

## 💡 Pro Tips

### 1. Always Re-throw Unknown Errors

```typescript
// ❌ Bad: Swallowing unknown errors
try {
  await riskyOperation();
} catch (error) {
  if (error instanceof ValidationError) {
    return handleValidation(error);
  }
  // Unknown errors disappear silently!
}

// ✅ Good: Always handle or re-throw
try {
  await riskyOperation();
} catch (error) {
  if (error instanceof ValidationError) {
    return handleValidation(error);
  }
  // Re-throw unknown errors
  throw error;
}
```

### 2. Log Errors Before Handling

```typescript
// ✅ Always log before handling
catch (error) {
  // Log first - preserve evidence
  console.error("Operation failed:", {
    error: ensureError(error),
    context: { userId, operation: "createJob" },
  });

  // Then handle
  if (error instanceof NotFoundError) {
    return res.status(404).json({ error: error.message });
  }

  throw error;
}
```

### 3. Never Catch and Ignore

```typescript
// ❌ NEVER do this
try {
  await mightFail();
} catch {
  // Silently ignored - bugs will be impossible to find
}

// ❌ Also bad - logging but not handling properly
try {
  await mightFail();
} catch (error) {
  console.log(error); // And then what?
}

// ✅ Good - handle appropriately
try {
  await mightFail();
} catch (error) {
  console.error("Failed:", error);
  throw new AppError({
    code: "INTERNAL_ERROR",
    message: "Operation failed",
    cause: ensureError(error),
  });
}
```

### 4. Use Operational vs Programmer Error Distinction

```typescript
// Operational errors: Expected, recoverable
// - Invalid user input
// - Network timeouts
// - Rate limits
// - Resource not found

// Programmer errors: Unexpected, bugs
// - Null reference errors
// - Type errors
// - Assertion failures

class AppError extends Error {
  isOperational: boolean;

  constructor(message: string, isOperational = true) {
    super(message);
    this.isOperational = isOperational;
  }
}

// In error handler:
if (!isAppError(error) || !error.isOperational) {
  // This is a programmer error - maybe restart the process
  console.error("FATAL: Non-operational error", error);
  process.exit(1);
}
```

---

## 🔧 5-Minute Debugger

### Problem 1: "Cannot read property of undefined" in Async Code

```typescript
async function getJobTitle(jobId: string): Promise<string> {
  const job = await db.job.findUnique({ where: { id: jobId } });
  return job.title; // 💥 Error if job is null!
}
```

**Fix: Always handle null/undefined returns**

```typescript
async function getJobTitle(jobId: string): Promise<string> {
  const job = await db.job.findUnique({ where: { id: jobId } });

  if (!job) {
    throw new NotFoundError("Job", jobId);
  }

  return job.title; // Now TypeScript knows job is not null
}
```

**Enable strict null checks:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```

---

### Problem 2: Swallowed Errors in Promise Chains

```typescript
// The error disappears!
fetchUser(id)
  .then((user) => updateProfile(user))
  .then((profile) => console.log("Done:", profile));
// If fetchUser or updateProfile throws, nothing happens!
```

**Fix: Always add catch handler**

```typescript
fetchUser(id)
  .then((user) => updateProfile(user))
  .then((profile) => console.log("Done:", profile))
  .catch((error) => {
    console.error("Failed:", error);
    // Handle or re-throw
  });

// Or use async/await with try/catch
async function updateUserProfile(id: string) {
  try {
    const user = await fetchUser(id);
    const profile = await updateProfile(user);
    console.log("Done:", profile);
  } catch (error) {
    console.error("Failed:", error);
    throw error;
  }
}
```

---

### Problem 3: Lost Stack Traces When Wrapping Errors

```typescript
// ❌ Original stack trace is lost
catch (error) {
  throw new Error("Database operation failed");
}
```

**Fix: Use Error.cause (ES2022)**

```typescript
catch (error) {
  throw new Error("Database operation failed", {
    cause: error, // Preserves original error
  });
}

// Or in custom errors
class AppError extends Error {
  constructor(message: string, options?: { cause?: Error }) {
    super(message, options);
    this.name = "AppError";
  }
}

// When logging
console.error("Error:", error.message);
if (error.cause) {
  console.error("Caused by:", error.cause);
}
```

---

## ✅ Definition of Done

Before moving to the next module, verify:

- [ ] You can create custom error classes extending Error
- [ ] You understand when to use try/catch with async/await
- [ ] You know the difference between operational and programmer errors
- [ ] You can properly type errors with TypeScript's `unknown`
- [ ] You understand Error.cause for error chaining
- [ ] You have DevJobs Pro error classes (AppError, NotFoundError, ValidationError, AuthError)
- [ ] You've created error handling middleware for Express
- [ ] You never swallow errors silently

**Test yourself:**

1. Why is `error` typed as `unknown` in catch blocks?
2. What's the difference between `throw error` and `throw new Error(error.message)`?
3. When should an error be marked as `isOperational: false`?

---

## 🧭 Navigation

| Previous                                               | Up                                           | Next                                                          |
| ------------------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------- |
| [← Async/Await Patterns](./03-async-await-patterns.md) | [Module 03: TypeScript + Async](./README.md) | [Module 04: Express Basics →](../04-express-basics/README.md) |

---

**Congratulations!** You've completed Module 03. You now have the TypeScript and async foundations to build robust Node.js applications.

**Next up in Module 04:** We'll dive into Express.js—routing, middleware, request/response handling, and building real API endpoints for DevJobs Pro.
