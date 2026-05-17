# Lesson 03: Subtasks, Checklists & Labels

> **Module 06** | **Lesson 3 of 4** | ⏱️ 45 minutes

---

## 💻 Code: Embedded Document Operations

```typescript
// Add checklist item
async addChecklistItem(taskId: string, text: string) {
  return Task.findByIdAndUpdate(
    taskId,
    { $push: { checklist: { text, isCompleted: false } } },
    { new: true },
  );
}

// Toggle checklist item
async toggleChecklistItem(taskId: string, itemId: string, userId: string) {
  const task = await Task.findById(taskId);
  const item = task?.checklist.id(itemId);
  if (!item) throw new NotFoundError('Checklist item not found');

  item.isCompleted = !item.isCompleted;
  item.completedAt = item.isCompleted ? new Date() : undefined;
  item.completedBy = item.isCompleted ? new mongoose.Types.ObjectId(userId) : undefined;
  return task!.save();
}

// Assign user to task
async assignUser(taskId: string, userId: string) {
  return Task.findByIdAndUpdate(
    taskId,
    { $addToSet: { assignees: userId } },  // No duplicates!
    { new: true },
  );
}

// Add label
async addLabel(taskId: string, label: string) {
  return Task.findByIdAndUpdate(
    taskId,
    { $addToSet: { labels: label } },
    { new: true },
  );
}
```

---

## ✅ Definition of Done

- [ ] CRUD for embedded checklists with $push/$pull
- [ ] Toggle checklist items with completion tracking
- [ ] Assign/unassign users with $addToSet/$pull

---

<div align="center">

**Module 06** | [Lesson 2](./02-drag-drop-backend.md) → **Lesson 3** → [Lesson 4](./04-taskforge-tasks.md)

</div>
