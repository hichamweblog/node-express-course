# Module 11: Authentication

## 🎯 Module Overview

Authentication is the cornerstone of any serious web application. In this module, you'll learn how to implement production-grade authentication for DevJobs Pro, covering everything from secure password storage to role-based access control.

By the end of this module, you'll have a complete authentication system that protects your API, manages user sessions securely, and enforces different permission levels for job seekers, employers, and administrators.

---

## 🎓 Learning Objectives

After completing this module, you will be able to:

1. **Hash passwords securely** using bcrypt with appropriate cost factors
2. **Implement JWT-based authentication** with access and refresh token patterns
3. **Create authentication middleware** that protects routes and extracts user context
4. **Build role-based access control (RBAC)** with flexible permission systems
5. **Apply security best practices** to prevent common authentication vulnerabilities

---

## 📚 Lessons

| #   | Lesson                                                                         | Description                                                  | Duration |
| --- | ------------------------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| 1   | [Password Hashing with bcrypt](./01-password-hashing-bcrypt.md)                | Secure password storage, hashing vs encryption, cost factors | 45 min   |
| 2   | [JWT Fundamentals](./02-jwt-fundamentals.md)                                   | Token structure, signing algorithms, access/refresh patterns | 50 min   |
| 3   | [Auth Middleware & Protected Routes](./03-auth-middleware-protected-routes.md) | Token extraction, route protection, middleware patterns      | 45 min   |
| 4   | [Role-Based Access Control](./04-role-based-access-control.md)                 | RBAC implementation, permissions, role hierarchies           | 50 min   |

---

## 🏗️ What You'll Build

Throughout this module, you'll implement the complete authentication system for DevJobs Pro:

```
┌─────────────────────────────────────────────────────────────────┐
│                    DevJobs Pro Auth System                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │   Seeker    │    │  Employer   │    │       Admin         │ │
│  │             │    │             │    │                     │ │
│  │ • Browse    │    │ • Post jobs │    │ • All permissions   │ │
│  │ • Apply     │    │ • Manage    │    │ • User management   │ │
│  │ • Profile   │    │   listings  │    │ • Moderation        │ │
│  └──────┬──────┘    └──────┬──────┘    └──────────┬──────────┘ │
│         │                  │                      │            │
│         └──────────────────┼──────────────────────┘            │
│                            ▼                                   │
│              ┌─────────────────────────┐                       │
│              │    Auth Middleware      │                       │
│              │  • JWT Verification     │                       │
│              │  • Role Checking        │                       │
│              │  • Permission Grants    │                       │
│              └────────────┬────────────┘                       │
│                           ▼                                    │
│              ┌─────────────────────────┐                       │
│              │   Secure Password       │                       │
│              │   Storage (bcrypt)      │                       │
│              └─────────────────────────┘                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Prerequisites

Before starting this module, ensure you have:

- Completed Module 10 (Validation & Security)
- Understanding of Express middleware concepts
- PostgreSQL and Drizzle ORM setup from Module 9
- Basic cryptography concepts (helpful but not required)

---

## 📦 Dependencies

You'll install and use these packages:

```bash
# Password hashing
npm install bcrypt
npm install -D @types/bcrypt

# JWT handling
npm install jsonwebtoken
npm install -D @types/jsonwebtoken

# Environment variables (if not already installed)
npm install dotenv
```

---

## 🔐 Security Mindset

Authentication is a security-critical feature. Throughout this module, keep these principles in mind:

1. **Defense in Depth**: Multiple layers of protection
2. **Least Privilege**: Grant minimum necessary permissions
3. **Fail Securely**: Errors should not leak information
4. **Audit Everything**: Log authentication events
5. **Stay Updated**: Monitor for vulnerabilities in dependencies

---

## 📁 Module Structure

After completing this module, your project will have:

```
src/
├── middleware/
│   ├── auth.middleware.ts       # JWT verification
│   └── rbac.middleware.ts       # Role-based access
├── services/
│   └── auth.service.ts          # Auth business logic
├── utils/
│   ├── password.util.ts         # bcrypt wrapper
│   └── jwt.util.ts              # JWT utilities
├── routes/
│   ├── auth.routes.ts           # Login, register, refresh
│   └── protected.routes.ts      # Protected endpoints
└── types/
    └── auth.types.ts            # Auth-related types
```

---

## ⚡ Quick Start

If you want to see the end result before diving in:

```typescript
// Complete auth flow preview
import { hashPassword, verifyPassword } from "./utils/password.util";
import { signAccessToken, verifyAccessToken } from "./utils/jwt.util";
import { authMiddleware, requireRole } from "./middleware/auth.middleware";

// 1. Register: Hash password before storing
const hashedPassword = await hashPassword(plainPassword);

// 2. Login: Verify password and issue token
const isValid = await verifyPassword(plainPassword, hashedPassword);
const token = signAccessToken({ userId, role });

// 3. Protect routes: Verify token and check roles
app.get("/jobs", authMiddleware, requireRole("employer", "admin"), handler);
```

---

## 🚀 Let's Begin!

Ready to secure your API? Start with [Lesson 1: Password Hashing with bcrypt](./01-password-hashing-bcrypt.md).

---

[← Module 10: Validation & Security](../10-validation-security/README.md) | [Module 12: File Uploads →](../12-file-uploads/README.md)
