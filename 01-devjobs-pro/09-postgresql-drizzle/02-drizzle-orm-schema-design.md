# Lesson 2: Drizzle ORM & Schema Design

## 🎯 Hook: Type-Safe SQL for TypeScript

Drizzle brings type-safe SQL to TypeScript—**no more query string mistakes**. Unlike traditional ORMs that hide SQL behind magic methods, Drizzle lets you write SQL-like queries with full TypeScript inference. If it compiles, it works.

```typescript
// This query is fully type-checked at compile time
const jobs = await db
  .select({
    title: jobsTable.title,
    company: companiesTable.name,
    salary: jobsTable.salaryMax,
  })
  .from(jobsTable)
  .innerJoin(companiesTable, eq(jobsTable.companyId, companiesTable.id))
  .where(gte(jobsTable.salaryMax, 100000));

// TypeScript knows: jobs is { title: string; company: string; salary: number }[]
```

No runtime surprises. No "column doesn't exist" errors in production.

---

## 📚 Theory: Understanding Drizzle ORM

### What Makes Drizzle Different?

Drizzle ORM is a **TypeScript-first** database toolkit that:

1. **Looks like SQL**: If you know SQL, you know Drizzle
2. **Full type inference**: Schema defines types, queries inherit them
3. **No code generation step**: Types come from your schema directly
4. **SQL-in, SQL-out**: What you write is what runs (predictable queries)

```
Traditional ORM:                    Drizzle:
─────────────────────────────────────────────────────────
User.findAll({                     db.select()
  where: { role: 'admin' },          .from(users)
  include: ['posts'],                .where(eq(users.role, 'admin'))
  order: [['createdAt', 'DESC']]     .orderBy(desc(users.createdAt))
})

→ Generates unpredictable SQL      → SQL matches what you write
→ Types often need manual hints    → Types fully inferred
→ Magic methods hide complexity    → Explicit, readable queries
```

### Drizzle vs Prisma: When to Choose What

| Aspect             | Drizzle                        | Prisma                       |
| ------------------ | ------------------------------ | ---------------------------- |
| **Learning curve** | Steeper (SQL knowledge needed) | Gentler (abstracted)         |
| **Type safety**    | Excellent (from schema)        | Excellent (generated)        |
| **Query style**    | SQL-like, explicit             | Custom DSL, declarative      |
| **Bundle size**    | Tiny (~7kb)                    | Large (~300kb+)              |
| **Performance**    | Direct SQL, minimal overhead   | Rust engine, some overhead   |
| **Migrations**     | SQL files, full control        | Auto-generated, less control |
| **Raw SQL**        | First-class citizen            | Possible but discouraged     |
| **Best for**       | SQL experts, control-seekers   | Rapid development, beginners |

**We're choosing Drizzle because:** We want explicit control, minimal bundle size, and SQL-like syntax that teaches transferable skills.

### Drizzle Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Drizzle ORM Architecture                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Schema Files   │     │   Type System   │     │   Query Builder │
│                 │     │                 │     │                 │
│  db/schema/     │────▶│  Infers types   │────▶│  db.select()    │
│  - users.ts     │     │  automatically  │     │  db.insert()    │
│  - jobs.ts      │     │  from schema    │     │  db.update()    │
│  - etc.         │     │                 │     │  db.delete()    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                       │
         │                      │                       │
         ▼                      ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Drizzle Kit (CLI)                              │
│  • drizzle-kit generate  - Create migration from schema changes             │
│  • drizzle-kit migrate   - Apply migrations to database                     │
│  • drizzle-kit push      - Push schema directly (dev only)                  │
│  • drizzle-kit studio    - Visual database browser                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PostgreSQL Database                               │
│  Tables, indexes, constraints all managed by migrations                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Installing Drizzle

### Step 1: Install Dependencies

```bash
# Core Drizzle packages
npm install drizzle-orm postgres

# Development tools
npm install -D drizzle-kit @types/node

# If using node-postgres instead of postgres.js
# npm install drizzle-orm pg
# npm install -D @types/pg
```

**Package breakdown:**

- `drizzle-orm`: The ORM itself
- `postgres`: PostgreSQL driver (postgres.js - faster than pg)
- `drizzle-kit`: CLI for migrations and schema management

### Step 2: Create Drizzle Config

Create `drizzle.config.ts` in project root:

```typescript
import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  // Where your schema files are
  schema: "./src/db/schema/index.ts",

  // Where to output migrations
  out: "./drizzle/migrations",

  // Database driver
  dialect: "postgresql",

  // Connection config
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  // Verbose logging during migrations
  verbose: true,

  // Strict mode - fail on warnings
  strict: true,
});
```

---

## 📊 Defining Schemas in Drizzle

### Basic Table Definition

```typescript
// src/db/schema/example.ts
import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  // Primary key - auto-incrementing integer
  id: serial("id").primaryKey(),

  // Text columns with constraints
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),

  // Integer with default
  viewCount: integer("view_count").default(0),

  // Boolean with default
  isPublished: boolean("is_published").default(false),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### Drizzle Column Types Reference

```typescript
import {
  // Numeric
  serial, // Auto-increment integer (SERIAL)
  integer, // INTEGER
  smallint, // SMALLINT
  bigint, // BIGINT (returns string in JS)
  real, // REAL (float4)
  doublePrecision, // DOUBLE PRECISION
  numeric, // NUMERIC(precision, scale)

  // Text
  text, // TEXT (unlimited)
  varchar, // VARCHAR(n)
  char, // CHAR(n)

  // Boolean
  boolean, // BOOLEAN

  // Date/Time
  timestamp, // TIMESTAMP
  date, // DATE
  time, // TIME
  interval, // INTERVAL

  // UUID
  uuid, // UUID

  // JSON
  json, // JSON
  jsonb, // JSONB (faster queries)

  // PostgreSQL-specific
  pgEnum, // Custom enum type
} from "drizzle-orm/pg-core";
```

### Custom Enums

```typescript
// Define PostgreSQL enum types
import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "job_seeker",
  "employer",
  "admin",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "draft",
  "open",
  "closed",
  "expired",
]);

export const applicationStatusEnum = pgEnum("application_status", [
  "pending",
  "reviewed",
  "shortlisted",
  "rejected",
  "hired",
]);

export const jobTypeEnum = pgEnum("job_type", [
  "full_time",
  "part_time",
  "contract",
  "internship",
  "remote",
]);
```

### TypeScript Inference

Drizzle automatically infers types from your schema:

```typescript
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "./schema/users";

// Type for SELECT results
type User = InferSelectModel<typeof users>;
// { id: number; email: string; role: 'job_seeker' | 'employer' | 'admin'; ... }

// Type for INSERT data (optional fields for defaults)
type NewUser = InferInsertModel<typeof users>;
// { email: string; passwordHash: string; role?: 'job_seeker' | ... ; ... }
```

---

## 🔗 Relations in Drizzle

Drizzle supports explicit relations for type-safe joins:

```typescript
import { relations } from "drizzle-orm";

// In schema/users.ts
export const usersRelations = relations(users, ({ many, one }) => ({
  // A user can have many applications
  applications: many(applications),

  // An employer user can have many companies
  ownedCompanies: many(companies),
}));

// In schema/companies.ts
export const companiesRelations = relations(companies, ({ one, many }) => ({
  // A company belongs to one employer
  employer: one(users, {
    fields: [companies.employerId],
    references: [users.id],
  }),

  // A company has many jobs
  jobs: many(jobs),
}));

// In schema/jobs.ts
export const jobsRelations = relations(jobs, ({ one, many }) => ({
  // A job belongs to one company
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),

  // A job has many applications
  applications: many(applications),
}));
```

---

## 🎓 Mini-Tutorial: Setting Up Drizzle

### Project Structure

```
devjobs-api/
├── src/
│   ├── db/
│   │   ├── schema/
│   │   │   ├── enums.ts         # Enum definitions
│   │   │   ├── users.ts         # Users table
│   │   │   ├── companies.ts     # Companies table
│   │   │   ├── jobs.ts          # Jobs table
│   │   │   ├── applications.ts  # Applications table
│   │   │   └── index.ts         # Export all schemas
│   │   └── index.ts             # Database connection
│   └── ...
├── drizzle/
│   └── migrations/              # Generated migrations
├── drizzle.config.ts            # Drizzle Kit config
├── package.json
└── .env
```

### Step-by-Step Setup

1. **Create schema directory:**

```bash
mkdir -p src/db/schema
```

2. **Define schemas (we'll do this in Practice section)**

3. **Create database connection:**

```typescript
// src/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// For migrations and one-time scripts
const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });

// For queries (connection pool)
const queryClient = postgres(process.env.DATABASE_URL!);

// Create Drizzle instance with schema
export const db = drizzle(queryClient, { schema });

// Export for migrations
export const migrationDb = drizzle(migrationClient);
```

4. **Add scripts to package.json:**

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## ✏️ Practice: DevJobs Pro Schema

Now let's create the complete schema for DevJobs Pro.

### File 1: `src/db/schema/enums.ts`

```typescript
import { pgEnum } from "drizzle-orm/pg-core";

// User roles determine permissions throughout the system
export const userRoleEnum = pgEnum("user_role", [
  "job_seeker", // Can browse and apply to jobs
  "employer", // Can create companies and post jobs
  "admin", // Full system access
]);

// Job lifecycle status
export const jobStatusEnum = pgEnum("job_status", [
  "draft", // Not visible, still being created
  "open", // Accepting applications
  "closed", // No longer accepting applications
  "expired", // Past deadline
]);

// Application progress tracking
export const applicationStatusEnum = pgEnum("application_status", [
  "pending", // Submitted, awaiting review
  "reviewed", // Employer has seen it
  "shortlisted", // Moved to interview consideration
  "rejected", // Not moving forward
  "hired", // Offer accepted
]);

// Employment type
export const jobTypeEnum = pgEnum("job_type", [
  "full_time",
  "part_time",
  "contract",
  "internship",
  "remote",
]);
```

### File 2: `src/db/schema/users.ts`

```typescript
import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userRoleEnum } from "./enums";
import { companies } from "./companies";
import { applications } from "./applications";

export const users = pgTable("users", {
  // Primary key
  id: serial("id").primaryKey(),

  // Authentication
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),

  // Role determines permissions
  role: userRoleEnum("role").notNull().default("job_seeker"),

  // Profile information
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  phone: varchar("phone", { length: 20 }),

  // Job seeker specific
  resumeUrl: text("resume_url"),
  headline: varchar("headline", { length: 200 }), // "Senior Backend Developer"
  bio: text("bio"),
  location: varchar("location", { length: 100 }),
  linkedinUrl: varchar("linkedin_url", { length: 255 }),
  githubUrl: varchar("github_url", { length: 255 }),
  portfolioUrl: varchar("portfolio_url", { length: 255 }),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  // A user (employer) can own multiple companies
  ownedCompanies: many(companies),

  // A user (job_seeker) can have multiple applications
  applications: many(applications),
}));
```

### File 3: `src/db/schema/companies.ts`

```typescript
import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { jobs } from "./jobs";

export const companies = pgTable("companies", {
  // Primary key
  id: serial("id").primaryKey(),

  // Company information
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  // Branding
  logoUrl: text("logo_url"),
  website: varchar("website", { length: 255 }),

  // Location and size
  location: varchar("location", { length: 255 }),
  size: varchar("size", { length: 50 }), // "1-10", "11-50", "51-200", etc.
  industry: varchar("industry", { length: 100 }),

  // Owner - must be an employer
  employerId: integer("employer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relationships
export const companiesRelations = relations(companies, ({ one, many }) => ({
  // A company is owned by one employer
  employer: one(users, {
    fields: [companies.employerId],
    references: [users.id],
  }),

  // A company can have many job postings
  jobs: many(jobs),
}));
```

### File 4: `src/db/schema/jobs.ts`

```typescript
import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { jobStatusEnum, jobTypeEnum } from "./enums";
import { companies } from "./companies";
import { applications } from "./applications";

export const jobs = pgTable(
  "jobs",
  {
    // Primary key
    id: serial("id").primaryKey(),

    // Job details
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),

    // Requirements and qualifications (flexible JSON structure)
    requirements: jsonb("requirements").$type<{
      skills: string[];
      experience: string;
      education?: string;
      certifications?: string[];
    }>(),

    // Compensation
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    salaryCurrency: varchar("salary_currency", { length: 3 }).default("USD"),

    // Job metadata
    location: varchar("location", { length: 255 }),
    jobType: jobTypeEnum("job_type").notNull().default("full_time"),
    experienceLevel: varchar("experience_level", { length: 50 }), // "Entry", "Mid", "Senior"

    // Status
    status: jobStatusEnum("status").notNull().default("draft"),

    // Parent company
    companyId: integer("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),

    // Deadlines
    applicationDeadline: timestamp("application_deadline"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Indexes for common queries
    companyIdx: index("jobs_company_id_idx").on(table.companyId),
    statusIdx: index("jobs_status_idx").on(table.status),
    locationIdx: index("jobs_location_idx").on(table.location),
  }),
);

// Define relationships
export const jobsRelations = relations(jobs, ({ one, many }) => ({
  // A job belongs to one company
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),

  // A job can have many applications
  applications: many(applications),
}));
```

### File 5: `src/db/schema/applications.ts`

```typescript
import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { applicationStatusEnum } from "./enums";
import { users } from "./users";
import { jobs } from "./jobs";

export const applications = pgTable(
  "applications",
  {
    // Primary key
    id: serial("id").primaryKey(),

    // Who applied
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // What job
    jobId: integer("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),

    // Application content
    coverLetter: text("cover_letter"),
    resumeUrl: text("resume_url"), // Can override user's default resume

    // Status tracking
    status: applicationStatusEnum("status").notNull().default("pending"),

    // Employer notes (internal)
    employerNotes: text("employer_notes"),

    // Timestamps
    appliedAt: timestamp("applied_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Indexes for common queries
    userIdx: index("applications_user_id_idx").on(table.userId),
    jobIdx: index("applications_job_id_idx").on(table.jobId),
    statusIdx: index("applications_status_idx").on(table.status),

    // Prevent duplicate applications
    uniqueApplication: unique("unique_user_job").on(table.userId, table.jobId),
  }),
);

// Define relationships
export const applicationsRelations = relations(applications, ({ one }) => ({
  // An application belongs to one user
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),

  // An application is for one job
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
}));
```

### File 6: `src/db/schema/index.ts`

```typescript
// Export all enums
export * from "./enums";

// Export all tables
export * from "./users";
export * from "./companies";
export * from "./jobs";
export * from "./applications";

// Re-export commonly used types
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "./users";
import { companies } from "./companies";
import { jobs } from "./jobs";
import { applications } from "./applications";

// Select types (what you get from queries)
export type User = InferSelectModel<typeof users>;
export type Company = InferSelectModel<typeof companies>;
export type Job = InferSelectModel<typeof jobs>;
export type Application = InferSelectModel<typeof applications>;

// Insert types (what you provide for inserts)
export type NewUser = InferInsertModel<typeof users>;
export type NewCompany = InferInsertModel<typeof companies>;
export type NewJob = InferInsertModel<typeof jobs>;
export type NewApplication = InferInsertModel<typeof applications>;
```

---

## 💡 Pro Tips

### 1. Use Drizzle's Type Inference—Never Manually Type Results

```typescript
// ❌ Don't manually define types that duplicate schema
interface User {
  id: number;
  email: string;
  // ... maintaining two sources of truth
}

// ✅ Infer from schema - single source of truth
import { type User } from "@/db/schema";
```

### 2. Name Tables and Columns Consistently

```typescript
// ✅ Good: snake_case for database, camelCase for TypeScript
export const users = pgTable("users", {
  userId: integer("user_id"), // DB: user_id, TS: userId
  createdAt: timestamp("created_at"),
});
```

### 3. Always Define Indexes for Foreign Keys

```typescript
// Foreign keys without indexes cause slow joins
companyId: integer('company_id').references(() => companies.id),

// Always add index in table config
}, (table) => ({
  companyIdx: index('jobs_company_id_idx').on(table.companyId),
}));
```

### 4. Use JSONB for Flexible Data

```typescript
// Perfect for data that varies per row
requirements: jsonb('requirements').$type<{
  skills: string[];
  experience: string;
}>(),

// But don't use for data you need to query often
// (JSONB queries are slower than regular columns)
```

### 5. Export Types from Schema Index

```typescript
// src/db/schema/index.ts
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// Now everywhere in your app:
import { type User, type NewUser } from "@/db/schema";
```

---

## 🔧 5-Minute Debugger

### Schema Type Errors

**Error:**

```
Type 'string' is not assignable to type '"job_seeker" | "employer" | "admin"'
```

**Cause:** You're passing a plain string where Drizzle expects an enum value.

**Fix:**

```typescript
// ❌ Wrong
const role = userInput.role; // string
await db.insert(users).values({ role }); // Type error

// ✅ Correct - validate and cast
const validRoles = ["job_seeker", "employer", "admin"] as const;
type UserRole = (typeof validRoles)[number];

function isValidRole(role: string): role is UserRole {
  return validRoles.includes(role as UserRole);
}

if (isValidRole(userInput.role)) {
  await db.insert(users).values({ role: userInput.role });
}
```

### Relation Definition Mistakes

**Error:**

```
Cannot find name 'applications' in relations definition
```

**Cause:** Circular import issues between schema files.

**Fix:**

```typescript
// Import the table directly in relations, not from index
import { applications } from "./applications"; // Direct import

export const usersRelations = relations(users, ({ many }) => ({
  applications: many(applications),
}));
```

### "Column does not exist" After Schema Change

**Cause:** Schema updated but migrations not generated/applied.

**Fix:**

```bash
# Generate migration from schema changes
npm run db:generate

# Apply migration to database
npm run db:migrate
```

### JSONB Type Not Inferring

**Error:**

```
Property 'skills' does not exist on type 'unknown'
```

**Cause:** Missing `.$type<>()` on JSONB column.

**Fix:**

```typescript
// ❌ Without type annotation, JSONB is 'unknown'
requirements: jsonb('requirements'),

// ✅ With type annotation, fully typed
requirements: jsonb('requirements').$type<{
  skills: string[];
  experience: string;
}>(),
```

---

## 📝 Summary

In this lesson, you learned:

1. **What Drizzle ORM Is**
   - Type-safe, SQL-like syntax
   - Schema defines all types
   - Minimal overhead, direct SQL

2. **Setting Up Drizzle**
   - Install drizzle-orm, postgres, drizzle-kit
   - Configure drizzle.config.ts
   - Create schema files

3. **Defining Tables**
   - Column types (serial, varchar, text, integer, etc.)
   - Custom enums with pgEnum
   - Indexes in table config

4. **Defining Relations**
   - one() and many() helpers
   - Foreign key references
   - Type-safe joins

5. **DevJobs Pro Schema**
   - users: Authentication and profiles
   - companies: Employer-owned businesses
   - jobs: Job postings with requirements
   - applications: Job seeker applications

---

## ➡️ Next: Lesson 3

With our schema defined, we need to get it into the database. In the next lesson, we'll learn about **migrations**—how to safely evolve your database schema over time.

[Continue to Lesson 3: Migrations & Relationships →](./03-migrations-relationships.md)
