# Lesson 01: Route Organization Patterns

## The Problem: Route Chaos

Picture this: You join a team and open `app.ts`. It's **1,847 lines long**. Every route for authentication, users, products, orders, payments, and admin operations—all in one file. Finding anything takes 10 minutes of scrolling. Adding a new route means hoping you don't break something else.

This is called a "monolithic route file," and it's one of the most common mistakes in Express applications. It's unmaintainable, impossible to test in isolation, and creates merge conflicts constantly.

**The solution?** Express Router and modular route organization.

---

## Understanding express.Router()

Think of `express.Router()` as a **mini Express application**. It has its own middleware, routes, and can be mounted onto the main app at any path prefix.

### Basic Router Creation

```typescript
// routes/jobs.ts
import { Router } from "express";

const router = Router();

// These routes are relative to where the router is mounted
router.get("/", (req, res) => {
  res.json({ message: "List all jobs" });
});

router.get("/:id", (req, res) => {
  res.json({ message: `Get job ${req.params.id}` });
});

router.post("/", (req, res) => {
  res.json({ message: "Create a job" });
});

export default router;
```

### Mounting Routers in the Main App

```typescript
// app.ts
import express from "express";
import jobsRouter from "./routes/jobs.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";

const app = express();

app.use(express.json());

// Mount routers with prefixes
app.use("/api/jobs", jobsRouter); // All job routes under /api/jobs
app.use("/api/auth", authRouter); // All auth routes under /api/auth
app.use("/api/users", usersRouter); // All user routes under /api/users

export default app;
```

**Result:**

- `GET /api/jobs` → Lists all jobs
- `GET /api/jobs/123` → Gets job with ID 123
- `POST /api/jobs` → Creates a new job

---

## Route File Organization Architecture

Here's how a well-organized Express API structures its routes:

```
┌─────────────────────────────────────────────────────────────────┐
│                           app.ts                                │
│                                                                 │
│   app.use('/api/v1', apiRouter)  ←── Single entry point        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     routes/index.ts                             │
│                                                                 │
│   Combines all route modules:                                   │
│   router.use('/auth', authRouter)                               │
│   router.use('/jobs', jobsRouter)                               │
│   router.use('/users', usersRouter)                             │
│   router.use('/applications', applicationsRouter)               │
│   router.use('/companies', companiesRouter)                     │
│   router.use('/admin', adminRouter)                             │
└─────────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
           ▼                  ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ routes/auth.ts  │ │ routes/jobs.ts  │ │ routes/users.ts │
│                 │ │                 │ │                 │
│ POST /login     │ │ GET /           │ │ GET /me         │
│ POST /register  │ │ GET /:id        │ │ PATCH /me       │
│ POST /logout    │ │ POST /          │ │ GET /:id        │
│ POST /refresh   │ │ PATCH /:id      │ │ DELETE /me      │
│                 │ │ DELETE /:id     │ │                 │
│                 │ │ GET /search     │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## Creating a Route Index File

The index file acts as a **route aggregator**—it imports all route modules and combines them under appropriate prefixes:

```typescript
// routes/index.ts
import { Router } from "express";

import authRouter from "./auth.routes.js";
import jobsRouter from "./jobs.routes.js";
import usersRouter from "./users.routes.js";
import applicationsRouter from "./applications.routes.js";
import companiesRouter from "./companies.routes.js";
import adminRouter from "./admin.routes.js";

const router = Router();

// Mount each router at its prefix
router.use("/auth", authRouter);
router.use("/jobs", jobsRouter);
router.use("/users", usersRouter);
router.use("/applications", applicationsRouter);
router.use("/companies", companiesRouter);
router.use("/admin", adminRouter);

// Health check at API root
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

export default router;
```

Then mount this single router in your app:

```typescript
// app.ts
import express from "express";
import apiRouter from "./routes/index.js";

const app = express();

app.use(express.json());

// All API routes under /api/v1
app.use("/api/v1", apiRouter);

export default app;
```

---

## Nested Routers for Complex Resources

Sometimes routes have logical sub-resources. Express routers can be nested:

```typescript
// routes/jobs.routes.ts
import { Router } from "express";

const router = Router();

// Main job routes
router.get("/", (req, res) => {
  res.json({ message: "List jobs" });
});

router.get("/:jobId", (req, res) => {
  res.json({ message: `Get job ${req.params.jobId}` });
});

// Nested route: Job applications (belongs to a job)
// GET /api/v1/jobs/:jobId/applications
router.get("/:jobId/applications", (req, res) => {
  res.json({
    message: `Get applications for job ${req.params.jobId}`,
  });
});

// POST /api/v1/jobs/:jobId/applications
router.post("/:jobId/applications", (req, res) => {
  res.json({
    message: `Apply to job ${req.params.jobId}`,
  });
});

export default router;
```

### Alternative: Separate Nested Router

For complex nested resources, create a separate router with `mergeParams`:

```typescript
// routes/job-applications.routes.ts
import { Router } from "express";

// mergeParams: true allows access to parent route params
const router = Router({ mergeParams: true });

router.get("/", (req, res) => {
  // req.params.jobId is available from parent!
  res.json({
    message: `Applications for job ${req.params.jobId}`,
  });
});

router.post("/", (req, res) => {
  res.json({
    message: `New application for job ${req.params.jobId}`,
  });
});

router.get("/:applicationId", (req, res) => {
  res.json({
    message: `Application ${req.params.applicationId} for job ${req.params.jobId}`,
  });
});

export default router;
```

```typescript
// routes/jobs.routes.ts
import { Router } from "express";
import jobApplicationsRouter from "./job-applications.routes.js";

const router = Router();

router.get("/", (req, res) => {
  /* ... */
});
router.get("/:jobId", (req, res) => {
  /* ... */
});

// Mount nested router
router.use("/:jobId/applications", jobApplicationsRouter);

export default router;
```

---

## API Versioning with Route Prefixes

**Why version your API?** When you need to make breaking changes, versioning lets existing clients continue working while new clients use the updated API.

### Pattern 1: URL Prefix Versioning (Recommended)

```typescript
// routes/v1/index.ts
import { Router } from "express";
import jobsRouter from "./jobs.routes.js";

const router = Router();
router.use("/jobs", jobsRouter);

export default router;
```

```typescript
// routes/v2/index.ts
import { Router } from "express";
import jobsRouter from "./jobs.routes.js"; // New implementation

const router = Router();
router.use("/jobs", jobsRouter);

export default router;
```

```typescript
// app.ts
import express from "express";
import v1Router from "./routes/v1/index.js";
import v2Router from "./routes/v2/index.js";

const app = express();

app.use("/api/v1", v1Router); // Legacy clients
app.use("/api/v2", v2Router); // New clients

export default app;
```

### Pattern 2: Header-Based Versioning

```typescript
// middleware/api-version.ts
import { Request, Response, NextFunction } from "express";

export function apiVersion(req: Request, res: Response, next: NextFunction) {
  // Check Accept-Version header
  const version = req.headers["accept-version"] || "v1";
  req.apiVersion = version as string;
  next();
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      apiVersion?: string;
    }
  }
}
```

**Pro tip:** URL prefix versioning is simpler to implement, easier to debug, and more discoverable. Use it unless you have specific reasons for header-based versioning.

---

## Mini-Tutorial: Split Monolithic Routes

Let's refactor a messy monolithic file into organized modules.

### Before: The Chaos

```typescript
// app.ts (BEFORE - 500+ lines of mess)
import express from "express";

const app = express();
app.use(express.json());

// Auth routes
app.post("/api/auth/register", (req, res) => {
  /* ... */
});
app.post("/api/auth/login", (req, res) => {
  /* ... */
});
app.post("/api/auth/logout", (req, res) => {
  /* ... */
});

// User routes
app.get("/api/users/me", (req, res) => {
  /* ... */
});
app.patch("/api/users/me", (req, res) => {
  /* ... */
});
app.get("/api/users/:id", (req, res) => {
  /* ... */
});

// Job routes
app.get("/api/jobs", (req, res) => {
  /* ... */
});
app.get("/api/jobs/:id", (req, res) => {
  /* ... */
});
app.post("/api/jobs", (req, res) => {
  /* ... */
});
app.patch("/api/jobs/:id", (req, res) => {
  /* ... */
});
app.delete("/api/jobs/:id", (req, res) => {
  /* ... */
});
app.get("/api/jobs/search", (req, res) => {
  /* ... */
});

// ... 40 more routes

export default app;
```

### After: Organized Modules

**Step 1: Create route files**

```typescript
// routes/auth.routes.ts
import { Router, Request, Response } from "express";

const router = Router();

router.post("/register", (req: Request, res: Response) => {
  // Registration logic
  res.status(201).json({ message: "User registered" });
});

router.post("/login", (req: Request, res: Response) => {
  // Login logic
  res.json({ message: "Login successful" });
});

router.post("/logout", (req: Request, res: Response) => {
  // Logout logic
  res.json({ message: "Logged out" });
});

export default router;
```

```typescript
// routes/jobs.routes.ts
import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ jobs: [] });
});

router.get("/search", (req: Request, res: Response) => {
  const { q, location, type } = req.query;
  res.json({ query: { q, location, type }, results: [] });
});

router.get("/:id", (req: Request, res: Response) => {
  res.json({ job: { id: req.params.id } });
});

router.post("/", (req: Request, res: Response) => {
  res.status(201).json({ job: req.body });
});

router.patch("/:id", (req: Request, res: Response) => {
  res.json({ job: { id: req.params.id, ...req.body } });
});

router.delete("/:id", (req: Request, res: Response) => {
  res.status(204).send();
});

export default router;
```

**Step 2: Create the index aggregator**

```typescript
// routes/index.ts
import { Router } from "express";
import authRouter from "./auth.routes.js";
import jobsRouter from "./jobs.routes.js";
import usersRouter from "./users.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/jobs", jobsRouter);
router.use("/users", usersRouter);

export default router;
```

**Step 3: Clean up app.ts**

```typescript
// app.ts (AFTER - clean and simple)
import express from "express";
import apiRouter from "./routes/index.js";

const app = express();

app.use(express.json());
app.use("/api/v1", apiRouter);

export default app;
```

**Result:** app.ts went from 500+ lines to ~10 lines. Each route file is focused, testable, and easy to find.

---

## Practice: DevJobs Pro Route Organization

Create the complete route structure for DevJobs Pro. For now, use placeholder handlers—we'll implement the real logic in later modules.

### Your Task

Create these files:

```
src/
└── routes/
    ├── index.ts              # Aggregates all routes
    ├── auth.routes.ts        # Authentication
    ├── jobs.routes.ts        # Job listings
    ├── applications.routes.ts # Job applications
    ├── users.routes.ts       # User profiles
    ├── companies.routes.ts   # Company management
    └── admin.routes.ts       # Admin operations
```

### Route Specifications

**auth.routes.ts:**

- `POST /register` - Create new user account
- `POST /login` - Authenticate user
- `POST /logout` - End session
- `POST /refresh-token` - Refresh JWT token

**jobs.routes.ts:**

- `GET /` - List jobs (with pagination)
- `GET /search` - Search with filters
- `GET /:id` - Get single job
- `POST /` - Create job (employers only)
- `PATCH /:id` - Update job (owner only)
- `DELETE /:id` - Delete job (owner only)

**applications.routes.ts:**

- `POST /` - Submit application
- `GET /my` - Get my applications (job seeker)
- `GET /job/:jobId` - Get applications for a job (employer)
- `PATCH /:id/status` - Update application status (employer)

**users.routes.ts:**

- `GET /me` - Get current user profile
- `PATCH /me` - Update profile
- `POST /me/resume` - Upload resume
- `GET /:id` - Get public profile

**companies.routes.ts:**

- `GET /` - List companies
- `GET /:id` - Get company details
- `POST /` - Create company (employers)
- `PATCH /:id` - Update company (owner)
- `DELETE /:id` - Delete company (owner)

**admin.routes.ts:**

- `GET /users` - List all users
- `PATCH /users/:id` - Modify user
- `GET /stats` - Dashboard statistics
- `DELETE /jobs/:id` - Force delete any job

### Starter Code

Here's the auth routes to get you started:

```typescript
// routes/auth.routes.ts
import { Router, Request, Response } from "express";

const router = Router();

// POST /api/v1/auth/register
router.post("/register", (req: Request, res: Response) => {
  // TODO: Implement registration
  res.status(501).json({
    message: "Registration not implemented",
    endpoint: "POST /api/v1/auth/register",
  });
});

// POST /api/v1/auth/login
router.post("/login", (req: Request, res: Response) => {
  // TODO: Implement login
  res.status(501).json({
    message: "Login not implemented",
    endpoint: "POST /api/v1/auth/login",
  });
});

// POST /api/v1/auth/logout
router.post("/logout", (req: Request, res: Response) => {
  // TODO: Implement logout
  res.status(501).json({
    message: "Logout not implemented",
    endpoint: "POST /api/v1/auth/logout",
  });
});

// POST /api/v1/auth/refresh-token
router.post("/refresh-token", (req: Request, res: Response) => {
  // TODO: Implement token refresh
  res.status(501).json({
    message: "Token refresh not implemented",
    endpoint: "POST /api/v1/auth/refresh-token",
  });
});

export default router;
```

Now create the remaining route files following this pattern!

---

## Pro Tips

### 1. Version Your APIs from Day One

```typescript
// Even if you only have v1, set up the structure
app.use("/api/v1", v1Router);

// Future you will thank present you
```

### 2. Keep Route Files Focused

Each route file should handle **one resource**. If a file grows beyond ~100 lines, consider splitting nested resources into their own files.

### 3. Use Consistent Naming

Pick a convention and stick with it:

```
✅ auth.routes.ts, jobs.routes.ts, users.routes.ts
✅ authRoutes.ts, jobRoutes.ts, userRoutes.ts

❌ auth.ts, jobsRouter.ts, user-routes.ts (inconsistent)
```

### 4. Route Order Matters

Specific routes must come before parameterized routes:

```typescript
// ✅ Correct order
router.get("/search", searchJobs); // Matches /jobs/search
router.get("/:id", getJobById); // Matches /jobs/123

// ❌ Wrong order
router.get("/:id", getJobById); // Matches /jobs/search too!
router.get("/search", searchJobs); // Never reached
```

### 5. Export Router as Default

```typescript
// Consistent import syntax
export default router;

// In the parent file
import jobsRouter from "./jobs.routes.js"; // Clean
```

---

## 5-Minute Debugger: Route Issues

### Problem: Routes Not Mounting

**Symptoms:** Routes return 404 even though they're defined.

**Check these:**

```typescript
// 1. Did you export the router?
export default router; // Not: export { router }

// 2. Did you import correctly?
import jobsRouter from "./jobs.routes.js"; // Check path

// 3. Did you call app.use()?
app.use("/api/jobs", jobsRouter); // Not: app.get('/api/jobs', jobsRouter)

// 4. Is the path correct?
// If mounted at '/api/jobs', the route '/' matches '/api/jobs'
router.get("/", handler); // Matches GET /api/jobs
```

### Problem: Wrong Prefixes Applied

**Symptoms:** Route works at unexpected path.

**Debug steps:**

```typescript
// Add a middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Check mounting order - first match wins
app.use("/api", apiRouter);
app.use("/api/v1", v1Router); // /api/v1/jobs goes to apiRouter first!
```

### Problem: Params Not Available

**Symptoms:** `req.params.id` is undefined in nested router.

**Solution:**

```typescript
// Enable mergeParams in nested router
const nestedRouter = Router({ mergeParams: true });
```

### Problem: Search Route Not Working

**Symptoms:** `GET /jobs/search` returns job with ID "search".

**Solution:** Order matters—put specific routes first:

```typescript
router.get("/search", searchJobs); // BEFORE /:id
router.get("/:id", getJobById);
```

---

## Key Takeaways

1. **express.Router()** creates modular mini-apps for route organization
2. **Route prefixes** group related routes under common paths
3. **Index files** aggregate routers into a single mount point
4. **API versioning** via URL prefixes (`/api/v1`) is the simplest approach
5. **Route order matters**—specific routes before parameterized routes
6. **One file, one resource**—keep route files focused and small

---

## What's Next?

Your routes are organized, but the handlers are doing too much. What happens when a route handler has database queries, validation, and business logic all mixed together?

In the next lesson, we'll separate concerns properly with the **Controller-Service pattern**—making your code testable, reusable, and maintainable.

---

[Next Lesson: Controllers & Services Pattern →](./02-controllers-services-pattern.md)
