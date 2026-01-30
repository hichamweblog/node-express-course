# Lesson 4: The HTTP Module—Raw Server

## 🎯 Hook: Before Express, There Was http

Express makes building web servers feel effortless—`app.get('/users', handler)` and you're done. But what's actually happening underneath? Understanding Node.js's raw `http` module is like understanding how a car engine works before driving—you don't need it daily, but when something breaks, this knowledge saves you.

In this lesson, you'll build HTTP servers from scratch. Every strange Express error you'll encounter in DevJobs Pro—"Cannot set headers after they're sent," "socket hang up"—will suddenly make sense.

---

## 📚 Theory: HTTP Fundamentals

### The HTTP Protocol (60 Seconds)

HTTP (HyperText Transfer Protocol) is a request-response protocol:

1. **Client** sends a REQUEST (method, path, headers, body)
2. **Server** processes and sends a RESPONSE (status, headers, body)
3. Connection closes (HTTP/1.1 can keep-alive)

```
┌─────────────────────────────────────────────────────────────────────┐
│                      HTTP REQUEST/RESPONSE CYCLE                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   CLIENT (Browser/App)                      SERVER (Node.js)        │
│                                                                      │
│   ┌───────────────────┐                    ┌───────────────────┐    │
│   │   HTTP REQUEST    │                    │   HTTP RESPONSE   │    │
│   │                   │    ──────────►     │                   │    │
│   │ GET /api/jobs     │                    │ HTTP/1.1 200 OK   │    │
│   │ Host: devjobs.com │                    │ Content-Type: json│    │
│   │ Authorization: ...│                    │                   │    │
│   │                   │    ◄──────────     │ {"jobs": [...]}   │    │
│   └───────────────────┘                    └───────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### HTTP Request Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                        HTTP REQUEST                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   REQUEST LINE:      POST /api/jobs HTTP/1.1                        │
│   ├── Method:        POST (GET, PUT, PATCH, DELETE, etc.)           │
│   ├── Path:          /api/jobs                                      │
│   └── HTTP Version:  HTTP/1.1                                       │
│                                                                      │
│   HEADERS:                                                          │
│   ├── Host: devjobs-pro.com                                         │
│   ├── Content-Type: application/json                                │
│   ├── Authorization: Bearer eyJhbGc...                              │
│   ├── Accept: application/json                                      │
│   └── Content-Length: 156                                           │
│                                                                      │
│   BODY (for POST, PUT, PATCH):                                      │
│   {                                                                 │
│     "title": "Backend Engineer",                                    │
│     "company": "TechCorp",                                          │
│     "salary": { "min": 100000, "max": 150000 }                      │
│   }                                                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### HTTP Response Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                        HTTP RESPONSE                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   STATUS LINE:       HTTP/1.1 201 Created                           │
│   ├── HTTP Version:  HTTP/1.1                                       │
│   ├── Status Code:   201                                            │
│   └── Status Text:   Created                                        │
│                                                                      │
│   HEADERS:                                                          │
│   ├── Content-Type: application/json                                │
│   ├── Location: /api/jobs/job-12345                                 │
│   ├── X-Request-Id: abc-123-def                                     │
│   └── Content-Length: 234                                           │
│                                                                      │
│   BODY:                                                             │
│   {                                                                 │
│     "id": "job-12345",                                              │
│     "title": "Backend Engineer",                                    │
│     "status": "created"                                             │
│   }                                                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### HTTP Status Codes Quick Reference

| Code    | Category     | Meaning             | When to Use                          |
| ------- | ------------ | ------------------- | ------------------------------------ |
| **200** | Success      | OK                  | Successful GET, PUT                  |
| **201** | Success      | Created             | Successful POST (resource created)   |
| **204** | Success      | No Content          | Successful DELETE                    |
| **400** | Client Error | Bad Request         | Invalid input, validation failed     |
| **401** | Client Error | Unauthorized        | Missing/invalid authentication       |
| **403** | Client Error | Forbidden           | Authenticated but not allowed        |
| **404** | Client Error | Not Found           | Resource doesn't exist               |
| **409** | Client Error | Conflict            | Duplicate resource, version conflict |
| **422** | Client Error | Unprocessable       | Valid syntax, invalid semantics      |
| **500** | Server Error | Internal Error      | Unexpected server error              |
| **503** | Server Error | Service Unavailable | Server overloaded, maintenance       |

### Node.js HTTP Server Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                 RAW HTTP SERVER REQUEST LIFECYCLE                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. SERVER LISTENS                                                  │
│     ┌─────────────────────────────────────────────────────────────┐ │
│     │ const server = http.createServer(requestHandler);           │ │
│     │ server.listen(3000);                                        │ │
│     │                                                             │ │
│     │ // Server now listening on port 3000                        │ │
│     └─────────────────────────────────────────────────────────────┘ │
│                              │                                       │
│                              ▼                                       │
│  2. REQUEST ARRIVES                                                 │
│     ┌─────────────────────────────────────────────────────────────┐ │
│     │ // Each request triggers the handler                        │ │
│     │ function requestHandler(req, res) {                         │ │
│     │   // req = IncomingMessage (readable stream)                │ │
│     │   // res = ServerResponse (writable stream)                 │ │
│     │ }                                                           │ │
│     └─────────────────────────────────────────────────────────────┘ │
│                              │                                       │
│                              ▼                                       │
│  3. READ REQUEST DATA                                               │
│     ┌─────────────────────────────────────────────────────────────┐ │
│     │ // Request body comes in chunks (streams!)                  │ │
│     │ let body = '';                                              │ │
│     │ req.on('data', chunk => body += chunk);                     │ │
│     │ req.on('end', () => {                                       │ │
│     │   // Full body received, now process                        │ │
│     │ });                                                         │ │
│     └─────────────────────────────────────────────────────────────┘ │
│                              │                                       │
│                              ▼                                       │
│  4. PROCESS & RESPOND                                               │
│     ┌─────────────────────────────────────────────────────────────┐ │
│     │ // Set status code                                          │ │
│     │ res.statusCode = 200;                                       │ │
│     │                                                             │ │
│     │ // Set headers (must be before body!)                       │ │
│     │ res.setHeader('Content-Type', 'application/json');          │ │
│     │                                                             │ │
│     │ // Write body and END response                              │ │
│     │ res.end(JSON.stringify({ success: true }));                 │ │
│     │                                                             │ │
│     │ // ⚠️ MUST call res.end() or connection hangs!              │ │
│     └─────────────────────────────────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Request Object (IncomingMessage) Properties

| Property          | Type   | Description                      |
| ----------------- | ------ | -------------------------------- |
| `req.method`      | string | HTTP method (GET, POST, etc.)    |
| `req.url`         | string | Request URL path + query string  |
| `req.headers`     | object | Request headers (lowercase keys) |
| `req.httpVersion` | string | HTTP version (1.0, 1.1, 2.0)     |
| `req.socket`      | Socket | Underlying network socket        |

### Response Object (ServerResponse) Methods

| Method                           | Description                                |
| -------------------------------- | ------------------------------------------ |
| `res.statusCode = 200`           | Set status code                            |
| `res.setHeader(name, value)`     | Set a header                               |
| `res.writeHead(status, headers)` | Set status + multiple headers              |
| `res.write(chunk)`               | Write body chunk (can call multiple times) |
| `res.end([data])`                | **End response** (required!)               |
| `res.getHeader(name)`            | Get a set header                           |
| `res.hasHeader(name)`            | Check if header is set                     |

---

## 💻 Code Examples

### Example 1: Minimal HTTP Server

**JavaScript:**

```javascript
// minimal-server.js
import { createServer } from "node:http";

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Hello, World!\n");
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});
```

**TypeScript:**

```typescript
// minimal-server.ts
import { createServer, IncomingMessage, ServerResponse } from "node:http";

const server = createServer(
  (req: IncomingMessage, res: ServerResponse): void => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello, World!\n");
  },
);

server.listen(3000, (): void => {
  console.log("Server running at http://localhost:3000/");
});
```

### Example 2: Handling Different Content Types

**JavaScript:**

```javascript
// content-types.js
import { createServer } from "node:http";

const server = createServer((req, res) => {
  const path = req.url;

  // Plain text
  if (path === "/text") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("This is plain text");
    return;
  }

  // JSON
  if (path === "/json") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "This is JSON", timestamp: Date.now() }));
    return;
  }

  // HTML
  if (path === "/html") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head><title>DevJobs Pro</title></head>
        <body>
          <h1>Welcome to DevJobs Pro</h1>
          <p>Find your dream developer job.</p>
        </body>
      </html>
    `);
    return;
  }

  // 404 Not Found
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found", path }));
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
  console.log("Try: /text, /json, /html");
});
```

### Example 3: Routing with Methods

**JavaScript:**

```javascript
// routing.js
import { createServer } from "node:http";

// Simple in-memory "database"
const jobs = [
  { id: "1", title: "Backend Engineer", company: "TechCorp" },
  { id: "2", title: "Frontend Developer", company: "StartupXYZ" },
];

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

const server = createServer((req, res) => {
  const { method, url } = req;
  const path = url.split("?")[0]; // Remove query string

  console.log(`${method} ${path}`);

  // GET /api/jobs - List all jobs
  if (method === "GET" && path === "/api/jobs") {
    sendJSON(res, 200, { jobs });
    return;
  }

  // GET /api/jobs/:id - Get single job
  if (method === "GET" && path.startsWith("/api/jobs/")) {
    const id = path.split("/")[3];
    const job = jobs.find((j) => j.id === id);

    if (!job) {
      sendJSON(res, 404, { error: "Job not found" });
      return;
    }

    sendJSON(res, 200, { job });
    return;
  }

  // POST /api/jobs - Create job
  if (method === "POST" && path === "/api/jobs") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const newJob = {
          id: String(Date.now()),
          title: data.title,
          company: data.company,
        };
        jobs.push(newJob);

        sendJSON(res, 201, { job: newJob });
      } catch (err) {
        sendJSON(res, 400, { error: "Invalid JSON" });
      }
    });
    return;
  }

  // DELETE /api/jobs/:id - Delete job
  if (method === "DELETE" && path.startsWith("/api/jobs/")) {
    const id = path.split("/")[3];
    const index = jobs.findIndex((j) => j.id === id);

    if (index === -1) {
      sendJSON(res, 404, { error: "Job not found" });
      return;
    }

    jobs.splice(index, 1);
    res.writeHead(204);
    res.end();
    return;
  }

  // 404 for unknown routes
  sendJSON(res, 404, { error: "Route not found" });
});

server.listen(3000, () => {
  console.log("API running on http://localhost:3000");
});
```

**TypeScript:**

```typescript
// routing.ts
import { createServer, IncomingMessage, ServerResponse } from "node:http";

interface Job {
  id: string;
  title: string;
  company: string;
}

const jobs: Job[] = [
  { id: "1", title: "Backend Engineer", company: "TechCorp" },
  { id: "2", title: "Frontend Developer", company: "StartupXYZ" },
];

function sendJSON(
  res: ServerResponse,
  statusCode: number,
  data: unknown,
): void {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function parseBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

const server = createServer(
  async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const { method, url } = req;
    const path = url?.split("?")[0] ?? "/";

    console.log(`${method} ${path}`);

    // GET /api/jobs
    if (method === "GET" && path === "/api/jobs") {
      sendJSON(res, 200, { jobs });
      return;
    }

    // GET /api/jobs/:id
    if (method === "GET" && path.startsWith("/api/jobs/")) {
      const id = path.split("/")[3];
      const job = jobs.find((j) => j.id === id);

      if (!job) {
        sendJSON(res, 404, { error: "Job not found" });
        return;
      }

      sendJSON(res, 200, { job });
      return;
    }

    // POST /api/jobs
    if (method === "POST" && path === "/api/jobs") {
      try {
        const body = await parseBody(req);
        const data = JSON.parse(body) as Partial<Job>;
        const newJob: Job = {
          id: String(Date.now()),
          title: data.title ?? "Untitled",
          company: data.company ?? "Unknown",
        };
        jobs.push(newJob);
        sendJSON(res, 201, { job: newJob });
      } catch {
        sendJSON(res, 400, { error: "Invalid JSON" });
      }
      return;
    }

    // 404
    sendJSON(res, 404, { error: "Route not found" });
  },
);

server.listen(3000, (): void => {
  console.log("API running on http://localhost:3000");
});
```

### Example 4: Query String Parsing

**JavaScript:**

```javascript
// query-params.js
import { createServer } from "node:http";
import { URL } from "node:url";

const jobs = [
  { id: "1", title: "Backend Engineer", company: "TechCorp", location: "NYC" },
  {
    id: "2",
    title: "Frontend Developer",
    company: "StartupXYZ",
    location: "Remote",
  },
  { id: "3", title: "DevOps Engineer", company: "CloudCo", location: "NYC" },
  {
    id: "4",
    title: "Full Stack Developer",
    company: "TechCorp",
    location: "Remote",
  },
];

const server = createServer((req, res) => {
  // Parse URL with base (required for relative URLs)
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const path = parsedUrl.pathname;
  const searchParams = parsedUrl.searchParams;

  // GET /api/jobs?location=Remote&company=TechCorp
  if (req.method === "GET" && path === "/api/jobs") {
    let filteredJobs = [...jobs];

    // Filter by location
    const location = searchParams.get("location");
    if (location) {
      filteredJobs = filteredJobs.filter(
        (j) => j.location.toLowerCase() === location.toLowerCase(),
      );
    }

    // Filter by company
    const company = searchParams.get("company");
    if (company) {
      filteredJobs = filteredJobs.filter((j) =>
        j.company.toLowerCase().includes(company.toLowerCase()),
      );
    }

    // Search in title
    const search = searchParams.get("search");
    if (search) {
      filteredJobs = filteredJobs.filter((j) =>
        j.title.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const startIndex = (page - 1) * limit;
    const paginatedJobs = filteredJobs.slice(startIndex, startIndex + limit);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        jobs: paginatedJobs,
        pagination: {
          page,
          limit,
          total: filteredJobs.length,
          totalPages: Math.ceil(filteredJobs.length / limit),
        },
      }),
    );
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
  console.log("Try: /api/jobs?location=Remote&search=developer");
});
```

### Example 5: Request Headers & CORS

**JavaScript:**

```javascript
// headers-cors.js
import { createServer } from "node:http";

const server = createServer((req, res) => {
  // Log request headers
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", req.headers);

  // CORS headers - allow requests from any origin
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests (OPTIONS)
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Custom headers
  res.setHeader("X-Powered-By", "DevJobs Pro");
  res.setHeader("X-Request-Id", `req-${Date.now()}`);

  // Read specific headers from request
  const authHeader = req.headers["authorization"];
  const contentType = req.headers["content-type"];
  const userAgent = req.headers["user-agent"];

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      message: "Headers received",
      receivedHeaders: {
        authorization: authHeader ? "Present" : "Missing",
        contentType: contentType || "Not specified",
        userAgent: userAgent || "Unknown",
      },
    }),
  );
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```

---

## 🔨 Mini-Tutorial: Build a Tiny REST API

Let's build a complete (but tiny) REST API without Express. This shows exactly what Express abstracts away.

### Step 1: Project Setup

```bash
mkdir raw-http-api && cd raw-http-api
npm init -y
```

Add to `package.json`:

```json
{
  "type": "module"
}
```

### Step 2: Create the Server

**JavaScript (server.js):**

```javascript
// server.js
import { createServer } from "node:http";
import { URL } from "node:url";

// In-memory database
const db = {
  jobs: [
    {
      id: "1",
      title: "Backend Engineer",
      company: "TechCorp",
      salary: { min: 100000, max: 150000 },
      createdAt: new Date().toISOString(),
    },
  ],
};

// Utility: Send JSON response
function json(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(data, null, 2));
}

// Utility: Parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    // Check content length to prevent memory attacks
    const contentLength = parseInt(req.headers["content-length"] || "0", 10);
    if (contentLength > 1e6) {
      // 1MB limit
      reject(new Error("Request body too large"));
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
      if (body.length > 1e6) {
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

// Utility: Extract path params (simple version)
function matchRoute(pattern, path) {
  const patternParts = pattern.split("/");
  const pathParts = path.split("/");

  if (patternParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      const paramName = patternParts[i].slice(1);
      params[paramName] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

// Request handler
async function handleRequest(req, res) {
  const { method } = req;
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const path = parsedUrl.pathname;

  console.log(`[${new Date().toISOString()}] ${method} ${path}`);

  // Handle CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return;
  }

  try {
    // GET /api/jobs - List all jobs
    if (method === "GET" && path === "/api/jobs") {
      json(res, 200, {
        success: true,
        count: db.jobs.length,
        data: db.jobs,
      });
      return;
    }

    // GET /api/jobs/:id - Get single job
    const getJobParams = matchRoute("/api/jobs/:id", path);
    if (method === "GET" && getJobParams) {
      const job = db.jobs.find((j) => j.id === getJobParams.id);
      if (!job) {
        json(res, 404, { success: false, error: "Job not found" });
        return;
      }
      json(res, 200, { success: true, data: job });
      return;
    }

    // POST /api/jobs - Create job
    if (method === "POST" && path === "/api/jobs") {
      const body = await parseBody(req);

      // Validation
      if (!body.title || !body.company) {
        json(res, 400, {
          success: false,
          error: "Title and company are required",
        });
        return;
      }

      const newJob = {
        id: String(Date.now()),
        title: body.title,
        company: body.company,
        salary: body.salary || { min: 0, max: 0 },
        createdAt: new Date().toISOString(),
      };

      db.jobs.push(newJob);

      json(res, 201, { success: true, data: newJob });
      return;
    }

    // PUT /api/jobs/:id - Update job
    const updateJobParams = matchRoute("/api/jobs/:id", path);
    if (method === "PUT" && updateJobParams) {
      const index = db.jobs.findIndex((j) => j.id === updateJobParams.id);
      if (index === -1) {
        json(res, 404, { success: false, error: "Job not found" });
        return;
      }

      const body = await parseBody(req);
      db.jobs[index] = {
        ...db.jobs[index],
        ...body,
        id: updateJobParams.id, // Prevent ID change
        updatedAt: new Date().toISOString(),
      };

      json(res, 200, { success: true, data: db.jobs[index] });
      return;
    }

    // DELETE /api/jobs/:id - Delete job
    const deleteJobParams = matchRoute("/api/jobs/:id", path);
    if (method === "DELETE" && deleteJobParams) {
      const index = db.jobs.findIndex((j) => j.id === deleteJobParams.id);
      if (index === -1) {
        json(res, 404, { success: false, error: "Job not found" });
        return;
      }

      db.jobs.splice(index, 1);

      res.writeHead(204);
      res.end();
      return;
    }

    // Health check
    if (method === "GET" && path === "/health") {
      json(res, 200, { status: "ok", timestamp: new Date().toISOString() });
      return;
    }

    // 404 for unknown routes
    json(res, 404, { success: false, error: "Route not found" });
  } catch (err) {
    console.error("Error:", err);
    json(res, 500, { success: false, error: err.message });
  }
}

// Create and start server
const server = createServer(handleRequest);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Raw HTTP API running on http://localhost:${PORT}`);
  console.log("");
  console.log("Available endpoints:");
  console.log("  GET    /health      - Health check");
  console.log("  GET    /api/jobs    - List all jobs");
  console.log("  GET    /api/jobs/:id- Get single job");
  console.log("  POST   /api/jobs    - Create job");
  console.log("  PUT    /api/jobs/:id- Update job");
  console.log("  DELETE /api/jobs/:id- Delete job");
});
```

### Step 3: Test the API

```bash
# Start server
node server.js

# In another terminal:

# Health check
curl http://localhost:3000/health

# List jobs
curl http://localhost:3000/api/jobs

# Create a job
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"title": "Full Stack Dev", "company": "StartupXYZ", "salary": {"min": 80000, "max": 120000}}'

# Get single job
curl http://localhost:3000/api/jobs/1

# Update job
curl -X PUT http://localhost:3000/api/jobs/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Senior Backend Engineer"}'

# Delete job
curl -X DELETE http://localhost:3000/api/jobs/1
```

### What Express Abstracts

Look at all this code! Express simplifies:

- **Routing**: Pattern matching, params extraction
- **Body parsing**: JSON, form data, multipart
- **Response helpers**: `res.json()`, `res.status()`
- **Middleware**: Run code before/after handlers
- **Error handling**: Centralized error middleware

---

## 🏋️ Practice Exercises

### Exercise 1: Add Search Functionality

Extend the API to support searching jobs:

```
GET /api/jobs?search=engineer&company=tech
```

<details>
<summary>Click to reveal solution</summary>

```javascript
if (method === "GET" && path === "/api/jobs") {
  let filteredJobs = [...db.jobs];
  const searchParams = parsedUrl.searchParams;

  const search = searchParams.get("search");
  if (search) {
    const searchLower = search.toLowerCase();
    filteredJobs = filteredJobs.filter(
      (j) =>
        j.title.toLowerCase().includes(searchLower) ||
        j.company.toLowerCase().includes(searchLower),
    );
  }

  const company = searchParams.get("company");
  if (company) {
    filteredJobs = filteredJobs.filter((j) =>
      j.company.toLowerCase().includes(company.toLowerCase()),
    );
  }

  json(res, 200, {
    success: true,
    count: filteredJobs.length,
    data: filteredJobs,
  });
  return;
}
```

</details>

### Exercise 2: Add Request Logging Middleware

Create a function that logs every request with timing:

```
[2026-01-29T10:30:00.000Z] GET /api/jobs 200 15ms
```

<details>
<summary>Click to reveal solution</summary>

```javascript
function withLogging(handler) {
  return async (req, res) => {
    const start = Date.now();
    const originalEnd = res.end.bind(res);

    res.end = function (...args) {
      const duration = Date.now() - start;
      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`,
      );
      return originalEnd(...args);
    };

    await handler(req, res);
  };
}

// Usage
const server = createServer(withLogging(handleRequest));
```

</details>

### Exercise 3: Implement Rate Limiting

Add simple rate limiting (max 10 requests per minute per IP):

<details>
<summary>Click to reveal solution</summary>

```javascript
const rateLimitMap = new Map();

function rateLimit(maxRequests = 10, windowMs = 60000) {
  return (req) => {
    const ip = req.socket.remoteAddress;
    const now = Date.now();

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
      return true;
    }

    const record = rateLimitMap.get(ip);

    if (now > record.resetAt) {
      record.count = 1;
      record.resetAt = now + windowMs;
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  };
}

const checkLimit = rateLimit(10, 60000);

// In handler:
if (!checkLimit(req)) {
  json(res, 429, { success: false, error: "Too many requests" });
  return;
}
```

</details>

---

## 💡 Pro Tips

### 1. Always End the Response

```javascript
// ❌ Response never ends - client hangs forever
createServer((req, res) => {
  res.writeHead(200);
  // Forgot res.end()!
});

// ✅ Always call res.end()
createServer((req, res) => {
  res.writeHead(200);
  res.end("OK");
});
```

### 2. Set Headers Before Body

```javascript
// ❌ Error: Cannot set headers after they are sent
res.write("Hello");
res.setHeader("Content-Type", "text/plain"); // Too late!

// ✅ Headers first, then body
res.setHeader("Content-Type", "text/plain");
res.write("Hello");
res.end();
```

### 3. Handle Large Bodies Safely

```javascript
// ❌ Memory attack vulnerable
let body = "";
req.on("data", (chunk) => (body += chunk));

// ✅ Limit body size
let body = "";
let bodySize = 0;
const MAX_SIZE = 1e6; // 1MB

req.on("data", (chunk) => {
  bodySize += chunk.length;
  if (bodySize > MAX_SIZE) {
    res.writeHead(413);
    res.end("Payload too large");
    req.destroy();
    return;
  }
  body += chunk;
});
```

### 4. Use Proper Error Handling

```javascript
// Add error handler to server
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} already in use`);
    process.exit(1);
  }
  console.error("Server error:", err);
});

// Handle uncaught errors in requests
createServer(async (req, res) => {
  try {
    await handleRequest(req, res);
  } catch (err) {
    console.error("Request error:", err);
    if (!res.headersSent) {
      res.writeHead(500);
      res.end("Internal Server Error");
    }
  }
});
```

### 5. Graceful Shutdown

```javascript
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error("Forced shutdown");
    process.exit(1);
  }, 10000);
});
```

---

## 🔧 5-Minute Debugger

### Error: "Address already in use"

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Diagnosis:**
Another process is using port 3000.

**Fix:**

```bash
# Find what's using the port
lsof -i :3000
# or
netstat -tulpn | grep 3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 node server.js
```

### Error: "Cannot set headers after they are sent"

```
Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
```

**Diagnosis:**
You're trying to send a response twice.

**Common Causes:**

```javascript
// ❌ Missing return after response
if (error) {
  res.end("Error");
  // Missing return! Code continues and tries to send again
}
res.end("Success");

// ✅ Return after sending response
if (error) {
  res.end("Error");
  return;
}
res.end("Success");
```

```javascript
// ❌ Async callback continues after response
app.get("/users", async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (err) {
    res.status(500).send("Error");
  }
  // Don't put code here! It runs after res.json()
});
```

### Error: "socket hang up"

```
Error: socket hang up
```

**Diagnosis:**
Server closed connection before sending complete response.

**Fix:**

```javascript
// Make sure to always end response
createServer((req, res) => {
  // Handle ALL code paths
  if (condition) {
    res.end("A");
    return;
  }
  res.end("B"); // Don't forget the else case!
});
```

### Quick Debugging Checklist

1. ✅ Is `res.end()` called in ALL code paths?
2. ✅ Are headers set BEFORE body?
3. ✅ Is there a `return` after each response?
4. ✅ Are you handling async errors?
5. ✅ Is the port available?

---

## ✅ Definition of Done

You've mastered this lesson when you can:

- [ ] Create a basic HTTP server without Express
- [ ] Handle different HTTP methods (GET, POST, PUT, DELETE)
- [ ] Parse query strings and request bodies
- [ ] Set response status codes and headers
- [ ] Explain the request/response lifecycle
- [ ] Debug "headers already sent" errors
- [ ] Debug "address in use" errors
- [ ] Understand what Express abstracts away

---

## 🚀 Next Steps

Congratulations! You now understand how Node.js handles HTTP requests at the lowest level. This knowledge will be invaluable when debugging Express applications.

**Next Module:** [Module 03: Express.js Fundamentals](../03-express-fundamentals/README.md)

You'll learn:

- Express application setup
- Routing and middleware
- Request and response helpers
- Error handling patterns
- Building the DevJobs Pro API foundation

The raw HTTP knowledge you just gained will make Express feel like magic you understand—not magic you hope works.

---

## 📚 Additional Resources

- [Node.js HTTP Module Documentation](https://nodejs.org/api/http.html)
- [HTTP/1.1 Specification (RFC 7230-7235)](https://tools.ietf.org/html/rfc7230)
- [MDN HTTP Overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)
- [HTTP Status Codes](https://httpstatuses.com/)
