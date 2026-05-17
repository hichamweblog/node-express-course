# Lesson 04: 🛠️ PROJECT — Notification System

> **Module 09: Email Notifications** | **Lesson 4 of 4** | ⏱️ 50 minutes

---

## 🎯 What We're Building

1. Email service with template rendering
2. Order confirmation emails on checkout
3. Shipping notification on status change
4. Welcome email on registration
5. Admin low-stock alerts

## Integration Points

```typescript
// In auth service — after registration
await emailService.sendAsync(() => emailService.sendWelcome(user.email, user.name));

// In webhook handler — after payment success
await emailService.sendAsync(() => emailService.sendOrderConfirmation(user.email, order));

// In admin order update — when shipped
if (newStatus === 'SHIPPED') {
  await emailService.sendAsync(() => emailService.sendShippingNotification(user.email, orderId));
}
```

---

## ✅ Definition of Done

- [ ] All email types integrated into their trigger points
- [ ] Emails render correctly in Mailtrap
- [ ] Email failures don't break the main flow

---

<div align="center">

**🎉 Module 09 Complete! → [Start Module 10: Advanced Prisma](../10-advanced-prisma/README.md)**

</div>
