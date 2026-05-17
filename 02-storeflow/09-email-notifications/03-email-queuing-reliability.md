# Lesson 03: Email Queuing & Reliability

> **Module 09: Email Notifications** | **Lesson 3 of 4** | ⏱️ 40 minutes

---

## 📖 Theory: Why Queue Emails

```
┌──────────────────────────────────────────────────────────┐
│        SYNC vs ASYNC EMAIL SENDING                        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│   SYNCHRONOUS (Bad):                                     │
│   POST /orders → Create Order → Send Email → Response    │
│                                  ↑ 2-5 seconds           │
│   If SMTP fails, order creation fails too! ❌             │
│                                                           │
│   ASYNCHRONOUS (Good):                                   │
│   POST /orders → Create Order → Queue Email → Response   │
│                                  ↑ instant                │
│   Background worker sends email later                    │
│   If email fails, order still succeeds ✅                 │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## 💻 Code: Fire-and-Forget Pattern

```typescript
// Simple async pattern (no queue infrastructure needed)
export const emailService = {
  sendAsync(fn: () => Promise<void>) {
    // Fire and forget — don't await
    fn().catch((error) => {
      logger.error({ error }, 'Failed to send email');
      // In production: retry logic or dead letter queue
    });
  },
};

// Usage in order service:
const order = await createOrder(userId, addressId);

// Don't await — let it send in the background
emailService.sendAsync(() =>
  emailService.sendOrderConfirmation(user.email, order)
);

res.json({ success: true, data: order });
// Response returns immediately, email sends in background
```

---

## ✅ Definition of Done

- [ ] Explain why emails should be sent asynchronously
- [ ] Implement fire-and-forget email pattern
- [ ] Handle email failures without breaking the main flow

---

<div align="center">

**Module 09** | [Lesson 2](./02-email-templates-rendering.md) → **Lesson 3** → [Lesson 4](./04-storeflow-notifications.md)

</div>
