# Lesson 01: Audit Trail Design

> **Module 11** | **Lesson 1 of 4** | ⏱️ 45 minutes

---

## 📖 Theory: Activity Document Schema

```typescript
// Every change in TaskForge creates an activity document
{
  action: "updated",           // created, updated, moved, assigned, etc.
  entityType: "task",          // task, board, project, comment
  entityId: taskId,
  userId: whoDidIt,
  workspaceId: workspaceId,
  changes: {                   // What changed (before → after)
    priority: { from: "medium", to: "urgent" },
    dueDate: { from: null, to: "2026-06-01" },
  },
  metadata: {                  // Extra context
    taskNumber: "TF-042",
    boardName: "Sprint 14",
  },
  createdAt: new Date(),
}
```

## Activity Service

```typescript
export const activityService = {
  async log(data: {
    action: ActivityAction;
    entityType: EntityType;
    entityId: string;
    userId: string;
    workspaceId: string;
    changes?: Record<string, { from: unknown; to: unknown }>;
    metadata?: Record<string, unknown>;
  }) {
    const activity = await Activity.create(data);

    // Broadcast to workspace
    getIO().to(`workspace:${data.workspaceId}`).emit('activity:new', activity);

    return activity;
  },

  async getEntityHistory(entityType: string, entityId: string) {
    return Activity.find({ entityType, entityId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name avatar')
      .limit(50);
  },
};
```

---

## ✅ Definition of Done

- [ ] Design the activity document schema with change tracking
- [ ] Log activities on every significant action
- [ ] Query history for any entity

---

<div align="center">

**Module 11** | **Lesson 1** → [Lesson 2](./02-change-tracking.md)

</div>
