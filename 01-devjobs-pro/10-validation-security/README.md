# Module 10: Validation and Security

## The Security Mindset

> "Security isn't a feature—it's a foundation. Every line of code you write either strengthens or weakens your application's defenses."

As a backend developer, you're the gatekeeper of your application. Users send data, and you decide what gets through. This module teaches you to think like both a defender and an attacker—understanding threats so you can prevent them.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        THE SECURITY LAYERS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│     Internet                                                                │
│        │                                                                    │
│        ▼                                                                    │
│   ┌─────────┐    Layer 1: Rate Limiting                                    │
│   │ Shield  │    "How often can they knock?"                               │
│   └────┬────┘                                                              │
│        │                                                                    │
│        ▼                                                                    │
│   ┌─────────┐    Layer 2: Security Headers                                 │
│   │ Headers │    "What rules must browsers follow?"                        │
│   └────┬────┘                                                              │
│        │                                                                    │
│        ▼                                                                    │
│   ┌─────────┐    Layer 3: Input Validation                                 │
│   │  Zod    │    "Is this data in the right format?"                       │
│   └────┬────┘                                                              │
│        │                                                                    │
│        ▼                                                                    │
│   ┌─────────┐    Layer 4: Sanitization                                     │
│   │ Cleaner │    "Is this data safe to use?"                               │
│   └────┬────┘                                                              │
│        │                                                                    │
│        ▼                                                                    │
│   ┌─────────┐                                                              │
│   │ Your DB │    Protected!                                                │
│   └─────────┘                                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Module Overview

This module covers the essential security practices every production API needs. You'll learn to validate input, sanitize data, configure security headers, and protect against abuse—all in the context of building DevJobs Pro.

### What You'll Build

By the end of this module, DevJobs Pro will have:

- Type-safe validation schemas for all API endpoints
- Sanitization middleware that prevents XSS attacks
- Production-ready security headers via Helmet
- CORS configuration for frontend-backend communication
- Rate limiting that prevents API abuse

---

## Learning Objectives

After completing this module, you will be able to:

### Validation (Lesson 1)

- [ ] Explain why validation is critical for API security
- [ ] Define Zod schemas for complex data structures
- [ ] Use parse vs safeParse appropriately
- [ ] Infer TypeScript types from Zod schemas
- [ ] Create reusable validation middleware

### Sanitization (Lesson 2)

- [ ] Identify XSS and injection attack vectors
- [ ] Implement input sanitization strategies
- [ ] Use express-validator sanitizers effectively
- [ ] Allow safe HTML while blocking malicious content
- [ ] Build sanitization middleware chains

### Security Headers (Lesson 3)

- [ ] Configure Helmet for production environments
- [ ] Understand Content Security Policy (CSP)
- [ ] Set up CORS for specific origins
- [ ] Handle preflight requests correctly
- [ ] Debug common CORS errors

### Rate Limiting (Lesson 4)

- [ ] Choose appropriate rate limiting algorithms
- [ ] Configure express-rate-limit for different routes
- [ ] Implement Redis-backed distributed rate limiting
- [ ] Create tiered rate limits for different user types
- [ ] Handle "Too Many Requests" responses gracefully

---

## Lessons

| #   | Lesson                                                          | Description                                | Duration |
| --- | --------------------------------------------------------------- | ------------------------------------------ | -------- |
| 1   | [Input Validation with Zod](./01-input-validation-zod.md)       | Type-safe validation for all API inputs    | 45 min   |
| 2   | [Data Sanitization](./02-data-sanitization.md)                  | Cleaning malicious content from user input | 35 min   |
| 3   | [Security Headers & CORS](./03-security-headers-helmet-cors.md) | HTTP headers that protect your application | 40 min   |
| 4   | [Rate Limiting & Protection](./04-rate-limiting-protection.md)  | Defending against API abuse                | 40 min   |

---

## Prerequisites

Before starting this module, you should have completed:

- **Module 5**: Middleware (you'll create security middleware)
- **Module 7**: Error Handling (validation errors integrate with error system)
- **Module 9**: Database Implementation (you'll validate data before storage)

---

## DevJobs Pro Security Requirements

Throughout this module, we'll implement these security features for DevJobs Pro:

```
┌──────────────────────────────────────────────────────────────────────┐
│                    DEVJOBS PRO SECURITY MATRIX                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ENDPOINT            VALIDATION       SANITIZE    RATE LIMIT        │
│  ─────────────────────────────────────────────────────────────────  │
│  POST /auth/register  Email, pwd      Trim names   5/min            │
│  POST /auth/login     Email, pwd      -            10/min           │
│  POST /jobs           Full schema     HTML desc    20/min           │
│  PUT /jobs/:id        Partial schema  HTML desc    30/min           │
│  POST /applications   Resume, msg     Sanitize msg 10/min           │
│  GET /jobs            Query params    -            100/min          │
│                                                                      │
│  GLOBAL HEADERS: Helmet defaults + custom CSP                       │
│  CORS: Allow frontend domain only                                   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Key Packages We'll Use

```bash
# Validation
npm install zod

# Sanitization
npm install express-validator dompurify jsdom
npm install -D @types/dompurify @types/jsdom

# Security Headers
npm install helmet cors
npm install -D @types/cors

# Rate Limiting
npm install express-rate-limit rate-limit-redis
```

---

## Quick Reference

### Validation Cheat Sheet

```typescript
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().min(18).optional(),
});

type User = z.infer<typeof schema>; // TypeScript type!
```

### Security Headers Cheat Sheet

```typescript
import helmet from "helmet";
import cors from "cors";

app.use(helmet()); // All default security headers
app.use(cors({ origin: "https://devjobs.pro" })); // CORS
```

### Rate Limiting Cheat Sheet

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});

app.use("/api", limiter);
```

---

## Common Security Mistakes

| Mistake                 | Impact                     | Solution                          |
| ----------------------- | -------------------------- | --------------------------------- |
| Trusting client data    | Data corruption, injection | Validate everything server-side   |
| Missing sanitization    | XSS attacks                | Sanitize input, escape output     |
| No rate limiting        | DoS, brute force attacks   | Implement tiered rate limits      |
| `cors: { origin: '*' }` | Security bypass            | Whitelist specific origins        |
| Disabled Helmet         | Missing security headers   | Use Helmet with sensible defaults |

---

## Navigation

| Previous Module                                                      | Current Module                       | Next Module                                                 |
| -------------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------- |
| [Module 9: PostgreSQL & Drizzle](../09-postgresql-drizzle/README.md) | **Module 10: Validation & Security** | [Module 11: Authentication](../11-authentication/README.md) |

---

**Ready to secure your API?** Let's start with [Lesson 1: Input Validation with Zod](./01-input-validation-zod.md).
