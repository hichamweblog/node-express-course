# Lesson 02: Raw SQL & Aggregations

> **Module 10: Advanced Prisma** | **Lesson 2 of 4** | ⏱️ 50 minutes

---

## 📖 Theory: When Prisma's API Isn't Enough

Prisma handles 95% of queries beautifully. For the other 5% — complex aggregations, window functions, CTEs — you need raw SQL.

## 💻 Code: Aggregation Queries

```typescript
// Prisma aggregation API
const salesReport = await prisma.order.aggregate({
  _sum: { total: true },
  _count: { id: true },
  _avg: { total: true },
  where: {
    status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
    createdAt: { gte: startDate, lte: endDate },
  },
});

// Group by — sales per category
const salesByCategory = await prisma.orderItem.groupBy({
  by: ['productId'],
  _sum: { quantity: true },
  _count: { id: true },
  orderBy: { _sum: { quantity: 'desc' } },
  take: 10,
});

// Raw SQL for complex queries
const topProducts = await prisma.$queryRaw`
  SELECT
    p.name,
    p.sku,
    SUM(oi.quantity) as total_sold,
    SUM(oi.quantity * oi.price_at_time) as total_revenue
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  JOIN orders o ON o.id = oi.order_id
  WHERE o.status IN ('CONFIRMED', 'SHIPPED', 'DELIVERED')
    AND o.created_at >= ${startDate}
  GROUP BY p.id, p.name, p.sku
  ORDER BY total_revenue DESC
  LIMIT 10
`;
```

---

## ✅ Definition of Done

- [ ] Use Prisma's aggregate and groupBy APIs
- [ ] Write raw SQL for complex reporting queries
- [ ] Build a sales report endpoint

---

<div align="center">

**Module 10** | [Lesson 1](./01-transactions-nested-writes.md) → **Lesson 2** → [Lesson 3](./03-full-text-search-prisma.md)

</div>
