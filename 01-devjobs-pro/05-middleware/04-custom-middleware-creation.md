# Lesson 04: Custom Middleware Creation

## 🎯 Hook: When Built-in Isn't Enough

Sometimes the npm registry doesn't have exactly what you need. Maybe you need middleware that adds request tracing across your microservices, validates requests against your specific business rules, or integrates with your company's internal systems.

That's when you build custom middleware. And when you do it right—with TypeScript, factory patterns, and proper typing—you create reusable, testable, production-quality code.

---

## 📚 Theory: Advanced Middleware Patterns

### The Middleware Factory Pattern

A middleware factory is a function that **returns** middleware, allowing you to configure behavior:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE FACTORY PATTERN                              │
└─────────────────────────────────────────────────────────────────────────────┘

  Configuration                        Runtime
        │                                 │
        ▼                                 │
  ┌───────────────┐                       │
  │   Factory     │                       │
  │   Function    │                       │
  │               │                       │
  │ createLogger  │                       │
  │ ({ format })  │──────────┐            │
  └───────────────┘          │            │
                             │            │
                             ▼            ▼
                    ┌──────────────────────────┐
                    │   Middleware Function     │
                    │                          │
                    │  (req, res, next) => {   │
                    │    // Uses 'format' from │
                    │    // closure            │
                    │  }                       │
                    └──────────────────────────┘

  // Usage:
  app.use(createLogger({ format: 'json' }));
  //                     └─────────────────── Config passed to factory
  //       └────────────────────────────────── Returns middleware function
```

### TypeScript Middleware Typing

```typescript
import { Request, Response, NextFunction, RequestHandler } from "express";

// Basic middleware type
type Middleware = (req: Request, res: Response, next: NextFunction) => void;

// Async middleware type
type AsyncMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

// Middleware factory type
type MiddlewareFactory<T> = (options: T) => Middleware;

// Error middleware type (4 parameters)
type ErrorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => void;
```

### Extending the Request Object

```typescript
// src/types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      // Request identification
      requestId: string;

      // Timing
      startTime: number;

      // User authentication (populated by auth middleware)
      user?: {
        id: string;
        email: string;
        role: "admin" | "employer" | "applicant";
      };

      // Validated data (populated by validation middleware)
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export {};
```

### Express 5 and Async Middleware

Express 5 automatically catches promise rejections—no wrapper needed!

```typescript
// Express 4: Needed asyncWrapper or try/catch
const asyncWrapper = (fn: AsyncMiddleware): Middleware => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

app.get(
  "/api/jobs",
  asyncWrapper(async (req, res) => {
    const jobs = await jobService.findAll();
    res.json(jobs);
  }),
);

// Express 5: Just works! ✨
app.get("/api/jobs", async (req, res) => {
  const jobs = await jobService.findAll(); // Rejections auto-caught
  res.json(jobs);
});
```

---

## 💻 Code Examples

### Example 1: Configurable Logger Factory

```typescript
// src/middleware/logger.ts
import { Request, Response, NextFunction } from "express";

interface LoggerOptions {
  format: "json" | "text";
  includeHeaders?: boolean;
  includeBody?: boolean;
  redactFields?: string[];
}

interface LogEntry {
  timestamp: string;
  requestId: string;
  method: string;
  path: string;
  statusCode?: number;
  duration?: number;
  headers?: Record<string, string>;
  body?: unknown;
}

export const createLogger = (options: LoggerOptions) => {
  const {
    format,
    includeHeaders = false,
    includeBody = false,
    redactFields = [],
  } = options;

  // Redact sensitive fields
  const redact = (obj: Record<string, unknown>): Record<string, unknown> => {
    const redacted = { ...obj };
    for (const field of redactFields) {
      if (field in redacted) {
        redacted[field] = "[REDACTED]";
      }
    }
    return redacted;
  };

  // This is the actual middleware
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = process.hrtime.bigint();

    // Build log entry
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      requestId: req.requestId || "unknown",
      method: req.method,
      path: req.path,
    };

    if (includeHeaders) {
      logEntry.headers = redact(
        req.headers as Record<string, unknown>,
      ) as Record<string, string>;
    }

    if (includeBody && req.body) {
      logEntry.body = redact(req.body as Record<string, unknown>);
    }

    // Log after response
    res.on("finish", () => {
      const duration = Number(process.hrtime.bigint() - startTime) / 1_000_000;
      logEntry.statusCode = res.statusCode;
      logEntry.duration = Math.round(duration * 100) / 100;

      if (format === "json") {
        console.log(JSON.stringify(logEntry));
      } else {
        console.log(
          `[${logEntry.timestamp}] ${logEntry.requestId} | ` +
            `${logEntry.method} ${logEntry.path} | ` +
            `${logEntry.statusCode} | ${logEntry.duration}ms`,
        );
      }
    });

    next();
  };
};

// Usage:
// app.use(createLogger({
//   format: 'json',
//   includeBody: true,
//   redactFields: ['password', 'token']
// }));
```

### Example 2: Validation Middleware Factory

```typescript
// src/middleware/validate.ts
import { Request, Response, NextFunction } from "express";
import { z, ZodSchema, ZodError } from "zod";

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

interface ValidationError {
  field: string;
  message: string;
}

export const validateRequest = (schemas: ValidationSchemas) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const errors: ValidationError[] = [];

    try {
      // Validate body
      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (result.success) {
          req.validated = { ...req.validated, body: result.data };
        } else {
          errors.push(...formatZodErrors(result.error, "body"));
        }
      }

      // Validate query
      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (result.success) {
          req.validated = { ...req.validated, query: result.data };
        } else {
          errors.push(...formatZodErrors(result.error, "query"));
        }
      }

      // Validate params
      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (result.success) {
          req.validated = { ...req.validated, params: result.data };
        } else {
          errors.push(...formatZodErrors(result.error, "params"));
        }
      }

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors,
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

const formatZodErrors = (
  error: ZodError,
  source: string,
): ValidationError[] => {
  return error.errors.map((err) => ({
    field: `${source}.${err.path.join(".")}`,
    message: err.message,
  }));
};

// Usage with Zod schemas:
/*
import { z } from 'zod';

const createJobSchema = z.object({
  title: z.string().min(3).max(100),
  company: z.string().min(2),
  salary: z.number().positive(),
  location: z.string(),
});

app.post('/api/jobs',
  validateRequest({ body: createJobSchema }),
  (req, res) => {
    // req.validated.body is typed and validated!
    const jobData = req.validated.body as z.infer<typeof createJobSchema>;
    res.json({ success: true, data: jobData });
  }
);
*/
```

### Example 3: Role-Checking Middleware Factory

```typescript
// src/middleware/roles.ts
import { Request, Response, NextFunction } from "express";

type UserRole = "admin" | "employer" | "applicant";

// Check if user has one of the allowed roles
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // User should be attached by auth middleware
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Authentication required",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: "Insufficient permissions",
        required: allowedRoles,
        current: req.user.role,
      });
      return;
    }

    next();
  };
};

// Usage:
// app.delete('/api/jobs/:id',
//   authenticate,
//   requireRole('admin', 'employer'),
//   deleteJob
// );
```

### Example 4: Request ID Middleware

```typescript
// src/middleware/requestId.ts
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

interface RequestIdOptions {
  headerName?: string;
  generator?: () => string;
  setResponseHeader?: boolean;
}

export const requestId = (options: RequestIdOptions = {}) => {
  const {
    headerName = "X-Request-Id",
    generator = randomUUID,
    setResponseHeader = true,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    // Use existing header or generate new ID
    const existingId = req.get(headerName);
    req.requestId = existingId || generator();

    // Set response header for tracing
    if (setResponseHeader) {
      res.setHeader(headerName, req.requestId);
    }

    next();
  };
};

// Usage:
// app.use(requestId());
// app.use(requestId({ headerName: 'X-Correlation-Id' }));
```

### Example 5: Async Wrapper (Express 4 Pattern)

Even though Express 5 handles this automatically, understanding this pattern is valuable:

```typescript
// src/middleware/asyncWrapper.ts
import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

// Express 4 pattern - catches async errors
export const asyncWrapper = (handler: AsyncRequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

// Express 5: This is built-in! But pattern is useful to know
// for working with older codebases or libraries

// Usage (Express 4):
/*
app.get('/api/jobs', asyncWrapper(async (req, res) => {
  const jobs = await Job.findAll();
  res.json(jobs);
}));
*/

// Express 5: Just use async directly
/*
app.get('/api/jobs', async (req, res) => {
  const jobs = await Job.findAll();
  res.json(jobs);
});
*/
```

---

## 🛠️ Mini-Tutorial: Build Query Parameter Validator

Create a middleware factory that validates and transforms query parameters:

```typescript
// src/middleware/validateQuery.ts
import { Request, Response, NextFunction } from "express";

// Define parameter types
interface ParamDefinition {
  type: "string" | "number" | "boolean" | "array";
  required?: boolean;
  default?: unknown;
  min?: number;
  max?: number;
  enum?: readonly unknown[];
  transform?: (value: unknown) => unknown;
}

type ParamDefinitions = Record<string, ParamDefinition>;

interface ValidationResult {
  valid: boolean;
  value: unknown;
  error?: string;
}

export const validateQueryParams = <T extends ParamDefinitions>(
  definitions: T,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validated: Record<string, unknown> = {};
    const errors: Array<{ param: string; message: string }> = [];

    for (const [param, definition] of Object.entries(definitions)) {
      const rawValue = req.query[param];
      const result = validateParam(param, rawValue, definition);

      if (!result.valid) {
        errors.push({ param, message: result.error! });
      } else {
        validated[param] = result.value;
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: "Invalid query parameters",
        details: errors,
      });
      return;
    }

    // Attach validated params to request
    req.validated = { ...req.validated, query: validated };
    next();
  };
};

const validateParam = (
  name: string,
  rawValue: unknown,
  definition: ParamDefinition,
): ValidationResult => {
  // Handle missing required fields
  if (rawValue === undefined || rawValue === "") {
    if (definition.required) {
      return { valid: false, value: undefined, error: `${name} is required` };
    }
    return { valid: true, value: definition.default };
  }

  let value: unknown = rawValue;

  // Type conversion
  switch (definition.type) {
    case "number":
      value = Number(rawValue);
      if (isNaN(value as number)) {
        return { valid: false, value, error: `${name} must be a number` };
      }
      if (definition.min !== undefined && (value as number) < definition.min) {
        return {
          valid: false,
          value,
          error: `${name} must be at least ${definition.min}`,
        };
      }
      if (definition.max !== undefined && (value as number) > definition.max) {
        return {
          valid: false,
          value,
          error: `${name} must be at most ${definition.max}`,
        };
      }
      break;

    case "boolean":
      value = rawValue === "true" || rawValue === "1";
      break;

    case "array":
      if (typeof rawValue === "string") {
        value = rawValue.split(",").map((s) => s.trim());
      } else if (Array.isArray(rawValue)) {
        value = rawValue;
      }
      break;

    case "string":
    default:
      value = String(rawValue);
      if (
        definition.min !== undefined &&
        (value as string).length < definition.min
      ) {
        return {
          valid: false,
          value,
          error: `${name} must be at least ${definition.min} characters`,
        };
      }
      if (
        definition.max !== undefined &&
        (value as string).length > definition.max
      ) {
        return {
          valid: false,
          value,
          error: `${name} must be at most ${definition.max} characters`,
        };
      }
  }

  // Enum validation
  if (definition.enum && !definition.enum.includes(value)) {
    return {
      valid: false,
      value,
      error: `${name} must be one of: ${definition.enum.join(", ")}`,
    };
  }

  // Custom transform
  if (definition.transform) {
    value = definition.transform(value);
  }

  return { valid: true, value };
};

// ═══════════════════════════════════════════════════════════════
// USAGE EXAMPLE
// ═══════════════════════════════════════════════════════════════

/*
// Define query param requirements for job listing
const jobListQueryParams = {
  page: { type: 'number', default: 1, min: 1 },
  limit: { type: 'number', default: 10, min: 1, max: 100 },
  sort: { type: 'string', enum: ['date', 'salary', 'title'] as const, default: 'date' },
  order: { type: 'string', enum: ['asc', 'desc'] as const, default: 'desc' },
  search: { type: 'string', max: 100 },
  remote: { type: 'boolean', default: false },
  tags: { type: 'array' },
} as const;

app.get('/api/jobs',
  validateQueryParams(jobListQueryParams),
  (req, res) => {
    const { page, limit, sort, order, search, remote, tags } = req.validated!.query as {
      page: number;
      limit: number;
      sort: 'date' | 'salary' | 'title';
      order: 'asc' | 'desc';
      search?: string;
      remote: boolean;
      tags?: string[];
    };

    // Values are validated and typed!
    console.log({ page, limit, sort, order, search, remote, tags });
    res.json({ page, limit, sort, order, search, remote, tags });
  }
);

// GET /api/jobs?page=2&limit=20&sort=salary&remote=true&tags=node,typescript
// → { page: 2, limit: 20, sort: 'salary', remote: true, tags: ['node', 'typescript'] }
*/
```

---

## 🎯 Practice: Build DevJobs Pro Custom Middleware

### 1. Request ID Middleware

```typescript
// src/middleware/requestId.ts
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Check for existing ID (from load balancer, API gateway)
  const existingId = req.get("X-Request-Id") || req.get("X-Correlation-Id");

  // Use existing or generate new
  req.requestId = existingId || randomUUID();

  // Set response header for client tracking
  res.setHeader("X-Request-Id", req.requestId);

  next();
};
```

### 2. Async Wrapper (Understanding the Pattern)

```typescript
// src/middleware/asyncWrapper.ts
import { Request, Response, NextFunction } from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

/**
 * Express 5 Note: This is NOT needed in Express 5!
 * Express 5 automatically catches promise rejections.
 *
 * This pattern exists for:
 * 1. Express 4 compatibility
 * 2. Educational purposes
 * 3. Working with legacy codebases
 */
export const asyncWrapper = (handler: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Wrap the async handler and catch any rejections
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

// Express 5 equivalent (built-in):
// app.get('/route', async (req, res) => {
//   throw new Error('This is caught automatically!');
// });
```

### 3. Validate Request Middleware Factory

```typescript
// src/middleware/validateRequest.ts
import { Request, Response, NextFunction } from "express";
import { z, ZodSchema, ZodError } from "zod";

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validateRequest = (schemas: ValidationSchemas) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const errors: Array<{ location: string; path: string; message: string }> =
      [];

    // Validate each schema
    const locations = [
      { key: "body", schema: schemas.body, data: req.body },
      { key: "query", schema: schemas.query, data: req.query },
      { key: "params", schema: schemas.params, data: req.params },
    ] as const;

    for (const { key, schema, data } of locations) {
      if (schema) {
        const result = await schema.safeParseAsync(data);

        if (!result.success) {
          for (const error of result.error.errors) {
            errors.push({
              location: key,
              path: error.path.join("."),
              message: error.message,
            });
          }
        } else {
          // Store validated data
          req.validated = req.validated || {};
          (req.validated as Record<string, unknown>)[key] = result.data;
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        requestId: req.requestId,
        details: errors,
      });
      return;
    }

    next();
  };
};

// ═══════════════════════════════════════════════════════════════
// EXAMPLE USAGE with DevJobs Pro
// ═══════════════════════════════════════════════════════════════

/*
// src/schemas/job.schema.ts
import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(5).max(100),
  company: z.string().min(2).max(100),
  location: z.string().min(2).max(100),
  description: z.string().min(50).max(5000),
  salary: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
    currency: z.enum(['USD', 'EUR', 'GBP']),
  }),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  remote: z.boolean(),
  tags: z.array(z.string()).max(10),
});

export const jobIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const jobListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().max(100).optional(),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
  remote: z.coerce.boolean().optional(),
});

// src/routes/jobs.ts
import { Router } from 'express';
import { validateRequest } from '../middleware/validateRequest';
import { createJobSchema, jobIdParamSchema, jobListQuerySchema } from '../schemas/job.schema';

const router = Router();

// GET /api/jobs - List jobs with filtering
router.get('/',
  validateRequest({ query: jobListQuerySchema }),
  async (req, res) => {
    const { page, limit, search, type, remote } = req.validated!.query;
    // ... fetch jobs with validated params
    res.json({ success: true, data: [] });
  }
);

// GET /api/jobs/:id - Get single job
router.get('/:id',
  validateRequest({ params: jobIdParamSchema }),
  async (req, res) => {
    const { id } = req.validated!.params;
    // ... fetch job by id
    res.json({ success: true, data: { id } });
  }
);

// POST /api/jobs - Create job
router.post('/',
  validateRequest({ body: createJobSchema }),
  async (req, res) => {
    const jobData = req.validated!.body;
    // ... create job
    res.status(201).json({ success: true, data: jobData });
  }
);

export default router;
*/
```

---

## 💡 Pro Tips

### 1. Use Middleware Factories for Reusable, Configurable Middleware

```typescript
// ❌ Hardcoded middleware
const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[JSON] ${req.method} ${req.path}`);
  next();
};

// ✅ Configurable factory
const createLogger = (options: { format: "json" | "text" }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (options.format === "json") {
      console.log(JSON.stringify({ method: req.method, path: req.path }));
    } else {
      console.log(`${req.method} ${req.path}`);
    }
    next();
  };
};

// Now you can use different configs
app.use(createLogger({ format: "json" })); // Production
app.use(createLogger({ format: "text" })); // Development
```

### 2. Type Your Custom Request Properties

```typescript
// ❌ Using 'any' - loses type safety
app.use((req: any, res, next) => {
  req.customData = { foo: "bar" };
  next();
});

// ✅ Extend Express types properly
// In types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      customData?: { foo: string };
    }
  }
}

// Now TypeScript knows about customData
app.use((req: Request, res, next) => {
  req.customData = { foo: "bar" }; // Typed!
  next();
});
```

### 3. Middleware Should Do One Thing

```typescript
// ❌ Middleware doing too much
const kitchenSink = (req: Request, res: Response, next: NextFunction) => {
  req.requestId = randomUUID();
  req.startTime = Date.now();
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.user = validateToken(req.headers.authorization);
  next();
};

// ✅ Single responsibility - compose as needed
const requestId = (req: Request, res: Response, next: NextFunction) => {
  req.requestId = randomUUID();
  next();
};

const timing = (req: Request, res: Response, next: NextFunction) => {
  req.startTime = Date.now();
  next();
};

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.user = validateToken(req.headers.authorization);
  next();
};

// Compose
app.use(requestId);
app.use(timing);
app.use("/api/protected", authenticate);
```

### 4. Always Handle the Unhappy Path

```typescript
// ❌ Only handles success
const validate = (req: Request, res: Response, next: NextFunction) => {
  if (isValid(req.body)) {
    next();
  }
  // What happens if invalid? Request hangs!
};

// ✅ Always respond or call next()
const validate = (req: Request, res: Response, next: NextFunction) => {
  if (isValid(req.body)) {
    next();
    return;
  }
  res.status(400).json({ error: "Invalid data" });
  // No next() - we sent response
};
```

---

## 🐛 5-Minute Debugger

### Problem 1: Middleware Not Applied in Correct Order

**Symptom:** Auth middleware runs but `req.body` is undefined.

```typescript
// ❌ Bug: Auth before body parsing
app.use(authenticate); // Can't read body!
app.use(express.json());

// ✅ Fix: Body parsing before anything that needs it
app.use(express.json());
app.use(authenticate); // Now req.body exists
```

### Problem 2: TypeScript Req Augmentation Not Working

**Symptom:** Property `requestId` does not exist on type `Request`.

```typescript
// Check 1: File location and naming
// Must be in a .d.ts file included in tsconfig

// Check 2: Must use 'declare global'
// ❌ Wrong
declare namespace Express {
  interface Request {
    requestId: string;
  }
}

// ✅ Correct
declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}
export {}; // Makes it a module

// Check 3: tsconfig.json must include the types
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./src/types"]
  },
  "include": ["src/**/*"]
}
```

### Problem 3: Middleware Factory Not Working

**Symptom:** Middleware logs undefined for options.

```typescript
// ❌ Bug: Not calling the factory
app.use(createLogger); // Passes the factory itself, not its result!

// ✅ Fix: Call the factory to get middleware
app.use(createLogger({ format: "json" }));
```

### Problem 4: Async Middleware Error Not Caught (Express 4)

**Symptom:** Unhandled promise rejection crashes server.

```typescript
// Express 4: Async errors not auto-caught
app.get("/api/jobs", async (req, res) => {
  const jobs = await Job.findAll(); // If this throws, crash!
  res.json(jobs);
});

// Fix for Express 4: Use asyncWrapper
app.get(
  "/api/jobs",
  asyncWrapper(async (req, res) => {
    const jobs = await Job.findAll(); // Now errors go to error handler
    res.json(jobs);
  }),
);

// Express 5: Works automatically! ✨
```

---

## 📋 Definition of Done

By the end of this lesson, you should be able to:

- [ ] Explain the middleware factory pattern
- [ ] Create typed middleware with proper TypeScript interfaces
- [ ] Extend the Express Request type safely
- [ ] Build configurable, reusable middleware factories
- [ ] Understand the asyncWrapper pattern (and why Express 5 doesn't need it)
- [ ] Debug common middleware TypeScript issues

---

## 🔗 Navigation

| Previous                                                   | Up                                   | Next                                                                      |
| ---------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------- |
| [← Third-Party Middleware](./03-third-party-middleware.md) | [Module 05: Middleware](./README.md) | [Module 06: Routing Architecture →](../06-routing-architecture/README.md) |

---

## 📚 Further Reading

- [Express Middleware Writing Guide](https://expressjs.com/en/guide/writing-middleware.html)
- [TypeScript Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
- [Express 5 Migration Guide](https://expressjs.com/en/guide/migrating-5.html)
- [Zod Documentation](https://zod.dev/)
