# Module 04: Express Basics

## Overview

Welcome to Express 5! This module covers the fundamentals of Express.js—the most popular Node.js web framework. Express 5.2.1 is now the npm default, bringing native async/await error handling, improved TypeScript support, and breaking changes you need to understand.

## What You'll Build

By the end of this module, you'll have the foundation of the DevJobs Pro API:

- Project structure with TypeScript
- Route files for all resources (/auth, /jobs, /applications, /users, /companies)
- Type-safe request handlers
- Consistent API response utilities

## Lessons

| Lesson                                    | Topic                          | Duration |
| ----------------------------------------- | ------------------------------ | -------- |
| [01](./01-express5-installation-setup.md) | Express 5 Installation & Setup | 45 min   |
| [02](./02-routing-fundamentals.md)        | Routing Fundamentals           | 40 min   |
| [03](./03-request-object-deep-dive.md)    | Request Object Deep Dive       | 35 min   |
| [04](./04-response-object-methods.md)     | Response Object Methods        | 35 min   |

## Express 5 Key Changes

> ⚠️ **Breaking Changes from Express 4**

1. **Async Error Handling**: Promise rejections automatically caught
2. **Null-Prototype Params**: `req.params` has null prototype
3. **req.body Default**: Can be `undefined` instead of `{}`
4. **Named Wildcards**: Use `:splat*` instead of `*`
5. **Async res.render()**: Returns Promise now

## Prerequisites

- Completed Module 03 (TypeScript & Async Patterns)
- Node.js 18+ installed
- Understanding of HTTP methods and status codes

## Project Structure After This Module

```
devjobs-pro/
├── package.json
├── tsconfig.json
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── jobs.routes.ts
│   │   ├── applications.routes.ts
│   │   ├── users.routes.ts
│   │   └── companies.routes.ts
│   └── utils/
│       └── ApiResponse.ts
```

## Learning Objectives

After completing this module, you will be able to:

- [ ] Set up an Express 5 project with TypeScript
- [ ] Create routes for all HTTP methods
- [ ] Extract data from params, query, and body
- [ ] Type request handlers properly
- [ ] Send consistent API responses
- [ ] Debug common Express errors

---

**→ Start with [Lesson 01: Express 5 Installation & Setup](./01-express5-installation-setup.md)**
