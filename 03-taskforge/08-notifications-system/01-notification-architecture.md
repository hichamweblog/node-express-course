# Lesson 01: Notification Architecture

> **Module 08** | **Lesson 1 of 4** | ⏱️ 45 minutes

---

## 📖 Theory: Notification Delivery Channels

```
┌──────────────────────────────────────────────────────────────┐
│         NOTIFICATION DELIVERY ARCHITECTURE                    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   Event occurs (task assigned, comment added, etc.)           │
│        │                                                      │
│        ▼                                                      │
│   Notification Service                                        │
│        │                                                      │
│        ├──▶ 1. IN-APP (immediate)                            │
│        │       Save to notifications collection              │
│        │       + Push via Socket.io to user:userId room       │
│        │                                                      │
│        ├──▶ 2. EMAIL (batched)                               │
│        │       Queue for email digest                        │
│        │       Sent hourly/daily based on user preferences   │
│        │                                                      │
│        └──▶ 3. PUSH (future)                                 │
│                Web push notifications                        │
│                                                               │
│   User Preferences:                                          │
│   {                                                          │
│     emailNotifications: true,                                │
│     mentionNotifications: true,                              │
│     digestFrequency: "daily"  // "realtime" | "daily" | "off"│
│   }                                                          │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## 💻 Code: Notification Service

```typescript
export const notificationService = {
  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
  }) {
    const notification = await Notification.create(data);

    // Push immediately via WebSocket
    getIO().to(`user:${data.userId}`).emit('notification:new', notification);

    return notification;
  },

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Notification.countDocuments({ userId, isRead: false }),
    ]);
    return { notifications, unreadCount };
  },

  async markAsRead(userId: string, notificationId: string) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true, readAt: new Date() },
      { new: true },
    );
  },

  async markAllAsRead(userId: string) {
    return Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  },
};
```

---

## ✅ Definition of Done

- [ ] Design multi-channel notification architecture
- [ ] Create notifications and deliver via WebSocket
- [ ] Query notifications with unread count

---

<div align="center">

**Module 08** | **Lesson 1** → [Lesson 2](./02-mentions-triggers.md)

</div>
