# 🚀 Course 1: DevJobs Pro

> **Build a Production-Ready Job Board Platform with Node.js, Express 5, PostgreSQL & Drizzle ORM**

[![Node.js](https://img.shields.io/badge/Node.js-v24_LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2.1-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_Mode-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Drizzle](https://img.shields.io/badge/Drizzle_ORM-Latest-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features by User Role](#-features-by-user-role)
- [Tech Stack](#-tech-stack)
- [Learning Objectives](#-learning-objectives)
- [Project Phases](#-project-phases)
- [Course Modules](#-course-modules-59-lessons)
- [Project Architecture](#-project-architecture)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Navigation](#-navigation)

---

## 🎯 Project Overview

**DevJobs Pro** is a comprehensive, full-featured job board platform that connects job seekers with employers. Throughout this course, you'll build every aspect of this application from the ground up—learning professional patterns, best practices, and real-world development workflows.

This isn't just another tutorial project. DevJobs Pro includes:

- **Multi-role authentication** with JWT and role-based access control
- **Complete CRUD operations** for jobs, applications, and users
- **File uploads** for resumes with cloud storage integration
- **Email notifications** for application status updates
- **Admin dashboard** for platform management
- **RESTful API** design following industry standards
- **React frontend** to complete the full-stack experience

---

## 👥 Features by User Role

### 🔍 Job Seekers

| Feature              | Description                                                          |
| -------------------- | -------------------------------------------------------------------- |
| Browse Jobs          | Search and filter job listings by location, salary, type, and skills |
| Profile Management   | Create and update professional profile with skills and experience    |
| Resume Upload        | Upload and manage resume files (PDF, DOC)                            |
| Apply to Jobs        | Submit applications with cover letters                               |
| Application Tracking | Monitor application status (pending, reviewed, accepted, rejected)   |
| Saved Jobs           | Bookmark interesting job postings for later                          |

### 🏢 Employers

| Feature             | Description                                                 |
| ------------------- | ----------------------------------------------------------- |
| Company Profile     | Create and manage company information and branding          |
| Post Jobs           | Create detailed job listings with requirements and benefits |
| Manage Listings     | Edit, close, or repost job openings                         |
| Review Applications | View applicant profiles and resumes                         |
| Application Actions | Accept, reject, or request interviews                       |
| Analytics           | View job posting performance metrics                        |

### 🛡️ Administrators

| Feature            | Description                              |
| ------------------ | ---------------------------------------- |
| User Management    | View, suspend, or delete user accounts   |
| Job Moderation     | Approve, flag, or remove job postings    |
| Platform Analytics | Dashboard with user metrics and activity |
| Content Moderation | Review reported content and take action  |
| System Settings    | Configure platform-wide settings         |

---

## 🛠️ Tech Stack

### Backend

| Technology          | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| **Node.js v24 LTS** | JavaScript runtime for server-side development       |
| **Express 5.2.1**   | Web framework with native async/await error handling |
| **TypeScript**      | Type safety with strict mode enabled                 |
| **PostgreSQL 16**   | Relational database for structured data              |
| **Drizzle ORM**     | Type-safe database queries and migrations            |

### Authentication & Security

| Technology             | Purpose                         |
| ---------------------- | ------------------------------- |
| **JWT**                | Stateless authentication tokens |
| **bcrypt**             | Secure password hashing         |
| **Helmet**             | Security headers middleware     |
| **CORS**               | Cross-origin resource sharing   |
| **express-rate-limit** | API rate limiting               |
| **Zod**                | Runtime input validation        |

### File Handling & Services

| Technology     | Purpose                            |
| -------------- | ---------------------------------- |
| **Multer**     | Multipart form data / file uploads |
| **Cloudinary** | Cloud-based file storage           |
| **Nodemailer** | Email notifications                |

### Testing & Quality

| Technology    | Purpose                     |
| ------------- | --------------------------- |
| **Vitest**    | Fast unit testing framework |
| **Supertest** | HTTP assertion testing      |
| **ESLint**    | Code linting                |
| **Prettier**  | Code formatting             |

### Deployment

| Technology         | Purpose                           |
| ------------------ | --------------------------------- |
| **Docker**         | Containerization                  |
| **Railway/Render** | Cloud deployment platforms        |
| **PM2**            | Process management and monitoring |

### Frontend (Module 15)

| Technology       | Purpose              |
| ---------------- | -------------------- |
| **React 18**     | UI library           |
| **TypeScript**   | Type-safe components |
| **Axios**        | HTTP client          |
| **React Router** | Client-side routing  |

---

## 🎓 Learning Objectives

By completing this course, you will:

### Core Skills

- ✅ Understand Node.js internals: V8 engine, event loop, and async I/O
- ✅ Master Express 5's new features including native async error handling
- ✅ Write type-safe backend code with TypeScript in strict mode
- ✅ Design and implement RESTful APIs following best practices

### Database & Data

- ✅ Choose between SQL and NoSQL databases for different use cases
- ✅ Design relational schemas with proper normalization
- ✅ Use Drizzle ORM for type-safe database operations
- ✅ Implement database migrations and seeding

### Security & Authentication

- ✅ Implement JWT-based authentication from scratch
- ✅ Build role-based access control (RBAC) systems
- ✅ Validate and sanitize all user input
- ✅ Protect against common security vulnerabilities

### Professional Practices

- ✅ Structure projects using controllers, services, and repositories
- ✅ Handle errors gracefully with custom error classes
- ✅ Write comprehensive unit and integration tests
- ✅ Deploy applications with Docker and cloud platforms

---

## 📈 Project Phases

The DevJobs Pro project evolves throughout the course:

| Phase              | Modules | Milestone                                |
| ------------------ | ------- | ---------------------------------------- |
| **Foundation**     | 1-4     | Basic Express server with routes         |
| **Architecture**   | 5-6     | Middleware system and route organization |
| **Error Handling** | 7       | Professional error management            |
| **Database**       | 8-9     | PostgreSQL integration with Drizzle      |
| **Security**       | 10-11   | Auth, validation, and protection         |
| **Features**       | 12      | File uploads and email services          |
| **Quality**        | 13      | Comprehensive test suite                 |
| **Production**     | 14      | Docker deployment and monitoring         |
| **Full-Stack**     | 15      | React frontend integration               |

### Project Evolution Timeline

```
Module 1-4:    [======] Bare Express Server + TypeScript Setup
Module 5-6:    [======] Middleware + Route Architecture
Module 7:      [===]    Error Handling System
Module 8-9:    [======] Database Layer (Drizzle + PostgreSQL)
Module 10-11:  [======] Auth + Security Layer
Module 12:     [===]    File Uploads + Email
Module 13:     [===]    Testing Suite
Module 14:     [===]    Docker + Deployment
Module 15:     [===]    React Frontend
               ──────────────────────────────────────────────
               🎉 Complete Full-Stack Job Board Platform!
```

---

## 📚 Course Modules (59 Lessons)

### Module 1: Introduction (3 lessons)

| #   | Lesson                                                                    | Description                                                  |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 01  | [What is Node.js?](01-introduction/01-what-is-nodejs.md)                  | Understanding Node.js runtime and its unique characteristics |
| 02  | [Why Node.js for Backends](01-introduction/02-why-nodejs-for-backends.md) | Use cases, benefits, and when to choose Node.js              |
| 03  | [Course Overview & Setup](01-introduction/03-course-overview-setup.md)    | Development environment setup and course roadmap             |

### Module 2: Node.js Foundations (4 lessons)

| #   | Lesson                                                                        | Description                                  |
| --- | ----------------------------------------------------------------------------- | -------------------------------------------- |
| 01  | [V8 Engine & Event Loop](02-nodejs-foundations/01-v8-engine-event-loop.md)    | Deep dive into Node.js internals             |
| 02  | [Modules: CommonJS & ESM](02-nodejs-foundations/02-modules-commonjs-esm.md)   | Module systems and when to use each          |
| 03  | [Core Modules: fs & path](02-nodejs-foundations/03-core-modules-fs-path.md)   | File system operations and path manipulation |
| 04  | [HTTP Module: Raw Server](02-nodejs-foundations/04-http-module-raw-server.md) | Building an HTTP server without frameworks   |

### Module 3: TypeScript & Async (4 lessons)

| #   | Lesson                                                                               | Description                        |
| --- | ------------------------------------------------------------------------------------ | ---------------------------------- |
| 01  | [TypeScript Setup & Basics](03-typescript-async/01-typescript-setup-basics.md)       | Configuring TypeScript for Node.js |
| 02  | [Callbacks & Promises](03-typescript-async/02-callbacks-promises.md)                 | Async patterns foundation          |
| 03  | [Async/Await Patterns](03-typescript-async/03-async-await-patterns.md)               | Modern async programming           |
| 04  | [Error Handling Fundamentals](03-typescript-async/04-error-handling-fundamentals.md) | Handling async errors properly     |

### Module 4: Express Basics (4 lessons)

| #   | Lesson                                                                                | Description                          |
| --- | ------------------------------------------------------------------------------------- | ------------------------------------ |
| 01  | [Express 5 Installation & Setup](04-express-basics/01-express5-installation-setup.md) | Setting up Express 5 with TypeScript |
| 02  | [Routing Fundamentals](04-express-basics/02-routing-fundamentals.md)                  | Defining routes and route parameters |
| 03  | [Request Object Deep Dive](04-express-basics/03-request-object-deep-dive.md)          | Working with request data            |
| 04  | [Response Object Methods](04-express-basics/04-response-object-methods.md)            | Sending responses and status codes   |

### Module 5: Middleware (4 lessons)

| #   | Lesson                                                                             | Description                           |
| --- | ---------------------------------------------------------------------------------- | ------------------------------------- |
| 01  | [Middleware Concept & Lifecycle](05-middleware/01-middleware-concept-lifecycle.md) | Understanding the middleware pattern  |
| 02  | [Built-in Middleware](05-middleware/02-builtin-middleware.md)                      | Express built-in middleware functions |
| 03  | [Third-Party Middleware](05-middleware/03-third-party-middleware.md)               | Essential middleware packages         |
| 04  | [Custom Middleware Creation](05-middleware/04-custom-middleware-creation.md)       | Building your own middleware          |

### Module 6: Routing Architecture (4 lessons)

| #   | Lesson                                                                                       | Description                                |
| --- | -------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 01  | [Route Organization Patterns](06-routing-architecture/01-route-organization-patterns.md)     | Structuring routes at scale                |
| 02  | [Controllers & Services Pattern](06-routing-architecture/02-controllers-services-pattern.md) | Separating concerns properly               |
| 03  | [Project Structure Setup](06-routing-architecture/03-project-structure-setup.md)             | Professional folder organization           |
| 04  | [DevJobs Routes Scaffold](06-routing-architecture/04-devjobs-routes-scaffold.md)             | **🛠️ PROJECT:** Setting up DevJobs routing |

### Module 7: Error Handling (4 lessons)

| #   | Lesson                                                                  | Description                                 |
| --- | ----------------------------------------------------------------------- | ------------------------------------------- |
| 01  | [Express 5 Async Errors](07-error-handling/01-express5-async-errors.md) | Native async error handling in Express 5    |
| 02  | [Custom Error Classes](07-error-handling/02-custom-error-classes.md)    | Creating typed error hierarchies            |
| 03  | [Global Error Handler](07-error-handling/03-global-error-handler.md)    | Centralized error processing                |
| 04  | [DevJobs Error System](07-error-handling/04-devjobs-error-system.md)    | **🛠️ PROJECT:** Implementing error handling |

### Module 8: MongoDB & Mongoose (4 lessons) — _Theory Only_

| #   | Lesson                                                                               | Description                      |
| --- | ------------------------------------------------------------------------------------ | -------------------------------- |
| 01  | [NoSQL Concepts & When to Use](08-mongodb-mongoose/01-nosql-concepts-when-to-use.md) | Understanding document databases |
| 02  | [Mongoose Schemas & Models](08-mongodb-mongoose/02-mongoose-schemas-models.md)       | Defining data structures         |
| 03  | [CRUD Operations with Mongoose](08-mongodb-mongoose/03-crud-operations-mongoose.md)  | Data manipulation patterns       |
| 04  | [Relationships & Population](08-mongodb-mongoose/04-relationships-population.md)     | Linking documents together       |

### Module 9: PostgreSQL & Drizzle (4 lessons) — _Project Implementation_

| #   | Lesson                                                                                           | Description                             |
| --- | ------------------------------------------------------------------------------------------------ | --------------------------------------- |
| 01  | [SQL Fundamentals & Postgres Setup](09-postgresql-drizzle/01-sql-fundamentals-postgres-setup.md) | Relational database essentials          |
| 02  | [Drizzle ORM Schema Design](09-postgresql-drizzle/02-drizzle-orm-schema-design.md)               | Type-safe schema definitions            |
| 03  | [Migrations & Relationships](09-postgresql-drizzle/03-migrations-relationships.md)               | Database evolution and joins            |
| 04  | [DevJobs Database Implementation](09-postgresql-drizzle/04-devjobs-database-implementation.md)   | **🛠️ PROJECT:** Building the data layer |

### Module 10: Validation & Security (4 lessons)

| #   | Lesson                                                                                       | Description                    |
| --- | -------------------------------------------------------------------------------------------- | ------------------------------ |
| 01  | [Input Validation with Zod](10-validation-security/01-input-validation-zod.md)               | Runtime type validation        |
| 02  | [Data Sanitization](10-validation-security/02-data-sanitization.md)                          | Cleaning and normalizing input |
| 03  | [Security Headers: Helmet & CORS](10-validation-security/03-security-headers-helmet-cors.md) | HTTP security configuration    |
| 04  | [Rate Limiting & Protection](10-validation-security/04-rate-limiting-protection.md)          | Preventing abuse               |

### Module 11: Authentication (4 lessons)

| #   | Lesson                                                                                         | Description                              |
| --- | ---------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 01  | [Password Hashing with bcrypt](11-authentication/01-password-hashing-bcrypt.md)                | Secure password storage                  |
| 02  | [JWT Fundamentals](11-authentication/02-jwt-fundamentals.md)                                   | Token-based authentication               |
| 03  | [Auth Middleware & Protected Routes](11-authentication/03-auth-middleware-protected-routes.md) | Securing endpoints                       |
| 04  | [Role-Based Access Control](11-authentication/04-role-based-access-control.md)                 | **🛠️ PROJECT:** Multi-role authorization |

### Module 12: File Uploads & Services (4 lessons)

| #   | Lesson                                                                                               | Description                            |
| --- | ---------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 01  | [Multer File Uploads](12-file-uploads-services/01-multer-file-uploads.md)                            | Handling file upload requests          |
| 02  | [Cloudinary Integration](12-file-uploads-services/02-cloudinary-integration.md)                      | Cloud storage for files                |
| 03  | [Email Notifications with Nodemailer](12-file-uploads-services/03-email-notifications-nodemailer.md) | Sending transactional emails           |
| 04  | [DevJobs Resume Upload System](12-file-uploads-services/04-devjobs-resume-upload-system.md)          | **🛠️ PROJECT:** Complete file handling |

### Module 13: Testing (4 lessons)

| #   | Lesson                                                                               | Description                           |
| --- | ------------------------------------------------------------------------------------ | ------------------------------------- |
| 01  | [Testing Fundamentals with Vitest](13-testing/01-testing-fundamentals-vitest.md)     | Setting up the test environment       |
| 02  | [Unit Testing Services](13-testing/02-unit-testing-services.md)                      | Testing business logic                |
| 03  | [Integration Testing with Supertest](13-testing/03-integration-testing-supertest.md) | Testing HTTP endpoints                |
| 04  | [DevJobs Test Suite](13-testing/04-devjobs-test-suite.md)                            | **🛠️ PROJECT:** Comprehensive testing |

### Module 14: Deployment (4 lessons)

| #   | Lesson                                                                     | Description                    |
| --- | -------------------------------------------------------------------------- | ------------------------------ |
| 01  | [Environment Configuration](14-deployment/01-environment-configuration.md) | Managing environment variables |
| 02  | [Docker Containerization](14-deployment/02-docker-containerization.md)     | Building production containers |
| 03  | [Deploy to Railway/Render](14-deployment/03-deploy-railway-render.md)      | Cloud platform deployment      |
| 04  | [PM2 Monitoring & Logging](14-deployment/04-pm2-monitoring-logging.md)     | Production process management  |

### Module 15: React Frontend (4 lessons)

| #   | Lesson                                                                                     | Description                                |
| --- | ------------------------------------------------------------------------------------------ | ------------------------------------------ |
| 01  | [React Project Setup & API Client](15-react-frontend/01-react-project-setup-api-client.md) | Frontend foundation                        |
| 02  | [Job Seeker Dashboard](15-react-frontend/02-job-seeker-dashboard.md)                       | Building the seeker experience             |
| 03  | [Employer Dashboard](15-react-frontend/03-employer-dashboard.md)                           | Building the employer experience           |
| 04  | [Admin Panel](15-react-frontend/04-admin-panel.md)                                         | **🛠️ PROJECT:** Platform administration UI |

---

## 🏗️ Project Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DevJobs Pro Architecture                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐
│   React Frontend   │     │   React Frontend   │     │   React Frontend   │
│   (Job Seeker)     │     │    (Employer)      │     │     (Admin)        │
└─────────┬──────────┘     └─────────┬──────────┘     └─────────┬──────────┘
          │                          │                          │
          └──────────────────────────┼──────────────────────────┘
                                     │
                              ┌──────▼──────┐
                              │   HTTPS     │
                              │   REST API  │
                              └──────┬──────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────────┐
│                                    │                                         │
│  ┌─────────────────────────────────▼─────────────────────────────────────┐  │
│  │                        Express 5 Application                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                         Middleware Stack                         │  │  │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │  │  │
│  │  │  │ Helmet  │ │  CORS   │ │  Rate   │ │  Auth   │ │  JSON   │   │  │  │
│  │  │  │Security │ │ Headers │ │ Limiter │ │   JWT   │ │ Parser  │   │  │  │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │  │
│  │  │                           Router Layer                            │ │  │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │ │  │
│  │  │  │  /auth   │  │  /jobs   │  │  /users  │  │  /applications   │  │ │  │
│  │  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │ │  │
│  │  └───────┼─────────────┼─────────────┼─────────────────┼────────────┘ │  │
│  │          │             │             │                 │              │  │
│  │  ┌───────▼─────────────▼─────────────▼─────────────────▼────────────┐ │  │
│  │  │                        Controller Layer                           │ │  │
│  │  │    Request Validation → Business Logic Call → Response Format     │ │  │
│  │  └───────────────────────────────┬──────────────────────────────────┘ │  │
│  │                                  │                                    │  │
│  │  ┌───────────────────────────────▼──────────────────────────────────┐ │  │
│  │  │                         Service Layer                             │ │  │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │ │  │
│  │  │  │   Auth     │  │    Job     │  │    User    │  │Application │  │ │  │
│  │  │  │  Service   │  │  Service   │  │  Service   │  │  Service   │  │ │  │
│  │  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘  │ │  │
│  │  └───────────────────────────────┬──────────────────────────────────┘ │  │
│  │                                  │                                    │  │
│  │  ┌───────────────────────────────▼──────────────────────────────────┐ │  │
│  │  │                   Drizzle ORM (Data Access)                       │ │  │
│  │  │             Type-Safe Queries • Migrations • Relations            │ │  │
│  │  └───────────────────────────────┬──────────────────────────────────┘ │  │
│  └──────────────────────────────────┼────────────────────────────────────┘  │
│                                     │                                        │
│                        Node.js Express Server                                │
└─────────────────────────────────────┼────────────────────────────────────────┘
                                      │
                       ┌──────────────▼──────────────┐
                       │        PostgreSQL           │
                       │  ┌────────────────────────┐ │
                       │  │  users │ jobs │ apps   │ │
                       │  │  companies │ skills    │ │
                       │  └────────────────────────┘ │
                       └─────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            External Services                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   Cloudinary    │  │   Nodemailer    │  │      Docker / PM2           │  │
│  │  (File Storage) │  │  (Email Service)│  │  (Deployment & Monitoring)  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Database Schema Overview

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│      users       │     │    companies     │     │      jobs        │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│ id               │     │ id               │     │ id               │
│ email            │     │ name             │     │ title            │
│ password_hash    │     │ description      │     │ description      │
│ role             │────▶│ logo_url         │◀────│ company_id       │
│ created_at       │     │ website          │     │ location         │
│ updated_at       │     │ user_id (owner)  │     │ salary_range     │
└──────────────────┘     └──────────────────┘     │ job_type         │
         │                                        │ status           │
         │                                        │ created_at       │
         │                                        └──────────────────┘
         │                                                 │
         │              ┌──────────────────┐               │
         │              │   applications   │               │
         │              ├──────────────────┤               │
         └─────────────▶│ id               │◀──────────────┘
                        │ user_id          │
                        │ job_id           │
                        │ resume_url       │
                        │ cover_letter     │
                        │ status           │
                        │ created_at       │
                        └──────────────────┘
```

---

## 📋 Prerequisites

Before starting this course, you should have:

### Required Knowledge

- ✅ **JavaScript fundamentals** — variables, functions, arrays, objects, classes
- ✅ **Basic command line** — navigating directories, running commands
- ✅ **Git basics** — clone, commit, push, pull
- ✅ **HTTP concepts** — requests, responses, status codes

### Required Software

| Software   | Version | Purpose                                 |
| ---------- | ------- | --------------------------------------- |
| Node.js    | v24 LTS | JavaScript runtime                      |
| npm        | v10+    | Package manager (included with Node.js) |
| Git        | Latest  | Version control                         |
| VS Code    | Latest  | Recommended editor                      |
| PostgreSQL | v16+    | Database (or use Docker)                |
| Docker     | Latest  | Optional: containerized development     |

### Helpful (Not Required)

- Basic TypeScript familiarity
- Previous API development experience
- SQL query basics

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/node-express-course.git
cd node-express-course/01-devjobs-pro
```

### 2. Verify Node.js Installation

```bash
node --version  # Should show v24.x.x
npm --version   # Should show v10.x.x
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your database credentials and secrets
```

### 5. Start PostgreSQL

Using Docker (recommended):

```bash
docker compose up -d postgres
```

Or use a local PostgreSQL installation.

### 6. Run Database Migrations

```bash
npm run db:migrate
```

### 7. Start Development Server

```bash
npm run dev
```

### 8. Begin Learning!

Start with [Module 1: Introduction](01-introduction/01-what-is-nodejs.md)

---

## 🧭 Navigation

| Direction         | Link                                                               |
| ----------------- | ------------------------------------------------------------------ |
| ⬅️ Back           | [Main Course README](../README.md)                                 |
| ➡️ Start Learning | [Module 1: What is Node.js?](01-introduction/01-what-is-nodejs.md) |
| 📚 Course 2       | [TaskFlow API](../02-taskflow-api/README.md)                       |

---

## 📊 Course Statistics

| Metric             | Value                    |
| ------------------ | ------------------------ |
| Total Modules      | 15                       |
| Total Lessons      | 59                       |
| Estimated Duration | 40-50 hours              |
| Difficulty Level   | Beginner to Intermediate |
| Project Type       | Full-Stack Job Board     |

---

## 💡 Tips for Success

1. **Code along** — Don't just read; type every example yourself
2. **Experiment** — Try breaking things to understand how they work
3. **Build incrementally** — The project grows with each module
4. **Use TypeScript** — It will catch bugs before they happen
5. **Ask questions** — Use issues and discussions if you get stuck
6. **Review regularly** — Concepts build on each other

---

<div align="center">

**Ready to become a professional Node.js developer?**

[🚀 Start Course →](01-introduction/01-what-is-nodejs.md)

---

Made with ❤️ for aspiring full-stack developers

</div>
