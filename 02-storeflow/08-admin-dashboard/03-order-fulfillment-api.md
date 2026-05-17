# Lesson 03: Order Fulfillment API

> **Module 08: Admin Dashboard** | **Lesson 3 of 4** | ⏱️ 45 minutes

---

## 📖 Theory: Order Status Transitions

```
┌───────────────────────────────────────────────────────────┐
│              VALID ORDER STATE TRANSITIONS                  │
├───────────────────────────────────────────────────────────┤
│                                                            │
│   PENDING    → CONFIRMED (webhook)  or  CANCELLED (admin) │
│   CONFIRMED  → PROCESSING (admin)  or  CANCELLED (admin)  │
│   PROCESSING → SHIPPED (admin)     or  CANCELLED (admin)  │
│   SHIPPED    → DELIVERED (admin)                           │
│   DELIVERED  → REFUNDED (admin)                            │
│                                                            │
│   ❌ INVALID TRANSITIONS:                                  │
│   DELIVERED → PENDING  (can't go backwards)               │
│   CANCELLED → CONFIRMED (can't un-cancel)                 │
│   REFUNDED  → anything (final state)                      │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

## 💻 Code: State Machine Validation

```typescript
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

export function validateTransition(current: string, next: string): boolean {
  return VALID_TRANSITIONS[current]?.includes(next) ?? false;
}

// In order service:
async updateStatus(orderId: string, newStatus: OrderStatus) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new NotFoundError('Order not found');

  if (!validateTransition(order.status, newStatus)) {
    throw new BadRequestError(
      `Cannot transition from ${order.status} to ${newStatus}`
    );
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });
}
```

---

## ✅ Definition of Done

- [ ] Implement order state machine with valid transitions
- [ ] Reject invalid state transitions with clear errors
- [ ] Admin can view and update order statuses

---

<div align="center">

**Module 08** | [Lesson 2](./02-product-management-api.md) → **Lesson 3** → [Lesson 4](./04-storeflow-admin-dashboard.md)

</div>
