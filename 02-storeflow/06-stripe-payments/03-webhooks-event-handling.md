# Lesson 03: Webhooks & Event Handling

> **Module 06: Stripe Payments** | **Lesson 3 of 4** | ⏱️ 50 minutes

---

## 🎯 Hook: Never Trust the Client — Trust the Webhook

The frontend says "payment succeeded"? Don't believe it. Only update your order when Stripe's webhook confirms it. Webhooks are server-to-server notifications that are cryptographically signed.

---

## 📖 Theory: Webhook Security

```
┌─────────────────────────────────────────────────────────────┐
│              WEBHOOK VERIFICATION FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Stripe Server                      Your Server            │
│   ──────────────                     ───────────            │
│                                                              │
│   1. Payment succeeds                                       │
│         │                                                    │
│         ▼                                                    │
│   2. Signs payload with                                     │
│      webhook secret                                         │
│         │                                                    │
│         ▼                                                    │
│   3. POST /api/v1/webhooks/stripe ──▶ 4. Verify signature  │
│      Headers:                             │                  │
│        stripe-signature: t=...,v1=...     ├── ✅ Valid       │
│      Body: raw JSON                       │   Process event  │
│                                           └── ❌ Invalid     │
│                                               Return 400     │
│                                                              │
│   ⚠️ CRITICAL: Webhooks use RAW body, not parsed JSON!      │
│   You MUST add a raw body parser for the webhook route.     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 Code: Webhook Handler

```typescript
// src/routes/webhook.routes.ts
import { Router } from 'express';
import express from 'express';
import Stripe from 'stripe';
import { config } from '../config/index.js';
import { prisma } from '../db/prisma.js';
import { logger } from '../utils/logger.js';

const router = Router();
const stripe = new Stripe(config.stripe.secretKey);

// ⚠️ Webhooks need RAW body — NOT parsed JSON
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.stripe.webhookSecret,
      );
    } catch (err) {
      logger.error('Webhook signature verification failed');
      return res.status(400).send('Invalid signature');
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        await prisma.$transaction([
          prisma.payment.update({
            where: { stripePaymentId: paymentIntent.id },
            data: { status: 'SUCCEEDED' },
          }),
          prisma.order.update({
            where: { id: orderId },
            data: { status: 'CONFIRMED' },
          }),
        ]);
        logger.info({ orderId }, 'Payment succeeded');
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await prisma.payment.update({
          where: { stripePaymentId: paymentIntent.id },
          data: { status: 'FAILED' },
        });
        logger.warn({ id: paymentIntent.id }, 'Payment failed');
        break;
      }
    }

    res.json({ received: true });
  },
);

export default router;
```

> **🔴 Critical:** The webhook route MUST be mounted BEFORE `express.json()` middleware, or use a separate raw body parser. If the body is already parsed as JSON, signature verification will fail.

---

## ✅ Definition of Done

- [ ] Explain why webhooks are more trustworthy than client-side confirmation
- [ ] Verify webhook signatures with Stripe
- [ ] Handle payment_intent.succeeded and payment_intent.payment_failed
- [ ] Use idempotency to prevent duplicate processing

---

<div align="center">

**Module 06** | [Lesson 2](./02-payment-intents-integration.md) → **Lesson 3** → [Lesson 4](./04-storeflow-payment-system.md)

</div>
