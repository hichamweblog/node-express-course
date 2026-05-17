# Lesson 01: Stripe API Fundamentals

> **Module 06: Stripe Payments** | **Lesson 1 of 4** | ⏱️ 45 minutes

---

## 🎯 Hook: You Never Touch Credit Card Numbers

That's the beauty of Stripe. Your server NEVER handles raw card data — Stripe does. This keeps you PCI compliant without a security audit.

---

## 📖 Theory: How Stripe Payment Intents Work

```
┌─────────────────────────────────────────────────────────────────┐
│              STRIPE PAYMENT FLOW                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   YOUR FRONTEND              YOUR BACKEND           STRIPE      │
│   ────────────               ────────────           ──────      │
│                                                                  │
│   1. User clicks                                                │
│      "Checkout"                                                 │
│         │                                                        │
│         ▼                                                        │
│   2. POST /api/v1/orders ──▶ 3. Create Order                   │
│                               Create PaymentIntent ──▶ 4. Returns│
│                            ◀── client_secret            intent   │
│         │                                                        │
│         ▼                                                        │
│   5. stripe.confirmPayment()                                    │
│      (card details go                                           │
│       DIRECTLY to Stripe) ─────────────────────▶ 6. Processes   │
│                                                     payment     │
│                                                        │        │
│                                                        ▼        │
│                            7. Webhook ◀──────── payment_intent  │
│                               POST /webhooks    .succeeded      │
│                                    │                             │
│                                    ▼                             │
│                            8. Update order                      │
│                               status to                         │
│                               CONFIRMED                         │
│                                                                  │
│   KEY INSIGHT: Card data NEVER touches your server!             │
│   You only handle the PaymentIntent ID and status.              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 💻 Code: Payment Service

```typescript
// src/services/payment.service.ts
import Stripe from 'stripe';
import { config } from '../config/index.js';

const stripe = new Stripe(config.stripe.secretKey);

export const paymentService = {
  async createPaymentIntent(orderId: string, amount: number) {
    // amount is already in cents!
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { orderId },  // Link payment to our order
      automatic_payment_methods: { enabled: true },
    });

    // Save to our database
    await prisma.payment.create({
      data: {
        orderId,
        stripePaymentId: paymentIntent.id,
        amount,
        status: 'PENDING',
      },
    });

    return { clientSecret: paymentIntent.client_secret };
  },
};
```

---

## ✅ Definition of Done

- [ ] Explain the Payment Intent flow
- [ ] Create a Stripe test account and get API keys
- [ ] Create a PaymentIntent from your backend
- [ ] Explain why card data never touches your server

---

<div align="center">

**Module 06** | **Lesson 1** → [Lesson 2](./02-payment-intents-integration.md)

</div>
