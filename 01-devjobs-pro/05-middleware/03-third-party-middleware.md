# Lesson 03: Third-Party Middleware

## 🎯 Hook: Don't Reinvent the Wheel

The Express ecosystem has battle-tested middleware for every common problem: security headers, CORS, logging, compression, rate limiting. These packages have been used in production by millions of apps and fixed edge cases you'd never think of.

Smart developers use proven solutions. Let's learn which middleware you need and how to configure them properly.

---

## 📚 Theory: The Essential Third-Party Stack

### Security Middleware Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     SECURITY MIDDLEWARE STACK                                │
└─────────────────────────────────────────────────────────────────────────────┘

  Incoming Request
        │
        ▼
  ┌─────────────────┐
  │    helmet()     │  Security headers (CSP, X-Frame-Options, etc.)
  │                 │  Protects against: XSS, clickjacking, MIME sniffing
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │     cors()      │  Cross-Origin Resource Sharing
  │                 │  Controls: Which domains can call your API
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │  rateLimiter()  │  Request rate limiting
  │                 │  Prevents: Brute force, DoS attacks
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ express.json()  │  Body parsing with size limits
  │   limit: 10kb   │  Prevents: Large payload attacks
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │  compression()  │  Gzip/Brotli compression
  │                 │  Reduces: Response size by ~70%
  └────────┬────────┘
           │
           ▼
      Route Handler
```

### The Middleware Lineup

| Package                 | Purpose               | When to Use                  |
| ----------------------- | --------------------- | ---------------------------- |
| `helmet`                | Security headers      | Always in production         |
| `cors`                  | Cross-origin requests | APIs called from browsers    |
| `morgan`                | HTTP request logging  | Development & production     |
| `compression`           | Response compression  | Always (reduces bandwidth)   |
| `rate-limiter-flexible` | Rate limiting         | Protect auth & API endpoints |

---

## 💻 Code Examples

### Example 1: Helmet - Security Headers

```typescript
import helmet from "helmet";

// Basic usage (applies all default protections)
app.use(helmet());

// With custom options
app.use(
  helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    // Allow embedding in iframes from same origin
    frameguard: { action: "sameorigin" },
    // Disable for APIs that don't serve HTML
    contentSecurityPolicy: false,
  }),
);
```

**Headers Helmet Sets:**

```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 0  (deprecated in modern browsers)
Strict-Transport-Security: max-age=15552000; includeSubDomains
Content-Security-Policy: ...
X-Download-Options: noopen
X-Permitted-Cross-Domain-Policies: none
Referrer-Policy: no-referrer
```

### Example 2: CORS - Cross-Origin Resource Sharing

```typescript
import cors from "cors";

// Allow all origins (NOT recommended for production)
app.use(cors());

// Allow specific origins
app.use(
  cors({
    origin: "https://devjobs-pro.com",
  }),
);

// Allow multiple origins
app.use(
  cors({
    origin: ["https://devjobs-pro.com", "https://admin.devjobs-pro.com"],
  }),
);

// Dynamic origin validation
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "https://devjobs-pro.com",
        "https://admin.devjobs-pro.com",
      ];

      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["X-Total-Count", "X-Request-Id"],
    maxAge: 86400, // Preflight cache: 24 hours
  }),
);
```

**CORS Flow:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CORS PREFLIGHT FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  Browser (https://frontend.com)              Server (https://api.devjobs-pro.com)
         │                                               │
         │  OPTIONS /api/jobs (Preflight)               │
         │  Origin: https://frontend.com                │
         │  Access-Control-Request-Method: POST         │
         │ ─────────────────────────────────────────────►│
         │                                               │
         │  204 No Content                              │
         │  Access-Control-Allow-Origin: https://...    │
         │  Access-Control-Allow-Methods: POST          │
         │◄───────────────────────────────────────────── │
         │                                               │
         │  POST /api/jobs (Actual Request)             │
         │  Origin: https://frontend.com                │
         │ ─────────────────────────────────────────────►│
         │                                               │
         │  201 Created                                 │
         │  Access-Control-Allow-Origin: https://...    │
         │◄───────────────────────────────────────────── │
```

### Example 3: Morgan - HTTP Request Logging

```typescript
import morgan from "morgan";

// Predefined formats
app.use(morgan("dev")); // Colored output for development
app.use(morgan("combined")); // Apache combined format (production)
app.use(morgan("common")); // Apache common format
app.use(morgan("tiny")); // Minimal output

// Custom format
app.use(
  morgan(":method :url :status :response-time ms - :res[content-length]"),
);

// Custom tokens
morgan.token("request-id", (req: Request) => req.requestId || "-");
morgan.token("user-id", (req: Request) => req.user?.id || "anonymous");

app.use(morgan(":request-id :user-id :method :url :status :response-time ms"));

// Skip certain requests
app.use(
  morgan("combined", {
    skip: (req, res) => {
      // Skip health checks and successful requests in production
      return req.path === "/api/health" || res.statusCode < 400;
    },
  }),
);

// Write to file (production)
import fs from "fs";
import path from "path";

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "../logs/access.log"),
  { flags: "a" }, // Append mode
);

app.use(morgan("combined", { stream: accessLogStream }));
```

**Morgan Output Examples:**

```bash
# 'dev' format (colored in terminal)
GET /api/jobs 200 45.123 ms - 1234
POST /api/jobs 201 123.456 ms - 89
GET /api/notfound 404 2.345 ms - 23

# 'combined' format (Apache style)
::1 - - [30/Jan/2026:10:15:30 +0000] "GET /api/jobs HTTP/1.1" 200 1234 "-" "Mozilla/5.0..."
```

### Example 4: Compression - Response Compression

```typescript
import compression from "compression";

// Basic usage
app.use(compression());

// With options
app.use(
  compression({
    level: 6, // Compression level (0-9, default: 6)
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
      // Don't compress if client doesn't support it
      if (req.headers["x-no-compression"]) {
        return false;
      }
      // Use default filter (checks Accept-Encoding)
      return compression.filter(req, res);
    },
  }),
);

// Note: In production, compression is often handled by nginx/reverse proxy
// But it's good to have as fallback
```

### Example 5: Rate Limiting with rate-limiter-flexible

```typescript
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import { Request, Response, NextFunction } from "express";

// General API rate limiter
const apiLimiter = new RateLimiterMemory({
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60, // Block for 60 seconds if exceeded
});

// Strict rate limiter for auth endpoints
const authLimiter = new RateLimiterMemory({
  points: 5, // 5 attempts
  duration: 60 * 15, // Per 15 minutes
  blockDuration: 60 * 60, // Block for 1 hour if exceeded
});

// Middleware factory
const rateLimiterMiddleware = (limiter: RateLimiterMemory) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const key = req.ip || req.socket.remoteAddress || "unknown";
      const rateLimiterRes = await limiter.consume(key);

      // Add rate limit headers
      res.setHeader("X-RateLimit-Limit", limiter.points);
      res.setHeader("X-RateLimit-Remaining", rateLimiterRes.remainingPoints);
      res.setHeader(
        "X-RateLimit-Reset",
        new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString(),
      );

      next();
    } catch (rateLimiterRes) {
      const retryAfter = Math.ceil(
        (rateLimiterRes as RateLimiterRes).msBeforeNext / 1000,
      );

      res.setHeader("Retry-After", retryAfter);
      res.setHeader("X-RateLimit-Limit", limiter.points);
      res.setHeader("X-RateLimit-Remaining", 0);

      res.status(429).json({
        success: false,
        error: "Too many requests",
        retryAfter,
      });
    }
  };
};

// Apply rate limiters
app.use("/api", rateLimiterMiddleware(apiLimiter));
app.use("/api/auth", rateLimiterMiddleware(authLimiter));
```

---

## 🛠️ Mini-Tutorial: Security-Hardened Express App

Create a production-ready security configuration:

```typescript
// src/middleware/security.ts
import helmet from "helmet";
import cors from "cors";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { Express, Request, Response, NextFunction } from "express";

interface SecurityConfig {
  corsOrigins: string[];
  apiRateLimit: { points: number; duration: number };
  authRateLimit: { points: number; duration: number };
}

export const configureSecurityMiddleware = (
  app: Express,
  config: SecurityConfig,
): void => {
  // ═══════════════════════════════════════════════════════════════
  // 1. HELMET - Security Headers
  // ═══════════════════════════════════════════════════════════════

  app.use(
    helmet({
      // Customize for API (disable HTML-specific protections)
      contentSecurityPolicy: false, // APIs don't serve HTML
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  // ═══════════════════════════════════════════════════════════════
  // 2. CORS - Cross-Origin Resource Sharing
  // ═══════════════════════════════════════════════════════════════

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, curl)
        if (!origin) {
          return callback(null, true);
        }

        // Check against allowed origins
        if (config.corsOrigins.includes(origin)) {
          callback(null, true);
        } else if (process.env.NODE_ENV === "development") {
          // Allow localhost in development
          if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
            callback(null, true);
          } else {
            callback(new Error(`CORS: Origin ${origin} not allowed`));
          }
        } else {
          callback(new Error(`CORS: Origin ${origin} not allowed`));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Request-Id",
        "X-Correlation-Id",
      ],
      exposedHeaders: [
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
        "X-Request-Id",
        "X-Total-Count",
      ],
      maxAge: 86400, // 24 hours
    }),
  );

  // ═══════════════════════════════════════════════════════════════
  // 3. RATE LIMITING
  // ═══════════════════════════════════════════════════════════════

  // General API limiter
  const apiLimiter = new RateLimiterMemory({
    points: config.apiRateLimit.points,
    duration: config.apiRateLimit.duration,
  });

  // Strict auth limiter
  const authLimiter = new RateLimiterMemory({
    points: config.authRateLimit.points,
    duration: config.authRateLimit.duration,
    blockDuration: 60 * 60, // 1 hour block
  });

  // Rate limit middleware factory
  const createRateLimiter = (limiter: RateLimiterMemory) => {
    return async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      try {
        const key = req.ip || "unknown";
        await limiter.consume(key);
        next();
      } catch {
        res.status(429).json({
          success: false,
          error: "Too many requests. Please try again later.",
        });
      }
    };
  };

  // Apply rate limiters
  app.use("/api", createRateLimiter(apiLimiter));
  app.use("/api/auth/login", createRateLimiter(authLimiter));
  app.use("/api/auth/register", createRateLimiter(authLimiter));
  app.use("/api/auth/forgot-password", createRateLimiter(authLimiter));
};

// ═══════════════════════════════════════════════════════════════
// USAGE
// ═══════════════════════════════════════════════════════════════

// src/app.ts
/*
import express from 'express';
import { configureSecurityMiddleware } from './middleware/security';

const app = express();

configureSecurityMiddleware(app, {
  corsOrigins: [
    process.env.FRONTEND_URL || 'https://devjobs-pro.com',
    'https://admin.devjobs-pro.com',
  ],
  apiRateLimit: { points: 100, duration: 60 }, // 100 req/min
  authRateLimit: { points: 5, duration: 900 },  // 5 req/15min
});

// ... rest of middleware and routes
*/
```

---

## 🎯 Practice: Configure DevJobs Pro Security Stack

Install and set up the complete security middleware:

```bash
# Install required packages
npm install helmet cors morgan compression rate-limiter-flexible
npm install -D @types/cors @types/morgan @types/compression
```

```typescript
// src/app.ts
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import { RateLimiterMemory } from "rate-limiter-flexible";

const app = express();

// ═══════════════════════════════════════════════════════════════
// SECURITY MIDDLEWARE (ORDER MATTERS!)
// ═══════════════════════════════════════════════════════════════

// 1. Helmet first - sets security headers on all responses
app.use(helmet());

// 2. CORS - handle preflight and set CORS headers
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
    credentials: true,
  }),
);

// 3. Morgan - log all requests
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// 4. Compression - compress all responses
app.use(compression());

// 5. Rate limiting - prevent abuse
const limiter = new RateLimiterMemory({
  points: 100,
  duration: 60,
});

app.use(async (req, res, next) => {
  try {
    await limiter.consume(req.ip || "unknown");
    next();
  } catch {
    res.status(429).json({ error: "Too many requests" });
  }
});

// 6. Body parsing (after rate limiting to prevent large payload DoS)
app.use(express.json({ limit: "10kb" }));

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ... rest of routes

export default app;
```

---

## 💡 Pro Tips

### 1. Always Use Helmet in Production

```typescript
// ❌ Running without helmet exposes security vulnerabilities
const app = express();
app.use("/api", routes);

// ✅ Always include helmet
import helmet from "helmet";
const app = express();
app.use(helmet());
app.use("/api", routes);
```

### 2. Never Use `cors({ origin: '*' })` with Credentials

```typescript
// ❌ DANGEROUS: Allows any origin with credentials
app.use(
  cors({
    origin: "*",
    credentials: true, // This combination is dangerous!
  }),
);

// ✅ SAFE: Explicit origins with credentials
app.use(
  cors({
    origin: ["https://your-frontend.com"],
    credentials: true,
  }),
);

// ✅ SAFE: Wildcard without credentials (public API)
app.use(
  cors({
    origin: "*",
    credentials: false,
  }),
);
```

### 3. Rate-Limit Auth Endpoints Heavily

```typescript
// General API: 100 requests per minute
// Auth endpoints: 5 requests per 15 minutes

const authLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60 * 15, // 15 minutes
  blockDuration: 60 * 60, // Block for 1 hour after exceeded
});

// Apply to sensitive endpoints
app.use("/api/auth/login", rateLimiter(authLimiter));
app.use("/api/auth/register", rateLimiter(authLimiter));
app.use("/api/auth/forgot-password", rateLimiter(authLimiter));
app.use("/api/auth/reset-password", rateLimiter(authLimiter));
```

### 4. Use Morgan Wisely in Production

```typescript
// Development: Log everything with colors
app.use(morgan("dev"));

// Production: Log to file, skip health checks
import fs from "fs";
import path from "path";

if (process.env.NODE_ENV === "production") {
  const logStream = fs.createWriteStream(
    path.join(__dirname, "../logs/access.log"),
    { flags: "a" },
  );

  app.use(
    morgan("combined", {
      stream: logStream,
      skip: (req) => req.path === "/api/health",
    }),
  );
} else {
  app.use(morgan("dev"));
}
```

---

## 🐛 5-Minute Debugger

### Problem 1: "CORS Error" in Browser

**Symptom:** Browser console shows "CORS policy" error.

```
Access to XMLHttpRequest at 'https://api.example.com/jobs' from origin
'https://frontend.com' has been blocked by CORS policy: No
'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Common Causes & Fixes:**

```typescript
// Cause 1: CORS middleware not applied
// ✅ Fix: Add cors middleware BEFORE routes
app.use(cors());
app.use("/api", routes);

// ───────────────────────────────────────────────────

// Cause 2: Origin not in allowed list
// ✅ Fix: Add your frontend origin
app.use(
  cors({
    origin: ["https://your-frontend.com", "http://localhost:3000"],
  }),
);

// ───────────────────────────────────────────────────

// Cause 3: Credentials sent but not allowed
// Frontend: fetch(url, { credentials: 'include' })
// ✅ Fix: Enable credentials in CORS config
app.use(
  cors({
    origin: "https://your-frontend.com",
    credentials: true,
  }),
);

// ───────────────────────────────────────────────────

// Cause 4: Error thrown before CORS headers set
// If your error handler runs before CORS, no headers are set
// ✅ Fix: Apply CORS early in middleware chain
app.use(cors()); // First!
app.use(express.json());
app.use("/api", routes);
app.use(errorHandler); // Last
```

### Problem 2: "429 Too Many Requests" Issues

**Symptom:** Legitimate users getting rate limited.

```typescript
// Cause 1: Limit too strict
// ✅ Fix: Increase limits for legitimate use
const limiter = new RateLimiterMemory({
  points: 200, // Increase from 100
  duration: 60,
});

// Cause 2: All requests from same IP (behind proxy)
// ✅ Fix: Trust proxy and use X-Forwarded-For
app.set("trust proxy", 1);
// Now req.ip uses X-Forwarded-For header

// Cause 3: Rate limiting health checks
// ✅ Fix: Skip health check endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
}); // BEFORE rate limiter

app.use("/api", rateLimiter); // After health check
```

### Problem 3: "Request Headers Not Allowed"

**Symptom:** Preflight fails for custom headers.

```typescript
// Client sending: Authorization, X-Custom-Header
// Server doesn't allow them

// ✅ Fix: Add headers to allowedHeaders
app.use(
  cors({
    origin: "https://frontend.com",
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Custom-Header", // Add your custom headers
    ],
  }),
);
```

### Problem 4: "Response Headers Not Visible to JavaScript"

**Symptom:** Can't access `X-Total-Count` header in frontend.

```typescript
// Headers exist but browser won't expose them to JS
// Only "simple" headers are exposed by default

// ✅ Fix: Add to exposedHeaders
app.use(
  cors({
    origin: "https://frontend.com",
    exposedHeaders: ["X-Total-Count", "X-Request-Id", "X-RateLimit-Remaining"],
  }),
);

// Frontend can now access:
// response.headers.get('X-Total-Count')
```

---

## 📋 Definition of Done

By the end of this lesson, you should be able to:

- [ ] Install and configure `helmet` for security headers
- [ ] Set up `cors` with proper origin validation
- [ ] Configure `morgan` for request logging
- [ ] Implement rate limiting with `rate-limiter-flexible`
- [ ] Debug CORS errors effectively
- [ ] Understand the order of security middleware

---

## 🔗 Navigation

| Previous                                            | Up                                   | Next                                                               |
| --------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------ |
| [← Built-in Middleware](./02-builtin-middleware.md) | [Module 05: Middleware](./README.md) | [Custom Middleware Creation →](./04-custom-middleware-creation.md) |

---

## 📚 Further Reading

- [Helmet Documentation](https://helmetjs.github.io/)
- [Express CORS Guide](https://expressjs.com/en/resources/middleware/cors.html)
- [Morgan README](https://github.com/expressjs/morgan)
- [Rate Limiter Flexible](https://github.com/animir/node-rate-limiter-flexible)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
