# Lesson 3: Async/Await Patterns

> **Module 03: TypeScript + Async Patterns**
> Write async code that reads like synchronous code—but runs in parallel

---

## 🎯 The Hook

**What if async code could look like regular, top-to-bottom code?**

Look at this transformation:

```typescript
// Promise chains (good, but verbose)
getUser(id)
  .then((user) => getProfile(user.id))
  .then((profile) => getPermissions(profile.role))
  .then((permissions) => renderDashboard(permissions))
  .catch(handleError);

// Async/await (reads like synchronous code!)
const user = await getUser(id);
const profile = await getProfile(user.id);
const permissions = await getPermissions(profile.role);
renderDashboard(permissions);
```

Async/await is **syntactic sugar** over Promises. It doesn't add new functionality—it makes existing Promise code dramatically easier to read, write, and maintain. Every API endpoint, database query, and file operation in DevJobs Pro will use these patterns.

---

## 📚 Core Concepts

### The async Keyword

The `async` keyword transforms a function to **always return a Promise**:

```typescript
// Without async - returns string
function greet(name: string): string {
  return `Hello, ${name}`;
}

// With async - returns Promise<string>
async function greetAsync(name: string): Promise<string> {
  return `Hello, ${name}`;
}

// These are equivalent:
greetAsync("Alice"); // Returns Promise<string>
Promise.resolve("Hello, Alice"); // Also Promise<string>
```

### The await Keyword

`await` **pauses** the function execution until the Promise settles:

```typescript
async function fetchUserData(userId: string): Promise<User> {
  // Execution pauses here until getUser() resolves
  const user = await getUser(userId);

  // Only runs after user is available
  console.log("Got user:", user.name);

  return user;
}
```

**Important:** `await` can only be used inside `async` functions (or at the top level of ES modules).

### Return Types with Promise<T>

```typescript
// Explicit return type
async function getJob(id: string): Promise<Job> {
  const response = await fetch(`/api/jobs/${id}`);
  return response.json(); // TypeScript infers this returns Job
}

// Return type inference
async function getJobs() {
  const response = await fetch("/api/jobs");
  const jobs: Job[] = await response.json();
  return jobs; // TypeScript infers Promise<Job[]>
}

// Void return
async function logActivity(action: string): Promise<void> {
  await fetch("/api/logs", {
    method: "POST",
    body: JSON.stringify({ action, timestamp: Date.now() }),
  });
  // No return - Promise<void>
}
```

### Execution Flow Comparison

```
┌─────────────────────────────────────────────────────────────────────┐
│            Promise.then vs async/await Execution Flow                │
└─────────────────────────────────────────────────────────────────────┘

PROMISE.THEN (callback-based):
──────────────────────────────

getUser(id)                     │ Returns Promise immediately
  │                             │
  ├──▶ .then(user => {          │ Callback scheduled (not run yet)
  │      return getProfile()    │
  │    })                       │
  │    │                        │
  │    └──▶ .then(profile => {  │ Another callback scheduled
  │          process(profile)   │
  │        })                   │
  │                             │
  └──▶ Control returns HERE     │ Code after chain runs immediately!

console.log("After chain");     // This runs BEFORE callbacks!


ASYNC/AWAIT (linear flow):
──────────────────────────

async function main() {
  │
  │  const user = await getUser(id);    // ⏸️ PAUSE here
  │                    │
  │                    ▼
  │  // Resumes when getUser resolves
  │
  │  const profile = await getProfile(); // ⏸️ PAUSE here
  │                    │
  │                    ▼
  │  // Resumes when getProfile resolves
  │
  │  process(profile);                   // Runs after both complete
  │
  └──▶ console.log("After");             // Runs LAST
}
```

### Parallel vs Sequential Execution

```
┌─────────────────────────────────────────────────────────────────────┐
│              Sequential vs Parallel Async Operations                 │
└─────────────────────────────────────────────────────────────────────┘

SEQUENTIAL (one after another):
───────────────────────────────

const a = await fetchA();  // Takes 1 second
const b = await fetchB();  // Takes 1 second (waits for a)
const c = await fetchC();  // Takes 1 second (waits for b)
// Total: 3 seconds ❌ Slow!

Timeline:
|----fetchA----|----fetchB----|----fetchC----|
0s             1s             2s             3s


PARALLEL (all at once):
───────────────────────

const [a, b, c] = await Promise.all([
  fetchA(),  // Starts immediately
  fetchB(),  // Starts immediately
  fetchC(),  // Starts immediately
]);
// Total: ~1 second ✅ Fast!

Timeline:
|----fetchA----|
|----fetchB----|
|----fetchC----|
0s             1s

RULE OF THUMB:
• Use sequential when each step DEPENDS on the previous
• Use parallel when operations are INDEPENDENT
```

---

## 💻 Code Examples

### Example 1: Sequential Async Operations

When each step depends on the previous result:

```typescript
// src/services/application.service.ts
import { db } from "../db/client.js";

interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: string;
}

interface ApplicationWithDetails extends Application {
  job: Job;
  candidate: User;
  company: Company;
}

// Sequential: Each query depends on the previous
async function getApplicationWithDetails(
  applicationId: string,
): Promise<ApplicationWithDetails> {
  // Step 1: Get the application
  const application = await db.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  // Step 2: Get the job (needs application.jobId)
  const job = await db.job.findUnique({
    where: { id: application.jobId },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  // Step 3: Get the company (needs job.companyId)
  const company = await db.company.findUnique({
    where: { id: job.companyId },
  });

  // Step 4: Get the candidate (needs application.candidateId)
  const candidate = await db.user.findUnique({
    where: { id: application.candidateId },
  });

  return {
    ...application,
    job,
    candidate: candidate!,
    company: company!,
  };
}
```

### Example 2: Parallel Execution with Promise.all

When operations are independent:

```typescript
// src/services/dashboard.service.ts

interface DashboardData {
  user: User;
  recentJobs: Job[];
  applications: Application[];
  notifications: Notification[];
  stats: DashboardStats;
}

// Parallel: All queries are independent
async function getDashboardData(userId: string): Promise<DashboardData> {
  // All five queries start simultaneously!
  const [user, recentJobs, applications, notifications, stats] =
    await Promise.all([
      getUserById(userId),
      getRecentJobs(10),
      getUserApplications(userId),
      getUnreadNotifications(userId),
      getDashboardStats(userId),
    ]);

  return {
    user,
    recentJobs,
    applications,
    notifications,
    stats,
  };
}

// Compare timing:
// Sequential: 5 queries × 50ms each = 250ms
// Parallel:   5 queries running together = ~50ms (5x faster!)
```

### Example 3: Mixed Sequential and Parallel

The real world often needs both:

```typescript
// src/services/job-posting.service.ts

interface JobPostingResult {
  job: Job;
  notifications: NotificationResult[];
}

async function publishJob(jobId: string): Promise<JobPostingResult> {
  // Step 1: Get and validate job (sequential - need job first)
  const job = await db.job.findUnique({ where: { id: jobId } });

  if (!job) {
    throw new Error("Job not found");
  }

  if (job.status === "published") {
    throw new Error("Job is already published");
  }

  // Step 2: Update job status (sequential - need validation first)
  const publishedJob = await db.job.update({
    where: { id: jobId },
    data: {
      status: "published",
      publishedAt: new Date(),
    },
  });

  // Step 3: After publishing, do these in PARALLEL:
  // - Get subscribers who match job criteria
  // - Log the publish event
  // - Update search index
  const [subscribers, _, __] = await Promise.all([
    getMatchingSubscribers(job),
    logJobEvent(jobId, "published"),
    updateSearchIndex(publishedJob),
  ]);

  // Step 4: Send notifications in parallel
  const notifications = await Promise.all(
    subscribers.map((sub) => sendJobNotification(sub.userId, publishedJob)),
  );

  return {
    job: publishedJob,
    notifications,
  };
}
```

### Example 4: Combining Multiple Async Sources

```typescript
// src/services/job-search.service.ts

interface EnrichedJob extends Job {
  company: Company;
  applicationCount: number;
  matchScore?: number;
}

interface SearchResult {
  jobs: EnrichedJob[];
  total: number;
  facets: SearchFacets;
}

async function searchJobs(
  query: string,
  filters: JobFilters,
  userId?: string,
): Promise<SearchResult> {
  // Step 1: Primary search (must complete first)
  const searchResponse = await searchEngine.search({
    index: "jobs",
    query,
    filters,
    limit: 20,
  });

  const jobIds = searchResponse.hits.map((hit) => hit.id);

  // Step 2: Parallel enrichment
  const [jobs, companies, applicationCounts, userPreferences] =
    await Promise.all([
      // Get full job documents
      db.job.findMany({ where: { id: { in: jobIds } } }),
      // Get all relevant companies at once
      db.company.findMany({
        where: { id: { in: searchResponse.hits.map((h) => h.companyId) } },
      }),
      // Get application counts
      db.application.groupBy({
        by: ["jobId"],
        where: { jobId: { in: jobIds } },
        _count: true,
      }),
      // Get user preferences if logged in
      userId ? getUserPreferences(userId) : Promise.resolve(null),
    ]);

  // Step 3: Combine data (synchronous - all data available)
  const companyMap = new Map(companies.map((c) => [c.id, c]));
  const countMap = new Map(applicationCounts.map((c) => [c.jobId, c._count]));

  const enrichedJobs: EnrichedJob[] = jobs.map((job) => ({
    ...job,
    company: companyMap.get(job.companyId)!,
    applicationCount: countMap.get(job.id) ?? 0,
    matchScore: userPreferences
      ? calculateMatchScore(job, userPreferences)
      : undefined,
  }));

  return {
    jobs: enrichedJobs,
    total: searchResponse.total,
    facets: searchResponse.facets,
  };
}
```

---

## 🛠️ Mini-Tutorial: Fetch Multiple API Endpoints and Combine Results

Let's build a realistic data aggregation feature for DevJobs Pro.

### The Scenario

We need to fetch data from multiple sources to build a candidate profile page:

1. User data from our database
2. GitHub profile (if linked)
3. Recent applications
4. Skill assessments

### Implementation

```typescript
// src/services/candidate-profile.service.ts

interface GitHubProfile {
  login: string;
  name: string;
  bio: string;
  publicRepos: number;
  followers: number;
}

interface SkillAssessment {
  skill: string;
  score: number;
  completedAt: Date;
}

interface CandidateProfile {
  user: User;
  github?: GitHubProfile;
  applications: Application[];
  assessments: SkillAssessment[];
  stats: {
    totalApplications: number;
    interviewRate: number;
    topSkills: string[];
  };
}

// Helper: Fetch GitHub profile with timeout
async function fetchGitHubProfile(
  username: string,
): Promise<GitHubProfile | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "DevJobs-Pro",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null; // GitHub profile not found or rate limited
    }

    const data = await response.json();
    return {
      login: data.login,
      name: data.name,
      bio: data.bio,
      publicRepos: data.public_repos,
      followers: data.followers,
    };
  } catch (error) {
    // Network error or timeout - non-critical, return null
    console.warn("Failed to fetch GitHub profile:", error);
    return null;
  }
}

// Helper: Calculate candidate stats
function calculateStats(
  applications: Application[],
  assessments: SkillAssessment[],
): CandidateProfile["stats"] {
  const total = applications.length;
  const interviewed = applications.filter(
    (app) => app.status === "interviewed" || app.status === "offered",
  ).length;

  const skillScores = new Map<string, number[]>();
  assessments.forEach((a) => {
    const scores = skillScores.get(a.skill) ?? [];
    scores.push(a.score);
    skillScores.set(a.skill, scores);
  });

  const topSkills = [...skillScores.entries()]
    .map(([skill, scores]) => ({
      skill,
      avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5)
    .map((s) => s.skill);

  return {
    totalApplications: total,
    interviewRate: total > 0 ? (interviewed / total) * 100 : 0,
    topSkills,
  };
}

// Main function: Build complete candidate profile
async function getCandidateProfile(
  candidateId: string,
): Promise<CandidateProfile> {
  // Step 1: Get user (must have this first for GitHub username)
  const user = await db.user.findUnique({
    where: { id: candidateId },
    include: { profile: true },
  });

  if (!user) {
    throw new Error("Candidate not found");
  }

  // Step 2: Fetch independent data in parallel
  const [github, applications, assessments] = await Promise.all([
    // Only fetch GitHub if we have a username
    user.profile?.githubUsername
      ? fetchGitHubProfile(user.profile.githubUsername)
      : Promise.resolve(null),

    // Get all applications
    db.application.findMany({
      where: { candidateId },
      orderBy: { appliedAt: "desc" },
      take: 50,
    }),

    // Get assessments
    db.skillAssessment.findMany({
      where: { userId: candidateId },
      orderBy: { completedAt: "desc" },
    }),
  ]);

  // Step 3: Calculate stats (synchronous)
  const stats = calculateStats(applications, assessments);

  return {
    user,
    github: github ?? undefined,
    applications,
    assessments,
    stats,
  };
}

// Usage in an API endpoint
async function handleGetCandidateProfile(req: Request): Promise<Response> {
  try {
    const { candidateId } = req.params;
    const profile = await getCandidateProfile(candidateId);

    return new Response(JSON.stringify(profile), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: error.message === "Candidate not found" ? 404 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
```

---

## 🎯 Practice Challenge

### Challenge: Build Async Data Fetcher for DevJobs Pro

Create a comprehensive job listing page that requires data from multiple sources:

**Requirements:**

1. Create `getJobListingPage(jobId: string)` function that returns:
   - Job details
   - Company information
   - Similar jobs (same skills)
   - Company's other openings
   - Application count for the job

2. Optimize for performance:
   - Fetch independent data in parallel
   - Use sequential only when necessary

3. Handle edge cases:
   - Job not found
   - Company not found
   - No similar jobs (return empty array)

4. Add proper TypeScript types

### Expected Interface

```typescript
interface JobListingPage {
  job: Job;
  company: Company;
  similarJobs: Job[];
  companyJobs: Job[];
  applicationCount: number;
  isBookmarked: boolean; // If userId provided
}

async function getJobListingPage(
  jobId: string,
  userId?: string,
): Promise<JobListingPage>;
```

<details>
<summary>Click to reveal solution</summary>

```typescript
// src/services/job-listing.service.ts

interface Job {
  id: string;
  title: string;
  companyId: string;
  skills: string[];
  status: string;
}

interface Company {
  id: string;
  name: string;
  logo: string;
}

interface JobListingPage {
  job: Job;
  company: Company;
  similarJobs: Job[];
  companyJobs: Job[];
  applicationCount: number;
  isBookmarked: boolean;
}

// Helper functions
async function getJobById(jobId: string): Promise<Job | null> {
  return db.job.findUnique({ where: { id: jobId } });
}

async function getCompanyById(companyId: string): Promise<Company | null> {
  return db.company.findUnique({ where: { id: companyId } });
}

async function getSimilarJobs(
  skills: string[],
  excludeJobId: string,
  limit = 5,
): Promise<Job[]> {
  return db.job.findMany({
    where: {
      skills: { hasSome: skills },
      id: { not: excludeJobId },
      status: "published",
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

async function getCompanyJobs(
  companyId: string,
  excludeJobId: string,
  limit = 5,
): Promise<Job[]> {
  return db.job.findMany({
    where: {
      companyId,
      id: { not: excludeJobId },
      status: "published",
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

async function getApplicationCount(jobId: string): Promise<number> {
  return db.application.count({ where: { jobId } });
}

async function isJobBookmarked(
  jobId: string,
  userId: string,
): Promise<boolean> {
  const bookmark = await db.bookmark.findUnique({
    where: { userId_jobId: { userId, jobId } },
  });
  return bookmark !== null;
}

// Main function
async function getJobListingPage(
  jobId: string,
  userId?: string,
): Promise<JobListingPage> {
  // Step 1: Get job first (everything depends on this)
  const job = await getJobById(jobId);

  if (!job) {
    throw new Error("Job not found");
  }

  // Step 2: Fetch all dependent data in parallel
  const [company, similarJobs, companyJobs, applicationCount, isBookmarked] =
    await Promise.all([
      // Company (needs job.companyId)
      getCompanyById(job.companyId),

      // Similar jobs (needs job.skills)
      getSimilarJobs(job.skills, jobId),

      // Company's other jobs (needs job.companyId)
      getCompanyJobs(job.companyId, jobId),

      // Application count
      getApplicationCount(jobId),

      // Bookmark status (only if logged in)
      userId ? isJobBookmarked(jobId, userId) : Promise.resolve(false),
    ]);

  if (!company) {
    throw new Error("Company not found");
  }

  return {
    job,
    company,
    similarJobs,
    companyJobs,
    applicationCount,
    isBookmarked,
  };
}

// === ALTERNATIVE: Using Promise.allSettled for resilience ===

async function getJobListingPageResilient(
  jobId: string,
  userId?: string,
): Promise<JobListingPage> {
  const job = await getJobById(jobId);

  if (!job) {
    throw new Error("Job not found");
  }

  // Use allSettled so partial failures don't break the page
  const results = await Promise.allSettled([
    getCompanyById(job.companyId),
    getSimilarJobs(job.skills, jobId),
    getCompanyJobs(job.companyId, jobId),
    getApplicationCount(jobId),
    userId ? isJobBookmarked(jobId, userId) : Promise.resolve(false),
  ]);

  // Extract results with fallbacks
  const company = results[0].status === "fulfilled" ? results[0].value : null;
  const similarJobs = results[1].status === "fulfilled" ? results[1].value : [];
  const companyJobs = results[2].status === "fulfilled" ? results[2].value : [];
  const applicationCount =
    results[3].status === "fulfilled" ? results[3].value : 0;
  const isBookmarked =
    results[4].status === "fulfilled" ? results[4].value : false;

  if (!company) {
    throw new Error("Company not found");
  }

  return {
    job,
    company,
    similarJobs,
    companyJobs,
    applicationCount,
    isBookmarked,
  };
}
```

</details>

---

## 💡 Pro Tips

### 1. Don't Await in Loops Unless Intentional

```typescript
// ❌ Bad: Sequential execution in loop
async function processJobs(jobIds: string[]) {
  const results = [];
  for (const id of jobIds) {
    const job = await getJob(id); // Each waits for previous!
    results.push(job);
  }
  return results;
}
// 10 jobs × 50ms = 500ms

// ✅ Good: Parallel execution with Promise.all
async function processJobs(jobIds: string[]) {
  const results = await Promise.all(jobIds.map((id) => getJob(id)));
  return results;
}
// 10 jobs running together = ~50ms
```

### 2. Use Promise.all for Independent Operations

```typescript
// ✅ Independent operations - use Promise.all
const [user, settings, notifications] = await Promise.all([
  getUser(userId),
  getSettings(userId),
  getNotifications(userId),
]);

// ❌ Dependent operations - must be sequential
const user = await getUser(userId);
const profile = await getProfile(user.profileId); // Needs user.profileId
const company = await getCompany(profile.companyId); // Needs profile.companyId
```

### 3. Structured Concurrency Pattern

```typescript
// Group related parallel operations
async function getFullApplication(appId: string) {
  const app = await getApplication(appId);

  // These are all related to the application
  const [job, candidate, interviews] = await Promise.all([
    getJob(app.jobId),
    getUser(app.candidateId),
    getInterviews(appId),
  ]);

  return { ...app, job, candidate, interviews };
}
```

### 4. Timeout Pattern

```typescript
async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage = "Operation timed out",
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), ms),
  );

  return Promise.race([promise, timeout]);
}

// Usage
const user = await withTimeout(
  fetchUserFromSlowAPI(userId),
  5000,
  "User fetch timed out",
);
```

### 5. Retry Pattern

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed:`, lastError.message);

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
}

// Usage
const data = await withRetry(() => fetchFromUnreliableAPI(), 3, 1000);
```

---

## 🔧 5-Minute Debugger

### Problem 1: "await is only valid in async function" Error

```typescript
// ❌ Error: await outside async function
function loadData() {
  const data = await fetchData(); // SyntaxError!
  return data;
}
```

**Fix options:**

```typescript
// Option 1: Make function async
async function loadData() {
  const data = await fetchData();
  return data;
}

// Option 2: Use .then() if you can't make it async
function loadData() {
  return fetchData().then((data) => {
    // process data
    return data;
  });
}

// Option 3: Top-level await (in ES modules)
// At the top level of a .mjs file or "type": "module"
const data = await fetchData();
```

---

### Problem 2: Accidental Sequential Execution

```typescript
// ❌ Problem: This is SEQUENTIAL, not parallel!
async function getData() {
  const a = await fetchA(); // Wait...
  const b = await fetchB(); // Now wait more...
  const c = await fetchC(); // And more waiting...
  return { a, b, c };
}

// The issue: Each await waits for the previous to complete
```

**Visual explanation:**

```
WHAT YOU WROTE:                  WHAT ACTUALLY HAPPENS:
─────────────────                ────────────────────────

const a = await fetchA();        |----fetchA----|
const b = await fetchB();                       |----fetchB----|
const c = await fetchC();                                      |----fetchC----|
                                 0s             1s             2s             3s
                                 Total: 3 seconds (sequential)
```

**Fix: Start all promises first, then await**

```typescript
// ✅ Correct: Start all, then await all
async function getData() {
  // Start all immediately (no await yet!)
  const aPromise = fetchA();
  const bPromise = fetchB();
  const cPromise = fetchC();

  // Now await all together
  const [a, b, c] = await Promise.all([aPromise, bPromise, cPromise]);

  return { a, b, c };
}

// Or more concisely:
async function getData() {
  const [a, b, c] = await Promise.all([fetchA(), fetchB(), fetchC()]);
  return { a, b, c };
}
```

```
PARALLEL EXECUTION:

|----fetchA----|
|----fetchB----|
|----fetchC----|
0s             1s
Total: ~1 second (3x faster!)
```

---

### Problem 3: forEach with async Doesn't Wait

```typescript
// ❌ Bug: forEach doesn't await!
async function processItems(items: Item[]) {
  items.forEach(async (item) => {
    await processItem(item); // These run in parallel, uncontrolled!
  });
  console.log("Done!"); // This logs BEFORE processing completes!
}
```

**Fix options:**

```typescript
// Option 1: for...of for sequential processing
async function processItems(items: Item[]) {
  for (const item of items) {
    await processItem(item); // Sequential
  }
  console.log("Done!"); // After all items
}

// Option 2: Promise.all for parallel processing
async function processItems(items: Item[]) {
  await Promise.all(items.map((item) => processItem(item)));
  console.log("Done!"); // After all items
}

// Option 3: for await...of for async iterables
async function* processItemsGenerator(items: Item[]) {
  for (const item of items) {
    yield await processItem(item);
  }
}
```

---

## ✅ Definition of Done

Before moving to the next lesson, verify:

- [ ] You can write async functions with proper return types
- [ ] You understand when execution pauses at `await`
- [ ] You can identify when to use parallel vs sequential execution
- [ ] You can use `Promise.all` for independent operations
- [ ] You understand why `forEach` with async doesn't work as expected
- [ ] You can implement timeout and retry patterns

**Test yourself:**

1. What's the difference between these two?
   ```typescript
   const a = await fetchA();
   const b = await fetchB();
   // vs
   const [a, b] = await Promise.all([fetchA(), fetchB()]);
   ```
2. Why does this log "Done!" too early?
   ```typescript
   items.forEach(async (item) => await process(item));
   console.log("Done!");
   ```
3. When would you use `for...of` with await instead of `Promise.all`?

---

## 🧭 Navigation

| Previous                                             | Up                                           | Next                                                                 |
| ---------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------- |
| [← Callbacks & Promises](./02-callbacks-promises.md) | [Module 03: TypeScript + Async](./README.md) | [Error Handling Fundamentals →](./04-error-handling-fundamentals.md) |

---

**Next up:** Production code never crashes silently. We'll create custom error classes, implement proper error handling patterns, and build the error foundation for DevJobs Pro.
