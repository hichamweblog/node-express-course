# Lesson 02: Caching Strategies & Patterns

> **Module 11: Caching with Redis** | **Lesson 2 of 4** | ⏱️ 50 minutes

---

## 📖 Theory: Cache Strategies

```
┌─────────────────────────────────────────────────────────────┐
│              CACHING STRATEGIES                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. CACHE-ASIDE (Lazy Loading) — Our primary strategy       │
│  ─────────────────────────────                              │
│  Read: Check cache → if miss, query DB → store in cache    │
│  Write: Update DB → invalidate cache                        │
│                                                              │
│     App ──1──▶ Redis: "Do you have product:123?"            │
│         ◀─2── Redis: "No" (cache miss)                      │
│     App ──3──▶ PostgreSQL: "Give me product 123"            │
│         ◀─4── PostgreSQL: {name: "Mouse", ...}              │
│     App ──5──▶ Redis: "Store product:123 for 1 hour"        │
│     App ──6──▶ Client: {name: "Mouse", ...}                 │
│                                                              │
│     Next request:                                            │
│     App ──1──▶ Redis: "Do you have product:123?"            │
│         ◀─2── Redis: "Yes!" (cache HIT — 2ms!)             │
│     App ──3──▶ Client: {name: "Mouse", ...}                 │
│                                                              │
│  2. WRITE-THROUGH                                           │
│  ─────────────                                              │
│  Write: Update cache AND DB simultaneously                  │
│  ✅ Cache always fresh  ❌ Slower writes                    │
│                                                              │
│  3. WRITE-BEHIND (Write-Back)                               │
│  ────────────────────────                                   │
│  Write: Update cache first, sync to DB later (async)        │
│  ✅ Fast writes  ❌ Risk of data loss                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 Code: Cache-Aside Pattern

```typescript
// Product service with caching
async getBySlug(slug: string) {
  const cacheKey = `product:${slug}`;

  // 1. Check cache
  const cached = await cacheService.get(cacheKey);
  if (cached) return cached;

  // 2. Query database
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!product) throw new NotFoundError('Product not found');

  // 3. Store in cache (1 hour TTL)
  await cacheService.set(cacheKey, product, 3600);

  return product;
}

// Invalidate on update
async update(id: string, data: UpdateProductInput) {
  const product = await prisma.product.update({ where: { id }, data });

  // Invalidate specific product cache
  await cacheService.del(`product:${product.slug}`);
  // Invalidate product list caches
  await cacheService.delPattern('products:list:*');

  return product;
}
```

---

## ✅ Definition of Done

- [ ] Implement cache-aside pattern for product reads
- [ ] Invalidate cache on product updates
- [ ] Choose appropriate TTL values for different data types

---

<div align="center">

**Module 11** | [Lesson 1](./01-redis-fundamentals-setup.md) → **Lesson 2** → [Lesson 3](./03-session-storage-rate-limiting.md)

</div>
