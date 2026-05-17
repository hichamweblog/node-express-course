# Lesson 03: Low-Stock Alerts & Backorders

> **Module 07: Inventory Management** | **Lesson 3 of 4** | ⏱️ 40 minutes

---

## 💻 Code: Low Stock Detection

```typescript
// Check for low stock after every sale
async checkLowStock(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, stock: true, sku: true },
  });

  if (!product) return;

  const LOW_STOCK_THRESHOLD = 10;

  if (product.stock <= LOW_STOCK_THRESHOLD && product.stock > 0) {
    logger.warn({
      event: 'LOW_STOCK',
      productId: product.id,
      name: product.name,
      sku: product.sku,
      remaining: product.stock,
    }, `Low stock alert: ${product.name} has ${product.stock} units left`);

    // In production: send email/Slack notification to admin
    await emailService.sendLowStockAlert(product);
  }

  if (product.stock === 0) {
    logger.error({
      event: 'OUT_OF_STOCK',
      productId: product.id,
    }, `OUT OF STOCK: ${product.name}`);
  }
}
```

---

## ✅ Definition of Done

- [ ] Implement low-stock detection with configurable thresholds
- [ ] Log stock alerts with structured logging
- [ ] Plan notification delivery for admin alerts

---

<div align="center">

**Module 07** | [Lesson 2](./02-stock-reservations.md) → **Lesson 3** → [Lesson 4](./04-storeflow-inventory-system.md)

</div>
