# Lesson 03: Email Digests & Preferences

> **Module 08** | **Lesson 3 of 4** | ⏱️ 40 minutes

---

## 💻 Code: Daily Digest

```typescript
// Cron job: Send daily digest emails
async sendDailyDigests() {
  const users = await User.find({
    'preferences.emailNotifications': true,
    isActive: true,
  });

  for (const user of users) {
    const unread = await Notification.find({
      userId: user._id,
      isRead: false,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }).sort({ createdAt: -1 });

    if (unread.length === 0) continue;

    await emailService.sendDigest(user.email, user.name, unread);
  }
}
```

---

## ✅ Definition of Done

- [ ] User notification preferences
- [ ] Daily email digest for unread notifications
- [ ] Respect user opt-out settings

---

<div align="center">

**Module 08** | [Lesson 2](./02-mentions-triggers.md) → **Lesson 3** → [Lesson 4](./04-taskforge-notifications.md)

</div>
