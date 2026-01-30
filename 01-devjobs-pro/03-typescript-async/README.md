# Module 03: TypeScript + Async Patterns

> **DevJobs Pro** — Building type-safe, asynchronous Node.js applications

---

## 🎯 Module Overview

This module teaches you the essential foundations for modern Node.js development: TypeScript for type safety and async patterns for handling non-blocking operations. These skills are critical because every production Node.js application deals with:

- **Type safety** — Catching errors before runtime
- **Async operations** — Database queries, API calls, file I/O
- **Error handling** — Graceful failure and debugging

By the end of this module, you'll have the skills to write production-quality TypeScript code that handles real-world scenarios like job submissions, user authentication, and data fetching.

---

## 📚 Lessons

| #   | Lesson                                                             | Description                                 | Duration |
| --- | ------------------------------------------------------------------ | ------------------------------------------- | -------- |
| 1   | [TypeScript Setup & Basics](./01-typescript-setup-basics.md)       | TypeScript configuration, types, interfaces | ~45 min  |
| 2   | [Callbacks & Promises](./02-callbacks-promises.md)                 | Async evolution from callbacks to Promises  | ~40 min  |
| 3   | [Async/Await Patterns](./03-async-await-patterns.md)               | Modern async code, parallel vs sequential   | ~45 min  |
| 4   | [Error Handling Fundamentals](./04-error-handling-fundamentals.md) | Custom errors, proper error handling        | ~50 min  |

**Total Module Time:** ~3 hours

---

## 🎓 Learning Objectives

After completing this module, you will be able to:

### TypeScript

- [ ] Configure TypeScript for a Node.js project
- [ ] Write type-safe code with interfaces and type aliases
- [ ] Understand when to use `interface` vs `type`
- [ ] Configure `tsconfig.json` for production use

### Async Patterns

- [ ] Convert callback-based code to Promises
- [ ] Write clean async/await code
- [ ] Choose between sequential and parallel execution
- [ ] Use `Promise.all` and `Promise.allSettled` appropriately

### Error Handling

- [ ] Create custom error classes
- [ ] Handle errors properly in async code
- [ ] Build error handling middleware
- [ ] Never swallow errors silently

---

## 🏗️ What You'll Build

Throughout this module, you'll create:

1. **TypeScript Project Scaffold** — Proper folder structure, tsconfig.json, type definitions
2. **DevJobs Pro Types** — Interfaces for Jobs, Users, Companies, Applications
3. **Async Data Fetcher** — Efficient parallel data loading
4. **Error System** — Custom error classes (AppError, NotFoundError, ValidationError, AuthError)

---

## 📋 Prerequisites

Before starting this module, you should:

- [ ] Complete [Module 02: Node.js Foundations](../02-nodejs-foundations/README.md)
- [ ] Have Node.js 22+ installed
- [ ] Understand basic JavaScript (ES6+)
- [ ] Be comfortable with terminal/command line

---

## 🔧 Setup

Before starting Lesson 1, ensure you have:

```bash
# Check Node.js version (should be 22+)
node --version

# Check npm version
npm --version

# Install TypeScript globally (optional, but helpful)
npm install -g typescript

# Verify TypeScript installation
tsc --version
```

---

## 💡 Key Concepts Preview

### TypeScript Types

```typescript
// Interface - best for object shapes
interface Job {
  id: string;
  title: string;
  salary: number;
}

// Type - best for unions
type JobStatus = "draft" | "published" | "closed";

// Generic types
interface ApiResponse<T> {
  success: boolean;
  data: T;
}
```

### Async Patterns

```typescript
// Sequential (when steps depend on each other)
const user = await getUser(id);
const profile = await getProfile(user.profileId);

// Parallel (when operations are independent)
const [user, jobs, companies] = await Promise.all([
  getUser(id),
  getJobs(),
  getCompanies(),
]);
```

### Error Handling

```typescript
class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super({
      code: "NOT_FOUND",
      message: `${resource} '${id}' not found`,
      statusCode: 404,
    });
  }
}

// Usage
throw new NotFoundError("Job", jobId);
```

---

## 🧭 Navigation

| Previous Module                                                        | Course Home                 | Next Module                                                   |
| ---------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------- |
| [← Module 02: Node.js Foundations](../02-nodejs-foundations/README.md) | [DevJobs Pro](../README.md) | [Module 04: Express Basics →](../04-express-basics/README.md) |

---

## 🆘 Getting Help

If you get stuck:

1. **Re-read the relevant section** — The answers are often in the lesson
2. **Check the 5-Minute Debugger** — Each lesson has common error solutions
3. **Review the code examples** — Copy and modify them to understand
4. **Practice the challenges** — Hands-on learning cements concepts

---

**Ready to start?** Begin with [Lesson 1: TypeScript Setup & Basics](./01-typescript-setup-basics.md)
