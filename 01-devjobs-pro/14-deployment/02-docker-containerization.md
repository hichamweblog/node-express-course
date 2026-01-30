# Lesson 2: Docker Containerization

## 🎯 The Hook

"It works on my machine."

Every developer has heard (or said) this. Your app runs perfectly locally, but fails spectacularly on a colleague's machine, on the CI server, or in production. Different Node versions, missing dependencies, OS quirks—the list goes on.

**Docker solves this by packaging your app with its entire environment.** The same container that runs on your laptop runs identically in production. No more "works on my machine" excuses.

---

## 📚 Core Theory

### What is Docker?

Docker packages your application and all its dependencies into a **container**—a lightweight, standalone, executable unit that includes everything needed to run your code.

```
┌─────────────────────────────────────────────────────────────────┐
│                 CONTAINERS vs VIRTUAL MACHINES                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   TRADITIONAL VMs              DOCKER CONTAINERS               │
│   ──────────────               ─────────────────               │
│                                                                 │
│   ┌──────────────────┐         ┌──────────────────┐            │
│   │    Your App      │         │    Your App      │            │
│   ├──────────────────┤         ├──────────────────┤            │
│   │   Dependencies   │         │   Dependencies   │            │
│   ├──────────────────┤         ├──────────────────┤            │
│   │   Guest OS       │         │   Container      │            │
│   │   (Full Linux)   │         │   Runtime        │            │
│   │   ~GB of space   │         │   ~MB of space   │            │
│   ├──────────────────┤         └────────┬─────────┘            │
│   │   Hypervisor     │                  │                      │
│   ├──────────────────┤         ┌────────▼─────────┐            │
│   │   Host OS        │         │   Docker Engine  │            │
│   ├──────────────────┤         ├──────────────────┤            │
│   │   Hardware       │         │   Host OS        │            │
│   └──────────────────┘         ├──────────────────┤            │
│                                │   Hardware       │            │
│   Heavy, slow startup          └──────────────────┘            │
│   Full OS per VM               Light, fast startup             │
│                                Shared OS kernel                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Docker Build Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    DOCKER BUILD PROCESS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Dockerfile              Build                    Image        │
│   ──────────              ─────                    ─────        │
│                                                                 │
│   ┌─────────────┐    docker build    ┌─────────────────┐       │
│   │ FROM node   │───────────────────▶│   devjobs:1.0   │       │
│   │ COPY ...    │                    │                 │       │
│   │ RUN npm...  │                    │  Immutable      │       │
│   │ CMD ...     │                    │  Portable       │       │
│   └─────────────┘                    │  Versioned      │       │
│                                      └────────┬────────┘       │
│                                               │                │
│                                      docker run                │
│                                               │                │
│                                               ▼                │
│                                      ┌─────────────────┐       │
│                                      │   Container     │       │
│                                      │   (Running)     │       │
│                                      │                 │       │
│                                      │   Your app      │       │
│                                      │   is live!      │       │
│                                      └─────────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Multi-Stage Builds

Multi-stage builds let you use multiple FROM statements to create optimized images:

```
┌─────────────────────────────────────────────────────────────────┐
│                    MULTI-STAGE BUILD                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Stage 1: Builder                Stage 2: Production           │
│   ────────────────                ───────────────────           │
│                                                                 │
│   ┌─────────────────┐            ┌─────────────────┐           │
│   │ Full Node.js    │            │ Minimal Node.js │           │
│   │ Dev dependencies│            │ ONLY production │           │
│   │ TypeScript      │            │ dependencies    │           │
│   │ Build tools     │            │                 │           │
│   │                 │            │ Compiled JS     │           │
│   │ ~1.2 GB         │───────────▶│ ~200 MB         │           │
│   └─────────────────┘  COPY      └─────────────────┘           │
│                      dist/ only                                │
│                                                                 │
│   ❌ Not shipped                  ✅ Final image                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Docker Concepts

| Concept        | Description                                       |
| -------------- | ------------------------------------------------- |
| **Image**      | Read-only template with your app and dependencies |
| **Container**  | Running instance of an image                      |
| **Dockerfile** | Recipe for building an image                      |
| **Layer**      | Each instruction creates a cached layer           |
| **Volume**     | Persistent storage outside container              |
| **Network**    | Communication between containers                  |

---

## 💻 Code Examples

### Basic Node.js Dockerfile

**JavaScript:**

```dockerfile
# Dockerfile
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "src/index.js"]
```

### Production-Optimized Multi-Stage Dockerfile

**TypeScript:**

```dockerfile
# Dockerfile

# ================================
# Stage 1: Dependencies
# ================================
FROM node:22-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev for build)
RUN npm ci

# ================================
# Stage 2: Builder
# ================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build TypeScript
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# ================================
# Stage 3: Production
# ================================
FROM node:22-alpine AS production

# Add non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy only what's needed
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# Set environment
ENV NODE_ENV=production

# Use non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]
```

### Development Dockerfile

**Dockerfile.dev:**

```dockerfile
# Dockerfile.dev - For local development with hot reload

FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Don't copy source - we'll mount it as a volume for hot reload
# COPY . .  ← Intentionally omitted

EXPOSE 3000

# Use nodemon for hot reload
CMD ["npm", "run", "dev"]
```

### Docker Compose for Local Development

**docker-compose.yml:**

```yaml
version: "3.8"

services:
  # =========================
  # Express API
  # =========================
  api:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      # Mount source code for hot reload
      - .:/app
      # Prevent node_modules from being overwritten
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://devjobs:devjobs@postgres:5432/devjobs_dev
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=dev-secret-at-least-32-characters-long
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started

  # =========================
  # PostgreSQL Database
  # =========================
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=devjobs
      - POSTGRES_PASSWORD=devjobs
      - POSTGRES_DB=devjobs_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U devjobs -d devjobs_dev"]
      interval: 5s
      timeout: 5s
      retries: 5

  # =========================
  # Redis (for sessions/cache)
  # =========================
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Production Docker Compose

**docker-compose.prod.yml:**

```yaml
version: "3.8"

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 512M
        reservations:
          cpus: "0.5"
          memory: 256M
```

### .dockerignore File

**.dockerignore:**

```
# Dependencies
node_modules
npm-debug.log

# Build output (for non-multi-stage builds)
dist

# Development files
.env
.env.local
.env*.local
*.md
.git
.gitignore

# IDE
.vscode
.idea
*.swp
*.swo

# Testing
coverage
.nyc_output
*.test.js
*.spec.js
__tests__

# Docker
Dockerfile*
docker-compose*
.docker

# OS
.DS_Store
Thumbs.db
```

---

## 🛠️ Mini-Tutorial: Dockerize DevJobs Pro

Let's containerize the DevJobs Pro API with a production-optimized setup.

### Step 1: Create the Dockerfile

Create `Dockerfile` in your project root:

```dockerfile
# ============================================
# DevJobs Pro Production Dockerfile
# ============================================

# ----------------------
# Stage 1: Dependencies
# ----------------------
FROM node:22-alpine AS deps

# Add libc6-compat for Alpine compatibility
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# ----------------------
# Stage 2: Builder
# ----------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# ----------------------
# Stage 3: Runner
# ----------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Set ownership
RUN chown -R expressjs:nodejs /app

USER expressjs

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/index.js"]
```

### Step 2: Create Development Docker Compose

```yaml
# docker-compose.yml
version: "3.8"

services:
  # =============================
  # DevJobs API
  # =============================
  devjobs-api:
    container_name: devjobs-api
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      NODE_ENV: development
      PORT: 3000
      DATABASE_URL: postgresql://devjobs:devjobs123@postgres:5432/devjobs_dev
      JWT_SECRET: development-secret-key-at-least-32-characters
      JWT_EXPIRES_IN: 7d
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
      LOG_LEVEL: debug
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - devjobs-network

  # =============================
  # PostgreSQL
  # =============================
  postgres:
    container_name: devjobs-postgres
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: devjobs
      POSTGRES_PASSWORD: devjobs123
      POSTGRES_DB: devjobs_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U devjobs -d devjobs_dev"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - devjobs-network

  # =============================
  # Redis (Sessions/Cache)
  # =============================
  redis:
    container_name: devjobs-redis
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - devjobs-network

  # =============================
  # pgAdmin (Optional)
  # =============================
  pgadmin:
    container_name: devjobs-pgadmin
    image: dpage/pgadmin4:latest
    ports:
      - "5050:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@devjobs.local
      PGADMIN_DEFAULT_PASSWORD: admin
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    networks:
      - devjobs-network
    profiles:
      - tools # Only start with: docker compose --profile tools up

networks:
  devjobs-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  pgadmin_data:
```

### Step 3: Create Development Dockerfile

```dockerfile
# Dockerfile.dev
FROM node:22-alpine

WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci

# Source will be mounted via volume
EXPOSE 3000

# Use tsx for TypeScript hot reload
CMD ["npm", "run", "dev"]
```

### Step 4: Add Health Check Endpoint

**src/routes/health.ts:**

```typescript
import { Router } from "express";
import { db } from "../db"; // Your database connection

const router = Router();

// Basic health check
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Deep health check (includes dependencies)
router.get("/health/ready", async (req, res) => {
  const checks = {
    database: false,
    timestamp: new Date().toISOString(),
  };

  try {
    // Check database connection
    await db.execute("SELECT 1");
    checks.database = true;
  } catch (error) {
    checks.database = false;
  }

  const allHealthy = Object.values(checks).every(
    (v) => v === true || typeof v === "string",
  );

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? "ready" : "unhealthy",
    checks,
  });
});

export default router;
```

### Step 5: Add npm Scripts

**package.json:**

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "docker:dev": "docker compose up",
    "docker:dev:build": "docker compose up --build",
    "docker:down": "docker compose down",
    "docker:clean": "docker compose down -v --rmi local",
    "docker:build": "docker build -t devjobs-api .",
    "docker:run": "docker run -p 3000:3000 --env-file .env devjobs-api"
  }
}
```

### Step 6: Run It!

```bash
# Start all services
npm run docker:dev

# Or with rebuild
npm run docker:dev:build

# Check logs
docker compose logs -f devjobs-api

# Access the API
curl http://localhost:3000/health

# Stop everything
npm run docker:down

# Full cleanup (removes volumes too)
npm run docker:clean
```

---

## 📝 Practice: DevJobs Pro Docker Setup

### Task 1: Multi-Stage Dockerfile

Create a production Dockerfile with:

- [ ] Dependencies stage
- [ ] Builder stage (TypeScript compilation)
- [ ] Production stage (minimal image)
- [ ] Non-root user
- [ ] Health check

### Task 2: Development Docker Compose

Set up docker-compose.yml with:

- [ ] API service with hot reload
- [ ] PostgreSQL with health check
- [ ] Redis for sessions
- [ ] Persistent volumes
- [ ] Proper networking

### Task 3: Test Your Setup

```bash
# Build and run
docker compose up --build

# Verify services
docker compose ps

# Check health
curl http://localhost:3000/health

# View logs
docker compose logs -f api
```

### Task 4: Optimize Image Size

```bash
# Check image size
docker images devjobs-api

# Goal: Under 250MB for production image
# Compare with non-multi-stage build
```

---

## ⚖️ Pro Tips vs Junior Traps

| Pro Tips 🎯                                         | Junior Traps 💀                                 |
| --------------------------------------------------- | ----------------------------------------------- |
| Use multi-stage builds for small images             | Single Dockerfile with dev dependencies in prod |
| Cache npm install layer (COPY package\*.json first) | Copy everything, then npm install (no cache)    |
| Use .dockerignore (exclude node_modules, .git)      | Copy entire directory including junk            |
| Run as non-root user in production                  | Run as root (security risk)                     |
| Use specific image tags (node:22-alpine)            | Use `latest` tag (unpredictable)                |
| Use Alpine base images (~50MB vs ~1GB)              | Use full debian images unnecessarily            |
| Mount volumes for dev, COPY for prod                | Copy source in dev (no hot reload)              |
| Use health checks in compose                        | No health checks = no dependency ordering       |
| Named volumes for persistent data                   | Anonymous volumes (hard to manage)              |
| Use docker-compose profiles for optional services   | Start everything always                         |

---

## 🔧 5-Minute Debugger

### "Module not found" in Container

```bash
# Problem: Container can't find modules

# Check 1: Is node_modules in .dockerignore?
cat .dockerignore | grep node_modules
# Should be there! Modules should install in container

# Check 2: Did npm ci run successfully?
docker compose logs api | grep -i error

# Check 3: Are you using volume mount correctly?
# The /app/node_modules trick prevents overwrite:
volumes:
  - .:/app
  - /app/node_modules  # ← Anonymous volume protects this

# Fix: Rebuild the container
docker compose down
docker compose build --no-cache
docker compose up
```

### "node_modules sync issues"

```bash
# Problem: Host node_modules conflicts with container

# Solution 1: Use anonymous volume
volumes:
  - .:/app
  - /app/node_modules

# Solution 2: Delete host node_modules
rm -rf node_modules
docker compose up --build

# Solution 3: Install in container only
docker compose exec api npm install new-package

# Then update package.json manually or:
docker compose exec api cat package.json > package.json
```

### "Port mapping confusion"

```yaml
# Problem: Can't connect to container

# Format: HOST:CONTAINER
ports:
  - "3000:3000"  # localhost:3000 → container:3000
  - "8080:3000"  # localhost:8080 → container:3000

# Check what's exposed
docker compose ps

# Check inside container
docker compose exec api netstat -tlnp

# Common mistake: App listening on wrong host
# In container, listen on 0.0.0.0, not localhost
app.listen(3000, '0.0.0.0');  # ✅
app.listen(3000, 'localhost'); # ❌ Container-only
```

### "Container exits immediately"

```bash
# Check exit code
docker compose ps -a

# View logs
docker compose logs api

# Common causes:
# 1. Missing environment variables
# 2. Database not ready (use depends_on + healthcheck)
# 3. Build error (check npm run build locally)

# Debug interactively
docker compose run --rm api sh
# Now you're in the container, poke around
```

---

## ✅ Definition of Done Checklist

Before moving to Lesson 3, verify:

- [ ] **Multi-stage Dockerfile** created and builds successfully
- [ ] **docker-compose.yml** with API, PostgreSQL, Redis
- [ ] **Health endpoints** implemented and responding
- [ ] **Hot reload works** in development containers
- [ ] **.dockerignore** excludes unnecessary files
- [ ] **Non-root user** in production Dockerfile
- [ ] **Image size** under 300MB for production

### Quick Verification

```bash
# 1. Build production image
docker build -t devjobs-api:test .

# 2. Check size
docker images devjobs-api:test
# Should be under 300MB

# 3. Run production build locally
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=test-secret-32-chars-minimum \
  -e CLOUDINARY_CLOUD_NAME=test \
  -e CLOUDINARY_API_KEY=test \
  -e CLOUDINARY_API_SECRET=test \
  devjobs-api:test

# 4. Test health endpoint
curl http://localhost:3000/health

# 5. Start dev environment
docker compose up -d
docker compose ps  # All should be "running"

# 6. Test hot reload (change a file, see it restart)
```

---

## 🔗 Navigation

| Previous                                                                   | Home                                 | Next                                                                  |
| -------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------- |
| [← Lesson 1: Environment Configuration](./01-environment-configuration.md) | [Module 14: Deployment](./README.md) | [Lesson 3: Deploy to Railway/Render →](./03-deploy-railway-render.md) |

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

---

**Next up:** We'll deploy your containerized API to the cloud! ☁️
