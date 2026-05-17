# Lesson 01: Prisma Schema Language & Models

> **Module 02: Prisma Deep Dive** | **Lesson 1 of 4** | ⏱️ 45 minutes

---

## 🎯 Hook: Your Database, Declared in Plain English

In Drizzle, you wrote TypeScript to define tables. In Prisma, you write **Prisma Schema Language (PSL)** — a declarative, human-readable format that reads almost like documentation.

```prisma
// This IS your database documentation AND your schema definition
model Product {
  id    String @id @default(uuid())
  name  String
  price Int    // cents — $19.99 = 1999
  stock Int    @default(0)
}
```

From this single file, Prisma generates: SQL migrations, a type-safe client, TypeScript types, and visual documentation. One source of truth for everything.

---

## 📖 Theory: Prisma Schema Language Deep Dive

### The Three Blocks

Every `schema.prisma` file has exactly three types of blocks:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRISMA SCHEMA ANATOMY                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. GENERATOR BLOCK — What to generate                         │
│   ┌───────────────────────────────────────────────────────────┐ │
│   │  generator client {                                       │ │
│   │    provider = "prisma-client-js"  // Generate JS/TS client│ │
│   │  }                                                        │ │
│   └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│   2. DATASOURCE BLOCK — Where your data lives                   │
│   ┌───────────────────────────────────────────────────────────┐ │
│   │  datasource db {                                          │ │
│   │    provider = "postgresql"    // Database type             │ │
│   │    url      = env("DATABASE_URL")  // From .env file      │ │
│   │  }                                                        │ │
│   └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│   3. DATA MODEL — Your tables, columns, and relationships       │
│   ┌───────────────────────────────────────────────────────────┐ │
│   │  model User {                                             │ │
│   │    id    String @id @default(uuid())                      │ │
│   │    email String @unique                                   │ │
│   │    name  String                                           │ │
│   │  }                                                        │ │
│   │                                                           │ │
│   │  enum Role { CUSTOMER ADMIN }                             │ │
│   └───────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Field Types & Attributes

```
┌──────────────────────────────────────────────────────────────────┐
│                    FIELD ANATOMY                                  │
│                                                                   │
│   model Product {                                                │
│     price  Int     @default(0)     @map("price_cents")           │
│     ─────  ───     ──────────      ─────────────────             │
│       │      │         │                  │                       │
│       │      │         │                  └─ Column name in DB    │
│       │      │         └─ Field-level attribute                   │
│       │      └─ Scalar type (Int, String, Boolean, etc.)         │
│       └─ Field name in Prisma Client                             │
│   }                                                              │
│                                                                   │
│   SCALAR TYPES:                                                  │
│   ┌──────────┬─────────────────┬──────────────────────────────┐ │
│   │ Prisma   │ PostgreSQL      │ Use Case                     │ │
│   ├──────────┼─────────────────┼──────────────────────────────┤ │
│   │ String   │ TEXT            │ Names, emails, descriptions  │ │
│   │ Int      │ INTEGER         │ Quantities, prices (cents)   │ │
│   │ Float    │ DOUBLE PREC.    │ Coordinates (NOT money!)     │ │
│   │ Boolean  │ BOOLEAN         │ Flags: isActive, isDefault   │ │
│   │ DateTime │ TIMESTAMP       │ Dates: createdAt, updatedAt  │ │
│   │ Json     │ JSONB           │ Flexible metadata            │ │
│   │ Bytes    │ BYTEA           │ Binary data                  │ │
│   │ BigInt   │ BIGINT          │ Large numbers                │ │
│   │ Decimal  │ DECIMAL         │ Precise math (money alt.)    │ │
│   └──────────┴─────────────────┴──────────────────────────────┘ │
│                                                                   │
│   COMMON ATTRIBUTES:                                             │
│   ┌──────────────────────┬───────────────────────────────────┐  │
│   │ @id                  │ Primary key                       │  │
│   │ @default(value)      │ Default value                     │  │
│   │ @unique              │ Unique constraint                 │  │
│   │ @map("col_name")     │ Map to different column name      │  │
│   │ @updatedAt           │ Auto-update timestamp             │  │
│   │ @relation            │ Define foreign key relationship   │  │
│   │ @@map("table_name")  │ Map to different table name       │  │
│   │ @@unique([a, b])     │ Composite unique constraint       │  │
│   │ @@index([field])     │ Database index for performance    │  │
│   └──────────────────────┴───────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Enums — Type-Safe Constants

```prisma
// Prisma enums become TypeScript enums AND PostgreSQL enums
enum OrderStatus {
  PENDING      // Order created, awaiting payment
  CONFIRMED    // Payment received
  PROCESSING   // Being prepared
  SHIPPED      // In transit
  DELIVERED    // Customer received
  CANCELLED    // Order cancelled
  REFUNDED     // Money returned
}

// Usage in a model:
model Order {
  status OrderStatus @default(PENDING)
}
```

In your TypeScript code:
```typescript
import { OrderStatus } from '@prisma/client';

// Full type safety — can only use valid statuses
await prisma.order.update({
  where: { id: orderId },
  data: { status: OrderStatus.SHIPPED }, // ✅ Autocomplete works!
});
```

---

## 💻 Code Example: StoreFlow Models Explained

<details>
<summary><strong>🟦 Complete Model with Annotations</strong></summary>

```prisma
model Product {
  // === Primary Key ===
  id           String   @id @default(uuid())
  //                          └─ Auto-generates UUID on insert

  // === Business Fields ===
  name         String          // Product display name
  slug         String   @unique // URL-friendly: "wireless-mouse"
  description  String?         // ? = nullable (optional)
  price        Int             // In CENTS: $19.99 = 1999
  comparePrice Int?     @map("compare_price")  // "Was $29.99"
  sku          String   @unique // Stock Keeping Unit: "WM-001"
  stock        Int      @default(0)
  images       String[]        // PostgreSQL array type
  isActive     Boolean  @default(true) @map("is_active")

  // === Foreign Key ===
  categoryId   String   @map("category_id")

  // === Timestamps ===
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  //                     └─ Auto-updates on every save

  // === Relations (not columns — just Prisma metadata) ===
  category     Category    @relation(fields: [categoryId], references: [id])
  cartItems    CartItem[]  // One product → many cart items
  orderItems   OrderItem[] // One product → many order items

  // === Table-level attributes ===
  @@map("products")  // Table name in PostgreSQL
  @@index([categoryId])  // Index for faster category queries
}
```

</details>

---

## 💡 Pro Tips vs Junior Traps

| Aspect | 🟢 Pro Tip | 🔴 Junior Trap |
|--------|-----------|----------------|
| **Naming** | Use camelCase in Prisma, `@map` to snake_case for PostgreSQL convention | Mixing naming conventions — confusing for everyone |
| **Nullable** | Only make fields nullable (`?`) when they're truly optional. Default to required. | Making everything nullable "just in case" — loses type safety |
| **Prices** | Store as `Int` (cents). Never `Float` for money. | Using `Float` — `0.1 + 0.2 ≠ 0.3` in floating point |
| **Arrays** | `String[]` works in PostgreSQL. Use for images, tags. | Storing JSON strings instead of using native arrays |

---

## ✅ Definition of Done

- [ ] Explain the three block types in a Prisma schema
- [ ] List at least 5 scalar types and their PostgreSQL equivalents
- [ ] Use `@map` and `@@map` to control database naming
- [ ] Define enums and use them in models
- [ ] Explain why `@updatedAt` is better than manual timestamp updates

---

## 🚀 Next Steps

**→ Next: [Lesson 02 - Relations & Type-Safe Queries](./02-relations-and-queries.md)**

---

<div align="center">

**Module 02: Prisma Deep Dive** | Lesson 1 of 4

**Lesson 1** → [Lesson 2](./02-relations-and-queries.md) → [Lesson 3](./03-migrations-seeding.md) → [Lesson 4](./04-storeflow-database-setup.md)

</div>
