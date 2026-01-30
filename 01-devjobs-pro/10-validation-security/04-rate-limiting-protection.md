# Lesson 4: Rate Limiting and Protection

## Protect Your API From Abuse

> "A startup founder once called me at 2 AM. Their API was down. A competitor had written a script that made 10,000 requests per second to their expensive AI endpoint. Three hours of unprotected traffic later, they had a $47,000 cloud bill and a crashed service. Rate limiting isn't optional—it's insurance."

Your API is a shared resource. Without limits, one bad actor—or even one buggy client—can consume all your server's resources, denying service to legitimate users. Rate limiting is how you ensure fair access.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RATE LIMITING OVERVIEW                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  WITHOUT RATE LIMITING                  WITH RATE LIMITING                  │
│  ─────────────────────                  ────────────────────                 │
│                                                                             │
│  Attacker                               Attacker                            │
│     │ 1000 req/sec                         │ 1000 req/sec                   │
│     ▼                                      ▼                                │
│  ┌──────┐                              ┌──────────┐                         │
│  │Server│ → 😵 Overwhelmed             │  Gate    │                         │
│  └──────┘   All users affected         │ (Limiter)│                         │
│                                        └────┬─────┘                         │
│                                             │                               │
│                                    ┌────────┴────────┐                      │
│                                    │                 │                      │
│                                    ▼                 ▼                      │
│                              100 req/min        900 req → 429              │
│                              (allowed)          (rejected)                  │
│                                    │                                        │
│                                    ▼                                        │
│                               ┌──────┐                                      │
│                               │Server│ → 😊 Healthy                        │
│                               └──────┘   Legitimate users served           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Rate Limiting Algorithms

### Algorithm Comparison

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RATE LIMITING ALGORITHMS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. FIXED WINDOW                                                            │
│  ───────────────                                                            │
│  • Count requests in fixed time intervals                                   │
│  • Simple but can allow bursts at window boundaries                        │
│                                                                             │
│     Window 1        Window 2                                               │
│  ├────────────────┼────────────────┤                                       │
│  │ ████████       │ ████████       │  Max 100 per window                   │
│  │ (80 req)       │ (95 req)       │                                       │
│  └────────────────┴────────────────┘                                       │
│                   ↑                                                         │
│         At boundary: 80+100 = 180 requests possible in short span          │
│                                                                             │
│  2. SLIDING WINDOW                                                          │
│  ─────────────────                                                          │
│  • Smooths out the fixed window problem                                    │
│  • Counts requests in rolling time period                                  │
│                                                                             │
│           ◄───── Sliding Window ─────►                                     │
│  ├───────────────────────────────────────┤                                 │
│  │     ████████████████████              │  Smoother rate                  │
│  └───────────────────────────────────────┘                                 │
│              ↑ Window slides with time                                     │
│                                                                             │
│  3. TOKEN BUCKET                                                            │
│  ────────────────                                                           │
│  • Bucket fills with tokens over time                                      │
│  • Each request consumes a token                                           │
│  • Allows controlled bursts                                                │
│                                                                             │
│     ┌─────────┐                                                            │
│     │ ○ ○ ○ ○ │  ← Tokens accumulate (10/sec)                             │
│     │ ○ ○ ○   │  ← Request takes 1 token                                  │
│     │ ○ ○     │  ← Bucket has max capacity                                │
│     └─────────┘                                                            │
│                                                                             │
│  4. LEAKY BUCKET                                                            │
│  ────────────────                                                           │
│  • Requests queue up (bucket fills)                                        │
│  • Processed at constant rate (leaks out)                                  │
│  • Smoothest output, but adds latency                                      │
│                                                                             │
│     ┌─────────┐                                                            │
│     │ req req │  ← Requests enter                                         │
│     │ req req │                                                            │
│     │   │     │                                                            │
│     └───┼─────┘                                                            │
│         ▼                                                                   │
│       (drip) → Constant output rate                                        │
│                                                                             │
│  RECOMMENDATION: Sliding window for APIs, Token bucket for bursts          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## express-rate-limit Basics

### Installation

```bash
npm install express-rate-limit
```

### Basic Setup

```typescript
// JavaScript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: "Too many requests, please try again later.",
  },
});

app.use(limiter);
```

```typescript
// TypeScript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    success: false,
    error: "Too many requests, please try again later.",
  },
});

app.use("/api", limiter);
```

### Configuration Options

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  // Time window for counting requests
  windowMs: 15 * 60 * 1000, // 15 minutes

  // Max requests per window
  max: 100,

  // Response message when limit exceeded
  message: {
    success: false,
    error: "Too many requests. Please try again in 15 minutes.",
    retryAfter: 900, // seconds
  },

  // Status code when limit exceeded
  statusCode: 429, // Too Many Requests

  // Include standard rate limit headers
  standardHeaders: true, // RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset
  legacyHeaders: false, // X-RateLimit-* (deprecated)

  // Skip certain requests
  skip: (req) => {
    // Skip rate limiting for internal health checks
    return req.path === "/health";
  },

  // Custom key generator (default: IP address)
  keyGenerator: (req) => {
    return req.ip || "unknown";
  },

  // Handler for when limit is exceeded
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});
```

---

## Different Limits for Different Routes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TIERED RATE LIMITING                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ENDPOINT TYPE          LIMIT          REASON                               │
│  ─────────────────────────────────────────────────────────────────────────  │
│  GET /health            Unlimited      Monitoring/load balancers           │
│  POST /auth/login       5/min          Prevent brute force                 │
│  POST /auth/register    3/hour         Prevent spam accounts               │
│  POST /auth/forgot-pwd  3/hour         Prevent email spam                  │
│  GET /api/*             100/15min      Normal API usage                    │
│  POST /api/*            30/15min       Writes are more expensive           │
│  POST /api/jobs         10/hour        Prevent job spam                    │
│  POST /api/messages     20/min         Chat rate limiting                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Implementation

```typescript
// src/middleware/rate-limit.ts
import rateLimit from "express-rate-limit";

// General API limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 attempts per minute
  message: {
    success: false,
    error: "Too many login attempts. Please try again in 1 minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Very strict limiter for password reset
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    success: false,
    error: "Too many password reset attempts. Please try again in 1 hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for account creation
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registrations per hour per IP
  message: {
    success: false,
    error: "Too many accounts created. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Job posting limiter
export const jobPostingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 jobs per hour
  message: {
    success: false,
    error: "Job posting limit reached. Try again in 1 hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

### Applying to Routes

```typescript
// src/routes/auth.routes.ts
import { Router } from "express";
import {
  authLimiter,
  passwordResetLimiter,
  registrationLimiter,
} from "../middleware/rate-limit";

const router = Router();

router.post("/register", registrationLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post(
  "/forgot-password",
  passwordResetLimiter,
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  passwordResetLimiter,
  authController.resetPassword,
);

export default router;
```

```typescript
// src/routes/job.routes.ts
import { Router } from "express";
import { apiLimiter, jobPostingLimiter } from "../middleware/rate-limit";

const router = Router();

router.get("/", apiLimiter, jobController.list);
router.get("/:id", apiLimiter, jobController.get);
router.post("/", jobPostingLimiter, authMiddleware, jobController.create);
router.put("/:id", apiLimiter, authMiddleware, jobController.update);

export default router;
```

---

## User-Based vs IP-Based Limiting

### IP-Based (Default)

```typescript
// Default: Uses req.ip
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  // Default keyGenerator uses req.ip
});
```

### User-Based Limiting

```typescript
// Rate limit by authenticated user ID
const userBasedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => {
    // Use user ID if authenticated, IP otherwise
    return req.user?.id || req.ip || "anonymous";
  },
});
```

### Combined Approach

```typescript
// Different limits for authenticated vs anonymous users
const smartLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req) => {
    // Authenticated users get higher limits
    if (req.user) {
      return req.user.isPremium ? 1000 : 200;
    }
    // Anonymous users get lower limits
    return 50;
  },
  keyGenerator: (req) => {
    return req.user?.id || req.ip || "anonymous";
  },
});
```

---

## Redis-Backed Rate Limiting

For distributed systems (multiple server instances), you need shared state. Redis is the standard solution.

### Installation

```bash
npm install rate-limit-redis ioredis
```

### Configuration

```typescript
// src/middleware/rate-limit.ts
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";

// Create Redis client
const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  enableOfflineQueue: false, // Fail fast if Redis is down
});

// Handle Redis errors
redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

// Create rate limiter with Redis store
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,

  // Use Redis store for distributed rate limiting
  store: new RedisStore({
    // Use ioredis client
    sendCommand: (...args: string[]) => redisClient.call(...args),
    // Prefix for Redis keys
    prefix: "rl:api:",
  }),

  message: {
    success: false,
    error: "Too many requests. Please try again later.",
  },
});

// Fallback to memory store if Redis is unavailable
export function createRateLimiter(options: Partial<rateLimit.Options>) {
  try {
    return rateLimit({
      ...options,
      store: new RedisStore({
        sendCommand: (...args: string[]) => redisClient.call(...args),
        prefix: "rl:",
      }),
    });
  } catch (error) {
    console.warn("Redis unavailable, using memory store for rate limiting");
    return rateLimit(options);
  }
}
```

### Redis Store Benefits

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MEMORY vs REDIS STORE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MEMORY STORE (Default)                 REDIS STORE                         │
│  ─────────────────────                  ───────────                          │
│                                                                             │
│  ┌─────────┐   ┌─────────┐             ┌─────────┐   ┌─────────┐           │
│  │Server 1 │   │Server 2 │             │Server 1 │   │Server 2 │           │
│  │ Count:50│   │ Count:50│             │         │   │         │           │
│  └─────────┘   └─────────┘             └────┬────┘   └────┬────┘           │
│       │             │                       │             │                 │
│       ▼             ▼                       │             │                 │
│  User gets 100 requests total               ▼             ▼                 │
│       (50 to each server)             ┌─────────────────────┐              │
│                                       │       REDIS         │              │
│  ❌ Rate limit bypassed!              │    Count: 100       │              │
│                                       └─────────────────────┘              │
│                                                                             │
│                                       ✅ Shared count across servers        │
│                                                                             │
│  USE MEMORY: Single server, dev       USE REDIS: Multiple servers, prod    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Slow-Down Middleware

Instead of blocking, gradually slow down responses:

```bash
npm install express-slow-down
```

```typescript
import slowDown from "express-slow-down";

// Gradually add delay after threshold
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Start delaying after 50 requests
  delayMs: (hits) => hits * 100, // Add 100ms per request over limit
  maxDelayMs: 5000, // Maximum 5 second delay
});

// Combine with rate limiter
app.use("/api", speedLimiter);
app.use("/api", apiLimiter);
```

---

## Mini-Tutorial: Tiered Rate Limiting for DevJobs Pro

Let's implement a complete rate limiting system.

### Step 1: Create Rate Limit Configuration

```typescript
// src/config/rate-limit.config.ts

interface RateLimitConfig {
  windowMs: number;
  max: number | ((req: Request) => number);
  message: object;
}

export const rateLimitConfigs: Record<string, RateLimitConfig> = {
  // General API - sliding window
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
      success: false,
      error: "Rate limit exceeded. Please try again in 15 minutes.",
      code: "RATE_LIMIT_EXCEEDED",
    },
  },

  // Authentication - very strict
  auth: {
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: {
      success: false,
      error: "Too many authentication attempts. Please wait 1 minute.",
      code: "AUTH_RATE_LIMIT",
    },
  },

  // Account creation - prevent spam
  registration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
      success: false,
      error: "Account creation limit reached. Try again in 1 hour.",
      code: "REGISTRATION_LIMIT",
    },
  },

  // Job posting - moderate
  jobPosting: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: (req: any) => {
      // Premium employers get higher limits
      if (req.user?.subscription === "premium") return 50;
      if (req.user?.subscription === "basic") return 20;
      return 5; // Free tier
    },
    message: {
      success: false,
      error: "Job posting limit reached for your plan.",
      code: "JOB_POSTING_LIMIT",
    },
  },

  // Job applications - prevent spam applications
  application: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 25, // 25 applications per hour
    message: {
      success: false,
      error: "Application limit reached. Please try again later.",
      code: "APPLICATION_LIMIT",
    },
  },

  // Search - allow more reads
  search: {
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: {
      success: false,
      error: "Search rate limit exceeded. Please slow down.",
      code: "SEARCH_LIMIT",
    },
  },
};
```

### Step 2: Create Rate Limiter Factory

```typescript
// src/middleware/rate-limit.ts
import rateLimit, { Options } from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";
import { rateLimitConfigs } from "../config/rate-limit.config";

// Initialize Redis (with fallback)
let redisClient: Redis | null = null;

try {
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);
    redisClient.on("error", (err) => {
      console.error("Redis rate limit error:", err.message);
    });
  }
} catch (error) {
  console.warn("Redis not available for rate limiting, using memory store");
}

// Create limiter with optional Redis backing
function createLimiter(name: string, overrides?: Partial<Options>) {
  const config = rateLimitConfigs[name];
  if (!config) {
    throw new Error(`Rate limit config not found: ${name}`);
  }

  const options: Partial<Options> = {
    windowMs: config.windowMs,
    max: config.max,
    message: config.message,
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: false,
    ...overrides,
  };

  // Use Redis store if available
  if (redisClient) {
    options.store = new RedisStore({
      sendCommand: (...args: string[]) => redisClient!.call(...args),
      prefix: `rl:${name}:`,
    });
  }

  return rateLimit(options);
}

// Export pre-configured limiters
export const apiLimiter = createLimiter("api");
export const authLimiter = createLimiter("auth");
export const registrationLimiter = createLimiter("registration");
export const jobPostingLimiter = createLimiter("jobPosting");
export const applicationLimiter = createLimiter("application");
export const searchLimiter = createLimiter("search");

// Custom limiter for specific needs
export { createLimiter };
```

### Step 3: Create Trust Proxy Middleware

```typescript
// src/middleware/trust-proxy.ts
import { Express } from "express";

export function configureTrustProxy(app: Express): void {
  // Trust proxy in production (behind load balancer/reverse proxy)
  if (process.env.NODE_ENV === "production") {
    // Trust first proxy (adjust based on your infrastructure)
    app.set("trust proxy", 1);
    console.log("✅ Trust proxy enabled");
  }
}
```

### Step 4: Apply to Application

```typescript
// src/app.ts
import express from "express";
import { configureTrustProxy } from "./middleware/trust-proxy";
import { apiLimiter } from "./middleware/rate-limit";
import authRoutes from "./routes/auth.routes";
import jobRoutes from "./routes/job.routes";

const app = express();

// Configure trust proxy FIRST (before rate limiting)
configureTrustProxy(app);

// Apply global rate limit to all API routes
app.use("/api", apiLimiter);

// Mount routes (they have their own specific limiters)
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);

export default app;
```

### Step 5: Route-Level Limiters

```typescript
// src/routes/auth.routes.ts
import { Router } from "express";
import { authLimiter, registrationLimiter } from "../middleware/rate-limit";
import * as authController from "../controllers/auth.controller";

const router = Router();

// Registration has its own strict limiter
router.post("/register", registrationLimiter, authController.register);

// Login/auth endpoints share auth limiter
router.post("/login", authLimiter, authController.login);
router.post("/refresh", authLimiter, authController.refreshToken);
router.post("/forgot-password", authLimiter, authController.forgotPassword);

export default router;
```

```typescript
// src/routes/job.routes.ts
import { Router } from "express";
import { jobPostingLimiter, searchLimiter } from "../middleware/rate-limit";
import { authenticate } from "../middleware/auth";
import * as jobController from "../controllers/job.controller";

const router = Router();

// Search has its own limiter (more permissive)
router.get("/", searchLimiter, jobController.search);
router.get("/:id", jobController.getById);

// Posting has strict limiter
router.post("/", authenticate, jobPostingLimiter, jobController.create);
router.put("/:id", authenticate, jobController.update);

export default router;
```

---

## Practice: DevJobs Pro Rate Limits

### Task 1: Implement Application Rate Limiting

Create rate limiting for job applications that:

- Limits to 10 applications per hour per user
- Anonymous users cannot apply (handled by auth, but limiter should still work)
- Premium candidates get 50 applications per hour

```typescript
// TODO: Implement in src/middleware/rate-limit.ts
```

### Task 2: Admin Override

Create a way for admin users to bypass rate limits:

```typescript
// TODO: Implement skip function for admin users
```

### Task 3: Dynamic Rate Limiting

Implement rate limiting that adjusts based on server load:

```typescript
// TODO: When server is under heavy load, reduce limits
```

<details>
<summary>💡 Solution: Application Rate Limiting</summary>

```typescript
// src/middleware/rate-limit.ts

// Application rate limiter with user-based tiers
export const applicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req: any) => {
    if (!req.user) return 0; // Must be authenticated
    if (req.user.subscription === "premium") return 50;
    return 10;
  },
  keyGenerator: (req: any) => {
    // Use user ID, not IP (so users on shared IPs don't affect each other)
    return req.user?.id || req.ip || "anonymous";
  },
  skip: (req: any) => {
    // Skip rate limiting for admins
    return req.user?.role === "admin";
  },
  message: (req: any) => ({
    success: false,
    error:
      req.user?.subscription === "premium"
        ? "Premium application limit reached (50/hour)."
        : "Application limit reached (10/hour). Upgrade for higher limits.",
    code: "APPLICATION_LIMIT",
    upgradeUrl: "/pricing",
  }),
  standardHeaders: true,
  legacyHeaders: false,
});

// Dynamic rate limiting based on server load
import os from "os";

function getServerLoad(): number {
  const cpus = os.cpus();
  const load = os.loadavg()[0]; // 1 minute average
  return load / cpus.length; // Normalized load (0-1+)
}

export const dynamicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: () => {
    const load = getServerLoad();
    if (load > 0.8) return 25; // High load: strict limit
    if (load > 0.5) return 50; // Medium load: reduced limit
    return 100; // Normal: standard limit
  },
  message: () => {
    const load = getServerLoad();
    return {
      success: false,
      error:
        load > 0.8
          ? "Server under heavy load. Please try again shortly."
          : "Rate limit exceeded.",
      code: "RATE_LIMIT",
    };
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

</details>

---

## Pro Tips vs Junior Traps

| Pro Tip 🎯                                 | Junior Trap ⚠️                            |
| ------------------------------------------ | ----------------------------------------- |
| Use Redis store for production             | Use memory store with multiple servers    |
| Set `trust proxy` correctly                | Get wrong client IPs behind load balancer |
| Use user ID for auth'd routes, IP for anon | Only use IP (shared IPs cause issues)     |
| Return `Retry-After` header                | Just return 429 without timing info       |
| Skip rate limiting for health checks       | Rate limit internal monitoring            |
| Different limits per subscription tier     | Same limits for everyone                  |
| Combine rate limit with slow-down          | Only hard-block at limit                  |
| Log rate limit events for analysis         | No visibility into blocked requests       |

---

## 5-Minute Debugger 🐛

### Problem: "Too Many Requests" but I haven't exceeded limit

````
┌─────────────────────────────────────────────────────────────────────────────┐
│  SYMPTOM: Getting 429 errors unexpectedly                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  STEP 1: Check trust proxy setting                                         │
│  ──────────────────────────────────                                         │
│  Behind reverse proxy? IP might be wrong.                                  │
│                                                                             │
│  ```                                                                        │
│  // Check what IP the server sees                                          │
│  app.get('/debug-ip', (req, res) => {                                      │
│    res.json({                                                              │
│      ip: req.ip,                                                           │
│      ips: req.ips,                                                         │
│      headers: {                                                            │
│        'x-forwarded-for': req.headers['x-forwarded-for'],                 │
│        'x-real-ip': req.headers['x-real-ip'],                             │
│      }                                                                     │
│    });                                                                     │
│  });                                                                        │
│  ```                                                                        │
│                                                                             │
│  FIX: Set trust proxy appropriately                                        │
│  ```                                                                        │
│  app.set('trust proxy', 1);  // Trust first proxy                         │
│  ```                                                                        │
│                                                                             │
│  STEP 2: Check key generator                                               │
│  ────────────────────────────                                               │
│  Multiple users sharing same key?                                          │
│                                                                             │
│  ```                                                                        │
│  keyGenerator: (req) => {                                                  │
│    console.log('Rate limit key:', req.ip, req.user?.id);                  │
│    return req.user?.id || req.ip;                                          │
│  }                                                                          │
│  ```                                                                        │
│                                                                             │
│  STEP 3: Check Redis connection                                            │
│  ──────────────────────────────                                             │
│  Is Redis responding? Is store working?                                    │
│                                                                             │
│  STEP 4: Check window timing                                               │
│  ───────────────────────────                                                │
│  Did you hit limit in previous window that hasn't expired?                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
````

### Problem: Rate limit headers not appearing

```typescript
// Make sure standardHeaders is enabled
const limiter = rateLimit({
  standardHeaders: true, // Sends RateLimit-* headers
  legacyHeaders: false, // Don't send old X-RateLimit-* headers
});

// Headers you should see:
// RateLimit-Limit: 100
// RateLimit-Remaining: 99
// RateLimit-Reset: 1640995200 (Unix timestamp)
```

### Problem: Different behavior in development vs production

```typescript
// Check if Redis is being used
redisClient.on("connect", () => {
  console.log("Rate limiting using Redis store");
});

redisClient.on("error", () => {
  console.log("Rate limiting falling back to memory store");
});

// Memory store resets on server restart!
// This is fine for dev, problematic for prod
```

### Debug Checklist

```
□ Is trust proxy configured correctly?
□ Are you behind a load balancer/reverse proxy?
□ Is the key generator returning unique keys?
□ Is Redis connected (for distributed setup)?
□ Are rate limit headers present in response?
□ Have you waited for the window to reset?
□ Are health check endpoints excluded?
□ Is the correct limiter applied to the route?
```

---

## Definition of Done ✅

Before completing this module, verify:

- [ ] **express-rate-limit installed**: `npm list express-rate-limit`
- [ ] **Trust proxy configured**: For production behind proxy
- [ ] **Multiple limiters created**: Different limits for auth, API, posting
- [ ] **Redis store configured**: For distributed/production use
- [ ] **Standard headers enabled**: Clients receive rate limit info
- [ ] **Route-specific limits**: Auth routes have stricter limits
- [ ] **User-based limiting**: Authenticated users use user ID as key
- [ ] **Tested limits**: Confirmed 429 responses when exceeded

### Quick Rate Limit Test

```bash
# Test rate limit headers
curl -v http://localhost:3000/api/jobs

# Look for:
# RateLimit-Limit: 100
# RateLimit-Remaining: 99
# RateLimit-Reset: ...

# Test exceeding limit (adjust limit to 2 for testing)
for i in {1..5}; do curl http://localhost:3000/api/auth/login -X POST -d '{}'; done

# Should see 429 after limit exceeded
```

---

## Module Summary

Congratulations! You've completed Module 10: Validation and Security. You've learned:

1. **Input Validation with Zod**: Type-safe schema validation
2. **Data Sanitization**: Removing malicious content from user input
3. **Security Headers & CORS**: Protecting users with HTTP headers
4. **Rate Limiting**: Defending against API abuse

Your DevJobs Pro API is now secured with:

- ✅ All input validated with Zod schemas
- ✅ User content sanitized against XSS
- ✅ Security headers via Helmet
- ✅ CORS configured for your frontend
- ✅ Rate limits protecting all endpoints

---

## What's Next?

With security in place, you're ready to add **Authentication**—verifying who users are and what they can do.

In **Module 11: Authentication**, you'll learn:

- Password hashing with bcrypt
- JWT tokens for stateless auth
- Session management
- OAuth integration

---

## Navigation

| Previous                                                           | Current                     | Next                                                        |
| ------------------------------------------------------------------ | --------------------------- | ----------------------------------------------------------- |
| [Lesson 3: Security Headers](./03-security-headers-helmet-cors.md) | **Lesson 4: Rate Limiting** | [Module 11: Authentication](../11-authentication/README.md) |
