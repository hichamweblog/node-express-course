# Lesson 03: Full-Text Search with Prisma

> **Module 10: Advanced Prisma** | **Lesson 3 of 4** | ⏱️ 45 minutes

---

## 📖 Theory: Search Beyond LIKE

```
┌──────────────────────────────────────────────────────────┐
│         SEARCH STRATEGY COMPARISON                        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│   LIKE / ILIKE (what we have now):                       │
│   WHERE name ILIKE '%wireless%'                          │
│   ✅ Simple  ❌ No relevance ranking  ❌ Slow on large DB │
│                                                           │
│   PostgreSQL Full-Text Search:                           │
│   WHERE to_tsvector(name || description)                 │
│     @@ to_tsquery('wireless & mouse')                    │
│   ✅ Ranked results  ✅ Stemming  ✅ Built into PostgreSQL │
│                                                           │
│   External Search (Elasticsearch, Meilisearch):          │
│   ✅ Typo tolerance  ✅ Faceted search  ❌ Extra infra    │
│                                                           │
│   → We'll use PostgreSQL FTS (no extra infrastructure)   │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## 💻 Code: PostgreSQL Full-Text Search

```typescript
// Using raw SQL for full-text search
async searchProducts(query: string, page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;

  const products = await prisma.$queryRaw`
    SELECT
      id, name, slug, description, price, images, stock,
      ts_rank(
        to_tsvector('english', name || ' ' || COALESCE(description, '')),
        plainto_tsquery('english', ${query})
      ) as relevance
    FROM products
    WHERE
      is_active = true
      AND to_tsvector('english', name || ' ' || COALESCE(description, ''))
        @@ plainto_tsquery('english', ${query})
    ORDER BY relevance DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return products;
}
```

---

## ✅ Definition of Done

- [ ] Explain PostgreSQL full-text search vs LIKE
- [ ] Implement ranked search with ts_rank
- [ ] Add search to product listing API

---

<div align="center">

**Module 10** | [Lesson 2](./02-raw-sql-aggregations.md) → **Lesson 3** → [Lesson 4](./04-storeflow-advanced-queries.md)

</div>
