# Lesson 02: Email Templates & Rendering

> **Module 09: Email Notifications** | **Lesson 2 of 4** | ⏱️ 40 minutes

---

## 📖 Theory: Template Architecture

```
┌──────────────────────────────────────────────────────────┐
│              EMAIL TEMPLATE SYSTEM                        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│   Option 1: Inline HTML (Simple)                         │
│   → HTML strings in your service code                    │
│   ✅ No dependencies   ❌ Hard to maintain               │
│                                                           │
│   Option 2: Template Files (Better)                      │
│   → Separate HTML files with variable substitution       │
│   ✅ Designers can edit  ✅ Reusable layouts              │
│                                                           │
│   Option 3: React Email (Production)                     │
│   → React components compiled to HTML                    │
│   ✅ Type-safe  ✅ Component reuse  ✅ Preview            │
│                                                           │
│   We'll use Option 2 for StoreFlow (practical balance)  │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## 💻 Code: Simple Template Engine

```typescript
// src/utils/emailTemplates.ts
const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
  .header { background: #1a1a2e; color: white; padding: 20px; text-align: center; }
  .content { padding: 20px; }
  .footer { background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; }
</style></head>
<body>
  <div class="header"><h1>StoreFlow</h1></div>
  <div class="content">${content}</div>
  <div class="footer">© ${new Date().getFullYear()} StoreFlow. All rights reserved.</div>
</body>
</html>
`;

export const templates = {
  orderConfirmation: (data: { orderId: string; total: number; items: any[] }) =>
    baseTemplate(`
      <h2>Order Confirmed! 🎉</h2>
      <p>Thank you for your order.</p>
      <p><strong>Order:</strong> #${data.orderId.slice(0, 8)}</p>
      <table style="width:100%; border-collapse:collapse;">
        <tr style="background:#f0f0f0;"><th>Item</th><th>Qty</th><th>Price</th></tr>
        ${data.items.map(i => `
          <tr><td>${i.name}</td><td>${i.quantity}</td><td>$${(i.price / 100).toFixed(2)}</td></tr>
        `).join('')}
      </table>
      <p style="font-size:18px;"><strong>Total: $${(data.total / 100).toFixed(2)}</strong></p>
    `),

  welcome: (name: string) => baseTemplate(`
    <h2>Welcome to StoreFlow, ${name}!</h2>
    <p>We're excited to have you. Start browsing our catalog today.</p>
  `),
};
```

---

## ✅ Definition of Done

- [ ] Create a reusable base template with header/footer
- [ ] Build order confirmation and welcome templates
- [ ] Preview emails in Mailtrap

---

<div align="center">

**Module 09** | [Lesson 1](./01-transactional-email-patterns.md) → **Lesson 2** → [Lesson 3](./03-email-queuing-reliability.md)

</div>
