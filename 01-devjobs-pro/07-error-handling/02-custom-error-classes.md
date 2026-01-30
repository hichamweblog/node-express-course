# Lesson 02: Custom Error Classes

## Introduction

> **Hook**: Not all errors are equal—some are 404s, some are 500s

In Lesson 1, we threw `new Error('Not found')`. But how does Express know that should be a 404? It doesn't. By default, all thrown errors become 500 Internal Server Errors.

Real APIs need to distinguish between "resource doesn't exist" (404), "validation failed" (400), "not logged in" (401), and "something exploded" (500). Custom error classes give us that power.

---

## Learning Objectives

By the end of this lesson, you will:

- ✅ Create custom error classes with status codes and metadata
- ✅ Understand operational vs programmer errors
- ✅ Build a complete type-safe error hierarchy with TypeScript
- ✅ Implement all error classes needed for DevJobs Pro

---

## The Theory: Why Custom Error Classes?

### The Problem with Generic Errors

```typescript
// ❌ All of these become HTTP 500
throw new Error("Not found");
throw new Error("Invalid input");
throw new Error("Not authorized");

// Your error handler has no way to know the correct status code
```

### The Solution: Error Classes with Metadata

```typescript
// ✅ Errors that carry their own status codes
throw new NotFoundError("Job not found"); // 404
throw new ValidationError("Invalid email format"); // 400
throw new UnauthorizedError("Please log in"); // 401
```

### Key Concepts

**1. Custom Properties**

Error classes can carry additional information:

- `statusCode`: HTTP status code to return
- `isOperational`: Is this an expected error or a bug?
- `code`: Machine-readable error code for frontend
- `details`: Additional error context

**2. Operational vs Programmer Errors**

| Operational Errors               | Programmer Errors                  |
| -------------------------------- | ---------------------------------- |
| User typed wrong password        | TypeError: undefined               |
| Resource not found               | Database connection not configured |
| Validation failed                | Forgot to await Promise            |
| Rate limit exceeded              | Null reference error               |
| **Expected**, handled gracefully | **Unexpected**, indicates bug      |
| Send meaningful message to user  | Send generic "Server Error"        |
| Don't need to wake up on-call    | Need to investigate and fix        |

---

## ASCII Diagram: Error Class Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ERROR CLASS HIERARCHY                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                            ┌─────────────┐                                  │
│                            │    Error    │  (Native JavaScript)             │
│                            │  (built-in) │                                  │
│                            └──────┬──────┘                                  │
│                                   │                                         │
│                                   │ extends                                 │
│                                   ▼                                         │
│                         ┌─────────────────────┐                             │
│                         │      AppError       │  (Our base class)           │
│                         ├─────────────────────┤                             │
│                         │ • statusCode: number│                             │
│                         │ • isOperational: bool│                            │
│                         │ • code?: string     │                             │
│                         └─────────┬───────────┘                             │
│                                   │                                         │
│            ┌──────────────────────┼──────────────────────┐                  │
│            │                      │                      │                  │
│            ▼                      ▼                      ▼                  │
│   ┌────────────────┐    ┌────────────────┐    ┌────────────────────┐       │
│   │ NotFoundError  │    │ ValidationError│    │ UnauthorizedError  │       │
│   │  (404)         │    │    (400)       │    │     (401)          │       │
│   └────────────────┘    └────────────────┘    └────────────────────┘       │
│                                                                             │
│   ┌────────────────┐    ┌────────────────┐    ┌────────────────────┐       │
│   │ ForbiddenError │    │ ConflictError  │    │  BadRequestError   │       │
│   │    (403)       │    │    (409)       │    │      (400)         │       │
│   └────────────────┘    └────────────────┘    └────────────────────┘       │
│                                                                             │
│   ┌────────────────┐    ┌────────────────┐                                  │
│   │RateLimitError  │    │  DatabaseError │                                  │
│   │    (429)       │    │     (500)      │                                  │
│   └────────────────┘    └────────────────┘                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

    Status Code Reference:
    ┌──────┬──────────────────────┬─────────────────────────────────────────┐
    │ Code │ Name                 │ When to Use                             │
    ├──────┼──────────────────────┼─────────────────────────────────────────┤
    │ 400  │ Bad Request          │ Malformed syntax, invalid JSON          │
    │ 401  │ Unauthorized         │ Missing/invalid authentication          │
    │ 403  │ Forbidden            │ Authenticated but not allowed           │
    │ 404  │ Not Found            │ Resource doesn't exist                  │
    │ 409  │ Conflict             │ Duplicate, version conflict             │
    │ 422  │ Unprocessable Entity │ Validation failed (valid syntax)        │
    │ 429  │ Too Many Requests    │ Rate limit exceeded                     │
    │ 500  │ Internal Server Error│ Server-side bug, unexpected error       │
    └──────┴──────────────────────┴─────────────────────────────────────────┘
```

---

## Examples

### Example 1: Creating the AppError Base Class

```typescript
// src/utils/errors.ts

/**
 * Base application error class
 * All custom errors extend from this
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

    // Set the prototype explicitly (required for extending built-ins in TS)
    Object.setPrototypeOf(this, new.target.prototype);

    // Name the error after the class
    this.name = this.constructor.name;
  }
}
```

**Why These Properties?**

- `statusCode`: HTTP status code for the response
- `isOperational`:
  - `true` = expected error, safe to show message to user
  - `false` = programmer error/bug, show generic message
- `code`: Machine-readable code like `'RESOURCE_NOT_FOUND'` for frontends

### Example 2: HTTP Error Classes

```typescript
// src/utils/errors.ts (continued)

/**
 * 404 Not Found - Resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", code?: string) {
    super(message, 404, true, code ?? "NOT_FOUND");
  }
}

/**
 * 400 Bad Request - Malformed request
 */
export class BadRequestError extends AppError {
  constructor(message: string = "Bad request", code?: string) {
    super(message, 400, true, code ?? "BAD_REQUEST");
  }
}

/**
 * 400/422 Validation Error - Input validation failed
 */
export class ValidationError extends AppError {
  public readonly errors?: Record<string, string[]>;

  constructor(
    message: string = "Validation failed",
    errors?: Record<string, string[]>,
  ) {
    super(message, 400, true, "VALIDATION_ERROR");
    this.errors = errors;
  }
}

/**
 * 401 Unauthorized - Not authenticated
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, true, "UNAUTHORIZED");
  }
}

/**
 * 403 Forbidden - Authenticated but not allowed
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403, true, "FORBIDDEN");
  }
}

/**
 * 409 Conflict - Duplicate resource or version conflict
 */
export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409, true, "CONFLICT");
  }
}

/**
 * 429 Too Many Requests - Rate limited
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string = "Too many requests", retryAfter?: number) {
    super(message, 429, true, "RATE_LIMITED");
    this.retryAfter = retryAfter;
  }
}
```

### Example 3: Using isOperational

```typescript
// src/utils/errors.ts (continued)

/**
 * Internal/Database Errors - NOT operational (bugs!)
 */
export class DatabaseError extends AppError {
  constructor(message: string = "Database error") {
    // isOperational = false - this is a bug, not user error
    super(message, 500, false, "DATABASE_ERROR");
  }
}

// Usage in error handler (Lesson 3 preview)
function handleError(err: Error, res: Response) {
  if (err instanceof AppError) {
    if (err.isOperational) {
      // Safe to show to user
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        code: err.code,
      });
    } else {
      // Bug! Log it, show generic message
      console.error("PROGRAMMER ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
        code: "INTERNAL_ERROR",
      });
    }
  }

  // Unknown error - treat as non-operational
  console.error("UNKNOWN ERROR:", err);
  return res.status(500).json({
    success: false,
    message: "Something went wrong",
    code: "INTERNAL_ERROR",
  });
}
```

---

## Mini-Tutorial: Build Complete Error Class Hierarchy with TypeScript

Let's build the complete error system for DevJobs Pro.

### Step 1: Create the Base Error Class

```typescript
// src/utils/errors.ts

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
 * Base application error class
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

    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
  }

  /**
   * Create a JSON-serializable representation
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      ...(process.env.NODE_ENV === "development" && { stack: this.stack }),
    };
  }
}
```

### Step 2: Create Specific Error Classes

```typescript
// src/utils/errors.ts (continued)

// ============================================
// 4XX CLIENT ERRORS
// ============================================

/**
 * 400 Bad Request
 * Use when: Request syntax is malformed, missing required fields
 */
export class BadRequestError extends AppError {
  constructor(message: string = "Bad request") {
    super(message, {
      statusCode: 400,
      code: "BAD_REQUEST",
    });
  }
}

/**
 * 400 Validation Error
 * Use when: Input validation fails
 * Includes field-level error details
 */
export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(
    message: string = "Validation failed",
    errors: Record<string, string[]> = {},
  ) {
    super(message, {
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
    this.errors = errors;
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors,
    };
  }
}

/**
 * 401 Unauthorized
 * Use when: Authentication is required but not provided or invalid
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, {
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  }
}

/**
 * 403 Forbidden
 * Use when: Authenticated but not authorized to access resource
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, {
      statusCode: 403,
      code: "FORBIDDEN",
    });
  }
}

/**
 * 404 Not Found
 * Use when: Requested resource doesn't exist
 */
export class NotFoundError extends AppError {
  public readonly resourceType?: string;
  public readonly resourceId?: string | number;

  constructor(
    message: string = "Resource not found",
    resourceType?: string,
    resourceId?: string | number,
  ) {
    super(message, {
      statusCode: 404,
      code: "NOT_FOUND",
    });
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      ...(this.resourceType && { resourceType: this.resourceType }),
      ...(this.resourceId && { resourceId: this.resourceId }),
    };
  }
}

/**
 * 409 Conflict
 * Use when: Resource already exists, version conflict, duplicate entry
 */
export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, {
      statusCode: 409,
      code: "CONFLICT",
    });
  }
}

/**
 * 429 Too Many Requests
 * Use when: Rate limit exceeded
 */
export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(message: string = "Too many requests", retryAfter: number = 60) {
    super(message, {
      statusCode: 429,
      code: "RATE_LIMITED",
    });
    this.retryAfter = retryAfter;
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
    };
  }
}

// ============================================
// 5XX SERVER ERRORS
// ============================================

/**
 * 500 Internal Server Error
 * Use when: Unexpected server-side error
 * Note: isOperational = false (this is a bug!)
 */
export class InternalError extends AppError {
  constructor(message: string = "Internal server error", cause?: Error) {
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
 * Use when: Server temporarily overloaded or in maintenance
 */
export class ServiceUnavailableError extends AppError {
  public readonly retryAfter?: number;

  constructor(
    message: string = "Service temporarily unavailable",
    retryAfter?: number,
  ) {
    super(message, {
      statusCode: 503,
      code: "SERVICE_UNAVAILABLE",
      isOperational: true,
    });
    this.retryAfter = retryAfter;
  }
}
```

### Step 3: Export Everything

```typescript
// src/utils/errors.ts (at the end of file)

/**
 * Type guard to check if error is our AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if error is operational
 */
export function isOperationalError(error: unknown): boolean {
  if (isAppError(error)) {
    return error.isOperational;
  }
  return false;
}

// Re-export everything as namespace for convenient imports
export const Errors = {
  AppError,
  BadRequestError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalError,
  ServiceUnavailableError,
} as const;
```

---

## Practice: Create DevJobs Pro Error Classes

Create error classes specific to DevJobs Pro's domain.

### Exercise: Domain-Specific Errors

```typescript
// src/utils/errors.ts - Add these to your error file

// JOB-RELATED ERRORS
export class JobNotFoundError extends NotFoundError {
  constructor(jobId: string | number) {
    super(`Job with ID '${jobId}' not found`, "job", jobId);
  }
}

export class JobExpiredError extends AppError {
  constructor(jobId: string | number) {
    super(`Job with ID '${jobId}' has expired`, {
      statusCode: 410, // Gone
      code: "JOB_EXPIRED",
    });
  }
}

// APPLICATION-RELATED ERRORS
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

// USER-RELATED ERRORS
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

// COMPANY-RELATED ERRORS
export class CompanyNotFoundError extends NotFoundError {
  constructor(companyId: string | number) {
    super(`Company with ID '${companyId}' not found`, "company", companyId);
  }
}
```

### Using the Errors in Controllers

```typescript
// controllers/jobController.ts
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

  if (isNaN(jobId)) {
    throw new ValidationError("Invalid job ID format", {
      id: ["Job ID must be a number"],
    });
  }

  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));

  if (!job) {
    throw new JobNotFoundError(jobId);
  }

  res.json({ success: true, data: job });
};

export const deleteJob = async (req: Request, res: Response): Promise<void> => {
  const jobId = Number(req.params.id);
  const userId = req.user?.id;

  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));

  if (!job) {
    throw new JobNotFoundError(jobId);
  }

  // Only job owner can delete
  if (job.userId !== userId) {
    throw new ForbiddenError("You can only delete your own job postings");
  }

  await db.delete(jobs).where(eq(jobs.id, jobId));

  res.status(204).send();
};
```

```typescript
// controllers/applicationController.ts
import {
  JobNotFoundError,
  DuplicateApplicationError,
  UnauthorizedError,
  ApplicationNotFoundError,
} from "../utils/errors";

export const applyToJob = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const jobId = Number(req.params.jobId);
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Please log in to apply for jobs");
  }

  // Check job exists
  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));
  if (!job) {
    throw new JobNotFoundError(jobId);
  }

  // Check for duplicate
  const [existing] = await db
    .select()
    .from(applications)
    .where(and(eq(applications.jobId, jobId), eq(applications.userId, userId)));

  if (existing) {
    throw new DuplicateApplicationError(jobId);
  }

  const [application] = await db
    .insert(applications)
    .values({ jobId, userId, status: "pending" })
    .returning();

  res.status(201).json({ success: true, data: application });
};
```

---

## Pro Tips

### 1. Include Error Codes for Frontend Handling

```typescript
// Backend error
throw new ValidationError('Validation failed', {
  email: ['Email is required'],
  password: ['Password must be at least 8 characters'],
});

// Response to frontend
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required"],
    "password": ["Password must be at least 8 characters"]
  }
}

// Frontend can use `code` for i18n or specific handling
if (error.response.data.code === 'VALIDATION_ERROR') {
  showFormErrors(error.response.data.errors);
}
```

### 2. Log Programmer Errors, Not Operational

```typescript
// In your error handler
if (!error.isOperational) {
  // BUG! Wake someone up!
  console.error("🚨 PROGRAMMER ERROR:", error);
  // logger.error('Programmer error', { error, stack: error.stack });
  // alertOps(error); // PagerDuty, Slack, etc.
}
// Don't log operational errors (they're expected)
```

### 3. Factory Functions for Common Patterns

```typescript
// utils/errors.ts
export const notFound = (resource: string, id: string | number) =>
  new NotFoundError(`${resource} with ID '${id}' not found`, resource, id);

// Usage
throw notFound("Job", req.params.id);
throw notFound("User", userId);
throw notFound("Application", applicationId);
```

### 4. Wrap Third-Party Errors

```typescript
// Don't leak third-party error details
try {
  await someThirdPartyService.call();
} catch (error) {
  // Wrap with your error, keep original as cause
  throw new AppError("External service failed", {
    statusCode: 502,
    code: "EXTERNAL_SERVICE_ERROR",
    isOperational: true,
    cause: error as Error,
  });
}
```

---

## 5-Minute Debugger

### Problem 1: Error Class Not Extending Properly

**Symptoms**: `instanceof` checks fail, properties missing

**Cause**: TypeScript/ES6 class extends built-in issue

**Fix**:

```typescript
export class AppError extends Error {
  constructor(message: string) {
    super(message);

    // REQUIRED: Fix prototype chain
    Object.setPrototypeOf(this, new.target.prototype);

    // REQUIRED: Capture stack trace
    Error.captureStackTrace(this, this.constructor);

    // Set name properly
    this.name = this.constructor.name;
  }
}
```

### Problem 2: Stack Trace Missing or Wrong

**Symptoms**: Error stack doesn't show where error was thrown

**Fix**: Use `Error.captureStackTrace`

```typescript
constructor(message: string) {
  super(message);

  // Excludes constructor from stack trace
  Error.captureStackTrace(this, this.constructor);
}
```

### Problem 3: Error Name Shows "Error" Instead of Class Name

**Symptoms**: Logs show `Error: message` instead of `NotFoundError: message`

**Fix**:

```typescript
constructor(message: string) {
  super(message);

  // Explicitly set name
  this.name = this.constructor.name; // "NotFoundError"
}
```

### Problem 4: toJSON Not Working

**Symptoms**: `JSON.stringify(error)` returns `{}`

**Cause**: Error properties aren't enumerable by default

**Fix**: Implement explicit `toJSON` method (as shown in examples)

---

## Definition of Done

Before moving to the next lesson, verify you can:

- [ ] Explain the difference between operational and programmer errors
- [ ] Create an AppError base class with statusCode and isOperational
- [ ] Extend AppError for specific HTTP errors (404, 400, 401, etc.)
- [ ] Include additional metadata (error codes, validation details)
- [ ] Type guard functions (`isAppError`, `isOperationalError`)
- [ ] Have created all DevJobs Pro error classes in `src/utils/errors.ts`

---

## Key Takeaways

1. **Custom error classes** let you attach HTTP status codes and metadata to errors
2. **Operational errors** are expected (user input, not found); show message to user
3. **Programmer errors** are bugs (TypeError, undefined); log and show generic message
4. **Error codes** help frontends handle errors programmatically
5. **Proper class extension** in TypeScript requires `Object.setPrototypeOf` and `Error.captureStackTrace`

---

## Complete Error Classes File

Here's the complete `src/utils/errors.ts` for DevJobs Pro:

```typescript
// src/utils/errors.ts - Complete implementation

export interface AppErrorOptions {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
  cause?: Error;
}

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

    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

// 4XX Errors
export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, { statusCode: 400, code: "BAD_REQUEST" });
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "Validation failed",
    public readonly errors: Record<string, string[]> = {},
  ) {
    super(message, { statusCode: 400, code: "VALIDATION_ERROR" });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, { statusCode: 401, code: "UNAUTHORIZED" });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super(message, { statusCode: 403, code: "FORBIDDEN" });
  }
}

export class NotFoundError extends AppError {
  constructor(
    message = "Resource not found",
    public readonly resourceType?: string,
    public readonly resourceId?: string | number,
  ) {
    super(message, { statusCode: 404, code: "NOT_FOUND" });
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, { statusCode: 409, code: "CONFLICT" });
  }
}

export class RateLimitError extends AppError {
  constructor(
    message = "Too many requests",
    public readonly retryAfter = 60,
  ) {
    super(message, { statusCode: 429, code: "RATE_LIMITED" });
  }
}

// 5XX Errors
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

// Domain-Specific Errors
export class JobNotFoundError extends NotFoundError {
  constructor(jobId: string | number) {
    super(`Job with ID '${jobId}' not found`, "job", jobId);
  }
}

export class DuplicateApplicationError extends ConflictError {
  constructor(jobId: string | number) {
    super(`You have already applied to job '${jobId}'`);
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

// Type Guards
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isOperationalError(error: unknown): boolean {
  return isAppError(error) && error.isOperational;
}
```

---

## Navigation

← [Lesson 01: Express 5 Async Errors](./01-express5-async-errors.md) | [Lesson 03: Global Error Handler](./03-global-error-handler.md) →
