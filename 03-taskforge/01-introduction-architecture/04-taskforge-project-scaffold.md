# Lesson 04: 🛠️ PROJECT — TaskForge Scaffold

> **Module 01: Introduction & Architecture** | **Lesson 4 of 4** | ⏱️ 60 minutes

---

## 🎯 What We're Building

Set up the complete TaskForge project:
1. Docker Compose with MongoDB 7 + Redis 7
2. Express 5 + Socket.io on the same HTTP server
3. Mongoose connection with event monitoring
4. All Mongoose models (7 collections)
5. Auth middleware with workspace-scoped roles
6. Health check that reports database AND WebSocket status

## Project Structure

```
project/api/
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── .env.example
└── src/
    ├── index.ts              ← Express + Socket.io entry point
    ├── config/index.ts       ← Zod-validated config
    ├── db/connection.ts      ← Mongoose connection
    ├── models/
    │   ├── index.ts          ← Barrel export
    │   ├── user.model.ts
    │   ├── workspace.model.ts
    │   ├── project.model.ts
    │   ├── board.model.ts
    │   ├── task.model.ts
    │   ├── comment.model.ts
    │   ├── activity.model.ts
    │   └── notification.model.ts
    ├── middleware/
    │   ├── auth.ts           ← JWT + workspace role auth
    │   └── errorHandler.ts   ← MongoDB error handling
    ├── socket/index.ts       ← Socket.io setup
    └── utils/logger.ts       ← Pino logger
```

## Steps

```bash
# 1. Start infrastructure
docker compose up -d

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env

# 4. Start dev server
npm run dev

# 5. Verify
curl http://localhost:3002/health
```

---

## ✅ Definition of Done

- [ ] MongoDB and Redis running in Docker
- [ ] Express + Socket.io server starts successfully
- [ ] Health check shows database: "healthy"
- [ ] All 7 Mongoose models defined

---

<div align="center">

**🎉 Module 01 Complete! → [Start Module 02: MongoDB Deep Dive](../02-mongodb-deep-dive/README.md)**

</div>
