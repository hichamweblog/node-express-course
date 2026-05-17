# Lesson 04: 🛠️ PROJECT — Admin Dashboard API

> **Module 08: Admin Dashboard** | **Lesson 4 of 4** | ⏱️ 55 minutes

---

## 🎯 Dashboard Summary Endpoint

```typescript
// GET /api/v1/admin/dashboard
async getDashboard() {
  const [totalOrders, totalRevenue, totalCustomers, recentOrders, lowStockProducts] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: 'CONFIRMED' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } }),
      prisma.product.findMany({ where: { stock: { lte: 10 }, isActive: true }, select: { name: true, sku: true, stock: true } }),
    ]);

  return {
    summary: {
      totalOrders,
      totalRevenue: totalRevenue._sum.total ?? 0,
      totalCustomers,
    },
    recentOrders,
    lowStockProducts,
  };
}
```

---

## ✅ Definition of Done

- [ ] Dashboard endpoint returns sales summary
- [ ] Order management with state transitions
- [ ] Product management with CRUD + filters
- [ ] All admin routes protected

---

<div align="center">

**🎉 Module 08 Complete! → [Start Module 09: Email Notifications](../09-email-notifications/README.md)**

</div>
