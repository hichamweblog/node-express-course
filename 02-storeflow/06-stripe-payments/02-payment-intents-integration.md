# Lesson 02: Payment Intents Integration

> **Module 06: Stripe Payments** | **Lesson 2 of 4** | ⏱️ 50 minutes

---

## 🎯 Integrating Stripe Into the Checkout Flow

```typescript
// Checkout flow: Cart → Order → PaymentIntent → Confirm → Webhook → Done

export const orderService = {
  async checkout(userId: string, addressId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Create order from cart (Module 05 logic)
      const order = await this.createOrderFromCart(tx, userId, addressId);

      // 2. Create Stripe PaymentIntent
      const { clientSecret } = await paymentService.createPaymentIntent(
        order.id,
        order.total,
      );

      return { order, clientSecret };
    });
  },
};
```

## Stripe Test Cards

```
┌────────────────────────────────────────────────┐
│           STRIPE TEST CARD NUMBERS              │
├────────────────────────────────────────────────┤
│  ✅ Success:    4242 4242 4242 4242            │
│  ❌ Decline:    4000 0000 0000 0002            │
│  ⚠️ 3D Secure: 4000 0025 0000 3155            │
│  💳 Exp: Any future date, CVC: Any 3 digits   │
└────────────────────────────────────────────────┘
```

---

## ✅ Definition of Done

- [ ] Integrate PaymentIntent creation into checkout
- [ ] Return clientSecret to frontend
- [ ] Test with Stripe test cards

---

<div align="center">

**Module 06** | [Lesson 1](./01-stripe-fundamentals.md) → **Lesson 2** → [Lesson 3](./03-webhooks-event-handling.md)

</div>
