# Lesson 03: Socket.io & Real-Time Introduction

> **Module 01: Introduction & Architecture** | **Lesson 3 of 4** | ⏱️ 45 minutes

---

## 🎯 Hook: HTTP Is a One-Way Street. WebSockets Are a Phone Call.

HTTP: Client asks → Server responds → Connection closed.
WebSocket: Client and Server have an **open line** — either side can send data at any time.

---

## 📖 Theory: How Socket.io Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    SOCKET.IO ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. CLIENT CONNECTS                                            │
│   ┌──────────┐   HTTP Upgrade    ┌──────────┐                  │
│   │  Browser  │ ──────────────▶  │  Server  │                  │
│   │(socket.io │   "Upgrade to    │(socket.io│                  │
│   │  client)  │    WebSocket"    │  server) │                  │
│   └──────────┘                   └──────────┘                  │
│        ↕ Persistent bidirectional connection ↕                  │
│                                                                  │
│   2. ROOMS — Logical groups of sockets                          │
│   ┌────────────────────────────────────────────┐                │
│   │  Room: "board:abc123"                      │                │
│   │  ├── Socket A (User Alice)                 │                │
│   │  ├── Socket B (User Bob)                   │                │
│   │  └── Socket C (User Charlie)               │                │
│   │                                            │                │
│   │  Alice moves task → Server broadcasts to   │                │
│   │  ALL other sockets in the room             │                │
│   └────────────────────────────────────────────┘                │
│                                                                  │
│   3. EVENTS — Named messages with data                          │
│   Client → Server: socket.emit("task:move", data)              │
│   Server → Room:   io.to("board:abc").emit("task:moved", data) │
│   Server → One:    io.to("user:123").emit("notification", data)│
│                                                                  │
│   4. FALLBACK — If WebSocket fails, Socket.io                   │
│      falls back to HTTP long-polling automatically              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 💻 Code: Minimal Socket.io Example

```typescript
// Server
import { Server } from 'socket.io';

const io = new Server(httpServer);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('message', (data) => {
    // Broadcast to everyone EXCEPT sender
    socket.broadcast.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Client
import { io } from 'socket.io-client';
const socket = io('http://localhost:3002');

socket.emit('message', { text: 'Hello!' });
socket.on('message', (data) => console.log('Received:', data));
```

---

## ✅ Definition of Done

- [ ] Explain the difference between HTTP and WebSocket
- [ ] Describe Socket.io rooms, events, and broadcasting
- [ ] Write a minimal Socket.io server and client

---

<div align="center">

**Module 01** | [Lesson 2](./02-mongodb-vs-sql-decision.md) → **Lesson 3** → [Lesson 4](./04-taskforge-project-scaffold.md)

</div>
