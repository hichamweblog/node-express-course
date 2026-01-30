# Module 14: Deployment

## 🚀 From localhost to Production

You've built a powerful DevJobs Pro API with authentication, database operations, file uploads, and comprehensive tests. But an API that only runs on your machine isn't helping anyone find jobs.

**Deployment is where your code meets the real world.** It's not just about copying files—it's about:

- Managing secrets securely across environments
- Packaging your app to run anywhere
- Choosing the right hosting platform
- Keeping your app running reliably 24/7

This module transforms you from a developer who builds features into an engineer who ships production software.

---

## 🎯 Learning Objectives

By the end of this module, you will:

### Environment Configuration

- [ ] Understand the role of environment variables in different stages
- [ ] Build type-safe configuration with validation
- [ ] Manage secrets securely (never commit them!)
- [ ] Create environment-specific behaviors

### Docker Containerization

- [ ] Understand Docker fundamentals for Node.js
- [ ] Write production-optimized Dockerfiles
- [ ] Use multi-stage builds for smaller images
- [ ] Set up docker-compose for local development

### Platform Deployment

- [ ] Compare modern PaaS options (Railway, Render, Fly.io)
- [ ] Deploy Node.js APIs with managed databases
- [ ] Configure custom domains and SSL
- [ ] Set up automatic deployments from GitHub

### Production Operations

- [ ] Use PM2 for process management and clustering
- [ ] Implement structured logging for production
- [ ] Create health and readiness endpoints
- [ ] Plan for monitoring and error tracking

---

## 📚 Lessons

| #   | Lesson                                                         | Description                                            | Duration |
| --- | -------------------------------------------------------------- | ------------------------------------------------------ | -------- |
| 1   | [Environment Configuration](./01-environment-configuration.md) | Type-safe config, secrets management, env validation   | 45 min   |
| 2   | [Docker Containerization](./02-docker-containerization.md)     | Dockerfile best practices, multi-stage builds, compose | 60 min   |
| 3   | [Deploy to Railway/Render](./03-deploy-railway-render.md)      | Modern PaaS deployment, databases, CI/CD               | 45 min   |
| 4   | [PM2, Monitoring & Logging](./04-pm2-monitoring-logging.md)    | Process management, structured logs, health checks     | 45 min   |

**Total Module Duration:** ~3.5 hours

---

## 🛠️ Prerequisites

Before starting this module, ensure you have:

- [ ] Completed Modules 1-13 (DevJobs Pro API functional and tested)
- [ ] Docker Desktop installed ([docker.com](https://docker.com))
- [ ] Git repository for your project
- [ ] Accounts on [Railway](https://railway.app) or [Render](https://render.com) (free tier)
- [ ] PostgreSQL database working locally

---

## 📁 What We're Building

By the end of this module, your DevJobs Pro project will have:

```
devjobs-pro/
├── src/
│   ├── config/
│   │   ├── index.ts           # Type-safe config module
│   │   ├── env.ts             # Environment validation
│   │   └── logger.ts          # Structured logging config
│   ├── routes/
│   │   └── health.ts          # Health check endpoints
│   └── ...
├── .env.example               # Documented env template
├── .env                       # Local development (git-ignored!)
├── Dockerfile                 # Multi-stage production build
├── docker-compose.yml         # Local dev with PostgreSQL
├── docker-compose.prod.yml    # Production-like local testing
├── ecosystem.config.js        # PM2 configuration
├── railway.json               # Railway deployment config
└── render.yaml                # Render blueprint
```

---

## 🔑 Key Concepts Preview

### The Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT PIPELINE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   LOCAL DEV          STAGING              PRODUCTION            │
│   ─────────          ───────              ──────────            │
│                                                                 │
│   ┌─────────┐       ┌─────────┐          ┌─────────┐           │
│   │  .env   │       │ Platform│          │ Platform│           │
│   │  local  │       │ Secrets │          │ Secrets │           │
│   └────┬────┘       └────┬────┘          └────┬────┘           │
│        │                 │                    │                 │
│        ▼                 ▼                    ▼                 │
│   ┌─────────┐       ┌─────────┐          ┌─────────┐           │
│   │ Docker  │──────▶│ Docker  │─────────▶│ Docker  │           │
│   │Compose  │       │ Build   │          │Container│           │
│   └─────────┘       └─────────┘          └─────────┘           │
│        │                 │                    │                 │
│   localhost:3000   preview.app.com      api.devjobs.com        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎓 Why This Matters

**Junior developers** build features that work locally.

**Senior engineers** ship features that work reliably in production, with:

- Proper secret management
- Consistent environments
- Zero-downtime deployments
- Observable, debuggable systems

This module teaches you the production mindset that separates professionals from hobbyists.

---

## ⚡ Quick Start

If you're picking up from Module 13, your DevJobs Pro API should be ready for deployment. Start with Lesson 1 to properly configure your environments.

If you're skipping ahead, ensure you have a working Express API with PostgreSQL before continuing.

---

## 🔗 Navigation

| Previous                                        | Home                            | Next                                                     |
| ----------------------------------------------- | ------------------------------- | -------------------------------------------------------- |
| [← Module 13: Testing](../13-testing/README.md) | [Course Overview](../README.md) | [Module 15: Advanced Topics →](../15-advanced/README.md) |

---

**Let's get your API into the real world! 🌍**
