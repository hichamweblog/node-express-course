# Lesson 02: Project Setup & Prisma Introduction

> **Module 01: Introduction & Setup** | **Lesson 2 of 4** | ⏱️ 50 minutes

---

## 🎯 Hook: Meet Your New ORM

In DevJobs Pro, you wrote Drizzle queries that looked like SQL:

```typescript
// Drizzle — SQL-like syntax
const users = await db.select().from(usersTable).where(eq(usersTable.email, email));
```

Now meet Prisma — where queries look like **objects**:

```typescript
// Prisma — Object-based syntax
const user = await prisma.user.findUnique({ where: { email } });
```

Same result. Different philosophy. Both are production-ready. By the end of this lesson, you'll understand Prisma's mental model and have it installed in your project.

---

## 📖 Theory: How Prisma Works

### The Prisma Ecosystem

Prisma isn't just an ORM — it's a **toolkit** with three core components:

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PRISMA ECOSYSTEM                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌───────────────────────────────────────────────────────────────┐  │
│   │  1. PRISMA SCHEMA  (schema.prisma)                           │  │
│   │  ─────────────────────────────────                           │  │
│   │  • Single source of truth for your database                  │  │
│   │  • Define models, relations, and enums                       │  │
│   │  • Human-readable, declarative syntax                        │  │
│   │  • NOT TypeScript — it's Prisma Schema Language (PSL)        │  │
│   └───────────────────────────┬───────────────────────────────────┘  │
│                               │                                      │
│              ┌────────────────┼────────────────┐                    │
│              │                │                │                    │
│              ▼                ▼                ▼                    │
│   ┌──────────────────┐ ┌────────────┐ ┌───────────────────┐        │
│   │ 2. PRISMA CLIENT │ │ 3. PRISMA  │ │  4. PRISMA        │        │
│   │ (@prisma/client) │ │   MIGRATE  │ │    STUDIO          │        │
│   │ ─────────────────│ │ ──────────-│ │ ──────────────────│        │
│   │ Auto-generated   │ │ Declarative│ │ Visual database   │        │
│   │ type-safe client │ │ migrations │ │ browser/editor    │        │
│   │ for queries      │ │ from schema│ │ (like pgAdmin)    │        │
│   └──────────────────┘ └────────────┘ └───────────────────┘        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### The Prisma Workflow

Here's how Prisma fits into your development cycle:

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────────┐
│  Write  │     │  Run     │     │ Generated│     │  Use in      │
│  Schema │────▶│  Migrate │────▶│  Client  │────▶│  Your Code   │
│  (.prisma)    │  (CLI)   │     │  (auto)  │     │  (type-safe) │
└─────────┘     └──────────┘     └──────────┘     └──────────────┘
     │                │                │                   │
     │                │                │                   │
     ▼                ▼                ▼                   ▼
  You define       Prisma         TypeScript types     Full autocomplete
  your data        creates SQL    generated from       and error checking
  models           migrations     your schema          at compile time
```

### Prisma Schema Language (PSL)

The schema file is the heart of Prisma. Here's a preview of what ours will look like:

<details>
<summary><strong>🟦 Prisma Schema Preview</strong></summary>

```prisma
// prisma/schema.prisma

// 1. Generator — Tells Prisma what to generate
generator client {
  provider = "prisma-client-js"
}

// 2. Datasource — Database connection
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 3. Enums — Type-safe string unions
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

// 4. Models — Your database tables
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String    @map("password_hash")
  name         String
  role         Role      @default(CUSTOMER)
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  // Relations
  addresses    Address[]
  cart         Cart?
  orders       Order[]

  @@map("users")  // Table name in PostgreSQL
}

model Product {
  id           String    @id @default(uuid())
  name         String
  slug         String    @unique
  description  String?
  price        Int       // Stored in cents: $19.99 = 1999
  comparePrice Int?      @map("compare_price")
  sku          String    @unique
  stock        Int       @default(0)
  images       String[]
  isActive     Boolean   @default(true) @map("is_active")
  categoryId   String    @map("category_id")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  // Relations
  category     Category  @relation(fields: [categoryId], references: [id])
  cartItems    CartItem[]
  orderItems   OrderItem[]

  @@map("products")
}
```

</details>

**Key differences from Drizzle:**

| Aspect | Drizzle | Prisma |
|--------|---------|--------|
| Schema file | `.ts` (TypeScript) | `.prisma` (PSL) |
| Relations | Defined separately with `relations()` | Defined inline with `@relation` |
| Types | Inferred from schema definition | Generated into `@prisma/client` |
| Naming | You control column names directly | Use `@map` for snake_case columns |
| Defaults | Using SQL functions | Using `@default()` directives |

---

## 💻 Code Examples

### Example 1: Prisma Client CRUD Operations

Here's how CRUD operations look with Prisma compared to what you're used to:

<details>
<summary><strong>🟦 TypeScript — Prisma CRUD</strong></summary>

```typescript
// Prisma CRUD — Compare with Drizzle from Course 1

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── CREATE ────────────────────────────────────────────────────

// Drizzle way (Course 1):
// await db.insert(users).values({ email, name, passwordHash });

// Prisma way:
const newUser = await prisma.user.create({
  data: {
    email: 'alice@example.com',
    name: 'Alice Johnson',
    passwordHash: '$2b$10$...',
  },
});
// Returns the full created record with all fields typed!

// ─── READ ──────────────────────────────────────────────────────

// Find one by unique field
const user = await prisma.user.findUnique({
  where: { email: 'alice@example.com' },
});

// Find many with filtering
const activeProducts = await prisma.product.findMany({
  where: {
    isActive: true,
    price: { gte: 1000, lte: 5000 }, // Between $10.00 and $50.00
  },
  orderBy: { createdAt: 'desc' },
  take: 20,  // LIMIT 20
  skip: 0,   // OFFSET 0
});

// Include relations (like SQL JOIN)
const userWithOrders = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    orders: {
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    },
    addresses: true,
  },
});

// ─── UPDATE ────────────────────────────────────────────────────

const updatedProduct = await prisma.product.update({
  where: { id: productId },
  data: {
    price: 2499,       // $24.99
    stock: { decrement: 1 }, // Atomic decrement!
  },
});

// ─── DELETE ────────────────────────────────────────────────────

await prisma.product.delete({
  where: { id: productId },
});

// Soft delete (we'll use this pattern instead)
await prisma.product.update({
  where: { id: productId },
  data: { isActive: false },
});
```

</details>

**Key Takeaways:**
- Prisma returns **fully typed objects** — no manual type assertions
- `include` replaces SQL JOINs with a declarative API
- Atomic operations like `{ decrement: 1 }` prevent race conditions
- Every query is type-checked at compile time

### Example 2: Prisma Transactions

E-commerce needs transactions. Here's how Prisma handles them:

<details>
<summary><strong>🟦 TypeScript — Transactions</strong></summary>

```typescript
// Creating an order is a multi-step transaction:
// 1. Create the order
// 2. Create order items
// 3. Deduct inventory
// 4. Clear the cart
// All must succeed or ALL must fail

const order = await prisma.$transaction(async (tx) => {
  // Step 1: Create the order
  const newOrder = await tx.order.create({
    data: {
      userId: user.id,
      status: 'PENDING',
      total: cartTotal,
      addressId: shippingAddress.id,
    },
  });

  // Step 2: Create order items from cart
  await tx.orderItem.createMany({
    data: cartItems.map((item) => ({
      orderId: newOrder.id,
      productId: item.productId,
      quantity: item.quantity,
      priceAtTime: item.product.price,
    })),
  });

  // Step 3: Deduct inventory for each item
  for (const item of cartItems) {
    const updated = await tx.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });

    // Guard: Don't allow negative stock
    if (updated.stock < 0) {
      throw new Error(`Insufficient stock for ${updated.name}`);
      // This throw rolls back the ENTIRE transaction!
    }
  }

  // Step 4: Clear the cart
  await tx.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return newOrder;
});

// If ANY step fails, nothing is committed to the database
```

</details>

> **💡 Why this matters:** Without the transaction, if step 3 fails after step 1 succeeded, you'd have an order with no inventory deduction — or worse, negative stock. Transactions guarantee **all-or-nothing**.

---

## 🧪 Mini-Tutorial: Initialize a Prisma Project

Let's set up Prisma from scratch. You'll do this in the project scaffold lesson, but let's understand each step first.

**Step 1: Install Prisma**

```bash
npm install prisma --save-dev
npm install @prisma/client
```

**Step 2: Initialize Prisma**

```bash
npx prisma init
```

This creates:
```
prisma/
  schema.prisma    ← Your data models go here
.env               ← DATABASE_URL goes here
```

**Step 3: Write your first model**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    String @id @default(uuid())
  email String @unique
  name  String
}
```

**Step 4: Create and apply migration**

```bash
npx prisma migrate dev --name init
```

**Step 5: Generate the client**

```bash
npx prisma generate
```

**Step 6: Use in your code**

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Full type safety — try typing "prisma.user." and see autocomplete!
```

---

## 🔧 5-Minute Debugger: Common Prisma Errors

### Error 1: `Error: P1001 — Can't reach database server`

```
Error: P1001: Can't reach database server at `localhost:5432`
```

**Cause:** PostgreSQL isn't running, or your DATABASE_URL is wrong.

**Fix:**
```bash
# Check if PostgreSQL is running
docker compose ps

# Verify your .env
# DATABASE_URL="postgresql://user:password@localhost:5432/storeflow?schema=public"

# Start PostgreSQL with Docker
docker compose up -d postgres
```

### Error 2: `Error: P2002 — Unique constraint violation`

```
Error: P2002: Unique constraint failed on the fields: (`email`)
```

**Cause:** Trying to create a record with a duplicate unique field.

**Fix:**
```typescript
// Use upsert instead of create when duplicates are possible
const user = await prisma.user.upsert({
  where: { email },
  update: { name },      // If exists, update
  create: { email, name, passwordHash },  // If not, create
});
```

### Error 3: `@prisma/client did not initialize yet`

```
Error: @prisma/client did not initialize yet. Please run "prisma generate"
```

**Cause:** You changed the schema but forgot to regenerate the client.

**Fix:**
```bash
npx prisma generate
```

> **💡 Pro Tip:** Add `prisma generate` to your `postinstall` script in package.json so it auto-runs:
> ```json
> "scripts": {
>   "postinstall": "prisma generate"
> }
> ```

---

## 💡 Pro Tips vs Junior Traps

| Aspect | 🟢 Pro Tip | 🔴 Junior Trap |
|--------|-----------|----------------|
| **Client instantiation** | Create ONE PrismaClient instance and reuse it across your app. Export from a shared module. | Creating `new PrismaClient()` in every file — exhausts database connections |
| **Selecting fields** | Use `select` to fetch only needed fields. Reduces data transfer and improves performance. | Always fetching all fields with `include` — sends `passwordHash` to the client! |
| **Migration naming** | Use descriptive names: `--name add_product_sku_column`. Future you will thank you. | Using `--name migration1` — impossible to understand migration history |
| **Schema formatting** | Run `npx prisma format` after editing schema. It auto-formats and validates. | Manually formatting .prisma files — wasting time on syntax errors |

---

## ✅ Definition of Done

You've completed this lesson when you can:

- [ ] Explain the three components of Prisma (Schema, Client, Migrate)
- [ ] Describe the Prisma workflow: Schema → Migrate → Generate → Use
- [ ] Write a basic Prisma schema with models and relations
- [ ] Compare Prisma's query API with Drizzle's (at least 3 differences)
- [ ] Initialize Prisma in a new project from memory
- [ ] Debug the three common Prisma errors covered in this lesson

---

## 🚀 Next Steps

**→ Next: [Lesson 03 - Docker Development Environment](./03-docker-development-environment.md)**

We'll set up a Docker Compose environment with PostgreSQL and Redis — so every developer on your team has an identical setup.

---

<div align="center">

**Module 01: Introduction & Setup** | Lesson 2 of 4

[Lesson 1](./01-course-overview-ecommerce.md) → **Lesson 2** → [Lesson 3](./03-docker-development-environment.md) → [Lesson 4](./04-storeflow-project-scaffold.md)

</div>
