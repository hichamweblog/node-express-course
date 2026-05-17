# Lesson 02: Stock Reservations During Checkout

> **Module 07: Inventory Management** | **Lesson 2 of 4** | ⏱️ 45 minutes

---

## 🎯 The Reservation Pattern

Don't deduct stock permanently when someone starts checkout. **Reserve** it temporarily and release if payment fails.

```
┌───────────────────────────────────────────────────────┐
│            STOCK RESERVATION LIFECYCLE                  │
├───────────────────────────────────────────────────────┤
│                                                        │
│   Available: 10    Reserved: 0    Sold: 0             │
│        │                                               │
│        ▼  User starts checkout (qty: 2)               │
│   Available: 8     Reserved: 2    Sold: 0             │
│        │                                               │
│        ├── Payment SUCCEEDS:                          │
│        │   Available: 8  Reserved: 0  Sold: 2         │
│        │                                               │
│        └── Payment FAILS or TIMEOUT (15 min):         │
│            Available: 10  Reserved: 0  Sold: 0        │
│            (Stock released back)                       │
│                                                        │
└───────────────────────────────────────────────────────┘
```

## 💻 Code: Reservation Service

```typescript
export const inventoryService = {
  async reserveStock(items: { productId: string; quantity: number }[]) {
    return prisma.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        if (product.stock < 0) {
          throw new BadRequestError(`Out of stock: ${product.name}`);
        }
      }
    });
  },

  async releaseStock(items: { productId: string; quantity: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      )
    );
  },
};
```

---

## ✅ Definition of Done

- [ ] Implement stock reservation on checkout start
- [ ] Release stock on payment failure/timeout
- [ ] Confirm stock on successful payment

---

<div align="center">

**Module 07** | [Lesson 1](./01-inventory-tracking-patterns.md) → **Lesson 2** → [Lesson 3](./03-low-stock-alerts-backorders.md)

</div>
