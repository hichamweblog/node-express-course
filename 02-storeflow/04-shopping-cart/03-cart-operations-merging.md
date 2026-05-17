# Lesson 03: Cart Operations & Merging

> **Module 04: Shopping Cart** | **Lesson 3 of 4** | ⏱️ 45 minutes

---

## 🎯 Hook: The Merge Problem

User browses as guest, adds 3 items. Then logs in — and already has 2 items from last week. What happens? You need a **merge strategy**.

---

## 💻 Code: Cart Merge on Login

```typescript
async mergeGuestCart(userId: string, guestSessionId: string) {
  return prisma.$transaction(async (tx) => {
    const guestCart = await tx.cart.findUnique({
      where: { sessionId: guestSessionId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) return;

    // Get or create user cart
    const userCart = await tx.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    // Merge items
    for (const guestItem of guestCart.items) {
      await tx.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: userCart.id,
            productId: guestItem.productId,
          },
        },
        update: { quantity: { increment: guestItem.quantity } },
        create: {
          cartId: userCart.id,
          productId: guestItem.productId,
          quantity: guestItem.quantity,
        },
      });
    }

    // Delete guest cart
    await tx.cart.delete({ where: { id: guestCart.id } });
  });
}
```

## Other Cart Operations

```typescript
// Update item quantity
async updateItemQuantity(cartId: string, productId: string, quantity: number) {
  if (quantity <= 0) {
    return this.removeItem(cartId, productId);
  }
  return prisma.cartItem.update({
    where: { cartId_productId: { cartId, productId } },
    data: { quantity },
  });
}

// Remove item
async removeItem(cartId: string, productId: string) {
  return prisma.cartItem.delete({
    where: { cartId_productId: { cartId, productId } },
  });
}

// Clear cart
async clearCart(cartId: string) {
  return prisma.cartItem.deleteMany({ where: { cartId } });
}

// Calculate total
async getCartTotal(cartId: string) {
  const items = await prisma.cartItem.findMany({
    where: { cartId },
    include: { product: { select: { price: true } } },
  });
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}
```

---

## ✅ Definition of Done

- [ ] Implement cart merge with transactions
- [ ] Handle quantity update, remove, and clear operations
- [ ] Calculate cart total in cents

---

<div align="center">

**Module 04** | [Lesson 2](./02-guest-vs-user-carts.md) → **Lesson 3** → [Lesson 4](./04-storeflow-shopping-cart.md)

</div>
