# Lesson 01: Redis Fundamentals & Setup

> **Module 11: Caching with Redis** | **Lesson 1 of 4** | ⏱️ 45 minutes

---

## 🎯 Hook: From 200ms to 2ms

Without caching, every product page query hits PostgreSQL. With Redis, frequently accessed data returns in **under 2 milliseconds**.

---

## 📖 Theory: What Redis Is

```
┌─────────────────────────────────────────────────────────────┐
│              REDIS MENTAL MODEL                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Redis = In-Memory Key-Value Store                         │
│                                                              │
│   Think of it as a GIANT JavaScript Map that:               │
│   ✅ Lives in RAM (blazing fast)                            │
│   ✅ Supports expiration (TTL)                              │
│   ✅ Persists to disk (optional)                            │
│   ✅ Has built-in data structures                           │
│                                                              │
│   DATA TYPES:                                               │
│   ┌──────────┬──────────────────┬─────────────────────────┐│
│   │ Type     │ Example          │ Use Case                ││
│   ├──────────┼──────────────────┼─────────────────────────┤│
│   │ String   │ SET key "value"  │ Cache JSON, sessions    ││
│   │ Hash     │ HSET user:1 name │ Object-like storage     ││
│   │ List     │ LPUSH queue job  │ Message queues          ││
│   │ Set      │ SADD tags "new"  │ Unique collections      ││
│   │ Sorted   │ ZADD leaders 100 │ Leaderboards, rankings  ││
│   │ Set      │                  │                         ││
│   └──────────┴──────────────────┴─────────────────────────┘│
│                                                              │
│   KEY CONCEPTS:                                             │
│   TTL (Time To Live) — Auto-expire keys after N seconds    │
│   SET product:123 "{...}" EX 3600  → Expires in 1 hour    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 Code: Redis Client Setup

```typescript
// src/services/cache.service.ts
import Redis from 'ioredis';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const redis = new Redis(config.redisUrl);

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error({ err }, 'Redis error'));

export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  async set(key: string, value: unknown, ttlSeconds: number = 3600): Promise<void> {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  },

  async del(key: string): Promise<void> {
    await redis.del(key);
  },

  async delPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },
};

export { redis };
```

---

## ✅ Definition of Done

- [ ] Explain Redis data types and TTL
- [ ] Set up ioredis client with connection handling
- [ ] Build a cache service with get/set/delete

---

<div align="center">

**Module 11** | **Lesson 1** → [Lesson 2](./02-caching-strategies-patterns.md)

</div>
