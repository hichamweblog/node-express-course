# Lesson 03: Address Validation & Shipping

> **Module 05: Checkout & Orders** | **Lesson 03 of 4** | ⏱️ 50 minutes

---

## 🎯 Overview

Shipping address management, default address selection, and address validation patterns. Calculating shipping costs and handling multiple shipping methods.

---

## 📖 Key Concepts

### Order Creation Transaction

```typescript
// The most critical transaction in e-commerce
const order = await prisma.$transaction(async (tx) => {
  // 1. Validate cart has items
  const cart = await tx.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });
  if (!cart || cart.items.length === 0) throw new BadRequestError('Cart is empty');

  // 2. Verify stock for all items
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new BadRequestError(\`Insufficient stock for \${item.product.name}\`);
    }
  }

  // 3. Calculate total
  const total = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 0
  );

  // 4. Create order
  const newOrder = await tx.order.create({
    data: {
      userId,
      total,
      addressId,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceAtTime: item.product.price,
        })),
      },
    },
  });

  // 5. Deduct stock
  for (const item of cart.items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }

  // 6. Clear cart
  await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

  return newOrder;
});
```

---

## ✅ Definition of Done

- [ ] Complete the implementation described above
- [ ] Test with sample data
- [ ] Verify transactions roll back on failure

---

<div align="center">

**Module 05** | Lesson 03 of 4

</div>
