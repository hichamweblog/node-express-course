# Lesson 4: DevJobs Pro Complete Test Suite

## 🎯 Hook: Complete Test Coverage for Production Confidence

**You've built the application. You've learned to write tests. Now it's time to put it all together.**

A complete test suite isn't just a collection of tests—it's a safety net that lets you:

- **Refactor fearlessly** - Change implementation without breaking features
- **Deploy confidently** - Know your code works before it hits production
- **Onboard easily** - Tests document how your system behaves
- **Sleep soundly** - No more 3 AM bug hunts

```
┌─────────────────────────────────────────────────────────────────┐
│                DEVJOBS PRO TEST ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                        ┌───────────┐                            │
│                        │   E2E     │   Playwright/Cypress       │
│                        │  Tests    │   (Future Module)          │
│                        └─────┬─────┘                            │
│                              │                                  │
│                    ┌─────────┴─────────┐                        │
│                    │   Integration     │   Supertest             │
│                    │      Tests        │   Real DB              │
│                    │  (API Endpoints)  │   ~25% of tests        │
│                    └─────────┬─────────┘                        │
│                              │                                  │
│           ┌──────────────────┴──────────────────┐               │
│           │           Unit Tests                │   Vitest      │
│           │   (Services, Utils, Validators)     │   Mocked DB   │
│           │          ~75% of tests              │               │
│           └─────────────────────────────────────┘               │
│                                                                 │
│   ─────────────────────────────────────────────────────────     │
│                                                                 │
│   Coverage Goals:                                               │
│   ✓ Lines: > 80%                                                │
│   ✓ Functions: > 80%                                            │
│   ✓ Branches: > 75%                                             │
│   ✓ Critical paths: 100%                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📚 Theory: Organizing Large Test Suites

### Test Organization Principles

```
┌─────────────────────────────────────────────────────────────────┐
│                   TEST ORGANIZATION                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. MIRROR SOURCE STRUCTURE                                    │
│   ─────────────────────────                                     │
│                                                                 │
│   src/                          tests/                          │
│   ├── services/                 ├── unit/                       │
│   │   ├── auth.service.ts       │   └── services/               │
│   │   └── job.service.ts        │       ├── auth.service.test.ts│
│   ├── controllers/              │       └── job.service.test.ts │
│   │   └── job.controller.ts     ├── integration/                │
│   └── utils/                    │   └── api/                    │
│       └── validation.ts         │       ├── auth.test.ts        │
│                                 │       └── jobs.test.ts        │
│                                 ├── factories/                  │
│                                 └── utils/                      │
│                                                                 │
│   ─────────────────────────────────────────────────────────     │
│                                                                 │
│   2. SEPARATE CONCERNS                                          │
│   ────────────────────                                          │
│                                                                 │
│   tests/                                                        │
│   ├── unit/           → Fast, isolated, mocked                  │
│   ├── integration/    → Slower, real dependencies               │
│   ├── e2e/            → Full user flows (optional)              │
│   ├── factories/      → Test data creation                      │
│   ├── fixtures/       → Static test files (PDFs, images)        │
│   └── utils/          → Shared test helpers                     │
│                                                                 │
│   ─────────────────────────────────────────────────────────     │
│                                                                 │
│   3. NAME TESTS CLEARLY                                         │
│   ─────────────────────                                         │
│                                                                 │
│   describe('JobService')                                        │
│     describe('createJob')                                       │
│       it('should create job with valid data')                   │
│       it('should throw ValidationError for missing title')      │
│       it('should require employer role')                        │
│                                                                 │
│   Output: "JobService > createJob > should create job with..."  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Test-Driven Development (TDD) Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                     TDD CYCLE: RED → GREEN → REFACTOR           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│         ┌────────────────┐                                      │
│         │    1. RED      │                                      │
│         │  Write failing │                                      │
│         │     test       │                                      │
│         └───────┬────────┘                                      │
│                 │                                               │
│                 ▼                                               │
│         ┌────────────────┐                                      │
│         │   2. GREEN     │                                      │
│         │ Write minimum  │                                      │
│         │ code to pass   │                                      │
│    ┌────┴────────────────┘                                      │
│    │            │                                               │
│    │            ▼                                               │
│    │    ┌────────────────┐                                      │
│    │    │  3. REFACTOR   │                                      │
│    │    │ Improve code   │                                      │
│    │    │ (tests pass)   │                                      │
│    │    └───────┬────────┘                                      │
│    │            │                                               │
│    └────────────┘                                               │
│         ↺ Repeat                                                │
│                                                                 │
│   Benefits:                                                     │
│   ✓ Tests drive design                                          │
│   ✓ Code is testable by default                                 │
│   ✓ Small, focused iterations                                   │
│   ✓ High confidence in changes                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### CI/CD Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                   CI/CD TEST PIPELINE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   git push → GitHub Actions                                     │
│                    │                                            │
│                    ▼                                            │
│   ┌─────────────────────────────────────────────┐               │
│   │ 1. Install Dependencies                     │               │
│   │    npm ci                                   │ (~30s)        │
│   └─────────────────────────┬───────────────────┘               │
│                             │                                   │
│                             ▼                                   │
│   ┌─────────────────────────────────────────────┐               │
│   │ 2. Lint & Type Check                        │               │
│   │    npm run lint && npm run typecheck        │ (~15s)        │
│   └─────────────────────────┬───────────────────┘               │
│                             │                                   │
│                             ▼                                   │
│   ┌─────────────────────────────────────────────┐               │
│   │ 3. Unit Tests                               │               │
│   │    npm run test:unit                        │ (~10s)        │
│   └─────────────────────────┬───────────────────┘               │
│                             │                                   │
│                             ▼                                   │
│   ┌─────────────────────────────────────────────┐               │
│   │ 4. Integration Tests                        │               │
│   │    (with test database)                     │ (~60s)        │
│   │    npm run test:integration                 │               │
│   └─────────────────────────┬───────────────────┘               │
│                             │                                   │
│                             ▼                                   │
│   ┌─────────────────────────────────────────────┐               │
│   │ 5. Coverage Report                          │               │
│   │    Upload to Codecov/Coveralls              │               │
│   └─────────────────────────┬───────────────────┘               │
│                             │                                   │
│                             ▼                                   │
│   ✅ All passed → Deploy    │ ❌ Failed → Block & Notify        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💻 Code Examples: Complete Test File Structure

### Project Structure

```
devjobs-pro/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   └── index.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── job.controller.ts
│   │   └── application.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── job.model.ts
│   │   └── application.model.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── job.routes.ts
│   │   └── application.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── job.service.ts
│   │   ├── application.service.ts
│   │   └── email.service.ts
│   └── utils/
│       ├── validation.ts
│       └── helpers.ts
├── tests/
│   ├── setup.ts                    # Global test setup
│   ├── vitest.config.ts            # Test configuration
│   ├── factories/                  # Test data factories
│   │   ├── index.ts
│   │   ├── user.factory.ts
│   │   ├── job.factory.ts
│   │   └── application.factory.ts
│   ├── fixtures/                   # Static test files
│   │   ├── test-resume.pdf
│   │   └── test-avatar.jpg
│   ├── utils/                      # Test helpers
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   └── request.ts
│   ├── unit/                       # Unit tests
│   │   ├── services/
│   │   │   ├── auth.service.test.ts
│   │   │   ├── job.service.test.ts
│   │   │   ├── application.service.test.ts
│   │   │   └── email.service.test.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.test.ts
│   │   │   └── validation.middleware.test.ts
│   │   └── utils/
│   │       ├── validation.test.ts
│   │       └── helpers.test.ts
│   └── integration/                # Integration tests
│       ├── setup.ts
│       └── api/
│           ├── auth/
│           │   ├── register.test.ts
│           │   ├── login.test.ts
│           │   └── refresh.test.ts
│           ├── jobs/
│           │   ├── list-jobs.test.ts
│           │   ├── create-job.test.ts
│           │   ├── update-job.test.ts
│           │   └── delete-job.test.ts
│           └── applications/
│               ├── apply.test.ts
│               └── manage.test.ts
├── vitest.config.ts
└── package.json
```

### Global Test Setup

**tests/setup.ts:**

```typescript
import { beforeAll, afterAll, afterEach, vi } from "vitest";

// Set test environment
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-12345";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-12345";
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "postgresql://test:test@localhost:5432/devjobs_test";

// Global mocks
vi.mock("@/services/email.service", () => ({
  emailService: {
    sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
    sendApplicationNotification: vi.fn().mockResolvedValue(undefined),
    sendStatusUpdateEmail: vi.fn().mockResolvedValue(undefined),
  },
}));

// Global hooks
beforeAll(() => {
  console.log("🧪 Test suite starting...");
});

afterAll(() => {
  console.log("✅ Test suite complete");
});

afterEach(() => {
  vi.clearAllMocks();
});

// Custom matchers
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    return {
      pass,
      message: () =>
        `expected ${received} ${pass ? "not " : ""}to be a valid UUID`,
    };
  },

  toBeValidJWT(received: string) {
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    const pass = jwtRegex.test(received);
    return {
      pass,
      message: () =>
        `expected ${received} ${pass ? "not " : ""}to be a valid JWT`,
    };
  },
});

// Extend Vitest types
declare module "vitest" {
  interface Assertion<T = unknown> {
    toBeValidUUID(): T;
    toBeValidJWT(): T;
  }
}
```

### Complete Factory System

**tests/factories/index.ts:**

```typescript
export * from "./user.factory";
export * from "./job.factory";
export * from "./application.factory";

// Factory reset function
let counters = {
  user: 1,
  job: 1,
  application: 1,
};

export function resetAllFactories(): void {
  counters = { user: 1, job: 1, application: 1 };
}

export function getNextId(type: keyof typeof counters): number {
  return counters[type]++;
}
```

**tests/factories/user.factory.ts:**

```typescript
import { getNextId } from "./index";
import bcrypt from "bcrypt";
import { db } from "@/db";

export type UserRole = "candidate" | "employer" | "admin";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserOptions {
  email?: string;
  password?: string;
  name?: string;
  role?: UserRole;
}

// Create user object (not persisted)
export function buildUser(
  options: CreateUserOptions = {},
): Omit<User, "id" | "createdAt" | "updatedAt"> {
  const n = getNextId("user");
  return {
    email: options.email || `user${n}@test.com`,
    password: options.password || "TestPass123",
    name: options.name || `Test User ${n}`,
    role: options.role || "candidate",
  };
}

// Create and persist user to database
export async function createUser(
  options: CreateUserOptions = {},
): Promise<User> {
  const userData = buildUser(options);
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const [user] = await db("users")
    .insert({
      ...userData,
      password: hashedPassword,
    })
    .returning("*");

  return user;
}

// Convenience factories
export async function createCandidate(
  options: Omit<CreateUserOptions, "role"> = {},
): Promise<User> {
  return createUser({ ...options, role: "candidate" });
}

export async function createEmployer(
  options: Omit<CreateUserOptions, "role"> = {},
): Promise<User> {
  return createUser({ ...options, role: "employer" });
}

export async function createAdmin(
  options: Omit<CreateUserOptions, "role"> = {},
): Promise<User> {
  return createUser({ ...options, role: "admin" });
}

// Create multiple users
export async function createUsers(
  count: number,
  options: CreateUserOptions = {},
): Promise<User[]> {
  const users: User[] = [];
  for (let i = 0; i < count; i++) {
    users.push(await createUser(options));
  }
  return users;
}
```

**tests/factories/job.factory.ts:**

```typescript
import { getNextId } from "./index";
import { db } from "@/db";

export type JobType = "full-time" | "part-time" | "contract" | "remote";
export type JobStatus = "draft" | "published" | "closed";

export interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: JobType;
  salaryMin: number;
  salaryMax: number;
  requirements: string[];
  employerId: string;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJobOptions {
  title?: string;
  description?: string;
  company?: string;
  location?: string;
  type?: JobType;
  salaryMin?: number;
  salaryMax?: number;
  requirements?: string[];
  employerId: string;
  status?: JobStatus;
}

// Build job object (not persisted)
export function buildJob(
  options: CreateJobOptions,
): Omit<Job, "id" | "createdAt" | "updatedAt"> {
  const n = getNextId("job");
  return {
    title: options.title || `Software Engineer ${n}`,
    description:
      options.description ||
      "An exciting opportunity to work with cutting-edge technology.",
    company: options.company || `TechCorp ${n}`,
    location: options.location || "San Francisco, CA",
    type: options.type || "full-time",
    salaryMin: options.salaryMin || 80000,
    salaryMax: options.salaryMax || 150000,
    requirements: options.requirements || [
      "3+ years experience",
      "TypeScript",
      "Node.js",
    ],
    employerId: options.employerId,
    status: options.status || "published",
  };
}

// Create and persist job to database
export async function createJob(options: CreateJobOptions): Promise<Job> {
  const jobData = buildJob(options);

  const [job] = await db("jobs")
    .insert({
      title: jobData.title,
      description: jobData.description,
      company: jobData.company,
      location: jobData.location,
      type: jobData.type,
      salary_min: jobData.salaryMin,
      salary_max: jobData.salaryMax,
      requirements: JSON.stringify(jobData.requirements),
      employer_id: jobData.employerId,
      status: jobData.status,
    })
    .returning("*");

  return {
    ...job,
    salaryMin: job.salary_min,
    salaryMax: job.salary_max,
    employerId: job.employer_id,
    requirements: JSON.parse(job.requirements),
    createdAt: job.created_at,
    updatedAt: job.updated_at,
  };
}

// Create published job
export async function createPublishedJob(
  options: Omit<CreateJobOptions, "status">,
): Promise<Job> {
  return createJob({ ...options, status: "published" });
}

// Create draft job
export async function createDraftJob(
  options: Omit<CreateJobOptions, "status">,
): Promise<Job> {
  return createJob({ ...options, status: "draft" });
}

// Create remote job
export async function createRemoteJob(
  options: Omit<CreateJobOptions, "type" | "location">,
): Promise<Job> {
  return createJob({ ...options, type: "remote", location: "Remote" });
}

// Create multiple jobs
export async function createJobs(
  count: number,
  options: CreateJobOptions,
): Promise<Job[]> {
  const jobs: Job[] = [];
  for (let i = 0; i < count; i++) {
    jobs.push(await createJob(options));
  }
  return jobs;
}
```

**tests/factories/application.factory.ts:**

```typescript
import { getNextId } from "./index";
import { db } from "@/db";

export type ApplicationStatus =
  | "pending"
  | "reviewed"
  | "shortlisted"
  | "rejected"
  | "hired";

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  coverLetter: string;
  resumeUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApplicationOptions {
  jobId: string;
  candidateId: string;
  status?: ApplicationStatus;
  coverLetter?: string;
  resumeUrl?: string;
  notes?: string;
}

// Create and persist application
export async function createApplication(
  options: CreateApplicationOptions,
): Promise<Application> {
  const n = getNextId("application");

  const [application] = await db("applications")
    .insert({
      job_id: options.jobId,
      candidate_id: options.candidateId,
      status: options.status || "pending",
      cover_letter:
        options.coverLetter ||
        `I am very interested in this position. Application #${n}`,
      resume_url: options.resumeUrl,
      notes: options.notes,
    })
    .returning("*");

  return {
    id: application.id,
    jobId: application.job_id,
    candidateId: application.candidate_id,
    status: application.status,
    coverLetter: application.cover_letter,
    resumeUrl: application.resume_url,
    notes: application.notes,
    createdAt: application.created_at,
    updatedAt: application.updated_at,
  };
}
```

### Test Utilities

**tests/utils/auth.ts:**

```typescript
import { authService } from "@/services/auth.service";
import { User } from "../factories/user.factory";

export function generateTestToken(user: User): string {
  return authService.generateAccessToken(user);
}

export function generateExpiredToken(user: User): string {
  // Generate token that's already expired
  return authService.generateAccessToken(user, "-1h");
}

export function generateRefreshToken(user: User): string {
  return authService.generateRefreshToken(user);
}

export interface AuthHeader {
  Authorization: string;
}

export function authHeader(token: string): AuthHeader {
  return { Authorization: `Bearer ${token}` };
}
```

**tests/utils/db.ts:**

```typescript
import { db } from "@/db";

export async function clearDatabase(): Promise<void> {
  // Clear in order respecting foreign keys
  await db.raw("TRUNCATE applications CASCADE");
  await db.raw("TRUNCATE jobs CASCADE");
  await db.raw("TRUNCATE users CASCADE");
}

export async function seedDatabase(): Promise<void> {
  // Add any seed data needed for all tests
}

export async function getRecordCount(table: string): Promise<number> {
  const result = await db(table).count("* as count");
  return parseInt(result[0].count as string, 10);
}
```

**tests/utils/request.ts:**

```typescript
import request from "supertest";
import { app } from "@/app";

// Typed request helpers
export function api() {
  return request(app);
}

export async function authenticatedGet(path: string, token: string) {
  return api().get(path).set("Authorization", `Bearer ${token}`);
}

export async function authenticatedPost(
  path: string,
  token: string,
  body: object,
) {
  return api().post(path).set("Authorization", `Bearer ${token}`).send(body);
}

export async function authenticatedPut(
  path: string,
  token: string,
  body: object,
) {
  return api().put(path).set("Authorization", `Bearer ${token}`).send(body);
}

export async function authenticatedDelete(path: string, token: string) {
  return api().delete(path).set("Authorization", `Bearer ${token}`);
}
```

### Complete Integration Test Example

**tests/integration/api/auth/register.test.ts:**

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { api } from "../../../utils/request";
import { clearDatabase } from "../../../utils/db";
import { createUser } from "../../../factories";

describe("POST /api/auth/register", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe("Successful Registration", () => {
    it("should register a new candidate", async () => {
      const userData = {
        email: "newuser@example.com",
        password: "SecurePass123",
        name: "New User",
      };

      const response = await api()
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        user: {
          email: userData.email,
          name: userData.name,
          role: "candidate",
        },
      });
      expect(response.body.user).not.toHaveProperty("password");
      expect(response.body.accessToken).toBeValidJWT();
      expect(response.body.refreshToken).toBeValidJWT();
    });

    it("should register an employer with role", async () => {
      const response = await api()
        .post("/api/auth/register")
        .send({
          email: "employer@company.com",
          password: "SecurePass123",
          name: "Hiring Manager",
          role: "employer",
        })
        .expect(201);

      expect(response.body.user.role).toBe("employer");
    });
  });

  describe("Validation Errors", () => {
    it("should reject duplicate email", async () => {
      await createUser({ email: "existing@example.com" });

      const response = await api()
        .post("/api/auth/register")
        .send({
          email: "existing@example.com",
          password: "SecurePass123",
          name: "Another User",
        })
        .expect(409);

      expect(response.body.error).toContain("already registered");
    });

    it("should reject invalid email format", async () => {
      const response = await api()
        .post("/api/auth/register")
        .send({
          email: "not-an-email",
          password: "SecurePass123",
          name: "User",
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some((e: any) => e.path === "email")).toBe(
        true,
      );
    });

    it("should reject weak password", async () => {
      const response = await api()
        .post("/api/auth/register")
        .send({
          email: "user@example.com",
          password: "123",
          name: "User",
        })
        .expect(400);

      expect(response.body.errors.some((e: any) => e.path === "password")).toBe(
        true,
      );
    });

    it("should reject missing required fields", async () => {
      const response = await api()
        .post("/api/auth/register")
        .send({})
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });
});
```

### CI Configuration

**.github/workflows/test.yml:**

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: devjobs_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run typecheck

      - name: Run unit tests
        run: npm run test:unit

      - name: Run migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/devjobs_test

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/devjobs_test
          JWT_SECRET: test-secret-key
          JWT_REFRESH_SECRET: test-refresh-secret-key

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run lint
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:run": "vitest run",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:ci": "vitest run --reporter=verbose --coverage"
  }
}
```

---

## 🏗️ Practice: Complete DevJobs Pro Test Suite

### Final Test Coverage Requirements

Implement comprehensive tests for all DevJobs Pro features:

#### Auth Tests (tests/integration/api/auth/)

- [ ] `register.test.ts` - User registration with all validation
- [ ] `login.test.ts` - Login with all scenarios
- [ ] `refresh.test.ts` - Token refresh flow
- [ ] `logout.test.ts` - Logout and token invalidation
- [ ] `password-reset.test.ts` - Password reset flow

#### Job Tests (tests/integration/api/jobs/)

- [ ] `list-jobs.test.ts` - Listing, filtering, pagination
- [ ] `get-job.test.ts` - Single job retrieval
- [ ] `create-job.test.ts` - Job creation (employer only)
- [ ] `update-job.test.ts` - Job updates (owner only)
- [ ] `delete-job.test.ts` - Job deletion (owner/admin)
- [ ] `publish-job.test.ts` - Job publishing flow

#### Application Tests (tests/integration/api/applications/)

- [ ] `apply.test.ts` - Application submission
- [ ] `list-applications.test.ts` - View applications (candidate/employer views)
- [ ] `update-status.test.ts` - Status updates (employer only)
- [ ] `withdraw.test.ts` - Application withdrawal

#### File Upload Tests

- [ ] `resume-upload.test.ts` - Resume upload with validation
- [ ] `avatar-upload.test.ts` - Profile picture upload

#### Error Handling Tests

- [ ] `validation-errors.test.ts` - Input validation
- [ ] `auth-errors.test.ts` - Authentication errors
- [ ] `permission-errors.test.ts` - Authorization errors
- [ ] `not-found-errors.test.ts` - Resource not found

### Sample Complete Test File

**tests/integration/api/jobs/create-job.test.ts:**

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { api, authenticatedPost } from "../../../utils/request";
import { clearDatabase } from "../../../utils/db";
import { createEmployer, createCandidate } from "../../../factories";
import { generateTestToken } from "../../../utils/auth";

describe("POST /api/jobs", () => {
  let employer: any;
  let employerToken: string;
  let candidate: any;
  let candidateToken: string;

  const validJob = {
    title: "Senior Full Stack Developer",
    description: "Join our team building innovative products.",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    type: "full-time",
    salaryMin: 120000,
    salaryMax: 180000,
    requirements: ["5+ years experience", "React", "Node.js", "PostgreSQL"],
  };

  beforeEach(async () => {
    await clearDatabase();
    employer = await createEmployer();
    employerToken = generateTestToken(employer);
    candidate = await createCandidate();
    candidateToken = generateTestToken(candidate);
  });

  describe("Authorization", () => {
    it("should require authentication", async () => {
      await api().post("/api/jobs").send(validJob).expect(401);
    });

    it("should require employer role", async () => {
      await authenticatedPost("/api/jobs", candidateToken, validJob).expect(
        403,
      );
    });

    it("should allow employer to create job", async () => {
      const response = await authenticatedPost(
        "/api/jobs",
        employerToken,
        validJob,
      ).expect(201);

      expect(response.body.job).toMatchObject({
        title: validJob.title,
        company: validJob.company,
        status: "draft", // New jobs start as draft
      });
    });
  });

  describe("Validation", () => {
    it("should require title", async () => {
      const { title, ...jobWithoutTitle } = validJob;

      const response = await authenticatedPost(
        "/api/jobs",
        employerToken,
        jobWithoutTitle,
      ).expect(400);

      expect(response.body.errors.some((e: any) => e.path === "title")).toBe(
        true,
      );
    });

    it("should require description", async () => {
      const { description, ...jobWithoutDesc } = validJob;

      const response = await authenticatedPost(
        "/api/jobs",
        employerToken,
        jobWithoutDesc,
      ).expect(400);

      expect(
        response.body.errors.some((e: any) => e.path === "description"),
      ).toBe(true);
    });

    it("should validate salary min is less than max", async () => {
      const invalidJob = { ...validJob, salaryMin: 200000, salaryMax: 100000 };

      const response = await authenticatedPost(
        "/api/jobs",
        employerToken,
        invalidJob,
      ).expect(400);

      expect(
        response.body.errors.some((e: any) => e.message.includes("salary")),
      ).toBe(true);
    });

    it("should validate job type is valid enum", async () => {
      const invalidJob = { ...validJob, type: "invalid-type" };

      const response = await authenticatedPost(
        "/api/jobs",
        employerToken,
        invalidJob,
      ).expect(400);

      expect(response.body.errors.some((e: any) => e.path === "type")).toBe(
        true,
      );
    });

    it("should accept empty requirements array", async () => {
      const jobWithNoRequirements = { ...validJob, requirements: [] };

      const response = await authenticatedPost(
        "/api/jobs",
        employerToken,
        jobWithNoRequirements,
      ).expect(201);

      expect(response.body.job.requirements).toEqual([]);
    });
  });

  describe("Job Creation", () => {
    it("should set employer as owner", async () => {
      const response = await authenticatedPost(
        "/api/jobs",
        employerToken,
        validJob,
      ).expect(201);

      expect(response.body.job.employerId).toBe(employer.id);
    });

    it("should create job with draft status", async () => {
      const response = await authenticatedPost(
        "/api/jobs",
        employerToken,
        validJob,
      ).expect(201);

      expect(response.body.job.status).toBe("draft");
    });

    it("should generate UUID for job id", async () => {
      const response = await authenticatedPost(
        "/api/jobs",
        employerToken,
        validJob,
      ).expect(201);

      expect(response.body.job.id).toBeValidUUID();
    });

    it("should include timestamps", async () => {
      const response = await authenticatedPost(
        "/api/jobs",
        employerToken,
        validJob,
      ).expect(201);

      expect(response.body.job.createdAt).toBeDefined();
      expect(response.body.job.updatedAt).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long description", async () => {
      const longDescription = "A".repeat(10000);
      const jobWithLongDesc = { ...validJob, description: longDescription };

      const response = await authenticatedPost(
        "/api/jobs",
        employerToken,
        jobWithLongDesc,
      ).expect(201);

      expect(response.body.job.description).toBe(longDescription);
    });

    it("should trim whitespace from title", async () => {
      const jobWithWhitespace = { ...validJob, title: "  Senior Developer  " };

      const response = await authenticatedPost(
        "/api/jobs",
        employerToken,
        jobWithWhitespace,
      ).expect(201);

      expect(response.body.job.title).toBe("Senior Developer");
    });

    it("should allow minimum valid salary", async () => {
      const jobWithMinSalary = { ...validJob, salaryMin: 0, salaryMax: 0 };

      const response = await authenticatedPost(
        "/api/jobs",
        employerToken,
        jobWithMinSalary,
      ).expect(201);

      expect(response.body.job.salaryMin).toBe(0);
    });
  });
});
```

---

## 💡 Pro Tips vs Junior Traps

| Pro Tip                                                               | Junior Trap                              |
| --------------------------------------------------------------------- | ---------------------------------------- |
| **Run tests in CI** - Tests that only pass locally are useless        | Only running tests manually before PR    |
| **Fail fast on critical paths** - Auth, payment, data integrity       | Equal priority for all tests             |
| **Use test:watch during development** - Instant feedback loop         | Running full suite after every change    |
| **Keep test database in sync** - Same migrations as production        | Different schema causing false positives |
| **Test error messages, not just status codes** - Verify user feedback | Only checking `expect(status).toBe(400)` |
| **Use descriptive test names** - Self-documenting expectations        | "test1", "it works", "handles edge case" |
| **Group related tests** - Clear structure aids debugging              | Random test order with no grouping       |

---

## 🐛 5-Minute Debugger

### Problem: Tests pass locally but fail in CI

```
✓ Local: All tests passing
✗ CI: 3 tests failed
```

**Quick Fixes:**

1. **Check environment variables:**

```typescript
// CI might not have the same env vars
// Add defaults in test setup
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
```

2. **Check database state:**

```yaml
# GitHub Actions - ensure DB is ready
services:
  postgres:
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
```

3. **Check for race conditions:**

```typescript
// Add proper async handling
await clearDatabase(); // Wait for this!
```

4. **Check for time-dependent tests:**

```typescript
// ❌ Flaky - depends on execution speed
expect(response.body.createdAt).toBe(new Date().toISOString());

// ✅ Stable - just check it exists
expect(response.body.createdAt).toBeDefined();
```

---

### Problem: Flaky tests (sometimes pass, sometimes fail)

**Quick Fixes:**

1. **Check for shared state:**

```typescript
// ❌ Shared counter gets corrupted
let counter = 0;

// ✅ Reset in beforeEach
beforeEach(() => {
  counter = 0;
});
```

2. **Check for timing issues:**

```typescript
// ❌ Race condition
await Promise.all([
  createUser(),
  createJob(), // Might need user!
]);

// ✅ Sequential when order matters
const user = await createUser();
const job = await createJob({ employerId: user.id });
```

3. **Check for database isolation:**

```typescript
// Run each test file in its own transaction
beforeEach(async () => {
  await db.raw("BEGIN");
});

afterEach(async () => {
  await db.raw("ROLLBACK");
});
```

---

### Problem: Slow test suite

```
⏱️ Test suite took 5 minutes
```

**Quick Fixes:**

1. **Don't hash passwords in every test:**

```typescript
// ❌ 100ms per test
const password = await bcrypt.hash("password", 10);

// ✅ Pre-compute or use lower rounds
const password = await bcrypt.hash("password", 1); // Only for tests!
```

2. **Run tests in parallel:**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
  },
});
```

3. **Use more unit tests, fewer integration tests:**

```
Integration: 30 tests × 100ms = 3 seconds
Unit: 100 tests × 5ms = 0.5 seconds
```

---

## ✅ Definition of Done Checklist

Before completing this module, verify:

### Test Coverage

- [ ] **Unit tests** for all services (auth, job, application, email)
- [ ] **Unit tests** for all utility functions
- [ ] **Integration tests** for all API endpoints
- [ ] **Authentication tests** - all auth flows covered
- [ ] **Authorization tests** - role-based access verified
- [ ] **Validation tests** - all input validation tested
- [ ] **Error handling tests** - all error responses verified
- [ ] **File upload tests** - upload flow working

### Code Quality

- [ ] **Coverage > 80%** - run `npm run test:coverage`
- [ ] **All tests pass** - run `npm test run`
- [ ] **Tests are fast** - unit tests < 10s, integration < 60s
- [ ] **No flaky tests** - all tests pass consistently

### Infrastructure

- [ ] **CI/CD configured** - tests run on every push/PR
- [ ] **Coverage reporting** - reports uploaded to Codecov/Coveralls
- [ ] **Test scripts** - convenient npm scripts for all test types

### Documentation

- [ ] **Test README** - explains how to run tests
- [ ] **Factory documentation** - how to create test data
- [ ] **CI status badge** - visible in repo README

### Quick Verification

```bash
# Run full test suite
npm test run

# Check coverage
npm run test:coverage

# Expected output:
# Test Files  20 passed (20)
# Tests  150 passed (150)
# Coverage:
#   Lines: 85%
#   Functions: 82%
#   Branches: 78%
```

---

## 🔗 Navigation

| Previous                                                                 | Home                          | Next                                                  |
| ------------------------------------------------------------------------ | ----------------------------- | ----------------------------------------------------- |
| [← Lesson 3: Integration Testing](./03-integration-testing-supertest.md) | [Module 13 Home](./README.md) | [Module 14: Deployment →](../14-deployment/README.md) |

---

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Supertest Repository](https://github.com/ladjs/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [GitHub Actions for Node.js](https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs)
- [Codecov Documentation](https://docs.codecov.com/)
- [Kent C. Dodds Testing Blog](https://kentcdodds.com/blog?q=testing)

---

## 🎉 Module Complete!

Congratulations! You've built a comprehensive test suite for DevJobs Pro. You now have:

- ✅ **Unit tests** for isolated business logic
- ✅ **Integration tests** for API endpoints
- ✅ **Test factories** for consistent data creation
- ✅ **CI/CD pipeline** for automated testing
- ✅ **Coverage reports** to track test quality

**Remember:** Tests are an investment in your future self. Every test you write today is a bug you won't debug at 3 AM tomorrow.

Now go forth and test with confidence! 🚀
