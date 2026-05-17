# Lesson 01: Testing Payment Flows

> **Module 12: Testing E-Commerce** | **Lesson 1 of 4** | ⏱️ 45 minutes

---

## 🎯 Hook: You Can't Ship Untested Payment Code

A bug in your product listing shows wrong text. A bug in your payment flow charges the wrong amount. The stakes are fundamentally different.

---

## 📖 Theory: Testing Pyramid for E-Commerce

```
┌─────────────────────────────────────────────────────────────┐
│              E-COMMERCE TESTING PYRAMID                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                      /\                                      │
│                     /  \        E2E Tests                    │
│                    / 10 \       Full checkout flow           │
│                   /──────\      (Playwright + Stripe test)   │
│                  /        \                                  │
│                 / 30 tests \    Integration Tests            │
│                /────────────\   API routes + database        │
│               /              \  (Supertest + test DB)        │
│              /   60+ tests    \                              │
│             /──────────────────\ Unit Tests                  │
│            /                    \ Pure business logic        │
│           /    Services, utils   \ (Vitest, no DB needed)    │
│          /────────────────────────\                           │
│                                                              │
│   WHAT TO TEST IN E-COMMERCE:                               │
│   ✅ Price calculations (cents math)                        │
│   ✅ Inventory checks (stock validation)                    │
│   ✅ State transitions (order status)                       │
│   ✅ Webhook signature verification                         │
│   ✅ Cart merge logic                                       │
│   ✅ Authorization (admin vs customer)                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 Code: Unit Tests for Order State Machine

```typescript
// tests/unit/order-state.test.ts
import { describe, it, expect } from 'vitest';
import { validateTransition } from '../../src/services/order.service.js';

describe('Order State Machine', () => {
  it('allows PENDING → CONFIRMED', () => {
    expect(validateTransition('PENDING', 'CONFIRMED')).toBe(true);
  });

  it('allows PENDING → CANCELLED', () => {
    expect(validateTransition('PENDING', 'CANCELLED')).toBe(true);
  });

  it('rejects DELIVERED → PENDING (no going back)', () => {
    expect(validateTransition('DELIVERED', 'PENDING')).toBe(false);
  });

  it('rejects REFUNDED → anything (final state)', () => {
    expect(validateTransition('REFUNDED', 'CONFIRMED')).toBe(false);
    expect(validateTransition('REFUNDED', 'SHIPPED')).toBe(false);
  });

  it('rejects CANCELLED → CONFIRMED (no un-cancelling)', () => {
    expect(validateTransition('CANCELLED', 'CONFIRMED')).toBe(false);
  });
});

describe('Price Calculations', () => {
  it('calculates cart total correctly in cents', () => {
    const items = [
      { price: 2999, quantity: 2 },  // $29.99 × 2
      { price: 1499, quantity: 1 },  // $14.99 × 1
    ];
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    expect(total).toBe(7497);  // $74.97
  });

  it('never produces floating point errors', () => {
    // This is WHY we use integers
    expect(0.1 + 0.2).not.toBe(0.3);  // Float FAILS!
    expect(10 + 20).toBe(30);          // Integer WORKS!
  });
});
```

---

## ✅ Definition of Done

- [ ] Explain the testing pyramid for e-commerce
- [ ] Write unit tests for order state machine
- [ ] Write unit tests for price calculations
- [ ] All price tests use integer cents

---

<div align="center">

**Module 12** | **Lesson 1** → [Lesson 2](./02-mocking-external-services.md)

</div>
