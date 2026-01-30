# Lesson 3: Deploy to Railway/Render

## 🎯 The Hook

You've built an amazing API, written tests, containerized it—but it's still running on your laptop. **Time to go live.**

Modern deployment platforms have revolutionized how we ship apps. No more provisioning servers, configuring nginx, or managing SSL certificates. Push your code, and within minutes, your API is live with a URL you can share with the world.

Let's deploy DevJobs Pro to production! 🚀

---

## 📚 Core Theory

### The Modern Deployment Landscape

```
┌─────────────────────────────────────────────────────────────────┐
│                    PaaS COMPARISON                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Platform    Free Tier       DB Support      Best For          │
│   ────────    ─────────       ──────────      ────────          │
│                                                                 │
│   Railway    $5 credit/mo     PostgreSQL      Quick deploys     │
│              500 hours        MySQL           Side projects     │
│                               Redis           Node.js apps      │
│                                                                 │
│   Render     750 hours/mo     PostgreSQL      Static + APIs     │
│              (web services)   Redis           Monorepos         │
│              Free Postgres    (paid)          Full-stack        │
│                                                                 │
│   Fly.io     3 shared VMs     PostgreSQL      Edge computing    │
│              3GB storage      (Supabase)      Global apps       │
│                                               Low latency       │
│                                                                 │
│   Vercel     Unlimited        External only   Next.js/Frontend  │
│              (serverless)                     Serverless APIs   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                  DEPLOYMENT PIPELINE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐  │
│   │         │     │         │     │         │     │         │  │
│   │   Git   │────▶│  Build  │────▶│  Test   │────▶│ Deploy  │  │
│   │  Push   │     │         │     │         │     │         │  │
│   │         │     │         │     │         │     │         │  │
│   └─────────┘     └────┬────┘     └────┬────┘     └────┬────┘  │
│                        │               │               │        │
│                        ▼               ▼               ▼        │
│                   ┌─────────┐     ┌─────────┐     ┌─────────┐  │
│                   │npm ci   │     │npm test │     │Container │  │
│                   │npm build│     │lint     │     │Start     │  │
│                   └─────────┘     └─────────┘     └─────────┘  │
│                                                        │        │
│                                                        ▼        │
│                                               ┌───────────────┐ │
│                                               │ Health Check  │ │
│                                               │    ✓ OK       │ │
│                                               └───────────────┘ │
│                                                        │        │
│                                                        ▼        │
│                                               ┌───────────────┐ │
│                                               │   🌐 LIVE!    │ │
│                                               │ api.devjobs.  │ │
│                                               │    example    │ │
│                                               └───────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### What Platforms Handle For You

| Concern                   | Traditional           | With PaaS          |
| ------------------------- | --------------------- | ------------------ |
| **Server provisioning**   | Manual EC2/VPS setup  | Automatic          |
| **SSL certificates**      | Certbot/Let's Encrypt | Automatic          |
| **Load balancing**        | nginx/HAProxy config  | Built-in           |
| **Auto-scaling**          | Complex setup         | One slider         |
| **Zero-downtime deploys** | Blue/green scripts    | Automatic          |
| **Rollbacks**             | Manual process        | One click          |
| **Logging**               | ELK stack setup       | Built-in dashboard |
| **Monitoring**            | Prometheus/Grafana    | Built-in           |

---

## 💻 Code Examples

### Health Check Endpoint (Required!)

**JavaScript:**

```javascript
// src/routes/health.js
import { Router } from "express";
import { pool } from "../db/index.js";

const router = Router();

// Liveness probe - is the process running?
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Readiness probe - is the app ready to receive traffic?
router.get("/health/ready", async (req, res) => {
  try {
    // Check database connection
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "ready",
      checks: {
        database: "connected",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      checks: {
        database: "disconnected",
      },
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
```

**TypeScript:**

```typescript
// src/routes/health.ts
import { Router, Request, Response } from "express";
import { db } from "../db";

const router = Router();

interface HealthCheck {
  status: "ok" | "ready" | "unhealthy";
  timestamp: string;
  version?: string;
  checks?: {
    database: "connected" | "disconnected";
  };
  uptime?: number;
}

// Liveness probe
router.get("/health", (req: Request, res: Response) => {
  const health: HealthCheck = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    uptime: process.uptime(),
  };

  res.status(200).json(health);
});

// Readiness probe
router.get("/health/ready", async (req: Request, res: Response) => {
  try {
    await db.execute("SELECT 1");

    const health: HealthCheck = {
      status: "ready",
      timestamp: new Date().toISOString(),
      checks: {
        database: "connected",
      },
    };

    res.status(200).json(health);
  } catch (error) {
    const health: HealthCheck = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      checks: {
        database: "disconnected",
      },
    };

    res.status(503).json(health);
  }
});

export default router;
```

### Railway Configuration

**railway.json:**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### Render Configuration

**render.yaml:**

```yaml
# render.yaml - Infrastructure as Code
services:
  # =========================
  # Web Service (API)
  # =========================
  - type: web
    name: devjobs-api
    env: node
    region: oregon # or frankfurt, singapore, ohio
    plan: free # or starter, standard, pro
    buildCommand: npm ci && npm run build
    startCommand: npm start
    healthCheckPath: /health
    autoDeploy: true # Deploy on git push
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: devjobs-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true # Auto-generate secure value
      - key: CLOUDINARY_CLOUD_NAME
        sync: false # Must set manually
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false

databases:
  # =========================
  # PostgreSQL Database
  # =========================
  - name: devjobs-db
    databaseName: devjobs_prod
    user: devjobs
    plan: free # or starter, standard, pro
    region: oregon
    postgresMajorVersion: "16"
```

### Procfile (Alternative)

**Procfile:**

```
web: npm start
worker: npm run worker
release: npm run db:migrate
```

### Dynamic Port Configuration

**JavaScript:**

```javascript
// src/index.js
import express from "express";
import { config } from "./config/index.js";

const app = express();

// ... middleware and routes ...

// PORT from environment (platforms inject this)
const PORT = process.env.PORT || config.server.port || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});
```

**TypeScript:**

```typescript
// src/index.ts
import express from "express";
import { config } from "./config";

const app = express();

// ... middleware and routes ...

// Important: Bind to 0.0.0.0 for containerized environments
const PORT = process.env.PORT || config.server.port || 3000;
const HOST = "0.0.0.0";

const server = app.listen(Number(PORT), HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`   Environment: ${config.env}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});
```

---

## 🛠️ Mini-Tutorial: Deploy to Railway

Let's deploy DevJobs Pro to Railway with a managed PostgreSQL database.

### Step 1: Prepare Your Project

1. **Ensure health endpoint exists:**

```typescript
// src/routes/health.ts should be created
// Register in app: app.use(healthRouter);
```

2. **Update package.json:**

```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

3. **Commit everything:**

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Create Railway Account & Project

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository

### Step 3: Add PostgreSQL Database

1. In Railway dashboard, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway creates the database and adds `DATABASE_URL` automatically

### Step 4: Configure Environment Variables

In Railway dashboard → Your service → Variables:

```bash
# These are auto-added by Railway
DATABASE_URL=postgresql://...  # ✅ Already set

# Add these manually
NODE_ENV=production
JWT_SECRET=generate-a-secure-32-char-secret-here
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
LOG_LEVEL=info
```

### Step 5: Configure Build Settings

Railway auto-detects Node.js, but you can customize:

1. Go to Settings → Build
2. Ensure build command: `npm ci && npm run build`
3. Start command: `npm start`

Or add `railway.json` to your repo:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30
  }
}
```

### Step 6: Deploy!

Railway deploys automatically on push to `main`.

```bash
# Watch deployment logs
railway logs

# Or in dashboard: Deployments → Click latest → View logs
```

### Step 7: Get Your URL

1. Go to Settings → Networking
2. Click "Generate Domain"
3. You get: `devjobs-api-production.up.railway.app`

### Step 8: Run Database Migrations

```bash
# Option 1: Railway CLI
railway run npm run db:migrate

# Option 2: Add to build command
# Build Command: npm ci && npm run build && npm run db:migrate
```

### Step 9: Test Your Deployment

```bash
# Health check
curl https://your-app.up.railway.app/health

# API test
curl https://your-app.up.railway.app/api/v1/jobs
```

### Step 10: Set Up Custom Domain (Optional)

1. Settings → Networking → Custom Domain
2. Add: `api.devjobs.example.com`
3. Add CNAME record: `api.devjobs.example.com` → `your-app.up.railway.app`
4. Railway handles SSL automatically

---

## 📝 Practice: DevJobs Pro Deployment

### Task 1: Pre-Deployment Checklist

- [ ] Health endpoint returns 200
- [ ] All environment variables documented
- [ ] `npm run build` succeeds locally
- [ ] `npm start` runs the production build
- [ ] No hardcoded secrets in code
- [ ] `engines.node` in package.json

### Task 2: Deploy to Railway

1. [ ] Create Railway account
2. [ ] Connect GitHub repository
3. [ ] Add PostgreSQL database
4. [ ] Configure all environment variables
5. [ ] Deploy and verify health check
6. [ ] Run database migrations

### Task 3: Verify Production

```bash
# Test all endpoints
curl https://your-app.up.railway.app/health
curl https://your-app.up.railway.app/api/v1/jobs
curl -X POST https://your-app.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### Task 4: Set Up Automatic Deployments

- [ ] Push to `main` triggers production deploy
- [ ] Pull requests get preview deployments
- [ ] Configure deploy notifications

---

## ⚖️ Pro Tips vs Junior Traps

| Pro Tips 🎯                          | Junior Traps 💀                     |
| ------------------------------------ | ----------------------------------- |
| Use platform-managed databases       | Self-hosting DB in same container   |
| Set up health checks                 | No health checks = no auto-restart  |
| Use preview deployments for PRs      | Push untested code to production    |
| Monitor first 24 hours closely       | Deploy and forget                   |
| Have rollback plan ready             | No way to quickly revert            |
| Use separate staging environment     | Test only in production             |
| Pin Node.js version in engines       | Use whatever version platform picks |
| Use platform secrets, not .env files | Upload .env to production           |
| Bind to 0.0.0.0, not localhost       | App unreachable in container        |
| Graceful shutdown handling           | Abrupt termination loses requests   |

---

## 🔧 5-Minute Debugger

### "Application failed to start"

```bash
# Check build logs
railway logs --build

# Common causes:
# 1. Missing environment variables
# 2. Build command failed
# 3. Start command wrong

# Verify locally first:
npm ci
npm run build
NODE_ENV=production npm start

# Check Railway variables match your .env.example
```

### "Database connection timeout"

```bash
# Problem: App can't reach database

# Check 1: Is DATABASE_URL set?
# Railway dashboard → Variables → DATABASE_URL should exist

# Check 2: Are you using the internal URL?
# Internal: ${{Postgres.DATABASE_URL}}
# External: postgres://... (for local access)

# Check 3: Connection pool settings
# Production may need different pool sizes
pool: {
  min: 2,
  max: 10,
  idleTimeoutMillis: 30000,
}

# Check 4: SSL required?
# Most platforms require SSL
DATABASE_URL=postgresql://...?sslmode=require
```

### "Build failures"

```bash
# View full build log
railway logs --build

# Common issues:

# 1. TypeScript errors
npm run build  # Test locally first

# 2. Missing dependencies
# Check if devDependencies are installed in build
npm ci  # Uses package-lock.json exactly

# 3. Node version mismatch
# package.json
{
  "engines": {
    "node": ">=20.0.0"
  }
}

# 4. Memory issues during build
# Railway: Settings → Increase build memory
```

### "Health check fails"

```bash
# Problem: Platform can't reach /health

# Check 1: Is health endpoint registered?
curl http://localhost:3000/health  # Test locally

# Check 2: Correct path in config?
# railway.json
{
  "deploy": {
    "healthcheckPath": "/health"  // Not "/api/health"
  }
}

# Check 3: App listening on correct port?
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0');  // Must be 0.0.0.0

# Check 4: Health check slow?
# Increase timeout or optimize endpoint
```

---

## ✅ Definition of Done Checklist

Before moving to Lesson 4, verify:

- [ ] **API deployed** to Railway or Render
- [ ] **Health check** responds with 200
- [ ] **Database connected** and migrations run
- [ ] **All environment variables** configured
- [ ] **Custom domain** set up (optional)
- [ ] **Automatic deploys** from GitHub configured
- [ ] **Can register/login** users
- [ ] **Can CRUD** jobs through API

### Quick Verification

```bash
# 1. Health check
curl https://your-api.up.railway.app/health
# Should return {"status":"ok",...}

# 2. Database connectivity
curl https://your-api.up.railway.app/health/ready
# Should show database: "connected"

# 3. API functionality
curl https://your-api.up.railway.app/api/v1/jobs
# Should return jobs array (empty is OK)

# 4. Auth flow
curl -X POST https://your-api.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "deploy-test@example.com", "password": "Test123!"}'
# Should return user object with token
```

---

## 🔗 Navigation

| Previous                                                               | Home                                 | Next                                                                    |
| ---------------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------- |
| [← Lesson 2: Docker Containerization](./02-docker-containerization.md) | [Module 14: Deployment](./README.md) | [Lesson 4: PM2, Monitoring & Logging →](./04-pm2-monitoring-logging.md) |

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [Fly.io Node.js Guide](https://fly.io/docs/languages-and-frameworks/node/)
- [12-Factor App](https://12factor.net/)

---

**Next up:** We'll ensure your production API stays healthy with PM2, structured logging, and monitoring! 📊
