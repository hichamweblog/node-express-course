# Lesson 02: Change Tracking & Diffs

> **Module 11** | **Lesson 2 of 4** | ⏱️ 50 minutes

---

## 💻 Code: Detecting Changes

```typescript
// Compare old and new values to generate a diff
function detectChanges(
  oldDoc: Record<string, any>,
  newData: Record<string, any>,
  trackFields: string[],
): Record<string, { from: unknown; to: unknown }> {
  const changes: Record<string, { from: unknown; to: unknown }> = {};

  for (const field of trackFields) {
    const oldValue = oldDoc[field];
    const newValue = newData[field];

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes[field] = { from: oldValue, to: newValue };
    }
  }

  return changes;
}

// Usage in task update:
const oldTask = await Task.findById(taskId).lean();
const updatedTask = await Task.findByIdAndUpdate(taskId, data, { new: true });

const changes = detectChanges(oldTask, updatedTask, [
  'title', 'description', 'priority', 'dueDate', 'columnId'
]);

if (Object.keys(changes).length > 0) {
  await activityService.log({
    action: 'updated',
    entityType: 'task',
    entityId: taskId,
    userId,
    workspaceId,
    changes,
  });
}
```

---

## ✅ Definition of Done

- [ ] Detect field-level changes between old and new documents
- [ ] Only log activities when changes actually occurred
- [ ] Track who changed what and when

---

<div align="center">

**Module 11** | [Lesson 1](./01-audit-trail-design.md) → **Lesson 2** → [Lesson 3](./03-activity-feeds.md)

</div>
