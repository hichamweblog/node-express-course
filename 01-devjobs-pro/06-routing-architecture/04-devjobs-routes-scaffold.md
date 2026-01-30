# Lesson 04: DevJobs Routes Scaffold

## Time to Build

You've learned route organization, the controller-service pattern, and professional project structure. Now it's time to put it all together and **build the complete routing foundation for DevJobs Pro**.

This is a hands-on lesson. We'll create every route file, controller, and service stub. Later modules will implement the actual logic—but the architecture starts here.

---

## DevJobs Pro Complete Route Architecture

Here's what we're building:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DevJobs Pro API Architecture                         │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │   Express App   │
                              │     app.ts      │
                              └────────┬────────┘
                                       │
                              app.use('/api/v1', apiRouter)
                                       │
                                       ▼
                              ┌─────────────────┐
                              │  routes/index   │
                              │   API Router    │
                              └────────┬────────┘
                                       │
        ┌──────────┬──────────┬────────┼────────┬──────────┬──────────┐
        │          │          │        │        │          │          │
        ▼          ▼          ▼        ▼        ▼          ▼          ▼
   ┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐
   │  /auth  ││  /jobs  ││/applica-││ /users  ││/compan- ││ /admin  ││ /health │
   │         ││         ││  tions  ││         ││   ies   ││         ││         │
   └────┬────┘└────┬────┘└────┬────┘└────┬────┘└────┬────┘└────┬────┘└─────────┘
        │          │          │          │          │          │
        ▼          ▼          ▼          ▼          ▼          ▼
   ┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐
   │  Auth   ││  Jobs   ││ Applics ││  Users  ││Companies││  Admin  │
   │Controller│Controller│Controller│Controller│Controller│Controller│
   └────┬────┘└────┬────┘└────┬────┘└────┬────┘└────┬────┘└────┬────┘
        │          │          │          │          │          │
        ▼          ▼          ▼          ▼          ▼          ▼
   ┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐
   │  Auth   ││  Jobs   ││ Applics ││  Users  ││Companies││  Admin  │
   │ Service ││ Service ││ Service ││ Service ││ Service ││ Service │
   └─────────┘└─────────┘└─────────┘└─────────┘└─────────┘└─────────┘


Endpoints Overview:
═══════════════════════════════════════════════════════════════════════════════
 /auth          │ register, login, logout, refresh-token
 /jobs          │ list, create, get, update, delete, search
 /applications  │ apply, my-applications, job-applications, update-status
 /users         │ me, update-me, upload-resume, get-profile
 /companies     │ list, create, get, update, delete
 /admin         │ get-users, modify-user, get-stats, force-delete-job
═══════════════════════════════════════════════════════════════════════════════
```

---

## Route Specifications

### Authentication Routes (`/api/v1/auth`)

| Method | Path             | Description             | Auth Required       |
| ------ | ---------------- | ----------------------- | ------------------- |
| POST   | `/register`      | Create new user account | No                  |
| POST   | `/login`         | Authenticate user       | No                  |
| POST   | `/logout`        | End user session        | Yes                 |
| POST   | `/refresh-token` | Get new access token    | Yes (refresh token) |

### Jobs Routes (`/api/v1/jobs`)

| Method | Path      | Description               | Auth Required  |
| ------ | --------- | ------------------------- | -------------- |
| GET    | `/`       | List jobs with pagination | No             |
| GET    | `/search` | Search jobs with filters  | No             |
| GET    | `/:id`    | Get single job details    | No             |
| POST   | `/`       | Create new job listing    | Yes (employer) |
| PATCH  | `/:id`    | Update job listing        | Yes (owner)    |
| DELETE | `/:id`    | Delete job listing        | Yes (owner)    |

### Applications Routes (`/api/v1/applications`)

| Method | Path          | Description                | Auth Required        |
| ------ | ------------- | -------------------------- | -------------------- |
| POST   | `/`           | Submit job application     | Yes (job seeker)     |
| GET    | `/my`         | Get my applications        | Yes (job seeker)     |
| GET    | `/job/:jobId` | Get applications for a job | Yes (employer/owner) |
| PATCH  | `/:id/status` | Update application status  | Yes (employer/owner) |

### Users Routes (`/api/v1/users`)

| Method | Path         | Description                 | Auth Required    |
| ------ | ------------ | --------------------------- | ---------------- |
| GET    | `/me`        | Get current user profile    | Yes              |
| PATCH  | `/me`        | Update current user profile | Yes              |
| POST   | `/me/resume` | Upload resume file          | Yes (job seeker) |
| GET    | `/:id`       | Get public user profile     | No               |

### Companies Routes (`/api/v1/companies`)

| Method | Path   | Description         | Auth Required  |
| ------ | ------ | ------------------- | -------------- |
| GET    | `/`    | List all companies  | No             |
| GET    | `/:id` | Get company details | No             |
| POST   | `/`    | Create new company  | Yes (employer) |
| PATCH  | `/:id` | Update company      | Yes (owner)    |
| DELETE | `/:id` | Delete company      | Yes (owner)    |

### Admin Routes (`/api/v1/admin`)

| Method | Path         | Description          | Auth Required |
| ------ | ------------ | -------------------- | ------------- |
| GET    | `/users`     | List all users       | Yes (admin)   |
| PATCH  | `/users/:id` | Modify any user      | Yes (admin)   |
| GET    | `/stats`     | Dashboard statistics | Yes (admin)   |
| DELETE | `/jobs/:id`  | Force delete any job | Yes (admin)   |

---

## Implementation: Route Files

### routes/index.ts (Route Aggregator)

```typescript
// src/routes/index.ts
import { Router } from "express";

import authRouter from "./auth.routes.js";
import jobsRouter from "./jobs.routes.js";
import applicationsRouter from "./applications.routes.js";
import usersRouter from "./users.routes.js";
import companiesRouter from "./companies.routes.js";
import adminRouter from "./admin.routes.js";

const router = Router();

// API health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
    },
  });
});

// Mount route modules
router.use("/auth", authRouter);
router.use("/jobs", jobsRouter);
router.use("/applications", applicationsRouter);
router.use("/users", usersRouter);
router.use("/companies", companiesRouter);
router.use("/admin", adminRouter);

export default router;
```

### routes/auth.routes.ts

```typescript
// src/routes/auth.routes.ts
import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user and get tokens
 * @access  Public
 */
router.post("/login", authController.login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user and invalidate tokens
 * @access  Private
 */
router.post("/logout", authenticate, authController.logout);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Get new access token using refresh token
 * @access  Public (requires valid refresh token)
 */
router.post("/refresh-token", authController.refreshToken);

export default router;
```

### routes/jobs.routes.ts

```typescript
// src/routes/jobs.routes.ts
import { Router } from "express";
import { jobsController } from "../controllers/jobs.controller.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";

const router = Router();

/**
 * @route   GET /api/v1/jobs
 * @desc    List all jobs with pagination
 * @access  Public
 */
router.get("/", jobsController.list);

/**
 * @route   GET /api/v1/jobs/search
 * @desc    Search jobs with filters (location, type, salary, keyword)
 * @access  Public
 */
router.get("/search", jobsController.search);

/**
 * @route   GET /api/v1/jobs/:id
 * @desc    Get single job by ID
 * @access  Public
 */
router.get("/:id", optionalAuth, jobsController.getById);

/**
 * @route   POST /api/v1/jobs
 * @desc    Create new job listing
 * @access  Private (employer only)
 */
router.post("/", authenticate, jobsController.create);

/**
 * @route   PATCH /api/v1/jobs/:id
 * @desc    Update job listing
 * @access  Private (job owner only)
 */
router.patch("/:id", authenticate, jobsController.update);

/**
 * @route   DELETE /api/v1/jobs/:id
 * @desc    Delete job listing
 * @access  Private (job owner only)
 */
router.delete("/:id", authenticate, jobsController.delete);

export default router;
```

### routes/applications.routes.ts

```typescript
// src/routes/applications.routes.ts
import { Router } from "express";
import { applicationsController } from "../controllers/applications.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// All application routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/applications
 * @desc    Submit application for a job
 * @access  Private (job seeker)
 */
router.post("/", applicationsController.apply);

/**
 * @route   GET /api/v1/applications/my
 * @desc    Get all applications submitted by current user
 * @access  Private (job seeker)
 */
router.get("/my", applicationsController.getMyApplications);

/**
 * @route   GET /api/v1/applications/job/:jobId
 * @desc    Get all applications for a specific job
 * @access  Private (employer who owns the job)
 */
router.get("/job/:jobId", applicationsController.getJobApplications);

/**
 * @route   PATCH /api/v1/applications/:id/status
 * @desc    Update application status (accept, reject, etc.)
 * @access  Private (employer who owns the job)
 */
router.patch("/:id/status", applicationsController.updateStatus);

export default router;
```

### routes/users.routes.ts

```typescript
// src/routes/users.routes.ts
import { Router } from "express";
import { usersController } from "../controllers/users.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

/**
 * @route   GET /api/v1/users/me
 * @desc    Get current authenticated user profile
 * @access  Private
 */
router.get("/me", authenticate, usersController.getMe);

/**
 * @route   PATCH /api/v1/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.patch("/me", authenticate, usersController.updateMe);

/**
 * @route   POST /api/v1/users/me/resume
 * @desc    Upload resume file
 * @access  Private (job seeker)
 */
router.post("/me/resume", authenticate, usersController.uploadResume);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get public user profile
 * @access  Public
 */
router.get("/:id", usersController.getProfile);

export default router;
```

### routes/companies.routes.ts

```typescript
// src/routes/companies.routes.ts
import { Router } from "express";
import { companiesController } from "../controllers/companies.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

/**
 * @route   GET /api/v1/companies
 * @desc    List all companies
 * @access  Public
 */
router.get("/", companiesController.list);

/**
 * @route   GET /api/v1/companies/:id
 * @desc    Get company details and job listings
 * @access  Public
 */
router.get("/:id", companiesController.getById);

/**
 * @route   POST /api/v1/companies
 * @desc    Create new company
 * @access  Private (employer)
 */
router.post("/", authenticate, companiesController.create);

/**
 * @route   PATCH /api/v1/companies/:id
 * @desc    Update company details
 * @access  Private (company owner)
 */
router.patch("/:id", authenticate, companiesController.update);

/**
 * @route   DELETE /api/v1/companies/:id
 * @desc    Delete company and all its jobs
 * @access  Private (company owner)
 */
router.delete("/:id", authenticate, companiesController.delete);

export default router;
```

### routes/admin.routes.ts

```typescript
// src/routes/admin.routes.ts
import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users with pagination and filters
 * @access  Admin only
 */
router.get("/users", adminController.getAllUsers);

/**
 * @route   PATCH /api/v1/admin/users/:id
 * @desc    Modify any user (ban, change role, etc.)
 * @access  Admin only
 */
router.patch("/users/:id", adminController.modifyUser);

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get dashboard statistics
 * @access  Admin only
 */
router.get("/stats", adminController.getStats);

/**
 * @route   DELETE /api/v1/admin/jobs/:id
 * @desc    Force delete any job (moderation)
 * @access  Admin only
 */
router.delete("/jobs/:id", adminController.forceDeleteJob);

export default router;
```

---

## Implementation: Controllers

### controllers/auth.controller.ts

```typescript
// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";

export const authController = {
  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name, role } = req.body;

      const result = await authService.register({
        email,
        password,
        name,
        role,
      });

      res.status(201).json({
        success: true,
        message: "Registration successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const result = await authService.login({ email, password });

      res.json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const token = req.headers.authorization?.split(" ")[1];

      await authService.logout(userId, token!);

      res.json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh-token
   */
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      const result = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
```

### controllers/jobs.controller.ts

```typescript
// src/controllers/jobs.controller.ts
import { Request, Response, NextFunction } from "express";
import { jobsService } from "../services/jobs.service.js";

export const jobsController = {
  /**
   * List all jobs
   * GET /api/v1/jobs
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;

      const result = await jobsService.listJobs({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      });

      res.json({
        success: true,
        data: result.jobs,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Search jobs with filters
   * GET /api/v1/jobs/search
   */
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, location, type, minSalary, maxSalary, page, limit } =
        req.query;

      const result = await jobsService.searchJobs({
        query: q as string,
        location: location as string,
        type: type as string,
        minSalary: minSalary ? Number(minSalary) : undefined,
        maxSalary: maxSalary ? Number(maxSalary) : undefined,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      });

      res.json({
        success: true,
        data: result.jobs,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get single job
   * GET /api/v1/jobs/:id
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const job = await jobsService.getJobById(id);

      res.json({
        success: true,
        data: job,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new job
   * POST /api/v1/jobs
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const jobData = req.body;

      const job = await jobsService.createJob(jobData, userId);

      res.status(201).json({
        success: true,
        message: "Job created successfully",
        data: job,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update job
   * PATCH /api/v1/jobs/:id
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const updateData = req.body;

      const job = await jobsService.updateJob(id, updateData, userId);

      res.json({
        success: true,
        message: "Job updated successfully",
        data: job,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete job
   * DELETE /api/v1/jobs/:id
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await jobsService.deleteJob(id, userId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
```

### controllers/applications.controller.ts

```typescript
// src/controllers/applications.controller.ts
import { Request, Response, NextFunction } from "express";
import { applicationsService } from "../services/applications.service.js";

export const applicationsController = {
  /**
   * Submit job application
   * POST /api/v1/applications
   */
  async apply(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { jobId, coverLetter } = req.body;

      const application = await applicationsService.applyToJob({
        jobId,
        userId,
        coverLetter,
      });

      res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        data: application,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get current user's applications
   * GET /api/v1/applications/my
   */
  async getMyApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page, limit, status } = req.query;

      const result = await applicationsService.getUserApplications(userId, {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        status: status as string,
      });

      res.json({
        success: true,
        data: result.applications,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get applications for a job
   * GET /api/v1/applications/job/:jobId
   */
  async getJobApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;
      const userId = req.user!.id;
      const { page, limit, status } = req.query;

      const result = await applicationsService.getJobApplications(
        jobId,
        userId,
        {
          page: Number(page) || 1,
          limit: Number(limit) || 10,
          status: status as string,
        },
      );

      res.json({
        success: true,
        data: result.applications,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update application status
   * PATCH /api/v1/applications/:id/status
   */
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { status, feedback } = req.body;

      const application = await applicationsService.updateApplicationStatus(
        id,
        userId,
        { status, feedback },
      );

      res.json({
        success: true,
        message: "Application status updated",
        data: application,
      });
    } catch (error) {
      next(error);
    }
  },
};
```

### controllers/users.controller.ts

```typescript
// src/controllers/users.controller.ts
import { Request, Response, NextFunction } from "express";
import { usersService } from "../services/users.service.js";

export const usersController = {
  /**
   * Get current user profile
   * GET /api/v1/users/me
   */
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const user = await usersService.getUserById(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update current user profile
   * PATCH /api/v1/users/me
   */
  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const updateData = req.body;

      const user = await usersService.updateProfile(userId, updateData);

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Upload resume
   * POST /api/v1/users/me/resume
   */
  async uploadResume(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      // File handling will be implemented in File Uploads module
      const file = req.file;

      const result = await usersService.uploadResume(userId, file);

      res.json({
        success: true,
        message: "Resume uploaded successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get public user profile
   * GET /api/v1/users/:id
   */
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await usersService.getPublicProfile(id);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
};
```

### controllers/companies.controller.ts

```typescript
// src/controllers/companies.controller.ts
import { Request, Response, NextFunction } from "express";
import { companiesService } from "../services/companies.service.js";

export const companiesController = {
  /**
   * List all companies
   * GET /api/v1/companies
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search } = req.query;

      const result = await companiesService.listCompanies({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        search: search as string,
      });

      res.json({
        success: true,
        data: result.companies,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get company by ID
   * GET /api/v1/companies/:id
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const company = await companiesService.getCompanyById(id);

      res.json({
        success: true,
        data: company,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new company
   * POST /api/v1/companies
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const companyData = req.body;

      const company = await companiesService.createCompany(companyData, userId);

      res.status(201).json({
        success: true,
        message: "Company created successfully",
        data: company,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update company
   * PATCH /api/v1/companies/:id
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const updateData = req.body;

      const company = await companiesService.updateCompany(
        id,
        updateData,
        userId,
      );

      res.json({
        success: true,
        message: "Company updated successfully",
        data: company,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete company
   * DELETE /api/v1/companies/:id
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await companiesService.deleteCompany(id, userId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
```

### controllers/admin.controller.ts

```typescript
// src/controllers/admin.controller.ts
import { Request, Response, NextFunction } from "express";
import { adminService } from "../services/admin.service.js";

export const adminController = {
  /**
   * Get all users
   * GET /api/v1/admin/users
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, role, search } = req.query;

      const result = await adminService.getAllUsers({
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        role: role as string,
        search: search as string,
      });

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Modify user
   * PATCH /api/v1/admin/users/:id
   */
  async modifyUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const user = await adminService.modifyUser(id, updateData);

      res.json({
        success: true,
        message: "User modified successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get dashboard statistics
   * GET /api/v1/admin/stats
   */
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Force delete any job
   * DELETE /api/v1/admin/jobs/:id
   */
  async forceDeleteJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.user!.id;
      const { reason } = req.body;

      await adminService.forceDeleteJob(id, adminId, reason);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
```

---

## Implementation: Service Stubs

### services/auth.service.ts

```typescript
// src/services/auth.service.ts
import {
  NotFoundError,
  UnauthorizedError,
  ConflictError,
} from "../utils/errors.js";

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role: "job_seeker" | "employer";
}

interface LoginInput {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterInput) {
    // TODO: Implement in Authentication module
    // 1. Validate input
    // 2. Check if email exists
    // 3. Hash password
    // 4. Create user in database
    // 5. Generate tokens
    // 6. Return user and tokens
    throw new Error("Not implemented");
  },

  async login(data: LoginInput) {
    // TODO: Implement in Authentication module
    // 1. Find user by email
    // 2. Verify password
    // 3. Generate tokens
    // 4. Return user and tokens
    throw new Error("Not implemented");
  },

  async logout(userId: string, token: string) {
    // TODO: Implement in Authentication module
    // 1. Invalidate token (add to blacklist or remove from whitelist)
    throw new Error("Not implemented");
  },

  async refreshToken(refreshToken: string) {
    // TODO: Implement in Authentication module
    // 1. Verify refresh token
    // 2. Generate new access token
    // 3. Return new tokens
    throw new Error("Not implemented");
  },
};
```

### services/jobs.service.ts

```typescript
// src/services/jobs.service.ts
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from "../utils/errors.js";
import { PAGINATION } from "../config/constants.js";

interface CreateJobInput {
  title: string;
  description: string;
  salary?: number;
  location: string;
  type: string;
  companyId: string;
}

interface SearchOptions {
  query?: string;
  location?: string;
  type?: string;
  minSalary?: number;
  maxSalary?: number;
  page: number;
  limit: number;
}

export const jobsService = {
  async listJobs(options: { page: number; limit: number }) {
    // TODO: Implement in Database module
    // 1. Query jobs with pagination
    // 2. Include company data
    // 3. Return jobs and pagination info
    throw new Error("Not implemented");
  },

  async searchJobs(options: SearchOptions) {
    // TODO: Implement in Database module
    // 1. Build dynamic query based on filters
    // 2. Full-text search on title/description
    // 3. Filter by location, type, salary range
    // 4. Return jobs and pagination info
    throw new Error("Not implemented");
  },

  async getJobById(id: string) {
    // TODO: Implement in Database module
    // 1. Find job by ID
    // 2. Include company and user data
    // 3. Throw NotFoundError if not found
    throw new Error("Not implemented");
  },

  async createJob(data: CreateJobInput, userId: string) {
    // TODO: Implement in Database module
    // 1. Verify user owns the company
    // 2. Generate slug from title
    // 3. Create job in database
    // 4. Return created job
    throw new Error("Not implemented");
  },

  async updateJob(id: string, data: Partial<CreateJobInput>, userId: string) {
    // TODO: Implement in Database module
    // 1. Find job
    // 2. Verify user is owner
    // 3. Update job
    // 4. Return updated job
    throw new Error("Not implemented");
  },

  async deleteJob(id: string, userId: string) {
    // TODO: Implement in Database module
    // 1. Find job
    // 2. Verify user is owner
    // 3. Delete job (or soft delete)
    throw new Error("Not implemented");
  },
};
```

### services/applications.service.ts

```typescript
// src/services/applications.service.ts
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from "../utils/errors.js";

interface ApplyInput {
  jobId: string;
  userId: string;
  coverLetter?: string;
}

interface StatusUpdateInput {
  status: string;
  feedback?: string;
}

export const applicationsService = {
  async applyToJob(data: ApplyInput) {
    // TODO: Implement in Database module
    // 1. Check if job exists and is open
    // 2. Check if user hasn't already applied
    // 3. Create application
    // 4. Return application
    throw new Error("Not implemented");
  },

  async getUserApplications(
    userId: string,
    options: { page: number; limit: number; status?: string },
  ) {
    // TODO: Implement in Database module
    // 1. Query applications by userId
    // 2. Filter by status if provided
    // 3. Include job and company data
    // 4. Return applications and pagination
    throw new Error("Not implemented");
  },

  async getJobApplications(
    jobId: string,
    userId: string,
    options: { page: number; limit: number; status?: string },
  ) {
    // TODO: Implement in Database module
    // 1. Verify user owns the job's company
    // 2. Query applications for the job
    // 3. Include applicant data
    // 4. Return applications and pagination
    throw new Error("Not implemented");
  },

  async updateApplicationStatus(
    applicationId: string,
    userId: string,
    data: StatusUpdateInput,
  ) {
    // TODO: Implement in Database module
    // 1. Find application
    // 2. Verify user owns the job's company
    // 3. Update status
    // 4. Optionally send notification to applicant
    // 5. Return updated application
    throw new Error("Not implemented");
  },
};
```

### services/users.service.ts

```typescript
// src/services/users.service.ts
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from "../utils/errors.js";

interface UpdateProfileInput {
  name?: string;
  email?: string;
  bio?: string;
  location?: string;
  skills?: string[];
}

export const usersService = {
  async getUserById(id: string) {
    // TODO: Implement in Database module
    // 1. Find user by ID
    // 2. Remove sensitive fields (password)
    // 3. Throw NotFoundError if not found
    throw new Error("Not implemented");
  },

  async updateProfile(userId: string, data: UpdateProfileInput) {
    // TODO: Implement in Database module
    // 1. Validate email if changing
    // 2. Check email uniqueness
    // 3. Update user
    // 4. Return updated user
    throw new Error("Not implemented");
  },

  async uploadResume(userId: string, file: any) {
    // TODO: Implement in File Uploads module
    // 1. Validate file type (PDF, DOC, DOCX)
    // 2. Upload to storage (S3, local, etc.)
    // 3. Update user record with resume URL
    // 4. Return resume info
    throw new Error("Not implemented");
  },

  async getPublicProfile(id: string) {
    // TODO: Implement in Database module
    // 1. Find user by ID
    // 2. Return only public fields
    // 3. Include job seeker data if applicable
    throw new Error("Not implemented");
  },
};
```

### services/companies.service.ts

```typescript
// src/services/companies.service.ts
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from "../utils/errors.js";

interface CreateCompanyInput {
  name: string;
  description: string;
  website?: string;
  location: string;
  size?: string;
  industry?: string;
}

export const companiesService = {
  async listCompanies(options: {
    page: number;
    limit: number;
    search?: string;
  }) {
    // TODO: Implement in Database module
    // 1. Query companies with pagination
    // 2. Search by name if provided
    // 3. Include job count
    // 4. Return companies and pagination
    throw new Error("Not implemented");
  },

  async getCompanyById(id: string) {
    // TODO: Implement in Database module
    // 1. Find company by ID
    // 2. Include owner info and active jobs
    // 3. Throw NotFoundError if not found
    throw new Error("Not implemented");
  },

  async createCompany(data: CreateCompanyInput, userId: string) {
    // TODO: Implement in Database module
    // 1. Generate slug from name
    // 2. Check slug uniqueness
    // 3. Create company
    // 4. Return created company
    throw new Error("Not implemented");
  },

  async updateCompany(
    id: string,
    data: Partial<CreateCompanyInput>,
    userId: string,
  ) {
    // TODO: Implement in Database module
    // 1. Find company
    // 2. Verify user is owner
    // 3. Update company
    // 4. Return updated company
    throw new Error("Not implemented");
  },

  async deleteCompany(id: string, userId: string) {
    // TODO: Implement in Database module
    // 1. Find company
    // 2. Verify user is owner
    // 3. Delete company and associated jobs
    throw new Error("Not implemented");
  },
};
```

### services/admin.service.ts

```typescript
// src/services/admin.service.ts
import { NotFoundError } from "../utils/errors.js";

interface ModifyUserInput {
  role?: string;
  isBanned?: boolean;
  isVerified?: boolean;
}

export const adminService = {
  async getAllUsers(options: {
    page: number;
    limit: number;
    role?: string;
    search?: string;
  }) {
    // TODO: Implement in Database module
    // 1. Query users with pagination
    // 2. Filter by role if provided
    // 3. Search by name/email if provided
    // 4. Return users and pagination
    throw new Error("Not implemented");
  },

  async modifyUser(userId: string, data: ModifyUserInput) {
    // TODO: Implement in Database module
    // 1. Find user
    // 2. Update fields
    // 3. Return updated user
    throw new Error("Not implemented");
  },

  async getStats() {
    // TODO: Implement in Database module
    // 1. Count total users by role
    // 2. Count total jobs (active, closed)
    // 3. Count total applications by status
    // 4. Get recent activity
    // 5. Return stats object
    throw new Error("Not implemented");
  },

  async forceDeleteJob(jobId: string, adminId: string, reason?: string) {
    // TODO: Implement in Database module
    // 1. Find job
    // 2. Log admin action with reason
    // 3. Delete job
    // 4. Optionally notify job owner
    throw new Error("Not implemented");
  },
};
```

---

## Implementation: Middleware Stubs

### middleware/auth.ts

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.split(" ")[1];

    // TODO: Implement in Authentication module
    // 1. Verify JWT token
    // 2. Get user from database
    // 3. Attach user to req.user
    // 4. Call next()

    // Placeholder - remove after implementing
    throw new Error("Authentication not implemented");
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token provided, but doesn't require it
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No token, but that's okay
      return next();
    }

    const token = authHeader.split(" ")[1];

    // TODO: Implement in Authentication module
    // Same as authenticate, but don't throw if token invalid

    next();
  } catch (error) {
    // Silently continue without user
    next();
  }
}

/**
 * Admin role middleware
 * Must be used after authenticate middleware
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new UnauthorizedError("Authentication required"));
  }

  if (req.user.role !== "admin") {
    return next(new ForbiddenError("Admin access required"));
  }

  next();
}

/**
 * Employer role middleware
 * Must be used after authenticate middleware
 */
export function requireEmployer(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return next(new UnauthorizedError("Authentication required"));
  }

  if (req.user.role !== "employer" && req.user.role !== "admin") {
    return next(new ForbiddenError("Employer access required"));
  }

  next();
}
```

---

## Complete File Structure Summary

After implementing everything, your structure should look like:

```
src/
├── config/
│   ├── index.ts
│   ├── env.ts
│   └── constants.ts
│
├── controllers/
│   ├── auth.controller.ts
│   ├── jobs.controller.ts
│   ├── applications.controller.ts
│   ├── users.controller.ts
│   ├── companies.controller.ts
│   └── admin.controller.ts
│
├── db/
│   └── index.ts (placeholder)
│
├── middleware/
│   ├── auth.ts
│   ├── errorHandler.ts
│   ├── notFound.ts
│   └── validate.ts (placeholder)
│
├── routes/
│   ├── index.ts
│   ├── auth.routes.ts
│   ├── jobs.routes.ts
│   ├── applications.routes.ts
│   ├── users.routes.ts
│   ├── companies.routes.ts
│   └── admin.routes.ts
│
├── services/
│   ├── auth.service.ts
│   ├── jobs.service.ts
│   ├── applications.service.ts
│   ├── users.service.ts
│   ├── companies.service.ts
│   └── admin.service.ts
│
├── types/
│   ├── index.ts
│   └── express.d.ts
│
├── utils/
│   ├── errors.ts
│   └── logger.ts
│
├── app.ts
└── server.ts
```

---

## Pro Tips

### 1. Stub Handlers Return 501 Not Implemented

During scaffolding, return 501 to indicate work in progress:

```typescript
res.status(501).json({
  success: false,
  message: "Not implemented yet",
  endpoint: `${req.method} ${req.originalUrl}`,
});
```

### 2. Document Routes with JSDoc

```typescript
/**
 * @route   POST /api/v1/jobs
 * @desc    Create new job listing
 * @access  Private (employer only)
 */
router.post("/", authenticate, jobsController.create);
```

### 3. Validate Route Structure Early

Test all routes respond (even if with 501):

```bash
curl http://localhost:3000/api/v1/health
curl http://localhost:3000/api/v1/auth/login -X POST
curl http://localhost:3000/api/v1/jobs
```

### 4. Use TypeScript to Catch Mistakes

```typescript
// TypeScript catches missing controller methods
import { jobsController } from "../controllers/jobs.controller.js";

router.get("/", jobsController.list); // Error if 'list' doesn't exist
router.get("/:id", jobsController.getById); // Error if 'getById' doesn't exist
```

---

## 5-Minute Debugger: Common Route Structure Mistakes

### Problem: Routes Return 404

**Check order of route definitions:**

```typescript
// ❌ Wrong - /search never matches
router.get("/:id", jobsController.getById);
router.get("/search", jobsController.search);

// ✅ Correct - specific routes first
router.get("/search", jobsController.search);
router.get("/:id", jobsController.getById);
```

### Problem: Middleware Not Running

**Check middleware placement:**

```typescript
// ❌ Wrong - authenticate not called
router.post("/", jobsController.create);
router.use(authenticate);

// ✅ Correct - middleware before routes
router.use(authenticate);
router.post("/", jobsController.create);
```

### Problem: Controller Method Is Undefined

**Check export and import:**

```typescript
// Controller file
export const jobsController = {
  /* methods */
}; // Named export

// Route file
import { jobsController } from "../controllers/jobs.controller.js"; // Named import
```

### Problem: TypeScript Errors on req.user

**Ensure Express types are augmented:**

```typescript
// src/types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}
export {};
```

---

## Key Takeaways

1. **Route files are declarative**—just define paths and wire up controllers
2. **Controllers are thin**—extract data, call service, send response
3. **Services are stubs for now**—implementation comes in later modules
4. **Consistent patterns** make the codebase predictable and maintainable
5. **Test your scaffolding**—ensure all routes respond before moving on

---

## What's Next?

Congratulations! You've built the complete routing foundation for DevJobs Pro. Every route is defined, every controller is wired up, and every service is stubbed.

In the next module, we'll implement **Error Handling**—turning those stub errors into proper, consistent API responses that clients can actually work with.

---

[Next Module: Error Handling →](../07-error-handling/README.md)
