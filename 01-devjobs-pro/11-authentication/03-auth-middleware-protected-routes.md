# Lesson 3: Auth Middleware & Protected Routes

## 🎯 Hook: Protect Your API—Not Every Route Is Public

Your beautifully designed API is live. Users can register, login, and get tokens. But here's the problem: **every route is still accessible to everyone**. Someone without an account can post jobs. Anyone can view applications. Your admin endpoints? Wide open.

Authentication without route protection is like installing a lock on your door but leaving the windows open.

In this lesson, you'll learn to build an authentication middleware that acts as your API's security checkpoint—extracting tokens, verifying identity, and gatekeeping access to protected resources.

---

## 📚 Theory: Authentication vs Authorization

Before we dive in, let's clarify two concepts often confused:

```
┌─────────────────────────────────────────────────────────────────┐
│           AUTHENTICATION vs AUTHORIZATION                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   AUTHENTICATION (AuthN)         AUTHORIZATION (AuthZ)         │
│   ─────────────────────          ─────────────────────         │
│   "Who are you?"                 "What can you do?"            │
│                                                                 │
│   • Verifies identity            • Verifies permissions        │
│   • Checks credentials           • Checks roles/rights         │
│   • Happens FIRST                • Happens AFTER authN         │
│                                                                 │
│   Examples:                      Examples:                     │
│   • JWT verification             • Role checking               │
│   • Session validation           • Resource ownership          │
│   • API key check                • Feature flags               │
│                                                                 │
│   ─────────────────────────────────────────────────────────    │
│                                                                 │
│   THIS LESSON: Authentication (identity verification)          │
│   NEXT LESSON: Authorization (permission checking - RBAC)      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### The Bearer Token Pattern

The standard way to send JWTs in HTTP requests:

```
┌─────────────────────────────────────────────────────────────────┐
│                BEARER TOKEN PATTERN                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   HTTP Request:                                                │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ GET /api/jobs HTTP/1.1                                  │  │
│   │ Host: api.devjobs.com                                   │  │
│   │ Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...   │  │
│   │                ─────── ─────────────────────────────    │  │
│   │                Scheme         Token                     │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   Why "Bearer"?                                                │
│   • Defined in RFC 6750 (OAuth 2.0)                           │
│   • Means: "whoever bears (carries) this token has access"    │
│   • Standard understood by all HTTP clients                   │
│                                                                 │
│   Alternatives (when to use):                                  │
│   • Cookie: For browser-only apps (auto-sent)                 │
│   • Query param: NEVER (tokens in logs!)                      │
│   • Custom header: Only if you have a good reason             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Auth Middleware Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              AUTH MIDDLEWARE FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Request Arrives                                              │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────────────────────────────────────────┐      │
│   │        1. EXTRACT TOKEN                              │      │
│   │   ┌─────────────────────────────────────────────┐   │      │
│   │   │ Authorization: Bearer <token>               │   │      │
│   │   │                       ────────              │   │      │
│   │   │                       Extract this          │   │      │
│   │   └─────────────────────────────────────────────┘   │      │
│   └───────────────────────┬─────────────────────────────┘      │
│                           │                                     │
│              ┌────────────┴────────────┐                       │
│              │ Token missing?          │                       │
│              └────────────┬────────────┘                       │
│         No ──────────────▶│◀─────────────── Yes                │
│                           │                  │                  │
│                           ▼                  ▼                  │
│   ┌───────────────────────────────┐    ┌──────────────┐        │
│   │    2. VERIFY TOKEN            │    │ 401 No token │        │
│   │   • Check signature           │    └──────────────┘        │
│   │   • Check expiration          │                            │
│   │   • Check issuer/audience     │                            │
│   └──────────────┬────────────────┘                            │
│                  │                                              │
│     ┌────────────┴────────────┐                                │
│     │ Token valid?            │                                │
│     └────────────┬────────────┘                                │
│    Yes ─────────▶│◀─────────────── No                          │
│                  │                  │                          │
│                  ▼                  ▼                          │
│   ┌───────────────────────┐  ┌────────────────────┐            │
│   │   3. ATTACH USER      │  │ 401 Invalid token  │            │
│   │   req.user = payload  │  │ or                 │            │
│   │                       │  │ 401 Token expired  │            │
│   └──────────┬────────────┘  └────────────────────┘            │
│              │                                                  │
│              ▼                                                  │
│   ┌───────────────────────┐                                    │
│   │    4. CALL next()     │                                    │
│   │   Continue to route   │                                    │
│   └───────────────────────┘                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Route Protection Patterns

```
┌─────────────────────────────────────────────────────────────────┐
│              ROUTE PROTECTION PATTERNS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   PATTERN 1: Protect Individual Routes                         │
│   ─────────────────────────────────────                        │
│   router.get('/profile', authMiddleware, getProfile);          │
│   router.post('/jobs', authMiddleware, createJob);             │
│                                                                 │
│   Use when: Most routes public, few protected                  │
│                                                                 │
│   ─────────────────────────────────────────────────────────    │
│                                                                 │
│   PATTERN 2: Protect Route Groups                              │
│   ─────────────────────────────────                            │
│   router.use('/admin', authMiddleware);                        │
│   router.get('/admin/users', listUsers);   // Protected!       │
│   router.get('/admin/stats', getStats);    // Protected!       │
│                                                                 │
│   Use when: Entire section requires auth                       │
│                                                                 │
│   ─────────────────────────────────────────────────────────    │
│                                                                 │
│   PATTERN 3: Protect Entire Router                             │
│   ─────────────────────────────────                            │
│   app.use('/api', authMiddleware, apiRouter);                  │
│                                                                 │
│   Use when: Everything behind /api needs auth                  │
│                                                                 │
│   ─────────────────────────────────────────────────────────    │
│                                                                 │
│   PATTERN 4: Optional Auth                                     │
│   ────────────────────────                                     │
│   router.get('/jobs', optionalAuth, listJobs);                 │
│                                                                 │
│   • req.user set if token valid                                │
│   • req.user undefined if no token                             │
│   • Never fails, just provides context                         │
│                                                                 │
│   Use when: Response differs for logged in users               │
│   Example: Show "saved" status only if logged in               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💻 Code Examples

### Basic Auth Middleware

**JavaScript:**

```javascript
// middleware/auth.middleware.js
import { verifyAccessToken } from "../utils/jwt.util.js";

export function authMiddleware(req, res, next) {
  // 1. Extract token from header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      status: "error",
      error: "MISSING_TOKEN",
      message: "Authorization header is required",
    });
  }

  // 2. Validate Bearer format
  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({
      status: "error",
      error: "INVALID_TOKEN_FORMAT",
      message: "Authorization header must be: Bearer <token>",
    });
  }

  const token = parts[1];

  // 3. Verify token
  const result = verifyAccessToken(token);

  if (!result.valid) {
    // Different errors for expired vs invalid
    if (result.expired) {
      return res.status(401).json({
        status: "error",
        error: "TOKEN_EXPIRED",
        message: "Access token has expired, please refresh",
      });
    }

    return res.status(401).json({
      status: "error",
      error: "INVALID_TOKEN",
      message: result.error || "Token verification failed",
    });
  }

  // 4. Attach user to request
  req.user = {
    id: result.payload.sub,
    email: result.payload.email,
    role: result.payload.role,
  };

  // 5. Continue to route handler
  next();
}
```

**TypeScript:**

```typescript
// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, AccessTokenPayload } from "../utils/jwt.util";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: "seeker" | "employer" | "admin";
      };
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // 1. Extract token from header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      status: "error",
      error: "MISSING_TOKEN",
      message: "Authorization header is required",
    });
    return;
  }

  // 2. Validate Bearer format
  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    res.status(401).json({
      status: "error",
      error: "INVALID_TOKEN_FORMAT",
      message: "Authorization header must be: Bearer <token>",
    });
    return;
  }

  const token = parts[1];

  // 3. Verify token
  const result = verifyAccessToken(token);

  if (!result.valid) {
    if (result.expired) {
      res.status(401).json({
        status: "error",
        error: "TOKEN_EXPIRED",
        message: "Access token has expired, please refresh",
      });
      return;
    }

    res.status(401).json({
      status: "error",
      error: "INVALID_TOKEN",
      message: result.error || "Token verification failed",
    });
    return;
  }

  // 4. Attach user to request
  req.user = {
    id: result.payload!.sub,
    email: result.payload!.email,
    role: result.payload!.role,
  };

  // 5. Continue to route handler
  next();
}
```

### Protecting Single Routes

**JavaScript:**

```javascript
// routes/job.routes.js
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { jobController } from "../controllers/job.controller.js";

const router = Router();

// Public routes - no auth required
router.get("/jobs", jobController.listJobs);
router.get("/jobs/:id", jobController.getJob);

// Protected routes - auth required
router.post("/jobs", authMiddleware, jobController.createJob);
router.put("/jobs/:id", authMiddleware, jobController.updateJob);
router.delete("/jobs/:id", authMiddleware, jobController.deleteJob);

export default router;
```

**TypeScript:**

```typescript
// routes/job.routes.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { jobController } from "../controllers/job.controller";

const router = Router();

// Public routes
router.get("/jobs", jobController.listJobs);
router.get("/jobs/:id", jobController.getJob);

// Protected routes
router.post("/jobs", authMiddleware, jobController.createJob);
router.put("/jobs/:id", authMiddleware, jobController.updateJob);
router.delete("/jobs/:id", authMiddleware, jobController.deleteJob);

export default router;
```

### Protecting Route Groups

**JavaScript:**

```javascript
// routes/index.js
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import authRoutes from "./auth.routes.js";
import jobRoutes from "./job.routes.js";
import applicationRoutes from "./application.routes.js";
import adminRoutes from "./admin.routes.js";

const router = Router();

// Public routes
router.use("/auth", authRoutes);
router.get("/jobs", jobController.listJobs);
router.get("/jobs/:id", jobController.getJob);

// Protected route groups
router.use("/applications", authMiddleware, applicationRoutes);
router.use("/admin", authMiddleware, adminRoutes);

// Or protect everything under /api
// router.use('/api', authMiddleware, apiRoutes);

export default router;
```

**TypeScript:**

```typescript
// routes/index.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import authRoutes from "./auth.routes";
import jobRoutes from "./job.routes";
import applicationRoutes from "./application.routes";
import adminRoutes from "./admin.routes";

const router = Router();

// Public routes
router.use("/auth", authRoutes);
router.get("/jobs", jobController.listJobs);
router.get("/jobs/:id", jobController.getJob);

// Protected route groups - auth applied to all routes in these routers
router.use("/applications", authMiddleware, applicationRoutes);
router.use("/admin", authMiddleware, adminRoutes);

export default router;
```

### Optional Authentication

**JavaScript:**

```javascript
// middleware/optional-auth.middleware.js
import { verifyAccessToken } from '../utils/jwt.util.js';

export function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // No token? That's fine, just continue
  if (!authHeader) {
    req.user = undefined;
    return next();
  }

  const parts = authHeader.split(' ');

  // Invalid format? Continue without user
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    req.user = undefined;
    return next();
  }

  const token = parts[1];
  const result = verifyAccessToken(token);

  // Invalid or expired? Continue without user
  if (!result.valid) {
    req.user = undefined;
    return next();
  }

  // Valid token - attach user
  req.user = {
    id: result.payload.sub,
    email: result.payload.email,
    role: result.payload.role,
  };

  next();
}

// Usage in routes
router.get('/jobs', optionalAuthMiddleware, (req, res) => {
  const jobs = await getJobs();

  // If user is logged in, add saved status
  if (req.user) {
    const savedJobIds = await getSavedJobIds(req.user.id);
    jobs.forEach(job => {
      job.isSaved = savedJobIds.includes(job.id);
    });
  }

  res.json({ jobs });
});
```

**TypeScript:**

```typescript
// middleware/optional-auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";

export function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    req.user = undefined;
    return next();
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    req.user = undefined;
    return next();
  }

  const token = parts[1];
  const result = verifyAccessToken(token);

  if (!result.valid || !result.payload) {
    req.user = undefined;
    return next();
  }

  req.user = {
    id: result.payload.sub,
    email: result.payload.email,
    role: result.payload.role,
  };

  next();
}
```

---

## 🔨 Mini-Tutorial: Complete Auth Middleware System

Let's build a production-ready auth middleware system for DevJobs Pro.

### Step 1: Type Definitions

```typescript
// src/types/auth.types.ts
export interface AuthUser {
  id: string;
  email: string;
  role: "seeker" | "employer" | "admin";
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

// Extend Express types globally
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export type AuthErrorCode =
  | "MISSING_TOKEN"
  | "INVALID_TOKEN_FORMAT"
  | "INVALID_TOKEN"
  | "TOKEN_EXPIRED"
  | "INSUFFICIENT_PERMISSIONS";
```

### Step 2: Error Response Helpers

```typescript
// src/middleware/auth-errors.ts
import { Response } from "express";
import { AuthErrorCode } from "../types/auth.types";

interface AuthErrorResponse {
  status: "error";
  error: AuthErrorCode;
  message: string;
}

const errorMessages: Record<
  AuthErrorCode,
  { status: number; message: string }
> = {
  MISSING_TOKEN: {
    status: 401,
    message: "Authorization header is required",
  },
  INVALID_TOKEN_FORMAT: {
    status: 401,
    message: "Authorization header must be: Bearer <token>",
  },
  INVALID_TOKEN: {
    status: 401,
    message: "Invalid or malformed token",
  },
  TOKEN_EXPIRED: {
    status: 401,
    message: "Access token has expired, please refresh",
  },
  INSUFFICIENT_PERMISSIONS: {
    status: 403,
    message: "You do not have permission to access this resource",
  },
};

export function sendAuthError(
  res: Response,
  code: AuthErrorCode,
  customMessage?: string,
): void {
  const { status, message } = errorMessages[code];

  const response: AuthErrorResponse = {
    status: "error",
    error: code,
    message: customMessage || message,
  };

  res.status(status).json(response);
}
```

### Step 3: Main Auth Middleware

```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import { sendAuthError } from "./auth-errors";
import { AuthUser } from "../types/auth.types";

/**
 * Extract Bearer token from Authorization header
 */
function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

/**
 * Required authentication middleware
 * Blocks request if user is not authenticated
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  // Check for header
  if (!authHeader) {
    sendAuthError(res, "MISSING_TOKEN");
    return;
  }

  // Extract token
  const token = extractToken(authHeader);

  if (!token) {
    sendAuthError(res, "INVALID_TOKEN_FORMAT");
    return;
  }

  // Verify token
  const result = verifyAccessToken(token);

  if (!result.valid) {
    if (result.expired) {
      sendAuthError(res, "TOKEN_EXPIRED");
    } else {
      sendAuthError(res, "INVALID_TOKEN", result.error);
    }
    return;
  }

  // Attach user to request
  req.user = {
    id: result.payload!.sub,
    email: result.payload!.email,
    role: result.payload!.role,
  };

  next();
}

/**
 * Optional authentication middleware
 * Attaches user if token valid, continues regardless
 */
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = extractToken(req.headers.authorization);

  if (!token) {
    req.user = undefined;
    return next();
  }

  const result = verifyAccessToken(token);

  if (result.valid && result.payload) {
    req.user = {
      id: result.payload.sub,
      email: result.payload.email,
      role: result.payload.role,
    };
  } else {
    req.user = undefined;
  }

  next();
}

/**
 * Type guard to check if request is authenticated
 * Use in controllers after optional auth
 */
export function isAuthenticated(
  req: Request,
): req is Request & { user: AuthUser } {
  return req.user !== undefined;
}
```

### Step 4: JavaScript Version

```javascript
// src/middleware/auth.middleware.js
import { verifyAccessToken } from "../utils/jwt.util.js";

function extractToken(authHeader) {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  return parts[1];
}

const errorResponses = {
  MISSING_TOKEN: { status: 401, message: "Authorization header is required" },
  INVALID_TOKEN_FORMAT: {
    status: 401,
    message: "Authorization header must be: Bearer <token>",
  },
  INVALID_TOKEN: { status: 401, message: "Invalid or malformed token" },
  TOKEN_EXPIRED: {
    status: 401,
    message: "Access token has expired, please refresh",
  },
};

function sendAuthError(res, code, customMessage) {
  const { status, message } = errorResponses[code];
  res.status(status).json({
    status: "error",
    error: code,
    message: customMessage || message,
  });
}

export function authMiddleware(req, res, next) {
  if (!req.headers.authorization) {
    return sendAuthError(res, "MISSING_TOKEN");
  }

  const token = extractToken(req.headers.authorization);

  if (!token) {
    return sendAuthError(res, "INVALID_TOKEN_FORMAT");
  }

  const result = verifyAccessToken(token);

  if (!result.valid) {
    return sendAuthError(
      res,
      result.expired ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
      result.error,
    );
  }

  req.user = {
    id: result.payload.sub,
    email: result.payload.email,
    role: result.payload.role,
  };

  next();
}

export function optionalAuth(req, res, next) {
  const token = extractToken(req.headers.authorization);

  if (!token) {
    req.user = undefined;
    return next();
  }

  const result = verifyAccessToken(token);

  req.user = result.valid
    ? {
        id: result.payload.sub,
        email: result.payload.email,
        role: result.payload.role,
      }
    : undefined;

  next();
}

export function isAuthenticated(req) {
  return req.user !== undefined;
}
```

### Step 5: Testing the Middleware

```typescript
// src/middleware/__tests__/auth.middleware.test.ts
import { Request, Response, NextFunction } from "express";
import { authMiddleware, optionalAuth } from "../auth.middleware";
import { signAccessToken } from "../../utils/jwt.util";

describe("authMiddleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it("should return 401 if no authorization header", () => {
    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "MISSING_TOKEN" }),
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 401 if invalid token format", () => {
    mockReq.headers = { authorization: "InvalidFormat" };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "INVALID_TOKEN_FORMAT" }),
    );
  });

  it("should attach user and call next for valid token", () => {
    const { token } = signAccessToken({
      userId: "user_123",
      email: "test@email.com",
      role: "seeker",
    });

    mockReq.headers = { authorization: `Bearer ${token}` };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toEqual({
      id: "user_123",
      email: "test@email.com",
      role: "seeker",
    });
  });
});

describe("optionalAuth", () => {
  it("should continue without user if no token", () => {
    const mockReq: Partial<Request> = { headers: {} };
    const mockRes: Partial<Response> = {};
    const mockNext = jest.fn();

    optionalAuth(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toBeUndefined();
  });

  it("should attach user for valid token", () => {
    const { token } = signAccessToken({
      userId: "user_123",
      email: "test@email.com",
      role: "employer",
    });

    const mockReq: Partial<Request> = {
      headers: { authorization: `Bearer ${token}` },
    };
    const mockRes: Partial<Response> = {};
    const mockNext = jest.fn();

    optionalAuth(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toBeDefined();
    expect(mockReq.user?.role).toBe("employer");
  });
});
```

---

## 🏋️ Practice: DevJobs Pro Protected Routes

Implement role-specific route protection for DevJobs Pro.

### Step 1: Define Route Access Rules

```typescript
// src/routes/route-access.ts
/**
 * DevJobs Pro Route Access Matrix
 *
 * PUBLIC (no auth required):
 * - GET /jobs - Browse job listings
 * - GET /jobs/:id - View job details
 * - POST /auth/register - Create account
 * - POST /auth/login - Login
 * - POST /auth/refresh - Refresh tokens
 *
 * AUTHENTICATED (any logged-in user):
 * - GET /me - View own profile
 * - PUT /me - Update own profile
 * - POST /auth/logout - Logout
 *
 * SEEKER ONLY:
 * - POST /applications - Apply to jobs
 * - GET /applications - View own applications
 * - DELETE /applications/:id - Withdraw application
 *
 * EMPLOYER ONLY:
 * - POST /jobs - Create job listing
 * - PUT /jobs/:id - Update own job (ownership check)
 * - DELETE /jobs/:id - Delete own job (ownership check)
 * - GET /jobs/:id/applications - View applicants
 *
 * ADMIN ONLY:
 * - GET /admin/users - List all users
 * - DELETE /admin/users/:id - Delete user
 * - PUT /admin/jobs/:id/moderate - Moderate job listing
 */
```

### Step 2: Job Routes with Auth

```typescript
// src/routes/job.routes.ts
import { Router } from "express";
import { authMiddleware, optionalAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware"; // Next lesson!
import { jobController } from "../controllers/job.controller";

const router = Router();

// Public routes - anyone can browse
router.get("/", optionalAuth, jobController.listJobs);
router.get("/:id", optionalAuth, jobController.getJob);

// Employer routes - create/manage jobs
router.post(
  "/",
  authMiddleware,
  requireRole("employer", "admin"),
  jobController.createJob,
);
router.put(
  "/:id",
  authMiddleware,
  requireRole("employer", "admin"),
  jobController.updateJob,
);
router.delete(
  "/:id",
  authMiddleware,
  requireRole("employer", "admin"),
  jobController.deleteJob,
);
router.get(
  "/:id/applications",
  authMiddleware,
  requireRole("employer", "admin"),
  jobController.getApplications,
);

export default router;
```

### Step 3: Application Routes with Auth

```typescript
// src/routes/application.routes.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { applicationController } from "../controllers/application.controller";

const router = Router();

// All application routes require authentication
router.use(authMiddleware);

// Seeker routes
router.post("/", requireRole("seeker"), applicationController.applyToJob);
router.get("/", requireRole("seeker"), applicationController.getMyApplications);
router.delete(
  "/:id",
  requireRole("seeker"),
  applicationController.withdrawApplication,
);

export default router;
```

### Step 4: Job Controller with User Context

```typescript
// src/controllers/job.controller.ts
import { Request, Response, NextFunction } from "express";
import { jobService } from "../services/job.service";
import { AppError } from "../errors/AppError";
import { isAuthenticated } from "../middleware/auth.middleware";

export class JobController {
  /**
   * List jobs - optionally personalized for logged-in users
   */
  async listJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20, search, location, type } = req.query;

      const jobs = await jobService.listJobs({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        location: location as string,
        type: type as string,
      });

      // If user is logged in, add personalization
      if (isAuthenticated(req)) {
        const savedJobIds = await jobService.getSavedJobIds(req.user.id);
        const appliedJobIds = await jobService.getAppliedJobIds(req.user.id);

        jobs.data = jobs.data.map((job) => ({
          ...job,
          isSaved: savedJobIds.includes(job.id),
          hasApplied: appliedJobIds.includes(job.id),
        }));
      }

      res.json({
        status: "success",
        ...jobs,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a job - employer only
   */
  async createJob(req: Request, res: Response, next: NextFunction) {
    try {
      // req.user is guaranteed by authMiddleware + requireRole
      const job = await jobService.createJob({
        ...req.body,
        employerId: req.user!.id, // TypeScript knows user exists
      });

      res.status(201).json({
        status: "success",
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a job - must be owner or admin
   */
  async updateJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Fetch job to check ownership
      const existingJob = await jobService.getJob(id);

      if (!existingJob) {
        throw new AppError("Job not found", 404);
      }

      // Check ownership (admins can edit any job)
      if (
        req.user!.role !== "admin" &&
        existingJob.employerId !== req.user!.id
      ) {
        throw new AppError("You can only edit your own jobs", 403);
      }

      const updated = await jobService.updateJob(id, req.body);

      res.json({
        status: "success",
        data: { job: updated },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const jobController = new JobController();
```

---

## 💡 Pro Tips vs Junior Traps

| Pro Tip                                               | Junior Trap                                          |
| ----------------------------------------------------- | ---------------------------------------------------- |
| Attach minimal user data to req (id, email, role)     | Fetching full user profile on every request          |
| Use type guards (`isAuthenticated`) for type safety   | Forcing non-null assertions (`req.user!`) everywhere |
| Separate error codes (TOKEN_EXPIRED vs INVALID_TOKEN) | Generic "Unauthorized" for all auth failures         |
| Extract token once, store in req if needed            | Parsing Authorization header multiple times          |
| Order middleware consistently (auth → role → handler) | Random middleware order causing confusion            |
| Test middleware with mock requests                    | Only testing through integration tests               |
| Use optionalAuth for public routes with user features | Duplicating logic in public/protected versions       |
| Return 401 for auth issues, 403 for permission issues | Using 401 for everything                             |

---

## 🔧 5-Minute Debugger

### "req.user is undefined"

```typescript
// ❌ WRONG: Middleware order incorrect
router.get("/profile", getProfile, authMiddleware); // Handler runs BEFORE auth!

// ✅ CORRECT: Auth middleware first
router.get("/profile", authMiddleware, getProfile);
```

### "Middleware runs but req.user still undefined"

```typescript
// ❌ WRONG: Returning early without calling next()
export function authMiddleware(req, res, next) {
  // ... validation ...
  req.user = { id, email, role };
  // Missing next()! Request hangs or times out
}

// ✅ CORRECT: Always call next() to continue
export function authMiddleware(req, res, next) {
  // ... validation ...
  req.user = { id, email, role };
  next(); // ← Don't forget!
}
```

### "TypeScript says user might be undefined"

```typescript
// ❌ WRONG: Accessing user without type guard
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ userId: req.user.id }); // Error: user might be undefined
});

// ✅ CORRECT: Use type assertion after middleware
router.get("/profile", authMiddleware, (req, res) => {
  // After authMiddleware, req.user is guaranteed
  res.json({ userId: req.user!.id }); // Bang operator is safe here
});

// ✅ BETTER: Use type guard for clarity
import { isAuthenticated } from "../middleware/auth.middleware";

router.get("/profile", authMiddleware, (req, res) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  // TypeScript now knows req.user exists
  res.json({ userId: req.user.id });
});
```

### "Auth works locally but fails in production"

```typescript
// ❌ WRONG: Hardcoded secret in development
const SECRET = "my-dev-secret";

// ✅ CORRECT: Check for environment variable
const SECRET = process.env.JWT_ACCESS_SECRET;
if (!SECRET) {
  throw new Error("JWT_ACCESS_SECRET must be set");
}
```

---

## ✅ Definition of Done Checklist

Before moving to the next lesson, verify:

- [ ] Auth middleware extracts Bearer token from Authorization header
- [ ] Proper error codes: MISSING_TOKEN, INVALID_TOKEN_FORMAT, INVALID_TOKEN, TOKEN_EXPIRED
- [ ] req.user is attached after successful verification
- [ ] Optional auth middleware doesn't fail on missing/invalid tokens
- [ ] Type definitions extend Express.Request with user property
- [ ] Protected routes are grouped logically
- [ ] Job routes distinguish between public and protected endpoints
- [ ] Application routes require seeker role
- [ ] Ownership checks prevent unauthorized resource access
- [ ] Unit tests cover all middleware branches
- [ ] Error responses include helpful error codes for frontend

```bash
# Quick verification
npm test -- --grep "authMiddleware"

# Test with curl
# Missing token
curl -i http://localhost:3000/api/applications
# → 401 MISSING_TOKEN

# Invalid token
curl -i -H "Authorization: Bearer invalid" http://localhost:3000/api/applications
# → 401 INVALID_TOKEN
```

---

## 🔗 Navigation

[← Lesson 2: JWT Fundamentals](./02-jwt-fundamentals.md) | [Lesson 4: Role-Based Access Control →](./04-role-based-access-control.md)

---

## 📚 Additional Resources

- [Express Middleware Guide](https://expressjs.com/en/guide/using-middleware.html)
- [RFC 6750 - Bearer Token Usage](https://tools.ietf.org/html/rfc6750)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [TypeScript Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
