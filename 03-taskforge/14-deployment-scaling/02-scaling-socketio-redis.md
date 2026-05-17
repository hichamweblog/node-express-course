# Lesson 02: Scaling Socket.io with Redis Adapter

> **Module 14** | **Lesson 2 of 4** | ⏱️ 50 minutes

---

## 📖 Theory: Why You Need Redis for Socket.io

```
┌──────────────────────────────────────────────────────────────┐
│         SCALING SOCKET.IO — THE PROBLEM                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   SINGLE SERVER: Works fine                                  │
│   Server 1: [Alice, Bob, Charlie] all in same memory        │
│   emit to room → all 3 receive it ✅                        │
│                                                               │
│   MULTIPLE SERVERS: Breaks!                                  │
│   Server 1: [Alice, Bob]     Server 2: [Charlie]            │
│   Alice moves task on Server 1 → emits to room              │
│   Bob receives it ✅                                         │
│   Charlie is on Server 2 → MISSES the event ❌               │
│                                                               │
│   SOLUTION: Redis Adapter                                    │
│   Server 1: [Alice, Bob] ──┐                                │
│                             ├── Redis Pub/Sub                │
│   Server 2: [Charlie]   ──┘                                 │
│   All events go through Redis → all servers get them ✅      │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## 💻 Code: Redis Adapter

```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: config.redisUrl });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

---

## ✅ Definition of Done

- [ ] Explain why Socket.io breaks with multiple servers
- [ ] Set up Redis adapter for horizontal scaling
- [ ] Test with multiple server instances

---

<div align="center">

**Module 14** | [Lesson 1](./01-mongodb-atlas-production.md) → **Lesson 2** → [Lesson 3](./03-monitoring-security.md)

</div>
