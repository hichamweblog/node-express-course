# Lesson 03: Request Object Deep Dive

## 🎯 Hook

**The Request object holds everything about the incoming request.**

When a client sends a request, Express hands you the `req` object—a treasure chest containing params, query strings, headers, body, cookies, and more. Master the request object, and you can build any API endpoint. But Express 5 changed some behaviors—like `req.params` having a null prototype and `req.body` potentially being `undefined`. Let's explore it all.

---

## 📚 Theory

### The Request Object Anatomy

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EXPRESS REQUEST OBJECT                            │
└─────────────────────────────────────────────────────────────────────┘

  HTTP Request:
  POST /api/jobs/123?status=active&sort=date HTTP/1.1
  Host: localhost:3000
  Content-Type: application/json
  Authorization: Bearer xyz123

  {"title": "Node Developer", "salary": 100000}

                          │
                          ▼

  ┌─────────────────────────────────────────────────────────────────┐
  │                        req Object                                │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                   │
  │  req.params     { id: "123" }          Route parameters          │
  │                 └── :id in /jobs/:id                             │
  │                                                                   │
  │  req.query      { status: "active",    Query string (?key=val)   │
  │                   sort: "date" }                                  │
  │                                                                   │
  │  req.body       { title: "Node Dev",   Request body (JSON/form)  │
  │                   salary: 100000 }     Requires middleware!       │
  │                                                                   │
  │  req.headers    { host: "localhost",   HTTP headers              │
  │                   content-type: "...", (lowercase keys)          │
  │                   authorization: "..."                            │
  │                 }                                                  │
  │                                                                   │
  │  req.method     "POST"                 HTTP method                │
  │  req.path       "/api/jobs/123"        URL path                   │
  │  req.originalUrl "/api/jobs/123?..."   Full URL with query       │
  │  req.baseUrl    "/api"                 Router mount point         │
  │  req.hostname   "localhost"            Host name                  │
  │  req.ip         "127.0.0.1"            Client IP                  │
  │  req.protocol   "http"                 http or https              │
  │  req.secure     false                  Is HTTPS?                  │
  │                                                                   │
  └─────────────────────────────────────────────────────────────────┘
```

### Key Request Properties

| Property      | Type   | Description               | Express 5 Changes      |
| ------------- | ------ | ------------------------- | ---------------------- |
| `req.params`  | Object | URL parameters (`:id`)    | **Null prototype**     |
| `req.query`   | Object | Query string (`?key=val`) | Same                   |
| `req.body`    | any    | Request body              | **Can be `undefined`** |
| `req.headers` | Object | HTTP headers (lowercase)  | Same                   |
| `req.method`  | string | HTTP method               | Same                   |
| `req.path`    | string | Request path              | Same                   |

### Express 5: Null Prototype `req.params`

```typescript
// Express 4
req.params.hasOwnProperty("id"); // ✅ Works

// Express 5
req.params.hasOwnProperty("id"); // ❌ TypeError!

// Why? req.params = Object.create(null) in Express 5
// It has NO prototype, so no inherited methods
```

**Solution: Use direct property access or `Object.hasOwn()`**

```typescript
// ✅ Safe in Express 5
const { id } = req.params;
if (req.params.id) { ... }
Object.hasOwn(req.params, 'id');  // ES2022
```

### Express 5: `req.body` Can Be `undefined`

```typescript
// Express 4: req.body defaults to {}
console.log(req.body); // {} - empty object

// Express 5: req.body can be undefined
console.log(req.body); // undefined - if no body parser matched
```

**Solution: Add body parsing middleware and handle undefined**

```typescript
app.use(express.json()); // Parse JSON bodies

// Safe access
const title = req.body?.title ?? "Untitled";
```

---

## 💻 Code Examples

### Example 1: Extracting Data from Different Sources

```typescript
import { Router, Request, Response } from "express";

const router = Router();

// Combined route demonstrating all request data sources
// GET /jobs/123?status=active&page=1
router.get("/:id", (req: Request, res: Response) => {
  // Route parameters - from URL pattern
  const { id } = req.params; // "123"

  // Query parameters - from ?key=value
  const { status, page } = req.query; // "active", "1"

  // Headers - HTTP headers (note: lowercase!)
  const authHeader = req.headers.authorization; // "Bearer xyz"
  const contentType = req.headers["content-type"]; // Use bracket notation for hyphens

  // Request metadata
  const method = req.method; // "GET"
  const path = req.path; // "/123" (relative to router mount)
  const fullUrl = req.originalUrl; // "/api/jobs/123?status=active&page=1"

  res.json({
    params: { id },
    query: { status, page },
    headers: {
      authorization: authHeader,
      contentType,
    },
    meta: { method, path, fullUrl },
  });
});

// POST /jobs with JSON body
router.post("/", (req: Request, res: Response) => {
  // Request body - requires express.json() middleware!
  const { title, company, salary } = req.body;

  // Validate body exists
  if (!req.body) {
    return res.status(400).json({ error: "Request body required" });
  }

  res.status(201).json({ data: { title, company, salary } });
});

export default router;
```

### Example 2: TypeScript Typing for Request Object

```typescript
import { Router, Request, Response } from "express";

// Define typed interfaces for each request part
interface JobParams {
  id: string;
}

interface JobQuery {
  status?: "active" | "closed" | "draft";
  company?: string;
  minSalary?: string;
  maxSalary?: string;
  page?: string;
  limit?: string;
}

interface CreateJobBody {
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

interface UpdateJobBody extends Partial<CreateJobBody> {}

// Response type
interface JobResponse {
  id: string;
  title: string;
  company: string;
}

const router = Router();

// Fully typed request: Request<Params, ResBody, ReqBody, Query>
router.get(
  "/",
  (
    req: Request<{}, JobResponse[], {}, JobQuery>,
    res: Response<{ data: JobResponse[] }>,
  ) => {
    // TypeScript knows:
    // - req.params is empty object
    // - req.query.status is 'active' | 'closed' | 'draft' | undefined
    // - req.body is empty

    const { status, page = "1", limit = "10" } = req.query;

    // Convert query strings to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    res.json({
      data: [{ id: "1", title: "Node Developer", company: "TechCorp" }],
    });
  },
);

// POST with typed body
router.post("/", (req: Request<{}, {}, CreateJobBody>, res: Response) => {
  // TypeScript knows req.body has title, company, etc.
  const { title, company, salary } = req.body;

  // Type checking works!
  // const badAccess = req.body.nonExistent;  // ❌ Error

  res.status(201).json({ data: { id: "123", title, company } });
});

// GET with params and body
router.get("/:id", (req: Request<JobParams>, res: Response) => {
  // TypeScript knows req.params.id is string
  const { id } = req.params;

  res.json({ data: { id } });
});

// PATCH with params and body
router.patch(
  "/:id",
  (req: Request<JobParams, {}, UpdateJobBody>, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    res.json({ data: { id, ...updates } });
  },
);

export default router;
```

### Example 3: Working with Headers

```typescript
import { Router, Request, Response } from "express";

const router = Router();

router.get("/protected", (req: Request, res: Response) => {
  // Headers are always lowercase in req.headers
  const authorization = req.headers.authorization;
  const contentType = req.headers["content-type"];
  const accept = req.headers.accept;
  const userAgent = req.headers["user-agent"];

  // Custom headers (by convention start with x-)
  const apiKey = req.headers["x-api-key"];
  const requestId = req.headers["x-request-id"];

  // Check for required header
  if (!authorization) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authorization header required",
    });
  }

  // Parse Bearer token
  if (!authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid authorization format. Expected: Bearer <token>",
    });
  }

  const token = authorization.slice(7); // Remove "Bearer "

  res.json({
    headers: {
      contentType,
      accept,
      userAgent,
      apiKey,
      requestId,
    },
    token,
  });
});

// Content negotiation with Accept header
router.get("/data", (req: Request, res: Response) => {
  const accept = req.headers.accept || "application/json";

  const data = { id: 1, name: "Test" };

  if (accept.includes("application/json")) {
    res.json(data);
  } else if (accept.includes("text/html")) {
    res.send(`<h1>${data.name}</h1>`);
  } else if (accept.includes("text/plain")) {
    res.type("text").send(`ID: ${data.id}, Name: ${data.name}`);
  } else {
    res.status(406).json({ error: "Not Acceptable" });
  }
});

export default router;
```

---

## 🛠️ Mini-Tutorial: Build Route with Params, Query, and Body

Let's build a comprehensive job search endpoint that uses all request data sources.

### Step 1: Define the Interface

```typescript
// src/types/job.types.ts
export interface JobSearchQuery {
  q?: string; // Search text
  type?: string; // full-time, part-time, etc.
  location?: string; // City or "remote"
  minSalary?: string; // Minimum salary
  maxSalary?: string; // Maximum salary
  company?: string; // Company name
  skills?: string; // Comma-separated: "node,react,typescript"
  page?: string; // Page number
  limit?: string; // Results per page
  sort?: string; // Sort field: date, salary, title
  order?: "asc" | "desc";
}

export interface JobFilterBody {
  // For advanced POST search with complex filters
  companies?: string[];
  excludeCompanies?: string[];
  skills?: {
    required: string[];
    preferred?: string[];
  };
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  postedAfter?: string; // ISO date
  postedBefore?: string;
}
```

### Step 2: Create the Search Routes

```typescript
// src/routes/jobs.routes.ts
import { Router, Request, Response } from "express";
import type { JobSearchQuery, JobFilterBody } from "../types/job.types.js";

const router = Router();

// Simulated job data
const jobs = [
  {
    id: "1",
    title: "Senior Node.js Developer",
    company: "TechCorp",
    type: "full-time",
    location: "San Francisco",
    salary: { min: 120000, max: 180000, currency: "USD" },
    skills: ["node", "typescript", "postgresql"],
    postedAt: "2026-01-15",
  },
  {
    id: "2",
    title: "React Engineer",
    company: "StartupXYZ",
    type: "remote",
    location: "Remote",
    salary: { min: 100000, max: 150000, currency: "USD" },
    skills: ["react", "typescript", "graphql"],
    postedAt: "2026-01-20",
  },
];

// GET /jobs - Simple search with query params
router.get("/", (req: Request<{}, {}, {}, JobSearchQuery>, res: Response) => {
  let results = [...jobs];

  const {
    q,
    type,
    location,
    minSalary,
    maxSalary,
    skills,
    page = "1",
    limit = "10",
    sort = "postedAt",
    order = "desc",
  } = req.query;

  // Text search
  if (q) {
    const searchTerm = q.toLowerCase();
    results = results.filter(
      (job) =>
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm),
    );
  }

  // Filter by type
  if (type) {
    results = results.filter((job) => job.type === type);
  }

  // Filter by location
  if (location) {
    const loc = location.toLowerCase();
    results = results.filter((job) => job.location.toLowerCase().includes(loc));
  }

  // Filter by salary range
  if (minSalary) {
    const min = parseInt(minSalary, 10);
    results = results.filter((job) => job.salary.min >= min);
  }

  if (maxSalary) {
    const max = parseInt(maxSalary, 10);
    results = results.filter((job) => job.salary.max <= max);
  }

  // Filter by skills (comma-separated)
  if (skills) {
    const requiredSkills = skills.split(",").map((s) => s.trim().toLowerCase());
    results = results.filter((job) =>
      requiredSkills.some((skill) => job.skills.includes(skill)),
    );
  }

  // Sorting
  results.sort((a, b) => {
    let comparison = 0;
    if (sort === "salary") {
      comparison = a.salary.min - b.salary.min;
    } else if (sort === "title") {
      comparison = a.title.localeCompare(b.title);
    } else {
      comparison =
        new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime();
    }
    return order === "desc" ? -comparison : comparison;
  });

  // Pagination
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedResults = results.slice(startIndex, startIndex + limitNum);

  res.json({
    data: paginatedResults,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: results.length,
      totalPages: Math.ceil(results.length / limitNum),
    },
    filters: { q, type, location, minSalary, maxSalary, skills },
    sort: { field: sort, order },
  });
});

// POST /jobs/search - Advanced search with body
router.post(
  "/search",
  (req: Request<{}, {}, JobFilterBody, JobSearchQuery>, res: Response) => {
    // Get basic filters from query string
    const { page = "1", limit = "10", sort, order } = req.query;

    // Get advanced filters from body
    const {
      companies,
      excludeCompanies,
      skills,
      salary,
      postedAfter,
      postedBefore,
    } = req.body ?? {};

    let results = [...jobs];

    // Filter by specific companies
    if (companies && companies.length > 0) {
      const companyList = companies.map((c) => c.toLowerCase());
      results = results.filter((job) =>
        companyList.includes(job.company.toLowerCase()),
      );
    }

    // Exclude companies
    if (excludeCompanies && excludeCompanies.length > 0) {
      const excludeList = excludeCompanies.map((c) => c.toLowerCase());
      results = results.filter(
        (job) => !excludeList.includes(job.company.toLowerCase()),
      );
    }

    // Filter by required skills
    if (skills?.required && skills.required.length > 0) {
      const requiredSkills = skills.required.map((s) => s.toLowerCase());
      results = results.filter((job) =>
        requiredSkills.every((skill) => job.skills.includes(skill)),
      );
    }

    // Filter by salary
    if (salary?.min) {
      results = results.filter((job) => job.salary.min >= salary.min!);
    }
    if (salary?.max) {
      results = results.filter((job) => job.salary.max <= salary.max!);
    }

    // Date filters
    if (postedAfter) {
      const afterDate = new Date(postedAfter);
      results = results.filter((job) => new Date(job.postedAt) >= afterDate);
    }
    if (postedBefore) {
      const beforeDate = new Date(postedBefore);
      results = results.filter((job) => new Date(job.postedAt) <= beforeDate);
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const paginatedResults = results.slice(
      (pageNum - 1) * limitNum,
      pageNum * limitNum,
    );

    res.json({
      data: paginatedResults,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: results.length,
      },
      appliedFilters: {
        query: { page, limit, sort, order },
        body: { companies, excludeCompanies, skills, salary },
      },
    });
  },
);

// GET /jobs/:id - Single job with params
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

export default router;
```

### Step 3: Test the Endpoints

```bash
# Simple search with query params
curl "http://localhost:3000/api/v1/jobs?type=remote&skills=react,typescript"

# Advanced search with POST body
curl -X POST http://localhost:3000/api/v1/jobs/search \
  -H "Content-Type: application/json" \
  -d '{
    "companies": ["TechCorp", "StartupXYZ"],
    "skills": {
      "required": ["typescript"]
    },
    "salary": {
      "min": 100000
    }
  }'
```

---

## 🏋️ Practice Exercise: Type-Safe Request Handlers for DevJobs Pro

Create type-safe request handlers for the job creation endpoint.

### Requirements

1. Create interfaces for:
   - `CreateJobParams` (none for creation)
   - `CreateJobBody` with full validation types
   - `CreateJobResponse` with the created job

2. Implement the POST /jobs endpoint with:
   - Full TypeScript typing
   - Body validation (required fields check)
   - Proper error responses

### Expected Code Structure

```typescript
// src/types/job.types.ts
export interface CreateJobBody {
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "remote";
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  responsibilities?: string[];
  benefits?: string[];
}

// Define what a successfully created job looks like
export interface JobDocument extends CreateJobBody {
  id: string;
  slug: string;
  status: "active" | "closed" | "draft";
  views: number;
  applications: number;
  createdAt: string;
  updatedAt: string;
}
```

---

## 💡 Pro Tips

### 1. Express 5 Null Prototype Params

```typescript
// ❌ Won't work in Express 5
if (req.params.hasOwnProperty("id")) {
}

// ✅ Works everywhere
if ("id" in req.params) {
}
if (Object.hasOwn(req.params, "id")) {
} // ES2022
if (req.params.id !== undefined) {
}

// Why? Object.create(null) has no prototype
const params = Object.create(null);
params.id = "123";
params.hasOwnProperty; // undefined!
```

### 2. Always Use Optional Chaining for Body

```typescript
// ❌ Risky - body might be undefined in Express 5
const title = req.body.title;

// ✅ Safe
const title = req.body?.title;
const title = req.body?.title ?? "Default";
```

### 3. Query Params Are Always Strings

```typescript
// Query: ?page=1&enabled=true
req.query.page; // "1" (string, not number!)
req.query.enabled; // "true" (string, not boolean!)

// Convert properly
const page = parseInt(req.query.page as string, 10) || 1;
const enabled = req.query.enabled === "true";
```

### 4. Use req.get() for Headers

```typescript
// Both work, but req.get() is cleaner
req.headers["content-type"]; // Works
req.get("Content-Type"); // Also works, case-insensitive
```

---

## 🔧 5-Minute Debugger

### Problem 1: "req.body is undefined"

```typescript
// Symptom
app.post("/jobs", (req, res) => {
  console.log(req.body); // undefined
});
```

**Fixes:**

```typescript
// 1. Add body parsing middleware BEFORE routes
app.use(express.json()); // For JSON
app.use(express.urlencoded({ extended: true })); // For forms

// 2. Check Content-Type header in request
// Must be "application/json" for express.json() to parse

// 3. Express 5 specific: body can actually be undefined
// Use optional chaining
const title = req.body?.title;
```

### Problem 2: req.params vs req.query Confusion

```typescript
// Route: GET /jobs/:id?status=active

// URL: /jobs/123?status=active
req.params.id; // "123" - from route pattern
req.query.status; // "active" - from query string

// Common mistake: using wrong one
req.params.status; // undefined!
req.query.id; // undefined!
```

### Problem 3: Headers Not Found

```typescript
// ❌ Wrong - headers are lowercase in Express
req.headers["Content-Type"]; // undefined
req.headers["Authorization"]; // undefined

// ✅ Correct - use lowercase
req.headers["content-type"]; // "application/json"
req.headers["authorization"]; // "Bearer xyz"

// Or use req.get() which is case-insensitive
req.get("Content-Type"); // "application/json"
```

---

## ✅ Definition of Done

You've completed this lesson when:

- [ ] Understand all parts of the request object
- [ ] Know Express 5 null prototype params behavior
- [ ] Handle req.body being undefined in Express 5
- [ ] Can type request handlers with TypeScript generics
- [ ] Extract data from params, query, body, and headers
- [ ] Created type-safe handlers for DevJobs Pro

### Verification Test

Create a route that logs all request data:

```typescript
router.all("/debug", (req, res) => {
  res.json({
    method: req.method,
    path: req.path,
    params: { ...req.params }, // Spread to handle null prototype
    query: req.query,
    body: req.body,
    headers: {
      contentType: req.get("Content-Type"),
      authorization: req.get("Authorization"),
    },
  });
});
```

---

## 📖 Key Takeaways

1. **req.params** - Route parameters (`:id` → `req.params.id`)
2. **req.query** - Query string (`?key=val` → `req.query.key`)
3. **req.body** - Request body (needs middleware, can be undefined in Express 5)
4. **req.headers** - HTTP headers (always lowercase keys)
5. **Express 5 changes** - Null prototype params, undefined body
6. **Always type your requests** - Use `Request<Params, ResBody, ReqBody, Query>`

---

**→ Next: [Lesson 04: Response Object Methods](./04-response-object-methods.md)** - Learn how to send responses back to clients.
