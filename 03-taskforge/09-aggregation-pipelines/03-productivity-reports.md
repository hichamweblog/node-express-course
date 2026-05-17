# Lesson 03: Productivity Reports

> **Module 09** | **Lesson 3 of 4** | ⏱️ 45 minutes

---

## 💻 Code: Team Velocity Report

```typescript
// Tasks completed per week over the last 8 weeks
const velocity = await Task.aggregate([
  { $match: { isArchived: true, updatedAt: { $gte: eightWeeksAgo } } },
  { $group: {
    _id: { $isoWeek: '$updatedAt' },
    completed: { $sum: 1 },
    totalEstimatedHours: { $sum: '$estimatedHours' },
  }},
  { $sort: { '_id': 1 } },
  { $project: {
    week: '$_id',
    completed: 1,
    totalEstimatedHours: 1,
    _id: 0,
  }},
]);
```

---

## ✅ Definition of Done

- [ ] Weekly velocity report with aggregation
- [ ] Per-user productivity metrics
- [ ] Trend data for visualization

---

<div align="center">

**Module 09** | [Lesson 2](./02-analytics-dashboards.md) → **Lesson 3** → [Lesson 4](./04-taskforge-analytics.md)

</div>
