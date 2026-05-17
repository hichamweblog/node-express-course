# Lesson 04: 🛠️ PROJECT — Payment Processing

> **Module 06: Stripe Payments** | **Lesson 4 of 4** | ⏱️ 60 minutes

---

## 🎯 What We're Building

Complete Stripe integration:
1. Payment service with PaymentIntent creation
2. Webhook route with signature verification
3. Order status updates on payment confirmation
4. Refund processing

## API Endpoints

```
POST   /api/v1/orders/checkout       → Create order + PaymentIntent
POST   /api/v1/webhooks/stripe       → Stripe webhook (raw body)
POST   /api/v1/orders/:id/refund     → Request refund (admin)
```

## Testing with Stripe CLI

```bash
# Install Stripe CLI
# Forward webhooks to your local server
stripe listen --forward-to localhost:3001/api/v1/webhooks/stripe

# In another terminal, trigger a test event
stripe trigger payment_intent.succeeded
```

---

## ✅ Definition of Done

- [ ] Checkout creates order + PaymentIntent
- [ ] Webhooks update order status
- [ ] Refunds work through admin endpoint
- [ ] Stripe CLI webhook forwarding tested

---

<div align="center">

**🎉 Module 06 Complete! → [Start Module 07: Inventory Management](../07-inventory-management/README.md)**

</div>
