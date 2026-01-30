# Module 07: Error Handling

## Overview

Error handling is one of the most overlooked yet critical aspects of building production APIs. In this module, you'll learn how Express 5 revolutionizes async error handling and how to build a robust, scalable error system for DevJobs Pro.

## What You'll Learn

- **Express 5 Async Errors**: Automatic Promise rejection handling (goodbye try/catch everywhere!)
- **Custom Error Classes**: Type-safe error hierarchy with operational vs programmer errors
- **Global Error Handler**: Central error processing with environment-aware responses
- **Complete Error System**: Production-ready error architecture for DevJobs Pro

## Lessons

| #   | Lesson                                                   | Duration | Key Concepts                                    |
| --- | -------------------------------------------------------- | -------- | ----------------------------------------------- |
| 01  | [Express 5 Async Errors](./01-express5-async-errors.md)  | 30 min   | Promise rejection handling, Express 4 vs 5      |
| 02  | [Custom Error Classes](./02-custom-error-classes.md)     | 35 min   | Error hierarchy, operational errors, TypeScript |
| 03  | [Global Error Handler](./03-global-error-handler.md)     | 40 min   | Error middleware, dev/prod modes, logging       |
| 04  | [DevJobs Pro Error System](./04-devjobs-error-system.md) | 45 min   | Complete integration, testing, documentation    |

## Prerequisites

Before starting this module, ensure you understand:

- ✅ Express routing and middleware (Modules 04-06)
- ✅ TypeScript classes and inheritance
- ✅ Async/await patterns (Module 03)
- ✅ HTTP status codes and REST conventions

## Key Takeaways

By the end of this module, you will:

1. **Leverage Express 5's automatic error handling** to write cleaner handlers
2. **Create a type-safe error class hierarchy** that maps to HTTP status codes
3. **Build a global error handler** that responds appropriately in dev vs production
4. **Implement a complete error system** that handles all error scenarios gracefully

## DevJobs Pro Integration

Throughout this module, you'll build:

```
src/
├── utils/
│   ├── errors.ts          # All custom error classes
│   └── catchAsync.ts      # Optional async wrapper (understand why Express 5 reduces need)
├── middleware/
│   ├── errorHandler.ts    # Global error handler
│   └── notFound.ts        # 404 handler for unmatched routes
└── app.ts                 # Wire everything together
```

## Error Handling Philosophy

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Production Error Handling                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐ │
│  │  Operational    │    │   Programmer    │    │    Unknown      │ │
│  │    Errors       │    │     Errors      │    │    Errors       │ │
│  ├─────────────────┤    ├─────────────────┤    ├─────────────────┤ │
│  │ • 404 Not Found │    │ • TypeError     │    │ • Unexpected    │ │
│  │ • 400 Bad Input │    │ • Bug in code   │    │ • Third-party   │ │
│  │ • 401 Auth fail │    │ • Undefined ref │    │ • Network fail  │ │
│  ├─────────────────┤    ├─────────────────┤    ├─────────────────┤ │
│  │  EXPECTED       │    │  UNEXPECTED     │    │  UNEXPECTED     │ │
│  │  Send to user   │    │  Log + generic  │    │  Log + generic  │ │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Quick Reference: HTTP Error Status Codes

| Code | Name                  | When to Use                          |
| ---- | --------------------- | ------------------------------------ |
| 400  | Bad Request           | Malformed syntax, invalid JSON       |
| 401  | Unauthorized          | Missing or invalid authentication    |
| 403  | Forbidden             | Authenticated but not allowed        |
| 404  | Not Found             | Resource doesn't exist               |
| 409  | Conflict              | Duplicate resource, version conflict |
| 422  | Unprocessable Entity  | Validation failed (semantic)         |
| 500  | Internal Server Error | Server-side bug, unexpected error    |

## Next Steps

After completing this module, you'll move on to:

- **Module 08: MongoDB & Mongoose** - Database integration with proper error handling
- **Module 09: Authentication & Authorization** - Auth errors and security
- **Module 10: API Validation** - Input validation with Zod

---

> 💡 **Pro Tip**: Error handling is what separates a demo from a production API. Invest time here—your future self (and your users) will thank you.
