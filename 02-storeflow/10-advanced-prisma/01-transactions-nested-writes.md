# Lesson 01: Transactions & Nested Writes

> **Module 10: Advanced Prisma** | **Lesson 1 of 4** | ⏱️ 45 minutes

---

## 🎯 Hook: When One Query Isn't Enough

E-commerce operations rarely involve a single database query. Checkout touches orders, order items, inventory, cart, and payments — all in one atomic operation.

---

## 📖 Theory: Prisma Transaction Types

```
┌─────────────────────────────────────────────────────────────┐
│              PRISMA TRANSACTION TYPES                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   1. SEQUENTIAL TRANSACTIONS ($transaction array)           │
│   ──────────────────────────────────────────                │
│   const [user, order] = await prisma.$transaction([         │
│     prisma.user.update({ ... }),                            │
│     prisma.order.create({ ... }),                           │
│   ]);                                                        │
│   ✅ Simple  ❌ Can't use results between queries            │
│                                                              │
│   2. INTERACTIVE TRANSACTIONS ($transaction callback)       │
│   ──────────────────────────────────────────────            │
│   const result = await prisma.$transaction(async (tx) => {  │
│     const user = await tx.user.findUnique({ ... });         │
│     const order = await tx.order.create({                   │
│       data: { userId: user.id, ... },  // Use user.id!     │
│     });                                                      │
│     return order;                                            │
│   });                                                        │
│   ✅ Full control  ✅ Use results between queries            │
│   ✅ Automatic rollback on throw                            │
│                                                              │
│   3. NESTED WRITES (implicit transactions)                  │
│   ────────────────────────────────────────                  │
│   await prisma.order.create({                               │
│     data: {                                                  │
│       userId,                                                │
│       items: { create: [...] },  // Created atomically!     │
│     },                                                       │
│   });                                                        │
│   ✅ Cleanest API  ❌ Limited to create/connect/set         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 Code: Interactive Transaction Example

```typescript
// Transfer money between accounts (classic transaction example adapted for e-commerce)
async processRefund(orderId: string) {
  return prisma.$transaction(async (tx) => {
    // 1. Get order
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true, payment: true },
    });
    if (!order) throw new NotFoundError('Order not found');
    if (order.status === 'REFUNDED') throw new BadRequestError('Already refunded');

    // 2. Update order status
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'REFUNDED' },
    });

    // 3. Update payment status
    await tx.payment.update({
      where: { orderId },
      data: { status: 'REFUNDED' },
    });

    // 4. Restore inventory
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    // 5. Process Stripe refund
    if (order.payment?.stripePaymentId) {
      await stripe.refunds.create({
        payment_intent: order.payment.stripePaymentId,
      });
    }

    return order;
  }, {
    maxWait: 5000,    // Max time to wait for transaction slot
    timeout: 10000,   // Max transaction duration
  });
}
```

---

## ✅ Definition of Done

- [ ] Explain the three types of Prisma transactions
- [ ] Implement interactive transactions for multi-step operations
- [ ] Use nested writes for related record creation
- [ ] Handle transaction timeouts and failures

---

<div align="center">

**Module 10** | **Lesson 1** → [Lesson 2](./02-raw-sql-aggregations.md)

</div>
