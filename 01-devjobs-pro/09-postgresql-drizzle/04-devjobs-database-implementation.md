# Lesson 4: DevJobs Pro Database Implementation

## 🎯 Hook: From Schema to Working Database

From schema to working database—**DevJobs Pro data layer complete**. We've designed our schema, set up migrations, and now it's time to build the actual code that interacts with our database. By the end of this lesson, you'll have a fully functional data layer with proper connection pooling, type-safe queries, and production-ready patterns.

---

## 📚 Theory: Database Architecture

### Connection Pooling

Never create a new database connection for each request—that's slow and can exhaust database connections. Instead, use a **connection pool**: a set of pre-established connections that get reused.

```
Without pooling:                  With pooling:
───────────────────────────────────────────────────────────────

Request 1 ──▶ Connect ──▶ Query    Request 1 ──┐
Request 2 ──▶ Connect ──▶ Query    Request 2 ──┼──▶ Pool ──▶ DB
Request 3 ──▶ Connect ──▶ Query    Request 3 ──┘   (reuses
Request 4 ──▶ Connect ──▶ Query    Request 4 ──┐    connections)
    ↓                                          └──▶
Slow! Each connect                 Fast! Connections
takes ~100ms                       already ready
```

### postgres.js Connection Pool

```typescript
import postgres from "postgres";

// Creates a pool of connections (default max: 10)
const sql = postgres(process.env.DATABASE_URL!, {
  max: 20, // Max connections in pool
  idle_timeout: 20, // Close idle connections after 20s
  connect_timeout: 10, // Timeout for new connections
});
```

### Transaction Handling

Transactions ensure multiple operations succeed or fail **together**:

```typescript
// Without transaction: partial failure possible
await db.insert(users).values(userData); // ✓ Success
await db.insert(profiles).values(profile); // ✗ Fails
// User exists without profile! Data inconsistency.

// With transaction: all or nothing
await db.transaction(async (tx) => {
  await tx.insert(users).values(userData);
  await tx.insert(profiles).values(profile);
  // If profile fails, user insert is rolled back
});
```

### Query Patterns Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Common Query Patterns                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│ SELECT                                                                      │
│ ────────────────────────────────────────────────────────────────────────── │
│ • Basic:     db.select().from(table)                                       │
│ • Columns:   db.select({ id, name }).from(table)                           │
│ • Filter:    .where(eq(table.column, value))                               │
│ • Join:      .innerJoin(other, eq(table.fk, other.id))                     │
│ • Sort:      .orderBy(desc(table.createdAt))                               │
│ • Paginate:  .limit(10).offset(20)                                         │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│ INSERT                                                                      │
│ ────────────────────────────────────────────────────────────────────────── │
│ • Single:    db.insert(table).values(data)                                 │
│ • Multiple:  db.insert(table).values([data1, data2])                       │
│ • Return:    .returning()  // Returns inserted rows                        │
│ • Conflict:  .onConflictDoNothing() / .onConflictDoUpdate()                │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│ UPDATE                                                                      │
│ ────────────────────────────────────────────────────────────────────────── │
│ • Basic:     db.update(table).set(changes).where(condition)                │
│ • Return:    .returning()                                                  │
│ ⚠️ Always include .where() to avoid updating ALL rows!                      │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│ DELETE                                                                      │
│ ────────────────────────────────────────────────────────────────────────── │
│ • Basic:     db.delete(table).where(condition)                             │
│ • Return:    .returning()                                                  │
│ ⚠️ Always include .where() to avoid deleting ALL rows!                      │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 DevJobs Pro Database Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   DevJobs Pro Database Architecture                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              API Layer                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Routes    │  │   Routes    │  │   Routes    │  │   Routes    │       │
│  │   /users    │  │   /jobs     │  │ /companies  │  │/applications│       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Service Layer                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ userService │  │ jobService  │  │companyService│ │ appService  │       │
│  │             │  │             │  │             │  │             │       │
│  │ • create    │  │ • create    │  │ • create    │  │ • create    │       │
│  │ • findById  │  │ • getAll    │  │ • getById   │  │ • getByUser │       │
│  │ • findEmail │  │ • search    │  │ • update    │  │ • getByJob  │       │
│  │ • update    │  │ • update    │  │ • delete    │  │ • updateStat│       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Database Layer                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         db/index.ts                                  │   │
│  │  • Connection pool (postgres.js)                                    │   │
│  │  • Drizzle instance with schema                                     │   │
│  │  • Transaction helper                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       PostgreSQL Database                            │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐           │   │
│  │  │  users   │ │companies │ │   jobs   │ │ applications │           │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ✏️ Practice: Complete DevJobs Pro Database Implementation

### File 1: Database Connection (`src/db/index.ts`)

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Validate environment
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Connection pool for queries
// postgres.js automatically manages connection pooling
const queryClient = postgres(process.env.DATABASE_URL, {
  max: 20, // Maximum connections in pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
  prepare: false, // Disable prepared statements for connection pooling services
});

// Create Drizzle instance with full schema for relations
export const db = drizzle(queryClient, {
  schema,
  logger: process.env.NODE_ENV === "development", // Log queries in dev
});

// Export schema for easy access
export * from "./schema";

// Type helper for transactions
export type Transaction = typeof db;

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await queryClient`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  await queryClient.end();
}
```

### File 2: User Service (`src/services/user.service.ts`)

```typescript
import { eq, and, or, ilike } from "drizzle-orm";
import { db, users, type User, type NewUser } from "@/db";
import { NotFoundError, ConflictError } from "@/errors";

// Type for user without sensitive data
export type SafeUser = Omit<User, "passwordHash">;

// Type for user update
export type UpdateUserData = Partial<Omit<NewUser, "email" | "passwordHash">>;

export const userService = {
  /**
   * Create a new user
   * @throws ConflictError if email already exists
   */
  async create(data: NewUser): Promise<SafeUser> {
    // Check if email already exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictError("Email already registered");
    }

    const [user] = await db
      .insert(users)
      .values({
        ...data,
        email: data.email.toLowerCase(),
      })
      .returning();

    return this.sanitize(user);
  },

  /**
   * Find user by ID
   * @throws NotFoundError if user doesn't exist
   */
  async findById(id: number): Promise<SafeUser> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return this.sanitize(user);
  },

  /**
   * Find user by email (includes password for auth)
   * Used internally by auth service
   */
  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    return user || null;
  },

  /**
   * Update user profile
   * @throws NotFoundError if user doesn't exist
   */
  async update(id: number, data: UpdateUserData): Promise<SafeUser> {
    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return this.sanitize(user);
  },

  /**
   * Update user password
   * Used by auth service
   */
  async updatePassword(id: number, passwordHash: string): Promise<void> {
    const result = await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (result.length === 0) {
      throw new NotFoundError("User not found");
    }
  },

  /**
   * Delete user account
   * Cascades to applications, companies, jobs
   */
  async delete(id: number): Promise<void> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (result.length === 0) {
      throw new NotFoundError("User not found");
    }
  },

  /**
   * Search users (admin only)
   */
  async search(params: {
    query?: string;
    role?: User["role"];
    limit?: number;
    offset?: number;
  }): Promise<{ users: SafeUser[]; total: number }> {
    const { query, role, limit = 20, offset = 0 } = params;

    const conditions = [];

    if (query) {
      conditions.push(
        or(
          ilike(users.email, `%${query}%`),
          ilike(users.firstName, `%${query}%`),
          ilike(users.lastName, `%${query}%`),
        ),
      );
    }

    if (role) {
      conditions.push(eq(users.role, role));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(whereClause);

    // Get paginated results
    const results = await db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      users: results.map(this.sanitize),
      total: count,
    };
  },

  /**
   * Remove sensitive data from user object
   */
  sanitize(user: User): SafeUser {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  },
};

// Import at top of file
import { desc, sql } from "drizzle-orm";
```

### File 3: Job Service (`src/services/job.service.ts`)

```typescript
import { eq, and, or, gte, lte, ilike, desc, asc, sql } from "drizzle-orm";
import { db, jobs, companies, type Job, type NewJob, type Company } from "@/db";
import { NotFoundError, ForbiddenError } from "@/errors";

// Job with company info
export type JobWithCompany = Job & {
  company: Pick<Company, "id" | "name" | "logoUrl" | "location">;
};

// Search/filter parameters
export interface JobSearchParams {
  query?: string; // Search in title and description
  location?: string; // Filter by location
  jobType?: Job["jobType"]; // Filter by job type
  salaryMin?: number; // Minimum salary
  salaryMax?: number; // Maximum salary
  companyId?: number; // Jobs from specific company
  status?: Job["status"]; // Filter by status (default: 'open')
  sortBy?: "salary" | "date" | "title";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export const jobService = {
  /**
   * Create a new job posting
   */
  async create(data: NewJob): Promise<Job> {
    const [job] = await db.insert(jobs).values(data).returning();

    return job;
  },

  /**
   * Get job by ID with company info
   */
  async getById(id: number): Promise<JobWithCompany> {
    const result = await db
      .select({
        job: jobs,
        company: {
          id: companies.id,
          name: companies.name,
          logoUrl: companies.logoUrl,
          location: companies.location,
        },
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(jobs.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundError("Job not found");
    }

    return {
      ...result[0].job,
      company: result[0].company,
    };
  },

  /**
   * Search and filter jobs with pagination
   */
  async search(params: JobSearchParams): Promise<{
    jobs: JobWithCompany[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      query,
      location,
      jobType,
      salaryMin,
      salaryMax,
      companyId,
      status = "open",
      sortBy = "date",
      sortOrder = "desc",
      limit = 20,
      offset = 0,
    } = params;

    // Build conditions array
    const conditions = [eq(jobs.status, status)];

    if (query) {
      conditions.push(
        or(
          ilike(jobs.title, `%${query}%`),
          ilike(jobs.description, `%${query}%`),
        )!,
      );
    }

    if (location) {
      conditions.push(ilike(jobs.location, `%${location}%`));
    }

    if (jobType) {
      conditions.push(eq(jobs.jobType, jobType));
    }

    if (salaryMin !== undefined) {
      conditions.push(gte(jobs.salaryMax, salaryMin));
    }

    if (salaryMax !== undefined) {
      conditions.push(lte(jobs.salaryMin, salaryMax));
    }

    if (companyId) {
      conditions.push(eq(jobs.companyId, companyId));
    }

    const whereClause = and(...conditions);

    // Determine sort column
    const sortColumn = {
      salary: jobs.salaryMax,
      date: jobs.createdAt,
      title: jobs.title,
    }[sortBy];

    const orderFn = sortOrder === "asc" ? asc : desc;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(jobs)
      .where(whereClause);

    // Get paginated results with company
    const results = await db
      .select({
        job: jobs,
        company: {
          id: companies.id,
          name: companies.name,
          logoUrl: companies.logoUrl,
          location: companies.location,
        },
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset);

    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(count / limit);

    return {
      jobs: results.map((r) => ({ ...r.job, company: r.company })),
      total: count,
      page,
      totalPages,
    };
  },

  /**
   * Get jobs by company (for employer dashboard)
   */
  async getByCompany(companyId: number): Promise<Job[]> {
    return db
      .select()
      .from(jobs)
      .where(eq(jobs.companyId, companyId))
      .orderBy(desc(jobs.createdAt));
  },

  /**
   * Update a job
   * @param employerId - Used to verify ownership
   */
  async update(
    id: number,
    data: Partial<Omit<NewJob, "companyId">>,
    employerId: number,
  ): Promise<Job> {
    // Verify ownership through company
    const [existingJob] = await db
      .select({
        jobId: jobs.id,
        employerId: companies.employerId,
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(jobs.id, id))
      .limit(1);

    if (!existingJob) {
      throw new NotFoundError("Job not found");
    }

    if (existingJob.employerId !== employerId) {
      throw new ForbiddenError("Not authorized to update this job");
    }

    const [updated] = await db
      .update(jobs)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, id))
      .returning();

    return updated;
  },

  /**
   * Delete a job
   * @param employerId - Used to verify ownership
   */
  async delete(id: number, employerId: number): Promise<void> {
    // Verify ownership
    const [existingJob] = await db
      .select({
        jobId: jobs.id,
        employerId: companies.employerId,
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(jobs.id, id))
      .limit(1);

    if (!existingJob) {
      throw new NotFoundError("Job not found");
    }

    if (existingJob.employerId !== employerId) {
      throw new ForbiddenError("Not authorized to delete this job");
    }

    await db.delete(jobs).where(eq(jobs.id, id));
  },

  /**
   * Change job status
   */
  async updateStatus(
    id: number,
    status: Job["status"],
    employerId: number,
  ): Promise<Job> {
    return this.update(id, { status }, employerId);
  },

  /**
   * Increment view count
   */
  async incrementViews(id: number): Promise<void> {
    await db
      .update(jobs)
      .set({
        viewCount: sql`${jobs.viewCount} + 1`,
      })
      .where(eq(jobs.id, id));
  },
};
```

### File 4: Application Service (`src/services/application.service.ts`)

```typescript
import { eq, and, desc, sql } from "drizzle-orm";
import {
  db,
  applications,
  jobs,
  companies,
  users,
  type Application,
  type NewApplication,
} from "@/db";
import { NotFoundError, ForbiddenError, ConflictError } from "@/errors";

// Application with related data
export type ApplicationWithDetails = Application & {
  job: {
    id: number;
    title: string;
    company: {
      id: number;
      name: string;
    };
  };
  user: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
};

export const applicationService = {
  /**
   * Create a new application
   * @throws ConflictError if user already applied
   */
  async create(data: Omit<NewApplication, "status">): Promise<Application> {
    // Check if already applied
    const [existing] = await db
      .select({ id: applications.id })
      .from(applications)
      .where(
        and(
          eq(applications.userId, data.userId),
          eq(applications.jobId, data.jobId),
        ),
      )
      .limit(1);

    if (existing) {
      throw new ConflictError("You have already applied to this job");
    }

    // Verify job exists and is open
    const [job] = await db
      .select({ status: jobs.status })
      .from(jobs)
      .where(eq(jobs.id, data.jobId))
      .limit(1);

    if (!job) {
      throw new NotFoundError("Job not found");
    }

    if (job.status !== "open") {
      throw new ConflictError("This job is no longer accepting applications");
    }

    const [application] = await db
      .insert(applications)
      .values({
        ...data,
        status: "pending",
      })
      .returning();

    return application;
  },

  /**
   * Get application by ID with full details
   */
  async getById(id: number): Promise<ApplicationWithDetails> {
    const result = await db
      .select({
        application: applications,
        job: {
          id: jobs.id,
          title: jobs.title,
        },
        company: {
          id: companies.id,
          name: companies.name,
        },
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .innerJoin(users, eq(applications.userId, users.id))
      .where(eq(applications.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundError("Application not found");
    }

    const { application, job, company, user } = result[0];
    return {
      ...application,
      job: { ...job, company },
      user,
    };
  },

  /**
   * Get applications by user (job seeker's applications)
   */
  async getByUser(
    userId: number,
    params: { limit?: number; offset?: number } = {},
  ): Promise<{ applications: ApplicationWithDetails[]; total: number }> {
    const { limit = 20, offset = 0 } = params;

    // Get count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(applications)
      .where(eq(applications.userId, userId));

    // Get applications with details
    const results = await db
      .select({
        application: applications,
        job: {
          id: jobs.id,
          title: jobs.title,
        },
        company: {
          id: companies.id,
          name: companies.name,
        },
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .innerJoin(users, eq(applications.userId, users.id))
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.appliedAt))
      .limit(limit)
      .offset(offset);

    return {
      applications: results.map(({ application, job, company, user }) => ({
        ...application,
        job: { ...job, company },
        user,
      })),
      total: count,
    };
  },

  /**
   * Get applications for a job (employer reviewing applicants)
   */
  async getByJob(
    jobId: number,
    employerId: number,
    params: {
      status?: Application["status"];
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<{ applications: ApplicationWithDetails[]; total: number }> {
    const { status, limit = 50, offset = 0 } = params;

    // Verify employer owns the job's company
    const [jobData] = await db
      .select({ employerId: companies.employerId })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!jobData) {
      throw new NotFoundError("Job not found");
    }

    if (jobData.employerId !== employerId) {
      throw new ForbiddenError("Not authorized to view these applications");
    }

    // Build conditions
    const conditions = [eq(applications.jobId, jobId)];
    if (status) {
      conditions.push(eq(applications.status, status));
    }

    // Get count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(applications)
      .where(and(...conditions));

    // Get applications
    const results = await db
      .select({
        application: applications,
        job: {
          id: jobs.id,
          title: jobs.title,
        },
        company: {
          id: companies.id,
          name: companies.name,
        },
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .innerJoin(users, eq(applications.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(applications.appliedAt))
      .limit(limit)
      .offset(offset);

    return {
      applications: results.map(({ application, job, company, user }) => ({
        ...application,
        job: { ...job, company },
        user,
      })),
      total: count,
    };
  },

  /**
   * Update application status (employer action)
   */
  async updateStatus(
    id: number,
    status: Application["status"],
    employerId: number,
    notes?: string,
  ): Promise<Application> {
    // Verify employer owns the job's company
    const [appData] = await db
      .select({
        applicationId: applications.id,
        employerId: companies.employerId,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(applications.id, id))
      .limit(1);

    if (!appData) {
      throw new NotFoundError("Application not found");
    }

    if (appData.employerId !== employerId) {
      throw new ForbiddenError("Not authorized to update this application");
    }

    const [updated] = await db
      .update(applications)
      .set({
        status,
        employerNotes: notes,
        updatedAt: new Date(),
      })
      .where(eq(applications.id, id))
      .returning();

    return updated;
  },

  /**
   * Withdraw application (job seeker action)
   */
  async withdraw(id: number, userId: number): Promise<void> {
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, id))
      .limit(1);

    if (!application) {
      throw new NotFoundError("Application not found");
    }

    if (application.userId !== userId) {
      throw new ForbiddenError("Not authorized to withdraw this application");
    }

    await db.delete(applications).where(eq(applications.id, id));
  },
};
```

### File 5: Company Service (`src/services/company.service.ts`)

```typescript
import { eq, ilike, desc, sql, and } from "drizzle-orm";
import {
  db,
  companies,
  jobs,
  users,
  type Company,
  type NewCompany,
} from "@/db";
import { NotFoundError, ForbiddenError } from "@/errors";

// Company with job count
export type CompanyWithStats = Company & {
  openJobCount: number;
};

export const companyService = {
  /**
   * Create a new company
   */
  async create(data: NewCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(data).returning();

    return company;
  },

  /**
   * Get company by ID with stats
   */
  async getById(id: number): Promise<CompanyWithStats> {
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, id))
      .limit(1);

    if (!company) {
      throw new NotFoundError("Company not found");
    }

    // Get open job count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(jobs)
      .where(and(eq(jobs.companyId, id), eq(jobs.status, "open")));

    return {
      ...company,
      openJobCount: count,
    };
  },

  /**
   * Get companies by employer
   */
  async getByEmployer(employerId: number): Promise<CompanyWithStats[]> {
    const companiesList = await db
      .select()
      .from(companies)
      .where(eq(companies.employerId, employerId))
      .orderBy(desc(companies.createdAt));

    // Get job counts for all companies
    const jobCounts = await db
      .select({
        companyId: jobs.companyId,
        count: sql<number>`count(*)::int`,
      })
      .from(jobs)
      .where(eq(jobs.status, "open"))
      .groupBy(jobs.companyId);

    const countMap = new Map(jobCounts.map((jc) => [jc.companyId, jc.count]));

    return companiesList.map((company) => ({
      ...company,
      openJobCount: countMap.get(company.id) || 0,
    }));
  },

  /**
   * Update company
   */
  async update(
    id: number,
    data: Partial<Omit<NewCompany, "employerId">>,
    employerId: number,
  ): Promise<Company> {
    // Verify ownership
    const [existing] = await db
      .select({ employerId: companies.employerId })
      .from(companies)
      .where(eq(companies.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundError("Company not found");
    }

    if (existing.employerId !== employerId) {
      throw new ForbiddenError("Not authorized to update this company");
    }

    const [updated] = await db
      .update(companies)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, id))
      .returning();

    return updated;
  },

  /**
   * Delete company (cascades to jobs and applications)
   */
  async delete(id: number, employerId: number): Promise<void> {
    // Verify ownership
    const [existing] = await db
      .select({ employerId: companies.employerId })
      .from(companies)
      .where(eq(companies.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundError("Company not found");
    }

    if (existing.employerId !== employerId) {
      throw new ForbiddenError("Not authorized to delete this company");
    }

    await db.delete(companies).where(eq(companies.id, id));
  },

  /**
   * Search companies
   */
  async search(params: {
    query?: string;
    industry?: string;
    location?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ companies: CompanyWithStats[]; total: number }> {
    const { query, industry, location, limit = 20, offset = 0 } = params;

    const conditions = [];

    if (query) {
      conditions.push(ilike(companies.name, `%${query}%`));
    }

    if (industry) {
      conditions.push(eq(companies.industry, industry));
    }

    if (location) {
      conditions.push(ilike(companies.location, `%${location}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(companies)
      .where(whereClause);

    // Get companies
    const companiesList = await db
      .select()
      .from(companies)
      .where(whereClause)
      .orderBy(companies.name)
      .limit(limit)
      .offset(offset);

    // Get job counts
    const companyIds = companiesList.map((c) => c.id);
    const jobCounts =
      companyIds.length > 0
        ? await db
            .select({
              companyId: jobs.companyId,
              count: sql<number>`count(*)::int`,
            })
            .from(jobs)
            .where(
              and(
                sql`${jobs.companyId} = ANY(${companyIds})`,
                eq(jobs.status, "open"),
              ),
            )
            .groupBy(jobs.companyId)
        : [];

    const countMap = new Map(jobCounts.map((jc) => [jc.companyId, jc.count]));

    return {
      companies: companiesList.map((company) => ({
        ...company,
        openJobCount: countMap.get(company.id) || 0,
      })),
      total: count,
    };
  },
};
```

### File 6: Transaction Example (`src/services/example-transactions.ts`)

```typescript
import {
  db,
  users,
  companies,
  jobs,
  type NewUser,
  type NewCompany,
  type NewJob,
} from "@/db";

/**
 * Example: Create employer with company and initial job posting
 * All three must succeed or none are created
 */
export async function createEmployerWithCompanyAndJob(
  userData: NewUser,
  companyData: Omit<NewCompany, "employerId">,
  jobData: Omit<NewJob, "companyId">,
) {
  return db.transaction(async (tx) => {
    // 1. Create the user
    const [user] = await tx
      .insert(users)
      .values({
        ...userData,
        role: "employer",
      })
      .returning();

    // 2. Create the company, linked to user
    const [company] = await tx
      .insert(companies)
      .values({
        ...companyData,
        employerId: user.id,
      })
      .returning();

    // 3. Create the job, linked to company
    const [job] = await tx
      .insert(jobs)
      .values({
        ...jobData,
        companyId: company.id,
        status: "draft", // Start as draft
      })
      .returning();

    // If any step fails, all are rolled back
    return { user, company, job };
  });
}

/**
 * Example: Bulk update job statuses (e.g., close all expired jobs)
 */
export async function closeExpiredJobs() {
  const now = new Date();

  return db.transaction(async (tx) => {
    // Get jobs to close
    const expiredJobs = await tx
      .select({ id: jobs.id })
      .from(jobs)
      .where(and(eq(jobs.status, "open"), lt(jobs.applicationDeadline, now)));

    // Update all in single query
    const updated = await tx
      .update(jobs)
      .set({
        status: "expired",
        updatedAt: now,
      })
      .where(and(eq(jobs.status, "open"), lt(jobs.applicationDeadline, now)))
      .returning({ id: jobs.id });

    console.log(`Closed ${updated.length} expired jobs`);
    return updated;
  });
}

import { eq, and, lt } from "drizzle-orm";
```

---

## 💡 Pro Tips

### 1. Use Transactions for Related Operations

```typescript
// ❌ Without transaction: partial failure possible
await db.insert(users).values(userData);
await db.insert(companies).values({ ...companyData, employerId: user.id });
// If second insert fails, we have orphaned user

// ✅ With transaction: atomic operation
await db.transaction(async (tx) => {
  const [user] = await tx.insert(users).values(userData).returning();
  await tx.insert(companies).values({ ...companyData, employerId: user.id });
});
```

### 2. Project Only Needed Columns

```typescript
// ❌ Selecting everything when you need little
const users = await db.select().from(users); // Gets all columns

// ✅ Select only what you need
const users = await db
  .select({
    id: users.id,
    email: users.email,
  })
  .from(users);
```

### 3. Use Indexes for Filtered Queries

If you find a query is slow, check if you have an index on the filtered column:

```typescript
// This query benefits from an index on `status`
.where(eq(jobs.status, 'open'))

// Add in schema if missing:
}, (table) => ({
  statusIdx: index('jobs_status_idx').on(table.status),
}));
```

### 4. Handle Concurrent Updates with Transactions

```typescript
// ❌ Race condition possible
const job = await getJob(id);
await updateJob(id, { viewCount: job.viewCount + 1 });

// ✅ Atomic increment
await db
  .update(jobs)
  .set({ viewCount: sql`${jobs.viewCount} + 1` })
  .where(eq(jobs.id, id));
```

### 5. Always Validate Before Database Operations

```typescript
// Validate in service layer before hitting database
async create(data: NewJob): Promise<Job> {
  // Business logic validation
  if (data.salaryMin && data.salaryMax && data.salaryMin > data.salaryMax) {
    throw new ValidationError('Minimum salary cannot exceed maximum');
  }

  // Then insert
  return db.insert(jobs).values(data).returning();
}
```

---

## 🔧 5-Minute Debugger

### Type Narrowing Issues

**Error:**

```
Type 'JobWithCompany | undefined' is not assignable to type 'JobWithCompany'
```

**Fix:**

```typescript
// Check for undefined explicitly
const result = await db.select()...limit(1);
const [item] = result;

if (!item) {
  throw new NotFoundError('Not found');
}

// Now TypeScript knows item is defined
return item;
```

### Transaction Rollback Problems

**Symptom:** Data partially saved despite error in transaction.

**Cause:** Error thrown outside transaction scope.

**Fix:**

```typescript
// ❌ Error thrown after transaction
const result = await db.transaction(async (tx) => {
  await tx.insert(users).values(data);
  return tx.insert(companies).values(companyData);
});
validate(result); // Error here doesn't rollback!

// ✅ All logic inside transaction
const result = await db.transaction(async (tx) => {
  const user = await tx.insert(users).values(data).returning();
  const company = await tx.insert(companies).values(companyData).returning();

  // Validation inside transaction - error causes rollback
  if (!isValid(company)) {
    throw new Error("Validation failed");
  }

  return { user, company };
});
```

### "Maximum connections exceeded"

**Cause:** Connection pool exhausted.

**Fix:**

```typescript
// Increase pool size
const queryClient = postgres(DATABASE_URL, {
  max: 30, // Increase from default 10
});

// Also check for connection leaks - always await queries
// ❌ Leaks connection
db.select().from(users); // Missing await!

// ✅ Proper usage
await db.select().from(users);
```

### Query Returns Empty Array Instead of Error

**Expected:** NotFoundError when record doesn't exist.
**Got:** Empty array.

**Fix:**

```typescript
// Drizzle doesn't throw on empty results - check manually
const results = await db.select().from(users).where(eq(users.id, id));

// ❌ results is [] not undefined
if (!results) { ... } // Never true

// ✅ Check array length
if (results.length === 0) {
  throw new NotFoundError('User not found');
}
const [user] = results;
```

---

## 📝 Summary

In this lesson, you implemented:

1. **Database Connection Layer**
   - Connection pooling with postgres.js
   - Drizzle instance with schema
   - Health check and graceful shutdown

2. **User Service**
   - CRUD operations
   - Password handling (separate from profile)
   - Search with pagination

3. **Job Service**
   - Create, read, update, delete
   - Search with multiple filters
   - Ownership verification

4. **Application Service**
   - Apply to jobs (with duplicate prevention)
   - Get applications by user/job
   - Status management

5. **Company Service**
   - CRUD with ownership checks
   - Search with stats

6. **Query Patterns**
   - SELECT with joins
   - INSERT with returning
   - Pagination
   - Transactions

---

## 🎉 Module Complete!

Congratulations! You've built a complete, production-ready database layer for DevJobs Pro:

- ✅ PostgreSQL set up with Docker
- ✅ Drizzle ORM with full TypeScript types
- ✅ Schema for users, companies, jobs, applications
- ✅ Migrations and seed data
- ✅ Service layer with all CRUD operations
- ✅ Transaction handling
- ✅ Authorization checks

---

## ➡️ Next: Module 10

With our database layer complete, we need to ensure data integrity at the API level. In the next module, we'll implement **Validation & Security**—ensuring users can only submit valid data and access what they're authorized to see.

[Continue to Module 10: Validation & Security →](../10-validation-security/01-input-validation-zod.md)
