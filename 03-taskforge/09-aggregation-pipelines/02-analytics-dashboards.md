# Lesson 02: Analytics Dashboards

> **Module 09** | **Lesson 2 of 4** | ⏱️ 55 minutes

---

## 💻 Code: Workspace Dashboard

```typescript
async getWorkspaceDashboard(workspaceId: string) {
  const [tasksByStatus, tasksByPriority, overdueTasks, recentActivity] =
    await Promise.all([
      // Tasks grouped by column status
      Task.aggregate([
        { $match: { isArchived: false } },
        { $lookup: { from: 'boards', localField: 'boardId', foreignField: '_id', as: 'board' } },
        { $unwind: '$board' },
        { $lookup: { from: 'projects', localField: 'board.projectId', foreignField: '_id', as: 'project' } },
        { $unwind: '$project' },
        { $match: { 'project.workspaceId': new mongoose.Types.ObjectId(workspaceId) } },
        { $group: { _id: '$columnId', count: { $sum: 1 } } },
      ]),

      // Tasks by priority
      Task.aggregate([
        { $match: { isArchived: false } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Overdue tasks
      Task.find({
        dueDate: { $lt: new Date() },
        isArchived: false,
      }).select('title taskNumber dueDate assignees').populate('assignees', 'name'),

      // Recent activity
      Activity.find({ workspaceId })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('userId', 'name avatar'),
    ]);

  return { tasksByStatus, tasksByPriority, overdueTasks, recentActivity };
}
```

---

## ✅ Definition of Done

- [ ] Build workspace dashboard with parallel aggregations
- [ ] Tasks by status, priority, and overdue count
- [ ] Recent activity feed

---

<div align="center">

**Module 09** | [Lesson 1](./01-aggregation-fundamentals.md) → **Lesson 2** → [Lesson 3](./03-productivity-reports.md)

</div>
