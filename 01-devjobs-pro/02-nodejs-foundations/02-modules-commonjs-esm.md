# Lesson 2: Modules—CommonJS & ES Modules

## 🎯 Hook: Organizing Code Like a Pro

Imagine building DevJobs Pro with all code in a single file—thousands of lines for routes, controllers, models, utilities. Nightmare, right? Modules are how Node.js organizes code into manageable, reusable pieces. But here's the twist: Node.js has **two** module systems, and knowing when to use each separates juniors from professionals.

In this lesson, you'll understand both CommonJS (the veteran) and ES Modules (the modern standard), why the difference matters, and why DevJobs Pro uses ESM exclusively.

---

## 📚 Theory: Two Module Systems

### The History (60 Seconds)

- **2009**: Node.js created with CommonJS (CJS) because JavaScript had no module system
- **2015**: ES Modules (ESM) standardized in ECMAScript 2015
- **2020**: Node.js fully supports ES Modules
- **Today**: ESM is the future, but CJS dominates existing code

### CommonJS (CJS)

The original Node.js module system. Synchronous, simple, battle-tested.

```javascript
// Exporting (math.js)
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;

module.exports = { add, subtract };
// OR
module.exports.add = add;
// OR
exports.add = add; // shorthand (careful with gotchas!)

// Importing (app.js)
const math = require("./math");
const { add, subtract } = require("./math");
```

### ES Modules (ESM)

The JavaScript standard. Asynchronous, static analysis friendly, tree-shakeable.

```javascript
// Exporting (math.js)
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

// Default export
export default class Calculator {}

// Importing (app.js)
import { add, subtract } from "./math.js";
import Calculator from "./math.js";
import * as math from "./math.js";
```

### Side-by-Side Comparison

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COMMONJS vs ES MODULES                            │
├─────────────────────────────┬───────────────────────────────────────┤
│         CommonJS            │            ES Modules                 │
├─────────────────────────────┼───────────────────────────────────────┤
│ const x = require('./x')    │ import x from './x.js'                │
│ module.exports = x          │ export default x                      │
│ exports.foo = foo           │ export { foo }                        │
├─────────────────────────────┼───────────────────────────────────────┤
│ Synchronous loading         │ Asynchronous loading                  │
│ Dynamic (runtime) imports   │ Static imports (compile time)         │
│ No file extension needed    │ File extension REQUIRED (.js)         │
│ __dirname available         │ import.meta.url instead               │
│ require.cache for caching   │ Different caching mechanism           │
├─────────────────────────────┼───────────────────────────────────────┤
│ Works everywhere (legacy)   │ Modern standard, better tooling       │
│ Circular deps: partial obj  │ Circular deps: live bindings          │
└─────────────────────────────┴───────────────────────────────────────┘
```

### Enabling ES Modules

Two ways to use ESM in Node.js:

**Option 1: File Extension**

```
myfile.mjs  → Always ESM
myfile.cjs  → Always CommonJS
myfile.js   → Depends on package.json
```

**Option 2: package.json "type" field (Recommended)**

```json
{
  "name": "devjobs-pro",
  "type": "module", // All .js files are ESM
  "version": "1.0.0"
}
```

### Module Resolution Process

```
┌─────────────────────────────────────────────────────────────────────┐
│              MODULE RESOLUTION ALGORITHM                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  import { helper } from './utils.js'                                 │
│                      │                                               │
│                      ▼                                               │
│  ┌──────────────────────────────────────┐                           │
│  │ 1. Is it a core module? (fs, path)   │──Yes──► Load core module  │
│  └───────────────┬──────────────────────┘                           │
│                  │ No                                                │
│                  ▼                                                   │
│  ┌──────────────────────────────────────┐                           │
│  │ 2. Starts with './' or '../'?        │──Yes──► Resolve as file/  │
│  │    (Relative path)                   │         directory         │
│  └───────────────┬──────────────────────┘                           │
│                  │ No                                                │
│                  ▼                                                   │
│  ┌──────────────────────────────────────┐                           │
│  │ 3. Search node_modules               │                           │
│  │    ./node_modules/                   │                           │
│  │    ../node_modules/                  │                           │
│  │    ../../node_modules/               │                           │
│  │    ... up to root                    │                           │
│  └───────────────┬──────────────────────┘                           │
│                  │ Not found                                         │
│                  ▼                                                   │
│  ┌──────────────────────────────────────┐                           │
│  │ 4. ERR_MODULE_NOT_FOUND              │                           │
│  └──────────────────────────────────────┘                           │
│                                                                      │
│  FILE RESOLUTION ORDER:                                              │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ 1. Exact file: ./utils.js                                      │ │
│  │ 2. package.json "exports" field (modern)                       │ │
│  │ 3. package.json "main" field (legacy)                          │ │
│  │ 4. index.js in directory                                       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### The "exports" Field (Modern Package Design)

```json
{
  "name": "my-package",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./utils": {
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    }
  }
}
```

This enables:

```javascript
import pkg from "my-package"; // → ./dist/index.mjs
import utils from "my-package/utils"; // → ./dist/utils.mjs
```

---

## 💻 Code Examples

### Example 1: CommonJS Patterns

**JavaScript:**

```javascript
// ============= users.js =============
// Named exports
const findUser = (id) => ({ id, name: "Alice" });
const createUser = (data) => ({ ...data, id: Date.now() });

module.exports = {
  findUser,
  createUser,
};

// Alternative: Export as you define
module.exports.deleteUser = (id) => ({ deleted: id });

// ============= app.js =============
// Import entire module
const users = require("./users");
console.log(users.findUser(1));

// Destructured import
const { findUser, createUser } = require("./users");

// Dynamic import (CJS superpower)
const moduleName = process.env.DB_TYPE === "postgres" ? "./pg" : "./mysql";
const db = require(moduleName);
```

### Example 2: ES Modules Patterns

**JavaScript:**

```javascript
// ============= users.js =============
// Named exports
export const findUser = (id) => ({ id, name: "Alice" });
export const createUser = (data) => ({ ...data, id: Date.now() });

// Default export (one per module)
export default class UserService {
  constructor(db) {
    this.db = db;
  }
}

// ============= app.js =============
// Named imports
import { findUser, createUser } from "./users.js";

// Default import
import UserService from "./users.js";

// Namespace import
import * as users from "./users.js";
console.log(users.findUser(1));

// Rename imports
import { findUser as getUser } from "./users.js";

// Dynamic import (async!)
const loadModule = async () => {
  const moduleName =
    process.env.DB_TYPE === "postgres" ? "./pg.js" : "./mysql.js";
  const db = await import(moduleName);
  return db;
};
```

**TypeScript:**

```typescript
// ============= users.ts =============
interface User {
  id: number;
  name: string;
  email?: string;
}

export const findUser = (id: number): User => ({ id, name: "Alice" });
export const createUser = (data: Omit<User, "id">): User => ({
  ...data,
  id: Date.now(),
});

export default class UserService {
  private db: unknown;

  constructor(db: unknown) {
    this.db = db;
  }

  async getById(id: number): Promise<User | null> {
    // Implementation
    return findUser(id);
  }
}

// ============= app.ts =============
import UserService, { findUser, createUser } from "./users.js";
import type { User } from "./users.js"; // Type-only import

const service = new UserService(db);
const user: User = await service.getById(1);
```

### Example 3: \_\_dirname in ES Modules

**JavaScript:**

```javascript
// CommonJS - __dirname is global
const path = require("path");
const configPath = path.join(__dirname, "config.json");

// ES Modules - use import.meta.url
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configPath = join(__dirname, "config.json");

// Or use import.meta.dirname (Node.js 20.11+)
const configPath2 = join(import.meta.dirname, "config.json");
```

**TypeScript:**

```typescript
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Node.js 20.11+ has these built-in
declare global {
  interface ImportMeta {
    dirname: string;
    filename: string;
  }
}

const configPath = join(import.meta.dirname, "config.json");
```

### Example 4: Circular Dependencies

```
┌───────────────────────────────────────────────────────────────────┐
│                    CIRCULAR DEPENDENCY                             │
│                                                                    │
│    ┌─────────┐                        ┌─────────┐                 │
│    │   a.js  │ ────── imports ──────► │   b.js  │                 │
│    │         │ ◄───── imports ─────── │         │                 │
│    └─────────┘                        └─────────┘                 │
│                                                                    │
│  CommonJS: Gets PARTIAL object (whatever was exported so far)     │
│  ES Modules: Gets LIVE BINDING (updates as module initializes)    │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘
```

**JavaScript (Circular Dependency Example):**

```javascript
// ============= a.js =============
console.log("a.js starting");
import { b } from "./b.js";

export const a = "A";
console.log("In a.js, b =", b);

// ============= b.js =============
console.log("b.js starting");
import { a } from "./a.js";

export const b = "B";
console.log("In b.js, a =", a);

// ============= main.js =============
import "./a.js";

/* OUTPUT:
b.js starting
In b.js, a = undefined  ← a.js hasn't finished exporting yet!
a.js starting
In a.js, b = B
*/

// SOLUTION: Restructure to avoid circular deps, or use lazy loading
```

### Example 5: DevJobs Pro Module Structure

```
devjobs-pro/
├── package.json           ← "type": "module"
├── src/
│   ├── index.js          ← Application entry point
│   ├── config/
│   │   └── index.js      ← Re-exports all config
│   ├── routes/
│   │   ├── index.js      ← Aggregates all routes
│   │   ├── jobs.js
│   │   └── auth.js
│   ├── controllers/
│   │   ├── jobController.js
│   │   └── authController.js
│   ├── services/
│   │   ├── jobService.js
│   │   └── emailService.js
│   └── utils/
│       ├── index.js      ← Barrel export
│       ├── validators.js
│       └── helpers.js
```

**JavaScript:**

```javascript
// ============= src/utils/validators.js =============
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidSalary = (min, max) => {
  return min > 0 && max > min;
};

// ============= src/utils/helpers.js =============
export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-US").format(new Date(date));
};

// ============= src/utils/index.js (Barrel Export) =============
// Clean re-exports for easy importing elsewhere
export * from "./validators.js";
export * from "./helpers.js";

// ============= src/controllers/jobController.js =============
import { isValidSalary, slugify } from "../utils/index.js";
// Or simply:
import { isValidSalary, slugify } from "../utils/index.js";

export const createJob = async (req, res) => {
  const { title, salaryMin, salaryMax } = req.body;

  if (!isValidSalary(salaryMin, salaryMax)) {
    return res.status(400).json({ error: "Invalid salary range" });
  }

  const slug = slugify(title);
  // ... create job logic
};
```

**TypeScript:**

```typescript
// ============= src/utils/validators.ts =============
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidSalary = (min: number, max: number): boolean => {
  return min > 0 && max > min;
};

// ============= src/types/job.ts =============
export interface Job {
  id: string;
  title: string;
  slug: string;
  company: string;
  salaryMin: number;
  salaryMax: number;
  createdAt: Date;
}

export interface CreateJobDTO {
  title: string;
  company: string;
  salaryMin: number;
  salaryMax: number;
}

// ============= src/controllers/jobController.ts =============
import type { Request, Response } from "express";
import type { CreateJobDTO, Job } from "../types/job.js";
import { isValidSalary, slugify } from "../utils/index.js";

export const createJob = async (
  req: Request<object, object, CreateJobDTO>,
  res: Response,
): Promise<void> => {
  const { title, salaryMin, salaryMax } = req.body;

  if (!isValidSalary(salaryMin, salaryMax)) {
    res.status(400).json({ error: "Invalid salary range" });
    return;
  }

  const slug = slugify(title);
  // ... create job logic
};
```

---

## 🔨 Mini-Tutorial: Dual Package (CJS + ESM)

Let's create a package that works with both module systems—useful if you're publishing npm packages.

### Step 1: Project Setup

```bash
mkdir dual-module-demo && cd dual-module-demo
npm init -y
```

### Step 2: Create Source Files

```javascript
// ============= src/index.js =============
export const greet = (name) => `Hello, ${name}!`;
export const farewell = (name) => `Goodbye, ${name}!`;

export default {
  greet,
  farewell,
};
```

### Step 3: Create CommonJS Wrapper

```javascript
// ============= dist/cjs/index.cjs =============
"use strict";

const greet = (name) => `Hello, ${name}!`;
const farewell = (name) => `Goodbye, ${name}!`;

module.exports = { greet, farewell };
module.exports.default = module.exports;
```

### Step 4: Configure package.json

```json
{
  "name": "dual-module-demo",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/cjs/index.cjs",
  "module": "./src/index.js",
  "exports": {
    ".": {
      "import": "./src/index.js",
      "require": "./dist/cjs/index.cjs"
    }
  },
  "files": ["src", "dist"]
}
```

### Step 5: Test Both Formats

```javascript
// ============= test-esm.js =============
import { greet } from "dual-module-demo";
console.log(greet("ESM User")); // Hello, ESM User!
```

```javascript
// ============= test-cjs.cjs =============
const { greet } = require("dual-module-demo");
console.log(greet("CJS User")); // Hello, CJS User!
```

---

## 🏋️ Practice Exercises

### Exercise 1: Convert CJS to ESM

Convert this CommonJS module to ES Modules:

```javascript
// database.js (CommonJS)
const mongoose = require("mongoose");

const connect = async (uri) => {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
};

const disconnect = async () => {
  await mongoose.disconnect();
};

module.exports = { connect, disconnect };
module.exports.mongoose = mongoose;
```

<details>
<summary>Click to reveal solution</summary>

```javascript
// database.js (ES Modules)
import mongoose from "mongoose";

export const connect = async (uri) => {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
};

export const disconnect = async () => {
  await mongoose.disconnect();
};

export { mongoose };

// Or with default export:
export default { connect, disconnect, mongoose };
```

</details>

### Exercise 2: Create Barrel Export

Given this structure, create a proper barrel export:

```
src/
├── models/
│   ├── User.js     (exports: User class)
│   ├── Job.js      (exports: Job class, JobStatus enum)
│   └── Company.js  (exports: Company class)
```

<details>
<summary>Click to reveal solution</summary>

```javascript
// src/models/index.js
export { User } from "./User.js";
export { Job, JobStatus } from "./Job.js";
export { Company } from "./Company.js";

// Usage elsewhere:
import { User, Job, Company, JobStatus } from "./models/index.js";
```

</details>

### Exercise 3: Fix the Import Error

This code throws an error. Fix it:

```javascript
// package.json: { "type": "module" }
import express from "express";
import routes from "./routes"; // ERROR!
import { join } from "path";

const configPath = join(__dirname, "config.json"); // ERROR!
```

<details>
<summary>Click to reveal solution</summary>

```javascript
import express from "express";
import routes from "./routes/index.js"; // Add .js extension!
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Or for Node.js 20.11+:
// const __dirname = import.meta.dirname;

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, "config.json");
```

</details>

---

## 💡 Pro Tips

### 1. Always Use File Extensions in ESM

```javascript
// ❌ Bad - works in bundlers, fails in Node.js ESM
import { helper } from "./utils";

// ✅ Good - always works
import { helper } from "./utils.js";
```

### 2. Use "node:" Protocol for Core Modules

```javascript
// ❌ Ambiguous - is 'path' a core module or npm package?
import path from "path";

// ✅ Clear - explicitly a core module
import path from "node:path";
```

### 3. Type-Only Imports in TypeScript

```typescript
// ✅ Removed at compile time, no runtime impact
import type { User } from "./types.js";

// For mixed imports:
import { createUser, type User } from "./users.js";
```

### 4. Conditional Exports for Environment-Specific Code

```json
{
  "exports": {
    ".": {
      "node": "./src/node.js",
      "browser": "./src/browser.js",
      "default": "./src/index.js"
    }
  }
}
```

### 5. DevJobs Pro Pattern: Feature-Based Modules

```javascript
// Instead of type-based (controllers/, models/, routes/)
// Use feature-based organization:

src/
├── features/
│   ├── jobs/
│   │   ├── jobController.js
│   │   ├── jobService.js
│   │   ├── jobModel.js
│   │   ├── jobRoutes.js
│   │   └── index.js        ← Feature's barrel export
│   ├── auth/
│   │   ├── authController.js
│   │   └── ...
```

---

## 🔧 5-Minute Debugger

### Error: "Cannot find module"

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/path/to/project/utils'
```

**Diagnosis:**

1. Missing file extension in ESM
2. File doesn't exist at path
3. Wrong relative path

**Fix:**

```javascript
// ❌ Causes error in ESM
import { helper } from "./utils";

// ✅ Add .js extension
import { helper } from "./utils.js";

// ✅ Or check if it's a directory with index.js
import { helper } from "./utils/index.js";
```

### Error: "require is not defined in ES module scope"

```
ReferenceError: require is not defined in ES module scope
```

**Diagnosis:**
Using CommonJS `require()` in an ES Module file.

**Fix:**

```javascript
// ❌ CJS in ESM file
const fs = require("fs");

// ✅ Use import
import fs from "node:fs";

// ✅ Or for dynamic require (rare):
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const legacyPackage = require("legacy-cjs-package");
```

### Error: "exports is not defined in ES module scope"

```
ReferenceError: exports is not defined in ES module scope
```

**Diagnosis:**
Using CommonJS `exports` in an ES Module file.

**Fix:**

```javascript
// ❌ CJS syntax
exports.myFunction = () => {};
module.exports = { myFunction };

// ✅ ESM syntax
export const myFunction = () => {};
export default { myFunction };
```

### Quick Checklist

1. ✅ Check package.json `"type": "module"` or `"commonjs"`
2. ✅ File extension: `.js`, `.mjs`, `.cjs`
3. ✅ Are you using correct syntax for the module type?
4. ✅ Did you add `.js` extension to relative imports (ESM)?
5. ✅ Is the module installed? (`npm ls <package>`)

---

## ✅ Definition of Done

You've mastered this lesson when you can:

- [ ] Explain the difference between CommonJS and ES Modules
- [ ] Enable ES Modules in a Node.js project
- [ ] Write correct import/export syntax for both systems
- [ ] Use dynamic imports with `import()`
- [ ] Create barrel exports for clean module organization
- [ ] Handle `__dirname` equivalent in ES Modules
- [ ] Debug common module-related errors
- [ ] Explain why DevJobs Pro uses ES Modules (`"type": "module"`)

---

## 🚀 Next Steps

Now that you understand how to organize code into modules, let's explore Node.js's built-in modules—starting with the ones you'll use daily: `fs` and `path`.

**Next Lesson:** [Core Modules: fs & path](./03-core-modules-fs-path.md)

You'll learn:

- Reading and writing files asynchronously
- Path manipulation for cross-platform compatibility
- Building a file logger for DevJobs Pro

---

## 📚 Additional Resources

- [Node.js Modules Documentation](https://nodejs.org/api/modules.html)
- [Node.js ES Modules Documentation](https://nodejs.org/api/esm.html)
- [Package.json exports field](https://nodejs.org/api/packages.html#exports)
