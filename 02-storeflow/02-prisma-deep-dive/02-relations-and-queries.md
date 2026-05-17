w# Lesson 02: Relations & Type-Safe Queries

> **Module 02: Prisma Deep Dive** | **Lesson 2 of 4** | ⏱️ 50 minutes

---

## 🎯 Hook: Relations Are the Heart of E-Commerce

A product belongs to a category. A cart has many items. An order connects a user, an address, products, and a payment. E-commerce is **all about relationships**.

Prisma makes relations type-safe and intuitive — no manual JOINs, no string-based queries.

---

## 📖 Theory: The Three Relation Types

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PRISMA RELATION TYPES                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   1. ONE-TO-ONE (1:1)                                               │
│   ───────────────────                                               │
│   User ──────── Cart           Each user has at most one cart       │
│                                                                      │
│   model User {                 model Cart {                         │
│     cart Cart?    ←─────────→    userId String @unique              │
│   }                              user   User @relation(...)         │
│                                }                                    │
│                                                                      │
│   2. ONE-TO-MANY (1:N)                                              │
│   ────────────────────                                              │
│   Category ──┬── Product       One category has many products       │
│              ├── Product                                            │
│              └── Product                                            │
│                                                                      │
│   model Category {             model Product {                      │
│     products Product[]  ←───→    categoryId String                  │
│   }                              category Category @relation(...)   │
│                                }                                    │
│                                                                      │
│   3. MANY-TO-MANY (M:N)                                            │
│   ──────────────────────                                            │
│   Product ──┬── Tag            Implicit: Prisma creates join table  │
│             ├── Tag            Explicit: You control the join table │
│   Product ──┘                                                       │
│                                                                      │
│   // Implicit (Prisma manages the join table)                       │
│   model Product { tags Tag[] }                                      │
│   model Tag { products Product[] }                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### StoreFlow Relations Map

```
┌──────────────────────────────────────────────────────────────────┐
│                 STOREFLOW RELATION DIAGRAM                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  User ──1:N──▶ Address     (user has many addresses)             │
│  User ──1:1──▶ Cart        (user has one active cart)            │
│  User ──1:N──▶ Order       (user has many orders)                │
│                                                                   │
│  Category ──1:N──▶ Product       (category has many products)    │
│  Category ──1:N──▶ Category      (self-referencing hierarchy)    │
│                                                                   │
│  Cart ──1:N──▶ CartItem          (cart has many items)           │
│  Product ──1:N──▶ CartItem       (product in many carts)         │
│                                                                   │
│  Order ──1:N──▶ OrderItem        (order has many line items)     │
│  Order ──1:1──▶ Payment          (order has one payment)         │
│  Address ──1:N──▶ Order          (address used for many orders)  │
│                                                                   │
│  SPECIAL: CartItem has @@unique([cartId, productId])             │
│  → Same product can't appear twice in the same cart              │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 💻 Code Examples: Querying Relations

### Include — Eager Loading Relations

```typescript
// Get user WITH their orders and cart
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    orders: {
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    },
    cart: {
      include: { items: { include: { product: true } } },
    },
    addresses: { where: { isDefault: true } },
  },
});

// TypeScript KNOWS the shape:
// user.orders[0].items[0].product.name ← fully typed!
```

### Select — Pick Only What You Need

```typescript
// DON'T send passwordHash to the client!
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
    // passwordHash: false ← omitted = not returned
  },
});
```

### Nested Writes — Create Related Records in One Call

```typescript
// Create user WITH address in a single query
const user = await prisma.user.create({
  data: {
    email: 'alice@example.com',
    name: 'Alice',
    passwordHash: hashedPassword,
    addresses: {
      create: {
        street: '123 Main St',
        city: 'Portland',
        state: 'OR',
        zipCode: '97201',
        isDefault: true,
      },
    },
  },
  include: { addresses: true },
});
```

### Filtering with Relations

```typescript
// Find products in a specific category with stock > 0
const products = await prisma.product.findMany({
  where: {
    category: { slug: 'electronics' },  // Filter by relation!
    stock: { gt: 0 },
    isActive: true,
  },
  include: { category: { select: { name: true, slug: true } } },
  orderBy: { createdAt: 'desc' },
  take: 20,
});
```

---

## 💡 Pro Tips

| Aspect | 🟢 Pro Tip | 🔴 Junior Trap |
|--------|-----------|----------------|
| **N+1 queries** | Use `include` to load relations in one query | Fetching orders, then looping to fetch items — 100 orders = 101 queries |
| **Select vs Include** | Use `select` for API responses (exclude sensitive fields) | Always using `include` — sends `passwordHash` to the frontend |
| **Cascade delete** | Add `onDelete: Cascade` for owned relations (cart items when cart is deleted) | Forgetting cascade — orphaned records fill your database |

---

## ✅ Definition of Done

- [ ] Explain the three Prisma relation types with examples
- [ ] Use `include` to load nested relations
- [ ] Use `select` to limit returned fields
- [ ] Create records with nested `create` in one query
- [ ] Filter by related fields

---

<div align="center">

**Module 02** | Lesson 2 of 4

[Lesson 1](./01-prisma-schema-language.md) → **Lesson 2** → [Lesson 3](./03-migrations-seeding.md) → [Lesson 4](./04-storeflow-database-setup.md)

</div>
