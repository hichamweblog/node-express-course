# Lesson 1: Environment Configuration

## 🎯 The Hook

Your app runs perfectly on your laptop. You deploy it, and suddenly:

- Database connection fails
- JWT tokens are invalid
- API keys are exposed in your Git history
- Logging floods your console

**The same code behaves differently in development, staging, and production.** Environment configuration is how you control that behavior—safely and reliably.

---

## 📚 Core Theory

### What Are Environment Variables?

Environment variables are key-value pairs that exist outside your code but influence how it runs. They solve the **configuration problem**: your app needs different settings in different contexts.

```
┌─────────────────────────────────────────────────────────────────┐
│              ENVIRONMENT CONFIGURATION FLOW                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   SOURCES                    VALIDATION           APPLICATION  │
│   ───────                    ──────────           ───────────  │
│                                                                 │
│   ┌───────────┐                                                 │
│   │  .env     │───┐                                             │
│   │  file     │   │                                             │
│   └───────────┘   │         ┌───────────┐      ┌───────────┐   │
│                   │         │           │      │           │   │
│   ┌───────────┐   ├────────▶│   Zod     │─────▶│  Config   │   │
│   │ Platform  │───┤         │  Schema   │      │  Object   │   │
│   │ Secrets   │   │         │           │      │           │   │
│   └───────────┘   │         └─────┬─────┘      └─────┬─────┘   │
│                   │               │                  │         │
│   ┌───────────┐   │               ▼                  ▼         │
│   │  System   │───┘         ┌───────────┐      ┌───────────┐   │
│   │  Env Vars │             │  FAIL if  │      │  Type-    │   │
│   └───────────┘             │  Invalid  │      │  Safe     │   │
│                             └───────────┘      │  Access   │   │
│                                                └───────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### The Three Environments

| Environment     | Purpose                | Characteristics                   |
| --------------- | ---------------------- | --------------------------------- |
| **Development** | Local coding           | Debug logs, fast reload, local DB |
| **Staging**     | Pre-production testing | Production-like, test data        |
| **Production**  | Real users             | Optimized, real data, monitored   |

### Why Not Just Use Config Files?

You might think: "Why not just have `config.dev.json` and `config.prod.json`?"

**Problems with hardcoded config:**

1. **Secrets get committed** — API keys in Git = security breach
2. **Inflexible** — Can't change config without redeploying
3. **Not portable** — Different team members need different values

**Environment variables solve this:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECRETS HIERARCHY                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   MOST SECURE ─────────────────────────────── LEAST SECURE     │
│                                                                 │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│   │   Vault /   │    │  Platform   │    │    .env     │        │
│   │   AWS KMS   │    │  Secrets    │    │   Files     │        │
│   └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│   Production-only    Railway/Render      Local dev only        │
│   Highest security   Good for most       Never commit!         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💻 Code Examples

### Basic dotenv Setup

**JavaScript:**

```javascript
// Load environment variables first thing
import "dotenv/config";

// Access variables
const port = process.env.PORT || 3000;
const dbUrl = process.env.DATABASE_URL;

console.log(`Starting on port ${port}`);
```

**TypeScript:**

```typescript
// src/config/env.ts
import "dotenv/config";

// Type augmentation for process.env
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "staging" | "production";
      PORT: string;
      DATABASE_URL: string;
      JWT_SECRET: string;
    }
  }
}

export {};
```

### Type-Safe Config with Zod Validation

**JavaScript:**

```javascript
// src/config/index.js
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  // App
  NODE_ENV: z
    .enum(["development", "staging", "production"])
    .default("development"),
  PORT: z.string().transform(Number).default("3000"),

  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),

  // Optional
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default("900000"),
  RATE_LIMIT_MAX: z.string().transform(Number).default("100"),
});

// Parse and validate
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

// Derived configuration
export const config = {
  isDev: env.NODE_ENV === "development",
  isProd: env.NODE_ENV === "production",
  isStaging: env.NODE_ENV === "staging",

  server: {
    port: env.PORT,
  },

  database: {
    url: env.DATABASE_URL,
  },

  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
  },

  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },

  logging: {
    level: env.LOG_LEVEL,
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
  },
};
```

**TypeScript:**

```typescript
// src/config/index.ts
import "dotenv/config";
import { z } from "zod";

// Define schema with TypeScript inference
const envSchema = z.object({
  // App
  NODE_ENV: z
    .enum(["development", "staging", "production"])
    .default("development"),
  PORT: z.string().transform(Number).default("3000"),

  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),

  // Optional
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default("900000"),
  RATE_LIMIT_MAX: z.string().transform(Number).default("100"),
});

// Type from schema
type EnvSchema = z.infer<typeof envSchema>;

// Parse and validate - fail fast on invalid config
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export const env: EnvSchema = parsed.data;

// Derived configuration object
export const config = {
  isDev: env.NODE_ENV === "development",
  isProd: env.NODE_ENV === "production",
  isStaging: env.NODE_ENV === "staging",

  server: {
    port: env.PORT,
  },

  database: {
    url: env.DATABASE_URL,
    // Different pool settings per environment
    pool: {
      min: env.NODE_ENV === "production" ? 5 : 1,
      max: env.NODE_ENV === "production" ? 20 : 5,
    },
  },

  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
  },

  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },

  logging: {
    level: env.LOG_LEVEL,
    // Pretty print in dev, JSON in production
    pretty: env.NODE_ENV === "development",
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
  },
} as const;

// Type for config
export type Config = typeof config;
```

### Environment-Specific Configuration

**JavaScript/TypeScript:**

```typescript
// src/config/environments/development.ts
export const developmentConfig = {
  logging: {
    level: "debug",
    pretty: true,
  },
  rateLimit: {
    windowMs: 60000, // 1 minute
    max: 1000, // Very permissive for testing
  },
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
  },
};

// src/config/environments/production.ts
export const productionConfig = {
  logging: {
    level: "info",
    pretty: false, // JSON for log aggregators
  },
  rateLimit: {
    windowMs: 900000, // 15 minutes
    max: 100, // Strict limits
  },
  cors: {
    origin: ["https://devjobs.example.com"],
  },
};

// src/config/environments/index.ts
import { developmentConfig } from "./development";
import { productionConfig } from "./production";

const configs = {
  development: developmentConfig,
  staging: productionConfig, // Staging uses production config
  production: productionConfig,
};

export const getEnvironmentConfig = (env: string) => {
  return configs[env as keyof typeof configs] || developmentConfig;
};
```

### The .env Files

**.env.example (commit this!):**

```bash
# ==============================================
# DevJobs Pro Environment Configuration
# ==============================================
# Copy this file to .env and fill in your values
# NEVER commit .env files!

# App
NODE_ENV=development
PORT=3000

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/devjobs_dev

# Authentication
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Cloudinary (File Uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Logging
LOG_LEVEL=debug

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=1000
```

**.env (local development - NEVER commit):**

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://devjobs:localpass@localhost:5432/devjobs_dev
JWT_SECRET=dev-secret-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=my-cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abcdef123456
LOG_LEVEL=debug
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=1000
```

**.gitignore:**

```gitignore
# Environment files
.env
.env.local
.env.*.local
.env.production

# Keep example file
!.env.example
```

---

## 🛠️ Mini-Tutorial: Type-Safe Config Module

Let's build a complete, production-ready configuration system for DevJobs Pro.

### Step 1: Install Dependencies

```bash
npm install dotenv zod
npm install -D @types/node
```

### Step 2: Create the Config Directory Structure

```
src/
└── config/
    ├── index.ts          # Main config export
    ├── env.schema.ts     # Zod validation schema
    └── environments/
        ├── index.ts
        ├── development.ts
        └── production.ts
```

### Step 3: Define the Environment Schema

**src/config/env.schema.ts:**

```typescript
import { z } from "zod";

// Custom transformers
const numberString = z.string().transform((val) => {
  const num = Number(val);
  if (isNaN(num)) throw new Error(`Invalid number: ${val}`);
  return num;
});

const booleanString = z
  .string()
  .transform((val) => val === "true" || val === "1");

export const envSchema = z.object({
  // =========================
  // Application
  // =========================
  NODE_ENV: z
    .enum(["development", "staging", "production", "test"])
    .default("development"),
  PORT: numberString.default("3000"),
  API_VERSION: z.string().default("v1"),

  // =========================
  // Database
  // =========================
  DATABASE_URL: z.string().url().min(1, "DATABASE_URL is required"),
  DATABASE_POOL_MIN: numberString.default("2"),
  DATABASE_POOL_MAX: numberString.default("10"),

  // =========================
  // Authentication
  // =========================
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters for security"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  BCRYPT_ROUNDS: numberString.default("12"),

  // =========================
  // Cloudinary
  // =========================
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET required"),

  // =========================
  // Email (optional)
  // =========================
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: numberString.optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // =========================
  // Logging & Monitoring
  // =========================
  LOG_LEVEL: z
    .enum(["error", "warn", "info", "debug", "trace"])
    .default("info"),
  LOG_FORMAT: z.enum(["json", "pretty"]).default("json"),

  // =========================
  // Rate Limiting
  // =========================
  RATE_LIMIT_WINDOW_MS: numberString.default("900000"), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: numberString.default("100"),

  // =========================
  // CORS
  // =========================
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((val) => val.split(",")),

  // =========================
  // Feature Flags
  // =========================
  ENABLE_SWAGGER: booleanString.default("true"),
  ENABLE_REQUEST_LOGGING: booleanString.default("true"),
});

export type Env = z.infer<typeof envSchema>;
```

### Step 4: Create the Main Config Module

**src/config/index.ts:**

```typescript
import "dotenv/config";
import { envSchema, type Env } from "./env.schema";

// ==============================================
// Validate Environment Variables
// ==============================================
function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("\n❌ Environment validation failed!\n");
    console.error("Missing or invalid variables:");

    const errors = result.error.flatten().fieldErrors;
    Object.entries(errors).forEach(([key, messages]) => {
      console.error(`  ${key}:`);
      messages?.forEach((msg) => console.error(`    - ${msg}`));
    });

    console.error("\n📝 See .env.example for required variables\n");
    process.exit(1);
  }

  return result.data;
}

// Parse once at startup
const env = validateEnv();

// ==============================================
// Derived Configuration
// ==============================================
export const config = {
  // Environment flags
  env: env.NODE_ENV,
  isDev: env.NODE_ENV === "development",
  isProd: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",

  // Server
  server: {
    port: env.PORT,
    apiVersion: env.API_VERSION,
  },

  // Database
  database: {
    url: env.DATABASE_URL,
    pool: {
      min: env.DATABASE_POOL_MIN,
      max: env.DATABASE_POOL_MAX,
    },
  },

  // Authentication
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
    jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    bcryptRounds: env.BCRYPT_ROUNDS,
  },

  // Cloudinary
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },

  // Email
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.EMAIL_FROM,
    enabled: Boolean(env.SMTP_HOST && env.SMTP_USER),
  },

  // Logging
  logging: {
    level: env.LOG_LEVEL,
    format: env.LOG_FORMAT,
    pretty: env.LOG_FORMAT === "pretty" || env.NODE_ENV === "development",
  },

  // Rate Limiting
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
  },

  // CORS
  cors: {
    origins: env.CORS_ORIGINS,
  },

  // Feature Flags
  features: {
    swagger: env.ENABLE_SWAGGER,
    requestLogging: env.ENABLE_REQUEST_LOGGING,
  },
} as const;

// Export type
export type Config = typeof config;

// ==============================================
// Usage Example
// ==============================================
// import { config } from './config';
//
// app.listen(config.server.port, () => {
//   console.log(`Server running on port ${config.server.port}`);
// });
```

### Step 5: Use Config Throughout Your App

**src/app.ts:**

```typescript
import express from "express";
import cors from "cors";
import { config } from "./config";

const app = express();

// CORS with config
app.use(
  cors({
    origin: config.cors.origins,
    credentials: true,
  }),
);

// Conditional middleware
if (config.features.requestLogging) {
  // Add request logging
}

if (config.features.swagger && config.isDev) {
  // Setup Swagger UI
}

app.listen(config.server.port, () => {
  console.log(
    `🚀 Server running in ${config.env} mode on port ${config.server.port}`,
  );
});
```

---

## 📝 Practice: DevJobs Pro Environment Configuration

### Task 1: Create Your Environment Schema

Create `src/config/env.schema.ts` with all variables needed for DevJobs Pro:

- [ ] DATABASE_URL (required)
- [ ] JWT_SECRET (required, min 32 chars)
- [ ] CLOUDINARY credentials (required)
- [ ] LOG_LEVEL (default based on environment)
- [ ] Rate limit settings

### Task 2: Implement Config Module

- [ ] Create `src/config/index.ts`
- [ ] Validate all environment variables at startup
- [ ] Export typed config object
- [ ] Fail fast with helpful error messages

### Task 3: Create .env Files

```bash
# Create files
touch .env .env.example

# Make sure .env is gitignored
echo ".env" >> .gitignore
```

- [ ] Document all variables in `.env.example`
- [ ] Create local `.env` with development values
- [ ] Generate secure JWT_SECRET

### Task 4: Update Application to Use Config

Replace hardcoded values throughout your app:

```typescript
// Before
const PORT = process.env.PORT || 3000;

// After
import { config } from "./config";
const PORT = config.server.port;
```

### Task 5: Test Config Validation

```bash
# Remove required variable
unset JWT_SECRET
npm run dev
# Should fail with clear error message
```

---

## ⚖️ Pro Tips vs Junior Traps

| Pro Tips 🎯                                         | Junior Traps 💀                            |
| --------------------------------------------------- | ------------------------------------------ |
| Fail fast on missing config at startup              | Check env vars lazily, crash in production |
| Use platform secrets (Railway/Render) in production | Use .env files in production               |
| Document every variable in .env.example             | Assume others know what variables exist    |
| Validate and transform env vars with Zod            | Trust `process.env` strings directly       |
| Use different configs per environment               | Same config everywhere                     |
| Generate secrets with crypto                        | Use "password123" as JWT_SECRET            |
| Commit .env.example, gitignore .env                 | Commit .env (security breach!)             |
| Type your config with TypeScript                    | Access `process.env.WHATEVER` directly     |
| Use descriptive variable names                      | Cryptic names like `DB` or `SEC`           |
| Have defaults for optional vars                     | Require every single variable              |

---

## 🔧 5-Minute Debugger

### "Environment variable is undefined"

```typescript
// Problem: Variable not loaded
console.log(process.env.DATABASE_URL); // undefined

// Check 1: Is dotenv loaded FIRST?
// ❌ Wrong order
import { config } from "./config";
import "dotenv/config";

// ✅ Correct order
import "dotenv/config";
import { config } from "./config";

// Check 2: Is .env file in the right location?
// .env must be in project root (where package.json is)

// Check 3: Is the variable spelled correctly?
// DATABASE_URL vs DATABSE_URL (typo)
```

### "Config not loading correctly"

```typescript
// Problem: Config loads but values are wrong

// Debug: Log raw env vars
console.log('Raw env:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
});

// Problem: .env file has quotes
// ❌ Wrong
DATABASE_URL="postgresql://..."

// ✅ Correct (no quotes needed)
DATABASE_URL=postgresql://...

// Problem: Trailing whitespace
// Check with:
cat -A .env  # Shows hidden characters
```

### "Different behavior in production"

```typescript
// Problem: Works in dev, fails in prod

// Check 1: Are ALL required env vars set in platform?
// Railway/Render dashboard → Environment Variables

// Check 2: Is NODE_ENV set correctly?
NODE_ENV = production; // Not "Production" or "prod"

// Check 3: Are defaults being used unexpectedly?
// Add logging to see actual values
console.log("Config:", JSON.stringify(config, null, 2));

// Check 4: Did you redeploy after adding env vars?
// Most platforms require redeploy
```

### "Config validation fails"

```bash
# Error: JWT_SECRET must be at least 32 characters

# Generate secure secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use openssl:
openssl rand -hex 32
```

---

## ✅ Definition of Done Checklist

Before moving to Lesson 2, verify:

- [ ] **Config module created** with Zod validation
- [ ] **All env vars documented** in `.env.example`
- [ ] **Local .env created** and working
- [ ] **.env is gitignored** (verify with `git status`)
- [ ] **App fails fast** on invalid/missing config
- [ ] **Error messages are helpful** (tell you what's wrong)
- [ ] **Config is typed** (TypeScript completion works)
- [ ] **No hardcoded secrets** anywhere in code
- [ ] **Different values possible** per environment

### Quick Verification

```bash
# 1. Check .env is ignored
git status  # Should NOT show .env

# 2. Check validation works
mv .env .env.backup
npm run dev  # Should fail with clear errors

# 3. Restore and verify app starts
mv .env.backup .env
npm run dev  # Should start successfully
```

---

## 🔗 Navigation

| Previous                         | Home                                 | Next                                                                   |
| -------------------------------- | ------------------------------------ | ---------------------------------------------------------------------- |
| [← Module Overview](./README.md) | [Module 14: Deployment](./README.md) | [Lesson 2: Docker Containerization →](./02-docker-containerization.md) |

---

## 📚 Additional Resources

- [dotenv Documentation](https://github.com/motdotla/dotenv)
- [Zod Documentation](https://zod.dev)
- [12-Factor App: Config](https://12factor.net/config)
- [Node.js Environment Best Practices](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)

---

**Next up:** We'll package your app with Docker so it runs consistently everywhere! 🐳
