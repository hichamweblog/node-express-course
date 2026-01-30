# Lesson 1: SQL Fundamentals & PostgreSQL Setup

## 🎯 Hook: The Backbone of Data

SQL has been the backbone of data management for **over 50 years**—and it's not going anywhere. While NoSQL databases have their place, relational databases remain the gold standard for applications requiring data integrity, complex queries, and ACID compliance.

For DevJobs Pro, we're choosing PostgreSQL because:

- **Data integrity matters**: Job applications, user accounts, and company data need strict consistency
- **Complex queries**: Search jobs by location, salary range, skills, company—all in one query
- **Relations everywhere**: Users apply to jobs, jobs belong to companies, companies have employers

Master SQL, and you master data.

---

## 📚 Theory: Relational Database Concepts

### What is a Relational Database?

A relational database organizes data into **tables** (also called relations) with **rows** and **columns**. Think of it like a super-powered spreadsheet where:

- Each **table** represents an entity (users, jobs, companies)
- Each **row** is a single record (one user, one job)
- Each **column** is an attribute (email, title, salary)

The "relational" part comes from how tables **relate** to each other through keys.

### Tables, Rows, and Columns

```
┌─────────────────────────────────────────────────────────────┐
│                        users TABLE                          │
├─────────────────────────────────────────────────────────────┤
│  COLUMNS (fields/attributes)                                │
│  ↓         ↓              ↓           ↓                     │
├──────┬─────────────────┬────────────┬─────────────┬─────────┤
│  id  │     email       │  password  │    role     │created_at│
├──────┼─────────────────┼────────────┼─────────────┼─────────┤
│  1   │ alice@email.com │ hashed...  │ job_seeker  │2026-01..│ ← ROW (record)
├──────┼─────────────────┼────────────┼─────────────┼─────────┤
│  2   │ bob@company.com │ hashed...  │ employer    │2026-01..│ ← ROW (record)
├──────┼─────────────────┼────────────┼─────────────┼─────────┤
│  3   │ admin@site.com  │ hashed...  │ admin       │2026-01..│ ← ROW (record)
└──────┴─────────────────┴────────────┴─────────────┴─────────┘
```

### Keys: The Foundation of Relationships

#### Primary Key (PK)

- **Uniquely identifies** each row in a table
- Cannot be NULL, must be unique
- Typically an auto-incrementing integer or UUID

#### Foreign Key (FK)

- References a primary key in **another table**
- Creates a **relationship** between tables
- Enforces **referential integrity** (can't reference non-existent records)

```
┌────────────────┐         ┌────────────────┐
│    companies   │         │      jobs      │
├────────────────┤         ├────────────────┤
│ PK id          │←────────│ FK company_id  │
│    name        │    1:N  │ PK id          │
│    description │         │    title       │
│    logo_url    │         │    salary      │
└────────────────┘         └────────────────┘

One company has MANY jobs (1:N relationship)
```

#### Indexes

- **Speed up queries** by creating sorted references to data
- Like the index in a book—find information without scanning every page
- Trade-off: faster reads, slightly slower writes

```sql
-- Without index: scans ALL rows to find jobs by company
-- With index: jumps directly to matching rows

CREATE INDEX idx_jobs_company_id ON jobs(company_id);
```

### SQL Basics: CRUD Operations

SQL (Structured Query Language) uses four main operations:

#### SELECT - Read data

```sql
-- Get all jobs
SELECT * FROM jobs;

-- Get specific columns
SELECT title, salary FROM jobs;

-- Filter with WHERE
SELECT * FROM jobs WHERE salary > 50000;

-- Sort results
SELECT * FROM jobs ORDER BY salary DESC;

-- Limit results
SELECT * FROM jobs LIMIT 10 OFFSET 20;
```

#### INSERT - Create data

```sql
-- Insert single row
INSERT INTO users (email, password, role)
VALUES ('alice@email.com', 'hashed_password', 'job_seeker');

-- Insert and return the created row
INSERT INTO users (email, password, role)
VALUES ('bob@email.com', 'hashed_password', 'employer')
RETURNING *;

-- Insert multiple rows
INSERT INTO jobs (title, company_id, salary)
VALUES
  ('Backend Developer', 1, 80000),
  ('Frontend Developer', 1, 75000);
```

#### UPDATE - Modify data

```sql
-- Update with condition (ALWAYS use WHERE!)
UPDATE jobs SET salary = 90000 WHERE id = 1;

-- Update multiple columns
UPDATE users
SET email = 'newemail@example.com', updated_at = NOW()
WHERE id = 5;

-- ⚠️ DANGER: Without WHERE, updates ALL rows!
UPDATE jobs SET status = 'closed'; -- Updates EVERY job!
```

#### DELETE - Remove data

```sql
-- Delete with condition
DELETE FROM applications WHERE id = 10;

-- Delete multiple
DELETE FROM jobs WHERE status = 'expired';

-- ⚠️ DANGER: Without WHERE, deletes ALL rows!
DELETE FROM users; -- Deletes EVERYONE!
```

### JOINs: Combining Tables

JOINs are what make relational databases powerful—they let you combine related data from multiple tables in a single query.

```sql
-- INNER JOIN: Only rows that match in BOTH tables
SELECT jobs.title, companies.name AS company_name
FROM jobs
INNER JOIN companies ON jobs.company_id = companies.id;

-- LEFT JOIN: All rows from left table + matching rows from right
SELECT users.email, applications.status
FROM users
LEFT JOIN applications ON users.id = applications.user_id;
-- Returns users even if they have no applications

-- Multiple JOINs
SELECT
  jobs.title,
  companies.name AS company,
  COUNT(applications.id) AS application_count
FROM jobs
INNER JOIN companies ON jobs.company_id = companies.id
LEFT JOIN applications ON jobs.id = applications.job_id
GROUP BY jobs.id, companies.id;
```

```
INNER JOIN Visualization:
┌─────────────────┐     ┌─────────────────┐
│    Table A      │     │    Table B      │
│   ┌───────┐     │     │     ┌───────┐   │
│   │       │     │     │     │       │   │
│   │ Match │─────│─────│─────│ Match │   │
│   │       │     │     │     │       │   │
│   └───────┘     │     │     └───────┘   │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
    Only returns rows in the overlap
```

---

## 🐘 PostgreSQL: Why It's Our Choice

### PostgreSQL Features

PostgreSQL is often called "the most advanced open-source database" for good reasons:

| Feature                    | Benefit for DevJobs Pro                               |
| -------------------------- | ----------------------------------------------------- |
| **ACID Compliance**        | Job applications never get lost or corrupted          |
| **JSONB Support**          | Store flexible data (job requirements, user profiles) |
| **Full-Text Search**       | Search job descriptions efficiently                   |
| **Advanced Indexes**       | Fast queries on any column combination                |
| **Concurrent Performance** | Handle many users simultaneously                      |
| **Extensions**             | Add features like UUID generation, geolocation        |

### PostgreSQL Data Types

```sql
-- Numeric
id SERIAL PRIMARY KEY,          -- Auto-incrementing integer
salary INTEGER,                  -- Whole numbers
rating DECIMAL(3, 2),           -- Precise decimals (e.g., 4.75)

-- Text
email VARCHAR(255),              -- Variable-length, max 255 chars
description TEXT,                -- Unlimited text
status VARCHAR(20),              -- Short strings

-- Boolean
is_active BOOLEAN DEFAULT true,

-- Date/Time
created_at TIMESTAMP DEFAULT NOW(),
applied_at TIMESTAMP WITH TIME ZONE,

-- UUID (better for distributed systems)
id UUID DEFAULT gen_random_uuid(),

-- JSON (flexible schema within SQL)
requirements JSONB,              -- Binary JSON (faster queries)
metadata JSON,                   -- Regular JSON

-- Arrays (PostgreSQL specialty)
skills TEXT[],                   -- Array of strings
```

### JSONB: The Best of Both Worlds

JSONB lets you store semi-structured data while keeping SQL's query power:

```sql
-- Store flexible job requirements
INSERT INTO jobs (title, requirements)
VALUES ('Backend Dev', '{"skills": ["Node.js", "PostgreSQL"], "experience": 3}');

-- Query JSONB fields
SELECT * FROM jobs
WHERE requirements->>'experience' = '3';

-- Query array inside JSONB
SELECT * FROM jobs
WHERE requirements->'skills' ? 'Node.js';
```

---

## 🛠️ Setting Up PostgreSQL

### Option 1: Docker (Recommended for Development)

Docker provides a **consistent environment** across all machines and easy cleanup.

```bash
# Pull PostgreSQL image
docker pull postgres:16

# Run container
docker run --name devjobs-postgres \
  -e POSTGRES_USER=devjobs \
  -e POSTGRES_PASSWORD=devjobs_secret \
  -e POSTGRES_DB=devjobs_dev \
  -p 5432:5432 \
  -d postgres:16

# Verify it's running
docker ps

# Connect with psql (inside container)
docker exec -it devjobs-postgres psql -U devjobs -d devjobs_dev
```

### Option 2: Local Installation

**macOS:**

```bash
brew install postgresql@16
brew services start postgresql@16
createdb devjobs_dev
```

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createuser --interactive
sudo -u postgres createdb devjobs_dev
```

### Option 3: Cloud Services (Production-like)

For a production-like environment without server management:

| Service      | Best For                          | Free Tier             |
| ------------ | --------------------------------- | --------------------- |
| **Neon**     | Serverless, scales to zero        | 512MB storage         |
| **Supabase** | Full backend (auth, API included) | 500MB storage         |
| **Railway**  | Simple deployment                 | $5/month credit       |
| **Render**   | Easy setup                        | 1GB storage (90 days) |

---

## 📊 DevJobs Pro Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                       DevJobs Pro Database Schema                            │
└──────────────────────────────────────────────────────────────────────────────┘

┌────────────────────┐       ┌────────────────────┐       ┌────────────────────┐
│       users        │       │     companies      │       │        jobs        │
├────────────────────┤       ├────────────────────┤       ├────────────────────┤
│ PK id              │       │ PK id              │       │ PK id              │
│    email      [UQ] │       │    name            │       │    title           │
│    password_hash   │       │    description     │       │    description     │
│    role            │       │    logo_url        │       │    requirements    │
│    first_name      │   ┌───│ FK employer_id     │───┐   │    salary_min      │
│    last_name       │   │   │    website         │   │   │    salary_max      │
│    phone           │   │   │    location        │   │   │    location        │
│    resume_url      │   │   │    created_at      │   │   │    job_type        │
│    created_at      │───┘   │    updated_at      │   └───│ FK company_id      │
│    updated_at      │       └────────────────────┘       │    status          │
└────────────────────┘                                    │    created_at      │
         │                                                │    updated_at      │
         │                                                └────────────────────┘
         │                                                         │
         │              ┌────────────────────┐                     │
         │              │   applications     │                     │
         │              ├────────────────────┤                     │
         └──────────────│ FK user_id         │                     │
                        │ FK job_id          │─────────────────────┘
                        │ PK id              │
                        │    cover_letter    │
                        │    resume_url      │
                        │    status          │
                        │    applied_at      │
                        │    updated_at      │
                        └────────────────────┘

RELATIONSHIPS:
─────────────────────────────────────────────────────────────────
users (1) ──────────< companies (N)    : One employer owns many companies
companies (1) ──────< jobs (N)         : One company has many jobs
users (1) ──────────< applications (N) : One user has many applications
jobs (1) ───────────< applications (N) : One job has many applications

ROLES:
─────────────────────────────────────────────────────────────────
• job_seeker : Can apply to jobs, manage applications
• employer   : Can create companies, post jobs, review applications
• admin      : Full system access, manage users and content
```

---

## 🎓 Mini-Tutorial: PostgreSQL with Docker

Let's set up PostgreSQL properly for DevJobs Pro development.

### Step 1: Create Project Structure

```bash
mkdir -p devjobs-api
cd devjobs-api
npm init -y
```

### Step 2: Create Docker Compose File

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    container_name: devjobs-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-devjobs}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-devjobs_secret}
      POSTGRES_DB: ${DB_NAME:-devjobs_dev}
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test:
        [
          "CMD-SHELL",
          "pg_isready -U ${DB_USER:-devjobs} -d ${DB_NAME:-devjobs_dev}",
        ]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Step 3: Create Initialization Script

Create `init.sql`:

```sql
-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- Create enum types for DevJobs Pro
CREATE TYPE user_role AS ENUM ('job_seeker', 'employer', 'admin');
CREATE TYPE job_status AS ENUM ('draft', 'open', 'closed', 'expired');
CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired');
CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'remote');

-- Log successful initialization
DO $$
BEGIN
  RAISE NOTICE 'DevJobs Pro database initialized successfully!';
END $$;
```

### Step 4: Create Environment File

Create `.env`:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=devjobs
DB_PASSWORD=devjobs_secret
DB_NAME=devjobs_dev

# Connection URL (for Drizzle)
DATABASE_URL=postgresql://devjobs:devjobs_secret@localhost:5432/devjobs_dev
```

Create `.env.example` (for version control):

```bash
# Database Configuration (copy to .env and fill values)
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=devjobs_dev

DATABASE_URL=postgresql://user:password@localhost:5432/devjobs_dev
```

### Step 5: Update .gitignore

```bash
# Environment files
.env
.env.local
.env.*.local

# Docker volumes
postgres_data/

# Node
node_modules/
```

### Step 6: Start the Database

```bash
# Start PostgreSQL
docker-compose up -d

# View logs
docker-compose logs -f postgres

# Check if it's running
docker-compose ps
```

### Step 7: Test Connection

```bash
# Connect with psql
docker exec -it devjobs-postgres psql -U devjobs -d devjobs_dev

# Inside psql, run:
\dt           -- List tables (empty for now)
\dx           -- List extensions (should show uuid-ossp)
\dT+          -- List custom types (should show our enums)
SELECT version();  -- PostgreSQL version
\q            -- Quit
```

---

## ✏️ Practice: Complete DevJobs Pro Database Setup

### Task 1: Docker Compose with Multiple Environments

Extend your setup to support test database:

```yaml
# docker-compose.yml (extended)
version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    container_name: devjobs-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-devjobs}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-devjobs_secret}
      POSTGRES_DB: ${DB_NAME:-devjobs_dev}
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-devjobs}"]
      interval: 10s
      timeout: 5s
      retries: 5

  postgres_test:
    image: postgres:16-alpine
    container_name: devjobs-postgres-test
    environment:
      POSTGRES_USER: devjobs_test
      POSTGRES_PASSWORD: test_secret
      POSTGRES_DB: devjobs_test
    ports:
      - "5433:5432"
    # No volume - data resets on restart (perfect for tests)

volumes:
  postgres_data:
```

### Task 2: Create npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "db:start": "docker-compose up -d postgres",
    "db:stop": "docker-compose stop postgres",
    "db:restart": "docker-compose restart postgres",
    "db:logs": "docker-compose logs -f postgres",
    "db:shell": "docker exec -it devjobs-postgres psql -U devjobs -d devjobs_dev",
    "db:reset": "docker-compose down -v && docker-compose up -d postgres",
    "test:db:start": "docker-compose up -d postgres_test",
    "test:db:stop": "docker-compose stop postgres_test"
  }
}
```

### Task 3: Connection Test Script

Create `scripts/test-connection.ts`:

```typescript
import { Client } from "pg";
import "dotenv/config";

async function testConnection(): Promise<void> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("🔌 Connecting to PostgreSQL...");
    await client.connect();

    const result = await client.query("SELECT version()");
    console.log("✅ Connected successfully!");
    console.log("📦 PostgreSQL version:", result.rows[0].version);

    // Test custom types
    const types = await client.query(`
      SELECT typname FROM pg_type
      WHERE typname IN ('user_role', 'job_status', 'application_status', 'job_type')
    `);
    console.log(
      "🏷️  Custom types:",
      types.rows.map((r) => r.typname).join(", "),
    );

    // Test extensions
    const extensions = await client.query(`
      SELECT extname FROM pg_extension WHERE extname IN ('uuid-ossp', 'pg_trgm')
    `);
    console.log(
      "🧩 Extensions:",
      extensions.rows.map((r) => r.extname).join(", "),
    );
  } catch (error) {
    console.error("❌ Connection failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testConnection();
```

Install dependencies and run:

```bash
npm install pg dotenv
npm install -D @types/pg tsx

# Add to package.json scripts
"db:test": "tsx scripts/test-connection.ts"

# Run
npm run db:test
```

---

## 💡 Pro Tips

### 1. Use Docker for Consistent Environments

```bash
# Everyone on the team gets identical database setup
# No "works on my machine" issues
docker-compose up -d
```

### 2. Never Commit .env Files

```bash
# .gitignore
.env
.env.local
.env.*.local

# Always provide .env.example
cp .env.example .env
```

### 3. Use Connection Pooling in Production

```typescript
// Single connection - bad for production
const client = new Client({ connectionString });

// Connection pool - good for production
import { Pool } from "pg";
const pool = new Pool({ connectionString, max: 20 });
```

### 4. Always Use Parameterized Queries

```typescript
// ❌ SQL Injection vulnerability
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Safe parameterized query
const query = "SELECT * FROM users WHERE email = $1";
const result = await client.query(query, [email]);
```

### 5. Use UUIDs for Public-Facing IDs

```typescript
// ❌ Sequential IDs reveal information
(/api/erssu / 1,
  /api/erssu / 2,
  /api/erssu /
    3 /
    // ✅ UUIDs are unguessable
    api /
    users /
    a1b2c3d4 -
    e5f6 -
    7890 -
    abcd -
    ef1234567890);
```

---

## 🔧 5-Minute Debugger

### "Connection refused" Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Diagnosis steps:**

```bash
# 1. Is PostgreSQL running?
docker ps | grep postgres
# or
docker-compose ps

# 2. Check container logs
docker-compose logs postgres

# 3. Is the port exposed?
docker port devjobs-postgres

# 4. Is something else using port 5432?
lsof -i :5432
```

**Common fixes:**

```bash
# Container not running
docker-compose up -d

# Port conflict - change port in docker-compose.yml
ports:
  - "5433:5432"  # Use 5433 externally

# Then update DATABASE_URL
DATABASE_URL=postgresql://devjobs:secret@localhost:5433/devjobs_dev
```

### "Password authentication failed" Error

```
Error: password authentication failed for user "devjobs"
```

**Diagnosis:**

```bash
# Check what credentials the container expects
docker exec devjobs-postgres env | grep POSTGRES

# Compare with your .env file
cat .env | grep DB_
```

**Fixes:**

```bash
# 1. Ensure .env matches docker-compose.yml environment
# 2. If you changed password, recreate the container
docker-compose down -v  # -v removes volume (data loss!)
docker-compose up -d

# 3. Verify connection string format
# Correct: postgresql://user:password@host:port/database
```

### "Database does not exist" Error

```
Error: database "devjobs_dev" does not exist
```

**Fix:**

```bash
# Create database manually
docker exec -it devjobs-postgres psql -U devjobs -c "CREATE DATABASE devjobs_dev;"

# Or recreate container (it auto-creates from POSTGRES_DB)
docker-compose down -v
docker-compose up -d
```

### "Role does not exist" Error

```
Error: role "devjobs" does not exist
```

**This happens when connecting before PostgreSQL finishes initializing.**

```bash
# Wait for health check
docker-compose up -d
sleep 5  # Wait for initialization
npm run db:test
```

---

## 📝 Summary

In this lesson, you learned:

1. **Relational Database Fundamentals**
   - Tables, rows, columns structure
   - Primary and foreign keys for relationships
   - Indexes for query performance

2. **SQL CRUD Operations**
   - SELECT, INSERT, UPDATE, DELETE
   - JOINs for combining related data
   - Always use WHERE for UPDATE/DELETE!

3. **PostgreSQL Strengths**
   - ACID compliance for data integrity
   - JSONB for flexible data
   - Rich data types and extensions

4. **Docker Setup for Development**
   - Consistent environment across team
   - Easy start/stop/reset
   - Separate test database

5. **DevJobs Pro Schema Design**
   - Four main entities: users, companies, jobs, applications
   - Three user roles: job_seeker, employer, admin
   - Proper relationships between tables

---

## ➡️ Next: Lesson 2

With PostgreSQL running, we're ready to add our ORM layer. In the next lesson, we'll set up **Drizzle ORM** and define our schema with full TypeScript type safety.

[Continue to Lesson 2: Drizzle ORM & Schema Design →](./02-drizzle-orm-schema-design.md)
