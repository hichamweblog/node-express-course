# Lesson 4: Role-Based Access Control (RBAC)

## 🎯 Hook: Different Users, Different Permissions—RBAC in Action

Authentication tells you _who_ someone is. But in DevJobs Pro, knowing someone is logged in isn't enough:

- **Seekers** should apply to jobs, not post them
- **Employers** should manage their listings, not other employers'
- **Admins** should moderate everything, but regular users shouldn't

Without proper authorization, your authenticated users can access anything. A seeker could delete job postings. An employer could view other companies' applicants. Your admin panel? Accessible to everyone with a valid token.

**Role-Based Access Control (RBAC)** solves this by mapping users to roles, and roles to permissions. In this lesson, you'll build a flexible RBAC system that scales from three roles to thirty.

---

## 📚 Theory: RBAC Concepts

### Roles vs Permissions

```
┌─────────────────────────────────────────────────────────────────┐
│                 ROLES vs PERMISSIONS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ROLE = Collection of permissions                             │
│   PERMISSION = Single action on a resource                     │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ ROLE: Employer                                          │  │
│   │ ┌─────────────────────────────────────────────────────┐ │  │
│   │ │ PERMISSIONS:                                        │ │  │
│   │ │  • job:create                                       │ │  │
│   │ │  • job:read:own                                     │ │  │
│   │ │  • job:update:own                                   │ │  │
│   │ │  • job:delete:own                                   │ │  │
│   │ │  • application:read:own-jobs                        │ │  │
│   │ │  • profile:update:own                               │ │  │
│   │ └─────────────────────────────────────────────────────┘ │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   WHY NOT JUST ROLES?                                          │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ Roles:       "You are an employer"                      │  │
│   │ Permissions: "You can create jobs"                      │  │
│   │                                                         │  │
│   │ Permissions are more granular and flexible:            │  │
│   │ • Add new features without creating new roles          │  │
│   │ • Grant specific permissions to specific users         │  │
│   │ • Audit exactly what each user can do                  │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   IN PRACTICE:                                                 │
│   • Start with roles (simpler)                                 │
│   • Add permissions layer when needed (more flexible)          │
│   • DevJobs Pro: Roles are sufficient for MVP                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                 ROLE HIERARCHY                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   DevJobs Pro Role Structure:                                  │
│                                                                 │
│              ┌─────────────────┐                               │
│              │      ADMIN      │                               │
│              │                 │                               │
│              │ • All employer  │                               │
│              │   permissions   │                               │
│              │ • All seeker    │                               │
│              │   permissions   │                               │
│              │ • User mgmt     │                               │
│              │ • Moderation    │                               │
│              └────────┬────────┘                               │
│              Inherits │ all below                              │
│         ┌─────────────┴─────────────┐                          │
│         │                           │                          │
│   ┌─────▼─────┐             ┌───────▼───────┐                  │
│   │  EMPLOYER │             │    SEEKER     │                  │
│   │           │             │               │                  │
│   │ • Post    │             │ • Browse jobs │                  │
│   │   jobs    │             │ • Apply       │                  │
│   │ • Manage  │             │ • Manage own  │                  │
│   │   own     │             │   profile     │                  │
│   │   listings│             │ • Manage own  │                  │
│   │ • Review  │             │   applications│                  │
│   │   apps    │             │               │                  │
│   └───────────┘             └───────────────┘                  │
│                                                                 │
│   Note: Employer and Seeker don't inherit from each other     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### RBAC Decision Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                 RBAC DECISION FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Request: PUT /api/jobs/123                                   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ 1. AUTHENTICATION (Previous middleware)                 │  │
│   │    Is there a valid token?                              │  │
│   │    ─────────────────────────                            │  │
│   │    YES → Continue    NO → 401 Unauthorized              │  │
│   └────────────────────────┬────────────────────────────────┘  │
│                            │                                    │
│                            ▼                                    │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ 2. ROLE CHECK (RBAC middleware)                         │  │
│   │    Does user's role allow this action?                  │  │
│   │    ─────────────────────────────────                    │  │
│   │    Route requires: employer OR admin                    │  │
│   │    User role: employer                                  │  │
│   │    ─────────────────────────────────                    │  │
│   │    MATCH → Continue    NO MATCH → 403 Forbidden         │  │
│   └────────────────────────┬────────────────────────────────┘  │
│                            │                                    │
│                            ▼                                    │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ 3. OWNERSHIP CHECK (Controller logic)                   │  │
│   │    Does user own this resource?                         │  │
│   │    ─────────────────────────────────                    │  │
│   │    Job.employerId === req.user.id?                      │  │
│   │    OR user.role === 'admin'?                            │  │
│   │    ─────────────────────────────────                    │  │
│   │    YES → Process request    NO → 403 Forbidden          │  │
│   └────────────────────────┬────────────────────────────────┘  │
│                            │                                    │
│                            ▼                                    │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ 4. PROCESS REQUEST                                      │  │
│   │    Update job → 200 OK                                  │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Permission Check Patterns

```
┌─────────────────────────────────────────────────────────────────┐
│              PERMISSION CHECK LEVELS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   LEVEL 1: Route-Level Role Check                              │
│   ─────────────────────────────────                            │
│   // Can this role access this endpoint at all?                │
│   router.post('/jobs', auth, requireRole('employer'), create); │
│                                                                 │
│   ─────────────────────────────────────────────────────────    │
│                                                                 │
│   LEVEL 2: Resource Ownership Check                            │
│   ─────────────────────────────────                            │
│   // Does this user own this specific resource?                │
│   if (job.employerId !== req.user.id && req.user.role !== 'admin') {
│     throw new ForbiddenError('Cannot edit others\' jobs');     │
│   }                                                             │
│                                                                 │
│   ─────────────────────────────────────────────────────────    │
│                                                                 │
│   LEVEL 3: Field-Level Permissions                             │
│   ─────────────────────────────────                            │
│   // Can this user modify this specific field?                 │
│   if (req.body.featured && req.user.role !== 'admin') {        │
│     throw new ForbiddenError('Only admins can feature jobs');  │
│   }                                                             │
│                                                                 │
│   ─────────────────────────────────────────────────────────    │
│                                                                 │
│   LEVEL 4: State Transition Permissions                        │
│   ─────────────────────────────────────                        │
│   // Can this user change from this state to that state?       │
│   if (job.status === 'published' && req.body.status === 'draft') {
│     if (req.user.role !== 'admin') {                           │
│       throw new ForbiddenError('Cannot unpublish jobs');       │
│     }                                                           │
│   }                                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💻 Code Examples

### Basic Role Checking Middleware

**JavaScript:**

```javascript
// middleware/rbac.middleware.js

/**
 * Create middleware that requires specific role(s)
 * @param {...string} allowedRoles - Roles permitted to access the route
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    // Auth middleware should have run first
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        error: "NOT_AUTHENTICATED",
        message: "Authentication required",
      });
    }

    // Check if user's role is in allowed list
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        error: "FORBIDDEN",
        message: `This action requires one of these roles: ${allowedRoles.join(", ")}`,
        required: allowedRoles,
        actual: req.user.role,
      });
    }

    next();
  };
}

// Usage examples
router.post(
  "/jobs",
  authMiddleware,
  requireRole("employer", "admin"),
  createJob,
);
router.get("/admin/users", authMiddleware, requireRole("admin"), listUsers);
router.post("/applications", authMiddleware, requireRole("seeker"), applyToJob);
```

**TypeScript:**

```typescript
// middleware/rbac.middleware.ts
import { Request, Response, NextFunction } from "express";

type UserRole = "seeker" | "employer" | "admin";

/**
 * Create middleware that requires specific role(s)
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        error: "NOT_AUTHENTICATED",
        message: "Authentication required",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: "error",
        error: "FORBIDDEN",
        message: `This action requires one of these roles: ${allowedRoles.join(", ")}`,
        required: allowedRoles,
        actual: req.user.role,
      });
      return;
    }

    next();
  };
}
```

### Role Hierarchy Implementation

**JavaScript:**

```javascript
// middleware/rbac-hierarchy.middleware.js

const ROLE_HIERARCHY = {
  seeker: [],
  employer: [],
  admin: ["employer", "seeker"], // Admin inherits from both
};

/**
 * Get all roles a user effectively has (including inherited)
 */
function getEffectiveRoles(role) {
  const inherited = ROLE_HIERARCHY[role] || [];
  return [role, ...inherited];
}

/**
 * Check role with hierarchy support
 */
export function requireRoleWithHierarchy(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        error: "NOT_AUTHENTICATED",
        message: "Authentication required",
      });
    }

    const effectiveRoles = getEffectiveRoles(req.user.role);
    const hasPermission = allowedRoles.some((role) =>
      effectiveRoles.includes(role),
    );

    if (!hasPermission) {
      return res.status(403).json({
        status: "error",
        error: "FORBIDDEN",
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
}

// Admin can access employer routes due to hierarchy
router.post(
  "/jobs",
  authMiddleware,
  requireRoleWithHierarchy("employer"),
  createJob,
);
// Admin user → effective roles: ['admin', 'employer', 'seeker'] → can create jobs!
```

**TypeScript:**

```typescript
// middleware/rbac-hierarchy.middleware.ts
import { Request, Response, NextFunction } from "express";

type UserRole = "seeker" | "employer" | "admin";

const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  seeker: [],
  employer: [],
  admin: ["employer", "seeker"],
};

function getEffectiveRoles(role: UserRole): UserRole[] {
  const inherited = ROLE_HIERARCHY[role] || [];
  return [role, ...inherited];
}

export function requireRoleWithHierarchy(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        error: "NOT_AUTHENTICATED",
        message: "Authentication required",
      });
      return;
    }

    const effectiveRoles = getEffectiveRoles(req.user.role);
    const hasPermission = allowedRoles.some((role) =>
      effectiveRoles.includes(role),
    );

    if (!hasPermission) {
      res.status(403).json({
        status: "error",
        error: "FORBIDDEN",
        message: "You do not have permission to perform this action",
      });
      return;
    }

    next();
  };
}
```

### Permission-Based Access Control

When you need more granularity than roles:

**TypeScript:**

```typescript
// middleware/permissions.middleware.ts

// Define all permissions in the system
export const PERMISSIONS = {
  // Job permissions
  JOB_CREATE: "job:create",
  JOB_READ: "job:read",
  JOB_UPDATE_OWN: "job:update:own",
  JOB_UPDATE_ANY: "job:update:any",
  JOB_DELETE_OWN: "job:delete:own",
  JOB_DELETE_ANY: "job:delete:any",
  JOB_FEATURE: "job:feature",

  // Application permissions
  APPLICATION_CREATE: "application:create",
  APPLICATION_READ_OWN: "application:read:own",
  APPLICATION_READ_JOB: "application:read:job", // Employer sees apps for their jobs

  // User management
  USER_READ_ANY: "user:read:any",
  USER_UPDATE_ANY: "user:update:any",
  USER_DELETE_ANY: "user:delete:any",

  // Moderation
  MODERATE_JOBS: "moderate:jobs",
  MODERATE_USERS: "moderate:users",
} as const;

type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
type UserRole = "seeker" | "employer" | "admin";

// Map roles to permissions
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  seeker: [
    PERMISSIONS.JOB_READ,
    PERMISSIONS.APPLICATION_CREATE,
    PERMISSIONS.APPLICATION_READ_OWN,
  ],
  employer: [
    PERMISSIONS.JOB_READ,
    PERMISSIONS.JOB_CREATE,
    PERMISSIONS.JOB_UPDATE_OWN,
    PERMISSIONS.JOB_DELETE_OWN,
    PERMISSIONS.APPLICATION_READ_JOB,
  ],
  admin: [
    // All permissions
    ...Object.values(PERMISSIONS),
  ],
};

/**
 * Check if role has specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Middleware that requires specific permission(s)
 */
export function requirePermission(...permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        error: "NOT_AUTHENTICATED",
        message: "Authentication required",
      });
      return;
    }

    const hasAllPermissions = permissions.every((permission) =>
      hasPermission(req.user!.role, permission),
    );

    if (!hasAllPermissions) {
      res.status(403).json({
        status: "error",
        error: "FORBIDDEN",
        message: "You do not have the required permissions",
        required: permissions,
      });
      return;
    }

    next();
  };
}

// Usage
import {
  PERMISSIONS,
  requirePermission,
} from "./middleware/permissions.middleware";

router.post(
  "/jobs/:id/feature",
  authMiddleware,
  requirePermission(PERMISSIONS.JOB_FEATURE),
  featureJob,
);
```

---

## 🔨 Mini-Tutorial: Complete RBAC System

Let's build a flexible RBAC middleware system for DevJobs Pro.

### Step 1: Define Types and Constants

```typescript
// src/types/rbac.types.ts

export type UserRole = "seeker" | "employer" | "admin";

export interface RBACConfig {
  roles: UserRole[];
  ownershipCheck?: boolean;
  resourceType?: string;
}

// Permission scopes for fine-grained control
export type PermissionScope = "own" | "any" | "team";

export interface Permission {
  resource: string;
  action: "create" | "read" | "update" | "delete" | "manage";
  scope?: PermissionScope;
}
```

### Step 2: Create RBAC Middleware Factory

```typescript
// src/middleware/rbac.middleware.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import { UserRole, RBACConfig } from "../types/rbac.types";

// Role hierarchy configuration
const ROLE_HIERARCHY: Record<UserRole, number> = {
  seeker: 1,
  employer: 1,
  admin: 100, // Admin is highest
};

// Roles that admin inherits
const ADMIN_INHERITS: UserRole[] = ["seeker", "employer"];

/**
 * Check if a role satisfies the required role (including hierarchy)
 */
function roleSatisfies(userRole: UserRole, requiredRole: UserRole): boolean {
  if (userRole === requiredRole) return true;

  if (userRole === "admin") {
    return ADMIN_INHERITS.includes(requiredRole);
  }

  return false;
}

/**
 * Create role-checking middleware
 * Supports multiple roles (OR logic) and role hierarchy
 */
export function requireRole(...allowedRoles: UserRole[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Must be authenticated
    if (!req.user) {
      res.status(401).json({
        status: "error",
        error: "NOT_AUTHENTICATED",
        message: "You must be logged in to access this resource",
      });
      return;
    }

    // Check if user's role (or inherited roles) is in allowed list
    const hasRole = allowedRoles.some((required) =>
      roleSatisfies(req.user!.role, required),
    );

    if (!hasRole) {
      res.status(403).json({
        status: "error",
        error: "INSUFFICIENT_ROLE",
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
        yourRole: req.user.role,
      });
      return;
    }

    next();
  };
}

/**
 * Require admin role specifically
 */
export const requireAdmin: RequestHandler = requireRole("admin");

/**
 * Require employer role (admin also has access via hierarchy)
 */
export const requireEmployer: RequestHandler = requireRole("employer");

/**
 * Require seeker role (admin also has access via hierarchy)
 */
export const requireSeeker: RequestHandler = requireRole("seeker");

/**
 * Combined auth + role middleware
 * Use when you want a single middleware instead of chaining
 */
export function authWithRole(...allowedRoles: UserRole[]): RequestHandler[] {
  return [
    // Import your auth middleware
    require("./auth.middleware").authMiddleware,
    requireRole(...allowedRoles),
  ];
}
```

### Step 3: Ownership Verification Middleware

```typescript
// src/middleware/ownership.middleware.ts
import { Request, Response, NextFunction, RequestHandler } from "express";

interface OwnershipConfig {
  // Function to get owner ID from the resource
  getOwnerId: (resource: any) => string;
  // Function to fetch the resource
  getResource: (req: Request) => Promise<any>;
  // Field name where resource will be attached to req
  attachAs?: string;
  // Allow admins to bypass ownership check
  adminBypass?: boolean;
}

/**
 * Create ownership verification middleware
 * Checks if the authenticated user owns the requested resource
 */
export function requireOwnership(config: OwnershipConfig): RequestHandler {
  const {
    getOwnerId,
    getResource,
    attachAs = "resource",
    adminBypass = true,
  } = config;

  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Must be authenticated
      if (!req.user) {
        res.status(401).json({
          status: "error",
          error: "NOT_AUTHENTICATED",
          message: "Authentication required",
        });
        return;
      }

      // Admin bypass
      if (adminBypass && req.user.role === "admin") {
        // Still fetch resource for the handler
        const resource = await getResource(req);
        if (!resource) {
          res.status(404).json({
            status: "error",
            error: "NOT_FOUND",
            message: "Resource not found",
          });
          return;
        }
        (req as any)[attachAs] = resource;
        return next();
      }

      // Fetch resource
      const resource = await getResource(req);

      if (!resource) {
        res.status(404).json({
          status: "error",
          error: "NOT_FOUND",
          message: "Resource not found",
        });
        return;
      }

      // Check ownership
      const ownerId = getOwnerId(resource);

      if (ownerId !== req.user.id) {
        res.status(403).json({
          status: "error",
          error: "NOT_OWNER",
          message: "You can only access your own resources",
        });
        return;
      }

      // Attach resource to request for handler use
      (req as any)[attachAs] = resource;

      next();
    } catch (error) {
      next(error);
    }
  };
}

// Usage example:
// import { jobService } from '../services/job.service';
//
// const requireJobOwnership = requireOwnership({
//   getResource: async (req) => jobService.findById(req.params.id),
//   getOwnerId: (job) => job.employerId,
//   attachAs: 'job',
// });
//
// router.put('/jobs/:id', authMiddleware, requireEmployer, requireJobOwnership, updateJob);
```

### Step 4: JavaScript Versions

```javascript
// src/middleware/rbac.middleware.js

const ROLE_HIERARCHY = {
  seeker: 1,
  employer: 1,
  admin: 100,
};

const ADMIN_INHERITS = ["seeker", "employer"];

function roleSatisfies(userRole, requiredRole) {
  if (userRole === requiredRole) return true;
  if (userRole === "admin") return ADMIN_INHERITS.includes(requiredRole);
  return false;
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        error: "NOT_AUTHENTICATED",
        message: "You must be logged in to access this resource",
      });
    }

    const hasRole = allowedRoles.some((required) =>
      roleSatisfies(req.user.role, required),
    );

    if (!hasRole) {
      return res.status(403).json({
        status: "error",
        error: "INSUFFICIENT_ROLE",
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
        yourRole: req.user.role,
      });
    }

    next();
  };
}

export const requireAdmin = requireRole("admin");
export const requireEmployer = requireRole("employer");
export const requireSeeker = requireRole("seeker");
```

```javascript
// src/middleware/ownership.middleware.js

export function requireOwnership({
  getOwnerId,
  getResource,
  attachAs = "resource",
  adminBypass = true,
}) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: "error",
          error: "NOT_AUTHENTICATED",
          message: "Authentication required",
        });
      }

      const resource = await getResource(req);

      if (!resource) {
        return res.status(404).json({
          status: "error",
          error: "NOT_FOUND",
          message: "Resource not found",
        });
      }

      if (adminBypass && req.user.role === "admin") {
        req[attachAs] = resource;
        return next();
      }

      const ownerId = getOwnerId(resource);

      if (ownerId !== req.user.id) {
        return res.status(403).json({
          status: "error",
          error: "NOT_OWNER",
          message: "You can only access your own resources",
        });
      }

      req[attachAs] = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
}
```

---

## 🏋️ Practice: DevJobs Pro RBAC Implementation

Implement the complete RBAC system for DevJobs Pro with all three roles.

### Step 1: Define Role Capabilities

```typescript
// src/config/roles.config.ts

export interface RoleCapabilities {
  jobs: {
    browse: boolean;
    view: boolean;
    create: boolean;
    updateOwn: boolean;
    updateAny: boolean;
    deleteOwn: boolean;
    deleteAny: boolean;
    feature: boolean;
  };
  applications: {
    create: boolean;
    viewOwn: boolean;
    viewForOwnJobs: boolean;
    viewAny: boolean;
    withdrawOwn: boolean;
    updateStatus: boolean;
  };
  users: {
    viewOwn: boolean;
    viewAny: boolean;
    updateOwn: boolean;
    updateAny: boolean;
    deleteOwn: boolean;
    deleteAny: boolean;
  };
  admin: {
    dashboard: boolean;
    moderateJobs: boolean;
    moderateUsers: boolean;
    viewAnalytics: boolean;
  };
}

export const ROLE_CAPABILITIES: Record<string, RoleCapabilities> = {
  seeker: {
    jobs: {
      browse: true,
      view: true,
      create: false,
      updateOwn: false,
      updateAny: false,
      deleteOwn: false,
      deleteAny: false,
      feature: false,
    },
    applications: {
      create: true,
      viewOwn: true,
      viewForOwnJobs: false,
      viewAny: false,
      withdrawOwn: true,
      updateStatus: false,
    },
    users: {
      viewOwn: true,
      viewAny: false,
      updateOwn: true,
      updateAny: false,
      deleteOwn: true,
      deleteAny: false,
    },
    admin: {
      dashboard: false,
      moderateJobs: false,
      moderateUsers: false,
      viewAnalytics: false,
    },
  },
  employer: {
    jobs: {
      browse: true,
      view: true,
      create: true,
      updateOwn: true,
      updateAny: false,
      deleteOwn: true,
      deleteAny: false,
      feature: false,
    },
    applications: {
      create: false,
      viewOwn: false,
      viewForOwnJobs: true,
      viewAny: false,
      withdrawOwn: false,
      updateStatus: true, // Can update status for their job's applications
    },
    users: {
      viewOwn: true,
      viewAny: false,
      updateOwn: true,
      updateAny: false,
      deleteOwn: true,
      deleteAny: false,
    },
    admin: {
      dashboard: false,
      moderateJobs: false,
      moderateUsers: false,
      viewAnalytics: false,
    },
  },
  admin: {
    jobs: {
      browse: true,
      view: true,
      create: true,
      updateOwn: true,
      updateAny: true,
      deleteOwn: true,
      deleteAny: true,
      feature: true,
    },
    applications: {
      create: true,
      viewOwn: true,
      viewForOwnJobs: true,
      viewAny: true,
      withdrawOwn: true,
      updateStatus: true,
    },
    users: {
      viewOwn: true,
      viewAny: true,
      updateOwn: true,
      updateAny: true,
      deleteOwn: true,
      deleteAny: true,
    },
    admin: {
      dashboard: true,
      moderateJobs: true,
      moderateUsers: true,
      viewAnalytics: true,
    },
  },
};

/**
 * Check if a role has a specific capability
 */
export function can(
  role: string,
  resource: keyof RoleCapabilities,
  action: string,
): boolean {
  const capabilities = ROLE_CAPABILITIES[role];
  if (!capabilities) return false;

  const resourceCaps = capabilities[resource];
  if (!resourceCaps) return false;

  return (resourceCaps as any)[action] === true;
}
```

### Step 2: Complete Route Setup

```typescript
// src/routes/job.routes.ts
import { Router } from "express";
import { authMiddleware, optionalAuth } from "../middleware/auth.middleware";
import { requireRole, requireEmployer } from "../middleware/rbac.middleware";
import { requireOwnership } from "../middleware/ownership.middleware";
import { jobController } from "../controllers/job.controller";
import { jobService } from "../services/job.service";

const router = Router();

// Job ownership middleware
const checkJobOwnership = requireOwnership({
  getResource: (req) => jobService.findById(req.params.id),
  getOwnerId: (job) => job.employerId,
  attachAs: "job",
});

// PUBLIC: Anyone can browse and view jobs
router.get("/", optionalAuth, jobController.listJobs);
router.get("/:id", optionalAuth, jobController.getJob);

// EMPLOYER: Create jobs
router.post("/", authMiddleware, requireEmployer, jobController.createJob);

// EMPLOYER (owner) or ADMIN: Update/delete specific job
router.put(
  "/:id",
  authMiddleware,
  requireEmployer,
  checkJobOwnership,
  jobController.updateJob,
);
router.delete(
  "/:id",
  authMiddleware,
  requireEmployer,
  checkJobOwnership,
  jobController.deleteJob,
);

// EMPLOYER (owner) or ADMIN: View applications for a job
router.get(
  "/:id/applications",
  authMiddleware,
  requireEmployer,
  checkJobOwnership,
  jobController.getJobApplications,
);

// ADMIN ONLY: Feature a job
router.post(
  "/:id/feature",
  authMiddleware,
  requireRole("admin"),
  jobController.featureJob,
);

export default router;
```

```typescript
// src/routes/application.routes.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  requireRole,
  requireSeeker,
  requireEmployer,
} from "../middleware/rbac.middleware";
import { requireOwnership } from "../middleware/ownership.middleware";
import { applicationController } from "../controllers/application.controller";
import { applicationService } from "../services/application.service";

const router = Router();

// Application ownership middleware
const checkApplicationOwnership = requireOwnership({
  getResource: (req) => applicationService.findById(req.params.id),
  getOwnerId: (app) => app.seekerId,
  attachAs: "application",
});

// SEEKER: Apply to jobs
router.post("/", authMiddleware, requireSeeker, applicationController.apply);

// SEEKER: View own applications
router.get(
  "/",
  authMiddleware,
  requireSeeker,
  applicationController.getMyApplications,
);

// SEEKER: Withdraw own application
router.delete(
  "/:id",
  authMiddleware,
  requireSeeker,
  checkApplicationOwnership,
  applicationController.withdraw,
);

// EMPLOYER/ADMIN: Update application status (reviewed, accepted, rejected)
// Note: Ownership checked in controller (must be for employer's job)
router.patch(
  "/:id/status",
  authMiddleware,
  requireRole("employer", "admin"),
  applicationController.updateStatus,
);

export default router;
```

```typescript
// src/routes/admin.routes.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { adminController } from "../controllers/admin.controller";

const router = Router();

// All admin routes require admin role
router.use(authMiddleware);
router.use(requireRole("admin"));

// Dashboard
router.get("/dashboard", adminController.getDashboard);
router.get("/analytics", adminController.getAnalytics);

// User management
router.get("/users", adminController.listUsers);
router.get("/users/:id", adminController.getUser);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);
router.put("/users/:id/role", adminController.changeUserRole);

// Job moderation
router.get("/jobs/pending", adminController.getPendingJobs);
router.put("/jobs/:id/approve", adminController.approveJob);
router.put("/jobs/:id/reject", adminController.rejectJob);
router.put("/jobs/:id/feature", adminController.toggleFeature);

export default router;
```

### Step 3: Application Controller with Authorization Logic

```typescript
// src/controllers/application.controller.ts
import { Request, Response, NextFunction } from "express";
import { applicationService } from "../services/application.service";
import { jobService } from "../services/job.service";
import { AppError } from "../errors/AppError";

export class ApplicationController {
  /**
   * Update application status
   * Employer can only update applications for their own jobs
   * Admin can update any application
   */
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ["pending", "reviewed", "accepted", "rejected"];
      if (!validStatuses.includes(status)) {
        throw new AppError(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          400,
        );
      }

      // Get application with job info
      const application = await applicationService.findByIdWithJob(id);

      if (!application) {
        throw new AppError("Application not found", 404);
      }

      // Authorization check: Admin or job owner
      if (req.user!.role !== "admin") {
        if (application.job.employerId !== req.user!.id) {
          throw new AppError(
            "You can only update applications for your own jobs",
            403,
          );
        }
      }

      // Update status
      const updated = await applicationService.updateStatus(id, status);

      res.json({
        status: "success",
        data: { application: updated },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const applicationController = new ApplicationController();
```

---

## 💡 Pro Tips vs Junior Traps

| Pro Tip                                                   | Junior Trap                                               |
| --------------------------------------------------------- | --------------------------------------------------------- |
| Use roles for route access, ownership for resource access | Checking role in every controller method manually         |
| Return 403 Forbidden for auth users without permission    | Returning 401 for all authorization failures              |
| Include helpful error details (required role, your role)  | Generic "Access denied" message                           |
| Create role hierarchy for admin to inherit permissions    | Listing admin in every `requireRole('employer', 'admin')` |
| Use middleware factory pattern for flexibility            | Hardcoding role checks inline                             |
| Attach fetched resource to req for handler use            | Fetching same resource twice (auth + handler)             |
| Check ownership in middleware, not controller             | Scattered ownership checks throughout codebase            |
| Audit role changes and permission denials                 | Silent authorization failures                             |

---

## 🔧 5-Minute Debugger

### "Forbidden" When Role Seems Correct

```typescript
// ❌ WRONG: Middleware order matters!
router.put(
  "/jobs/:id",
  checkJobOwnership, // Runs first, req.user is undefined!
  authMiddleware, // Should be first
  requireEmployer,
  updateJob,
);

// ✅ CORRECT: Auth first, then roles, then ownership
router.put(
  "/jobs/:id",
  authMiddleware, // 1. Verify token, set req.user
  requireEmployer, // 2. Check role
  checkJobOwnership, // 3. Check ownership (req.user exists)
  updateJob,
);
```

### Role Not Updating After Login

```typescript
// ❌ WRONG: Using cached user role from token
// If admin changes user's role, old token still has old role

// ✅ SOLUTION 1: Short token expiry (force re-login)
const ACCESS_EXPIRES_IN = "15m";

// ✅ SOLUTION 2: Verify role against DB for critical operations
async function requireFreshRole(role) {
  return async (req, res, next) => {
    const user = await userService.findById(req.user.id);
    if (user.role !== role) {
      return res.status(403).json({ error: "Role changed. Please re-login." });
    }
    next();
  };
}
```

### Type Error: `req.job` Doesn't Exist

```typescript
// ❌ WRONG: TypeScript doesn't know about req.job
router.put("/jobs/:id", authMiddleware, checkJobOwnership, (req, res) => {
  console.log(req.job); // Error: Property 'job' does not exist
});

// ✅ CORRECT: Extend the Request type or use type assertion
// Option 1: Extend Express types globally (recommended)
declare global {
  namespace Express {
    interface Request {
      job?: Job;
      application?: Application;
    }
  }
}

// Option 2: Type assertion in handler
router.put("/jobs/:id", authMiddleware, checkJobOwnership, (req, res) => {
  const job = (req as Request & { job: Job }).job;
});
```

### Ownership Check Fails for New Resources

```typescript
// ❌ WRONG: Checking ownership for resources being created
router.post(
  "/jobs",
  authMiddleware,
  requireEmployer,
  checkJobOwnership,
  createJob,
);
// → Error: Resource not found (it doesn't exist yet!)

// ✅ CORRECT: Only check ownership for existing resources
router.post("/jobs", authMiddleware, requireEmployer, createJob);
// Ownership is established by setting job.employerId = req.user.id
```

---

## ✅ Definition of Done Checklist

Before considering this module complete, verify:

- [ ] `requireRole` middleware accepts multiple roles (OR logic)
- [ ] Role hierarchy allows admin to access employer/seeker routes
- [ ] Return 403 Forbidden (not 401) for authenticated users without permission
- [ ] Error responses include helpful debugging info (required role, actual role)
- [ ] Ownership middleware fetches and attaches resource to request
- [ ] Admin bypass implemented for ownership checks
- [ ] All job routes properly protected by role
- [ ] All application routes properly protected by role
- [ ] Admin routes require admin role exclusively
- [ ] TypeScript types extended for `req.user` and attached resources
- [ ] Unit tests cover all RBAC middleware branches
- [ ] Integration tests verify route protection

```bash
# Quick verification
npm test -- --grep "RBAC\|role\|permission"

# Manual testing
# As seeker, try to create job
curl -X POST http://localhost:3000/api/jobs \
  -H "Authorization: Bearer <seeker-token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test"}'
# → 403 Forbidden

# As employer, try to access admin dashboard
curl http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer <employer-token>"
# → 403 Forbidden
```

---

## 🔗 Navigation

[← Lesson 3: Auth Middleware](./03-auth-middleware-protected-routes.md) | [Module 12: File Uploads →](../12-file-uploads/README.md)

---

## 📚 Additional Resources

- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [RBAC vs ABAC Comparison](https://www.okta.com/identity-101/role-based-access-control-vs-attribute-based-access-control/)
- [NIST RBAC Model](https://csrc.nist.gov/projects/role-based-access-control)
- [Casbin - Authorization Library](https://casbin.org/) (for complex permission systems)

---

## 🎓 Module 11 Complete!

Congratulations! You've built a complete authentication and authorization system for DevJobs Pro:

1. **Password Hashing**: Secure storage with bcrypt
2. **JWT Tokens**: Stateless authentication with access/refresh pattern
3. **Auth Middleware**: Route protection and user context
4. **RBAC**: Role-based permissions for seekers, employers, and admins

Your API is now properly secured. Users can only access what they're supposed to, and sensitive operations require proper authorization.

**Next up**: Module 12 covers file uploads—resume uploads for seekers and company logos for employers!
