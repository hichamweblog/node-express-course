# Lesson 02: Product Management API

> **Module 08: Admin Dashboard** | **Lesson 2 of 4** | ⏱️ 45 minutes

---

## 💻 Code: Admin Product Service

```typescript
export const adminProductService = {
  async getAll(params: { page: number; limit: number; search?: string; status?: string }) {
    const { page, limit, search, status } = params;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;
    if (status === 'low-stock') where.stock = { lte: 10 };
    if (status === 'out-of-stock') where.stock = 0;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, _count: { select: { orderItems: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },
};
```

---

## ✅ Definition of Done

- [ ] Admin product listing with status filters
- [ ] Include order count for each product
- [ ] Full CRUD with validation

---

<div align="center">

**Module 08** | [Lesson 1](./01-admin-api-design.md) → **Lesson 2** → [Lesson 3](./03-order-fulfillment-api.md)

</div>
