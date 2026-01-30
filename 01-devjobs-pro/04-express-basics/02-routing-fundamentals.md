# Lesson 02: Routing Fundamentals

## 🎯 Hook

**Routes are the URL map to your application logic.**

Every API you've ever used—GitHub, Stripe, Twitter—has a carefully designed set of routes. When you hit `GET /repos/facebook/react`, GitHub's server knows exactly which function to run. That's routing. In Express, you define this mapping with elegant simplicity: `app.get('/path', handler)`.

---

## 📚 Theory

### What is Routing?

Routing determines how your application responds to client requests at specific endpoints. Each route is defined by:

1. **HTTP Method** - GET, POST, PUT, PATCH, DELETE
2. **Path** - The URL pattern to match
3. **Handler(s)** - Function(s) to execute when matched

### HTTP Methods: The CRUD Mapping

| Method | Purpose          | Idempotent? | Request Body? |
| ------ | ---------------- | ----------- | ------------- |
| GET    | Retrieve data    | Yes         | No            |
| POST   | Create resource  | No          | Yes           |
| PUT    | Replace resource | Yes         | Yes           |
| PATCH  | Partial update   | Yes         | Yes           |
| DELETE | Remove resource  | Yes         | No            |

> **Idempotent** = Multiple identical requests produce the same result as a single request.

### Request → Response Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      EXPRESS ROUTING FLOW                            │
└─────────────────────────────────────────────────────────────────────┘

  Client Request
  GET /api/jobs/123?status=active
         │
         ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │                    ROUTE MATCHING ENGINE                         │
  │                                                                   │
  │   Express checks routes IN ORDER of definition:                  │
  │                                                                   │
  │   app.get('/api/health')        ❌ No match                      │
  │   app.get('/api/users/:id')     ❌ No match                      │
  │   app.get('/api/jobs/:id')      ✅ MATCH!                        │
  │                                                                   │
  │   Extracts: req.params.id = "123"                                │
  │             req.query.status = "active"                          │
  └──────────────────────────┬──────────────────────────────────────┘
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │                      ROUTE HANDLER                               │
  │                                                                   │
  │   async (req, res) => {                                          │
  │     const { id } = req.params;     // "123"                      │
  │     const { status } = req.query;  // "active"                   │
  │                                                                   │
  │     const job = await Job.findById(id);                          │
  │     res.json(job);                                               │
  │   }                                                               │
  └──────────────────────────┬──────────────────────────────────────┘
                             │
                             ▼
                    Response to Client
                    { "id": "123", "title": "..." }
```

### Route Path Types

```typescript
// 1. Static paths - exact match
app.get("/api/jobs", handler); // Matches: /api/jobs

// 2. Route parameters - dynamic segments
app.get("/api/jobs/:id", handler); // Matches: /api/jobs/123
// req.params.id = "123"

// 3. Multiple parameters
app.get("/users/:userId/jobs/:jobId", handler);
// Matches: /users/42/jobs/123
// req.params = { userId: "42", jobId: "123" }

// 4. Optional parameters (use ? after param name)
app.get("/jobs/:id?", handler); // Matches: /jobs AND /jobs/123

// 5. Express 5 wildcards (CHANGED from Express 4!)
// Express 4: app.get('/files/*', ...)
// Express 5: Must be named
app.get("/files/:path*", handler); // Matches: /files/docs/readme.md
// req.params.path = "docs/readme.md"

// 6. Regular expressions (advanced)
app.get(/.*fly$/, handler); // Matches: /butterfly, /dragonfly
```

### Express 5 Named Wildcards

```typescript
// ❌ Express 4 style - NO LONGER WORKS in Express 5
app.get("/static/*", (req, res) => {
  // req.params[0] contained the wildcard match
});

// ✅ Express 5 style - Must name wildcards
app.get("/static/:filepath*", (req, res) => {
  // req.params.filepath contains the wildcard match
  console.log(req.params.filepath); // "images/logo.png"
});

// Common patterns
app.get("/api/:version/:path*", handler); // /api/v1/users/123/posts
app.get("/docs/:page*", handler); // /docs/getting-started/install
```

---

## 💻 Code Examples

### Example 1: Basic Routes for All HTTP Methods

```typescript
import express, { Request, Response, Router } from "express";

const router = Router();

// GET - Retrieve all jobs
router.get("/jobs", async (req: Request, res: Response) => {
  // In reality: const jobs = await Job.find();
  const jobs = [
    { id: 1, title: "Node.js Developer" },
    { id: 2, title: "React Engineer" },
  ];
  res.json(jobs);
});

// GET - Retrieve single job
router.get("/jobs/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  // In reality: const job = await Job.findById(id);
  res.json({ id, title: "Node.js Developer" });
});

// POST - Create new job
router.post("/jobs", async (req: Request, res: Response) => {
  const jobData = req.body;
  // In reality: const job = await Job.create(jobData);
  res.status(201).json({ id: 3, ...jobData });
});

// PUT - Replace entire job
router.put("/jobs/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const jobData = req.body;
  // In reality: const job = await Job.findByIdAndReplace(id, jobData);
  res.json({ id, ...jobData });
});

// PATCH - Partial update
router.patch("/jobs/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  // In reality: const job = await Job.findByIdAndUpdate(id, updates);
  res.json({ id, ...updates });
});

// DELETE - Remove job
router.delete("/jobs/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  // In reality: await Job.findByIdAndDelete(id);
  res.status(204).send(); // 204 No Content
});

export default router;
```

### Example 2: Parameterized Routes with TypeScript

```typescript
import { Router, Request, Response } from "express";

const router = Router();

// Type params for better IntelliSense
interface JobParams {
  id: string;
}

interface UserJobParams {
  userId: string;
  jobId: string;
}

// Single parameter
router.get("/jobs/:id", async (req: Request<JobParams>, res: Response) => {
  const { id } = req.params; // TypeScript knows id is string
  res.json({ jobId: id });
});

// Multiple parameters
router.get(
  "/users/:userId/applications/:jobId",
  async (req: Request<UserJobParams>, res: Response) => {
    const { userId, jobId } = req.params;
    res.json({
      message: `User ${userId} applied to job ${jobId}`,
    });
  },
);

// Parameter with constraints (validate in handler)
router.get("/jobs/:id", async (req: Request<JobParams>, res: Response) => {
  const { id } = req.params;

  // Validate ID format
  if (!/^[a-f0-9]{24}$/i.test(id)) {
    return res.status(400).json({ error: "Invalid job ID format" });
  }

  res.json({ jobId: id });
});

export default router;
```

### Example 3: Route Organization with Express Router

```typescript
// src/routes/jobs.routes.ts
import { Router, Request, Response } from "express";

const router = Router();

router.get("/", getAllJobs);
router.get("/:id", getJobById);
router.post("/", createJob);
router.patch("/:id", updateJob);
router.delete("/:id", deleteJob);

// Handler functions (can extract to controller)
async function getAllJobs(req: Request, res: Response) {
  res.json({ jobs: [] });
}

async function getJobById(req: Request, res: Response) {
  res.json({ job: { id: req.params.id } });
}

async function createJob(req: Request, res: Response) {
  res.status(201).json({ job: req.body });
}

async function updateJob(req: Request, res: Response) {
  res.json({ job: { id: req.params.id, ...req.body } });
}

async function deleteJob(req: Request, res: Response) {
  res.status(204).send();
}

export default router;
```

```typescript
// src/routes/index.ts
import { Router } from "express";
import jobsRouter from "./jobs.routes.js";
import authRouter from "./auth.routes.js";
import usersRouter from "./users.routes.js";

const router = Router();

router.use("/jobs", jobsRouter); // /api/v1/jobs
router.use("/auth", authRouter); // /api/v1/auth
router.use("/users", usersRouter); // /api/v1/users

export default router;
```

```typescript
// src/app.ts
import express from "express";
import apiRoutes from "./routes/index.js";

const app = express();

app.use(express.json());
app.use("/api/v1", apiRoutes); // All routes prefixed with /api/v1

export default app;
```

---

## 🛠️ Mini-Tutorial: Create CRUD Routes for Jobs

Let's build a complete, properly-structured CRUD API for job listings.

### Step 1: Create Route File Structure

```bash
mkdir -p src/routes
touch src/routes/jobs.routes.ts
touch src/routes/index.ts
```

### Step 2: Define TypeScript Interfaces

```typescript
// src/types/job.types.ts
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  type: "full-time" | "part-time" | "contract" | "remote";
  description: string;
  requirements: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJobDTO {
  title: string;
  company: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  type: "full-time" | "part-time" | "contract" | "remote";
  description: string;
  requirements: string[];
}

export interface UpdateJobDTO extends Partial<CreateJobDTO> {}
```

### Step 3: Implement Job Routes

```typescript
// src/routes/jobs.routes.ts
import { Router, Request, Response } from "express";
import type { Job, CreateJobDTO, UpdateJobDTO } from "../types/job.types.js";

const router = Router();

// In-memory storage (replace with database later)
let jobs: Job[] = [
  {
    id: "1",
    title: "Senior Node.js Developer",
    company: "TechCorp",
    location: "San Francisco, CA",
    salary: { min: 120000, max: 180000, currency: "USD" },
    type: "full-time",
    description: "Build scalable backend services...",
    requirements: ["Node.js", "TypeScript", "PostgreSQL"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// GET /jobs - List all jobs
// Query params: ?type=full-time&location=remote&limit=10
router.get("/", (req: Request, res: Response) => {
  const { type, location, limit } = req.query;

  let result = [...jobs];

  if (type) {
    result = result.filter((job) => job.type === type);
  }

  if (location) {
    result = result.filter((job) =>
      job.location.toLowerCase().includes(String(location).toLowerCase()),
    );
  }

  if (limit) {
    result = result.slice(0, Number(limit));
  }

  res.json({
    data: result,
    count: result.length,
  });
});

// GET /jobs/:id - Get single job
router.get("/:id", (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const job = jobs.find((j) => j.id === id);

  if (!job) {
    return res.status(404).json({
      error: "Not Found",
      message: `Job with id ${id} not found`,
    });
  }

  res.json({ data: job });
});

// POST /jobs - Create new job
router.post("/", (req: Request<{}, {}, CreateJobDTO>, res: Response) => {
  const jobData = req.body;

  // Basic validation (use a validation library in production)
  if (!jobData.title || !jobData.company) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Title and company are required",
    });
  }

  const newJob: Job = {
    id: String(Date.now()), // Use UUID in production
    ...jobData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  jobs.push(newJob);

  res.status(201).json({ data: newJob });
});

// PATCH /jobs/:id - Update job (partial)
router.patch(
  "/:id",
  (req: Request<{ id: string }, {}, UpdateJobDTO>, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    const jobIndex = jobs.findIndex((j) => j.id === id);

    if (jobIndex === -1) {
      return res.status(404).json({
        error: "Not Found",
        message: `Job with id ${id} not found`,
      });
    }

    jobs[jobIndex] = {
      ...jobs[jobIndex],
      ...updates,
      updatedAt: new Date(),
    };

    res.json({ data: jobs[jobIndex] });
  },
);

// DELETE /jobs/:id - Delete job
router.delete("/:id", (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const jobIndex = jobs.findIndex((j) => j.id === id);

  if (jobIndex === -1) {
    return res.status(404).json({
      error: "Not Found",
      message: `Job with id ${id} not found`,
    });
  }

  jobs.splice(jobIndex, 1);

  res.status(204).send();
});

export default router;
```

### Step 4: Wire Up Routes

```typescript
// src/routes/index.ts
import { Router, Request, Response } from "express";
import jobsRouter from "./jobs.routes.js";

const router = Router();

// API root
router.get("/", (req: Request, res: Response) => {
  res.json({
    message: "DevJobs Pro API v1",
    endpoints: {
      jobs: "/api/v1/jobs",
      auth: "/api/v1/auth",
      users: "/api/v1/users",
      applications: "/api/v1/applications",
      companies: "/api/v1/companies",
    },
  });
});

// Mount route modules
router.use("/jobs", jobsRouter);

export default router;
```

### Step 5: Test Your Routes

```bash
# List all jobs
curl http://localhost:3000/api/v1/jobs

# Get single job
curl http://localhost:3000/api/v1/jobs/1

# Create job
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{"title": "React Developer", "company": "StartupXYZ", "type": "remote"}'

# Update job
curl -X PATCH http://localhost:3000/api/v1/jobs/1 \
  -H "Content-Type: application/json" \
  -d '{"salary": {"min": 130000, "max": 190000, "currency": "USD"}}'

# Delete job
curl -X DELETE http://localhost:3000/api/v1/jobs/1
```

---

## 🏋️ Practice Exercise: DevJobs Pro Route Structure

Create the route file stubs for the entire DevJobs Pro API.

### Requirements

Create these route files:

- `src/routes/auth.routes.ts` - POST /login, POST /register, POST /logout, POST /refresh
- `src/routes/users.routes.ts` - GET /, GET /:id, PATCH /:id, DELETE /:id
- `src/routes/applications.routes.ts` - GET /, POST /, GET /:id, PATCH /:id/status
- `src/routes/companies.routes.ts` - GET /, GET /:id, POST /, PATCH /:id

### Expected Structure

```typescript
// src/routes/auth.routes.ts
import { Router, Request, Response } from "express";

const router = Router();

// POST /auth/login
router.post("/login", async (req: Request, res: Response) => {
  // TODO: Implement authentication
  res.json({ message: "Login endpoint" });
});

// POST /auth/register
router.post("/register", async (req: Request, res: Response) => {
  // TODO: Implement registration
  res.status(201).json({ message: "Register endpoint" });
});

// POST /auth/logout
router.post("/logout", async (req: Request, res: Response) => {
  // TODO: Implement logout
  res.json({ message: "Logout endpoint" });
});

// POST /auth/refresh
router.post("/refresh", async (req: Request, res: Response) => {
  // TODO: Implement token refresh
  res.json({ message: "Refresh endpoint" });
});

export default router;
```

### Bonus Challenge

Add nested routes for user applications:

- `GET /users/:userId/applications` - Get all applications by a user
- `GET /companies/:companyId/jobs` - Get all jobs posted by a company

---

## 💡 Pro Tips

### 1. Use Appropriate HTTP Methods

```typescript
// ❌ WRONG - Using POST for everything
app.post('/getUsers', ...);
app.post('/deleteUser', ...);

// ✅ RIGHT - RESTful design
app.get('/users', ...);      // Retrieve
app.post('/users', ...);     // Create
app.patch('/users/:id', ...) // Update
app.delete('/users/:id', ...)// Delete
```

### 2. Use Correct Status Codes

```typescript
// Success codes
res.status(200).json(data); // OK - standard success
res.status(201).json(newItem); // Created - after POST
res.status(204).send(); // No Content - after DELETE

// Client error codes
res.status(400).json({ error: "Bad Request" }); // Invalid input
res.status(401).json({ error: "Unauthorized" }); // Not logged in
res.status(403).json({ error: "Forbidden" }); // Logged in, no permission
res.status(404).json({ error: "Not Found" }); // Resource doesn't exist
res.status(409).json({ error: "Conflict" }); // Duplicate resource

// Server error
res.status(500).json({ error: "Internal Server Error" });
```

### 3. Route Order Matters

```typescript
// ❌ WRONG - More specific route comes AFTER general
router.get("/jobs/:id", getJob);
router.get("/jobs/featured", getFeatured); // Never reached! :id catches "featured"

// ✅ RIGHT - More specific routes FIRST
router.get("/jobs/featured", getFeatured);
router.get("/jobs/:id", getJob);
```

### 4. Use Router for Organization

```typescript
// Group related routes
const jobsRouter = Router();
jobsRouter.get("/", list);
jobsRouter.get("/:id", show);
jobsRouter.post("/", create);

// Mount with prefix
app.use("/api/v1/jobs", jobsRouter);
```

---

## 🔧 5-Minute Debugger

### Problem 1: "Cannot GET /path"

```
Error: Cannot GET /api/jobs
```

**Causes & Fixes:**

```typescript
// 1. Route not defined
// Did you add the route?
router.get("/jobs", handler); // Make sure this exists

// 2. Router not mounted
// Did you use app.use()?
app.use("/api", jobsRouter); // Don't forget this!

// 3. Wrong method
// Using POST but trying GET?
router.post("/jobs", handler); // This won't match GET requests

// 4. Typo in path
router.get("/jbos", handler); // Typo!

// Debug: Add a catch-all at the END of your routes
app.use("*", (req, res) => {
  console.log(`Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Route not found" });
});
```

### Problem 2: Route Ordering Issues

```typescript
// Symptom: /jobs/featured always returns a single job

// ❌ Problem
router.get("/jobs/:id", getJobById); // Matches first!
router.get("/jobs/featured", getFeatured); // Never reached

// ✅ Solution: Order matters!
router.get("/jobs/featured", getFeatured); // Specific routes first
router.get("/jobs/:id", getJobById); // Dynamic params last
```

### Problem 3: Parameters Not Extracted

```typescript
// Symptom: req.params.id is undefined

// Check 1: Is the colon there?
router.get('/jobs/id', ...);    // ❌ Missing colon
router.get('/jobs/:id', ...);   // ✅ Correct

// Check 2: Does the URL match?
// Route: /jobs/:id
// Request: /api/jobs/123
// Is your router mounted at /api?

// Check 3: Are you logging correctly?
router.get('/jobs/:id', (req, res) => {
  console.log('Params:', req.params);  // { id: '123' }
  console.log('ID:', req.params.id);   // '123'
});
```

---

## ✅ Definition of Done

You've completed this lesson when:

- [ ] Understand all HTTP methods and their purposes
- [ ] Can create routes with static and dynamic paths
- [ ] Know Express 5 wildcard syntax (`:name*`)
- [ ] Routes return correct HTTP status codes
- [ ] Routes are organized using Express Router
- [ ] DevJobs Pro has route stubs for all resources

### Verification Checklist

```bash
# All these should return valid JSON responses:
curl http://localhost:3000/api/v1/jobs
curl http://localhost:3000/api/v1/jobs/1
curl -X POST http://localhost:3000/api/v1/jobs -H "Content-Type: application/json" -d '{}'
curl -X PATCH http://localhost:3000/api/v1/jobs/1 -H "Content-Type: application/json" -d '{}'
curl -X DELETE http://localhost:3000/api/v1/jobs/1
```

---

## 📖 Key Takeaways

1. **Routes map URLs to handlers** - HTTP method + path + handler
2. **Use RESTful conventions** - GET=read, POST=create, PATCH=update, DELETE=delete
3. **Route params are dynamic** - `:id` captures URL segments
4. **Express 5 requires named wildcards** - Use `:path*` not `*`
5. **Route order matters** - Specific routes before dynamic ones
6. **Use Router for organization** - Group related routes together

---

**→ Next: [Lesson 03: Request Object Deep Dive](./03-request-object-deep-dive.md)** - Learn everything that comes in with a request.
