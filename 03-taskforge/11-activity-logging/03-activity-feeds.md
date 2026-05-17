# Lesson 03: Activity Feeds & Streams

> **Module 11** | **Lesson 3 of 4** | ⏱️ 45 minutes

---

## 💻 Code: Activity Feed Endpoint

```typescript
async getWorkspaceActivity(workspaceId: string, filters: {
  userId?: string;
  entityType?: string;
  since?: Date;
  page?: number;
}) {
  const query: any = { workspaceId };
  if (filters.userId) query.userId = filters.userId;
  if (filters.entityType) query.entityType = filters.entityType;
  if (filters.since) query.createdAt = { $gte: filters.since };

  return Activity.find(query)
    .sort({ createdAt: -1 })
    .skip(((filters.page || 1) - 1) * 20)
    .limit(20)
    .populate('userId', 'name avatar');
}
```

---

## ✅ Definition of Done

- [ ] Build filterable activity feed
- [ ] Support per-task, per-user, and workspace-wide views
- [ ] Paginate activity results

---

<div align="center">

**Module 11** | [Lesson 2](./02-change-tracking.md) → **Lesson 3** → [Lesson 4](./04-taskforge-activity.md)

</div>
