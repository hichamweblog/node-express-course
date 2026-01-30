# Module 09: PostgreSQL & Drizzle ORM

## 🎯 Module Overview

This module implements the complete database layer for **DevJobs Pro**. You'll learn relational database fundamentals with PostgreSQL and modern, type-safe database access with Drizzle ORM.

By the end of this module, you'll have:

- A fully configured PostgreSQL database running in Docker
- Type-safe schema definitions with complete TypeScript inference
- Migration system for evolving your database schema
- Production-ready service layer with all CRUD operations

---

## 📚 Lessons

| #   | Lesson                                                                         | Topics                                            |
| --- | ------------------------------------------------------------------------------ | ------------------------------------------------- |
| 1   | [SQL Fundamentals & PostgreSQL Setup](./01-sql-fundamentals-postgres-setup.md) | Relational concepts, SQL basics, Docker setup     |
| 2   | [Drizzle ORM & Schema Design](./02-drizzle-orm-schema-design.md)               | Drizzle setup, schema definitions, type inference |
| 3   | [Migrations & Relationships](./03-migrations-relationships.md)                 | Migration workflow, foreign keys, indexes         |
| 4   | [DevJobs Database Implementation](./04-devjobs-database-implementation.md)     | Connection pooling, service layer, transactions   |

---

## 🏗️ What You'll Build

### Database Schema

```
┌────────────────────┐       ┌────────────────────┐
│       users        │       │     companies      │
├────────────────────┤       ├────────────────────┤
│ id, email, role    │◀──────│ employer_id        │
│ password_hash      │       │ name, description  │
│ profile fields     │       │ logo, website      │
└────────────────────┘       └─────────┬──────────┘
         │                             │
         │                             │
         ▼                             ▼
┌────────────────────┐       ┌────────────────────┐
│   applications     │       │        jobs        │
├────────────────────┤       ├────────────────────┤
│ user_id, job_id    │──────▶│ company_id         │
│ cover_letter       │       │ title, description │
│ status             │       │ salary, location   │
└────────────────────┘       └────────────────────┘
```

### Service Layer

- **userService**: Create, find, update users with password handling
- **jobService**: CRUD with search, filters, and pagination
- **applicationService**: Apply to jobs, track status, employer actions
- **companyService**: Employer company management

---

## 🛠️ Technologies

| Technology        | Purpose                          |
| ----------------- | -------------------------------- |
| **PostgreSQL 16** | Relational database              |
| **Docker**        | Development environment          |
| **Drizzle ORM**   | Type-safe database toolkit       |
| **drizzle-kit**   | Migrations and schema management |
| **postgres.js**   | PostgreSQL driver                |

---

## 📁 Project Structure After This Module

```
devjobs-api/
├── src/
│   ├── db/
│   │   ├── schema/
│   │   │   ├── enums.ts           # PostgreSQL enums
│   │   │   ├── users.ts           # Users table + relations
│   │   │   ├── companies.ts       # Companies table + relations
│   │   │   ├── jobs.ts            # Jobs table + relations
│   │   │   ├── applications.ts    # Applications table + relations
│   │   │   └── index.ts           # Exports + type definitions
│   │   ├── index.ts               # Database connection
│   │   └── seed.ts                # Development seed data
│   └── services/
│       ├── user.service.ts
│       ├── job.service.ts
│       ├── application.service.ts
│       └── company.service.ts
├── drizzle/
│   └── migrations/                # Generated SQL migrations
├── docker-compose.yml             # PostgreSQL container
├── drizzle.config.ts              # Drizzle Kit configuration
├── .env                           # Database credentials
└── .env.example                   # Template for team
```

---

## 🚀 Quick Start Commands

```bash
# Start PostgreSQL
npm run db:start

# Generate migrations from schema
npm run db:generate

# Apply migrations
npm run db:migrate

# Open visual database browser
npm run db:studio

# Seed development data
npm run db:seed

# Reset database (drops all data!)
npm run db:reset
```

---

## ✅ Prerequisites

Before starting this module, ensure you have:

- Docker installed and running
- Node.js 18+ installed
- Completed Modules 1-8

---

## ➡️ Next Module

[Module 10: Validation & Security →](../10-validation-security/README.md)
