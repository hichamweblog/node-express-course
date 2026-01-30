# Lesson 01: Express 5 Installation & Setup

## 🎯 Hook

**Express 5 is the new npm default—native async/await error handling changes everything.**

When you run `npm install express` today, you get Express 5.2.1. This isn't just a version bump—it's a fundamental shift in how Express handles errors. Those try/catch wrappers you've been writing around every async route handler? Gone. Express 5 catches Promise rejections automatically.

---

## 📚 Theory

### What is Express.js?

Express is a minimal, unopinionated web framework for Node.js. It provides:

- Routing (mapping URLs to handlers)
- Middleware (processing requests in a pipeline)
- Request/Response utilities (parsing, sending data)
- Template rendering (optional)

### What's New in Express 5.2.1

| Feature                | Express 4        | Express 5           |
| ---------------------- | ---------------- | ------------------- |
| Async error handling   | Manual try/catch | **Automatic**       |
| `req.params` prototype | Regular object   | **Null prototype**  |
| `req.body` default     | `{}`             | **`undefined`**     |
| Wildcard routes        | `*`              | **`:splat*` named** |
| `res.render()`         | Callback-based   | **Returns Promise** |
| `app.del()`            | Deprecated alias | **Removed**         |
| `app.param(fn)`        | Supported        | **Removed**         |

### Express Application Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EXPRESS APPLICATION LIFECYCLE                     │
└─────────────────────────────────────────────────────────────────────┘

  ┌─────────────┐
  │   STARTUP   │  1. Create app instance
  │             │  2. Configure middleware
  │  app = ex() │  3. Define routes
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │   LISTEN    │  app.listen(PORT)
  │             │  Server binds to port
  │   :3000     │  Waiting for connections...
  └──────┬──────┘
         │
         ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │                      REQUEST/RESPONSE LOOP                       │
  │                                                                   │
  │   ┌─────────┐    ┌────────────┐    ┌─────────┐    ┌──────────┐  │
  │   │ REQUEST │───▶│ MIDDLEWARE │───▶│  ROUTE  │───▶│ RESPONSE │  │
  │   │ arrives │    │  pipeline  │    │ handler │    │   sent   │  │
  │   └─────────┘    └────────────┘    └─────────┘    └──────────┘  │
  │                                                                   │
  │   Repeat for each incoming request...                            │
  └─────────────────────────────────────────────────────────────────┘
         │
         ▼
  ┌─────────────┐
  │  SHUTDOWN   │  process.on('SIGTERM')
  │             │  Graceful cleanup
  │   close()   │  Close connections
  └─────────────┘
```

### Basic App Structure

```typescript
// The minimal Express app
import express from "express";

const app = express(); // Create application instance
const PORT = 3000;

// Define a route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start listening
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### Understanding `app.listen()`

```typescript
// app.listen() is shorthand for:
const http = require("http");
http.createServer(app).listen(PORT);

// It returns the HTTP server instance
const server = app.listen(PORT, () => {
  console.log("Server started");
});

// You can use this for graceful shutdown
process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
```

---

## 💻 Code Examples

### Example 1: Minimal Express Server (JavaScript)

```javascript
// app.js
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ message: "Welcome to DevJobs Pro API" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

### Example 2: Minimal Express Server (TypeScript)

```typescript
// app.ts
import express, { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to DevJobs Pro API" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

### Example 3: Express 5 Automatic Async Error Handling

```typescript
// Express 4 - Manual error handling (THE OLD WAY)
app.get("/jobs/:id", async (req, res, next) => {
  try {
    const job = await findJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json(job);
  } catch (error) {
    next(error); // Must manually pass errors
  }
});

// Express 5 - Automatic error handling (THE NEW WAY) 🎉
app.get("/jobs/:id", async (req, res) => {
  const job = await findJobById(req.params.id); // Errors auto-caught!
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }
  res.json(job);
});
// If findJobById() rejects, Express 5 catches it and passes to error middleware
```

### Example 4: Production Folder Structure

```
devjobs-pro/
├── package.json
├── tsconfig.json
├── .env
├── .env.example
├── .gitignore
├── src/
│   ├── app.ts              # Express app configuration
│   ├── server.ts           # Entry point (starts server)
│   ├── config/
│   │   └── index.ts        # Environment variables
│   ├── routes/
│   │   ├── index.ts        # Route aggregator
│   │   └── jobs.routes.ts  # Job routes
│   ├── controllers/
│   │   └── jobs.controller.ts
│   ├── middleware/
│   │   └── errorHandler.ts
│   ├── utils/
│   │   └── ApiResponse.ts
│   └── types/
│       └── index.ts
└── dist/                    # Compiled JavaScript
```

---

## 🛠️ Mini-Tutorial: Create Express 5 Project from Scratch

Let's build the DevJobs Pro API foundation step by step.

### Step 1: Initialize Project

```bash
# Create project directory
mkdir devjobs-pro && cd devjobs-pro

# Initialize package.json
npm init -y

# Install dependencies
npm install express
npm install -D typescript @types/express @types/node tsx

# tsx = TypeScript Execute (replacement for ts-node, faster)
```

### Step 2: Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 3: Configure package.json

```json
{
  "name": "devjobs-pro",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "express": "^5.0.1"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/node": "^22.0.0",
    "typescript": "^5.7.0",
    "tsx": "^4.19.0"
  }
}
```

### Step 4: Create Application Files

**src/config/index.ts**

```typescript
// Centralized configuration
export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV !== "production",
} as const;
```

**src/app.ts**

```typescript
import express, { Application, Request, Response } from "express";

// Create Express application
const app: Application = express();

// Built-in middleware for parsing JSON
app.use(express.json());

// Built-in middleware for parsing URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get("/", (req: Request, res: Response) => {
  res.json({
    name: "DevJobs Pro API",
    version: "1.0.0",
    documentation: "/api/docs",
  });
});

export default app;
```

**src/server.ts**

```typescript
import app from "./app.js";
import { config } from "./config/index.js";

const server = app.listen(config.port, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║   🚀 DevJobs Pro API Server                          ║
  ║                                                       ║
  ║   Environment: ${config.nodeEnv.padEnd(18)}           ║
  ║   Port:        ${String(config.port).padEnd(18)}           ║
  ║   URL:         http://localhost:${config.port}              ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
```

### Step 5: Run the Server

```bash
# Development with hot reload
npm run dev

# Output:
# 🚀 DevJobs Pro API Server
# Environment: development
# Port:        3000
# URL:         http://localhost:3000
```

### Step 6: Test the API

```bash
# Test health endpoint
curl http://localhost:3000/health
# {"status":"ok","timestamp":"2026-01-30T10:00:00.000Z"}

# Test root endpoint
curl http://localhost:3000/
# {"name":"DevJobs Pro API","version":"1.0.0","documentation":"/api/docs"}
```

---

## 🏋️ Practice Exercise: Initialize DevJobs Pro API

Now it's your turn! Create the complete project structure for DevJobs Pro.

### Requirements

1. Create the folder structure:

   ```
   devjobs-pro/
   ├── src/
   │   ├── app.ts
   │   ├── server.ts
   │   ├── config/
   │   │   └── index.ts
   │   └── routes/
   │       └── index.ts (placeholder)
   ```

2. Add a `/api/v1` route that returns:

   ```json
   {
     "message": "DevJobs Pro API v1",
     "endpoints": {
       "jobs": "/api/v1/jobs",
       "auth": "/api/v1/auth",
       "users": "/api/v1/users",
       "applications": "/api/v1/applications",
       "companies": "/api/v1/companies"
     }
   }
   ```

3. Create a `.env.example` file with:
   ```
   PORT=3000
   NODE_ENV=development
   ```

### Bonus Challenges

- Add a `npm run typecheck` script
- Add a 404 handler for unknown routes
- Create a request logging middleware that prints: `[METHOD] /path - timestamp`

### Solution Template

```typescript
// src/routes/index.ts
import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  // Your code here
});

export default router;
```

---

## 💡 Pro Tips

### 1. Express 5 Auto-Catches Promise Rejections

```typescript
// This is safe in Express 5 - no try/catch needed!
app.get("/data", async (req, res) => {
  const data = await fetchFromDatabase(); // If this throws, it's caught
  res.json(data);
});

// But you still need to handle expected errors
app.get("/jobs/:id", async (req, res) => {
  const job = await findJob(req.params.id);

  if (!job) {
    // This is not an error, it's expected - handle it
    return res.status(404).json({ error: "Job not found" });
  }

  res.json(job);
});
```

### 2. Separate app.ts and server.ts

```
app.ts   → Express configuration (middleware, routes)
server.ts → Server startup (listen, shutdown)

Why? Testing. You can import app.ts without starting the server.
```

### 3. Use tsx Instead of ts-node

```bash
# ts-node (slower, more issues)
npx ts-node src/server.ts

# tsx (faster, just works)
npx tsx src/server.ts

# tsx with watch mode
npx tsx watch src/server.ts
```

### 4. Type Your Express Application

```typescript
import express, { Application, Request, Response, NextFunction } from "express";

const app: Application = express();

// Type your handlers
type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;
```

---

## 🔧 5-Minute Debugger

### Problem 1: "Cannot find module 'express'"

```
Error: Cannot find module 'express'
```

**Causes & Fixes:**

```bash
# Did you install it?
npm install express

# Are you in the right directory?
ls node_modules | grep express

# Using TypeScript? Install types
npm install -D @types/express

# Check package.json "type" matches your imports
# "type": "module" → use import/export
# No "type" → use require/module.exports
```

### Problem 2: "PORT already in use"

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Causes & Fixes:**

```bash
# Find what's using the port (Linux/Mac)
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev

# Pro tip: Make your app use any available port in development
const PORT = process.env.PORT || 0;  // 0 = random available port
server.listen(PORT, () => {
  const addr = server.address();
  console.log(`Running on port ${addr.port}`);
});
```

### Problem 3: "req.body is undefined"

```typescript
app.post("/jobs", (req, res) => {
  console.log(req.body); // undefined!
});
```

**Fix:** Add body parsing middleware BEFORE routes:

```typescript
// MUST be before route definitions
app.use(express.json()); // For JSON bodies
app.use(express.urlencoded({ extended: true })); // For form data

// Now routes can access req.body
app.post("/jobs", (req, res) => {
  console.log(req.body); // { title: 'Developer', ... }
});
```

---

## ✅ Definition of Done

You've completed this lesson when:

- [ ] Express 5 installed successfully
- [ ] TypeScript configured with proper tsconfig.json
- [ ] package.json has dev, build, and start scripts
- [ ] app.ts separates configuration from server startup
- [ ] server.ts handles graceful shutdown
- [ ] Development server runs with hot reload (`npm run dev`)
- [ ] `/health` endpoint returns status OK
- [ ] You understand why Express 5 async handling is better

### Quick Verification

```bash
# Start the server
npm run dev

# In another terminal
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"..."}

# Ctrl+C should show "Shutting down gracefully..."
```

---

## 📖 Key Takeaways

1. **Express 5 is now default** - New projects automatically get Express 5
2. **Async errors are auto-caught** - No more try/catch boilerplate
3. **Separate app.ts and server.ts** - Better testability
4. **Use tsx for TypeScript** - Faster than ts-node
5. **Add body parsers before routes** - Or req.body is undefined
6. **Handle graceful shutdown** - SIGTERM/SIGINT listeners

---

**→ Next: [Lesson 02: Routing Fundamentals](./02-routing-fundamentals.md)** - Learn how to map URLs to handlers and build RESTful routes.
