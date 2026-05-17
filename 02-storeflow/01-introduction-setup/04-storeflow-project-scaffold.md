# Lesson 04: 🛠️ PROJECT — StoreFlow Project Scaffold

> **Module 01: Introduction & Setup** | **Lesson 4 of 4** | ⏱️ 60 minutes

---

## 🎯 What We're Building

This is a **hands-on lesson**. By the end, you'll have a fully configured project:

```
02-storeflow/project/api/
├── .env.example              ← Environment variable template
├── .env                      ← Your local environment (gitignored)
├── package.json              ← Dependencies & scripts
├── tsconfig.json             ← TypeScript configuration
├── docker-compose.yml        ← PostgreSQL + Redis
├── prisma/
│   └── schema.prisma         ← Database schema
└── src/
    ├── index.ts              ← Application entry point
    ├── config/
    │   └── index.ts          ← Zod-validated environment config
    ├── middleware/
    │   ├── errorHandler.ts   ← Custom error classes + global handler
    │   ├── auth.ts           ← JWT authentication middleware
    │   └── validate.ts       ← Zod validation middleware
    ├── routes/               ← Route definitions (empty scaffolds)
    ├── controllers/          ← Request handlers (empty scaffolds)
    ├── services/             ← Business logic (empty scaffolds)
    ├── utils/
    │   └── logger.ts         ← Pino structured logging
    └── db/
        └── prisma.ts         ← Prisma client singleton
```

---

## 📖 Step-by-Step Implementation

### Step 1: Package Configuration

Create your `package.json` with all dependencies we'll need across the course:

```json
{
  "name": "storeflow-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset",
    "postinstall": "prisma generate",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  },
  "dependencies": {
    "@prisma/client": "^6.0.0",
    "express": "^5.0.0",
    "zod": "^3.23.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "helmet": "^8.0.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.2.0",
    "stripe": "^17.0.0",
    "ioredis": "^5.4.0",
    "nodemailer": "^6.9.0",
    "multer": "^1.4.5-lts.1",
    "pino": "^9.0.0",
    "pino-pretty": "^11.0.0",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/cors": "^2.8.17",
    "@types/multer": "^1.4.11",
    "@types/nodemailer": "^6.4.14",
    "@types/node": "^22.0.0",
    "prisma": "^6.0.0",
    "typescript": "^5.6.0",
    "tsx": "^4.7.0",
    "vitest": "^2.0.0",
    "supertest": "^7.0.0",
    "@types/supertest": "^6.0.2"
  }
}
```

### Step 2: TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Step 3: Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: storeflow-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: storeflow
      POSTGRES_USER: storeflow
      POSTGRES_PASSWORD: storeflow_dev_password
    ports:
      - '5432:5432'
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U storeflow']
      interval: 5s
      timeout: 5s
      retries: 5

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

volumes:
  postgres-data:
  redis-data:
```

### Step 4: Environment Variables

```bash
# .env.example — Copy to .env and fill in values

# Application
NODE_ENV=development
PORT=3001

# Database (matches docker-compose.yml)
DATABASE_URL="postgresql://storeflow:storeflow_dev_password@localhost:5432/storeflow?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-min-32
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Stripe (test keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# SMTP (use Mailtrap for dev)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass
SMTP_FROM=noreply@storeflow.dev

# Security
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Step 5: Prisma Schema (Initial)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ─────────────────────────────────────────────

enum Role {
  CUSTOMER
  ADMIN
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
}

// ─── MODELS ────────────────────────────────────────────

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  name         String
  role         Role     @default(CUSTOMER)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  addresses Address[]
  cart      Cart?
  orders    Order[]

  @@map("users")
}

model Address {
  id        String  @id @default(uuid())
  userId    String  @map("user_id")
  street    String
  city      String
  state     String
  zipCode   String  @map("zip_code")
  country   String  @default("US")
  isDefault Boolean @default(false) @map("is_default")

  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  orders Order[]

  @@map("addresses")
}

model Category {
  id          String  @id @default(uuid())
  name        String
  slug        String  @unique
  description String?
  imageUrl    String? @map("image_url")
  parentId    String? @map("parent_id")

  parent   Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children Category[] @relation("CategoryHierarchy")
  products Product[]

  @@map("categories")
}

model Product {
  id           String   @id @default(uuid())
  name         String
  slug         String   @unique
  description  String?
  price        Int      // Stored in cents
  comparePrice Int?     @map("compare_price")
  sku          String   @unique
  stock        Int      @default(0)
  images       String[]
  isActive     Boolean  @default(true) @map("is_active")
  categoryId   String   @map("category_id")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  category   Category    @relation(fields: [categoryId], references: [id])
  cartItems  CartItem[]
  orderItems OrderItem[]

  @@map("products")
}

model Cart {
  id        String    @id @default(uuid())
  userId    String?   @unique @map("user_id")
  sessionId String?   @unique @map("session_id")
  expiresAt DateTime? @map("expires_at")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  user  User?      @relation(fields: [userId], references: [id], onDelete: Cascade)
  items CartItem[]

  @@map("carts")
}

model CartItem {
  id        String   @id @default(uuid())
  cartId    String   @map("cart_id")
  productId String   @map("product_id")
  quantity  Int      @default(1)
  createdAt DateTime @default(now()) @map("created_at")

  cart    Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])

  @@unique([cartId, productId])
  @@map("cart_items")
}

model Order {
  id        String      @id @default(uuid())
  userId    String      @map("user_id")
  status    OrderStatus @default(PENDING)
  total     Int         // Stored in cents
  addressId String      @map("address_id")
  createdAt DateTime    @default(now()) @map("created_at")
  updatedAt DateTime    @updatedAt @map("updated_at")

  user    User        @relation(fields: [userId], references: [id])
  address Address     @relation(fields: [addressId], references: [id])
  items   OrderItem[]
  payment Payment?

  @@map("orders")
}

model OrderItem {
  id          String @id @default(uuid())
  orderId     String @map("order_id")
  productId   String @map("product_id")
  quantity    Int
  priceAtTime Int    @map("price_at_time") // Snapshot of price

  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])

  @@map("order_items")
}

model Payment {
  id              String        @id @default(uuid())
  orderId         String        @unique @map("order_id")
  stripePaymentId String?       @unique @map("stripe_payment_id")
  amount          Int           // Stored in cents
  status          PaymentStatus @default(PENDING)
  method          String?
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  order Order @relation(fields: [orderId], references: [id])

  @@map("payments")
}
```

### Step 6: Core Source Files

Now let's create the application code. These follow the **same patterns** you learned in DevJobs Pro:

**Prisma Client Singleton** (`src/db/prisma.ts`):

```typescript
import { PrismaClient } from '@prisma/client';

import { logger } from '../utils/logger.js';

// Singleton pattern — ONE client instance for the entire app
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
export const disconnectPrisma = async (): Promise<void> => {
  await prisma.$disconnect();
  logger.info('Prisma client disconnected');
};
```

**Application Entry Point** (`src/index.ts`):

```typescript
import cors from 'cors';
import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { config } from './config/index.js';
import { disconnectPrisma, prisma } from './db/prisma.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

// ===========================================
// Express 5 Application Setup
// ===========================================

const app = express();

// -------------------------------------------
// Security Middleware
// -------------------------------------------

app.use(helmet());

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// -------------------------------------------
// Body Parsing Middleware
// -------------------------------------------

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// -------------------------------------------
// Request Logging
// -------------------------------------------

app.use((req: Request, _res: Response, next) => {
  logger.info({ method: req.method, url: req.url, ip: req.ip });
  next();
});

// -------------------------------------------
// Health Check
// -------------------------------------------

app.get('/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      message: 'StoreFlow API is running',
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
      services: { database: 'healthy' },
    });
  } catch {
    res.status(503).json({
      success: false,
      message: 'Service degraded',
      services: { database: 'unhealthy' },
    });
  }
});

// -------------------------------------------
// API Routes (mounted incrementally)
// -------------------------------------------

// TODO: Module 02+ — Mount routes as we build them
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/products', productRoutes);
// app.use('/api/v1/cart', cartRoutes);
// app.use('/api/v1/orders', orderRoutes);
// app.use('/api/v1/admin', adminRoutes);
// app.use('/api/v1/webhooks', webhookRoutes);

// -------------------------------------------
// Error Handling
// -------------------------------------------

app.use(notFoundHandler);
app.use(errorHandler);

// -------------------------------------------
// Server Startup
// -------------------------------------------

const startServer = async (): Promise<void> => {
  try {
    // Verify database connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection established');

    app.listen(config.port, () => {
      logger.info(`🚀 StoreFlow API running on port ${config.port}`);
      logger.info(`📍 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 Health: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  await disconnectPrisma();
  process.exit(0);
};

process.on('uncaughtException', (error: Error) => {
  logger.fatal('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.fatal('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();

export default app;
```

---

## ✅ Definition of Done

You've completed this lesson when:

- [ ] All project files are created and match the structure above
- [ ] `docker compose up -d` starts PostgreSQL and Redis
- [ ] `npx prisma migrate dev --name init` creates the database tables
- [ ] `npm run dev` starts the server with no errors
- [ ] `GET /health` returns a success response with database status
- [ ] Prisma Studio (`npm run db:studio`) shows your tables

---

## 🚀 Next Steps

**→ Next Module: [Module 02 - Prisma Deep Dive](../02-prisma-deep-dive/README.md)**

With the scaffold in place, we'll deep-dive into Prisma's query API, relations, and advanced patterns.

---

<div align="center">

**Module 01: Introduction & Setup** | Lesson 4 of 4

[Lesson 1](./01-course-overview-ecommerce.md) → [Lesson 2](./02-project-setup-prisma-intro.md) → [Lesson 3](./03-docker-development-environment.md) → **Lesson 4**

**🎉 Module 01 Complete! → [Start Module 02](../02-prisma-deep-dive/README.md)**

</div>
