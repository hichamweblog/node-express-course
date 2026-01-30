# Lesson 3: Migrations & Relationships

## 🎯 Hook: Schema Changes Without Data Loss

Schema changes without losing data—**migrations are essential**. In production, you can't just drop tables and recreate them. You need to carefully evolve your database schema while preserving existing data, maintaining referential integrity, and coordinating changes across your team.

Drizzle Kit makes this manageable with SQL migrations you can review, modify, and version control.

---

## 📚 Theory: Understanding Database Migrations

### What Are Migrations?

A migration is a **versioned change** to your database schema. Think of it like Git for your database structure:

- Each migration is a file containing SQL commands
- Migrations are applied in order (timestamped)
- They track what's been applied in a metadata table
- They're reversible (in theory—be careful!)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Migration History                                    │
└─────────────────────────────────────────────────────────────────────────────┘

drizzle/migrations/
├── 0000_initial_schema.sql          # Creates tables, enums
├── 0001_add_user_phone.sql          # Adds phone column to users
├── 0002_add_jobs_indexes.sql        # Adds indexes for performance
└── 0003_add_company_industry.sql    # Adds industry column

Database: _drizzle_migrations table
┌─────────────┬─────────────────────────────┬──────────────────────┐
│     id      │            hash             │      created_at      │
├─────────────┼─────────────────────────────┼──────────────────────┤
│     1       │ 8f3a...                     │ 2026-01-15 10:00:00  │
│     2       │ 2b4c...                     │ 2026-01-18 14:30:00  │
│     3       │ 9d1e...                     │ 2026-01-20 09:15:00  │
│     4       │ 1a2b...                     │ 2026-01-25 11:45:00  │
└─────────────┴─────────────────────────────┴──────────────────────┘
```

### Why Not Just "Push" Schema Changes?

```bash
# drizzle-kit push - applies schema directly without migration files
npm run db:push  # ⚠️ Good for prototyping, DANGEROUS for production
```

**Push vs Migrate:**

| Aspect            | Push          | Migrate                |
| ----------------- | ------------- | ---------------------- |
| Speed             | Instant       | Requires generate step |
| Reversible        | No            | Can write rollback SQL |
| Team coordination | Problematic   | Version controlled     |
| Production use    | Never         | Always                 |
| Data preservation | May drop data | Carefully managed      |

### Drizzle Kit Commands

| Command                | Purpose                              | When to Use                  |
| ---------------------- | ------------------------------------ | ---------------------------- |
| `drizzle-kit generate` | Create migration from schema changes | After modifying schema files |
| `drizzle-kit migrate`  | Apply pending migrations             | Deploying to any environment |
| `drizzle-kit push`     | Apply schema directly                | Local development only       |
| `drizzle-kit studio`   | Visual database browser              | Debugging, data inspection   |
| `drizzle-kit check`    | Validate schema without generating   | CI/CD checks                 |

### Migration Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Standard Migration Workflow                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│  1. DEVELOP    │───▶│  2. GENERATE   │───▶│  3. REVIEW     │
│                │    │                │    │                │
│ Edit schema    │    │ drizzle-kit    │    │ Check SQL      │
│ files in       │    │ generate       │    │ migration      │
│ src/db/schema/ │    │                │    │ is correct     │
└────────────────┘    └────────────────┘    └────────────────┘
                                                    │
                                                    ▼
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│  6. DEPLOY     │◀───│  5. COMMIT     │◀───│  4. TEST       │
│                │    │                │    │                │
│ Run migrate    │    │ Git add        │    │ Apply to       │
│ in production  │    │ migration      │    │ local/test DB  │
│                │    │ files          │    │                │
└────────────────┘    └────────────────┘    └────────────────┘

NEVER skip step 3 (Review)! Always read the generated SQL.
```

---

## 🔗 Handling Relationship Constraints

### Foreign Key Actions

When you delete a parent record, what happens to its children?

```typescript
// src/db/schema/applications.ts
userId: integer('user_id')
  .notNull()
  .references(() => users.id, {
    onDelete: 'cascade',  // When user deleted, delete their applications
    onUpdate: 'cascade',  // When user.id changes, update applications.user_id
  }),
```

| Action        | Behavior                         | Use Case                                    |
| ------------- | -------------------------------- | ------------------------------------------- |
| `cascade`     | Delete/update children too       | Applications when user deleted              |
| `restrict`    | Block deletion if children exist | Prevent deleting company with active jobs   |
| `set null`    | Set foreign key to NULL          | Keep applications but remove user reference |
| `set default` | Set to default value             | Reassign to default account                 |
| `no action`   | Same as restrict (default)       | Enforce referential integrity               |

### DevJobs Pro Constraints

```typescript
// companies.ts - If employer deleted, delete their companies
employerId: integer('employer_id')
  .notNull()
  .references(() => users.id, { onDelete: 'cascade' }),

// jobs.ts - If company deleted, delete their jobs
companyId: integer('company_id')
  .notNull()
  .references(() => companies.id, { onDelete: 'cascade' }),

// applications.ts - If user or job deleted, delete applications
userId: integer('user_id')
  .notNull()
  .references(() => users.id, { onDelete: 'cascade' }),

jobId: integer('job_id')
  .notNull()
  .references(() => jobs.id, { onDelete: 'cascade' }),
```

### Many-to-Many Relationships

For many-to-many, you need a **junction table** (also called join table or pivot table).

Example: Users can save (bookmark) many jobs, jobs can be saved by many users.

```typescript
// src/db/schema/saved-jobs.ts
export const savedJobs = pgTable(
  "saved_jobs",
  {
    id: serial("id").primaryKey(),

    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    jobId: integer("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),

    savedAt: timestamp("saved_at").defaultNow().notNull(),
  },
  (table) => ({
    // Composite unique constraint - user can only save a job once
    uniqueSave: unique("unique_saved_job").on(table.userId, table.jobId),

    // Indexes for queries
    userIdx: index("saved_jobs_user_id_idx").on(table.userId),
    jobIdx: index("saved_jobs_job_id_idx").on(table.jobId),
  }),
);

// Relations
export const savedJobsRelations = relations(savedJobs, ({ one }) => ({
  user: one(users, {
    fields: [savedJobs.userId],
    references: [users.id],
  }),
  job: one(jobs, {
    fields: [savedJobs.jobId],
    references: [jobs.id],
  }),
}));
```

```
Many-to-Many Visualization:

┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   users     │     │   saved_jobs    │     │    jobs     │
├─────────────┤     ├─────────────────┤     ├─────────────┤
│ PK id       │◀────│ FK user_id      │     │ PK id       │
│    email    │     │ FK job_id       │────▶│    title    │
│    ...      │     │    saved_at     │     │    ...      │
└─────────────┘     └─────────────────┘     └─────────────┘

User 1 saves Job A, Job B
User 2 saves Job A, Job C
User 3 saves Job A, Job B, Job C

saved_jobs:
┌────┬─────────┬────────┐
│ id │ user_id │ job_id │
├────┼─────────┼────────┤
│ 1  │    1    │   A    │
│ 2  │    1    │   B    │
│ 3  │    2    │   A    │
│ 4  │    2    │   C    │
│ 5  │    3    │   A    │
│ 6  │    3    │   B    │
│ 7  │    3    │   C    │
└────┴─────────┴────────┘
```

---

## 📊 Indexes for Performance

### When to Add Indexes

Add indexes for columns you:

- **Filter by** (WHERE clauses)
- **Join on** (foreign keys)
- **Sort by** (ORDER BY)
- **Search** (text search)

```typescript
// jobs.ts - Common query patterns dictate indexes
}, (table) => ({
  // Filter: WHERE company_id = ?
  companyIdx: index('jobs_company_id_idx').on(table.companyId),

  // Filter: WHERE status = 'open'
  statusIdx: index('jobs_status_idx').on(table.status),

  // Filter: WHERE location = ?
  locationIdx: index('jobs_location_idx').on(table.location),

  // Sort: ORDER BY created_at DESC
  createdAtIdx: index('jobs_created_at_idx').on(table.createdAt),

  // Composite: WHERE status = 'open' AND location = ?
  statusLocationIdx: index('jobs_status_location_idx')
    .on(table.status, table.location),
}));
```

### Index Types in Drizzle

```typescript
import { index, uniqueIndex } from 'drizzle-orm/pg-core';

// Standard B-tree index (default)
emailIdx: index('users_email_idx').on(table.email),

// Unique index (also enforces uniqueness)
emailUniqueIdx: uniqueIndex('users_email_unique_idx').on(table.email),

// Composite index (multi-column)
compositIdx: index('jobs_company_status_idx')
  .on(table.companyId, table.status),
```

### Index Trade-offs

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Index Trade-offs                                    │
└─────────────────────────────────────────────────────────────────────────────┘

MORE INDEXES                           FEWER INDEXES
─────────────────────────────────────────────────────────────────────
✅ Faster reads (SELECT)               ✅ Faster writes (INSERT/UPDATE)
✅ Faster filters and sorts            ✅ Less storage space
❌ Slower writes                       ❌ Slower queries on filtered columns
❌ More storage space                  ❌ Full table scans for filters

Rule of thumb: Index columns you query often, not every column.
```

---

## 🎓 Mini-Tutorial: Creating and Applying Migrations

### Step 1: Generate Initial Migration

After creating your schema files, generate the first migration:

```bash
# Generate migration from schema
npm run db:generate

# Output:
# drizzle-kit: v0.20.0
# 1 tables
# Created 0000_initial_schema.sql
```

### Step 2: Review the Generated SQL

Always review migrations before applying!

```sql
-- drizzle/migrations/0000_initial_schema.sql

-- Enums
CREATE TYPE "user_role" AS ENUM('job_seeker', 'employer', 'admin');
CREATE TYPE "job_status" AS ENUM('draft', 'open', 'closed', 'expired');
CREATE TYPE "application_status" AS ENUM('pending', 'reviewed', 'shortlisted', 'rejected', 'hired');
CREATE TYPE "job_type" AS ENUM('full_time', 'part_time', 'contract', 'internship', 'remote');

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password_hash" VARCHAR(255) NOT NULL,
  "role" "user_role" DEFAULT 'job_seeker' NOT NULL,
  "first_name" VARCHAR(100),
  "last_name" VARCHAR(100),
  -- ... more columns
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Companies table with foreign key
CREATE TABLE IF NOT EXISTS "companies" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  -- ... more columns
  "employer_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS "jobs_company_id_idx" ON "jobs"("company_id");
-- ... more indexes
```

### Step 3: Apply Migration

```bash
# Apply migration to database
npm run db:migrate

# Output:
# Applying migration: 0000_initial_schema.sql
# Migration completed successfully!
```

### Step 4: Making Schema Changes

Let's add a new column to track job views:

```typescript
// jobs.ts - Add viewCount column
viewCount: integer('view_count').default(0).notNull(),
```

Generate new migration:

```bash
npm run db:generate

# Output:
# Created 0001_add_job_view_count.sql
```

Review the new migration:

```sql
-- drizzle/migrations/0001_add_job_view_count.sql
ALTER TABLE "jobs" ADD COLUMN "view_count" INTEGER DEFAULT 0 NOT NULL;
```

Apply it:

```bash
npm run db:migrate
```

---

## ✏️ Practice: DevJobs Pro Migrations

### Task 1: Run Initial Migration

```bash
# Make sure PostgreSQL is running
npm run db:start

# Generate migrations from schema
npm run db:generate

# Review the generated SQL
cat drizzle/migrations/0000_*.sql

# Apply migration
npm run db:migrate

# Verify with studio
npm run db:studio
```

### Task 2: Add Performance Indexes Migration

After initial tables are created, add more indexes based on expected query patterns:

```typescript
// Update jobs.ts table config
}, (table) => ({
  // Existing indexes...
  companyIdx: index('jobs_company_id_idx').on(table.companyId),
  statusIdx: index('jobs_status_idx').on(table.status),

  // New indexes for search and filter
  locationIdx: index('jobs_location_idx').on(table.location),
  createdAtIdx: index('jobs_created_at_idx').on(table.createdAt),
  salaryIdx: index('jobs_salary_idx').on(table.salaryMin, table.salaryMax),

  // Composite for common filter: open jobs by location
  openJobsLocationIdx: index('jobs_open_location_idx')
    .on(table.status, table.location)
    .where(sql`status = 'open'`), // Partial index
}));
```

Generate and apply:

```bash
npm run db:generate  # Creates 0001_add_job_indexes.sql
npm run db:migrate
```

### Task 3: Create Package.json Scripts

Update `package.json` with all database scripts:

```json
{
  "scripts": {
    "db:start": "docker-compose up -d postgres",
    "db:stop": "docker-compose down",
    "db:restart": "docker-compose restart postgres",
    "db:logs": "docker-compose logs -f postgres",
    "db:shell": "docker exec -it devjobs-postgres psql -U devjobs -d devjobs_dev",

    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:check": "drizzle-kit check",

    "db:reset": "docker-compose down -v && docker-compose up -d postgres && sleep 3 && npm run db:migrate",
    "db:seed": "tsx src/db/seed.ts"
  }
}
```

### Task 4: Create Seed Script

Create `src/db/seed.ts`:

```typescript
import { db } from "./index";
import { users, companies, jobs, applications } from "./schema";
import { hash } from "bcrypt";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data (order matters due to foreign keys)
  await db.delete(applications);
  await db.delete(jobs);
  await db.delete(companies);
  await db.delete(users);

  console.log("📝 Creating users...");

  // Create admin user
  const adminPassword = await hash("admin123", 10);
  const [admin] = await db
    .insert(users)
    .values({
      email: "admin@devjobs.com",
      passwordHash: adminPassword,
      role: "admin",
      firstName: "Admin",
      lastName: "User",
    })
    .returning();

  // Create employer users
  const employerPassword = await hash("employer123", 10);
  const [employer1] = await db
    .insert(users)
    .values({
      email: "hr@techcorp.com",
      passwordHash: employerPassword,
      role: "employer",
      firstName: "Sarah",
      lastName: "Johnson",
    })
    .returning();

  const [employer2] = await db
    .insert(users)
    .values({
      email: "recruiting@startup.io",
      passwordHash: employerPassword,
      role: "employer",
      firstName: "Mike",
      lastName: "Chen",
    })
    .returning();

  // Create job seeker users
  const seekerPassword = await hash("seeker123", 10);
  const [seeker1] = await db
    .insert(users)
    .values({
      email: "alice@email.com",
      passwordHash: seekerPassword,
      role: "job_seeker",
      firstName: "Alice",
      lastName: "Smith",
      headline: "Senior Backend Developer",
      location: "San Francisco, CA",
    })
    .returning();

  const [seeker2] = await db
    .insert(users)
    .values({
      email: "bob@email.com",
      passwordHash: seekerPassword,
      role: "job_seeker",
      firstName: "Bob",
      lastName: "Williams",
      headline: "Full Stack Engineer",
      location: "New York, NY",
    })
    .returning();

  console.log("🏢 Creating companies...");

  const [techCorp] = await db
    .insert(companies)
    .values({
      name: "TechCorp",
      description: "Leading technology solutions provider",
      website: "https://techcorp.example.com",
      location: "San Francisco, CA",
      size: "201-500",
      industry: "Technology",
      employerId: employer1.id,
    })
    .returning();

  const [startupIo] = await db
    .insert(companies)
    .values({
      name: "Startup.io",
      description: "Fast-growing SaaS startup disrupting the industry",
      website: "https://startup.io",
      location: "New York, NY",
      size: "11-50",
      industry: "SaaS",
      employerId: employer2.id,
    })
    .returning();

  console.log("💼 Creating jobs...");

  const [job1] = await db
    .insert(jobs)
    .values({
      title: "Senior Backend Engineer",
      description: `
We're looking for a Senior Backend Engineer to join our platform team.

You'll be working on:
- Building scalable APIs that handle millions of requests
- Designing database schemas and optimizing queries
- Implementing authentication and authorization systems
- Mentoring junior developers

Requirements:
- 5+ years of backend development experience
- Strong knowledge of Node.js and TypeScript
- Experience with PostgreSQL or similar databases
- Understanding of microservices architecture
    `.trim(),
      requirements: {
        skills: ["Node.js", "TypeScript", "PostgreSQL", "Redis"],
        experience: "5+ years",
        education: "Bachelor's in CS or equivalent",
      },
      salaryMin: 150000,
      salaryMax: 200000,
      location: "San Francisco, CA",
      jobType: "full_time",
      experienceLevel: "Senior",
      status: "open",
      companyId: techCorp.id,
    })
    .returning();

  const [job2] = await db
    .insert(jobs)
    .values({
      title: "Full Stack Developer",
      description: `
Join our fast-paced startup as a Full Stack Developer!

You'll own features end-to-end from design to deployment.

What you'll do:
- Build user-facing features with React and TypeScript
- Develop backend APIs with Node.js
- Work directly with founders on product decisions
- Ship code to production multiple times per day
    `.trim(),
      requirements: {
        skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
        experience: "3+ years",
      },
      salaryMin: 120000,
      salaryMax: 160000,
      location: "New York, NY (Hybrid)",
      jobType: "full_time",
      experienceLevel: "Mid",
      status: "open",
      companyId: startupIo.id,
    })
    .returning();

  const [job3] = await db
    .insert(jobs)
    .values({
      title: "Junior Frontend Developer",
      description: `
Great opportunity for a junior developer to grow their skills!

You'll work alongside experienced engineers and learn:
- Modern React patterns and best practices
- TypeScript for type-safe development
- Testing and code quality practices
- Agile development workflows
    `.trim(),
      requirements: {
        skills: ["JavaScript", "React", "HTML", "CSS"],
        experience: "0-2 years",
      },
      salaryMin: 70000,
      salaryMax: 90000,
      location: "Remote",
      jobType: "remote",
      experienceLevel: "Entry",
      status: "open",
      companyId: techCorp.id,
    })
    .returning();

  console.log("📝 Creating applications...");

  await db.insert(applications).values([
    {
      userId: seeker1.id,
      jobId: job1.id,
      coverLetter: "I am excited to apply for this Senior Backend role...",
      status: "pending",
    },
    {
      userId: seeker1.id,
      jobId: job2.id,
      coverLetter: "I would love to join your startup...",
      status: "reviewed",
    },
    {
      userId: seeker2.id,
      jobId: job2.id,
      coverLetter: "As a full stack developer...",
      status: "shortlisted",
    },
    {
      userId: seeker2.id,
      jobId: job3.id,
      coverLetter: "I am looking to transition into frontend...",
      status: "pending",
    },
  ]);

  console.log("✅ Seed completed!");
  console.log(`
📊 Summary:
- ${3} users created (1 admin, 2 employers, 2 job seekers)
- ${2} companies created
- ${3} jobs created
- ${4} applications created
  `);

  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
```

Run the seed:

```bash
npm run db:seed
```

---

## 💡 Pro Tips

### 1. Never Edit Migration Files After Applying

```bash
# ❌ Wrong: Edited 0000_initial_schema.sql after it was applied to dev
# This causes checksum mismatch and migration failures

# ✅ Correct: Always generate a new migration for changes
npm run db:generate  # Creates 0002_fix_something.sql
```

### 2. Review Generated SQL Before Applying

```bash
# Always look at what Drizzle generated
cat drizzle/migrations/0001_*.sql

# Check for:
# - Unexpected column drops (data loss!)
# - Missing indexes
# - Wrong foreign key constraints
```

### 3. Use Partial Indexes for Filtered Queries

```typescript
// Only index 'open' jobs since that's what we query
openJobsIdx: index('jobs_open_idx')
  .on(table.id)
  .where(sql`status = 'open'`),
```

### 4. Coordinate Migrations with Team

```bash
# Before starting work
git pull
npm run db:migrate

# Before pushing
git pull
npm run db:generate  # May need to resolve conflicts
npm run db:migrate
git push
```

### 5. Test Migrations on Copy of Production Data

```bash
# Create local copy of production DB for testing
pg_dump production_db > backup.sql
psql test_db < backup.sql
npm run db:migrate  # Test migration on real data
```

---

## 🔧 5-Minute Debugger

### "Relation does not exist" Error

```
Error: relation "users" does not exist
```

**Cause:** Migrations haven't been applied.

**Fix:**

```bash
# Check migration status
npm run db:check

# Apply pending migrations
npm run db:migrate
```

### Migration Checksum Mismatch

```
Error: Migration checksum mismatch for 0000_initial_schema.sql
```

**Cause:** Migration file was edited after being applied.

**Fix (development only):**

```bash
# Reset database and reapply all migrations
npm run db:reset
```

### Circular Dependency in Schema

```
Error: Cannot access 'users' before initialization
```

**Cause:** Circular imports between schema files.

**Fix:**

```typescript
// Use consistent import patterns
// In companies.ts
import { users } from './users';  // Direct import, not from index

// Or use lazy references
employerId: integer('employer_id').references(() => users.id),
```

### Foreign Key Violation

```
Error: insert or update on table "jobs" violates foreign key constraint
```

**Cause:** Referenced record doesn't exist.

**Fix:**

```typescript
// Ensure parent records exist before children
const [company] = await db.insert(companies).values({...}).returning();
const [job] = await db.insert(jobs).values({
  ...
  companyId: company.id,  // Now this exists
}).returning();
```

### Migration Not Detecting Changes

```bash
npm run db:generate
# Output: No schema changes detected
```

**Cause:** Schema file not imported in index.ts.

**Fix:**

```typescript
// src/db/schema/index.ts
export * from "./users";
export * from "./companies";
export * from "./jobs";
export * from "./applications";
export * from "./savedJobs"; // Don't forget new tables!
```

---

## 📝 Summary

In this lesson, you learned:

1. **What Migrations Are**
   - Versioned, trackable schema changes
   - Applied in order, stored in metadata table
   - Essential for team coordination and production

2. **Drizzle Kit Commands**
   - `generate`: Create migration from schema diff
   - `migrate`: Apply pending migrations
   - `push`: Direct apply (dev only)
   - `studio`: Visual database browser

3. **Foreign Key Constraints**
   - `cascade`: Delete/update children with parent
   - `restrict`: Block if children exist
   - `set null`: Nullify foreign key

4. **Many-to-Many Relationships**
   - Junction tables with two foreign keys
   - Unique constraints prevent duplicates

5. **Performance Indexes**
   - Index columns you query
   - Composite indexes for multi-column filters
   - Partial indexes for filtered queries

6. **DevJobs Pro Setup**
   - npm scripts for database management
   - Seed script for development data

---

## ➡️ Next: Lesson 4

With our database schema created and migrations working, it's time to build the complete data layer. In the next lesson, we'll implement **service methods** that interact with the database.

[Continue to Lesson 4: DevJobs Database Implementation →](./04-devjobs-database-implementation.md)
