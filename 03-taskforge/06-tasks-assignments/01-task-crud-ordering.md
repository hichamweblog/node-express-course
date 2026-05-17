# Lesson 01: Task CRUD & Position Ordering

> **Module 06** | **Lesson 1 of 4** | ⏱️ 50 minutes

---

## 🎯 Hook: The Hardest Part of a Kanban Board Is Ordering

Creating tasks is easy. Keeping them in the right order when users drag them around? That's where it gets tricky.

---

## 📖 Theory: Position Strategies

```
┌──────────────────────────────────────────────────────────┐
│         TASK ORDERING STRATEGIES                          │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  1. INTEGER POSITIONS (Our approach)                     │
│  ───────────────────                                     │
│  Task A: position = 0                                    │
│  Task B: position = 1                                    │
│  Task C: position = 2                                    │
│                                                           │
│  Move C between A and B:                                 │
│  Task A: position = 0                                    │
│  Task C: position = 1  ← moved                          │
│  Task B: position = 2  ← shifted                        │
│                                                           │
│  ✅ Simple to understand                                 │
│  ❌ Reordering shifts all positions below                │
│                                                           │
│  2. FRACTIONAL POSITIONS (Optimized)                     │
│  ─────────────────────                                   │
│  Task A: position = 1000                                 │
│  Task B: position = 2000                                 │
│  Task C: position = 3000                                 │
│                                                           │
│  Move C between A and B:                                 │
│  Task C: position = 1500  ← no other updates needed!    │
│                                                           │
│  ✅ No cascading updates                                 │
│  ❌ Eventually needs rebalancing                         │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## 💻 Code: Task Creation with Auto-Number

```typescript
export const taskService = {
  async create(boardId: string, columnId: string, userId: string, data: any) {
    const board = await Board.findById(boardId).populate('projectId');
    if (!board) throw new NotFoundError('Board not found');

    // Get next task number (atomic)
    const taskNumber = await projectService.getNextTaskNumber(
      board.projectId._id.toString()
    );

    // Get max position in column
    const maxTask = await Task.findOne({ boardId, columnId })
      .sort({ position: -1 })
      .select('position');
    const position = maxTask ? maxTask.position + 1 : 0;

    return Task.create({
      ...data,
      taskNumber,
      boardId,
      columnId,
      position,
      createdBy: userId,
    });
  },
};
```

---

## ✅ Definition of Done

- [ ] Create tasks with auto-generated task numbers
- [ ] Position tasks within columns
- [ ] Understand integer vs fractional ordering

---

<div align="center">

**Module 06** | **Lesson 1** → [Lesson 2](./02-drag-drop-backend.md)

</div>
