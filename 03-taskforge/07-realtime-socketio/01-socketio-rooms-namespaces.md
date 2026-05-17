# Lesson 01: Rooms, Namespaces & Events

> **Module 07** | **Lesson 1 of 4** | ⏱️ 50 minutes

---

## 📖 Theory: Socket.io Rooms

```
┌──────────────────────────────────────────────────────────────┐
│              SOCKET.IO BROADCASTING PATTERNS                  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. TO ALL CONNECTED CLIENTS                                 │
│     io.emit('event', data);                                  │
│     → Everyone gets it. Rarely useful.                       │
│                                                               │
│  2. TO A SPECIFIC ROOM                                       │
│     io.to('board:abc').emit('event', data);                  │
│     → All users viewing board "abc" get it.                  │
│     → This is our PRIMARY pattern for board updates.         │
│                                                               │
│  3. TO A ROOM EXCEPT SENDER                                  │
│     socket.to('board:abc').emit('event', data);              │
│     → Everyone in room EXCEPT the person who triggered it.   │
│     → Use when sender already has the update locally.        │
│                                                               │
│  4. TO A SPECIFIC USER                                       │
│     io.to('user:123').emit('notification', data);            │
│     → Personal notifications, mentions.                      │
│                                                               │
│  ROOM STRATEGY FOR TASKFORGE:                                │
│  ┌──────────────────────────────────────────────┐           │
│  │ Room Name          │ Who Joins               │           │
│  │ user:{userId}      │ User's personal channel │           │
│  │ board:{boardId}    │ Users viewing a board   │           │
│  │ workspace:{wsId}   │ All workspace members   │           │
│  └──────────────────────────────────────────────┘           │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## ✅ Definition of Done

- [ ] Join/leave board rooms dynamically
- [ ] Broadcast task changes to room members
- [ ] Send personal notifications via user rooms

---

<div align="center">

**Module 07** | **Lesson 1** → [Lesson 2](./02-live-board-sync.md)

</div>
