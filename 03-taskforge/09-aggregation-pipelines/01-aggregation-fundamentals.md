# Lesson 01: Aggregation Fundamentals

> **Module 09** | **Lesson 1 of 4** | ⏱️ 50 minutes

---

## 🎯 Hook: SQL Has GROUP BY. MongoDB Has Aggregation Pipelines.

Aggregation pipelines are MongoDB's superpower — a series of stages that transform data. Think of it as a factory assembly line where each stage processes the data and passes it to the next.

---

## 📖 Theory: Pipeline Stages

```
┌──────────────────────────────────────────────────────────────┐
│         AGGREGATION PIPELINE — MENTAL MODEL                   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   Documents flow through stages like water through pipes:    │
│                                                               │
│   [All Tasks] ──▶ $match ──▶ $group ──▶ $sort ──▶ [Result] │
│                   (filter)   (aggregate) (order)              │
│                                                               │
│   COMMON STAGES:                                             │
│   ┌──────────────┬──────────────────────────────────────┐   │
│   │ $match       │ Filter documents (like WHERE)        │   │
│   │ $group       │ Group + aggregate (like GROUP BY)    │   │
│   │ $sort        │ Sort results (like ORDER BY)         │   │
│   │ $project     │ Reshape/select fields (like SELECT)  │   │
│   │ $lookup      │ Join collections (like LEFT JOIN)    │   │
│   │ $unwind      │ Flatten arrays                       │   │
│   │ $limit       │ Limit results                        │   │
│   │ $skip        │ Skip results (pagination)            │   │
│   │ $count       │ Count matching documents             │   │
│   │ $facet       │ Multiple pipelines in parallel       │   │
│   └──────────────┴──────────────────────────────────────┘   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## 💻 Code: Real Aggregation Examples

```typescript
// Tasks completed per user in the last 30 days
const productivity = await Task.aggregate([
  { $match: {
    'checklist.isCompleted': true,
    updatedAt: { $gte: thirtyDaysAgo },
  }},
  { $unwind: '$assignees' },
  { $group: {
    _id: '$assignees',
    tasksCompleted: { $sum: 1 },
    avgEstimatedHours: { $avg: '$estimatedHours' },
  }},
  { $lookup: {
    from: 'users',
    localField: '_id',
    foreignField: '_id',
    as: 'user',
  }},
  { $unwind: '$user' },
  { $project: {
    name: '$user.name',
    email: '$user.email',
    tasksCompleted: 1,
    avgEstimatedHours: { $round: ['$avgEstimatedHours', 1] },
  }},
  { $sort: { tasksCompleted: -1 } },
]);
```

---

## ✅ Definition of Done

- [ ] Explain the pipeline mental model
- [ ] Use $match, $group, $sort, $project
- [ ] Join collections with $lookup

---

<div align="center">

**Module 09** | **Lesson 1** → [Lesson 2](./02-analytics-dashboards.md)

</div>
