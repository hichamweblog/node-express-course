# Lesson 02: Live Board Synchronization

> **Module 07** | **Lesson 2 of 4** | ⏱️ 55 minutes

---

## 📖 The Real-Time Update Loop

```
┌──────────────────────────────────────────────────────────┐
│         REAL-TIME BOARD SYNC FLOW                         │
├──────────────────────────────────────────────────────────┤
│                                                           │
│   Alice (Browser)          Server           Bob (Browser)│
│   ───────────────          ──────           ────────────│
│                                                           │
│   1. Alice drags task                                    │
│      from "To Do"                                        │
│      to "In Progress"                                    │
│          │                                               │
│          ▼                                               │
│   2. REST: PATCH /tasks/:id/move                         │
│          │                                               │
│          ▼                                               │
│   3. Server updates DB                                   │
│          │                                               │
│          ├──▶ 4. Socket: emit to board room              │
│          │        (except Alice)                          │
│          │              │                                │
│          │              ▼                                │
│          │   5. Bob receives 'task:moved'                │
│          │      Board updates instantly                  │
│          │                                               │
│          ▼                                               │
│   6. Alice gets REST                                     │
│      response (confirmation)                             │
│                                                           │
│   TOTAL TIME: < 100ms for Bob to see the change         │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## 💻 Code: Service Layer Integration

```typescript
// In task.service.ts — after database update:
const updatedTask = await task.save();

// Broadcast to all board viewers EXCEPT the one who made the change
getIO().to(`board:${task.boardId}`).emit('task:updated', {
  taskId: updatedTask._id,
  changes: { title: updatedTask.title, priority: updatedTask.priority },
  updatedBy: userId,
  timestamp: new Date(),
});
```

---

## ✅ Definition of Done

- [ ] REST + WebSocket integration for task updates
- [ ] Board auto-syncs when any user makes changes
- [ ] Events include who made the change and when

---

<div align="center">

**Module 07** | [Lesson 1](./01-socketio-rooms-namespaces.md) → **Lesson 2** → [Lesson 3](./03-presence-indicators.md)

</div>
