# Lesson 4: PM2, Monitoring & Logging

## 🎯 The Hook

Your API is deployed—congratulations! But deployment is just the beginning. What happens when:

- Your server crashes at 3 AM?
- Memory usage slowly climbs until everything freezes?
- Users report "the site was slow" but you have no data?

**Production apps need to be resilient, observable, and maintainable.** Process managers, structured logging, and health monitoring are what separate a deployed app from a production-ready one.

---

## 📚 Core Theory

### Why Process Managers?

Node.js runs in a single process by default. If that process crashes, your API is down. If you have 8 CPU cores, you're only using 1.

```
┌─────────────────────────────────────────────────────────────────┐
│                  WITHOUT PM2 vs WITH PM2                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   WITHOUT PM2                  WITH PM2 (Cluster Mode)          │
│   ───────────                  ─────────────────────            │
│                                                                 │
│   ┌─────────────────┐         ┌─────────────────────────┐      │
│   │   Single Node   │         │        PM2 Master       │      │
│   │    Process      │         │    (Process Manager)    │      │
│   │                 │         └───────────┬─────────────┘      │
│   │   ● Using 1     │                     │                    │
│   │     CPU core    │         ┌───────────┼───────────┐        │
│   │   ● Crash =     │         │           │           │        │
│   │     Down        │         ▼           ▼           ▼        │
│   │   ● No auto-    │   ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│   │     restart     │   │ Worker  │ │ Worker  │ │ Worker  │   │
│   └─────────────────┘   │   #1    │ │   #2    │ │   #3    │   │
│                         │  CPU 1  │ │  CPU 2  │ │  CPU 3  │   │
│                         └─────────┘ └─────────┘ └─────────┘   │
│                                                                 │
│                         ✓ Uses all CPU cores                   │
│                         ✓ Auto-restart on crash                │
│                         ✓ Zero-downtime reload                 │
│                         ✓ Built-in monitoring                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### PM2 Cluster Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PM2 CLUSTER MODE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      ┌───────────────┐                         │
│                      │   Incoming    │                         │
│                      │   Requests    │                         │
│                      └───────┬───────┘                         │
│                              │                                  │
│                              ▼                                  │
│                      ┌───────────────┐                         │
│                      │  PM2 Master   │                         │
│                      │  (Load Bal.)  │                         │
│                      └───────┬───────┘                         │
│                              │                                  │
│            ┌─────────────────┼─────────────────┐               │
│            │                 │                 │                │
│            ▼                 ▼                 ▼                │
│     ┌────────────┐   ┌────────────┐   ┌────────────┐           │
│     │  Worker 0  │   │  Worker 1  │   │  Worker 2  │  ...      │
│     │  (CPU 0)   │   │  (CPU 1)   │   │  (CPU 2)   │           │
│     │            │   │            │   │            │           │
│     │ ┌────────┐ │   │ ┌────────┐ │   │ ┌────────┐ │           │
│     │ │Express │ │   │ │Express │ │   │ │Express │ │           │
│     │ │  App   │ │   │ │  App   │ │   │ │  App   │ │           │
│     │ └────────┘ │   │ └────────┘ │   │ └────────┘ │           │
│     └────────────┘   └────────────┘   └────────────┘           │
│            │                 │                 │                │
│            │         ┌───────┴───────┐        │                │
│            └─────────┤   Database    ├────────┘                │
│                      │   (Shared)    │                         │
│                      └───────────────┘                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Logging Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                     LOGGING PIPELINE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   APPLICATION               TRANSPORT              STORAGE      │
│   ───────────               ─────────              ───────      │
│                                                                 │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐      │
│   │   Logger    │────▶│   stdout    │────▶│  Platform   │      │
│   │   (pino)    │     │   (JSON)    │     │   Logs      │      │
│   │             │     └─────────────┘     │ (Railway/   │      │
│   │  {level,    │                         │  Render)    │      │
│   │   msg,      │     ┌─────────────┐     └─────────────┘      │
│   │   time,     │────▶│   File      │                          │
│   │   req,      │     │   (rotate)  │     ┌─────────────┐      │
│   │   err}      │     └─────────────┘     │  Log Aggr.  │      │
│   └─────────────┘                    ────▶│ (Datadog/   │      │
│                       ┌─────────────┐     │  Logtail)   │      │
│                       │   External  │     └─────────────┘      │
│                       │   Service   │                          │
│                       └─────────────┘                          │
│                                                                 │
│   LEVELS: error > warn > info > debug > trace                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Log Levels Explained

| Level     | When to Use                      | Example                      |
| --------- | -------------------------------- | ---------------------------- |
| **error** | Something broke, needs attention | Database connection failed   |
| **warn**  | Potential problem, not critical  | Rate limit approaching       |
| **info**  | Normal operations                | User registered, job created |
| **debug** | Development debugging            | Request body, SQL queries    |
| **trace** | Very detailed debugging          | Function entry/exit          |

---

## 💻 Code Examples

### PM2 Ecosystem Configuration

**JavaScript (ecosystem.config.js):**

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "devjobs-api",
      script: "./dist/index.js",

      // Cluster mode - use all CPUs
      instances: "max", // Or specific number: 4
      exec_mode: "cluster",

      // Environment
      env: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },

      // Restart behavior
      max_memory_restart: "500M",
      restart_delay: 5000,
      max_restarts: 10,

      // Logging
      log_file: "./logs/combined.log",
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      // Watch (development only)
      watch: false,
      ignore_watch: ["node_modules", "logs"],

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,

      // Health monitoring
      min_uptime: "10s",

      // Source maps for errors
      source_map_support: true,
    },
  ],
};
```

**TypeScript (ecosystem.config.cjs):**

```javascript
// ecosystem.config.cjs - Use .cjs for CommonJS in ESM projects
module.exports = {
  apps: [
    {
      name: "devjobs-api",
      script: "./dist/index.js",

      // Use all available CPUs
      instances: process.env.PM2_INSTANCES || "max",
      exec_mode: "cluster",

      // Auto-restart on memory threshold
      max_memory_restart: "500M",

      // Environment configuration
      env: {
        NODE_ENV: "development",
      },
      env_staging: {
        NODE_ENV: "staging",
      },
      env_production: {
        NODE_ENV: "production",
      },

      // Logging
      combine_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss.SSS",

      // Graceful shutdown timeout
      kill_timeout: 10000,

      // Wait for app to be ready
      wait_ready: true,
      listen_timeout: 30000,
    },
  ],
};
```

### Graceful Shutdown

**JavaScript:**

```javascript
// src/index.js
import express from "express";

const app = express();

// ... setup routes and middleware ...

const server = app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");

  // Tell PM2 we're ready
  if (process.send) {
    process.send("ready");
  }
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully`);

  // Stop accepting new connections
  server.close(async () => {
    console.log("HTTP server closed");

    // Close database connections
    try {
      await db.end();
      console.log("Database connections closed");
    } catch (err) {
      console.error("Error closing database:", err);
    }

    // Close Redis connections
    try {
      await redis.quit();
      console.log("Redis connection closed");
    } catch (err) {
      console.error("Error closing Redis:", err);
    }

    console.log("Cleanup complete, exiting");
    process.exit(0);
  });

  // Force exit if graceful shutdown takes too long
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
```

**TypeScript:**

```typescript
// src/index.ts
import express from "express";
import { Server } from "http";
import { db } from "./db";
import { logger } from "./config/logger";

const app = express();

// ... setup routes and middleware ...

let server: Server;

const startServer = async (): Promise<void> => {
  const PORT = process.env.PORT || 3000;

  server = app.listen(PORT, () => {
    logger.info({ port: PORT }, "Server started");

    // Tell PM2 we're ready to receive connections
    if (process.send) {
      process.send("ready");
    }
  });
};

const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info({ signal }, "Shutdown signal received");

  // Stop accepting new connections
  server.close(async () => {
    logger.info("HTTP server closed");

    try {
      // Close database pool
      await db.end();
      logger.info("Database connections closed");

      logger.info("Graceful shutdown complete");
      process.exit(0);
    } catch (error) {
      logger.error({ error }, "Error during shutdown");
      process.exit(1);
    }
  });

  // Force exit after timeout
  setTimeout(() => {
    logger.error("Shutdown timeout, forcing exit");
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  logger.fatal({ error }, "Uncaught exception");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "Unhandled rejection");
  process.exit(1);
});

startServer();
```

### Structured Logging with Pino

**JavaScript:**

```javascript
// src/config/logger.js
import pino from "pino";

const isDev = process.env.NODE_ENV === "development";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),

  // Pretty print in development
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,

  // Base fields included in every log
  base: {
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version,
  },

  // Redact sensitive fields
  redact: {
    paths: ["req.headers.authorization", "req.body.password", "req.body.token"],
    remove: true,
  },
});

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      userAgent: req.get("user-agent"),
      ip: req.ip,
    });
  });

  next();
};
```

**TypeScript:**

```typescript
// src/config/logger.ts
import pino, { Logger } from "pino";
import { Request, Response, NextFunction } from "express";

const isDev = process.env.NODE_ENV === "development";

export const logger: Logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),

  // Pretty print in development, JSON in production
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,

  // Base fields for every log entry
  base: {
    env: process.env.NODE_ENV,
    service: "devjobs-api",
    version: process.env.npm_package_version || "1.0.0",
  },

  // Format timestamps
  timestamp: pino.stdTimeFunctions.isoTime,

  // Redact sensitive data
  redact: {
    paths: [
      "req.headers.authorization",
      "req.body.password",
      "req.body.currentPassword",
      "req.body.newPassword",
      "req.body.token",
      "*.password",
      "*.secret",
    ],
    remove: true,
  },

  // Serializers for common objects
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
});

// Create child logger with request context
export const createRequestLogger = (req: Request): Logger => {
  return logger.child({
    requestId: req.headers["x-request-id"] || crypto.randomUUID(),
    userId: (req as any).user?.id,
  });
};

// Request logging middleware
export const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const start = Date.now();
  const requestId =
    (req.headers["x-request-id"] as string) || crypto.randomUUID();

  // Attach logger to request
  (req as any).log = logger.child({ requestId });

  // Set request ID header for tracing
  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    const duration = Date.now() - start;

    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      contentLength: res.get("content-length"),
      userAgent: req.get("user-agent"),
      ip: req.ip,
      requestId,
    };

    // Log level based on status code
    if (res.statusCode >= 500) {
      logger.error(logData, "Request failed");
    } else if (res.statusCode >= 400) {
      logger.warn(logData, "Request error");
    } else {
      logger.info(logData, "Request completed");
    }
  });

  next();
};
```

### Health and Readiness Endpoints

**TypeScript:**

```typescript
// src/routes/health.ts
import { Router, Request, Response } from "express";
import { db } from "../db";
import { logger } from "../config/logger";

const router = Router();

interface HealthResponse {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: "ok" | "error";
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

// Liveness probe - is the process alive?
router.get("/health/live", (req: Request, res: Response) => {
  res.status(200).json({
    status: "alive",
    timestamp: new Date().toISOString(),
  });
});

// Readiness probe - is the app ready for traffic?
router.get("/health/ready", async (req: Request, res: Response) => {
  try {
    // Check database
    await db.execute("SELECT 1");

    res.status(200).json({
      status: "ready",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ error }, "Readiness check failed");

    res.status(503).json({
      status: "not_ready",
      timestamp: new Date().toISOString(),
    });
  }
});

// Detailed health check
router.get("/health", async (req: Request, res: Response) => {
  const memUsage = process.memoryUsage();
  const memTotal = require("os").totalmem();

  let dbStatus: "ok" | "error" = "ok";

  try {
    await db.execute("SELECT 1");
  } catch {
    dbStatus = "error";
  }

  const health: HealthResponse = {
    status: dbStatus === "ok" ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0",
    checks: {
      database: dbStatus,
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memTotal / 1024 / 1024),
        percentage: Math.round((memUsage.heapUsed / memTotal) * 100),
      },
    },
  };

  const statusCode = health.status === "healthy" ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
```

### PM2 Commands Reference

```bash
# Start application
pm2 start ecosystem.config.js
pm2 start ecosystem.config.js --env production

# List running processes
pm2 list
pm2 ls

# Monitor in real-time
pm2 monit

# View logs
pm2 logs                    # All logs
pm2 logs devjobs-api        # Specific app
pm2 logs --lines 100        # Last 100 lines

# Restart/Reload
pm2 restart devjobs-api     # Hard restart
pm2 reload devjobs-api      # Zero-downtime reload

# Stop/Delete
pm2 stop devjobs-api
pm2 delete devjobs-api

# Cluster operations
pm2 scale devjobs-api 4     # Scale to 4 instances
pm2 scale devjobs-api +2    # Add 2 instances

# Save current process list (persists across reboots)
pm2 save
pm2 startup                 # Generate startup script

# Metrics
pm2 show devjobs-api        # Show app details
pm2 describe devjobs-api    # Detailed info
```

---

## 🛠️ Mini-Tutorial: Production PM2 Setup

Let's configure PM2 for DevJobs Pro with proper logging and monitoring.

### Step 1: Install PM2 and Pino

```bash
npm install pm2 pino pino-http
npm install -D pino-pretty @types/pino-http
```

### Step 2: Create Logger Configuration

**src/config/logger.ts:**

```typescript
import pino from "pino";

const isDev = process.env.NODE_ENV === "development";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
        },
      }
    : undefined,
  base: {
    service: "devjobs-api",
    env: process.env.NODE_ENV,
  },
  redact: ["req.headers.authorization", "*.password", "*.secret"],
});
```

### Step 3: Create PM2 Ecosystem File

**ecosystem.config.cjs:**

```javascript
module.exports = {
  apps: [
    {
      name: "devjobs-api",
      script: "./dist/index.js",
      instances: process.env.NODE_ENV === "production" ? "max" : 1,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      max_memory_restart: "500M",
      wait_ready: true,
      listen_timeout: 30000,
      kill_timeout: 10000,
    },
  ],
};
```

### Step 4: Implement Graceful Shutdown

**src/index.ts:**

```typescript
import express from "express";
import { logger } from "./config/logger";

const app = express();

// ... setup ...

const server = app.listen(process.env.PORT || 3000, () => {
  logger.info("Server started");
  if (process.send) process.send("ready");
});

const shutdown = async (signal: string) => {
  logger.info({ signal }, "Shutting down");

  server.close(async () => {
    // Close DB, Redis, etc.
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
```

### Step 5: Add Health Endpoints

Register the health router:

```typescript
import healthRouter from "./routes/health";
app.use(healthRouter);
```

### Step 6: Test Locally with PM2

```bash
# Build
npm run build

# Start with PM2
pm2 start ecosystem.config.cjs --env production

# Check status
pm2 ls

# View logs
pm2 logs devjobs-api

# Monitor
pm2 monit

# Test reload (zero-downtime)
pm2 reload devjobs-api

# Cleanup
pm2 delete devjobs-api
```

---

## 📝 Practice: DevJobs Pro Production Setup

### Task 1: Configure PM2

- [ ] Create ecosystem.config.cjs
- [ ] Configure cluster mode
- [ ] Set memory limits
- [ ] Enable graceful shutdown

### Task 2: Implement Structured Logging

- [ ] Install pino and pino-pretty
- [ ] Create logger configuration
- [ ] Add request logging middleware
- [ ] Redact sensitive fields

### Task 3: Health Endpoints

- [ ] Create /health, /health/live, /health/ready
- [ ] Include database status
- [ ] Include memory usage
- [ ] Return appropriate status codes

### Task 4: Test Production Mode

```bash
# Build and start
npm run build
pm2 start ecosystem.config.cjs --env production

# Verify clustering
pm2 ls
# Should show multiple instances

# Test health
curl http://localhost:3000/health

# Test zero-downtime reload
pm2 reload devjobs-api
# API should remain available
```

---

## ⚖️ Pro Tips vs Junior Traps

| Pro Tips 🎯                            | Junior Traps 💀                    |
| -------------------------------------- | ---------------------------------- |
| Use cluster mode for multi-core        | Single process wasting CPUs        |
| Implement graceful shutdown            | Abrupt termination losing requests |
| Structured JSON logs in production     | console.log everywhere             |
| Redact sensitive data in logs          | Logging passwords and tokens       |
| Set memory limits (max_memory_restart) | Unlimited memory → crash           |
| Use log levels appropriately           | Everything is console.log          |
| Health checks with database status     | Health check always returns 200    |
| Request IDs for tracing                | No way to trace requests           |
| Save PM2 state with pm2 save           | Lose process config on reboot      |
| Zero-downtime reload                   | Restart causing downtime           |

---

## 🔧 5-Minute Debugger

### "PM2 not starting"

```bash
# Check PM2 status
pm2 ls

# Check for errors
pm2 logs app-name --err --lines 50

# Common issues:

# 1. Wrong script path
script: './dist/index.js'  # Make sure file exists!

# 2. Missing build step
npm run build
pm2 restart app-name

# 3. Environment variable missing
pm2 start ecosystem.config.js --env production
# Check env vars are in config

# 4. Port already in use
lsof -i :3000
kill -9 <PID>
```

### "Memory leaks in cluster"

```bash
# Check memory usage
pm2 monit

# Add memory limit
{
  max_memory_restart: '500M'  // Restart if exceeds 500MB
}

# Debug memory issues
NODE_OPTIONS=--max-old-space-size=512 pm2 start ...

# Check for leaks
pm2 install pm2-server-monit  # Monitor memory over time

# Common causes:
# - Event listeners not removed
# - Large arrays growing indefinitely
# - Caching without limits
```

### "Logs not appearing"

```bash
# Check log configuration
pm2 show app-name | grep log

# View PM2 logs directly
pm2 logs

# Check log file permissions
ls -la ~/.pm2/logs/

# Check if logs are being written to custom path
{
  out_file: './logs/out.log',  // Make sure dir exists
  error_file: './logs/error.log',
}

# Create log directory
mkdir -p logs

# In container: logs go to stdout
{
  out_file: '/dev/stdout',
  error_file: '/dev/stderr',
}
```

### "Zero-downtime reload not working"

```bash
# Must use cluster mode
{
  exec_mode: 'cluster',
  instances: 2  // At least 2 for zero-downtime
}

# Must implement graceful shutdown
process.on('SIGTERM', () => {
  // Close connections
  // Then exit
});

# Must signal ready
if (process.send) {
  process.send('ready');
}

# And configure PM2 to wait
{
  wait_ready: true,
  listen_timeout: 30000
}

# Use reload, not restart
pm2 reload app-name  # ✅ Zero-downtime
pm2 restart app-name # ❌ Has downtime
```

---

## ✅ Definition of Done Checklist

Before completing Module 14, verify:

- [ ] **PM2 ecosystem config** created with cluster mode
- [ ] **Graceful shutdown** handles SIGTERM/SIGINT
- [ ] **Structured logging** with pino (JSON in production)
- [ ] **Request IDs** for request tracing
- [ ] **Sensitive data redacted** from logs
- [ ] **Health endpoints** created:
  - [ ] /health - detailed status
  - [ ] /health/live - liveness
  - [ ] /health/ready - readiness
- [ ] **Zero-downtime reload** works with pm2 reload
- [ ] **Log levels** appropriate per environment

### Quick Verification

```bash
# 1. Build and start with PM2
npm run build
pm2 start ecosystem.config.cjs --env production

# 2. Check cluster mode
pm2 ls
# Should show multiple instances

# 3. Test health endpoints
curl http://localhost:3000/health
curl http://localhost:3000/health/ready

# 4. Test zero-downtime reload
# In one terminal, run:
watch -n 0.1 'curl -s http://localhost:3000/health'

# In another terminal:
pm2 reload devjobs-api
# First terminal should show continuous responses

# 5. Check logs
pm2 logs devjobs-api --lines 20
# Should see structured JSON logs

# 6. Test graceful shutdown
pm2 stop devjobs-api
pm2 logs devjobs-api --lines 5
# Should see "Shutting down" message

# 7. Cleanup
pm2 delete devjobs-api
```

---

## 🎉 Module 14 Complete!

Congratulations! You've learned how to:

✅ **Configure environments** with type-safe validation
✅ **Containerize** your app with optimized Docker builds
✅ **Deploy** to modern platforms like Railway and Render
✅ **Run reliably** with PM2 clustering and graceful shutdown
✅ **Log properly** with structured JSON logging
✅ **Monitor health** with proper endpoints

**Your DevJobs Pro API is now production-ready!**

---

## 🔗 Navigation

| Previous                                                              | Home                                 | Next                                                     |
| --------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------- |
| [← Lesson 3: Deploy to Railway/Render](./03-deploy-railway-render.md) | [Module 14: Deployment](./README.md) | [Module 15: Advanced Topics →](../15-advanced/README.md) |

---

## 📚 Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Pino Logger](https://getpino.io/)
- [12 Factor App - Logs](https://12factor.net/logs)
- [Node.js Production Best Practices](https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices)

---

**You've completed the Deployment module! Your skills now include building, shipping, AND running production applications. 🚀**
