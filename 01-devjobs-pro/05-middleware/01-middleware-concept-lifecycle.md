# Lesson 01: Middleware Concept & Lifecycle

## 🎯 Hook: The Secret Sauce of Express

Every single request that hits your Express server flows through middleware. Login checks? Middleware. Logging? Middleware. Parsing JSON? Middleware. Authentication, rate limiting, compression—all middleware.

Understanding middleware is like understanding the assembly line in a factory. Each station (middleware) does one job, then passes the product (request) to the next station. Master this, and you control everything that happens in your Express app.

---

## 📚 Theory: What Is Middleware?

### The Middleware Signature

Every middleware function has the same signature:

```typescript
(req: Request, res: Response, next: NextFunction) => void
```

- **`req`** - The request object (incoming data)
- **`res`** - The response object (outgoing data)
- **`next`** - Function to call the next middleware in the stack

### The Middleware Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        REQUEST → RESPONSE LIFECYCLE                          │
└─────────────────────────────────────────────────────────────────────────────┘

 Client                                                              Server
   │                                                                    │
   │  HTTP Request                                                      │
   │ ──────────────────────────────────────────────────────────────────►│
   │                                                                    │
   │     ┌──────────────────────────────────────────────────────────┐   │
   │     │                  MIDDLEWARE STACK                         │   │
   │     │                                                           │   │
   │     │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │   │
   │     │  │ Middleware 1│    │ Middleware 2│    │ Middleware N│   │   │
   │     │  │             │    │             │    │             │   │   │
   │     │  │  (logger)   │───►│  (auth)     │───►│ (validate)  │   │   │
   │     │  │             │    │             │    │             │   │   │
   │     │  │   next()    │    │   next()    │    │   next()    │   │   │
   │     │  └─────────────┘    └─────────────┘    └─────────────┘   │   │
   │     │                                              │            │   │
   │     │                                              ▼            │   │
   │     │                                    ┌─────────────────┐    │   │
   │     │                                    │  Route Handler  │    │   │
   │     │                                    │                 │    │   │
   │     │                                    │  res.json(...)  │    │   │
   │     │                                    └─────────────────┘    │   │
   │     │                                                           │   │
   │     └──────────────────────────────────────────────────────────┘   │
   │                                                                    │
   │  HTTP Response                                                     │
   │ ◄──────────────────────────────────────────────────────────────────│
   │                                                                    │
```

### The `next()` Function

`next()` is the conveyor belt that moves the request to the next middleware:

```typescript
// Without next() - Request STOPS here (hangs forever!)
app.use((req, res, next) => {
  console.log("Request received");
  // ❌ Forgot to call next() - request will hang
});

// With next() - Request continues to next middleware
app.use((req, res, next) => {
  console.log("Request received");
  next(); // ✅ Pass to next middleware
});
```

### Three Ways to End the Middleware Chain

```typescript
// 1. Send a response (most common)
app.use((req, res, next) => {
  if (!req.headers.authorization) {
    res.status(401).json({ error: "Unauthorized" });
    // Don't call next() - we're done
    return;
  }
  next();
});

// 2. Call next() to continue
app.use((req, res, next) => {
  req.requestTime = Date.now();
  next(); // Continue to next middleware
});

// 3. Call next(error) to skip to error handler
app.use((req, res, next) => {
  if (somethingWentWrong) {
    next(new Error("Something broke!"));
    // Skips to error-handling middleware
    return;
  }
  next();
});
```

### Passing Data Between Middleware

Attach custom properties to the `req` object:

```typescript
// Middleware 1: Add timestamp
app.use((req, res, next) => {
  req.requestTime = Date.now();
  next();
});

// Middleware 2: Add request ID
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  next();
});

// Route handler: Access both
app.get("/api/jobs", (req, res) => {
  console.log(`Request ${req.requestId} at ${req.requestTime}`);
  res.json({ jobs: [] });
});
```

### TypeScript: Extending the Request Object

```typescript
// types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      requestTime?: number;
      user?: {
        id: string;
        email: string;
        role: "employer" | "applicant" | "admin";
      };
    }
  }
}

export {};
```

---

## 💻 Code Examples

### Example 1: Simple Logger Middleware

```typescript
import express, { Request, Response, NextFunction } from "express";

const app = express();

// Logger middleware
const logger = (req: Request, res: Response, next: NextFunction): void => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

app.use(logger);

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Output: 2026-01-30T10:15:30.123Z - GET /
```

### Example 2: Timing Middleware

```typescript
const timing = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Hook into response finish event
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`,
    );
  });

  next();
};

app.use(timing);

// Output: GET /api/jobs - 200 - 45ms
```

### Example 3: Request Modifier Middleware

```typescript
const requestModifier = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Normalize query parameters
  if (req.query.search) {
    req.query.search = (req.query.search as string).toLowerCase().trim();
  }

  // Add default pagination
  req.query.page = req.query.page || "1";
  req.query.limit = req.query.limit || "10";

  next();
};

app.use("/api", requestModifier);
```

### Example 4: Conditional Middleware

```typescript
// Skip middleware for certain routes
const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Skip for public routes
  const publicPaths = ["/api/health", "/api/auth/login", "/api/auth/register"];

  if (publicPaths.includes(req.path)) {
    return next();
  }

  // Check authentication
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  // Validate token (simplified)
  req.user = { id: "123", email: "user@example.com", role: "applicant" };
  next();
};
```

### Example 5: Middleware Order Matters

```typescript
import express from "express";

const app = express();

// ✅ CORRECT ORDER
// 1. Body parsing (must be first to populate req.body)
app.use(express.json());

// 2. Logging (log all requests)
app.use(logger);

// 3. Security middleware (helmet, cors, rate limiting)
// app.use(helmet());
// app.use(cors());

// 4. Authentication (verify user)
app.use(authMiddleware);

// 5. Routes
app.use("/api/jobs", jobRoutes);

// 6. 404 handler (after all routes)
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// 7. Error handler (MUST be last, with 4 parameters)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});
```

---

## 🛠️ Mini-Tutorial: Build a Custom Request Logger

Let's build a production-quality request logger:

```typescript
// src/middleware/logger.ts
import { Request, Response, NextFunction } from "express";

interface LogEntry {
  timestamp: string;
  method: string;
  path: string;
  query: Record<string, unknown>;
  statusCode: number;
  duration: number;
  contentLength: string | undefined;
  userAgent: string | undefined;
  ip: string | undefined;
}

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const start = process.hrtime.bigint();

  // Capture original end function
  const originalEnd = res.end;

  // Override end to log after response
  res.end = function (chunk?: any, encoding?: any, callback?: any): Response {
    // Calculate duration in milliseconds
    const duration = Number(process.hrtime.bigint() - start) / 1_000_000;

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      query: req.query as Record<string, unknown>,
      statusCode: res.statusCode,
      duration: Math.round(duration * 100) / 100, // Round to 2 decimals
      contentLength: res.get("Content-Length"),
      userAgent: req.get("User-Agent"),
      ip: req.ip || req.socket.remoteAddress,
    };

    // Color-coded console output
    const statusColor =
      res.statusCode >= 500
        ? "\x1b[31m" // Red
        : res.statusCode >= 400
          ? "\x1b[33m" // Yellow
          : res.statusCode >= 300
            ? "\x1b[36m" // Cyan
            : "\x1b[32m"; // Green

    const reset = "\x1b[0m";

    console.log(
      `${logEntry.timestamp} | ${logEntry.method.padEnd(7)} | ` +
        `${statusColor}${logEntry.statusCode}${reset} | ` +
        `${logEntry.duration.toFixed(2).padStart(8)}ms | ` +
        `${logEntry.path}`,
    );

    // In production, you'd send to logging service
    // await loggingService.log(logEntry);

    // Call original end
    return originalEnd.call(this, chunk, encoding, callback);
  } as typeof res.end;

  next();
};

// Usage
// app.use(requestLogger);
```

**Example Output:**

```
2026-01-30T10:15:30.123Z | GET     | 200 |    45.23ms | /api/jobs
2026-01-30T10:15:31.456Z | POST    | 201 |   123.45ms | /api/jobs
2026-01-30T10:15:32.789Z | GET     | 404 |     2.10ms | /api/notfound
2026-01-30T10:15:33.012Z | POST    | 500 |    89.00ms | /api/error
```

---

## 🎯 Practice: Plan DevJobs Pro Middleware Stack

Design the middleware stack for DevJobs Pro:

```typescript
// src/app.ts
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { requestLogger } from "./middleware/logger";
import { requestId } from "./middleware/requestId";
import { rateLimiter } from "./middleware/rateLimiter";
import { authenticate } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE STACK ORDER (Top to Bottom)
// ═══════════════════════════════════════════════════════════════

// 1. Request ID (add unique ID to every request for tracing)
app.use(requestId);

// 2. Request logging (log after getting request ID)
app.use(requestLogger);

// 3. Security headers (protect against common vulnerabilities)
app.use(helmet());

// 4. CORS (allow cross-origin requests from frontend)
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

// 5. Rate limiting (prevent abuse)
app.use(rateLimiter);

// 6. Body parsing (parse JSON and form data)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 7. Static files (serve uploaded resumes, images)
app.use("/uploads", express.static("uploads"));

// ═══════════════════════════════════════════════════════════════
// ROUTES (After all pre-route middleware)
// ═══════════════════════════════════════════════════════════════

// Public routes (no auth required)
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/jobs", publicJobRoutes);

// Protected routes (auth required)
app.use("/api/users", authenticate, userRoutes);
app.use("/api/applications", authenticate, applicationRoutes);
app.use("/api/employers", authenticate, employerRoutes);

// ═══════════════════════════════════════════════════════════════
// POST-ROUTE MIDDLEWARE (After all routes)
// ═══════════════════════════════════════════════════════════════

// 8. 404 handler (no route matched)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Not found",
    requestId: req.requestId,
  });
});

// 9. Error handler (MUST be last, catches all errors)
app.use(errorHandler);

export default app;
```

---

## 💡 Pro Tips

### 1. Middleware Order Is Critical

```typescript
// ❌ WRONG: Auth before body parsing - can't read body in auth
app.use(authenticate);
app.use(express.json());

// ✅ CORRECT: Parse body first, then authenticate
app.use(express.json());
app.use(authenticate);
```

### 2. Apply Middleware Selectively

```typescript
// Apply to all routes
app.use(logger);

// Apply to specific path
app.use("/api", authenticate);

// Apply to specific route only
app.get("/api/admin", adminOnly, adminRoutes);

// Apply multiple middleware to a route
app.post(
  "/api/jobs",
  authenticate,
  validateJobInput,
  checkEmployerRole,
  createJob,
);
```

### 3. Error Handler Must Have 4 Parameters

```typescript
// ❌ WRONG: 3 parameters - Express thinks this is regular middleware
app.use((err, req, res) => {
  res.status(500).json({ error: err.message });
});

// ✅ CORRECT: 4 parameters - Express recognizes error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ error: err.message });
});
```

### 4. Never Forget Return After Sending Response

```typescript
// ❌ WRONG: Missing return - might call next() after sending response
app.use((req, res, next) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    // Falls through and calls next()!
  }
  next();
});

// ✅ CORRECT: Return after sending response
app.use((req, res, next) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return; // Stop execution here
  }
  next();
});
```

---

## 🐛 5-Minute Debugger

### Problem 1: "Request Hangs Forever"

**Symptom:** Browser shows loading spinner indefinitely.

**Cause:** Middleware never calls `next()` or sends a response.

```typescript
// ❌ Bug: Forgot next()
app.use((req, res, next) => {
  console.log("Processing...");
  // Oops! No next() and no response
});

// ✅ Fix: Always call next() or send response
app.use((req, res, next) => {
  console.log("Processing...");
  next(); // Don't forget this!
});
```

### Problem 2: "Cannot Set Headers After They Are Sent"

**Symptom:** Error in console, possible crashes.

**Cause:** Trying to send multiple responses.

```typescript
// ❌ Bug: Double response
app.use((req, res, next) => {
  res.json({ data: "first" });
  next(); // Route handler tries to send again!
});

app.get("/", (req, res) => {
  res.json({ data: "second" }); // 💥 Error!
});

// ✅ Fix: Return after sending response
app.use((req, res, next) => {
  if (someCondition) {
    res.json({ data: "first" });
    return; // Stop here
  }
  next();
});
```

### Problem 3: "Error Handler Not Working"

**Symptom:** Errors show generic Express error page.

**Cause:** Error handler not at the end or wrong signature.

```typescript
// ❌ Bug: Error handler before routes
app.use(errorHandler); // Too early!
app.use("/api", routes);

// ❌ Bug: Wrong signature
app.use((err, req, res) => {
  // Missing 'next' parameter
  res.status(500).json({ error: err.message });
});

// ✅ Fix: Error handler last with 4 parameters
app.use("/api", routes);
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ error: err.message });
});
```

---

## 📋 Definition of Done

By the end of this lesson, you should be able to:

- [ ] Explain what middleware is and why it matters
- [ ] Write middleware with correct signature `(req, res, next)`
- [ ] Understand when to call `next()`, send response, or call `next(error)`
- [ ] Pass data between middleware using `req` object
- [ ] Extend Express Request type in TypeScript
- [ ] Debug common middleware issues (hangs, double responses)
- [ ] Plan proper middleware order for an application

---

## 🔗 Navigation

| Previous                                                                        | Up                                   | Next                                                |
| ------------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------- |
| [← Response Object Methods](../04-express-basics/04-response-object-methods.md) | [Module 05: Middleware](./README.md) | [Built-in Middleware →](./02-builtin-middleware.md) |

---

## 📚 Further Reading

- [Express Middleware Documentation](https://expressjs.com/en/guide/using-middleware.html)
- [Writing Middleware](https://expressjs.com/en/guide/writing-middleware.html)
- [Error Handling in Express](https://expressjs.com/en/guide/error-handling.html)
