# Lesson 03: Integration Testing with Prisma

> **Module 12: Testing E-Commerce** | **Lesson 3 of 4** | ⏱️ 50 minutes

---

## 💻 Code: Test Setup with Prisma

```typescript
// tests/setup.ts
import { PrismaClient } from '@prisma/client';
import { beforeEach, afterAll } from 'vitest';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.TEST_DATABASE_URL } },
});

// Clean database before each test
beforeEach(async () => {
  await prisma.$transaction([
    prisma.cartItem.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.order.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.address.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
```

## API Integration Test

```typescript
// tests/integration/products.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/index.js';
import { prisma } from '../setup.js';

describe('GET /api/v1/products', () => {
  beforeEach(async () => {
    const category = await prisma.category.create({
      data: { name: 'Test', slug: 'test' },
    });
    await prisma.product.create({
      data: {
        name: 'Test Product',
        slug: 'test-product',
        price: 1999,
        sku: 'TP-001',
        stock: 10,
        categoryId: category.id,
      },
    });
  });

  it('returns products with pagination', async () => {
    const res = await request(app).get('/api/v1/products');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.products).toHaveLength(1);
    expect(res.body.data.pagination.total).toBe(1);
  });

  it('filters by category', async () => {
    const res = await request(app).get('/api/v1/products?category=test');

    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(1);
  });
});
```

---

## ✅ Definition of Done

- [ ] Set up test database with clean state per test
- [ ] Write integration tests for product endpoints
- [ ] Test authentication and authorization
- [ ] Verify error responses for edge cases

---

<div align="center">

**Module 12** | [Lesson 2](./02-mocking-external-services.md) → **Lesson 3** → [Lesson 4](./04-storeflow-test-suite.md)

</div>
