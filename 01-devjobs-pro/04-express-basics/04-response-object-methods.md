# Lesson 04: Response Object Methods

## 🎯 Hook

**The Response object is how you talk back to the client.**

Every Express handler ends the same way—sending a response. JSON API data? `res.json()`. Redirect to login? `res.redirect()`. Error message? `res.status(401).json()`. Master the response object, and you control exactly what your users see. Express 5 even made `res.render()` async—let's explore the full response toolkit.

---

## 📚 Theory

### The Response Object Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EXPRESS RESPONSE WORKFLOW                         │
└─────────────────────────────────────────────────────────────────────┘

  Route Handler begins...
         │
         ▼
  ┌─────────────────────────────────────────┐
  │          BUILD THE RESPONSE              │
  │                                          │
  │  ┌───────────────────────────────────┐  │
  │  │  1. Set Status Code               │  │
  │  │     res.status(200)               │  │
  │  │     res.status(201)               │  │
  │  │     res.status(404)               │  │
  │  └───────────────────────────────────┘  │
  │                  │                       │
  │                  ▼                       │
  │  ┌───────────────────────────────────┐  │
  │  │  2. Set Headers (optional)        │  │
  │  │     res.set('X-Custom', 'value')  │  │
  │  │     res.type('json')              │  │
  │  └───────────────────────────────────┘  │
  │                  │                       │
  │                  ▼                       │
  │  ┌───────────────────────────────────┐  │
  │  │  3. Send Body                     │  │
  │  │     res.json({ data })            │  │
  │  │     res.send('text')              │  │
  │  │     res.sendFile('/path')         │  │
  │  │     res.redirect('/url')          │  │
  │  └───────────────────────────────────┘  │
  │                                          │
  └─────────────────────────────────────────┘
         │
         ▼
  ┌─────────────────────────────────────────┐
  │  RESPONSE SENT TO CLIENT                │
  │  (Cannot modify after this!)            │
  └─────────────────────────────────────────┘
```

### Key Response Methods

| Method           | Purpose          | Sets Content-Type  | Example                     |
| ---------------- | ---------------- | ------------------ | --------------------------- |
| `res.json()`     | Send JSON data   | `application/json` | `res.json({ user })`        |
| `res.send()`     | Send any data    | Auto-detected      | `res.send('Hello')`         |
| `res.status()`   | Set HTTP status  | —                  | `res.status(404)`           |
| `res.redirect()` | Redirect client  | —                  | `res.redirect('/login')`    |
| `res.render()`   | Render template  | `text/html`        | `res.render('index')`       |
| `res.sendFile()` | Send file        | Based on extension | `res.sendFile('/path')`     |
| `res.download()` | Prompt download  | Based on extension | `res.download('/file')`     |
| `res.set()`      | Set header       | —                  | `res.set('X-Key', 'val')`   |
| `res.type()`     | Set Content-Type | Specified type     | `res.type('json')`          |
| `res.cookie()`   | Set cookie       | —                  | `res.cookie('name', 'val')` |

### HTTP Status Codes Reference

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HTTP STATUS CODE FAMILIES                         │
└─────────────────────────────────────────────────────────────────────┘

  2xx SUCCESS
  ├── 200 OK                    Standard success
  ├── 201 Created               Resource created (POST)
  └── 204 No Content            Success, no body (DELETE)

  3xx REDIRECTION
  ├── 301 Moved Permanently     Resource permanently moved
  ├── 302 Found                 Temporary redirect
  └── 304 Not Modified          Cached version is current

  4xx CLIENT ERRORS
  ├── 400 Bad Request           Invalid input/validation failed
  ├── 401 Unauthorized          Not authenticated
  ├── 403 Forbidden             Authenticated but not allowed
  ├── 404 Not Found             Resource doesn't exist
  ├── 409 Conflict              Duplicate resource
  ├── 422 Unprocessable Entity  Validation failed (alternative to 400)
  └── 429 Too Many Requests     Rate limited

  5xx SERVER ERRORS
  ├── 500 Internal Server Error Server crashed
  ├── 502 Bad Gateway           Upstream server failed
  └── 503 Service Unavailable   Server overloaded/maintenance
```

### Express 5: Async `res.render()`

```typescript
// Express 4 - callback-based
res.render("page", { data }, (err, html) => {
  if (err) return next(err);
  res.send(html);
});

// Express 5 - returns Promise! 🎉
try {
  const html = await res.render("page", { data });
  // Can manipulate html before sending
  res.send(html);
} catch (err) {
  // Handle render error
}

// Or let Express handle it automatically
res.render("page", { data }); // Still works (sends automatically)
```

---

## 💻 Code Examples

### Example 1: Different Response Types

```typescript
import { Router, Request, Response } from "express";
import path from "path";

const router = Router();

// JSON response (most common for APIs)
router.get("/json", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: { id: 1, name: "John Doe" },
    timestamp: new Date().toISOString(),
  });
});

// Text response
router.get("/text", (req: Request, res: Response) => {
  res.type("text").send("Plain text response");
});

// HTML response
router.get("/html", (req: Request, res: Response) => {
  res.type("html").send(`
    <!DOCTYPE html>
    <html>
      <head><title>Response</title></head>
      <body><h1>Hello from Express!</h1></body>
    </html>
  `);
});

// File download
router.get("/download", (req: Request, res: Response) => {
  const filePath = path.join(__dirname, "../assets/report.pdf");
  res.download(filePath, "monthly-report.pdf", (err) => {
    if (err) {
      // Handle error (file not found, etc.)
      res.status(404).json({ error: "File not found" });
    }
  });
});

// Redirect
router.get("/old-path", (req: Request, res: Response) => {
  res.redirect(301, "/new-path"); // Permanent redirect
});

router.get("/login-required", (req: Request, res: Response) => {
  res.redirect("/auth/login"); // Default 302 temporary redirect
});

// Send file without download prompt
router.get("/image", (req: Request, res: Response) => {
  const imagePath = path.join(__dirname, "../assets/logo.png");
  res.sendFile(imagePath);
});

export default router;
```

### Example 2: Proper Status Code Usage

```typescript
import { Router, Request, Response } from "express";

const router = Router();

// Mock database
const jobs: Map<string, any> = new Map();
jobs.set("1", { id: "1", title: "Node Developer" });

// 200 OK - Standard success for GET
router.get("/jobs/:id", (req: Request, res: Response) => {
  const job = jobs.get(req.params.id);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: `Job ${req.params.id} not found`,
    });
  }

  res.status(200).json({
    success: true,
    data: job,
  });
});

// 201 Created - After successful POST
router.post("/jobs", (req: Request, res: Response) => {
  const { title, company } = req.body;

  // Validation - 400 Bad Request
  if (!title || !company) {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      message: "Title and company are required",
      fields: {
        title: !title ? "Required" : null,
        company: !company ? "Required" : null,
      },
    });
  }

  const newJob = {
    id: String(Date.now()),
    title,
    company,
    createdAt: new Date(),
  };

  jobs.set(newJob.id, newJob);

  // 201 Created with Location header
  res.status(201).set("Location", `/api/v1/jobs/${newJob.id}`).json({
    success: true,
    data: newJob,
  });
});

// 204 No Content - After DELETE
router.delete("/jobs/:id", (req: Request, res: Response) => {
  const exists = jobs.has(req.params.id);

  if (!exists) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
    });
  }

  jobs.delete(req.params.id);

  // 204 - no body sent
  res.status(204).send();
});

// 409 Conflict - Duplicate resource
router.post("/users", (req: Request, res: Response) => {
  const { email } = req.body;
  const emailExists = true; // Simulated check

  if (emailExists) {
    return res.status(409).json({
      success: false,
      error: "Conflict",
      message: "A user with this email already exists",
    });
  }

  res.status(201).json({ success: true });
});

// 401 vs 403
router.get("/admin", (req: Request, res: Response) => {
  const isAuthenticated = req.headers.authorization;
  const isAdmin = false; // Check user role

  // 401 - Not logged in at all
  if (!isAuthenticated) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: "Authentication required",
    });
  }

  // 403 - Logged in but not allowed
  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      error: "Forbidden",
      message: "Admin access required",
    });
  }

  res.json({ success: true, data: "Admin data" });
});

export default router;
```

### Example 3: Response Headers

```typescript
import { Router, Request, Response } from "express";

const router = Router();

// Set custom headers
router.get("/with-headers", (req: Request, res: Response) => {
  res
    .set("X-Request-Id", crypto.randomUUID())
    .set("X-Response-Time", "42ms")
    .set("Cache-Control", "no-cache")
    .json({ data: "with custom headers" });
});

// Set multiple headers at once
router.get("/bulk-headers", (req: Request, res: Response) => {
  res.set({
    "X-Custom-Header": "value1",
    "X-Another-Header": "value2",
    "X-API-Version": "1.0.0",
  });
  res.json({ data: "with bulk headers" });
});

// CORS headers (usually use cors middleware, but for learning)
router.get("/cors-example", (req: Request, res: Response) => {
  res
    .set("Access-Control-Allow-Origin", "*")
    .set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
    .set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    .json({ data: "cors enabled" });
});

// Cache control
router.get("/cached", (req: Request, res: Response) => {
  res
    .set("Cache-Control", "public, max-age=3600") // Cache for 1 hour
    .set("ETag", "abc123")
    .json({ data: "cacheable response" });
});

// No cache
router.get("/no-cache", (req: Request, res: Response) => {
  res
    .set("Cache-Control", "no-store, no-cache, must-revalidate")
    .set("Pragma", "no-cache")
    .set("Expires", "0")
    .json({ data: "never cache this", timestamp: Date.now() });
});

export default router;
```

---

## 🛠️ Mini-Tutorial: Create Consistent API Response Helper

Let's build a production-ready API response utility for DevJobs Pro.

### Step 1: Define Response Types

```typescript
// src/types/response.types.ts

// Success response structure
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  links?: {
    self?: string;
    next?: string;
    prev?: string;
  };
}

// Error response structure
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
    stack?: string;
  };
}

// Pagination params
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

// Union type
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
```

### Step 2: Create the ApiResponse Class

```typescript
// src/utils/ApiResponse.ts
import { Response } from "express";
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  PaginationMeta,
} from "../types/response.types.js";

export class ApiResponse {
  private res: Response;

  constructor(res: Response) {
    this.res = res;
  }

  /**
   * Send a successful response
   */
  success<T>(data: T, statusCode: number = 200): void {
    const response: ApiSuccessResponse<T> = {
      success: true,
      data,
    };

    this.res.status(statusCode).json(response);
  }

  /**
   * Send a created response (201)
   */
  created<T>(data: T, location?: string): void {
    if (location) {
      this.res.set("Location", location);
    }

    const response: ApiSuccessResponse<T> = {
      success: true,
      data,
    };

    this.res.status(201).json(response);
  }

  /**
   * Send a paginated response
   */
  paginated<T>(data: T[], pagination: PaginationMeta, baseUrl: string): void {
    const { page, limit, total } = pagination;
    const totalPages = Math.ceil(total / limit);

    const response: ApiSuccessResponse<T[]> = {
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
      links: {
        self: `${baseUrl}?page=${page}&limit=${limit}`,
        next:
          page < totalPages
            ? `${baseUrl}?page=${page + 1}&limit=${limit}`
            : undefined,
        prev:
          page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : undefined,
      },
    };

    this.res.status(200).json(response);
  }

  /**
   * Send error response
   */
  error(
    code: string,
    message: string,
    statusCode: number = 400,
    details?: Record<string, string>,
  ): void {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message,
        details,
      },
    };

    this.res.status(statusCode).json(response);
  }

  /**
   * Common error shortcuts
   */
  badRequest(message: string, details?: Record<string, string>): void {
    this.error("BAD_REQUEST", message, 400, details);
  }

  unauthorized(message: string = "Authentication required"): void {
    this.error("UNAUTHORIZED", message, 401);
  }

  forbidden(message: string = "Access denied"): void {
    this.error("FORBIDDEN", message, 403);
  }

  notFound(resource: string = "Resource"): void {
    this.error("NOT_FOUND", `${resource} not found`, 404);
  }

  conflict(message: string): void {
    this.error("CONFLICT", message, 409);
  }

  serverError(message: string = "Internal server error"): void {
    this.error("INTERNAL_ERROR", message, 500);
  }

  /**
   * No content response (204)
   */
  noContent(): void {
    this.res.status(204).send();
  }
}

// Factory function for cleaner usage
export function apiResponse(res: Response): ApiResponse {
  return new ApiResponse(res);
}
```

### Step 3: Use in Route Handlers

```typescript
// src/routes/jobs.routes.ts
import { Router, Request, Response } from "express";
import { apiResponse } from "../utils/ApiResponse.js";

const router = Router();

interface Job {
  id: string;
  title: string;
  company: string;
}

// Mock data
const jobs: Job[] = [
  { id: "1", title: "Node Developer", company: "TechCorp" },
  { id: "2", title: "React Engineer", company: "StartupXYZ" },
];

// GET /jobs - Paginated list
router.get("/", (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const startIndex = (page - 1) * limit;
  const paginatedJobs = jobs.slice(startIndex, startIndex + limit);

  apiResponse(res).paginated(
    paginatedJobs,
    { page, limit, total: jobs.length },
    "/api/v1/jobs",
  );
});

// GET /jobs/:id - Single job
router.get("/:id", (req: Request, res: Response) => {
  const job = jobs.find((j) => j.id === req.params.id);

  if (!job) {
    return apiResponse(res).notFound("Job");
  }

  apiResponse(res).success(job);
});

// POST /jobs - Create job
router.post("/", (req: Request, res: Response) => {
  const { title, company } = req.body ?? {};

  // Validation
  const errors: Record<string, string> = {};
  if (!title) errors.title = "Title is required";
  if (!company) errors.company = "Company is required";

  if (Object.keys(errors).length > 0) {
    return apiResponse(res).badRequest("Validation failed", errors);
  }

  const newJob: Job = {
    id: String(Date.now()),
    title,
    company,
  };

  jobs.push(newJob);

  apiResponse(res).created(newJob, `/api/v1/jobs/${newJob.id}`);
});

// DELETE /jobs/:id - Delete job
router.delete("/:id", (req: Request, res: Response) => {
  const index = jobs.findIndex((j) => j.id === req.params.id);

  if (index === -1) {
    return apiResponse(res).notFound("Job");
  }

  jobs.splice(index, 1);
  apiResponse(res).noContent();
});

export default router;
```

### Step 4: Example API Responses

```json
// Success: GET /api/v1/jobs/1
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Node Developer",
    "company": "TechCorp"
  }
}

// Paginated: GET /api/v1/jobs?page=1&limit=10
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  },
  "links": {
    "self": "/api/v1/jobs?page=1&limit=10",
    "next": "/api/v1/jobs?page=2&limit=10",
    "prev": null
  }
}

// Error: POST /api/v1/jobs (missing fields)
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation failed",
    "details": {
      "title": "Title is required",
      "company": "Company is required"
    }
  }
}

// Error: GET /api/v1/jobs/999
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Job not found"
  }
}
```

---

## 🏋️ Practice Exercise: DevJobs Pro Response Utilities

Enhance the ApiResponse class for DevJobs Pro.

### Requirements

1. Add these methods to ApiResponse:
   - `validationError(errors: ValidationError[])` - for form validation
   - `rateLimited(retryAfter: number)` - 429 with Retry-After header
   - `serviceUnavailable(message?: string)` - 503 status

2. Create a typed response for job applications:

   ```typescript
   interface ApplicationResponse {
     id: string;
     jobId: string;
     userId: string;
     status: "pending" | "reviewed" | "accepted" | "rejected";
     appliedAt: string;
   }
   ```

3. Use the response helper in an application submission route

### Bonus Challenge

Create a response timing middleware that adds `X-Response-Time` header:

```typescript
// Middleware that tracks response time
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    // How do you set the header before it's sent?
    // Hint: Use res.set() before the route handler finishes
  });

  next();
});
```

---

## 💡 Pro Tips

### 1. Use Method Chaining

```typescript
// ❌ Verbose
res.status(201);
res.set("Location", "/api/v1/jobs/123");
res.json({ data: newJob });

// ✅ Clean chaining
res.status(201).set("Location", "/api/v1/jobs/123").json({ data: newJob });
```

### 2. Always Return After Sending

```typescript
// ❌ BUG - continues executing after res.json()
router.get("/job/:id", (req, res) => {
  if (!job) {
    res.status(404).json({ error: "Not found" });
    // Code below still runs!
  }
  res.json(job); // Error: headers already sent
});

// ✅ Return to stop execution
router.get("/job/:id", (req, res) => {
  if (!job) {
    return res.status(404).json({ error: "Not found" });
  }
  res.json(job);
});
```

### 3. Consistent Response Format

```typescript
// ❌ Inconsistent - hard for clients to parse
res.json({ user: {...} });           // Endpoint A
res.json({ data: {...} });           // Endpoint B
res.json([...]);                      // Endpoint C
res.json({ result: {...} });         // Endpoint D

// ✅ Consistent - always same structure
res.json({ success: true, data: {...} });
res.json({ success: true, data: [...] });
res.json({ success: false, error: {...} });
```

### 4. Use Proper JSON Method

```typescript
// res.send() vs res.json()
res.send({ data: "hello" }); // Works, but...
res.json({ data: "hello" }); // Better! Sets Content-Type: application/json

// res.json() also:
// - Escapes characters properly
// - Handles circular references better
// - More explicit intent
```

---

## 🔧 5-Minute Debugger

### Problem 1: "Cannot set headers after they are sent"

```
Error: Cannot set headers after they are sent to the client
```

**Cause:** Trying to send multiple responses

```typescript
// ❌ Problem - two responses
router.get("/data", (req, res) => {
  if (error) {
    res.status(500).json({ error });
    // Missing return!
  }
  res.json({ data }); // Tries to send again
});

// ✅ Solution - return after first response
router.get("/data", (req, res) => {
  if (error) {
    return res.status(500).json({ error });
  }
  res.json({ data });
});
```

### Problem 2: Forgetting Return After Response

```typescript
// ❌ Middleware continues even after response
function authMiddleware(req, res, next) {
  if (!req.headers.authorization) {
    res.status(401).json({ error: "Unauthorized" });
    // Missing return! next() or route handler still runs
  }
  next();
}

// ✅ Return to stop middleware chain
function authMiddleware(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
```

### Problem 3: Empty Response Body

```typescript
// Symptom: Client gets empty response

// Check 1: Did you forget to call a response method?
router.get("/data", (req, res) => {
  const data = getData();
  // Forgot res.json(data)!
});

// Check 2: Status 204 sends no body
res.status(204).json({ data }); // Body ignored!
res.status(204).send(); // Correct for 204

// Check 3: Is the handler async and missing await?
router.get("/data", async (req, res) => {
  const data = await getData(); // Don't forget await!
  res.json(data);
});
```

---

## ✅ Definition of Done

You've completed this lesson when:

- [ ] Understand all response methods (json, send, status, redirect)
- [ ] Use correct HTTP status codes consistently
- [ ] Can set custom response headers
- [ ] Created ApiResponse utility class for DevJobs Pro
- [ ] Always return after sending a response
- [ ] Response format is consistent across all endpoints

### Verification Test

Test these scenarios:

```bash
# 200 - Success
curl http://localhost:3000/api/v1/jobs
# { "success": true, "data": [...] }

# 201 - Created
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "company": "Test"}'
# { "success": true, "data": { "id": "...", ... } }

# 400 - Bad Request
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{}'
# { "success": false, "error": { "code": "BAD_REQUEST", ... } }

# 404 - Not Found
curl http://localhost:3000/api/v1/jobs/nonexistent
# { "success": false, "error": { "code": "NOT_FOUND", ... } }

# 204 - No Content
curl -X DELETE http://localhost:3000/api/v1/jobs/1 -v
# HTTP/1.1 204 No Content (empty body)
```

---

## 📖 Key Takeaways

1. **res.json() for APIs** - Sets Content-Type and properly formats JSON
2. **Status codes matter** - 200/201/204/400/401/403/404/500
3. **Method chaining** - `res.status(201).json(data)` is clean
4. **Always return after res** - Prevents "headers already sent" errors
5. **Consistent response format** - Use `{ success, data }` or `{ success, error }`
6. **Express 5 res.render()** - Now returns a Promise

---

## 🎉 Module 04 Complete!

You've learned the fundamentals of Express 5:

- ✅ **Lesson 01**: Installation, setup, project structure
- ✅ **Lesson 02**: Routing, HTTP methods, route parameters
- ✅ **Lesson 03**: Request object, params, query, body, headers
- ✅ **Lesson 04**: Response methods, status codes, consistent API responses

### DevJobs Pro Progress

You now have:

- Express 5 TypeScript project structure
- Route files for all resources
- Type-safe request handlers
- Consistent API response utilities

---

**→ Next: Module 05 (Middleware)** - Learn the powerful middleware pattern that makes Express so flexible.
