# Lesson 03: Session Storage & Rate Limiting

> **Module 11: Caching with Redis** | **Lesson 3 of 4** | ⏱️ 40 minutes

---

## 💻 Code: Redis-Backed Rate Limiting

```typescript
// Using Redis for distributed rate limiting
import { rateLimit } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../services/cache.service.js';

export const createRateLimiter = (windowMs: number, max: number) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args: string[]) => redis.call(...args),
    }),
  });

// Different limits for different endpoints
export const authLimiter = createRateLimiter(15 * 60 * 1000, 5);    // 5 attempts per 15 min
export const apiLimiter = createRateLimiter(15 * 60 * 1000, 100);   // 100 per 15 min
export const searchLimiter = createRateLimiter(60 * 1000, 30);      // 30 per minute
```

---

## ✅ Definition of Done

- [ ] Implement Redis-backed rate limiting
- [ ] Use different rate limits for different endpoints
- [ ] Store guest cart sessions in Redis

---

<div align="center">

**Module 11** | [Lesson 2](./02-caching-strategies-patterns.md) → **Lesson 3** → [Lesson 4](./04-storeflow-caching-layer.md)

</div>
