# Lesson 01: Course Overview & Architecture

> **Module 01: Introduction & Architecture** | **Lesson 1 of 4** | ⏱️ 45 minutes

---

## 🎯 Hook: You're Building the Next Trello

You've built a job board (REST APIs) and an e-commerce platform (payments, transactions). Now you're building something that requires a completely different skill: **real-time collaboration**.

When User A drags a task on their board, User B sees it move instantly. That's not REST. That's WebSockets.

---

## 📖 Theory: TaskForge Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    TASKFORGE SYSTEM ARCHITECTURE                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   React Frontend                                                │
│   ├── Kanban Board (drag-and-drop)                              │
│   ├── Real-time updates (Socket.io client)                      │
│   └── Optimistic UI updates                                    │
│            │                    │                                │
│            │ HTTP (REST)        │ WebSocket                     │
│            ▼                    ▼                                │
│   ┌─────────────────────────────────────┐                       │
│   │         EXPRESS 5 SERVER             │                       │
│   │  ┌──────────┐  ┌────────────────┐   │                       │
│   │  │ REST API │  │  Socket.io     │   │                       │
│   │  │ Routes   │  │  Event Handler │   │                       │
│   │  └────┬─────┘  └───────┬────────┘   │                       │
│   │       │                │             │                       │
│   │       ▼                ▼             │                       │
│   │  ┌──────────────────────────────┐   │                       │
│   │  │      SERVICE LAYER           │   │                       │
│   │  │  Business Logic + Auth       │   │                       │
│   │  └──────────────┬───────────────┘   │                       │
│   └─────────────────│───────────────────┘                       │
│                     │                                            │
│           ┌─────────┼──────────┐                                │
│           ▼         ▼          ▼                                │
│   ┌──────────┐ ┌────────┐ ┌────────┐                           │
│   │ MongoDB  │ │ Redis  │ │Cloudin.│                            │
│   │ (Data)   │ │ (Pub/  │ │ (Files)│                            │
│   │          │ │  Sub)  │ │        │                            │
│   └──────────┘ └────────┘ └────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Two Communication Channels

```
┌──────────────────────────────────────────────────────────────┐
│          REST vs WEBSOCKET — WHEN TO USE EACH                 │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   REST API (HTTP)                WebSocket (Socket.io)       │
│   ───────────────                ────────────────────        │
│   Request → Response             Bidirectional stream        │
│   Stateless                      Stateful connection         │
│                                                               │
│   USE FOR:                       USE FOR:                    │
│   ✅ CRUD operations             ✅ Live board updates       │
│   ✅ Authentication              ✅ Presence indicators      │
│   ✅ File uploads                ✅ Typing indicators        │
│   ✅ Search queries              ✅ Notifications            │
│   ✅ Admin operations            ✅ Collaborative editing    │
│                                                               │
│   TaskForge uses BOTH simultaneously on the same server!     │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Data Hierarchy

```
Workspace ("Engineering Team")
└── Project ("Backend API v2")
    └── Board ("Sprint 14")
        ├── Column: "To Do"
        │   ├── Task TF-042: "Fix login bug"
        │   └── Task TF-043: "Add rate limiting"
        ├── Column: "In Progress"
        │   └── Task TF-041: "Refactor auth"
        └── Column: "Done"
            └── Task TF-040: "Deploy v2.1"
```

---

## 💻 How It All Fits Together

```
Course 1 (DevJobs Pro)     Course 2 (StoreFlow)     Course 3 (TaskForge)
─────────────────────      ────────────────────      ────────────────────
PostgreSQL + Drizzle       PostgreSQL + Prisma       MongoDB + Mongoose
REST APIs                  REST + Webhooks           REST + WebSockets
Express fundamentals       Advanced patterns         Real-time systems
Job board                  E-commerce                Collaboration platform
```

---

## ✅ Definition of Done

- [ ] Explain the dual-channel architecture (REST + WebSocket)
- [ ] Map the data hierarchy (workspace → project → board → task)
- [ ] Identify which operations use REST vs WebSocket
- [ ] Compare TaskForge tech stack to previous courses

---

<div align="center">

**Module 01** | **Lesson 1** → [Lesson 2](./02-mongodb-vs-sql-decision.md)

</div>
