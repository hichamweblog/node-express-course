# Lesson 01: Course Overview & E-Commerce Architecture

> **Module 01: Introduction & Setup** | **Lesson 1 of 4** | ⏱️ 40 minutes

---

## 🎯 Hook: Why E-Commerce Is the Ultimate Backend Challenge

Every second, Shopify processes **$10,000+ in transactions**. Amazon handles **400+ orders per second** during Prime Day. Behind these numbers lies one of the most complex backend architectures in software engineering.

E-commerce isn't just CRUD. It's **CRUD with money on the line**.

Consider what happens when a customer clicks "Buy Now":

```
Customer clicks "Buy Now"
        │
        ▼
┌──────────────────────────────────────────────────────────────────┐
│  1. Validate cart items still exist                               │
│  2. Check inventory (are items still in stock?)                  │
│  3. Reserve inventory (prevent overselling)                      │
│  4. Validate shipping address                                    │
│  5. Calculate tax (varies by jurisdiction)                       │
│  6. Apply discount codes / coupons                               │
│  7. Create payment intent with Stripe                            │
│  8. Wait for payment confirmation                                │
│  9. Create order record                                          │
│  10. Deduct inventory permanently                                │
│  11. Send confirmation email                                     │
│  12. Clear the cart                                               │
│  13. Update analytics                                            │
└──────────────────────────────────────────────────────────────────┘
        │
        ▼
   Order Confirmed ✅
```

**What if step 8 fails?** You need to release the reserved inventory (step 3). **What if the webhook arrives twice?** You can't charge the customer double. **What if two customers buy the last item simultaneously?** Only one can win.

These are the problems that separate junior developers from mid-level engineers. By the end of StoreFlow, you'll have battle-tested solutions for all of them.

---

## 📖 Theory: E-Commerce Architecture from 30,000 Feet

### The Domains of E-Commerce

Every e-commerce system, from a small Etsy shop to Amazon, shares the same core domains. Understanding these domains is the first step to building a solid architecture.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     E-COMMERCE DOMAIN MAP                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌───────────────────┐     ┌───────────────────┐                      │
│   │  📦 CATALOG       │     │  👤 IDENTITY      │                      │
│   │  ─────────────    │     │  ─────────────    │                      │
│   │  Products         │     │  Users             │                      │
│   │  Categories       │     │  Roles (admin,     │                      │
│   │  Variants         │     │    customer)       │                      │
│   │  Images           │     │  Addresses         │                      │
│   │  Search/Filter    │     │  Profiles          │                      │
│   └────────┬──────────┘     └───────────────────┘                      │
│            │                                                            │
│            ▼                                                            │
│   ┌───────────────────┐     ┌───────────────────┐                      │
│   │  🛒 CART          │────▶│  💳 CHECKOUT       │                      │
│   │  ─────────────    │     │  ─────────────    │                      │
│   │  Add/Remove items │     │  Address entry     │                      │
│   │  Update quantity  │     │  Payment method    │                      │
│   │  Guest carts      │     │  Order review      │                      │
│   │  Cart merging     │     │  Tax calculation   │                      │
│   └───────────────────┘     └────────┬──────────┘                      │
│                                      │                                  │
│                                      ▼                                  │
│   ┌───────────────────┐     ┌───────────────────┐                      │
│   │  📊 INVENTORY     │◀───│  📋 ORDERS         │                      │
│   │  ─────────────    │     │  ─────────────    │                      │
│   │  Stock levels     │     │  Order creation    │                      │
│   │  Reservations     │     │  Status tracking   │                      │
│   │  Low-stock alerts │     │  Fulfillment       │                      │
│   │  Audit trail      │     │  Refunds           │                      │
│   └───────────────────┘     └───────────────────┘                      │
│                                      │                                  │
│                                      ▼                                  │
│                             ┌───────────────────┐                      │
│                             │  💰 PAYMENTS       │                      │
│                             │  ─────────────    │                      │
│                             │  Stripe intents    │                      │
│                             │  Webhook handling  │                      │
│                             │  Refund processing │                      │
│                             │  PCI compliance    │                      │
│                             └───────────────────┘                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Why E-Commerce Is Architecturally Different

Most web apps are "fail-safe" — if something goes wrong, you retry or show an error. E-commerce is **"fail-dangerous"** — mistakes cost real money.

| Normal Web App | E-Commerce App |
|---------------|----------------|
| Duplicate request → minor annoyance | Duplicate request → **double charge** |
| Stale data → slightly wrong display | Stale data → **overselling inventory** |
| Lost request → user retries | Lost request → **lost revenue** |
| Slow response → user waits | Slow response → **cart abandonment** |
| Bug in logic → feature doesn't work | Bug in logic → **financial liability** |

This means e-commerce backends need:

1. **Idempotency** — Processing the same request twice must produce the same result
2. **Transactions** — Multi-step operations must succeed or fail as a unit
3. **Eventual consistency** — Some data can be slightly stale (product views), other data must be exact (inventory)
4. **Audit trails** — Every financial operation must be traceable

### The StoreFlow Architecture

Here's what we'll build — a layered architecture where each layer has a single responsibility:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         STOREFLOW ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────┘

  Clients (Browser, Mobile, Admin Panel)
       │
       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        GATEWAY LAYER                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Helmet  │ │   CORS   │ │  Rate    │ │  JSON    │ │  Logger  │  │
│  │          │ │          │ │  Limiter │ │  Parser  │ │          │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        ROUTER LAYER                                   │
│  ┌────────┐ ┌──────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│  │ /auth  │ │/products │ │ /cart  │ │/orders │ │/admin  │  ...     │
│  └───┬────┘ └────┬─────┘ └───┬────┘ └───┬────┘ └───┬────┘          │
└──────┼──────────┼──────────┼──────────┼──────────┼──────────────────┘
       │          │          │          │          │
       ▼          ▼          ▼          ▼          ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     CONTROLLER LAYER                                  │
│         Validate Input → Call Service → Format Response               │
│    ┌──────────────────────────────────────────────────────────────┐  │
│    │  Zod Validation │ Auth Check │ Role Check │ Param Parsing   │  │
│    └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER  ← Business Logic Lives Here      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Auth    │ │ Product  │ │  Cart    │ │  Order   │ │ Payment  │  │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │ │ Service  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                            │
│  │Inventory │ │  Email   │ │  Cache   │                            │
│  │ Service  │ │ Service  │ │ Service  │                            │
│  └──────────┘ └──────────┘ └──────────┘                            │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                                │
│  ┌──────────────────────────────┐  ┌─────────────────────────────┐  │
│  │      Prisma ORM              │  │        Redis Client         │  │
│  │  Type-safe queries           │  │  Caching & Sessions         │  │
│  │  Transactions                │  │  Rate limiting data         │  │
│  │  Migrations                  │  │  Pub/Sub                    │  │
│  └──────────────┬───────────────┘  └──────────────┬──────────────┘  │
└─────────────────┼──────────────────────────────────┼─────────────────┘
                  │                                  │
                  ▼                                  ▼
         ┌──────────────┐                   ┌──────────────┐
         │  PostgreSQL  │                   │    Redis     │
         │  (Primary)   │                   │   (Cache)    │
         └──────────────┘                   └──────────────┘
```

> **💡 Senior Developer Insight:** Notice how no layer "skips" another. Controllers never touch the database directly. Services never send HTTP responses. This separation makes the system testable, maintainable, and replaceable — you could swap Prisma for Drizzle without touching a single controller.

---

## 🔄 Course 1 vs Course 2: What Changes

You already know Express, TypeScript, and REST APIs from DevJobs Pro. Here's what's **new** and what's **evolved**:

```
┌─────────────────────────────────────────────────────────────────────┐
│              SKILLS EVOLUTION: DevJobs Pro → StoreFlow               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  FAMILIAR (You know this)          NEW (You'll learn this)          │
│  ─────────────────────────         ──────────────────────           │
│  Express 5 routing            →    Complex business workflows      │
│  JWT authentication           →    OAuth + role-based admin        │
│  Zod validation               →    Domain-specific validation      │
│  Basic CRUD                   →    Transactional operations        │
│  Error handling               →    Idempotent error recovery       │
│  Drizzle ORM                  →    Prisma ORM (new paradigm)       │
│  Single database              →    PostgreSQL + Redis (multi-store)│
│  File uploads                 →    Stripe webhooks + payments      │
│  Unit tests                   →    Payment flow integration tests  │
│  Single deploy                →    Horizontal scaling patterns     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Why Prisma After Drizzle?

In the real world, you don't get to choose your ORM. Different teams pick different tools. Learning both makes you versatile:

```
┌───────────────────┬────────────────────────┬───────────────────────┐
│                   │    Drizzle (Course 1)  │   Prisma (Course 2)   │
├───────────────────┼────────────────────────┼───────────────────────┤
│ Philosophy        │ "SQL in TypeScript"    │ "Schema-first toolkit"│
│ Schema Definition │ TypeScript files       │ .prisma schema file   │
│ Query Style       │ SQL-like builders      │ Object-based API      │
│ Migrations        │ SQL files you control  │ Auto-generated        │
│ Type Safety       │ Inferred from schema   │ Generated client      │
│ Learning Curve    │ Easy if you know SQL   │ Easy if you know ORMs │
│ Best For          │ SQL-heavy projects     │ Rapid development     │
│ Bundle Size       │ Tiny (~30KB)           │ Larger (generated)    │
│ Visual Tools      │ Drizzle Studio         │ Prisma Studio         │
└───────────────────┴────────────────────────┴───────────────────────┘
```

> **Neither is "better."** Drizzle gives you more SQL control. Prisma gives you faster development with better DX. Senior engineers know both and pick based on project needs.

---

## 🛠️ What We'll Build: StoreFlow Feature Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        STOREFLOW — FEATURE MAP                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   CUSTOMER EXPERIENCE                    ADMIN EXPERIENCE               │
│   ───────────────────                    ────────────────               │
│                                                                         │
│   📦 Browse products by category         📊 Sales dashboard             │
│   🔍 Search with full-text + filters     📦 Product CRUD + images       │
│   🛒 Add to cart (guest or logged in)    📋 Order management            │
│   👤 Create account / login              👥 Customer list               │
│   📍 Manage shipping addresses           📈 Inventory tracking          │
│   💳 Checkout with Stripe                💰 Revenue reports             │
│   📧 Order confirmation emails           🔔 Low-stock alerts            │
│   📜 View order history                  ⚙️  Store settings              │
│   ⭐ Track order status                                                 │
│                                                                         │
│   BACKEND SYSTEMS                        INFRASTRUCTURE                 │
│   ───────────────                        ──────────────                 │
│                                                                         │
│   🔐 JWT auth + refresh tokens           🐳 Docker Compose              │
│   🛡️ RBAC (admin, customer)              ⚡ Redis caching               │
│   ✅ Zod validation everywhere           📝 Pino structured logging     │
│   🔄 Stripe webhook processing           🧪 Vitest + Supertest          │
│   📦 Inventory reservation system        🚀 Production deployment       │
│   💌 Transactional email system          📊 Health checks               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema Overview

Here's the full database schema we'll build incrementally across the course:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    STOREFLOW DATABASE SCHEMA                            │
│                    (Prisma + PostgreSQL)                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐        │
│  │    User      │       │   Category   │       │   Product    │        │
│  ├──────────────┤       ├──────────────┤       ├──────────────┤        │
│  │ id       PK  │       │ id       PK  │   ┌──▶│ id       PK  │        │
│  │ email        │       │ name         │   │   │ name         │        │
│  │ passwordHash │       │ slug         │   │   │ slug         │        │
│  │ name         │       │ description  │   │   │ description  │        │
│  │ role         │       │ imageUrl     │   │   │ price        │        │
│  │ createdAt    │       │ parentId FK──┼───┘   │ comparePrice │        │
│  │ updatedAt    │       │ createdAt    │       │ sku          │        │
│  └──────┬───────┘       └──────────────┘       │ categoryId FK│        │
│         │                (self-referencing      │ stock        │        │
│         │                 for hierarchy)        │ images[]     │        │
│         │                                      │ isActive     │        │
│         ▼                                      │ createdAt    │        │
│  ┌──────────────┐                              └──────┬───────┘        │
│  │   Address    │                                     │                │
│  ├──────────────┤       ┌──────────────┐              │                │
│  │ id       PK  │       │     Cart     │              │                │
│  │ userId   FK  │       ├──────────────┤              │                │
│  │ street       │       │ id       PK  │     ┌────────┘                │
│  │ city         │       │ userId   FK  │     │                         │
│  │ state        │       │ sessionId    │     │  ┌──────────────┐       │
│  │ zipCode      │       │ expiresAt    │     │  │  CartItem    │       │
│  │ country      │       │ createdAt    │     │  ├──────────────┤       │
│  │ isDefault    │       └──────┬───────┘     │  │ id       PK  │       │
│  └──────────────┘              │             │  │ cartId   FK  │       │
│                                └─────────────┼─▶│ productId FK │       │
│                                              │  │ quantity     │       │
│  ┌──────────────┐       ┌──────────────┐     │  │ createdAt    │       │
│  │    Order     │       │  OrderItem   │     │  └──────────────┘       │
│  ├──────────────┤       ├──────────────┤     │                         │
│  │ id       PK  │──────▶│ id       PK  │     │                         │
│  │ userId   FK  │       │ orderId  FK  │     │                         │
│  │ status       │       │ productId FK─┼─────┘                         │
│  │ total        │       │ quantity     │                               │
│  │ addressId FK │       │ priceAtTime  │                               │
│  │ paymentId    │       │ createdAt    │                               │
│  │ stripeId     │       └──────────────┘                               │
│  │ createdAt    │                                                      │
│  │ updatedAt    │       ┌──────────────┐                               │
│  └──────────────┘       │   Payment    │                               │
│                         ├──────────────┤                               │
│                         │ id       PK  │                               │
│                         │ orderId  FK  │                               │
│                         │ stripePayId  │                               │
│                         │ amount       │                               │
│                         │ status       │                               │
│                         │ method       │                               │
│                         │ createdAt    │                               │
│                         └──────────────┘                               │
│                                                                         │
│  KEY: PK = Primary Key, FK = Foreign Key                               │
└─────────────────────────────────────────────────────────────────────────┘
```

We'll build this schema **incrementally** — starting with Users and Products in Module 02, then adding Cart, Orders, and Payments as we progress.

---

## 📊 The Order Lifecycle: A State Machine

One of the most important concepts in e-commerce is the **order state machine**. Every order moves through well-defined states:

```
                          ┌─────────────┐
                          │   PENDING    │  ← Order created, awaiting payment
                          └──────┬──────┘
                                 │
                    Payment confirmed (webhook)
                                 │
                                 ▼
                          ┌─────────────┐
                          │  CONFIRMED  │  ← Payment received
                          └──────┬──────┘
                                 │
                       Admin begins fulfillment
                                 │
                                 ▼
                          ┌─────────────┐
                          │ PROCESSING  │  ← Being prepared for shipping
                          └──────┬──────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
             ┌───────────┐ ┌─────────┐ ┌──────────┐
             │  SHIPPED  │ │ ON_HOLD │ │CANCELLED │
             └─────┬─────┘ └─────────┘ └──────────┘
                   │
           Delivery confirmed
                   │
                   ▼
             ┌───────────┐
             │ DELIVERED  │
             └─────┬─────┘
                   │
            Customer requests
                   │
                   ▼
             ┌───────────┐
             │  REFUNDED  │
             └───────────┘
```

> **🔴 Critical Rule:** State transitions are **one-directional**. A DELIVERED order can become REFUNDED, but a REFUNDED order can never become DELIVERED. Your code must enforce these transitions.

---

## 💡 Pro Tips vs Junior Traps

| Aspect | 🟢 Pro Tip | 🔴 Junior Trap |
|--------|-----------|----------------|
| **Money handling** | Store prices as integers (cents): `$19.99 → 1999`. Use Decimal/BigInt for calculations. Never use floating point for money. | Using `float` for prices: `0.1 + 0.2 = 0.30000000000000004` — customer gets charged wrong amount |
| **Inventory** | Reserve stock during checkout, release if payment fails. Use database transactions. | Deducting stock when added to cart — items get "locked" by abandoned carts forever |
| **Idempotency** | Use idempotency keys for payment operations. Same key = same result, no matter how many times called. | No idempotency — webhook retry charges customer twice |
| **Cart design** | Support both guest carts (session-based) and user carts. Merge on login. | Requiring login before cart — 35% of customers abandon carts when forced to register |

---

## ✅ Definition of Done

You've completed this lesson when you can:

- [ ] Explain the 6 core domains of e-commerce (catalog, cart, checkout, orders, payments, inventory)
- [ ] Describe why e-commerce backends require idempotency and transactions
- [ ] Draw the order lifecycle state machine from memory
- [ ] Explain why we store prices as integers (cents) instead of floats
- [ ] List 3 architectural differences between StoreFlow and DevJobs Pro
- [ ] Explain why we're learning Prisma after Drizzle

---

## 🚀 Next Steps

**→ Next: [Lesson 02 - Project Setup & Prisma Introduction](./02-project-setup-prisma-intro.md)**

Now that you understand the architecture, let's set up the project and meet your new ORM: Prisma.

---

<div align="center">

**Module 01: Introduction & Setup** | Lesson 1 of 4

[Course Overview](../README.md) • **Lesson 1** → [Lesson 2](./02-project-setup-prisma-intro.md) → [Lesson 3](./03-docker-development-environment.md) → [Lesson 4](./04-storeflow-project-scaffold.md)

</div>
