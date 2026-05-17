# Lesson 04: 🛠️ PROJECT — Comprehensive Test Suite

> **Module 12: Testing E-Commerce** | **Lesson 4 of 4** | ⏱️ 60 minutes

---

## 🎯 What We're Building

A comprehensive test suite covering:

```
tests/
├── setup.ts                    ← Database cleanup, helpers
├── helpers/
│   ├── auth.helper.ts          ← Generate test tokens
│   └── seed.helper.ts          ← Create test data
├── unit/
│   ├── order-state.test.ts     ← State machine logic
│   ├── price-calc.test.ts      ← Price calculations
│   └── slug-gen.test.ts        ← Slug generation
├── integration/
│   ├── auth.test.ts            ← Registration, login
│   ├── products.test.ts        ← Product CRUD
│   ├── cart.test.ts            ← Cart operations
│   ├── checkout.test.ts        ← Order creation
│   └── admin.test.ts           ← Admin endpoints
└── mocks/
    ├── stripe.mock.ts          ← Stripe API mock
    └── email.mock.ts           ← Email service mock
```

## Test Coverage Targets

```
┌──────────────────────┬────────────┐
│ Area                 │ Target     │
├──────────────────────┼────────────┤
│ State machine logic  │ 100%       │
│ Price calculations   │ 100%       │
│ Auth endpoints       │ 90%+       │
│ Product CRUD         │ 85%+       │
│ Cart operations      │ 85%+       │
│ Checkout flow        │ 80%+       │
│ Admin endpoints      │ 80%+       │
│ Overall              │ 80%+       │
└──────────────────────┴────────────┘
```

---

## ✅ Definition of Done

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Test coverage > 80%
- [ ] `npm run test` exits cleanly

---

<div align="center">

**🎉 Module 12 Complete! → [Start Module 13: Deployment & Scaling](../13-deployment-scaling/README.md)**

</div>
