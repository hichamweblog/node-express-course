# Lesson 3: Security Headers and CORS

## HTTP Headers Are Your Invisible Security Guards

> "A junior developer once asked me why their perfectly working API suddenly broke when deployed. 'It works on localhost!' they said. The answer was CORS—the browser was protecting users from potentially malicious cross-origin requests. Once you understand CORS, it becomes your ally, not your enemy."

Every HTTP response your server sends can include headers that instruct browsers how to handle security. These headers are invisible to users but crucial for protection. Without them, you're leaving your front door unlocked.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SECURITY HEADERS IN ACTION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  HTTP Response                                                              │
│  ─────────────                                                              │
│  HTTP/1.1 200 OK                                                            │
│  Content-Type: application/json                                             │
│                                                                             │
│  // Without Helmet (Vulnerable)         // With Helmet (Protected)          │
│  X-Powered-By: Express                  [REMOVED - Don't advertise stack]  │
│  [MISSING]                              X-Content-Type-Options: nosniff     │
│  [MISSING]                              X-Frame-Options: SAMEORIGIN         │
│  [MISSING]                              X-XSS-Protection: 0                 │
│  [MISSING]                              Strict-Transport-Security: max-age= │
│  [MISSING]                              Content-Security-Policy: default-src│
│  [MISSING]                              Referrer-Policy: no-referrer        │
│                                                                             │
│  {"data": "..."}                        {"data": "..."}                     │
│                                                                             │
│  RESULT: Server fingerprinted,          RESULT: Browser enforces security  │
│  clickjacking possible,                 policies, attacks blocked          │
│  mixed content allowed                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Understanding Security Headers

### Key Headers Explained

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SECURITY HEADERS REFERENCE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  HEADER                         PURPOSE                                     │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Content-Security-Policy       Controls what resources browser can load     │
│  (CSP)                         Prevents XSS, clickjacking, data injection  │
│                                                                             │
│  X-Frame-Options               Prevents clickjacking (embedding in iframe) │
│                                DENY | SAMEORIGIN | ALLOW-FROM uri           │
│                                                                             │
│  X-Content-Type-Options        Prevents MIME type sniffing                  │
│                                nosniff                                      │
│                                                                             │
│  Strict-Transport-Security     Forces HTTPS connections                     │
│  (HSTS)                        max-age=31536000; includeSubDomains          │
│                                                                             │
│  X-XSS-Protection              Legacy XSS filter (now disabled)             │
│                                0 (modern browsers have better protection)   │
│                                                                             │
│  Referrer-Policy               Controls referrer information in requests    │
│                                no-referrer | same-origin | strict-origin    │
│                                                                             │
│  Permissions-Policy            Controls browser features (camera, mic, etc) │
│                                geolocation=(), camera=(), microphone=()     │
│                                                                             │
│  Cross-Origin-Opener-Policy    Isolates browsing context                    │
│  (COOP)                        same-origin                                  │
│                                                                             │
│  Cross-Origin-Resource-Policy  Controls cross-origin resource loading       │
│  (CORP)                        same-origin | same-site | cross-origin       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Content Security Policy (CSP) Deep Dive

CSP is the most powerful security header—it tells browsers exactly what resources they're allowed to load.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CSP DIRECTIVE BREAKDOWN                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Content-Security-Policy:                                                   │
│    default-src 'self';            // Default: only same origin             │
│    script-src 'self' cdn.js.com;  // Scripts: self + specific CDN          │
│    style-src 'self' 'unsafe-inline'; // Styles: self + inline (needed)    │
│    img-src 'self' data: https:;   // Images: self + data URIs + HTTPS     │
│    font-src 'self' fonts.com;     // Fonts: self + font service           │
│    connect-src 'self' api.com;    // XHR/Fetch: self + API domain         │
│    frame-ancestors 'none';        // Not embeddable in frames              │
│    form-action 'self';            // Forms can only submit to self        │
│    upgrade-insecure-requests;     // Upgrade HTTP to HTTPS                 │
│                                                                             │
│  COMMON VALUES:                                                             │
│  ──────────────                                                             │
│  'self'          - Same origin only                                        │
│  'none'          - Block all                                               │
│  'unsafe-inline' - Allow inline scripts/styles (try to avoid)             │
│  'unsafe-eval'   - Allow eval() (dangerous, avoid)                        │
│  https:          - Any HTTPS source                                        │
│  data:           - data: URIs                                              │
│  *.example.com   - Specific domain with wildcard                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Helmet.js: Security Headers Made Easy

Helmet is Express middleware that sets security headers with sensible defaults.

### Installation

```bash
npm install helmet
```

### Basic Usage

```typescript
// JavaScript
const helmet = require("helmet");
const express = require("express");

const app = express();
app.use(helmet()); // Apply all default security headers
```

```typescript
// TypeScript
import helmet from "helmet";
import express from "express";

const app = express();
app.use(helmet()); // Apply all default security headers
```

### What Helmet Enables by Default

```typescript
// helmet() is equivalent to:
app.use(helmet.contentSecurityPolicy()); // CSP
app.use(helmet.crossOriginEmbedderPolicy()); // COEP
app.use(helmet.crossOriginOpenerPolicy()); // COOP
app.use(helmet.crossOriginResourcePolicy()); // CORP
app.use(helmet.dnsPrefetchControl()); // DNS prefetch control
app.use(helmet.frameguard()); // X-Frame-Options
app.use(helmet.hidePoweredBy()); // Remove X-Powered-By
app.use(helmet.hsts()); // HSTS
app.use(helmet.ieNoOpen()); // X-Download-Options
app.use(helmet.noSniff()); // X-Content-Type-Options
app.use(helmet.originAgentCluster()); // Origin-Agent-Cluster
app.use(helmet.permittedCrossDomainPolicies()); // X-Permitted-Cross-Domain-Policies
app.use(helmet.referrerPolicy()); // Referrer-Policy
app.use(helmet.xssFilter()); // X-XSS-Protection: 0
```

### Custom Helmet Configuration

```typescript
import helmet from "helmet";

app.use(
  helmet({
    // Customize Content-Security-Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.example.com"],
        styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://images.example.com"],
        connectSrc: ["'self'", "https://api.example.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },

    // Customize other headers
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },

    referrerPolicy: {
      policy: "strict-origin-when-cross-origin",
    },

    // Disable specific protections if needed
    crossOriginEmbedderPolicy: false, // May need for loading external resources
  }),
);
```

### API-Only Configuration

For REST APIs (no HTML pages), you can simplify CSP:

```typescript
// API doesn't serve HTML, so CSP is simpler
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  }),
);
```

---

## CORS Deep Dive

Cross-Origin Resource Sharing (CORS) is a security mechanism that controls which domains can access your API.

### Understanding the Same-Origin Policy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SAME-ORIGIN POLICY                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Origin = Protocol + Domain + Port                                          │
│                                                                             │
│  https://example.com:443                                                    │
│  └─────┘ └──────────┘ └─┘                                                   │
│  Protocol   Domain    Port                                                  │
│                                                                             │
│  SAME ORIGIN COMPARISONS:                                                   │
│  ─────────────────────────                                                  │
│  https://example.com/page1  ↔  https://example.com/page2      ✅ Same      │
│  https://example.com        ↔  https://api.example.com        ❌ Different │
│  https://example.com        ↔  http://example.com             ❌ Different │
│  https://example.com:443    ↔  https://example.com:8080       ❌ Different │
│  http://localhost:3000      ↔  http://localhost:5000          ❌ Different │
│                                                                             │
│  BROWSER BEHAVIOR:                                                          │
│  Front-end at https://devjobs.pro                                          │
│  API at https://api.devjobs.pro                                            │
│                                                                             │
│  → Browser blocks cross-origin requests unless API allows it via CORS      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### CORS Request Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CORS REQUEST FLOW                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SIMPLE REQUEST (GET, POST with simple headers)                            │
│  ──────────────────────────────────────────────                             │
│                                                                             │
│  Browser                              Server                                │
│     │                                    │                                  │
│     │ GET /api/jobs                      │                                  │
│     │ Origin: https://devjobs.pro        │                                  │
│     │ ──────────────────────────────────►│                                  │
│     │                                    │                                  │
│     │    Access-Control-Allow-Origin:    │                                  │
│     │    https://devjobs.pro             │                                  │
│     │◄────────────────────────────────── │                                  │
│     │                                    │                                  │
│  ✅ Browser allows response                                                │
│                                                                             │
│                                                                             │
│  PREFLIGHT REQUEST (PUT, DELETE, custom headers)                           │
│  ───────────────────────────────────────────────                            │
│                                                                             │
│  Browser                              Server                                │
│     │                                    │                                  │
│     │ OPTIONS /api/jobs/123              │  ← Preflight                    │
│     │ Origin: https://devjobs.pro        │                                  │
│     │ Access-Control-Request-Method: PUT │                                  │
│     │ Access-Control-Request-Headers:    │                                  │
│     │   Authorization, Content-Type      │                                  │
│     │ ──────────────────────────────────►│                                  │
│     │                                    │                                  │
│     │    Access-Control-Allow-Origin:    │  ← Preflight response           │
│     │    https://devjobs.pro             │                                  │
│     │    Access-Control-Allow-Methods:   │                                  │
│     │    GET, POST, PUT, DELETE          │                                  │
│     │    Access-Control-Allow-Headers:   │                                  │
│     │    Authorization, Content-Type     │                                  │
│     │    Access-Control-Max-Age: 86400   │                                  │
│     │◄────────────────────────────────── │                                  │
│     │                                    │                                  │
│     │ PUT /api/jobs/123                  │  ← Actual request              │
│     │ Origin: https://devjobs.pro        │                                  │
│     │ Authorization: Bearer token        │                                  │
│     │ ──────────────────────────────────►│                                  │
│     │                                    │                                  │
│     │    200 OK                          │                                  │
│     │◄────────────────────────────────── │                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### CORS in Express

```bash
npm install cors
npm install -D @types/cors
```

#### Basic CORS (Allow All Origins)

```typescript
// ⚠️ Only for public APIs - allows any origin
import cors from "cors";

app.use(cors()); // Equivalent to: Access-Control-Allow-Origin: *
```

#### CORS for Specific Origins

```typescript
// ✅ Production: Allow only your frontend
import cors from "cors";

const corsOptions: cors.CorsOptions = {
  origin: "https://devjobs.pro", // Only allow this origin
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
```

#### CORS with Multiple Origins

```typescript
// Allow multiple specific origins
const allowedOrigins = [
  "https://devjobs.pro",
  "https://www.devjobs.pro",
  "https://admin.devjobs.pro",
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow cookies
};

app.use(cors(corsOptions));
```

#### Environment-Based CORS

```typescript
// Different CORS for development vs production
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Development: allow localhost
    if (process.env.NODE_ENV === "development") {
      return callback(null, true);
    }

    // Production: strict origin check
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL,
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
```

### CORS with Credentials (Cookies)

```typescript
// When you need to send cookies or auth headers
const corsOptions: cors.CorsOptions = {
  origin: "https://devjobs.pro", // MUST be specific, not '*'
  credentials: true, // Allow credentials
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Total-Count", "X-Page-Count"], // Headers client can access
  maxAge: 86400, // Cache preflight for 24 hours
};

app.use(cors(corsOptions));

// ❌ This will NOT work with credentials:
// { origin: '*', credentials: true }
```

---

## Mini-Tutorial: Production Security Setup

Let's configure Helmet and CORS for DevJobs Pro.

### Step 1: Create Security Configuration

```typescript
// src/config/security.config.ts
import { CorsOptions } from "cors";
import { HelmetOptions } from "helmet";

// Allowed frontend origins
const allowedOrigins: string[] = (() => {
  const origins = [process.env.FRONTEND_URL];

  // Additional origins in development
  if (process.env.NODE_ENV === "development") {
    origins.push(
      "http://localhost:3000",
      "http://localhost:5173", // Vite default
      "http://127.0.0.1:5173",
    );
  }

  return origins.filter((origin): origin is string => Boolean(origin));
})();

// CORS configuration
export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: [
    "X-Total-Count",
    "X-Page-Count",
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset",
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// Helmet configuration
export const helmetConfig: HelmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Inline styles often needed
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"], // Cloud images
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", ...allowedOrigins],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin",
  },
  crossOriginEmbedderPolicy: false, // May need for external images
};

// API-specific Helmet (for JSON-only endpoints)
export const apiHelmetConfig: HelmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: helmetConfig.hsts,
  referrerPolicy: helmetConfig.referrerPolicy,
};
```

### Step 2: Apply Security Middleware

```typescript
// src/middleware/security.ts
import helmet from "helmet";
import cors from "cors";
import { Express } from "express";
import { corsConfig, helmetConfig } from "../config/security.config";

export function applySecurityMiddleware(app: Express): void {
  // Apply Helmet security headers
  app.use(helmet(helmetConfig));

  // Apply CORS
  app.use(cors(corsConfig));

  // Remove X-Powered-By header (redundant with Helmet but explicit)
  app.disable("x-powered-by");

  console.log("✅ Security middleware applied");
}
```

### Step 3: Use in Application

```typescript
// src/app.ts
import express from "express";
import { applySecurityMiddleware } from "./middleware/security";

const app = express();

// Apply security first
applySecurityMiddleware(app);

// Then other middleware
app.use(express.json());

// Routes...
```

### Step 4: Route-Specific CORS (Optional)

```typescript
// Some routes may need different CORS settings
import cors from "cors";

// Public API with no credentials
const publicCors = cors({
  origin: "*",
  methods: ["GET"],
});

// Strict CORS for authenticated routes
const strictCors = cors({
  origin: "https://devjobs.pro",
  credentials: true,
});

// Apply per-route
router.get("/public-jobs", publicCors, jobController.listPublic);
router.post("/apply", strictCors, applicationController.apply);
```

---

## Practice: DevJobs Pro Security Configuration

### Task 1: Configure CSP for DevJobs Pro

DevJobs Pro needs these resources:

- Scripts from self and Google Analytics
- Styles from self and Google Fonts
- Images from self, Cloudinary, and Gravatar
- Fonts from Google Fonts
- API connections to api.devjobs.pro

```typescript
// TODO: Update src/config/security.config.ts

// Configure CSP to allow these resources while blocking everything else
export const helmetConfig: HelmetOptions = {
  contentSecurityPolicy: {
    directives: {
      // Your implementation
    },
  },
};
```

### Task 2: Environment-Aware CORS

Create CORS configuration that:

- Development: Allows localhost:3000, localhost:5173, localhost:5174
- Staging: Allows staging.devjobs.pro
- Production: Allows only devjobs.pro and www.devjobs.pro
- All environments: Support credentials for auth

```typescript
// TODO: Create environment-aware CORS function
function getCorsOrigins(): string[] {
  // Your implementation
}
```

### Task 3: Webhook Route Without CORS

Some routes (like payment webhooks) need no CORS restrictions:

```typescript
// TODO: Create webhook routes with different security settings
// Hint: Use route-specific middleware
```

<details>
<summary>💡 Solution: DevJobs Pro CSP</summary>

```typescript
// src/config/security.config.ts
export const helmetConfig: HelmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Often needed for CSS-in-JS
        "https://fonts.googleapis.com",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://res.cloudinary.com",
        "https://www.gravatar.com",
        "https://www.google-analytics.com",
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: [
        "'self'",
        process.env.API_URL || "https://api.devjobs.pro",
        "https://www.google-analytics.com",
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests:
        process.env.NODE_ENV === "production" ? [] : undefined,
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin",
  },
};

// Environment-aware CORS
function getCorsOrigins(): string[] {
  switch (process.env.NODE_ENV) {
    case "production":
      return ["https://devjobs.pro", "https://www.devjobs.pro"];
    case "staging":
      return ["https://staging.devjobs.pro"];
    default: // development
      return [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
      ];
  }
}

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getCorsOrigins();

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
```

</details>

---

## Pro Tips vs Junior Traps

| Pro Tip 🎯                               | Junior Trap ⚠️                                |
| ---------------------------------------- | --------------------------------------------- |
| Use Helmet() with custom config          | Use Helmet() with all defaults in production  |
| Whitelist specific CORS origins          | Use `origin: '*'` with credentials            |
| Set `credentials: true` only when needed | Enable credentials everywhere "just in case"  |
| Cache preflight responses (`maxAge`)     | Let browsers send preflight for every request |
| Different CORS for dev vs production     | Same permissive CORS everywhere               |
| Test CSP with Report-Only mode first     | Deploy strict CSP without testing             |
| Log blocked CORS origins for debugging   | Silently fail CORS requests                   |
| Use environment variables for origins    | Hardcode production URLs                      |

---

## 5-Minute Debugger 🐛

### Problem: "CORS error" in browser

````
┌─────────────────────────────────────────────────────────────────────────────┐
│  SYMPTOM: Browser console shows CORS error                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  "Access to fetch at 'https://api.example.com' from origin                 │
│   'https://example.com' has been blocked by CORS policy"                   │
│                                                                             │
│  STEP 1: Check if origin is allowed                                        │
│  ─────────────────────────────────────                                      │
│  Is your frontend origin in the allowedOrigins list?                       │
│  Check exact match: https://example.com ≠ http://example.com               │
│                                                                             │
│  STEP 2: Check credentials setting                                         │
│  ───────────────────────────────────                                        │
│  If using cookies: credentials: true AND origin can't be '*'               │
│  Frontend must also send: { credentials: 'include' }                       │
│                                                                             │
│  STEP 3: Check preflight response                                          │
│  ──────────────────────────────────                                         │
│  Open Network tab → Find OPTIONS request → Check response headers          │
│  Missing Access-Control-Allow-Origin? Server didn't handle OPTIONS         │
│                                                                             │
│  STEP 4: Check allowed methods/headers                                     │
│  ────────────────────────────────────                                       │
│  PUT/DELETE need preflight → Is method in Access-Control-Allow-Methods?   │
│  Custom headers need → Are they in Access-Control-Allow-Headers?          │
│                                                                             │
│  QUICK FIX: Log your CORS config and request origin                        │
│  ```                                                                        │
│  origin: (origin, callback) => {                                           │
│    console.log('CORS request from:', origin);                              │
│    // ...                                                                  │
│  }                                                                          │
│  ```                                                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
````

### Problem: "Blocked by Content Security Policy"

````
┌─────────────────────────────────────────────────────────────────────────────┐
│  SYMPTOM: Resource blocked, CSP violation in console                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  "Refused to load script from 'https://cdn.example.com' because it         │
│   violates the Content Security Policy directive: script-src 'self'"       │
│                                                                             │
│  STEP 1: Identify the blocked resource                                     │
│  ─────────────────────────────────────                                      │
│  Error tells you: script-src, style-src, img-src, etc.                     │
│                                                                             │
│  STEP 2: Add source to appropriate directive                               │
│  ───────────────────────────────────────────                                │
│  ```                                                                        │
│  scriptSrc: ["'self'", "https://cdn.example.com"],                         │
│  ```                                                                        │
│                                                                             │
│  STEP 3: Use Report-Only mode for testing                                  │
│  ────────────────────────────────────────                                   │
│  ```                                                                        │
│  contentSecurityPolicy: {                                                  │
│    reportOnly: true, // Logs violations but doesn't block                  │
│    directives: { ... }                                                     │
│  }                                                                          │
│  ```                                                                        │
│                                                                             │
│  STEP 4: Check for inline scripts/styles                                   │
│  ───────────────────────────────────────                                    │
│  Inline content needs 'unsafe-inline' or nonce-based approach             │
│  Better: Move inline scripts to external files                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
````

### Debug Checklist

```
□ Is the CORS middleware applied before routes?
□ Is the frontend origin exactly matching (including protocol and port)?
□ If using credentials, is origin specific (not '*')?
□ Are OPTIONS requests being handled?
□ Is the request method in allowedMethods?
□ Are custom headers in allowedHeaders?
□ For CSP: is the resource domain in the correct directive?
□ Have you checked browser DevTools Network tab?
```

---

## Definition of Done ✅

Before moving to the next lesson, verify:

- [ ] **Helmet installed**: `npm list helmet` shows it's installed
- [ ] **CORS installed**: `npm list cors` shows it's installed
- [ ] **Security config file**: `src/config/security.config.ts` exists
- [ ] **Helmet applied**: Security headers present in responses
- [ ] **CORS working**: Frontend can make API requests
- [ ] **Credentials flow**: Cookies/auth work cross-origin (if needed)
- [ ] **CSP configured**: Resources load without CSP violations
- [ ] **Environment-aware**: Different origins for dev/staging/production

### Quick Security Test

```bash
# Check security headers are present
curl -I http://localhost:3000/api/health

# Should see:
# X-Content-Type-Options: nosniff
# X-Frame-Options: SAMEORIGIN
# Strict-Transport-Security: max-age=...
# Content-Security-Policy: ...

# Test CORS preflight
curl -X OPTIONS http://localhost:3000/api/jobs \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Should see Access-Control-Allow-* headers
```

---

## What's Next?

Your API now has security headers protecting users and CORS controlling access. But what happens when someone tries to abuse your API by making thousands of requests? That's where rate limiting comes in.

In the next lesson, we'll learn **Rate Limiting and Protection**—how to defend your API against abuse, brute force attacks, and denial of service.

---

## Navigation

| Previous                                                 | Current                               | Next                                                        |
| -------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------- |
| [Lesson 2: Data Sanitization](./02-data-sanitization.md) | **Lesson 3: Security Headers & CORS** | [Lesson 4: Rate Limiting](./04-rate-limiting-protection.md) |
