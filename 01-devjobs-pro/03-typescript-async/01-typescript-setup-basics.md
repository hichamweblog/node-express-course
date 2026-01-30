# Lesson 1: TypeScript Setup & Basics

> **Module 03: TypeScript + Async Patterns**
> Master TypeScript fundamentals for building type-safe Node.js applications

---

## 🎯 The Hook

**Ever spent hours debugging a typo in a property name? Or called a function with the wrong argument type?**

TypeScript catches these errors _before_ your code runs. In large codebases like DevJobs Pro—with hundreds of files, multiple team members, and complex data flows—TypeScript becomes your safety net. It's not about writing more code; it's about writing _confident_ code.

Companies like Microsoft, Google, Airbnb, and Stripe use TypeScript in production. Why? Because when you're handling job applications, user authentication, and payment processing, you can't afford runtime surprises.

---

## 📚 Core Concepts

### Why TypeScript for Node.js?

TypeScript is a **superset of JavaScript** that adds static type checking. Every valid JavaScript file is valid TypeScript, but TypeScript gives you:

1. **Compile-time error detection** — Catch bugs before deployment
2. **IDE superpowers** — Autocomplete, refactoring, go-to-definition
3. **Self-documenting code** — Types serve as living documentation
4. **Safer refactoring** — Change a type, see all breaking points instantly

### How TypeScript Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TypeScript Compilation Flow                       │
└─────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
  │              │         │              │         │              │
  │  .ts files   │────────▶│     tsc      │────────▶│  .js files   │
  │              │         │  (compiler)  │         │              │
  │  TypeScript  │  Check  │              │  Emit   │  JavaScript  │
  │    Source    │  Types  │  tsconfig    │  Code   │   Output     │
  │              │         │   .json      │         │              │
  └──────────────┘         └──────────────┘         └──────────────┘
                                                           │
                                                           │
                                                           ▼
                                                    ┌──────────────┐
                                                    │              │
                                                    │   Node.js    │
                                                    │   Runtime    │
                                                    │              │
                                                    │  Executes    │
                                                    │  JavaScript  │
                                                    │              │
                                                    └──────────────┘

Key Points:
───────────
• TypeScript NEVER runs directly — it compiles to JavaScript
• Type information is ERASED at runtime (zero overhead)
• Node.js only sees regular JavaScript
• tsconfig.json controls compilation behavior
```

### tsconfig.json Explained

The `tsconfig.json` file is your TypeScript configuration hub. Here's what each important option does:

```json
{
  "compilerOptions": {
    // === Output Settings ===
    "target": "ES2024", // JavaScript version to emit
    "module": "NodeNext", // Module system (ESM for modern Node.js)
    "moduleResolution": "NodeNext", // How to find modules
    "outDir": "./dist", // Where compiled JS goes
    "rootDir": "./src", // Where source TS lives

    // === Strict Mode (ALWAYS enable these) ===
    "strict": true, // Enable ALL strict checks
    "noImplicitAny": true, // Error on implicit 'any' types
    "strictNullChecks": true, // null/undefined are distinct types
    "strictFunctionTypes": true, // Strict function parameter checking

    // === Module Interop ===
    "esModuleInterop": true, // Better CommonJS/ESM compatibility
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true, // Import JSON files

    // === Quality Checks ===
    "noUnusedLocals": true, // Error on unused variables
    "noUnusedParameters": true, // Error on unused parameters
    "noImplicitReturns": true, // All code paths must return
    "noFallthroughCasesInSwitch": true,

    // === Source Maps (for debugging) ===
    "sourceMap": true, // Generate .map files
    "declaration": true, // Generate .d.ts files
    "declarationMap": true // Maps for declarations
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Strict Mode Benefits

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Why Strict Mode Matters                           │
└─────────────────────────────────────────────────────────────────────┘

Without strict mode:                With strict mode:
─────────────────────               ─────────────────────

function getUser(id) {              function getUser(id: string) {
  // id could be anything!            // id MUST be string
  return db.find(id);                 return db.find(id);
}                                   }

let user = getUser(123);            let user = getUser(123);
// Compiles! Runtime error likely   // ❌ Compile error!
                                    // Argument of type 'number' is
                                    // not assignable to type 'string'

user.name.toUpperCase();            if (user) {
// Runtime error if user is null     user.name.toUpperCase();
                                    }
                                    // ✅ Must check for null first
```

### Basic Types

```typescript
// === Primitive Types ===
const jobTitle: string = "Senior Node.js Developer";
const salary: number = 120000;
const isRemote: boolean = true;
const startDate: Date = new Date("2026-02-01");

// === Arrays ===
const skills: string[] = ["Node.js", "TypeScript", "PostgreSQL"];
const salaryRange: [number, number] = [100000, 150000]; // Tuple

// === Objects ===
const job: { title: string; salary: number } = {
  title: "Backend Engineer",
  salary: 95000,
};

// === Union Types ===
type JobStatus = "draft" | "published" | "closed";
let status: JobStatus = "published";
// status = "archived"; // ❌ Error: not in union

// === Literal Types ===
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

// === Optional & Nullable ===
let description: string | null = null;
let location?: string; // Optional (can be undefined)
```

### Interfaces vs Types

Both define shapes, but they have different use cases:

```typescript
// === Interface: Best for object shapes ===
interface Job {
  id: string;
  title: string;
  company: string;
  salary: number;
}

// Interfaces can be extended
interface RemoteJob extends Job {
  timezone: string;
  allowsAsyncWork: boolean;
}

// Interfaces can be merged (declaration merging)
interface Job {
  postedAt: Date; // Added to original Job interface
}

// === Type: Best for unions, intersections, utilities ===
type JobId = string;
type JobStatus = "draft" | "published" | "closed";

// Type intersection
type JobWithStatus = Job & { status: JobStatus };

// Type can represent anything
type StringOrNumber = string | number;
type Callback = (error: Error | null, result: Job) => void;

// Mapped types (only with type)
type ReadonlyJob = Readonly<Job>;
type PartialJob = Partial<Job>;
```

**Rule of thumb:**

- Use **interface** for objects that will be extended or implemented
- Use **type** for unions, primitives, tuples, and utility types

---

## 💻 Code Examples

### Example 1: Setting Up tsconfig.json for Node.js 24

```json
// tsconfig.json - Production-ready for Node.js 24
{
  "compilerOptions": {
    "target": "ES2024",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2024"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Example 2: Basic Type Annotations

```typescript
// src/types/job.types.ts

// Define the shape of a Job posting
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  remote: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Function with typed parameters and return
export function formatSalary(salary: Job["salary"]): string {
  const { min, max, currency } = salary;
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  return `${formatter.format(min)} - ${formatter.format(max)}`;
}

// Example usage
const jobSalary: Job["salary"] = {
  min: 100000,
  max: 150000,
  currency: "USD",
};

console.log(formatSalary(jobSalary)); // "$100,000 - $150,000"
```

### Example 3: Interface Definitions for DevJobs Pro

```typescript
// src/types/index.ts

// === User Types ===
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export type UserRole = "candidate" | "employer" | "admin";

// === Company Types ===
export interface Company {
  id: string;
  name: string;
  website: string;
  logo?: string; // Optional field
  employees: number;
  industry: string;
  ownerId: string;
}

// === Application Types ===
export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  coverLetter?: string;
  resumeUrl: string;
  appliedAt: Date;
}

export type ApplicationStatus =
  | "pending"
  | "reviewing"
  | "interviewed"
  | "offered"
  | "rejected"
  | "withdrawn";

// === Generic Response Types ===
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Usage example
type JobResponse = ApiResponse<Job>;
type JobListResponse = PaginatedResponse<Job>;
```

---

## 🛠️ Mini-Tutorial: Initialize TypeScript Node.js Project

Let's set up a TypeScript project from scratch for DevJobs Pro.

### Step 1: Create Project Directory

```bash
mkdir devjobs-api
cd devjobs-api
```

### Step 2: Initialize npm with ESM

```bash
npm init -y
```

Edit `package.json`:

```json
{
  "name": "devjobs-api",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit"
  },
  "engines": {
    "node": ">=22.0.0"
  }
}
```

### Step 3: Install Dependencies

```bash
# TypeScript and types
npm install -D typescript @types/node

# Development runner (executes TS directly)
npm install -D tsx
```

### Step 4: Initialize TypeScript

```bash
npx tsc --init
```

Replace the generated `tsconfig.json`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2024",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2024"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 5: Create Source Structure

```bash
mkdir -p src/types src/services src/utils
```

### Step 6: Create Entry Point

```typescript
// src/index.ts
import { createServer, IncomingMessage, ServerResponse } from "node:http";

const PORT = process.env.PORT ?? 3000;

function handleRequest(req: IncomingMessage, res: ServerResponse): void {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      message: "DevJobs Pro API",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    }),
  );
}

const server = createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
```

### Step 7: Verify Setup

```bash
# Type check without building
npm run typecheck

# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

---

## 🎯 Practice Challenge

### Challenge: Create DevJobs Pro Project Scaffold

Build the complete TypeScript project structure for DevJobs Pro:

**Requirements:**

1. Create folder structure:

   ```
   devjobs-api/
   ├── src/
   │   ├── index.ts
   │   ├── types/
   │   │   ├── index.ts
   │   │   ├── job.types.ts
   │   │   ├── user.types.ts
   │   │   └── company.types.ts
   │   ├── services/
   │   │   └── .gitkeep
   │   ├── routes/
   │   │   └── .gitkeep
   │   └── utils/
   │       └── .gitkeep
   ├── package.json
   └── tsconfig.json
   ```

2. Define these interfaces in their respective files:
   - `Job`, `JobStatus`, `JobFilters` in `job.types.ts`
   - `User`, `UserRole`, `UserProfile` in `user.types.ts`
   - `Company`, `CompanySize` in `company.types.ts`

3. Export all types from `types/index.ts` barrel file

4. Create an index.ts that:
   - Imports types from the barrel
   - Creates a simple HTTP server
   - Returns typed JSON responses

### Solution Structure

<details>
<summary>Click to reveal solution</summary>

```typescript
// src/types/job.types.ts
export type JobStatus = "draft" | "published" | "closed" | "expired";

export interface JobSalary {
  min: number;
  max: number;
  currency: string;
  period: "hourly" | "monthly" | "yearly";
}

export interface Job {
  id: string;
  title: string;
  description: string;
  companyId: string;
  location: string;
  remote: boolean;
  salary: JobSalary;
  skills: string[];
  experienceLevel: "junior" | "mid" | "senior" | "lead";
  status: JobStatus;
  postedBy: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface JobFilters {
  search?: string;
  location?: string;
  remote?: boolean;
  minSalary?: number;
  maxSalary?: number;
  skills?: string[];
  experienceLevel?: Job["experienceLevel"];
  status?: JobStatus;
}
```

```typescript
// src/types/user.types.ts
export type UserRole = "candidate" | "employer" | "admin";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  skills: string[];
  resumeUrl?: string;
  linkedIn?: string;
  github?: string;
  website?: string;
}

// Omit sensitive fields for API responses
export type SafeUser = Omit<User, "passwordHash">;
```

```typescript
// src/types/company.types.ts
export type CompanySize =
  | "1-10"
  | "11-50"
  | "51-200"
  | "201-500"
  | "501-1000"
  | "1000+";

export interface Company {
  id: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  logoUrl?: string;
  size: CompanySize;
  industry: string;
  founded?: number;
  headquarters: string;
  ownerId: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

```typescript
// src/types/index.ts
// Barrel file - export all types from one place
export type { Job, JobStatus, JobSalary, JobFilters } from "./job.types.js";

export type { User, UserRole, UserProfile, SafeUser } from "./user.types.js";

export type { Company, CompanySize } from "./company.types.js";

// Generic API types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}
```

```typescript
// src/index.ts
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import type { ApiResponse, Job } from "./types/index.js";

const PORT = process.env.PORT ?? 3000;

// Sample data with proper types
const sampleJob: Job = {
  id: "job_001",
  title: "Senior Node.js Developer",
  description: "Build scalable APIs for DevJobs Pro",
  companyId: "comp_001",
  location: "San Francisco, CA",
  remote: true,
  salary: {
    min: 150000,
    max: 200000,
    currency: "USD",
    period: "yearly",
  },
  skills: ["Node.js", "TypeScript", "PostgreSQL", "Redis"],
  experienceLevel: "senior",
  status: "published",
  postedBy: "user_001",
  createdAt: new Date(),
  updatedAt: new Date(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
};

function sendJson<T>(res: ServerResponse, data: ApiResponse<T>): void {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data, null, 2));
}

function handleRequest(req: IncomingMessage, res: ServerResponse): void {
  const response: ApiResponse<Job[]> = {
    success: true,
    data: [sampleJob],
    message: "Jobs retrieved successfully",
    timestamp: new Date().toISOString(),
  };

  sendJson(res, response);
}

const server = createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`🚀 DevJobs Pro API running at http://localhost:${PORT}`);
});
```

</details>

---

## 💡 Pro Tips

### 1. Always Use Strict Mode in Production

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true  // This alone enables 7 strict flags!
  }
}
```

The `strict` flag enables: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, and `alwaysStrict`.

### 2. Type Narrowing Patterns

```typescript
// Use type guards to narrow types
interface Candidate {
  type: "candidate";
  resumeUrl: string;
}

interface Employer {
  type: "employer";
  companyId: string;
}

type User = Candidate | Employer;

function handleUser(user: User): void {
  // Type narrowing with discriminated unions
  if (user.type === "candidate") {
    // TypeScript knows user is Candidate here
    console.log(user.resumeUrl);
  } else {
    // TypeScript knows user is Employer here
    console.log(user.companyId);
  }
}

// Custom type guard
function isCandidate(user: User): user is Candidate {
  return user.type === "candidate";
}
```

### 3. Use `satisfies` for Better Type Inference

```typescript
// Without satisfies - type is widened to Record<string, unknown>
const config = {
  port: 3000,
  host: "localhost",
} as const;

// With satisfies - keeps literal types AND validates shape
interface ServerConfig {
  port: number;
  host: string;
}

const config2 = {
  port: 3000,
  host: "localhost",
} satisfies ServerConfig;
// config2.port is typed as 3000 (literal), not number
```

### 4. Barrel Files for Clean Imports

```typescript
// Instead of:
import { Job } from "./types/job.types.js";
import { User } from "./types/user.types.js";
import { Company } from "./types/company.types.js";

// Use barrel exports:
import { Job, User, Company } from "./types/index.js";
```

---

## 🔧 5-Minute Debugger

### Problem 1: "Cannot find module" TypeScript Error

```
Error: Cannot find module './types/job.types' or its corresponding type declarations.
```

**Cause:** TypeScript with ESM requires explicit file extensions.

**Fix:**

```typescript
// ❌ Wrong (CommonJS style)
import { Job } from "./types/job.types";

// ✅ Correct (ESM with Node.js)
import { Job } from "./types/job.types.js";
```

Yes, you use `.js` even for `.ts` files! TypeScript resolves this to `.ts` during compilation.

**Also check:**

- `moduleResolution` is set to `"NodeNext"` or `"Node16"`
- `module` is set to `"NodeNext"` or `"Node16"`
- `type: "module"` is in `package.json`

---

### Problem 2: "Type 'X' is not assignable to type 'Y'" Error

```typescript
interface Job {
  title: string;
  salary: number;
}

const job: Job = {
  title: "Developer",
  salary: "100000", // Error: Type 'string' is not assignable to type 'number'
};
```

**Diagnosis steps:**

1. **Check the expected type** — Hover over the variable in VS Code
2. **Check the actual value** — Is it the right type?
3. **Look for implicit conversions** — JSON.parse returns `unknown`

**Common fixes:**

```typescript
// Fix 1: Correct the value
const job: Job = {
  title: "Developer",
  salary: 100000, // number, not string
};

// Fix 2: Parse/convert the value
const salaryFromApi = "100000";
const job2: Job = {
  title: "Developer",
  salary: parseInt(salaryFromApi, 10),
};

// Fix 3: Type assertion (use carefully!)
const data = JSON.parse(jsonString) as Job;
```

---

## ✅ Definition of Done

Before moving to the next lesson, verify:

- [ ] You have a working TypeScript project with `npm run build` succeeding
- [ ] You understand what each `tsconfig.json` option does
- [ ] You can define interfaces for objects
- [ ] You can use type aliases for unions and primitives
- [ ] You know when to use `interface` vs `type`
- [ ] You have the DevJobs Pro project scaffold with typed entities
- [ ] VS Code shows autocomplete for your types

**Test yourself:**

1. What's the difference between `target` and `module` in tsconfig?
2. Why do we use `.js` extensions in imports even for TypeScript files?
3. When would you use `type` instead of `interface`?

---

## 🧭 Navigation

| Previous                                                                           | Up                                           | Next                                                 |
| ---------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------- |
| [← HTTP Module: Raw Server](../02-nodejs-foundations/04-http-module-raw-server.md) | [Module 03: TypeScript + Async](./README.md) | [Callbacks & Promises →](./02-callbacks-promises.md) |

---

**Next up:** We'll explore the async evolution—from callback hell to elegant Promise chains. You'll understand why Node.js had callbacks first, and how Promises revolutionized async code.
