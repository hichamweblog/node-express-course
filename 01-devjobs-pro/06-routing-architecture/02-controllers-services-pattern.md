# Lesson 02: Controllers & Services Pattern

## The Problem: Fat Controllers

You've organized your routes beautifully. But look at this route handler:

```typescript
// routes/jobs.routes.ts - THE PROBLEM
router.post("/", async (req, res) => {
  // Validation
  const { title, description, salary, location } = req.body;
  if (!title || title.length < 3) {
    return res
      .status(400)
      .json({ error: "Title must be at least 3 characters" });
  }
  if (!description || description.length < 50) {
    return res
      .status(400)
      .json({ error: "Description must be at least 50 characters" });
  }

  // Business logic
  const slug = title.toLowerCase().replace(/\s+/g, "-");
  const normalizedSalary =
    typeof salary === "string" ? parseInt(salary) : salary;

  // Database operation
  const job = await db
    .insert(jobs)
    .values({
      title,
      description,
      salary: normalizedSalary,
      location,
      slug,
      userId: req.user.id,
      createdAt: new Date(),
    })
    .returning();

  // More business logic
  await sendEmailToSubscribers(job, location);
  await updateCompanyJobCount(req.user.companyId);

  // Response formatting
  res.status(201).json({
    success: true,
    data: {
      id: job[0].id,
      title: job[0].title,
      slug: job[0].slug,
      url: `/jobs/${job[0].slug}`,
    },
  });
});
```

This handler is doing **five different jobs**:

1. HTTP request handling
2. Input validation
3. Business logic
4. Database operations
5. Response formatting

This is a **fat controller**—and it's a code smell that leads to:

- Untestable code (can't test business logic without HTTP)
- Code duplication (same logic repeated in multiple handlers)
- Hard to maintain (changes require understanding the whole blob)
- Impossible to reuse (can't use this logic in a CLI tool or scheduled job)

---

## The Solution: Layered Architecture

Separate your code into **layers**, each with a single responsibility:

```
┌─────────────────────────────────────────────────────────────────┐
│                         HTTP Request                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         CONTROLLER                              │
│                                                                 │
│  Responsibility:                                                │
│  • Parse HTTP request (body, params, query, headers)            │
│  • Call appropriate service method                              │
│  • Format HTTP response                                         │
│  • Handle HTTP-specific errors                                  │
│                                                                 │
│  Does NOT contain: Business logic, database queries             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          SERVICE                                │
│                                                                 │
│  Responsibility:                                                │
│  • Business logic and rules                                     │
│  • Data transformation                                          │
│  • Orchestrate multiple operations                              │
│  • Call repository/database layer                               │
│                                                                 │
│  Does NOT contain: HTTP concepts, req/res objects               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REPOSITORY / DATABASE                        │
│                                                                 │
│  Responsibility:                                                │
│  • Data persistence (CRUD)                                      │
│  • Database queries                                             │
│  • Data mapping                                                 │
│                                                                 │
│  Does NOT contain: Business logic, HTTP concepts                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         HTTP Response                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Controller Responsibility

A controller is **thin**. It only:

1. Extracts data from the HTTP request
2. Calls the appropriate service method
3. Sends the HTTP response

```typescript
// controllers/jobs.controller.ts
import { Request, Response, NextFunction } from "express";
import { jobsService } from "../services/jobs.service.js";

export const jobsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Extract data from request
      const jobData = req.body;
      const userId = req.user!.id; // From auth middleware

      // 2. Call service (all business logic is there)
      const job = await jobsService.createJob(jobData, userId);

      // 3. Send response
      res.status(201).json({
        success: true,
        data: job,
      });
    } catch (error) {
      // Let error middleware handle it
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const job = await jobsService.getJobById(id);

      res.json({
        success: true,
        data: job,
      });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract query parameters
      const { page, limit, location, type } = req.query;

      const result = await jobsService.listJobs({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        location: location as string,
        type: type as string,
      });

      res.json({
        success: true,
        data: result.jobs,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },
};
```

**Notice:**

- No database queries in the controller
- No business logic (slug generation, validation, etc.)
- Just HTTP in → service call → HTTP out

---

## Service Responsibility

A service contains **business logic**. It:

1. Implements business rules
2. Orchestrates operations
3. Is completely framework-agnostic (no Express imports!)

```typescript
// services/jobs.service.ts
import { db } from "../db/index.js";
import { jobs, companies } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { AppError } from "../utils/errors.js";

// TypeScript interfaces for type safety
interface CreateJobInput {
  title: string;
  description: string;
  salary?: number;
  location: string;
  type: "full-time" | "part-time" | "contract" | "remote";
  companyId: string;
}

interface ListJobsOptions {
  page: number;
  limit: number;
  location?: string;
  type?: string;
}

export const jobsService = {
  async createJob(data: CreateJobInput, userId: string) {
    // Business rule: Generate slug from title
    const slug = this.generateSlug(data.title);

    // Business rule: Check for duplicate slug
    const existing = await db.query.jobs.findFirst({
      where: eq(jobs.slug, slug),
    });

    if (existing) {
      throw new AppError("A job with this title already exists", 409);
    }

    // Business rule: Verify user owns the company
    const company = await db.query.companies.findFirst({
      where: eq(companies.id, data.companyId),
    });

    if (!company || company.ownerId !== userId) {
      throw new AppError("You can only post jobs for your own company", 403);
    }

    // Create the job
    const [job] = await db
      .insert(jobs)
      .values({
        ...data,
        slug,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Business rule: Update company job count
    await this.updateCompanyJobCount(data.companyId);

    return job;
  },

  async getJobById(id: string) {
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, id),
      with: {
        company: true,
        user: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    return job;
  },

  async listJobs(options: ListJobsOptions) {
    const { page, limit, location, type } = options;
    const offset = (page - 1) * limit;

    // Build query conditions dynamically
    // ... filtering logic

    const [jobsList, countResult] = await Promise.all([
      db.query.jobs.findMany({
        limit,
        offset,
        orderBy: (jobs, { desc }) => [desc(jobs.createdAt)],
        with: { company: true },
      }),
      db.select({ count: sql`count(*)` }).from(jobs),
    ]);

    const total = Number(countResult[0].count);

    return {
      jobs: jobsList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Private helper methods
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  },

  async updateCompanyJobCount(companyId: string) {
    const count = await db
      .select({ count: sql`count(*)` })
      .from(jobs)
      .where(eq(jobs.companyId, companyId));

    await db
      .update(companies)
      .set({ jobCount: Number(count[0].count) })
      .where(eq(companies.id, companyId));
  },
};
```

**Notice:**

- No `Request` or `Response` objects—pure TypeScript
- Contains all business rules (slug generation, permission checks, etc.)
- Throws custom errors that the controller will handle
- Can be unit tested without any HTTP mocking

---

## Connecting Routes, Controllers, and Services

Here's how everything wires together:

```typescript
// routes/jobs.routes.ts
import { Router } from "express";
import { jobsController } from "../controllers/jobs.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Public routes
router.get("/", jobsController.list);
router.get("/search", jobsController.search);
router.get("/:id", jobsController.getById);

// Protected routes (require authentication)
router.post("/", authenticate, jobsController.create);
router.patch("/:id", authenticate, jobsController.update);
router.delete("/:id", authenticate, jobsController.delete);

export default router;
```

**The full request flow:**

```
GET /api/v1/jobs/123

     ┌─────────────────┐
     │     Router      │  Matches route, calls controller
     └────────┬────────┘
              │
              ▼
     ┌─────────────────┐
     │   Controller    │  jobsController.getById(req, res, next)
     │                 │  Extracts id: "123" from req.params
     └────────┬────────┘
              │
              ▼
     ┌─────────────────┐
     │    Service      │  jobsService.getJobById("123")
     │                 │  Queries database, applies business rules
     └────────┬────────┘
              │
              ▼
     ┌─────────────────┐
     │   Controller    │  Receives job object from service
     │                 │  Sends res.json({ success: true, data: job })
     └────────┬────────┘
              │
              ▼
     ┌─────────────────┐
     │    Response     │  { "success": true, "data": { ... } }
     └─────────────────┘
```

---

## Mini-Tutorial: Refactor to Controller + Service

Let's refactor a fat route handler step by step.

### Before: Fat Handler

```typescript
// routes/users.routes.ts - BEFORE
router.patch("/me", authenticate, async (req, res) => {
  try {
    const { name, email, bio } = req.body;
    const userId = req.user.id;

    // Validation
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Check if email is taken
      const existing = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
      if (existing && existing.id !== userId) {
        return res.status(409).json({ error: "Email already in use" });
      }
    }

    if (bio && bio.length > 500) {
      return res
        .status(400)
        .json({ error: "Bio must be under 500 characters" });
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set({
        name: name || undefined,
        email: email || undefined,
        bio: bio || undefined,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    // Remove sensitive fields
    const { password, ...safeUser } = updatedUser;

    res.json({ success: true, data: safeUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
```

### After: Controller + Service

**Step 1: Create the service**

```typescript
// services/users.service.ts
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { AppError } from "../utils/errors.js";

interface UpdateProfileInput {
  name?: string;
  email?: string;
  bio?: string;
}

export const usersService = {
  async updateProfile(userId: string, data: UpdateProfileInput) {
    // Business rule: Validate email format
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new AppError("Invalid email format", 400);
      }

      // Business rule: Email must be unique
      const existing = await db.query.users.findFirst({
        where: eq(users.email, data.email),
      });

      if (existing && existing.id !== userId) {
        throw new AppError("Email already in use", 409);
      }
    }

    // Business rule: Bio length limit
    if (data.bio && data.bio.length > 500) {
      throw new AppError("Bio must be under 500 characters", 400);
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new AppError("User not found", 404);
    }

    // Remove sensitive data
    const { password, ...safeUser } = updatedUser;
    return safeUser;
  },
};
```

**Step 2: Create the controller**

```typescript
// controllers/users.controller.ts
import { Request, Response, NextFunction } from "express";
import { usersService } from "../services/users.service.js";

export const usersController = {
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const updateData = req.body;

      const user = await usersService.updateProfile(userId, updateData);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
};
```

**Step 3: Update the route**

```typescript
// routes/users.routes.ts - AFTER
import { Router } from "express";
import { usersController } from "../controllers/users.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.patch("/me", authenticate, usersController.updateProfile);

export default router;
```

**Benefits achieved:**

- Route file is clean and declarative
- Controller is thin (~10 lines)
- Service contains all business logic
- Service can be unit tested without HTTP
- Service can be reused (admin panel, CLI, scheduled jobs)

---

## Dependency Injection Preview

As your app grows, you'll want to inject services into controllers for better testability:

```typescript
// controllers/jobs.controller.ts
import { Request, Response, NextFunction } from "express";
import { JobsService } from "../services/jobs.service.js";

// Using a class allows dependency injection
export class JobsController {
  constructor(private jobsService: JobsService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const job = await this.jobsService.createJob(req.body, req.user!.id);
      res.status(201).json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  };
}

// In production
const jobsService = new JobsService(db);
export const jobsController = new JobsController(jobsService);

// In tests - inject a mock!
const mockJobsService = { createJob: jest.fn() };
const testController = new JobsController(mockJobsService as any);
```

We'll cover this in depth in the Testing module.

---

## Practice: Plan DevJobs Pro Layers

Design the layered architecture for DevJobs Pro. Don't write the full implementation—just plan the structure.

### Your Task

Create this folder structure:

```
src/
├── controllers/
│   ├── auth.controller.ts
│   ├── jobs.controller.ts
│   ├── applications.controller.ts
│   ├── users.controller.ts
│   ├── companies.controller.ts
│   └── admin.controller.ts
│
├── services/
│   ├── auth.service.ts
│   ├── jobs.service.ts
│   ├── applications.service.ts
│   ├── users.service.ts
│   ├── companies.service.ts
│   └── admin.service.ts
│
├── db/
│   └── (Drizzle schema - later module)
│
└── utils/
    ├── errors.ts          # Custom error classes
    └── validators.ts      # Validation helpers
```

### Design Each Layer

For each resource, identify:

**Controllers (HTTP handling):**

```typescript
// What methods does each controller need?
// Example for jobs.controller.ts:
// - create(req, res, next)
// - getById(req, res, next)
// - list(req, res, next)
// - search(req, res, next)
// - update(req, res, next)
// - delete(req, res, next)
```

**Services (business logic):**

```typescript
// What business operations does each service need?
// Example for jobs.service.ts:
// - createJob(data, userId): Create with slug generation, permission check
// - getJobById(id): Fetch with company data
// - listJobs(options): Pagination, filtering
// - searchJobs(query): Full-text search
// - updateJob(id, data, userId): Permission check, update
// - deleteJob(id, userId): Permission check, soft delete
```

### Starter Template

```typescript
// utils/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
  }
}
```

---

## Pro Tips

### 1. Controllers Should Only Translate HTTP

```typescript
// ✅ Good - controller just translates
async create(req, res, next) {
  const result = await service.create(req.body);
  res.status(201).json(result);
}

// ❌ Bad - controller has business logic
async create(req, res, next) {
  const slug = generateSlug(req.body.title);  // Business logic!
  const result = await db.insert({ ...req.body, slug });  // Direct DB!
  res.status(201).json(result);
}
```

### 2. Services Should Be Framework-Agnostic

```typescript
// ✅ Good - no Express imports
// services/jobs.service.ts
import { db } from "../db/index.js";

export const jobsService = {
  async createJob(data: CreateJobInput, userId: string) {
    // Pure TypeScript, no req/res
  },
};

// ❌ Bad - Express dependency in service
import { Request } from "express"; // NO!

export const jobsService = {
  async createJob(req: Request) {
    // NO!
    // This couples service to Express
  },
};
```

### 3. Throw Errors, Don't Return Them

```typescript
// ✅ Good - throw errors for the controller to handle
async getJobById(id: string) {
  const job = await db.query.jobs.findFirst({ where: eq(jobs.id, id) });
  if (!job) {
    throw new NotFoundError('Job');
  }
  return job;
}

// ❌ Bad - returning error objects
async getJobById(id: string) {
  const job = await db.query.jobs.findFirst({ where: eq(jobs.id, id) });
  if (!job) {
    return { error: 'Job not found' };  // Harder to handle consistently
  }
  return { data: job };
}
```

### 4. Use TypeScript Interfaces for Service Inputs

```typescript
// Define clear contracts
interface CreateJobInput {
  title: string;
  description: string;
  salary?: number;
  location: string;
}

// Service method is self-documenting
async createJob(data: CreateJobInput, userId: string): Promise<Job>
```

---

## 5-Minute Debugger: Service Issues

### Problem: Circular Dependencies

**Symptoms:** `Cannot access 'X' before initialization` or empty imports.

```typescript
// services/users.service.ts
import { jobsService } from "./jobs.service.js";

// services/jobs.service.ts
import { usersService } from "./users.service.js"; // Circular!
```

**Solution:** Extract shared logic to a third service:

```typescript
// services/shared.service.ts
export const sharedService = {
  async getUserById(id: string) {
    /* ... */
  },
};

// Both services import from shared
import { sharedService } from "./shared.service.js";
```

### Problem: Service Not Found Errors

**Symptoms:** `TypeError: Cannot read property 'createJob' of undefined`

**Check:**

```typescript
// 1. Is the service exported?
export const jobsService = {
  /* ... */
};

// 2. Is the import path correct?
import { jobsService } from "../services/jobs.service.js";

// 3. Is the file extension correct for ESM?
// ✅ import from './jobs.service.js'
// ❌ import from './jobs.service'  (may fail in ESM)
```

### Problem: `this` is Undefined in Service Methods

**Symptoms:** `Cannot read property 'generateSlug' of undefined` when calling helper methods.

**Solution:** Use arrow functions or bind:

```typescript
// Option 1: Arrow functions for methods that use 'this'
export const jobsService = {
  generateSlug: (title: string) => {
    /* ... */
  },

  createJob: async function (data, userId) {
    const slug = jobsService.generateSlug(data.title); // Use service name
  },
};

// Option 2: Class-based service
export class JobsService {
  createJob = async (data, userId) => {
    const slug = this.generateSlug(data.title); // 'this' works
  };

  private generateSlug(title: string) {
    /* ... */
  }
}
```

---

## Key Takeaways

1. **Fat controllers are a code smell**—separate concerns into layers
2. **Controllers** handle HTTP only: extract request data, call service, send response
3. **Services** contain business logic and are framework-agnostic
4. **Throw errors** from services; let error middleware handle HTTP responses
5. **Use TypeScript interfaces** to define clear contracts between layers
6. This pattern makes code **testable**, **reusable**, and **maintainable**

---

## What's Next?

We have routes organized and controllers separated from services. Now we need to put it all together in a **professional project structure** that scales from MVP to enterprise.

In the next lesson, we'll scaffold the complete DevJobs Pro folder structure.

---

[Next Lesson: Project Structure Setup →](./03-project-structure-setup.md)
