# Lesson 03: Project Structure Setup

## The Problem: Architecture is Structure

You can have perfect code inside a terrible structure, and the project will still be hard to maintain. Imagine this:

```
src/
├── utils.ts           # 2000 lines of "utilities"
├── helpers.ts         # More helpers... what's the difference?
├── index.ts           # Everything starts here... and continues here
├── db.ts              # Schema, connection, queries, migrations - all 1500 lines
├── types.ts           # Every type in the app
└── middleware.ts      # Auth, logging, validation, rate limiting - together
```

This is a **flat structure**—and it doesn't scale. Finding anything requires searching. New team members are lost for weeks. Adding features means touching files that shouldn't be touched.

**Good project structure is architecture.** Get it right from the start, and everything else becomes easier.

---

## Two Main Approaches

### Layer-Based Organization (Recommended for APIs)

Group files by **what they do** (their technical role):

```
src/
├── controllers/       # All HTTP handlers
├── services/          # All business logic
├── routes/            # All route definitions
├── middleware/        # All middleware
├── db/                # All database code
├── types/             # All TypeScript types
└── utils/             # All utilities
```

**Pros:**

- Clear separation of concerns
- Easy to understand each layer's responsibility
- Great for APIs where features share common patterns
- Scales well to medium-sized projects

**Cons:**

- Related code is spread across folders
- Adding a feature touches many directories

### Feature-Based Organization (Recommended for Large Projects)

Group files by **what they relate to** (business domain):

```
src/
├── features/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   └── auth.types.ts
│   ├── jobs/
│   │   ├── jobs.controller.ts
│   │   ├── jobs.service.ts
│   │   ├── jobs.routes.ts
│   │   └── jobs.types.ts
│   └── users/
│       └── ...
├── shared/
│   ├── middleware/
│   ├── utils/
│   └── types/
└── db/
```

**Pros:**

- All related code in one place
- Easy to add/remove features (delete one folder)
- Better for large teams (each team owns a feature)
- Scales to very large projects

**Cons:**

- More complex initial structure
- Can lead to code duplication if not careful

### Which to Choose?

| Situation                       | Recommended   |
| ------------------------------- | ------------- |
| API with < 10 main resources    | Layer-based   |
| Large app with distinct domains | Feature-based |
| Small team (< 5 devs)           | Layer-based   |
| Multiple teams                  | Feature-based |
| MVP / Learning project          | Layer-based   |
| Enterprise application          | Feature-based |

**For DevJobs Pro:** We'll use **layer-based** organization. It's simpler to learn, and our app has interconnected resources (jobs, users, companies, applications) that share patterns.

---

## DevJobs Pro Complete Structure

Here's the production-ready structure we'll build:

```
┌─────────────────────────────────────────────────────────────────┐
│                    DevJobs Pro API Structure                    │
└─────────────────────────────────────────────────────────────────┘

devjobs-api/
│
├── src/
│   │
│   ├── config/                    # Configuration
│   │   ├── index.ts               # Exports all config
│   │   ├── env.ts                 # Environment validation
│   │   └── constants.ts           # App constants
│   │
│   ├── controllers/               # HTTP handlers
│   │   ├── auth.controller.ts
│   │   ├── jobs.controller.ts
│   │   ├── applications.controller.ts
│   │   ├── users.controller.ts
│   │   ├── companies.controller.ts
│   │   └── admin.controller.ts
│   │
│   ├── db/                        # Database layer
│   │   ├── index.ts               # Connection & client export
│   │   ├── schema.ts              # Drizzle schema definitions
│   │   └── migrations/            # SQL migrations (generated)
│   │
│   ├── middleware/                # Express middleware
│   │   ├── auth.ts                # JWT authentication
│   │   ├── validate.ts            # Request validation
│   │   ├── errorHandler.ts        # Global error handler
│   │   ├── notFound.ts            # 404 handler
│   │   └── rateLimiter.ts         # Rate limiting
│   │
│   ├── routes/                    # Route definitions
│   │   ├── index.ts               # Route aggregator
│   │   ├── auth.routes.ts
│   │   ├── jobs.routes.ts
│   │   ├── applications.routes.ts
│   │   ├── users.routes.ts
│   │   ├── companies.routes.ts
│   │   └── admin.routes.ts
│   │
│   ├── services/                  # Business logic
│   │   ├── auth.service.ts
│   │   ├── jobs.service.ts
│   │   ├── applications.service.ts
│   │   ├── users.service.ts
│   │   ├── companies.service.ts
│   │   └── admin.service.ts
│   │
│   ├── types/                     # TypeScript types
│   │   ├── index.ts               # Exports all types
│   │   ├── express.d.ts           # Express augmentation
│   │   ├── auth.types.ts
│   │   ├── jobs.types.ts
│   │   ├── applications.types.ts
│   │   ├── users.types.ts
│   │   └── companies.types.ts
│   │
│   ├── utils/                     # Utility functions
│   │   ├── errors.ts              # Custom error classes
│   │   ├── logger.ts              # Logging utility
│   │   ├── validators.ts          # Validation schemas
│   │   └── helpers.ts             # General helpers
│   │
│   ├── app.ts                     # Express app setup
│   └── server.ts                  # Entry point
│
├── tests/                         # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example                   # Environment template
├── .env                           # Environment variables (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
├── drizzle.config.ts              # Drizzle ORM config
└── README.md
```

---

## File Responsibilities Deep Dive

### Entry Point: server.ts

The **server.ts** file does ONE thing—start the server:

```typescript
// src/server.ts
import app from "./app.js";
import { config } from "./config/index.js";
import { logger } from "./utils/logger.js";

const port = config.port;

app.listen(port, () => {
  logger.info(`🚀 Server running on port ${port}`);
  logger.info(`📍 Environment: ${config.nodeEnv}`);
});
```

**Why separate server.ts from app.ts?**

- **Testing:** You can import `app` without starting the server
- **Serverless:** The app can be wrapped by a serverless handler
- **Hot reloading:** Tools like nodemon restart cleaner

### App Setup: app.ts

The **app.ts** file configures Express and mounts middleware/routes:

```typescript
// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import apiRouter from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFound.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan("dev"));

// Health check (outside versioned API)
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/v1", apiRouter);

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
```

### Configuration: config/

Centralized configuration with environment validation:

```typescript
// src/config/env.ts
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default("3000"),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
});

// Parse and validate environment
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
```

```typescript
// src/config/constants.ts
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const JOB_TYPES = [
  "full-time",
  "part-time",
  "contract",
  "internship",
  "remote",
] as const;

export const APPLICATION_STATUS = [
  "pending",
  "reviewing",
  "interviewed",
  "offered",
  "rejected",
  "withdrawn",
] as const;
```

```typescript
// src/config/index.ts
import { env } from "./env.js";
export { PAGINATION, JOB_TYPES, APPLICATION_STATUS } from "./constants.js";

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  isProduction: env.NODE_ENV === "production",
  isDevelopment: env.NODE_ENV === "development",
  isTest: env.NODE_ENV === "test",
} as const;
```

### Types: types/

Extend Express types and define domain types:

```typescript
// src/types/express.d.ts
import { User } from "./users.types.js";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
```

```typescript
// src/types/jobs.types.ts
import { JOB_TYPES } from "../config/constants.js";

export interface Job {
  id: string;
  title: string;
  description: string;
  salary?: number;
  location: string;
  type: (typeof JOB_TYPES)[number];
  slug: string;
  companyId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJobInput {
  title: string;
  description: string;
  salary?: number;
  location: string;
  type: (typeof JOB_TYPES)[number];
  companyId: string;
}

export interface UpdateJobInput {
  title?: string;
  description?: string;
  salary?: number;
  location?: string;
  type?: (typeof JOB_TYPES)[number];
}

export interface JobFilters {
  location?: string;
  type?: string;
  minSalary?: number;
  maxSalary?: number;
  search?: string;
}

export interface JobsListResponse {
  jobs: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Utils: utils/

Custom errors and helpers:

```typescript
// src/utils/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR",
    public isOperational: boolean = true,
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public details?: unknown,
  ) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}
```

```typescript
// src/utils/logger.ts
import { config } from "../config/index.js";

type LogLevel = "info" | "warn" | "error" | "debug";

const formatMessage = (
  level: LogLevel,
  message: string,
  meta?: object,
): string => {
  const timestamp = new Date().toISOString();
  const metaString = meta ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}`;
};

export const logger = {
  info: (message: string, meta?: object) => {
    console.log(formatMessage("info", message, meta));
  },

  warn: (message: string, meta?: object) => {
    console.warn(formatMessage("warn", message, meta));
  },

  error: (message: string, meta?: object) => {
    console.error(formatMessage("error", message, meta));
  },

  debug: (message: string, meta?: object) => {
    if (!config.isProduction) {
      console.debug(formatMessage("debug", message, meta));
    }
  },
};
```

---

## Mini-Tutorial: Scaffold the Project Structure

Let's create the DevJobs Pro folder structure step by step.

### Step 1: Initialize Project

```bash
mkdir devjobs-api
cd devjobs-api

npm init -y
```

### Step 2: Install Dependencies

```bash
# Production dependencies
npm install express cors helmet morgan zod

# Development dependencies
npm install -D typescript @types/express @types/cors @types/morgan \
  @types/node tsx nodemon
```

### Step 3: Configure TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 4: Create Package.json Scripts

```json
// package.json (scripts section)
{
  "type": "module",
  "scripts": {
    "dev": "nodemon --exec tsx src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix"
  }
}
```

### Step 5: Create Folder Structure

```bash
mkdir -p src/{config,controllers,db,middleware,routes,services,types,utils}
mkdir -p tests/{unit,integration,e2e}
```

### Step 6: Create Base Files

Create each file according to the examples shown earlier:

1. `src/config/env.ts` - Environment validation
2. `src/config/constants.ts` - App constants
3. `src/config/index.ts` - Config export
4. `src/utils/errors.ts` - Custom errors
5. `src/utils/logger.ts` - Logger
6. `src/types/express.d.ts` - Express augmentation
7. `src/middleware/errorHandler.ts` - Error middleware
8. `src/middleware/notFound.ts` - 404 handler
9. `src/routes/index.ts` - Route aggregator
10. `src/app.ts` - Express app
11. `src/server.ts` - Entry point

### Step 7: Environment File

```bash
# .env.example
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/devjobs
JWT_SECRET=your-super-secret-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d
```

---

## Practice: Create DevJobs Pro Structure

Create the complete folder structure for DevJobs Pro.

### Your Task

1. Create all directories
2. Create placeholder files for each layer
3. Implement the core utility files
4. Wire up app.ts and server.ts

### Required Files to Create

```
src/
├── config/
│   ├── index.ts             ✓ Central config export
│   ├── env.ts               ✓ Environment validation with Zod
│   └── constants.ts         ✓ App constants (job types, statuses)
│
├── controllers/
│   ├── auth.controller.ts   ○ Stub
│   ├── jobs.controller.ts   ○ Stub
│   └── ... (others)         ○ Stubs
│
├── db/
│   └── index.ts             ○ Placeholder (Drizzle setup in later module)
│
├── middleware/
│   ├── errorHandler.ts      ✓ Global error handler
│   ├── notFound.ts          ✓ 404 handler
│   ├── auth.ts              ○ Stub (JWT validation)
│   └── validate.ts          ○ Stub (request validation)
│
├── routes/
│   ├── index.ts             ✓ Route aggregator
│   └── ... (each route)     ○ Stubs
│
├── services/
│   └── ... (each service)   ○ Stubs
│
├── types/
│   ├── index.ts             ✓ Type exports
│   ├── express.d.ts         ✓ Express augmentation
│   └── ... (domain types)   ○ Basic interfaces
│
├── utils/
│   ├── errors.ts            ✓ Custom error classes
│   └── logger.ts            ✓ Logger utility
│
├── app.ts                   ✓ Express app setup
└── server.ts                ✓ Entry point
```

### Middleware Starters

```typescript
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { config } from "../config/index.js";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Log the error
  logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
        ...(config.isDevelopment && { stack: err.stack }),
      },
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    success: false,
    error: {
      message: "Internal server error",
      code: "INTERNAL_ERROR",
      ...(config.isDevelopment && { stack: err.stack }),
    },
  });
}
```

```typescript
// src/middleware/notFound.ts
import { Request, Response } from "express";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: "NOT_FOUND",
    },
  });
}
```

---

## Pro Tips

### 1. Keep Entry Point Minimal

```typescript
// ✅ Good - server.ts is clean
import app from "./app.js";
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running on ${port}`));

// ❌ Bad - server.ts does too much
import express from "express";
import cors from "cors";
// ... 50 more imports and setup
```

### 2. Validate Environment Early

```typescript
// In config/env.ts - fail fast if config is invalid
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid environment variables");
  process.exit(1); // Don't start with bad config!
}
```

### 3. Use Index Files for Clean Imports

```typescript
// types/index.ts
export * from "./auth.types.js";
export * from "./jobs.types.js";
export * from "./users.types.js";

// Usage - one import instead of many
import { User, Job, CreateJobInput } from "../types/index.js";
```

### 4. Separate Test Structure Mirror Source

```
src/
├── services/
│   └── jobs.service.ts

tests/
├── unit/
│   └── services/
│       └── jobs.service.test.ts
```

---

## 5-Minute Debugger: Structure Issues

### Problem: Module Not Found Errors

**Symptoms:** `Cannot find module '../config/index'`

**Solutions:**

```typescript
// 1. Check file extensions (ESM requires them)
import { config } from '../config/index.js';  // ✓ .js extension
import { config } from '../config/index';     // ✗ May fail in ESM

// 2. Check tsconfig paths match
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// 3. For path aliases, you need a resolver
// Install and configure tsconfig-paths or use tsx
```

### Problem: TypeScript Path Aliases Not Working

**Symptoms:** Path aliases (`@/utils`) work in IDE but fail at runtime.

**Solution:** Use `tsx` for development (handles it automatically) or configure for production:

```bash
# Development - tsx handles paths
npm install -D tsx
"dev": "tsx src/server.ts"

# Production - compile with tsc-alias
npm install -D tsc-alias
"build": "tsc && tsc-alias"
```

### Problem: Express Types Not Augmented

**Symptoms:** `Property 'user' does not exist on type 'Request'`

**Solution:**

```typescript
// 1. Make sure express.d.ts is included
// tsconfig.json
{
  "include": ["src/**/*"]  // Must include .d.ts files
}

// 2. Make sure the file exports something (even empty)
// src/types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};  // This is required!
```

### Problem: Circular Dependencies

**Symptoms:** Empty imports, runtime errors about undefined.

**Solution:** Check your import graph:

```bash
# Install madge to visualize
npm install -g madge
madge --circular src/

# Common fix: extract shared code
# Before: A imports B, B imports A
# After: A imports C, B imports C
```

---

## Key Takeaways

1. **Structure is architecture**—poor structure leads to poor code quality
2. **Layer-based organization** works well for most APIs
3. **Separate app.ts from server.ts** for testing and flexibility
4. **Validate configuration early** and fail fast
5. **Use TypeScript paths** for cleaner imports
6. **Mirror test structure** to source structure

---

## What's Next?

We have the structure in place. Now it's time to **implement the routes** for DevJobs Pro. In the next lesson, we'll scaffold all route files, controllers, and services—building the foundation that every future module will build upon.

---

[Next Lesson: DevJobs Routes Scaffold →](./04-devjobs-routes-scaffold.md)
