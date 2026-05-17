# Lesson 03: Docker Development Environment

> **Module 01: Introduction & Setup** | **Lesson 3 of 4** | ⏱️ 35 minutes

---

## 🎯 Hook: "It Works on My Machine" Is Not a Solution

You've heard it. Maybe you've even said it. A teammate pulls your code, runs `npm run dev`, and gets a cryptic database error. The fix? "Oh, I'm using PostgreSQL 15. You need 16."

Docker eliminates this **entire class of problems**. With one command — `docker compose up` — every developer gets:

- The exact same PostgreSQL version
- The exact same Redis version
- Pre-configured databases with correct credentials
- Identical to production as possible

```
WITHOUT DOCKER                          WITH DOCKER
──────────────                          ───────────

Dev A: PostgreSQL 14.2                  Dev A: docker compose up → PG 16.2
Dev B: PostgreSQL 16.1                  Dev B: docker compose up → PG 16.2
Dev C: PostgreSQL ???                   Dev C: docker compose up → PG 16.2
CI/CD: PostgreSQL 15.0                  CI/CD: docker compose up → PG 16.2

Result: "Works for me, not you"         Result: "Works everywhere, always"
```

---

## 📖 Theory: Docker Compose for Backend Development

### What Docker Compose Does for Us

We're NOT Dockerizing our Node.js app yet (that's Module 13). Right now, we're using Docker Compose to run our **infrastructure dependencies** — PostgreSQL and Redis.

```
┌────────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT ARCHITECTURE                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   YOUR MACHINE (Host)                                              │
│   ┌──────────────────────────────────────────────────────────┐    │
│   │  Node.js + Express (npm run dev)                         │    │
│   │  ─ Runs natively for fast hot-reload                     │    │
│   │  ─ tsx watch mode                                        │    │
│   │  ─ Connects to containerized services ↓                  │    │
│   └───────────────────────┬──────────────────────────────────┘    │
│                           │                                        │
│   DOCKER COMPOSE          │ localhost:5432   localhost:6379        │
│   ┌───────────────────────┼──────────────────────────────────┐    │
│   │                       │                                   │    │
│   │   ┌───────────────────▼───────────┐  ┌────────────────┐ │    │
│   │   │  PostgreSQL 16                │  │   Redis 7      │ │    │
│   │   │  ──────────────               │  │   ────────     │ │    │
│   │   │  Database: storeflow          │  │   Cache layer  │ │    │
│   │   │  User: storeflow              │  │   Sessions     │ │    │
│   │   │  Port: 5432                   │  │   Port: 6379   │ │    │
│   │   │                               │  │                │ │    │
│   │   │  📁 Volume: ./data/postgres   │  │   📁 data/redis│ │    │
│   │   │  (data persists across        │  │                │ │    │
│   │   │   container restarts)         │  │                │ │    │
│   │   └───────────────────────────────┘  └────────────────┘ │    │
│   │                                                           │    │
│   └───────────────────────────────────────────────────────────┘    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Docker Compose File Anatomy

```yaml
# docker-compose.yml — Every line explained

# Compose file version (v3.8 is stable and widely supported)
version: '3.8'

services:
  # ─── PostgreSQL ─────────────────────────────────────────────
  postgres:
    image: postgres:16-alpine        # Alpine = smaller image (~80MB vs 400MB)
    container_name: storeflow-db     # Human-readable name
    restart: unless-stopped          # Auto-restart on crash

    environment:                     # Database configuration
      POSTGRES_DB: storeflow         # Database name
      POSTGRES_USER: storeflow       # Username
      POSTGRES_PASSWORD: storeflow   # Password (dev only!)

    ports:
      - '5432:5432'                  # host:container port mapping

    volumes:
      - postgres-data:/var/lib/postgresql/data  # Persist data

    healthcheck:                     # Verify DB is ready
      test: ['CMD-SHELL', 'pg_isready -U storeflow']
      interval: 5s
      timeout: 5s
      retries: 5

  # ─── Redis ──────────────────────────────────────────────────
  redis:
    image: redis:7-alpine
    container_name: storeflow-redis
    restart: unless-stopped

    ports:
      - '6379:6379'

    volumes:
      - redis-data:/data

    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 5s
      retries: 5

# Named volumes — Data persists even when containers are deleted
volumes:
  postgres-data:
  redis-data:
```

### Essential Docker Compose Commands

```
┌────────────────────────────────────────────────────────────────────┐
│                   DOCKER COMPOSE CHEAT SHEET                       │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   START & STOP                                                     │
│   ───────────                                                      │
│   docker compose up -d          Start all services (background)   │
│   docker compose down           Stop all services                 │
│   docker compose down -v        Stop + delete all data volumes    │
│                                                                    │
│   MONITORING                                                       │
│   ──────────                                                       │
│   docker compose ps             List running containers           │
│   docker compose logs postgres  View PostgreSQL logs              │
│   docker compose logs -f        Follow all logs (live)            │
│                                                                    │
│   DATABASE ACCESS                                                  │
│   ───────────────                                                  │
│   docker compose exec postgres psql -U storeflow                  │
│     → Opens PostgreSQL shell directly                             │
│                                                                    │
│   docker compose exec redis redis-cli                             │
│     → Opens Redis CLI directly                                    │
│                                                                    │
│   CLEANUP                                                          │
│   ───────                                                          │
│   docker compose down -v        Remove containers + volumes       │
│   docker system prune           Clean unused Docker resources     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Code Examples

### Example 1: Health Check Script

A production pattern — verify all services are healthy before your app starts:

<details>
<summary><strong>🟦 TypeScript Version</strong></summary>

```typescript
// src/utils/healthcheck.ts
// Verify infrastructure dependencies are available

import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

import { logger } from './logger.js';

export const checkDatabaseHealth = async (): Promise<boolean> => {
  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ PostgreSQL connection healthy');
    return true;
  } catch (error) {
    logger.error({ error }, '❌ PostgreSQL connection failed');
    return false;
  } finally {
    await prisma.$disconnect();
  }
};

export const checkRedisHealth = async (): Promise<boolean> => {
  const redis = createClient({ url: process.env.REDIS_URL });
  try {
    await redis.connect();
    await redis.ping();
    logger.info('✅ Redis connection healthy');
    return true;
  } catch (error) {
    logger.error({ error }, '❌ Redis connection failed');
    return false;
  } finally {
    await redis.disconnect();
  }
};

export const checkAllServices = async (): Promise<void> => {
  const results = await Promise.all([
    checkDatabaseHealth(),
    checkRedisHealth(),
  ]);

  const allHealthy = results.every(Boolean);

  if (!allHealthy) {
    logger.fatal('Infrastructure health check failed. Exiting.');
    process.exit(1);
  }

  logger.info('All infrastructure services healthy 🚀');
};
```

</details>

---

## 🔧 5-Minute Debugger: Common Docker Errors

### Error 1: `Port 5432 already in use`

```
Error: Ports are not available: listen tcp 0.0.0.0:5432: bind: address already in use
```

**Cause:** Local PostgreSQL is running on the same port.

**Fix:**
```bash
# Option 1: Stop local PostgreSQL
sudo systemctl stop postgresql

# Option 2: Use a different port in docker-compose.yml
ports:
  - '5433:5432'  # Use 5433 on host
# Update DATABASE_URL: postgresql://storeflow:storeflow@localhost:5433/storeflow
```

### Error 2: `docker compose: command not found`

**Cause:** Older Docker versions use `docker-compose` (with hyphen).

**Fix:**
```bash
# Check Docker version
docker --version

# If using older Docker, use the hyphenated version
docker-compose up -d

# Or update Docker Desktop to latest
```

---

## 💡 Pro Tips vs Junior Traps

| Aspect | 🟢 Pro Tip | 🔴 Junior Trap |
|--------|-----------|----------------|
| **Credentials** | Use simple passwords in dev (`storeflow`). Use strong secrets in production (from vault/env). | Using production credentials in docker-compose.yml and committing to Git |
| **Data persistence** | Use named volumes so data survives container restarts. Use `down -v` only when you want a fresh start. | Wondering why your data disappeared — you used `docker compose down -v` |
| **Health checks** | Add healthchecks to compose file. Your app should wait for services to be ready. | App crashes on startup because PostgreSQL isn't ready yet (takes 2-3 seconds) |

---

## ✅ Definition of Done

You've completed this lesson when you can:

- [ ] Explain why Docker Compose is used for development infrastructure
- [ ] Write a `docker-compose.yml` with PostgreSQL and Redis from memory
- [ ] Start, stop, and monitor Docker services using CLI commands
- [ ] Access PostgreSQL and Redis CLIs through Docker
- [ ] Debug port conflicts and connection issues

---

## 🚀 Next Steps

**→ Next: [Lesson 04 - StoreFlow Project Scaffold](./04-storeflow-project-scaffold.md)**

Time to build! We'll scaffold the entire StoreFlow project with Express 5 + TypeScript + Prisma.

---

<div align="center">

**Module 01: Introduction & Setup** | Lesson 3 of 4

[Lesson 1](./01-course-overview-ecommerce.md) → [Lesson 2](./02-project-setup-prisma-intro.md) → **Lesson 3** → [Lesson 4](./04-storeflow-project-scaffold.md)

</div>
