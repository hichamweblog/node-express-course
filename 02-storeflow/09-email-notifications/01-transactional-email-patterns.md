# Lesson 01: Transactional Email Patterns

> **Module 09: Email Notifications** | **Lesson 1 of 4** | ⏱️ 35 minutes

---

## 🎯 Hook: Email Is Your Most Reliable Communication Channel

Push notifications get dismissed. SMS costs money. But email? 90%+ open rates for order confirmations. Transactional emails build customer trust.

---

## 📖 Theory: E-Commerce Email Types

```
┌──────────────────────────────────────────────────────────┐
│         E-COMMERCE TRANSACTIONAL EMAILS                   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│   TRIGGER                  EMAIL TYPE                    │
│   ───────                  ──────────                    │
│   User registers       →  Welcome email                 │
│   Password reset       →  Reset link email              │
│   Order created        →  Order confirmation             │
│   Payment succeeded    →  Payment receipt                │
│   Order shipped        →  Shipping notification          │
│   Order delivered      →  Delivery confirmation          │
│   Refund processed     →  Refund notification            │
│   Low stock (admin)    →  Stock alert                    │
│                                                           │
│   PRIORITY:                                              │
│   🔴 Critical: Payment receipts, order confirmations     │
│   🟡 Important: Shipping updates, refund notices         │
│   🟢 Nice-to-have: Welcome emails, promotions           │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## 💻 Code: Email Service with Nodemailer

```typescript
// src/services/email.service.ts
import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  auth: { user: config.smtp.user, pass: config.smtp.pass },
});

export const emailService = {
  async sendOrderConfirmation(to: string, order: { id: string; total: number; items: any[] }) {
    const html = `
      <h1>Order Confirmed! 🎉</h1>
      <p>Order #${order.id.slice(0, 8)}</p>
      <p>Total: $${(order.total / 100).toFixed(2)}</p>
      <h3>Items:</h3>
      <ul>
        ${order.items.map(i => `<li>${i.product.name} × ${i.quantity}</li>`).join('')}
      </ul>
    `;

    await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject: `Order Confirmed #${order.id.slice(0, 8)}`,
      html,
    });

    logger.info({ orderId: order.id, to }, 'Order confirmation email sent');
  },

  async sendShippingNotification(to: string, orderId: string) {
    await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject: `Your order has shipped!`,
      html: `<h1>Your order is on its way! 📦</h1><p>Order #${orderId.slice(0, 8)}</p>`,
    });
  },
};
```

---

## ✅ Definition of Done

- [ ] List all transactional email types for e-commerce
- [ ] Set up Nodemailer with Mailtrap (dev) configuration
- [ ] Send a test email successfully

---

<div align="center">

**Module 09** | **Lesson 1** → [Lesson 2](./02-email-templates-rendering.md)

</div>
