# Module 05: Middleware

## Overview

Middleware is the backbone of Express applications. Every request flows through middleware functions before reaching your route handlers, and every response passes back through them. This module teaches you how to leverage middleware for logging, security, validation, and more.

## Learning Objectives

By the end of this module, you will:

- Understand the middleware execution lifecycle
- Configure Express built-in middleware properly
- Implement security middleware for production
- Create custom, typed middleware factories

## Lessons

| Lesson                                     | Topic                          | Duration |
| ------------------------------------------ | ------------------------------ | -------- |
| [01](./01-middleware-concept-lifecycle.md) | Middleware Concept & Lifecycle | 45 min   |
| [02](./02-builtin-middleware.md)           | Built-in Middleware            | 35 min   |
| [03](./03-third-party-middleware.md)       | Third-Party Middleware         | 40 min   |
| [04](./04-custom-middleware-creation.md)   | Custom Middleware Creation     | 50 min   |

## Prerequisites

- Completed Module 04 (Express Basics)
- Understanding of async/await patterns
- TypeScript fundamentals

## Key Concepts

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS MIDDLEWARE STACK                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Request ──►  Built-in     ──►  Security    ──►  Custom        │
│               Middleware        Middleware       Middleware     │
│               (json, static)    (helmet, cors)   (logger, auth) │
│                                                                  │
│                      │                │               │          │
│                      ▼                ▼               ▼          │
│                                                                  │
│               Route Handler ──► Response ──► Back through stack │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## What You'll Build

Throughout this module, you'll build the middleware foundation for DevJobs Pro:

- **Request Logger** - Track every request with timing
- **Security Stack** - Helmet, CORS, rate limiting
- **Request ID** - Unique identifier for every request
- **Validation Middleware** - Factory pattern for request validation

## Express 5 Note

Express 5 automatically handles promise rejections in middleware and route handlers—no more `asyncWrapper` needed! However, we'll understand the pattern since you'll encounter it in Express 4 codebases.

---

**Ready?** Let's dive into [Lesson 1: Middleware Concept & Lifecycle](./01-middleware-concept-lifecycle.md)
