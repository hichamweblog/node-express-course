# 🛒 Course 2: StoreFlow — E-Commerce Platform

[![Course 2](https://img.shields.io/badge/Course-02-blue?style=for-the-badge)](.)
[![Coming Soon](https://img.shields.io/badge/Status-🚧%20Coming%20Soon-orange?style=for-the-badge)](.)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)

> **Level up your backend skills** — Build a production-ready e-commerce platform with secure payments, real-time inventory, and blazing-fast caching.

---

## 🟢 Course Status

**Active** — This course is ready to learn!

Course 1 (DevJobs Pro) taught you the fundamentals. Course 2 takes those skills and applies them to one of the most challenging and rewarding domains in web development: **e-commerce**.

> 🎯 **Start Learning:** Begin with [Module 01: Introduction & Setup](./01-introduction-setup/README.md)

---

## ✅ Prerequisites

Before starting StoreFlow, you should have:

| Requirement                  | Description                           |
| ---------------------------- | ------------------------------------- |
| ✅ **Course 1: DevJobs Pro** | Completed or equivalent experience    |
| ✅ **Node.js + Express**     | Comfortable building REST APIs        |
| ✅ **TypeScript**            | Strong fundamentals                   |
| ✅ **SQL Basics**            | Understanding of relational databases |
| ✅ **Authentication**        | JWT, sessions, and protected routes   |
| ✅ **Git**                   | Version control proficiency           |

> 💡 **Note:** If you haven't completed Course 1, [start there first](../01-devjobs-pro/). The skills build directly on what you learned.

---

## 🎯 What You'll Build

A **fully-functional e-commerce platform** featuring:

- 📦 **Product Catalog** — Categories, variants, search, and filtering
- 🛒 **Shopping Cart** — Guest carts, persistent carts, cart merging
- 💳 **Secure Checkout** — Multi-step flow with address validation
- 💰 **Stripe Payments** — Payment intents, webhooks, refunds
- 📊 **Order Management** — Order history, status tracking, fulfillment
- 📈 **Inventory System** — Real-time stock, reservations, low-stock alerts
- 👨‍💼 **Admin Dashboard** — Product CRUD, analytics, customer management
- 📧 **Email Notifications** — Order confirmations, shipping updates
- ⚡ **Redis Caching** — Fast product pages, session storage

---

## 🛠️ Tech Stack

| Technology              | Purpose            | Why This Course?                             |
| ----------------------- | ------------------ | -------------------------------------------- |
| **PostgreSQL**          | Primary Database   | Complex queries, ACID transactions           |
| **Prisma ORM**          | Database Toolkit   | New ORM perspective (vs Drizzle in Course 1) |
| **Stripe**              | Payment Processing | Industry-standard, webhooks, real money      |
| **Redis**               | Caching Layer      | Session storage, performance, pub/sub        |
| **React**               | Frontend           | Storefront + Admin Dashboard                 |
| **Node.js + Express 5** | Backend            | Building on Course 1 foundation              |
| **TypeScript**          | Type Safety        | End-to-end type safety with Prisma           |
| **Docker**              | Containerization   | Consistent development environments          |

### 🔄 Why Prisma After Drizzle?

In Course 1, you learned **Drizzle** — a lightweight, SQL-first ORM. In Course 2, you'll master **Prisma** — a schema-first toolkit with powerful migrations and tooling.

**Why learn both?**

- Different teams use different tools
- Make informed technology decisions
- Become a more versatile developer
- Both are popular in production

---

## 📚 Learning Objectives

By completing StoreFlow, you will:

### 🗄️ Master Prisma ORM

- [ ] Write type-safe queries with Prisma Client
- [ ] Design schemas using Prisma Schema Language
- [ ] Handle migrations in dev and production
- [ ] Use Prisma Studio for visual database management
- [ ] Optimize queries and avoid N+1 problems

### 💳 Implement Payment Processing

- [ ] Integrate Stripe Payment Intents API
- [ ] Handle webhooks securely and idempotently
- [ ] Process refunds and handle edge cases
- [ ] Understand PCI compliance basics

### 🛒 Build Shopping Cart & Checkout

- [ ] Design cart architecture (session vs user-based)
- [ ] Implement guest checkout with cart persistence
- [ ] Create multi-step checkout flows
- [ ] Handle cart abandonment and recovery

### 📦 Master Inventory Management

- [ ] Track stock in real-time
- [ ] Implement reservation systems during checkout
- [ ] Handle backorders and low-stock scenarios
- [ ] Build inventory adjustment and audit trails

### 📋 Handle Order Fulfillment

- [ ] Design order state machines
- [ ] Track order status transitions
- [ ] Implement shipping notifications
- [ ] Build order history and tracking

### ⚡ Apply Caching Strategies

- [ ] Set up Redis for Node.js applications
- [ ] Cache product catalogs effectively
- [ ] Implement session storage in Redis
- [ ] Design cache invalidation strategies

---

## 📖 Module Overview

| #   | Module                   | Topics                                                   | Link |
| --- | ------------------------ | -------------------------------------------------------- | ---- |
| 01  | **Introduction & Setup** | Course overview, project architecture, environment setup | [Start →](./01-introduction-setup/README.md) |
| 02  | **Prisma Deep Dive**     | Schema language, models, relations, migrations, seeding  | [Start →](./02-prisma-deep-dive/README.md) |
| 03  | **Product Catalog**      | Schema design, categories, variants, search, pagination  | [Start →](./03-product-catalog/README.md) |
| 04  | **Shopping Cart**        | Cart architecture, guest carts, persistence, merging     | [Start →](./04-shopping-cart/README.md) |
| 05  | **Checkout & Orders**    | Multi-step checkout, order creation, state management    | [Start →](./05-checkout-orders/README.md) |
| 06  | **Stripe Payments**      | Payment intents, webhooks, refunds, PCI compliance       | [Start →](./06-stripe-payments/README.md) |
| 07  | **Inventory Management** | Stock tracking, reservations, alerts, multi-warehouse    | [Start →](./07-inventory-management/README.md) |
| 08  | **Admin Dashboard**      | React admin, product CRUD, order management, analytics   | [Start →](./08-admin-dashboard/README.md) |
| 09  | **Email Notifications**  | Transactional emails, templates, queuing, reliability    | [Start →](./09-email-notifications/README.md) |
| 10  | **Advanced Prisma**      | Transactions, raw SQL, aggregations, full-text search    | [Start →](./10-advanced-prisma/README.md) |
| 11  | **Caching with Redis**   | Product caching, sessions, invalidation, rate limiting   | [Start →](./11-caching-redis/README.md) |
| 12  | **Testing E-Commerce**   | Payment flow tests, mocking, integration tests, CI/CD    | [Start →](./12-testing-ecommerce/README.md) |
| 13  | **Deployment & Scaling** | Production setup, horizontal scaling, monitoring         | [Start →](./13-deployment-scaling/README.md) |

---

## ✨ Project Features

### Customer-Facing Storefront

- 🏷️ **Product Catalog with Categories** — Browse by category, filter, search
- 🛒 **Shopping Cart** — Works for guests and authenticated users
- 💳 **Stripe Checkout** — Secure payment processing
- 📜 **Order History** — View past orders and tracking info
- 👤 **User Accounts** — Profile, addresses, saved payment methods

### Admin Dashboard

- 📦 **Product Management** — Create, edit, delete products and variants
- 📊 **Inventory Tracking** — Real-time stock levels, low-stock alerts
- 📋 **Order Fulfillment** — Process orders, update status, handle refunds
- 👥 **Customer Management** — View customers, order history
- 📈 **Sales Analytics** — Revenue reports, popular products

### Backend Features

- 🔐 **Role-Based Access Control** — Admin vs customer permissions
- 📧 **Email Notifications** — Order confirmations, shipping updates
- ⚡ **Redis Caching** — Fast page loads, optimized queries
- 🔄 **Webhook Handling** — Reliable Stripe event processing
- 📝 **Audit Logs** — Track inventory changes, admin actions

---

## 🗄️ Database Schema Preview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STOREFLOW DATABASE SCHEMA                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│      users       │       │    categories    │       │     products     │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id          PK   │       │ id          PK   │       │ id          PK   │
│ email            │       │ name             │       │ name             │
│ password_hash    │       │ slug             │       │ slug             │
│ name             │       │ description      │       │ description      │
│ role             │       │ parent_id   FK───┼──┐    │ price            │
│ created_at       │       │ created_at       │  │    │ category_id FK───┼───┐
│ updated_at       │       └──────────────────┘  │    │ stock_quantity   │   │
└────────┬─────────┘              ▲               │    │ images           │   │
         │                        └───────────────┘    │ created_at       │   │
         │                      (self-referencing)     └──────────────────┘   │
         │                                                      ▲             │
         │                                                      │             │
         ▼                                                      │             ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│      carts       │       │    cart_items    │       │    categories    │
├──────────────────┤       ├──────────────────┤       │    (linked)      │
│ id          PK   │       │ id          PK   │       └──────────────────┘
│ user_id     FK───┼──┐    │ cart_id     FK───┼───┐
│ session_id       │  │    │ product_id  FK───┼───┼───────────────────────┐
│ expires_at       │  │    │ quantity         │   │                       │
│ created_at       │  │    │ created_at       │   │                       │
└──────────────────┘  │    └──────────────────┘   │                       │
                      │                           │                       │
         ┌────────────┘                           │                       │
         │                                        │                       │
         ▼                                        ▼                       ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│      orders      │       │   order_items    │       │     products     │
├──────────────────┤       ├──────────────────┤       │     (linked)     │
│ id          PK   │       │ id          PK   │       └──────────────────┘
│ user_id     FK   │       │ order_id    FK───┼───┐
│ status           │       │ product_id  FK   │   │
│ total            │       │ quantity         │   │
│ shipping_address │       │ price_at_time    │   │
│ payment_intent   │       │ created_at       │   │
│ created_at       │       └──────────────────┘   │
│ updated_at       │                              │
└──────────────────┘◄─────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  KEY RELATIONSHIPS:                                                         │
│  • Users → Orders (one-to-many)                                             │
│  • Users → Carts (one-to-one active cart)                                   │
│  • Categories → Products (one-to-many)                                      │
│  • Categories → Categories (self-referencing for hierarchy)                 │
│  • Orders → Order Items (one-to-many)                                       │
│  • Carts → Cart Items (one-to-many)                                         │
│  • Products → Cart Items, Order Items (one-to-many)                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Coming After DevJobs Pro

**StoreFlow builds directly on what you learned in Course 1:**

| Course 1: DevJobs Pro | Course 2: StoreFlow          |
| --------------------- | ---------------------------- |
| Express basics        | Advanced Express patterns    |
| Drizzle ORM           | Prisma ORM (new perspective) |
| Basic auth            | Role-based access control    |
| Simple CRUD           | Complex business logic       |
| Job applications      | Payment processing           |
| Basic queries         | Caching & optimization       |
| File uploads          | Email notifications          |
| Deployment basics     | Scaling & monitoring         |

### 📈 Level Up Your Skills

Course 2 isn't just "more code" — it's **harder problems**:

- **Cart Logic:** How do you merge a guest cart with a user cart on login?
- **Inventory Reservations:** How do you prevent overselling during high traffic?
- **Payment Edge Cases:** What happens when a webhook fails? Or arrives twice?
- **Performance:** How do you cache products without showing stale data?

These are the challenges that separate junior developers from mid-level engineers. By the end of StoreFlow, you'll have battle-tested solutions for all of them.

---

## 🔗 Navigation

| Previous                                      | Up                             | Next                  |
| --------------------------------------------- | ------------------------------ | --------------------- |
| [← Course 1: DevJobs Pro](../01-devjobs-pro/) | [📚 All Courses](../README.md) | Course 3: TaskForge → |

---

<div align="center">

## 🛒 Ready to Build Real E-Commerce?

**Complete Course 1 first, then come back ready to level up.**

StoreFlow will transform you from someone who _can_ build APIs
into someone who _knows_ how to build production e-commerce systems.

[![Coming Soon](https://img.shields.io/badge/🚧%20Course%202-Coming%20Soon-orange?style=for-the-badge)](.)

_The best time to learn e-commerce was yesterday. The second best time is when this course launches._

</div>
