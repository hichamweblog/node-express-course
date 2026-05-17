# Lesson 02: Faceted Search & Filters

> **Module 12** | **Lesson 2 of 4** | ⏱️ 50 minutes

---

## 💻 Code: Faceted Search with $facet

```typescript
// Get search results AND filter counts in ONE query
const results = await Task.aggregate([
  { $match: baseFilter },
  { $facet: {
    // Main results
    results: [
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ],
    // Count by priority
    byPriority: [
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ],
    // Count by label
    byLabel: [
      { $unwind: '$labels' },
      { $group: { _id: '$labels', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ],
    // Total count
    total: [{ $count: 'count' }],
  }},
]);
```

---

## ✅ Definition of Done

- [ ] Use $facet for parallel aggregations
- [ ] Return filter counts alongside results
- [ ] Build dynamic filter UI data

---

<div align="center">

**Module 12** | [Lesson 1](./01-mongodb-text-search.md) → **Lesson 2** → [Lesson 3](./03-saved-filters-autocomplete.md)

</div>
