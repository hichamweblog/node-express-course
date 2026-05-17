# Lesson 02: Drag-and-Drop Backend Logic

> **Module 06** | **Lesson 2 of 4** | ⏱️ 50 minutes

---

## 📖 Moving Tasks Between Columns

```
┌──────────────────────────────────────────────────────────┐
│         TASK MOVE OPERATION                               │
├──────────────────────────────────────────────────────────┤
│                                                           │
│   BEFORE:                    AFTER:                      │
│   Column A    Column B       Column A    Column B        │
│   ┌──────┐   ┌──────┐       ┌──────┐   ┌──────┐        │
│   │Task 1│   │Task 3│       │Task 2│   │Task 1│ ← moved│
│   │Task 2│   │Task 4│       │      │   │Task 3│        │
│   └──────┘   └──────┘       └──────┘   │Task 4│        │
│                                         └──────┘        │
│                                                           │
│   Backend receives:                                      │
│   { taskId, fromColumnId, toColumnId, newPosition }      │
│                                                           │
│   Backend does:                                          │
│   1. Update task's columnId and position                 │
│   2. Shift positions of tasks in destination column      │
│   3. Shift positions of tasks in source column           │
│   4. Emit Socket.io event to all board users             │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## 💻 Code: Move Task

```typescript
async moveTask(taskId: string, toColumnId: string, newPosition: number) {
  const task = await Task.findById(taskId);
  if (!task) throw new NotFoundError('Task not found');

  const fromColumnId = task.columnId.toString();

  // Shift tasks in destination column
  await Task.updateMany(
    { boardId: task.boardId, columnId: toColumnId, position: { $gte: newPosition } },
    { $inc: { position: 1 } },
  );

  // If moving within same column, shift source
  if (fromColumnId === toColumnId) {
    await Task.updateMany(
      { boardId: task.boardId, columnId: fromColumnId, position: { $gt: task.position } },
      { $inc: { position: -1 } },
    );
  } else {
    // Shift tasks in source column
    await Task.updateMany(
      { boardId: task.boardId, columnId: fromColumnId, position: { $gt: task.position } },
      { $inc: { position: -1 } },
    );
  }

  // Update the task
  task.columnId = new mongoose.Types.ObjectId(toColumnId);
  task.position = newPosition;
  await task.save();

  // Emit real-time event
  getIO().to(`board:${task.boardId}`).emit('task:moved', {
    taskId, fromColumnId, toColumnId, newPosition,
  });

  return task;
}
```

---

## ✅ Definition of Done

- [ ] Move tasks between columns with position updates
- [ ] Reorder tasks within a column
- [ ] Emit real-time events on move

---

<div align="center">

**Module 06** | [Lesson 1](./01-task-crud-ordering.md) → **Lesson 2** → [Lesson 3](./03-subtasks-checklists.md)

</div>
