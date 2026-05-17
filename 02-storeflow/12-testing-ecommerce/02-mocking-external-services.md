# Lesson 02: Mocking External Services

> **Module 12: Testing E-Commerce** | **Lesson 2 of 4** | ⏱️ 45 minutes

---

## 📖 Theory: Why Mock External Services

```
┌──────────────────────────────────────────────────────────┐
│         WHAT TO MOCK vs WHAT TO INTEGRATE                 │
├──────────────────────────────────────────────────────────┤
│                                                           │
│   MOCK (in unit/integration tests):                      │
│   ✅ Stripe API calls (payments, refunds)                │
│   ✅ Email sending (Nodemailer)                          │
│   ✅ External HTTP calls                                 │
│                                                           │
│   REAL (in integration tests):                           │
│   ✅ PostgreSQL (use test database)                      │
│   ✅ Redis (use test instance)                           │
│   ✅ Your own API routes (Supertest)                     │
│                                                           │
│   STRIPE TEST MODE (in E2E tests):                       │
│   ✅ Use Stripe test keys (sk_test_...)                  │
│   ✅ Test card numbers (4242...)                         │
│   ✅ Stripe CLI for webhook testing                      │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## 💻 Code: Mocking Stripe

```typescript
// tests/mocks/stripe.mock.ts
import { vi } from 'vitest';

export const mockStripe = {
  paymentIntents: {
    create: vi.fn().mockResolvedValue({
      id: 'pi_test_123',
      client_secret: 'cs_test_secret',
      status: 'requires_payment_method',
    }),
    retrieve: vi.fn().mockResolvedValue({
      id: 'pi_test_123',
      status: 'succeeded',
      metadata: { orderId: 'order_123' },
    }),
  },
  refunds: {
    create: vi.fn().mockResolvedValue({ id: 're_test_123', status: 'succeeded' }),
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
};

// In your test file:
vi.mock('stripe', () => ({
  default: vi.fn(() => mockStripe),
}));
```

---

## ✅ Definition of Done

- [ ] Mock Stripe API calls in tests
- [ ] Mock email service to prevent sending real emails
- [ ] Use real database for integration tests

---

<div align="center">

**Module 12** | [Lesson 1](./01-testing-payment-flows.md) → **Lesson 2** → [Lesson 3](./03-integration-testing-prisma.md)

</div>
