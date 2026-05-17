# Lesson 01: Production Configuration

> **Module 13: Deployment & Scaling** | **Lesson 1 of 4** | ⏱️ 40 minutes

---

## 🎯 Hook: Development Config Will Get You Hacked in Production

Debug logging exposes internal data. CORS set to `*` allows any origin. Rate limits set too high invite abuse. Production configuration is a security boundary.

---

## 📖 Theory: Environment-Specific Configuration

```
┌─────────────────────────────────────────────────────────────┐
│         DEVELOPMENT vs PRODUCTION CONFIGURATION              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Setting          Development        Production            │
│   ───────          ───────────        ──────────            │
│   LOG_LEVEL        debug              info                  │
│   CORS_ORIGIN      *                  specific domains      │
│   RATE_LIMIT       1000/15min         100/15min             │
│   JWT_EXPIRY       24h (convenient)   15m (secure)          │
│   PRISMA_LOG       query,warn,error   error only            │
│   ERROR_STACK      shown              hidden                │
│   HELMET           relaxed            strict                │
│   HTTPS            optional           required              │
│   DB_POOL_SIZE     5                  20                    │
│   REDIS_MAXMEM     -                  256mb                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 Code: Dockerfile for Production

```dockerfile
# Multi-stage build for smallest production image
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npm run build
RUN npx prisma generate

FROM node:22-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
EXPOSE 3001
USER node

# Run migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
```

---

## ✅ Definition of Done

- [ ] Create production Dockerfile with multi-stage build
- [ ] Configure environment-specific settings
- [ ] Secure all production endpoints

---

<div align="center">

**Module 13** | **Lesson 1** → [Lesson 2](./02-horizontal-scaling-patterns.md)

</div>
