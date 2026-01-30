# Module 06: Routing Architecture

## Overview

This module establishes the professional project structure and routing patterns for DevJobs Pro. You'll learn how to organize routes, separate concerns with controllers and services, and scaffold a production-ready Express application.

## Learning Objectives

By the end of this module, you will:

- Organize routes using express.Router() and modular patterns
- Implement the Controller-Service-Repository architecture pattern
- Structure a production-ready Express TypeScript project
- Build the complete DevJobs Pro routing foundation

## Lessons

| Lesson | Topic                                                                  | Description                                  |
| ------ | ---------------------------------------------------------------------- | -------------------------------------------- |
| 01     | [Route Organization Patterns](./01-route-organization-patterns.md)     | Modular routing with express.Router()        |
| 02     | [Controllers & Services Pattern](./02-controllers-services-pattern.md) | Separating HTTP handling from business logic |
| 03     | [Project Structure Setup](./03-project-structure-setup.md)             | Professional folder organization             |
| 04     | [DevJobs Routes Scaffold](./04-devjobs-routes-scaffold.md)             | Building the complete route structure        |

## Prerequisites

- Completed Module 05 (Middleware)
- Understanding of Express routing fundamentals
- TypeScript basics

## What You'll Build

The complete routing architecture for DevJobs Pro:

```
/api/v1/auth         → Authentication routes
/api/v1/jobs         → Job listings CRUD + search
/api/v1/applications → Job applications management
/api/v1/users        → User profiles and settings
/api/v1/companies    → Company management for employers
/api/v1/admin        → Administrative operations
```

## Key Concepts

- **express.Router()** - Mini Express applications for modular routing
- **Route Prefixes** - Organizing routes under common paths
- **Controllers** - HTTP request/response handling layer
- **Services** - Business logic layer (framework-agnostic)
- **Layered Architecture** - Separation of concerns for testability

---

**Next Module:** [07 - Error Handling](../07-error-handling/README.md)
