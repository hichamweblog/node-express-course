# StoreFlow API

> Production-ready e-commerce backend built with Express 5, TypeScript, Prisma & Stripe

## Quick Start

### 1. Start Infrastructure

```bash
docker compose up -d
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 4. Run Migrations

```bash
npm run db:migrate
```

### 5. Start Development Server

```bash
npm run dev
```

### 6. Verify

```bash
curl http://localhost:3001/health
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Run production build |
| `npm run test` | Run tests with Vitest |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:reset` | Reset database (⚠️ deletes all data) |

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/health` | Health check | ❌ |
| `POST` | `/api/v1/auth/register` | Register user | ❌ |
| `POST` | `/api/v1/auth/login` | Login | ❌ |
| `GET` | `/api/v1/products` | List products | ❌ |
| `GET` | `/api/v1/products/:slug` | Get product | ❌ |
| `GET` | `/api/v1/categories` | List categories | ❌ |
| `GET` | `/api/v1/cart` | Get cart | Optional |
| `POST` | `/api/v1/cart/items` | Add to cart | Optional |
| `POST` | `/api/v1/orders` | Create order | ✅ |
| `GET` | `/api/v1/orders` | List orders | ✅ |
| `POST` | `/api/v1/webhooks/stripe` | Stripe webhook | Stripe |
| `GET` | `/api/v1/admin/products` | Admin products | Admin |
| `GET` | `/api/v1/admin/orders` | Admin orders | Admin |

## Tech Stack

- **Runtime:** Node.js v24 LTS
- **Framework:** Express 5
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL 16 (via Prisma)
- **Cache:** Redis 7
- **Payments:** Stripe
- **Testing:** Vitest + Supertest

## Project Structure

```
src/
├── index.ts              # App entry point
├── config/               # Zod-validated env config
├── db/                   # Prisma client singleton
├── middleware/            # Auth, errors, validation
├── routes/               # Route definitions
├── controllers/          # Request handlers
├── services/             # Business logic
└── utils/                # Logger, helpers
```
