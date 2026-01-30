# Lesson 2: Callbacks & Promises

> **Module 03: TypeScript + Async Patterns**
> Understanding the async evolution—from callback hell to elegant Promises

---

## 🎯 The Hook

**What happens when you need to read a file, then query a database, then call an API, then send an email—all in sequence?**

In early Node.js, you'd nest callbacks inside callbacks inside callbacks... the infamous **"callback hell"** or "pyramid of doom." Your code would drift further and further to the right, becoming impossible to read and maintain.

Promises changed everything. They let you chain async operations in a flat, readable way. Understanding this evolution—from callbacks to Promises—is essential because:

1. Many Node.js APIs still use callbacks (including core modules)
2. You'll encounter legacy codebases with callback patterns
3. Promises are the foundation of async/await (next lesson)
4. Knowing both helps you choose the right pattern

---

## 📚 Core Concepts

### The Callback Pattern

A **callback** is a function passed as an argument to another function, to be executed later when an operation completes.

```typescript
// Node.js callback convention: error-first callbacks
function doSomethingAsync(
  input: string,
  callback: (error: Error | null, result?: string) => void,
): void {
  // ... async work
  if (somethingWentWrong) {
    callback(new Error("Operation failed"));
  } else {
    callback(null, "Success!");
  }
}
```

**The Error-First Pattern:**

- First argument is always the error (or `null` if success)
- Subsequent arguments are the results
- You MUST check for errors before using results

### The Callback Hell Problem

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Callback Hell Visualization                       │
└─────────────────────────────────────────────────────────────────────┘

readFile("user.json", (err, user) => {
    │
    └──▶ getDatabase((err, db) => {
             │
             └──▶ db.findUser(user.id, (err, profile) => {
                      │
                      └──▶ fetchPermissions(profile, (err, perms) => {
                               │
                               └──▶ sendNotification(user, (err, result) => {
                                        │
                                        └──▶ logActivity(result, (err) => {
                                                 // Finally done!
                                                 // But good luck reading this...
                                             });
                                    });
                           });
                  });
         });
});

Problems:
─────────
• Deep nesting makes code hard to read
• Error handling is repetitive and easy to forget
• Adding/removing steps is error-prone
• Testing individual steps is difficult
• No clear flow of data
```

### Promise Fundamentals

A **Promise** is an object representing the eventual completion (or failure) of an async operation.

```typescript
const promise = new Promise<string>((resolve, reject) => {
  // Async work here
  if (success) {
    resolve("Result data");
  } else {
    reject(new Error("Something failed"));
  }
});
```

### Promise States

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Promise State Machine                          │
└─────────────────────────────────────────────────────────────────────┘

                         ┌─────────────┐
                         │             │
              ┌──────────│   PENDING   │──────────┐
              │          │             │          │
              │          └─────────────┘          │
              │                                   │
         resolve(value)                      reject(error)
              │                                   │
              ▼                                   ▼
    ┌─────────────────┐                 ┌─────────────────┐
    │                 │                 │                 │
    │    FULFILLED    │                 │    REJECTED     │
    │                 │                 │                 │
    │  Has a VALUE    │                 │  Has a REASON   │
    │                 │                 │                 │
    └─────────────────┘                 └─────────────────┘

Key Rules:
──────────
• A Promise starts in PENDING state
• Once settled (fulfilled/rejected), it CANNOT change
• .then() handles fulfillment
• .catch() handles rejection
• .finally() runs regardless of outcome
```

### Promise Chaining vs Callback Nesting

```
┌─────────────────────────────────────────────────────────────────────┐
│              Callback Nesting vs Promise Chaining                    │
└─────────────────────────────────────────────────────────────────────┘

CALLBACKS (Nested):                  PROMISES (Chained):
────────────────────                 ────────────────────

step1(input, (err, a) => {           step1(input)
  if (err) return handleError(err);    .then(a => step2(a))
  step2(a, (err, b) => {               .then(b => step3(b))
    if (err) return handleError(err);  .then(c => step4(c))
    step3(b, (err, c) => {             .then(d => step5(d))
      if (err) return handleError(err);.catch(handleError)
      step4(c, (err, d) => {           .finally(cleanup);
        if (err) return handleError(err);
        step5(d, (err, result) => {
          if (err) return handleError(err);
          // Use result
          cleanup();
        });
      });
    });
  });
});

Benefits of Promises:
─────────────────────
✓ Flat, linear structure
✓ Single error handler for entire chain
✓ Each step clearly follows the previous
✓ Easy to add/remove steps
✓ Returns a value (can be stored, passed, composed)
```

### Promise Methods: then, catch, finally

```typescript
asyncOperation()
  .then((result) => {
    // Called when Promise FULFILLS
    // Return value becomes next Promise's value
    return processResult(result);
  })
  .then((processed) => {
    // Chained - receives previous return value
    return anotherAsyncOp(processed);
  })
  .catch((error) => {
    // Called if ANY previous step REJECTS
    // Also catches thrown errors!
    console.error("Something failed:", error.message);
    // Can return a recovery value or re-throw
    throw error; // Re-throw to propagate
  })
  .finally(() => {
    // ALWAYS runs, success or failure
    // No arguments, no return value affects chain
    cleanup();
  });
```

---

## 💻 Code Examples

### Example 1: Callback-Based File Reading

```typescript
// src/examples/callbacks.ts
import { readFile, writeFile } from "node:fs";

interface UserData {
  id: string;
  name: string;
  email: string;
}

// Error-first callback pattern
function loadUserData(
  filename: string,
  callback: (error: Error | null, data?: UserData) => void,
): void {
  readFile(filename, "utf-8", (err, content) => {
    if (err) {
      callback(new Error(`Failed to read file: ${err.message}`));
      return;
    }

    try {
      const data = JSON.parse(content) as UserData;
      callback(null, data);
    } catch (parseError) {
      callback(
        new Error(`Failed to parse JSON: ${(parseError as Error).message}`),
      );
    }
  });
}

// Usage - nested callbacks
loadUserData("user.json", (err, user) => {
  if (err) {
    console.error(err.message);
    return;
  }

  console.log("User loaded:", user?.name);

  // If we need to do more async work... nesting begins
  loadUserData("profile.json", (err, profile) => {
    if (err) {
      console.error(err.message);
      return;
    }

    // And more nesting...
    console.log("Profile loaded for:", profile?.name);
  });
});
```

### Example 2: Converting to Promises

```typescript
// src/examples/promises.ts
import { readFile, writeFile } from "node:fs/promises";

interface UserData {
  id: string;
  name: string;
  email: string;
}

// Promise-based version
async function loadUserData(filename: string): Promise<UserData> {
  const content = await readFile(filename, "utf-8");
  return JSON.parse(content) as UserData;
}

// Or manually wrapping a callback API
function loadUserDataPromise(filename: string): Promise<UserData> {
  return new Promise((resolve, reject) => {
    // Using the callback version from fs (not fs/promises)
    require("fs").readFile(
      filename,
      "utf-8",
      (err: Error | null, content: string) => {
        if (err) {
          reject(new Error(`Failed to read file: ${err.message}`));
          return;
        }

        try {
          const data = JSON.parse(content) as UserData;
          resolve(data);
        } catch (parseError) {
          reject(
            new Error(`Failed to parse JSON: ${(parseError as Error).message}`),
          );
        }
      },
    );
  });
}

// Usage - flat chain
loadUserData("user.json")
  .then((user) => {
    console.log("User loaded:", user.name);
    return loadUserData("profile.json");
  })
  .then((profile) => {
    console.log("Profile loaded:", profile.name);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
```

### Example 3: Promise.all - Parallel Execution

```typescript
// src/services/job.service.ts
import { readFile } from "node:fs/promises";

interface Job {
  id: string;
  title: string;
  companyId: string;
}

interface Company {
  id: string;
  name: string;
}

interface JobWithCompany extends Job {
  company: Company;
}

// Fetch multiple resources in parallel
async function fetchJobsAndCompanies(): Promise<{
  jobs: Job[];
  companies: Company[];
}> {
  // Both requests start simultaneously!
  const [jobsData, companiesData] = await Promise.all([
    readFile("data/jobs.json", "utf-8"),
    readFile("data/companies.json", "utf-8"),
  ]);

  return {
    jobs: JSON.parse(jobsData) as Job[],
    companies: JSON.parse(companiesData) as Company[],
  };
}

// Combine data after parallel fetch
async function getJobsWithCompanies(): Promise<JobWithCompany[]> {
  const { jobs, companies } = await fetchJobsAndCompanies();

  const companyMap = new Map(companies.map((c) => [c.id, c]));

  return jobs.map((job) => ({
    ...job,
    company: companyMap.get(job.companyId)!,
  }));
}

// Promise.all with error handling
async function fetchMultipleJobs(jobIds: string[]): Promise<Job[]> {
  const promises = jobIds.map((id) =>
    readFile(`data/jobs/${id}.json`, "utf-8").then(
      (data) => JSON.parse(data) as Job,
    ),
  );

  // If ANY promise rejects, Promise.all rejects immediately
  try {
    return await Promise.all(promises);
  } catch (error) {
    console.error("Failed to fetch one or more jobs:", error);
    throw error;
  }
}
```

### Example 4: Promise.race & Promise.allSettled

```typescript
// src/utils/async-utils.ts

// Promise.race - first to settle wins
async function fetchWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Request timed out")), timeoutMs);
  });

  // Whichever resolves/rejects first wins
  return Promise.race([promise, timeoutPromise]);
}

// Usage
const data = await fetchWithTimeout(
  fetch("https://api.example.com/jobs"),
  5000, // 5 second timeout
);

// Promise.allSettled - wait for all, regardless of success/failure
interface JobFetchResult {
  jobId: string;
  status: "success" | "failed";
  data?: Job;
  error?: string;
}

async function fetchJobsSafely(jobIds: string[]): Promise<JobFetchResult[]> {
  const promises = jobIds.map((id) =>
    readFile(`data/jobs/${id}.json`, "utf-8").then(
      (data) => JSON.parse(data) as Job,
    ),
  );

  const results = await Promise.allSettled(promises);

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return {
        jobId: jobIds[index],
        status: "success" as const,
        data: result.value,
      };
    } else {
      return {
        jobId: jobIds[index],
        status: "failed" as const,
        error: result.reason.message,
      };
    }
  });
}

// Now you get results for ALL jobs, even if some failed
const results = await fetchJobsSafely(["job1", "job2", "job3"]);
// [
//   { jobId: "job1", status: "success", data: {...} },
//   { jobId: "job2", status: "failed", error: "File not found" },
//   { jobId: "job3", status: "success", data: {...} }
// ]
```

---

## 🛠️ Mini-Tutorial: Convert Nested Callbacks to Promise Chain

Let's transform a realistic callback hell scenario into clean Promise code.

### The Original Callback Code

```typescript
// src/legacy/user-signup-callbacks.ts
import { readFile, writeFile } from "node:fs";
import { randomUUID } from "node:crypto";

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface UsersDatabase {
  users: User[];
}

// Callback hell example: User signup flow
function signupUser(
  email: string,
  name: string,
  callback: (error: Error | null, user?: User) => void,
): void {
  // Step 1: Read existing users
  readFile("data/users.json", "utf-8", (err, data) => {
    if (err) {
      callback(new Error(`Failed to read users: ${err.message}`));
      return;
    }

    let users: UsersDatabase;
    try {
      users = JSON.parse(data);
    } catch (e) {
      callback(new Error("Invalid users database"));
      return;
    }

    // Step 2: Check if email exists
    const existingUser = users.users.find((u) => u.email === email);
    if (existingUser) {
      callback(new Error("Email already registered"));
      return;
    }

    // Step 3: Create new user
    const newUser: User = {
      id: randomUUID(),
      email,
      name,
      createdAt: new Date().toISOString(),
    };

    users.users.push(newUser);

    // Step 4: Save updated users
    writeFile("data/users.json", JSON.stringify(users, null, 2), (err) => {
      if (err) {
        callback(new Error(`Failed to save user: ${err.message}`));
        return;
      }

      // Step 5: Write welcome log
      const logEntry = `${new Date().toISOString()} - New signup: ${email}\n`;
      writeFile("data/signups.log", logEntry, { flag: "a" }, (err) => {
        if (err) {
          // Non-critical error, log but continue
          console.warn("Failed to write signup log:", err.message);
        }

        // Finally return the new user
        callback(null, newUser);
      });
    });
  });
}

// Usage
signupUser("alice@example.com", "Alice", (err, user) => {
  if (err) {
    console.error("Signup failed:", err.message);
    return;
  }
  console.log("User created:", user);
});
```

### Step-by-Step Promise Conversion

```typescript
// src/services/user-signup-promises.ts
import { readFile, writeFile, appendFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface UsersDatabase {
  users: User[];
}

// Helper: Read and parse users database
async function readUsersDatabase(): Promise<UsersDatabase> {
  const data = await readFile("data/users.json", "utf-8");
  return JSON.parse(data) as UsersDatabase;
}

// Helper: Save users database
async function saveUsersDatabase(db: UsersDatabase): Promise<void> {
  await writeFile("data/users.json", JSON.stringify(db, null, 2));
}

// Helper: Log signup (non-critical)
async function logSignup(email: string): Promise<void> {
  const logEntry = `${new Date().toISOString()} - New signup: ${email}\n`;
  try {
    await appendFile("data/signups.log", logEntry);
  } catch (error) {
    // Non-critical, just warn
    console.warn("Failed to write signup log:", (error as Error).message);
  }
}

// Main function: Clean Promise-based signup
async function signupUser(email: string, name: string): Promise<User> {
  // Step 1: Read existing users
  const usersDb = await readUsersDatabase();

  // Step 2: Check if email exists
  const existingUser = usersDb.users.find((u) => u.email === email);
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Step 3: Create new user
  const newUser: User = {
    id: randomUUID(),
    email,
    name,
    createdAt: new Date().toISOString(),
  };

  usersDb.users.push(newUser);

  // Step 4: Save updated users
  await saveUsersDatabase(usersDb);

  // Step 5: Log signup (fire and forget, non-blocking)
  logSignup(email); // Note: not awaited intentionally

  return newUser;
}

// Usage with .then/.catch
signupUser("alice@example.com", "Alice")
  .then((user) => {
    console.log("User created:", user);
  })
  .catch((error) => {
    console.error("Signup failed:", error.message);
  });

// Or with async/await (next lesson!)
async function main() {
  try {
    const user = await signupUser("bob@example.com", "Bob");
    console.log("User created:", user);
  } catch (error) {
    console.error("Signup failed:", (error as Error).message);
  }
}
```

### Comparison

| Aspect         | Callbacks                | Promises                       |
| -------------- | ------------------------ | ------------------------------ |
| Error handling | Check in every callback  | Single `.catch()` or try/catch |
| Nesting depth  | Deep pyramid             | Flat chain                     |
| Readability    | Harder to follow         | Linear, clear flow             |
| Composability  | Difficult                | Easy to combine                |
| Return value   | None (must use callback) | Returns Promise                |

---

## 🎯 Practice Challenge

### Challenge: Refactor Job Application System

Convert this callback-based job application system to use Promises:

```typescript
// src/legacy/apply-callbacks.ts

interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  appliedAt: string;
}

// Callback-based implementation to refactor
function applyToJob(
  jobId: string,
  candidateId: string,
  coverLetter: string,
  callback: (error: Error | null, application?: Application) => void,
): void {
  // 1. Verify job exists
  readFile(`data/jobs/${jobId}.json`, "utf-8", (err, jobData) => {
    if (err) {
      callback(new Error("Job not found"));
      return;
    }

    const job = JSON.parse(jobData);
    if (job.status !== "published") {
      callback(new Error("Job is not accepting applications"));
      return;
    }

    // 2. Verify candidate exists
    readFile(`data/users/${candidateId}.json`, "utf-8", (err, userData) => {
      if (err) {
        callback(new Error("Candidate not found"));
        return;
      }

      // 3. Check for duplicate application
      readFile("data/applications.json", "utf-8", (err, appsData) => {
        if (err) {
          callback(new Error("Failed to read applications"));
          return;
        }

        const apps = JSON.parse(appsData);
        const duplicate = apps.find(
          (a: Application) =>
            a.jobId === jobId && a.candidateId === candidateId,
        );

        if (duplicate) {
          callback(new Error("Already applied to this job"));
          return;
        }

        // 4. Create application
        const application: Application = {
          id: randomUUID(),
          jobId,
          candidateId,
          status: "pending",
          appliedAt: new Date().toISOString(),
        };

        apps.push(application);

        // 5. Save applications
        writeFile(
          "data/applications.json",
          JSON.stringify(apps, null, 2),
          (err) => {
            if (err) {
              callback(new Error("Failed to save application"));
              return;
            }

            callback(null, application);
          },
        );
      });
    });
  });
}
```

**Requirements:**

1. Create a Promise-based `applyToJob` function
2. Use helper functions for each step
3. Handle errors appropriately
4. Add TypeScript types throughout
5. Bonus: Use `Promise.all` where possible (e.g., fetch job and candidate in parallel)

<details>
<summary>Click to reveal solution</summary>

```typescript
// src/services/application.service.ts
import { readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

interface Job {
  id: string;
  title: string;
  status: "draft" | "published" | "closed";
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  appliedAt: string;
}

// Helper functions
async function getJob(jobId: string): Promise<Job> {
  try {
    const data = await readFile(`data/jobs/${jobId}.json`, "utf-8");
    return JSON.parse(data) as Job;
  } catch {
    throw new Error("Job not found");
  }
}

async function getUser(userId: string): Promise<User> {
  try {
    const data = await readFile(`data/users/${userId}.json`, "utf-8");
    return JSON.parse(data) as User;
  } catch {
    throw new Error("Candidate not found");
  }
}

async function getApplications(): Promise<Application[]> {
  try {
    const data = await readFile("data/applications.json", "utf-8");
    return JSON.parse(data) as Application[];
  } catch {
    // If file doesn't exist, start with empty array
    return [];
  }
}

async function saveApplications(applications: Application[]): Promise<void> {
  await writeFile(
    "data/applications.json",
    JSON.stringify(applications, null, 2),
  );
}

// Main function: Clean Promise-based job application
async function applyToJob(
  jobId: string,
  candidateId: string,
  coverLetter: string,
): Promise<Application> {
  // Steps 1 & 2: Fetch job and candidate IN PARALLEL
  const [job, candidate] = await Promise.all([
    getJob(jobId),
    getUser(candidateId),
  ]);

  // Validate job status
  if (job.status !== "published") {
    throw new Error("Job is not accepting applications");
  }

  // Step 3: Check for duplicate
  const applications = await getApplications();
  const duplicate = applications.find(
    (app) => app.jobId === jobId && app.candidateId === candidateId,
  );

  if (duplicate) {
    throw new Error("Already applied to this job");
  }

  // Step 4: Create application
  const application: Application = {
    id: randomUUID(),
    jobId,
    candidateId,
    status: "pending",
    appliedAt: new Date().toISOString(),
  };

  // Step 5: Save
  applications.push(application);
  await saveApplications(applications);

  return application;
}

// Usage
applyToJob("job_001", "user_123", "I am excited to apply...")
  .then((app) => console.log("Application submitted:", app.id))
  .catch((err) => console.error("Application failed:", err.message));
```

</details>

---

## 💡 Pro Tips

### 1. Always Handle Promise Rejections

```typescript
// ❌ Bad: Unhandled rejection crashes Node.js
fetchData().then((data) => process(data));

// ✅ Good: Always add .catch()
fetchData()
  .then((data) => process(data))
  .catch((error) => console.error("Failed:", error.message));

// ✅ Better: Use async/await with try/catch
async function main() {
  try {
    const data = await fetchData();
    process(data);
  } catch (error) {
    console.error("Failed:", error);
  }
}
```

### 2. Avoid Unnecessary Promise Constructors

```typescript
// ❌ Bad: Creating Promise when already have one
function getUser(id: string): Promise<User> {
  return new Promise((resolve, reject) => {
    fetch(`/users/${id}`)
      .then((res) => res.json())
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
}

// ✅ Good: Just return the Promise
function getUser(id: string): Promise<User> {
  return fetch(`/users/${id}`).then((res) => res.json());
}

// ✅ Better: Use async/await
async function getUser(id: string): Promise<User> {
  const res = await fetch(`/users/${id}`);
  return res.json();
}
```

### 3. Use Promise.all for Independent Operations

```typescript
// ❌ Slow: Sequential when it could be parallel
const user = await getUser(userId);
const jobs = await getJobs();
const companies = await getCompanies();

// ✅ Fast: Parallel execution
const [user, jobs, companies] = await Promise.all([
  getUser(userId),
  getJobs(),
  getCompanies(),
]);
```

### 4. Promise.allSettled for Partial Failures

```typescript
// When you need results even if some fail
const results = await Promise.allSettled([
  fetchUser("user1"),
  fetchUser("user2"), // This might fail
  fetchUser("user3"),
]);

// Process successful results, log failures
results.forEach((result, index) => {
  if (result.status === "fulfilled") {
    console.log(`User ${index + 1}:`, result.value);
  } else {
    console.error(`User ${index + 1} failed:`, result.reason);
  }
});
```

---

## 🔧 5-Minute Debugger

### Problem 1: "Unhandled Promise Rejection" Warning

```
(node:12345) UnhandledPromiseRejectionWarning: Error: Something failed
```

**Cause:** A Promise rejected and there's no `.catch()` or try/catch.

**Find it:**

```typescript
// Look for Promises without error handling
fetchData().then((data) => process(data)); // Missing .catch()!

async function doWork() {
  const data = await fetchData(); // Might throw, no try/catch!
}
doWork(); // Called without .catch()!
```

**Fix it:**

```typescript
// Option 1: Add .catch()
fetchData()
  .then((data) => process(data))
  .catch((err) => console.error(err));

// Option 2: Wrap in try/catch
async function doWork() {
  try {
    const data = await fetchData();
    process(data);
  } catch (error) {
    console.error("Failed:", error);
  }
}

// Option 3: Handle at call site
doWork().catch(console.error);
```

**Global handler (for debugging only):**

```typescript
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
```

---

### Problem 2: Promise Execution Order Confusion

```typescript
console.log("1");

Promise.resolve().then(() => console.log("2"));

console.log("3");

// Output: 1, 3, 2 — NOT 1, 2, 3!
```

**Understanding the event loop:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Promise Execution Order                           │
└─────────────────────────────────────────────────────────────────────┘

console.log("1");              // 1. Sync - runs immediately
                               │
Promise.resolve()              │
  .then(() => console.log("2")); // Queued to microtask queue
                               │
console.log("3");              // 2. Sync - runs immediately
                               │
// Event loop tick             │
// Microtask queue processed   │
                               ▼
// console.log("2")            // 3. Runs after sync code

Timeline:
─────────
[Sync] log("1") ──▶ [Sync] log("3") ──▶ [Microtask] log("2")
```

**Key insight:** Promise callbacks (`.then()`) always run after the current synchronous code completes, even with `Promise.resolve()`.

---

## ✅ Definition of Done

Before moving to the next lesson, verify:

- [ ] You understand the error-first callback pattern
- [ ] You can identify callback hell and explain why it's problematic
- [ ] You know the three Promise states (pending, fulfilled, rejected)
- [ ] You can convert callback-based code to Promises
- [ ] You understand `.then()`, `.catch()`, and `.finally()`
- [ ] You know when to use `Promise.all` vs `Promise.allSettled`
- [ ] You can handle Promise rejections properly

**Test yourself:**

1. What's wrong with not awaiting a Promise that can reject?
2. When would you use `Promise.race`?
3. What's the Promise constructor anti-pattern?

---

## 🧭 Navigation

| Previous                                                       | Up                                           | Next                                                   |
| -------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------ |
| [← TypeScript Setup & Basics](./01-typescript-setup-basics.md) | [Module 03: TypeScript + Async](./README.md) | [Async/Await Patterns →](./03-async-await-patterns.md) |

---

**Next up:** We'll master async/await—the syntactic sugar that makes async code read like synchronous code. You'll learn when to use sequential vs parallel execution and common patterns for real-world scenarios.
