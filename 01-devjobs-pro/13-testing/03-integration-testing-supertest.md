# Lesson 3: Integration Testing with Supertest

## 🎯 Hook: Test Your API Endpoints End-to-End

**Unit tests verify your code works in isolation. Integration tests verify your code works _together_.**

When a user hits your `/api/auth/login` endpoint, they don't care that your `authService.login()` function works in isolation. They care that the request goes through your router, middleware, controller, service, database, and back—all working in harmony.

Integration tests give you confidence that the complete request/response cycle works as expected.

```
┌─────────────────────────────────────────────────────────────────┐
│                 INTEGRATION TEST FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    Supertest                            │   │
│   │                       │                                 │   │
│   │                       ▼                                 │   │
│   │   HTTP Request ──► Express App                          │   │
│   │                       │                                 │   │
│   │                       ▼                                 │   │
│   │                   Middleware                            │   │
│   │                   (auth, validation, etc.)              │   │
│   │                       │                                 │   │
│   │                       ▼                                 │   │
│   │                   Controller                            │   │
│   │                       │                                 │   │
│   │                       ▼                                 │   │
│   │                    Service                              │   │
│   │                       │                                 │   │
│   │                       ▼                                 │   │
│   │                  Test Database ◄─── Real or In-Memory   │   │
│   │                       │                                 │   │
│   │                       ▼                                 │   │
│   │   HTTP Response ◄── Express App                         │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   Integration tests verify the ENTIRE stack works together      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📚 Theory: Integration Testing Principles

### Integration vs Unit Tests

```
┌─────────────────────────────────────────────────────────────────┐
│           UNIT TESTS vs INTEGRATION TESTS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   UNIT TESTS                    │   INTEGRATION TESTS           │
│   ──────────                    │   ─────────────────           │
│                                 │                               │
│   • Test one function/module    │   • Test multiple components  │
│   • Mock all dependencies       │   • Use real dependencies     │
│   • Run in milliseconds         │   • Run in seconds            │
│   • Easy to debug (isolated)    │   • Harder to debug           │
│   • Cover edge cases            │   • Cover workflows           │
│                                 │                               │
│   Purpose:                      │   Purpose:                    │
│   "Does this code work?"        │   "Does this feature work?"   │
│                                 │                               │
│   ─────────────────────────────────────────────────────────     │
│                                                                 │
│   ┌─────────┐                   │   ┌─────────┐                 │
│   │Function │ ◄─── Test         │   │ Route   │ ◄─── Test       │
│   └────┬────┘     this          │   └────┬────┘     the         │
│        │                        │        │          whole       │
│   ┌────┴────┐                   │        ▼          flow        │
│   │  MOCK   │ ◄─── Not real     │   ┌────────┐                  │
│   └─────────┘                   │   │Middlewr│                  │
│                                 │   └────┬───┘                  │
│                                 │        ▼                      │
│                                 │   ┌────────┐                  │
│                                 │   │ Service│                  │
│                                 │   └────┬───┘                  │
│                                 │        ▼                      │
│                                 │   ┌────────┐                  │
│                                 │   │Database│ ◄─── Real        │
│                                 │   └────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Test Database Strategies

| Strategy                  | Pros                   | Cons                  | Best For         |
| ------------------------- | ---------------------- | --------------------- | ---------------- |
| **Separate Test DB**      | Real database behavior | Slower, needs setup   | Most projects    |
| **In-Memory DB (SQLite)** | Fast, no setup         | Different SQL dialect | Simple projects  |
| **Docker Container**      | Isolated, reproducible | Requires Docker       | CI/CD pipelines  |
| **Transaction Rollback**  | Fast, clean            | Complex setup         | High test volume |

```
┌─────────────────────────────────────────────────────────────────┐
│                 TEST DATABASE LIFECYCLE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   beforeAll()                                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  1. Connect to test database                            │   │
│   │  2. Run migrations                                      │   │
│   │  3. Seed base data (if needed)                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                          │                                      │
│                          ▼                                      │
│   beforeEach()                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  • Clear/reset test data                                │   │
│   │  • Create fresh test user                               │   │
│   │  • Generate auth tokens                                 │   │
│   └─────────────────────────────────────────────────────────┘   │
│                          │                                      │
│                          ▼                                      │
│   it('test case')                                               │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Run test                                               │   │
│   └─────────────────────────────────────────────────────────┘   │
│                          │                                      │
│                          ▼                                      │
│   afterEach()                                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  • Clean up test-specific data                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                          │                                      │
│                          ▼                                      │
│   afterAll()                                                    │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  1. Drop test tables (optional)                         │   │
│   │  2. Close database connection                           │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Supertest Basics

Supertest lets you make HTTP requests to your Express app without starting a server:

```typescript
import request from "supertest";
import app from "@/app";

// No need to listen on a port!
const response = await request(app)
  .get("/api/users")
  .set("Authorization", "Bearer token123")
  .expect(200);
```

---

## 💻 Code Examples

### Setting Up Supertest

**JavaScript:**

```javascript
// tests/integration/setup.js
import { beforeAll, afterAll, beforeEach } from "vitest";
import { app } from "@/app";
import { db } from "@/db";

// Export app for test files
export { app };

// Test database connection
let testDb;

beforeAll(async () => {
  // Connect to test database
  testDb = await db.connect(process.env.TEST_DATABASE_URL);

  // Run migrations
  await db.migrate.latest();
});

afterAll(async () => {
  // Close connection
  await testDb.destroy();
});

beforeEach(async () => {
  // Clear all tables before each test
  await db.raw("TRUNCATE users, jobs, applications CASCADE");
});
```

**TypeScript:**

```typescript
// tests/integration/setup.ts
import { beforeAll, afterAll, beforeEach } from "vitest";
import { app } from "@/app";
import { db } from "@/db";

// Export app for test files
export { app };

// Test database helpers
export async function setupTestDatabase(): Promise<void> {
  // Connect and migrate
  await db.connect(process.env.TEST_DATABASE_URL!);
  await db.migrate.latest();
}

export async function teardownTestDatabase(): Promise<void> {
  await db.destroy();
}

export async function clearTables(): Promise<void> {
  // Clear in correct order for foreign keys
  await db.raw("TRUNCATE applications CASCADE");
  await db.raw("TRUNCATE jobs CASCADE");
  await db.raw("TRUNCATE users CASCADE");
}

// Global setup
beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

beforeEach(async () => {
  await clearTables();
});
```

### Basic GET Endpoint Tests

**JavaScript:**

```javascript
// tests/integration/api/jobs.test.js
import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../setup";
import { createJob, createUser } from "../../factories";
import { db } from "@/db";

describe("GET /api/jobs", () => {
  let testJobs;

  beforeEach(async () => {
    // Create test data
    const employer = await db("users")
      .insert({
        email: "employer@test.com",
        password: "hashed",
        name: "Test Employer",
        role: "employer",
      })
      .returning("*");

    testJobs = await db("jobs")
      .insert([
        {
          title: "Frontend Developer",
          company: "Tech Co",
          location: "New York",
          employer_id: employer[0].id,
          status: "published",
        },
        {
          title: "Backend Developer",
          company: "Startup Inc",
          location: "Remote",
          employer_id: employer[0].id,
          status: "published",
        },
        {
          title: "Draft Job",
          company: "Hidden Co",
          location: "Boston",
          employer_id: employer[0].id,
          status: "draft", // Not published
        },
      ])
      .returning("*");
  });

  it("should return list of published jobs", async () => {
    const response = await request(app).get("/api/jobs").expect(200);

    expect(response.body.jobs).toHaveLength(2); // Only published jobs
    expect(response.body.jobs[0]).toHaveProperty("title");
    expect(response.body.jobs[0]).toHaveProperty("company");
  });

  it("should support pagination", async () => {
    const response = await request(app)
      .get("/api/jobs?page=1&limit=1")
      .expect(200);

    expect(response.body.jobs).toHaveLength(1);
    expect(response.body.pagination).toMatchObject({
      page: 1,
      limit: 1,
      total: 2,
    });
  });

  it("should filter by location", async () => {
    const response = await request(app)
      .get("/api/jobs?location=Remote")
      .expect(200);

    expect(response.body.jobs).toHaveLength(1);
    expect(response.body.jobs[0].location).toBe("Remote");
  });

  it("should return empty array when no matches", async () => {
    const response = await request(app)
      .get("/api/jobs?location=Antarctica")
      .expect(200);

    expect(response.body.jobs).toHaveLength(0);
  });
});

describe("GET /api/jobs/:id", () => {
  let testJob;

  beforeEach(async () => {
    const employer = await db("users")
      .insert({
        email: "employer@test.com",
        password: "hashed",
        name: "Test Employer",
        role: "employer",
      })
      .returning("*");

    testJob = await db("jobs")
      .insert({
        title: "Senior Developer",
        company: "Great Co",
        description: "Amazing opportunity",
        location: "San Francisco",
        employer_id: employer[0].id,
        status: "published",
      })
      .returning("*");

    testJob = testJob[0];
  });

  it("should return job details by ID", async () => {
    const response = await request(app)
      .get(`/api/jobs/${testJob.id}`)
      .expect(200);

    expect(response.body.job).toMatchObject({
      id: testJob.id,
      title: "Senior Developer",
      company: "Great Co",
    });
  });

  it("should return 404 for non-existent job", async () => {
    const response = await request(app)
      .get("/api/jobs/nonexistent-id")
      .expect(404);

    expect(response.body.error).toBeDefined();
  });
});
```

**TypeScript:**

```typescript
// tests/integration/api/jobs.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../setup";
import { db } from "@/db";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  status: string;
}

describe("GET /api/jobs", () => {
  let testJobs: Job[];

  beforeEach(async () => {
    const employer = await db("users")
      .insert({
        email: "employer@test.com",
        password: "hashed",
        name: "Test Employer",
        role: "employer",
      })
      .returning("*");

    testJobs = await db("jobs")
      .insert([
        {
          title: "Frontend Developer",
          company: "Tech Co",
          location: "New York",
          employer_id: employer[0].id,
          status: "published",
        },
        {
          title: "Backend Developer",
          company: "Startup Inc",
          location: "Remote",
          employer_id: employer[0].id,
          status: "published",
        },
      ])
      .returning("*");
  });

  it("should return list of published jobs", async () => {
    const response = await request(app).get("/api/jobs").expect(200);

    expect(response.body.jobs).toHaveLength(2);
    expect(response.body.jobs[0]).toHaveProperty("title");
  });

  it("should support pagination", async () => {
    const response = await request(app)
      .get("/api/jobs?page=1&limit=1")
      .expect(200);

    expect(response.body.jobs).toHaveLength(1);
    expect(response.body.pagination).toMatchObject({
      page: 1,
      limit: 1,
      total: 2,
    });
  });
});
```

### POST Endpoint Tests

**JavaScript:**

```javascript
// tests/integration/api/auth.test.js
import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../setup";
import { db } from "@/db";
import bcrypt from "bcrypt";

describe("POST /api/auth/register", () => {
  const validUser = {
    email: "newuser@example.com",
    password: "SecurePass1",
    name: "New User",
  };

  it("should register a new user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(validUser)
      .expect(201);

    expect(response.body).toHaveProperty("user");
    expect(response.body.user.email).toBe(validUser.email);
    expect(response.body.user).not.toHaveProperty("password"); // Don't expose password
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");
  });

  it("should reject duplicate email", async () => {
    // Create existing user
    await db("users").insert({
      email: validUser.email,
      password: await bcrypt.hash("password", 10),
      name: "Existing User",
    });

    const response = await request(app)
      .post("/api/auth/register")
      .send(validUser)
      .expect(409); // Conflict

    expect(response.body.error).toContain("already registered");
  });

  it("should validate required fields", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com" }) // Missing password and name
      .expect(400);

    expect(response.body.errors).toBeDefined();
  });

  it("should reject weak passwords", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, password: "123" }) // Too weak
      .expect(400);

    expect(response.body.errors).toBeDefined();
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    // Create test user
    await db("users").insert({
      email: "user@example.com",
      password: await bcrypt.hash("SecurePass1", 10),
      name: "Test User",
    });
  });

  it("should login with valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "user@example.com",
        password: "SecurePass1",
      })
      .expect(200);

    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");
    expect(response.body.user.email).toBe("user@example.com");
  });

  it("should reject invalid password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "user@example.com",
        password: "wrongpassword",
      })
      .expect(401);

    expect(response.body.error).toBe("Invalid credentials");
  });

  it("should reject non-existent user", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "nonexistent@example.com",
        password: "anypassword",
      })
      .expect(401);

    expect(response.body.error).toBe("Invalid credentials");
  });
});
```

### Authenticated Endpoint Tests

**JavaScript:**

```javascript
// tests/integration/api/protected-routes.test.js
import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../setup";
import { db } from "@/db";
import { authService } from "@/services/auth.service";

describe("Protected Routes", () => {
  let testUser;
  let accessToken;
  let employerUser;
  let employerToken;

  beforeEach(async () => {
    // Create candidate user
    const candidate = await db("users")
      .insert({
        email: "candidate@test.com",
        password: "hashed",
        name: "Test Candidate",
        role: "candidate",
      })
      .returning("*");
    testUser = candidate[0];
    accessToken = authService.generateAccessToken(testUser);

    // Create employer user
    const employer = await db("users")
      .insert({
        email: "employer@test.com",
        password: "hashed",
        name: "Test Employer",
        role: "employer",
      })
      .returning("*");
    employerUser = employer[0];
    employerToken = authService.generateAccessToken(employerUser);
  });

  describe("GET /api/users/profile", () => {
    it("should return user profile with valid token", async () => {
      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.user.email).toBe("candidate@test.com");
    });

    it("should reject request without token", async () => {
      await request(app).get("/api/users/profile").expect(401);
    });

    it("should reject invalid token", async () => {
      await request(app)
        .get("/api/users/profile")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
    });

    it("should reject expired token", async () => {
      // Create token that expired 1 hour ago
      const expiredToken = authService.generateAccessToken(testUser, "-1h");

      await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe("POST /api/jobs (Employer Only)", () => {
    const newJob = {
      title: "Full Stack Developer",
      company: "TechCorp",
      description: "Great opportunity",
      location: "New York",
      type: "full-time",
      salaryMin: 80000,
      salaryMax: 120000,
    };

    it("should allow employer to create job", async () => {
      const response = await request(app)
        .post("/api/jobs")
        .set("Authorization", `Bearer ${employerToken}`)
        .send(newJob)
        .expect(201);

      expect(response.body.job.title).toBe(newJob.title);
      expect(response.body.job.employerId).toBe(employerUser.id);
    });

    it("should reject candidate trying to create job", async () => {
      await request(app)
        .post("/api/jobs")
        .set("Authorization", `Bearer ${accessToken}`) // Candidate token
        .send(newJob)
        .expect(403); // Forbidden
    });

    it("should reject unauthenticated request", async () => {
      await request(app).post("/api/jobs").send(newJob).expect(401);
    });
  });
});
```

**TypeScript:**

```typescript
// tests/integration/api/protected-routes.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../setup";
import { db } from "@/db";
import { authService } from "@/services/auth.service";

interface User {
  id: string;
  email: string;
  name: string;
  role: "candidate" | "employer" | "admin";
}

describe("Protected Routes", () => {
  let testUser: User;
  let accessToken: string;
  let employerUser: User;
  let employerToken: string;

  beforeEach(async () => {
    // Create candidate user
    const [candidate] = await db("users")
      .insert({
        email: "candidate@test.com",
        password: "hashed",
        name: "Test Candidate",
        role: "candidate",
      })
      .returning("*");
    testUser = candidate;
    accessToken = authService.generateAccessToken(testUser);

    // Create employer user
    const [employer] = await db("users")
      .insert({
        email: "employer@test.com",
        password: "hashed",
        name: "Test Employer",
        role: "employer",
      })
      .returning("*");
    employerUser = employer;
    employerToken = authService.generateAccessToken(employerUser);
  });

  describe("GET /api/users/profile", () => {
    it("should return user profile with valid token", async () => {
      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.user.email).toBe("candidate@test.com");
    });

    it("should reject request without token", async () => {
      await request(app).get("/api/users/profile").expect(401);
    });
  });
});
```

### Testing Error Responses

**JavaScript:**

```javascript
// tests/integration/api/error-handling.test.js
import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../setup";

describe("Error Handling", () => {
  describe("Validation Errors", () => {
    it("should return 400 for invalid JSON body", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .set("Content-Type", "application/json")
        .send("{ invalid json }")
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it("should return 400 with validation details", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "not-an-email",
          password: "123",
          name: "",
        })
        .expect(400);

      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Not Found Errors", () => {
    it("should return 404 for unknown routes", async () => {
      const response = await request(app)
        .get("/api/nonexistent-endpoint")
        .expect(404);

      expect(response.body.error).toBe("Not Found");
    });

    it("should return 404 for missing resources", async () => {
      const response = await request(app)
        .get("/api/jobs/00000000-0000-0000-0000-000000000000")
        .expect(404);

      expect(response.body.error).toBeDefined();
    });
  });

  describe("Rate Limiting", () => {
    it("should return 429 when rate limit exceeded", async () => {
      // Make many rapid requests
      const requests = Array(101)
        .fill(null)
        .map(() => request(app).get("/api/jobs"));

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter((r) => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});
```

### Testing File Uploads

**JavaScript:**

```javascript
// tests/integration/api/file-upload.test.js
import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../setup";
import { db } from "@/db";
import { authService } from "@/services/auth.service";
import path from "path";
import fs from "fs";

describe("File Uploads", () => {
  let candidateToken;
  let testJob;

  beforeEach(async () => {
    // Create candidate
    const [candidate] = await db("users")
      .insert({
        email: "candidate@test.com",
        password: "hashed",
        name: "Test Candidate",
        role: "candidate",
      })
      .returning("*");
    candidateToken = authService.generateAccessToken(candidate);

    // Create employer and job
    const [employer] = await db("users")
      .insert({
        email: "employer@test.com",
        password: "hashed",
        name: "Test Employer",
        role: "employer",
      })
      .returning("*");

    const [job] = await db("jobs")
      .insert({
        title: "Developer",
        company: "Tech Co",
        location: "Remote",
        employer_id: employer.id,
        status: "published",
      })
      .returning("*");
    testJob = job;
  });

  describe("POST /api/applications/:jobId/apply", () => {
    it("should upload resume when applying", async () => {
      // Create a test PDF file
      const testFilePath = path.join(__dirname, "../fixtures/test-resume.pdf");

      const response = await request(app)
        .post(`/api/applications/${testJob.id}/apply`)
        .set("Authorization", `Bearer ${candidateToken}`)
        .field("coverLetter", "I am very interested in this position.")
        .attach("resume", testFilePath)
        .expect(201);

      expect(response.body.application).toHaveProperty("resumeUrl");
      expect(response.body.application.status).toBe("pending");
    });

    it("should reject non-PDF files", async () => {
      const textFilePath = path.join(__dirname, "../fixtures/test.txt");

      await request(app)
        .post(`/api/applications/${testJob.id}/apply`)
        .set("Authorization", `Bearer ${candidateToken}`)
        .field("coverLetter", "Cover letter text")
        .attach("resume", textFilePath)
        .expect(400);
    });

    it("should reject files over size limit", async () => {
      const largeFilePath = path.join(__dirname, "../fixtures/large-file.pdf");

      await request(app)
        .post(`/api/applications/${testJob.id}/apply`)
        .set("Authorization", `Bearer ${candidateToken}`)
        .attach("resume", largeFilePath)
        .expect(400);
    });
  });
});
```

---

## 🎓 Mini-Tutorial: Set Up Integration Tests with Test Database

Let's create a complete integration test setup for DevJobs Pro.

### Step 1: Configure Test Environment

**tests/integration/setup.ts:**

```typescript
import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { app } from "@/app";
import { db } from "@/db";
import { authService } from "@/services/auth.service";
import bcrypt from "bcrypt";

// Export app for tests
export { app };

// Test data helpers
export interface TestContext {
  candidateUser: any;
  candidateToken: string;
  employerUser: any;
  employerToken: string;
  adminUser: any;
  adminToken: string;
}

let context: TestContext;

export function getTestContext(): TestContext {
  return context;
}

// Create common test users
async function createTestUsers(): Promise<TestContext> {
  const password = await bcrypt.hash("TestPass123", 10);

  const [candidate] = await db("users")
    .insert({
      email: "candidate@test.com",
      password,
      name: "Test Candidate",
      role: "candidate",
    })
    .returning("*");

  const [employer] = await db("users")
    .insert({
      email: "employer@test.com",
      password,
      name: "Test Employer",
      role: "employer",
    })
    .returning("*");

  const [admin] = await db("users")
    .insert({
      email: "admin@test.com",
      password,
      name: "Test Admin",
      role: "admin",
    })
    .returning("*");

  return {
    candidateUser: candidate,
    candidateToken: authService.generateAccessToken(candidate),
    employerUser: employer,
    employerToken: authService.generateAccessToken(employer),
    adminUser: admin,
    adminToken: authService.generateAccessToken(admin),
  };
}

// Clear all tables
async function clearDatabase(): Promise<void> {
  await db.raw("TRUNCATE applications, jobs, users CASCADE");
}

// Global setup
beforeAll(async () => {
  // Ensure test database connection
  console.log("🔌 Connecting to test database...");

  // Run migrations if needed
  await db.migrate.latest();
  console.log("✅ Test database ready");
});

// Before each test file
beforeEach(async () => {
  await clearDatabase();
  context = await createTestUsers();
});

// Global teardown
afterAll(async () => {
  await db.destroy();
  console.log("🔌 Test database disconnected");
});
```

### Step 2: Create Test Utilities

**tests/utils/auth.ts:**

```typescript
import request from "supertest";
import { app } from "@/app";

export async function loginAsCandidate(): Promise<string> {
  const response = await request(app).post("/api/auth/login").send({
    email: "candidate@test.com",
    password: "TestPass123",
  });

  return response.body.accessToken;
}

export async function loginAsEmployer(): Promise<string> {
  const response = await request(app).post("/api/auth/login").send({
    email: "employer@test.com",
    password: "TestPass123",
  });

  return response.body.accessToken;
}

export async function registerNewUser(userData: {
  email: string;
  password: string;
  name: string;
}): Promise<{ user: any; accessToken: string }> {
  const response = await request(app).post("/api/auth/register").send(userData);

  return {
    user: response.body.user,
    accessToken: response.body.accessToken,
  };
}
```

### Step 3: Create Test Data Factories

**tests/factories/index.ts:**

```typescript
import { db } from "@/db";

let idCounter = 1;

export async function createJobInDb(
  employerId: string,
  overrides: Partial<any> = {},
): Promise<any> {
  const [job] = await db("jobs")
    .insert({
      title: `Test Job ${idCounter++}`,
      description: "A great opportunity",
      company: "Test Company",
      location: "New York",
      type: "full-time",
      salary_min: 80000,
      salary_max: 120000,
      employer_id: employerId,
      status: "published",
      ...overrides,
    })
    .returning("*");

  return job;
}

export async function createApplicationInDb(
  jobId: string,
  candidateId: string,
  overrides: Partial<any> = {},
): Promise<any> {
  const [application] = await db("applications")
    .insert({
      job_id: jobId,
      candidate_id: candidateId,
      status: "pending",
      cover_letter: "I am interested in this position.",
      ...overrides,
    })
    .returning("*");

  return application;
}

export function resetFactories(): void {
  idCounter = 1;
}
```

### Step 4: Write Complete Test Suite

**tests/integration/api/jobs.test.ts:**

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, getTestContext } from "../setup";
import { createJobInDb, resetFactories } from "../../factories";

describe("Jobs API", () => {
  beforeEach(() => {
    resetFactories();
  });

  describe("GET /api/jobs", () => {
    it("should return empty list when no jobs exist", async () => {
      const response = await request(app).get("/api/jobs").expect(200);

      expect(response.body.jobs).toHaveLength(0);
    });

    it("should return list of published jobs", async () => {
      const { employerUser } = getTestContext();

      await createJobInDb(employerUser.id, { title: "Frontend Dev" });
      await createJobInDb(employerUser.id, { title: "Backend Dev" });
      await createJobInDb(employerUser.id, {
        title: "Draft Job",
        status: "draft",
      });

      const response = await request(app).get("/api/jobs").expect(200);

      expect(response.body.jobs).toHaveLength(2); // Only published
    });

    it("should filter jobs by search term", async () => {
      const { employerUser } = getTestContext();

      await createJobInDb(employerUser.id, { title: "React Developer" });
      await createJobInDb(employerUser.id, { title: "Python Engineer" });

      const response = await request(app)
        .get("/api/jobs?search=React")
        .expect(200);

      expect(response.body.jobs).toHaveLength(1);
      expect(response.body.jobs[0].title).toContain("React");
    });
  });

  describe("POST /api/jobs", () => {
    const validJob = {
      title: "Senior Developer",
      description: "Lead our development team",
      company: "TechCorp",
      location: "San Francisco",
      type: "full-time",
      salaryMin: 120000,
      salaryMax: 180000,
      requirements: ["5+ years experience", "TypeScript"],
    };

    it("should create job when authenticated as employer", async () => {
      const { employerToken } = getTestContext();

      const response = await request(app)
        .post("/api/jobs")
        .set("Authorization", `Bearer ${employerToken}`)
        .send(validJob)
        .expect(201);

      expect(response.body.job).toMatchObject({
        title: validJob.title,
        status: "draft", // New jobs start as draft
      });
    });

    it("should reject when authenticated as candidate", async () => {
      const { candidateToken } = getTestContext();

      await request(app)
        .post("/api/jobs")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send(validJob)
        .expect(403);
    });

    it("should validate required fields", async () => {
      const { employerToken } = getTestContext();

      const response = await request(app)
        .post("/api/jobs")
        .set("Authorization", `Bearer ${employerToken}`)
        .send({ title: "Missing Fields" })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe("PUT /api/jobs/:id", () => {
    it("should update own job", async () => {
      const { employerUser, employerToken } = getTestContext();
      const job = await createJobInDb(employerUser.id);

      const response = await request(app)
        .put(`/api/jobs/${job.id}`)
        .set("Authorization", `Bearer ${employerToken}`)
        .send({ title: "Updated Title" })
        .expect(200);

      expect(response.body.job.title).toBe("Updated Title");
    });

    it("should not update another employer's job", async () => {
      const { employerUser, candidateToken } = getTestContext();
      const job = await createJobInDb(employerUser.id);

      // Try with a different user's token
      await request(app)
        .put(`/api/jobs/${job.id}`)
        .set("Authorization", `Bearer ${candidateToken}`)
        .expect(403);
    });
  });

  describe("DELETE /api/jobs/:id", () => {
    it("should delete own job", async () => {
      const { employerUser, employerToken } = getTestContext();
      const job = await createJobInDb(employerUser.id);

      await request(app)
        .delete(`/api/jobs/${job.id}`)
        .set("Authorization", `Bearer ${employerToken}`)
        .expect(204);

      // Verify deleted
      await request(app).get(`/api/jobs/${job.id}`).expect(404);
    });
  });
});
```

---

## 🏗️ Practice: DevJobs Pro API Tests

Create comprehensive integration tests for the DevJobs Pro API.

### Task 1: Auth Endpoints

Test the complete authentication flow:

```typescript
// tests/integration/api/auth.test.ts

describe("Auth API", () => {
  describe("POST /api/auth/register", () => {
    // - Valid registration
    // - Duplicate email rejection
    // - Validation errors
    // - Password strength requirements
  });

  describe("POST /api/auth/login", () => {
    // - Valid login
    // - Invalid password
    // - Non-existent user
    // - Missing fields
  });

  describe("POST /api/auth/refresh", () => {
    // - Valid refresh token
    // - Expired refresh token
    // - Invalid refresh token
    // - Missing token
  });

  describe("POST /api/auth/logout", () => {
    // - Successful logout
    // - Token invalidation
  });
});
```

### Task 2: Job CRUD with Auth

Test job operations with proper authentication:

```typescript
// tests/integration/api/jobs-crud.test.ts

describe("Jobs CRUD", () => {
  // Test as employer
  describe("Employer Operations", () => {
    // - Create job
    // - Update own job
    // - Delete own job
    // - Publish job
  });

  // Test as candidate
  describe("Candidate Access", () => {
    // - View published jobs
    // - Cannot create jobs
    // - Cannot update/delete any jobs
  });

  // Test as admin
  describe("Admin Operations", () => {
    // - Can update any job
    // - Can delete any job
    // - Can view all jobs (including drafts)
  });
});
```

### Task 3: Application Flow

Test the complete application process:

```typescript
// tests/integration/api/applications.test.ts

describe("Application Flow", () => {
  describe("Applying to Jobs", () => {
    // - Candidate can apply
    // - Cannot apply twice to same job
    // - Cannot apply to closed job
    // - File upload works
  });

  describe("Application Management", () => {
    // - Employer can view applications
    // - Employer can update status
    // - Candidate can view their applications
    // - Candidate cannot view others' applications
  });
});
```

---

## 💡 Pro Tips vs Junior Traps

| Pro Tip                                                                                 | Junior Trap                                   |
| --------------------------------------------------------------------------------------- | --------------------------------------------- |
| **Isolate test database** - Use separate DB for tests with same schema                  | Using production or dev database for tests    |
| **Reset state before each test** - Clean slate ensures independence                     | Tests that depend on data from previous tests |
| **Test authentication flows completely** - Token expiry, refresh, invalid tokens        | Only testing happy path authentication        |
| **Use factories for test data** - Consistent, reusable data creation                    | Hardcoded data scattered across test files    |
| **Test error responses thoroughly** - Status codes, error messages, validation errors   | Only testing successful responses             |
| **Keep integration tests focused** - Test one flow per test                             | Giant tests that test everything at once      |
| **Use descriptive test names** - "should return 403 when candidate tries to delete job" | "test auth" or "test error"                   |

---

## 🐛 5-Minute Debugger

### Problem: "EADDRINUSE" port conflict

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Quick Fixes:**

1. **Don't start server in tests:**

```typescript
// ❌ Wrong - starts actual server
import { server } from "@/server";

// ✅ Correct - use app without listening
import { app } from "@/app";
// Supertest handles the server
request(app).get("/api/jobs");
```

2. **Kill existing process:**

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

3. **Use random ports in test config:**

```typescript
// app.ts - export app without listening
export { app };

// server.ts - only listen when not in test
if (process.env.NODE_ENV !== "test") {
  app.listen(3000);
}
```

---

### Problem: Database state pollution

```
Test 2 fails because Test 1's data is still there
```

**Quick Fixes:**

1. **Clear tables in beforeEach:**

```typescript
beforeEach(async () => {
  // Clear in reverse dependency order
  await db.raw("TRUNCATE applications, jobs, users CASCADE");
});
```

2. **Use transactions and rollback:**

```typescript
beforeEach(async () => {
  await db.raw("BEGIN");
});

afterEach(async () => {
  await db.raw("ROLLBACK");
});
```

3. **Use separate test schemas:**

```typescript
// Create isolated schema per test file
beforeAll(async () => {
  await db.raw(`CREATE SCHEMA IF NOT EXISTS test_${process.pid}`);
  await db.raw(`SET search_path TO test_${process.pid}`);
});
```

---

### Problem: Auth token handling in tests

```
401 Unauthorized - but I'm passing the token!
```

**Quick Fixes:**

1. **Check Bearer prefix:**

```typescript
// ❌ Missing "Bearer "
.set('Authorization', token)

// ✅ Correct format
.set('Authorization', `Bearer ${token}`)
```

2. **Generate token after user creation:**

```typescript
// ❌ Token created before user exists
const token = generateToken({ id: "123" });
await createUser({ id: "123" }); // Too late

// ✅ Create user first, then token
const user = await createUser();
const token = generateToken(user);
```

3. **Check token isn't expired:**

```typescript
// Use longer expiry for tests
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }, // Not '15m' which might expire during slow tests
);
```

---

## ✅ Definition of Done Checklist

Before moving to the next lesson, verify:

- [ ] **Supertest configured** and working with Express app
- [ ] **Test database setup** with migrations and cleanup
- [ ] **Auth tests complete** (register, login, refresh, protected routes)
- [ ] **Job CRUD tests complete** with role-based access control
- [ ] **Application flow tests** (apply, view, update status)
- [ ] **Error handling tests** (validation, 404, 403, 401)
- [ ] **File upload tests** working with test fixtures
- [ ] **All integration tests pass** - run `npm test run tests/integration`

### Quick Verification

```bash
# Run integration tests
npm test run tests/integration

# Expected output:
# ✓ tests/integration/api/auth.test.ts (12 tests)
# ✓ tests/integration/api/jobs.test.ts (15 tests)
# ✓ tests/integration/api/applications.test.ts (8 tests)
# Test Files  3 passed (3)
# Tests  35 passed (35)
```

---

## 🔗 Navigation

| Previous                                                           | Home                          | Next                                                         |
| ------------------------------------------------------------------ | ----------------------------- | ------------------------------------------------------------ |
| [← Lesson 2: Unit Testing Services](./02-unit-testing-services.md) | [Module 13 Home](./README.md) | [Lesson 4: DevJobs Test Suite →](./04-devjobs-test-suite.md) |

---

## 📚 Additional Resources

- [Supertest GitHub Repository](https://github.com/ladjs/supertest)
- [Testing Node.js APIs](https://www.toptal.com/nodejs/nodejs-testing-best-practices)
- [Database Testing Patterns](https://blog.bitsrc.io/testing-node-js-applications-with-a-database-5b6e8e3d573b)
- [Integration Testing Best Practices](https://kentcdodds.com/blog/write-tests)
