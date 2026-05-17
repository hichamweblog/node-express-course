# Lesson 02: Guest vs User Carts

> **Module 04: Shopping Cart** | **Lesson 2 of 4** | ⏱️ 45 minutes

---

## 🎯 Hook: 35% of Customers Abandon Carts When Forced to Register

Requiring login before adding to cart is the #1 e-commerce UX mistake. Our cart supports both anonymous and authenticated users.

---

## 📖 Theory: Dual-Identity Cart Model

```
┌──────────────────────────────────────────────────────────┐
│              CART IDENTITY MODEL                          │
├──────────────────────────────────────────────────────────┤
│                                                           │
│   model Cart {                                           │
│     id        String    @id @default(uuid())             │
│     userId    String?   @unique  ← null for guests       │
│     sessionId String?   @unique  ← UUID for guests       │
│     expiresAt DateTime? ← guest carts expire (7 days)    │
│   }                                                      │
│                                                           │
│   Guest User:  userId = null,  sessionId = "abc-123"     │
│   Logged In:   userId = "usr", sessionId = null          │
│                                                           │
│   Finding the right cart:                                │
│   ┌──────────────────────────────────────────────────┐  │
│   │  if (req.user) {                                 │  │
│   │    cart = findBy({ userId: req.user.id })         │  │
│   │  } else {                                        │  │
│   │    cart = findBy({ sessionId: req.sessionId })    │  │
│   │  }                                               │  │
│   └──────────────────────────────────────────────────┘  │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## 💻 Code: Cart Service

```typescript
export const cartService = {
  async getOrCreateCart(userId?: string, sessionId?: string) {
    if (userId) {
      // Find or create user cart
      return prisma.cart.upsert({
        where: { userId },
        update: {},
        create: { userId },
        include: { items: { include: { product: true } } },
      });
    }

    if (sessionId) {
      // Find or create guest cart
      return prisma.cart.upsert({
        where: { sessionId },
        update: {},
        create: {
          sessionId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
        include: { items: { include: { product: true } } },
      });
    }

    throw new BadRequestError('userId or sessionId required');
  },

  async addItem(cartId: string, productId: string, quantity: number = 1) {
    // Check stock
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) throw new NotFoundError('Product not found');
    if (product.stock < quantity) throw new BadRequestError('Insufficient stock');

    // Upsert cart item (add to existing quantity)
    return prisma.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      update: { quantity: { increment: quantity } },
      create: { cartId, productId, quantity },
      include: { product: true },
    });
  },
};
```

---

## ✅ Definition of Done

- [ ] Implement dual-identity cart (userId OR sessionId)
- [ ] Create guest carts with expiration
- [ ] Add items with stock validation
- [ ] Use composite unique key for cart items

---

<div align="center">

**Module 04** | [Lesson 1](./01-cart-architecture-patterns.md) → **Lesson 2** → [Lesson 3](./03-cart-operations-merging.md)

</div>
