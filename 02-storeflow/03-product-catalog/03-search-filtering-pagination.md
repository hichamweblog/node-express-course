# Lesson 03: Search, Filtering & Pagination

> **Module 03: Product Catalog** | **Lesson 3 of 4** | ⏱️ 50 minutes

---

## 🎯 Hook: Users Don't Browse — They Search

80% of e-commerce revenue comes from search and filtering. If customers can't find products, they leave.

---

## 📖 Theory: Pagination Strategies

```
┌─────────────────────────────────────────────────────────┐
│              PAGINATION COMPARISON                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   OFFSET-BASED (Simple, most common)                    │
│   ─────────────────────────────────                     │
│   Page 1: LIMIT 20 OFFSET 0                            │
│   Page 2: LIMIT 20 OFFSET 20                           │
│   Page 3: LIMIT 20 OFFSET 40                           │
│                                                          │
│   ✅ Easy to implement                                  │
│   ✅ Users can jump to any page                         │
│   ❌ Slow on large datasets (OFFSET 100000)             │
│   ❌ Inconsistent if data changes between pages         │
│                                                          │
│   CURSOR-BASED (Better for large datasets)              │
│   ────────────────────────────────────                  │
│   First:  LIMIT 20                                      │
│   Next:   LIMIT 20 WHERE id > last_seen_id             │
│                                                          │
│   ✅ Consistent results                                 │
│   ✅ Scales to millions of records                      │
│   ❌ Can't jump to arbitrary page                       │
│   ❌ More complex implementation                        │
│                                                          │
│   → We'll use OFFSET for StoreFlow (simpler for UI)     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 💻 Code: Advanced Filtering

```typescript
// Building dynamic Prisma where clauses
interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

const buildWhereClause = (filters: ProductFilters) => {
  const where: any = { isActive: true };

  if (filters.category) {
    where.category = { slug: filters.category };
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice) where.price.gte = filters.minPrice;
    if (filters.maxPrice) where.price.lte = filters.maxPrice;
  }

  if (filters.inStock) {
    where.stock = { gt: 0 };
  }

  return where;
};
```

## Pagination Response Format

```typescript
// Consistent pagination response
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
```

---

## ✅ Definition of Done

- [ ] Implement offset-based pagination with total count
- [ ] Build dynamic filtering (category, price range, in-stock)
- [ ] Add case-insensitive search across name and description
- [ ] Return consistent pagination metadata

---

<div align="center">

**Module 03** | [Lesson 2](./02-product-crud-operations.md) → **Lesson 3** → [Lesson 4](./04-storeflow-product-catalog.md)

</div>
