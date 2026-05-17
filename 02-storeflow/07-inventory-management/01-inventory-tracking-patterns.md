# Lesson 01: Inventory Tracking Patterns

> **Module 07: Inventory Management** | **Lesson 1 of 4** | ⏱️ 40 minutes

---

## 🎯 Hook: The Flash Sale Nightmare

100 items in stock. 500 users click "Buy" simultaneously. Without proper inventory management, you sell 500 items you don't have. This is called **overselling** — and it's an expensive mistake.

---

## 📖 Theory: Race Conditions in Inventory

```
┌─────────────────────────────────────────────────────────────┐
│         THE OVERSELLING RACE CONDITION                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Time    User A                  User B                    │
│   ────    ──────                  ──────                    │
│   T1      Read stock = 1         Read stock = 1            │
│   T2      Check: 1 >= 1? ✅      Check: 1 >= 1? ✅         │
│   T3      Deduct: stock = 0      Deduct: stock = -1 ❌     │
│                                                              │
│   Result: Stock is -1. You sold an item you don't have.     │
│                                                              │
│   SOLUTION: Use database transactions with row-level locks  │
│                                                              │
│   T1      BEGIN TRANSACTION       (waiting...)              │
│   T2      Read stock = 1                                    │
│   T3      Deduct: stock = 0                                 │
│   T4      COMMIT                  BEGIN TRANSACTION         │
│   T5                              Read stock = 0            │
│   T6                              Check: 0 >= 1? ❌         │
│   T7                              THROW "Out of stock"      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 Code: Atomic Stock Decrement

```typescript
// Safe stock decrement with Prisma
async deductStock(productId: string, quantity: number) {
  const product = await prisma.product.update({
    where: { id: productId },
    data: { stock: { decrement: quantity } },
  });

  // Prisma's decrement is atomic, but check the result
  if (product.stock < 0) {
    // Rollback — this should be inside a transaction
    await prisma.product.update({
      where: { id: productId },
      data: { stock: { increment: quantity } },
    });
    throw new BadRequestError('Insufficient stock');
  }

  return product;
}
```

---

## ✅ Definition of Done

- [ ] Explain the overselling race condition
- [ ] Implement atomic stock decrement with Prisma
- [ ] Use transactions to prevent negative stock

---

<div align="center">

**Module 07** | **Lesson 1** → [Lesson 2](./02-stock-reservations.md)

</div>
