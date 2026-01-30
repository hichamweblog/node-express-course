# Lesson 01: Express 5 Async Errors

## Introduction

> **Hook**: Express 5's biggest improvement—no more forgotten try/catch blocks

If you've worked with Express 4, you know the pain: wrap every async handler in try/catch, or risk crashing your server with unhandled Promise rejections. Forget just ONE try/catch? Silent failure. Your server hangs. Users wait forever.

Express 5 changes everything. Thrown errors and rejected Promises are now automatically caught and forwarded to your error-handling middleware. It's the async error handling we always wanted.

---

## Learning Objectives

By the end of this lesson, you will:

- ✅ Understand how Express 5 automatically handles async errors
- ✅ Compare Express 4 vs Express 5 error handling patterns
- ✅ Know what gets caught vs what doesn't
- ✅ Clean up DevJobs Pro handlers by removing unnecessary try/catch blocks

---

## The Theory: Automatic Promise Rejection Handling

### The Express 4 Problem

In Express 4, async route handlers don't automatically forward errors. If you throw an error or a Promise rejects, Express doesn't know about it:

```typescript
// Express 4 - THIS CRASHES YOUR SERVER
app.get("/jobs/:id", async (req, res) => {
  const job = await Job.findById(req.params.id); // Throws if invalid ID
  res.json(job);
});
// Unhandled Promise rejection → Server crash or hung request
```

The "solution" in Express 4 was wrapping EVERY handler:

```typescript
// Express 4 - The tedious workaround
app.get("/jobs/:id", async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    res.json(job);
  } catch (error) {
    next(error); // Manually forward to error handler
  }
});
```

### The Express 5 Solution

Express 5 automatically catches:

1. **Thrown errors** in route handlers
2. **Rejected Promises** from async functions
3. **Values passed to `next(value)`** (same as Express 4)

```typescript
// Express 5 - Just write your code!
app.get("/jobs/:id", async (req, res) => {
  const job = await Job.findById(req.params.id); // Error? Auto-caught!
  if (!job) {
    throw new Error("Job not found"); // Also auto-caught!
  }
  res.json(job);
});
```

---

## ASCII Diagram: Express 4 vs Express 5 Error Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXPRESS 4 ERROR FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Request                                                                   │
│      │                                                                      │
│      ▼                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐        │
│  │  Async Handler                                                  │        │
│  │  ┌──────────────────────────────────────────────────────────┐  │        │
│  │  │  try {                                                    │  │        │
│  │  │    const data = await fetchData(); ─────────────────────────────┐    │
│  │  │    res.json(data);                                        │  │  │    │
│  │  │  } catch (error) {                                        │  │  │    │
│  │  │    next(error); ─────────────────────────────────────────────┼──┼─┐  │
│  │  │  }                                                        │  │  │ │  │
│  │  └──────────────────────────────────────────────────────────┘  │  │ │  │
│  └────────────────────────────────────────────────────────────────┘  │ │  │
│                                                                      │ │  │
│   Without try/catch:                                                 │ │  │
│      Error thrown ──────────────────────────────────────────────┐   │ │  │
│                                                                  │   │ │  │
│                                                                  ▼   │ │  │
│   ┌────────────────────────────────────────┐         ┌──────────────┴─┴──┐│
│   │  💥 UNHANDLED PROMISE REJECTION        │         │  Error Middleware ││
│   │     - Request hangs                    │         │  (only if next()  ││
│   │     - Server may crash                 │         │   was called)     ││
│   │     - No response sent                 │         └───────────────────┘│
│   └────────────────────────────────────────┘                              │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXPRESS 5 ERROR FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Request                                                                   │
│      │                                                                      │
│      ▼                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐        │
│  │  Async Handler (No try/catch needed!)                          │        │
│  │                                                                 │        │
│  │  const data = await fetchData();  ──── Error? ────┐            │        │
│  │  res.json(data);                                  │            │        │
│  │                                                   │            │        │
│  │  throw new Error('Something wrong'); ─────────────┤            │        │
│  │                                                   │            │        │
│  └───────────────────────────────────────────────────┼────────────┘        │
│                                                      │                      │
│                                    Express catches automatically            │
│                                                      │                      │
│                                                      ▼                      │
│                                    ┌─────────────────────────────┐          │
│                                    │    Error Middleware         │          │
│                                    │    (Always receives error)  │          │
│                                    │                             │          │
│                                    │    Handles gracefully       │          │
│                                    │    Sends proper response    │          │
│                                    └─────────────────────────────┘          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## What Express 5 Catches (and What It Doesn't)

### ✅ Automatically Caught

| Scenario                      | Example                              | Caught? |
| ----------------------------- | ------------------------------------ | ------- |
| Thrown error in sync handler  | `throw new Error('Oops')`            | ✅ Yes  |
| Thrown error in async handler | `throw new Error('Oops')`            | ✅ Yes  |
| Rejected Promise              | `await failingFunction()`            | ✅ Yes  |
| Explicit rejection            | `return Promise.reject(new Error())` | ✅ Yes  |

### ❌ NOT Automatically Caught

| Scenario                 | Example                                     | Caught? |
| ------------------------ | ------------------------------------------- | ------- |
| Errors in callbacks      | `fs.readFile(path, (err) => { throw err })` | ❌ No   |
| Errors in event emitters | `emitter.on('data', () => { throw err })`   | ❌ No   |
| Errors after response    | Error thrown after `res.send()`             | ❌ No   |
| setTimeout/setInterval   | `setTimeout(() => { throw err }, 100)`      | ❌ No   |

```typescript
// ❌ NOT caught - callback-based code
app.get("/file", (req, res) => {
  fs.readFile("/path/to/file", (err, data) => {
    if (err) throw err; // NOT CAUGHT! Use next(err) or promisify
    res.send(data);
  });
});

// ✅ Caught - promisified version
import { readFile } from "fs/promises";

app.get("/file", async (req, res) => {
  const data = await readFile("/path/to/file"); // Errors auto-caught
  res.send(data);
});
```

---

## Examples

### Example 1: Express 4 Way - Try/Catch in Every Handler

```typescript
// controllers/jobController.ts (Express 4 style - verbose!)
import type { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { jobs } from "../db/schema";
import { eq } from "drizzle-orm";

// Every. Single. Handler. Needs. Try/Catch.
export const getAllJobs = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const allJobs = await db.select().from(jobs);
    res.json({
      success: true,
      data: allJobs,
    });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const jobId = Number(req.params.id);

    if (isNaN(jobId)) {
      res.status(400).json({ success: false, message: "Invalid job ID" });
      return;
    }

    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));

    if (!job) {
      res.status(404).json({ success: false, message: "Job not found" });
      return;
    }

    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

export const createJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { title, company, location, salary } = req.body;

    const [newJob] = await db
      .insert(jobs)
      .values({
        title,
        company,
        location,
        salary,
      })
      .returning();

    res.status(201).json({ success: true, data: newJob });
  } catch (error) {
    next(error);
  }
};

// 😩 Imagine doing this for 20+ handlers...
```

### Example 2: Express 5 Way - Clean and Simple

```typescript
// controllers/jobController.ts (Express 5 style - clean!)
import type { Request, Response } from "express";
import { db } from "../db";
import { jobs } from "../db/schema";
import { eq } from "drizzle-orm";

// No try/catch! Express 5 catches async errors automatically
export const getAllJobs = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const allJobs = await db.select().from(jobs);

  res.json({
    success: true,
    data: allJobs,
  });
};

export const getJobById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const jobId = Number(req.params.id);

  if (isNaN(jobId)) {
    throw new Error("Invalid job ID"); // Just throw!
  }

  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));

  if (!job) {
    throw new Error("Job not found"); // Express 5 catches this
  }

  res.json({ success: true, data: job });
};

export const createJob = async (req: Request, res: Response): Promise<void> => {
  const { title, company, location, salary } = req.body;

  const [newJob] = await db
    .insert(jobs)
    .values({
      title,
      company,
      location,
      salary,
    })
    .returning();

  res.status(201).json({ success: true, data: newJob });
};

// 🎉 So much cleaner!
```

### Example 3: Sync and Async Error Scenarios

```typescript
// Both sync and async errors are caught in Express 5

// Sync error - caught!
app.get("/sync-error", (req, res) => {
  throw new Error("Synchronous error"); // Caught by Express 5
});

// Async error - caught!
app.get("/async-error", async (req, res) => {
  throw new Error("Asynchronous error"); // Also caught!
});

// Promise rejection - caught!
app.get("/promise-rejection", async (req, res) => {
  await Promise.reject(new Error("Promise rejected")); // Caught!
});

// Downstream async error - caught!
app.get("/service-error", async (req, res) => {
  const result = await someService.thatThrows(); // Caught!
  res.json(result);
});

// Multiple awaits - first error caught
app.get("/multiple-awaits", async (req, res) => {
  const user = await findUser(req.params.id); // Error here? Caught!
  const jobs = await findJobsForUser(user.id); // Error here? Also caught!
  const stats = await calculateStats(jobs); // And here? Yep, caught!

  res.json({ user, jobs, stats });
});
```

---

## Mini-Tutorial: Migrate Express 4 Error Handling to Express 5

Let's migrate a real Express 4 controller to Express 5 style.

### Step 1: Original Express 4 Code

```typescript
// BEFORE: controllers/applicationController.ts (Express 4)
import type { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { applications, jobs } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const applyToJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const jobId = Number(req.params.jobId);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    // Check if job exists
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));

    if (!job) {
      res.status(404).json({
        success: false,
        message: "Job not found",
      });
      return;
    }

    // Check for duplicate application
    const [existing] = await db
      .select()
      .from(applications)
      .where(
        and(eq(applications.jobId, jobId), eq(applications.userId, userId)),
      );

    if (existing) {
      res.status(409).json({
        success: false,
        message: "Already applied to this job",
      });
      return;
    }

    // Create application
    const [application] = await db
      .insert(applications)
      .values({
        jobId,
        userId,
        status: "pending",
      })
      .returning();

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};
```

### Step 2: Migrated to Express 5 Style

```typescript
// AFTER: controllers/applicationController.ts (Express 5)
import type { Request, Response } from "express"; // No NextFunction needed!
import { db } from "../db";
import { applications, jobs } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const applyToJob = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const jobId = Number(req.params.jobId);
  const userId = req.user?.id;

  if (!userId) {
    // In Lesson 2, we'll replace this with: throw new UnauthorizedError()
    throw new Error("Authentication required");
  }

  // Check if job exists
  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));

  if (!job) {
    // In Lesson 2, we'll replace with: throw new NotFoundError('Job not found')
    throw new Error("Job not found");
  }

  // Check for duplicate application
  const [existing] = await db
    .select()
    .from(applications)
    .where(and(eq(applications.jobId, jobId), eq(applications.userId, userId)));

  if (existing) {
    // In Lesson 2: throw new ConflictError('Already applied to this job')
    throw new Error("Already applied to this job");
  }

  // Create application - if this throws, Express 5 catches it!
  const [application] = await db
    .insert(applications)
    .values({
      jobId,
      userId,
      status: "pending",
    })
    .returning();

  res.status(201).json({
    success: true,
    data: application,
  });
};
```

### Migration Checklist

- ✅ Remove `try/catch` wrapper
- ✅ Remove `NextFunction` from handler signature
- ✅ Replace `res.status().json()` error responses with `throw new Error()`
- ✅ Remove `next(error)` calls
- ✅ Keep the happy path exactly the same

---

## Practice: Remove Unnecessary Try/Catch from DevJobs Pro

### Exercise 1: Clean Up JobController

Take this Express 4-style controller and migrate it to Express 5:

```typescript
// BEFORE: Clean this up!
export const updateJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const jobId = Number(req.params.id);
    const { title, company, location, salary } = req.body;

    if (isNaN(jobId)) {
      res.status(400).json({ success: false, message: "Invalid job ID" });
      return;
    }

    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));

    if (!job) {
      res.status(404).json({ success: false, message: "Job not found" });
      return;
    }

    const [updatedJob] = await db
      .update(jobs)
      .set({ title, company, location, salary, updatedAt: new Date() })
      .where(eq(jobs.id, jobId))
      .returning();

    res.json({ success: true, data: updatedJob });
  } catch (error) {
    next(error);
  }
};
```

<details>
<summary>✅ Solution</summary>

```typescript
// AFTER: Express 5 clean version
export const updateJob = async (req: Request, res: Response): Promise<void> => {
  const jobId = Number(req.params.id);
  const { title, company, location, salary } = req.body;

  if (isNaN(jobId)) {
    throw new Error("Invalid job ID");
  }

  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));

  if (!job) {
    throw new Error("Job not found");
  }

  const [updatedJob] = await db
    .update(jobs)
    .set({ title, company, location, salary, updatedAt: new Date() })
    .where(eq(jobs.id, jobId))
    .returning();

  res.json({ success: true, data: updatedJob });
};
```

</details>

### Exercise 2: Multiple Handlers

Convert this entire file:

```typescript
// Convert ALL of these handlers
export const deleteJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // ... logic
  } catch (error) {
    next(error);
  }
};

export const searchJobs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // ... logic
  } catch (error) {
    next(error);
  }
};

export const getJobStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // ... logic
  } catch (error) {
    next(error);
  }
};
```

---

## Pro Tips

### 1. Express 5 Still Needs Error-Handling Middleware

Express 5 catches errors automatically, but you still need to HANDLE them:

```typescript
// app.ts - You MUST define this!
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});
```

Without error-handling middleware, Express 5 will send a default error response. You want control over that!

### 2. Thrown Errors Don't Have Status Codes (Yet)

Plain `Error` objects don't have HTTP status codes:

```typescript
// ❌ All these become 500 errors
throw new Error("Not found"); // 500, should be 404
throw new Error("Invalid input"); // 500, should be 400
throw new Error("Not authorized"); // 500, should be 401
```

**Solution**: Custom error classes (Lesson 2!)

### 3. Keep Some Try/Catch for Specific Handling

Sometimes you WANT to catch and handle differently:

```typescript
// ✅ Specific error handling when needed
export const importJobs = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const jobs = req.body.jobs;
  const results = { imported: 0, failed: 0, errors: [] as string[] };

  for (const job of jobs) {
    try {
      await db.insert(jobsTable).values(job);
      results.imported++;
    } catch (error) {
      // Don't let one failure stop all imports
      results.failed++;
      results.errors.push(`Failed to import: ${job.title}`);
    }
  }

  res.json({ success: true, data: results });
};
```

### 4. Use Async IIFE for Complex Conditionals

```typescript
// ✅ Async IIFE pattern for complex async operations
app.get("/complex", async (req, res) => {
  const result = await (async () => {
    if (condition1) {
      return await operation1();
    } else if (condition2) {
      return await operation2();
    }
    return await defaultOperation();
  })();

  res.json(result);
});
```

---

## 5-Minute Debugger

### Problem 1: "Unhandled promise rejection" Still Appearing

**Symptoms**: You upgraded to Express 5 but still see unhandled rejection warnings.

**Possible causes**:

1. **Not actually using Express 5**

   ```bash
   # Check your version
   npm ls express
   # Make sure it shows 5.x.x
   ```

2. **Using callback-based code inside async handlers**

   ```typescript
   // ❌ Callback errors aren't caught
   app.get("/file", async (req, res) => {
     fs.readFile(path, (err, data) => {
       if (err) throw err; // NOT caught by Express 5!
     });
   });

   // ✅ Use promisified version
   import { readFile } from "fs/promises";
   app.get("/file", async (req, res) => {
     const data = await readFile(path); // Caught!
     res.send(data);
   });
   ```

3. **Error thrown in setTimeout**

   ```typescript
   // ❌ Not caught
   app.get("/delayed", (req, res) => {
     setTimeout(() => {
       throw new Error("Oops"); // NOT caught!
     }, 1000);
   });

   // ✅ Use proper async patterns
   app.get("/delayed", async (req, res) => {
     await new Promise((resolve) => setTimeout(resolve, 1000));
     throw new Error("Oops"); // Caught!
   });
   ```

### Problem 2: Sync Errors Not Being Caught

**Symptoms**: Synchronous throws crash the server or aren't handled.

**Check**: Make sure your error-handling middleware is defined:

```typescript
// ❌ Missing error handler
app.get("/route", (req, res) => {
  throw new Error("Oops");
});
// Error goes nowhere!

// ✅ Add error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ error: err.message });
});
```

### Problem 3: Response Already Sent

**Symptoms**: "Cannot set headers after they are sent to the client"

```typescript
// ❌ Double response
app.get("/user/:id", async (req, res) => {
  const user = await findUser(req.params.id);
  res.json(user); // First response

  await logAccess(user); // This throws
  // Express tries to send error response - fails!
});

// ✅ All async work before response
app.get("/user/:id", async (req, res) => {
  const user = await findUser(req.params.id);
  await logAccess(user); // Async work first

  res.json(user); // Response last
});
```

---

## Definition of Done

Before moving to the next lesson, verify you can:

- [ ] Explain how Express 5 differs from Express 4 in error handling
- [ ] Write async handlers without try/catch blocks
- [ ] Know which errors Express 5 catches vs doesn't catch
- [ ] Understand why error-handling middleware is still required
- [ ] Have cleaned up DevJobs Pro handlers (remove try/catch wrappers)

---

## Key Takeaways

1. **Express 5 automatically catches** errors from async handlers and forwards them to error middleware
2. **No more try/catch wrappers** in every handler—just throw!
3. **Callback-style code** still needs manual error handling
4. **You still need error-handling middleware** to properly format error responses
5. **Plain Error objects** don't carry status codes—custom classes solve this (Lesson 2)

---

## Navigation

← [Module 06: Routing Architecture](../06-routing-architecture/README.md) | [Lesson 02: Custom Error Classes](./02-custom-error-classes.md) →
