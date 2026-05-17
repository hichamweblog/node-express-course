# Lesson 04: 🛠️ PROJECT — Redis Caching Layer

> **Module 11: Caching with Redis** | **Lesson 4 of 4** | ⏱️ 55 minutes

---

## 🎯 What We're Building

1. Cache service with get/set/delete/pattern-delete
2. Product listing cache (5 min TTL)
3. Individual product cache (1 hour TTL)
4. Category cache (24 hour TTL)
5. Cache invalidation on admin updates
6. Redis-backed rate limiting

## Cache Key Strategy

```
┌────────────────────────────────────────────────────┐
│   KEY PATTERN              TTL       INVALIDATION  │
├────────────────────────────────────────────────────┤
│   product:{slug}           1 hour    On update     │
│   products:list:{hash}     5 min     On any change │
│   category:{slug}          24 hours  On update     │
│   categories:all           24 hours  On any change │
│   user:session:{sessionId} 7 days    On logout     │
└────────────────────────────────────────────────────┘
```

---

## ✅ Definition of Done

- [ ] Cache service integrated into product and category services
- [ ] Cache invalidation works correctly on updates
- [ ] Rate limiting uses Redis store
- [ ] Performance improvement measurable

---

<div align="center">

**🎉 Module 11 Complete! → [Start Module 12: Testing E-Commerce](../12-testing-ecommerce/README.md)**

</div>
