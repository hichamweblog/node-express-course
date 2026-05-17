# Lesson 03: Population & Indexing

> **Module 03** | **Lesson 3 of 4** | ⏱️ 50 minutes

---

## 📖 Population — MongoDB's Version of JOIN

```typescript
// Populate replaces ObjectId references with full documents
const task = await Task.findById(taskId)
  .populate('assignees', 'name email avatar')  // Only name, email, avatar
  .populate('createdBy', 'name avatar')
  .populate({
    path: 'boardId',
    select: 'name projectId',
    populate: { path: 'projectId', select: 'name key' },
  });
```

## Indexing Strategy

```
┌──────────────────────────────────────────────────────────┐
│              TASKFORGE INDEXING STRATEGY                   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│   Collection    Index                     Purpose        │
│   ──────────    ─────                     ───────        │
│   tasks         { boardId, columnId,      Fast board     │
│                   position }              rendering      │
│   tasks         { assignees: 1 }          "My tasks"     │
│   tasks         { dueDate: 1 }            Due date sort  │
│   tasks         { title: "text",          Full-text      │
│                   description: "text" }   search         │
│   activities    { workspaceId, -createdAt } Activity feed│
│   notifications { userId, isRead,         Inbox queries  │
│                   -createdAt }                           │
│                                                           │
│   COMPOUND vs SINGLE:                                    │
│   Single: { email: 1 } — good for email lookup          │
│   Compound: { boardId: 1, columnId: 1 } — good for      │
│   queries that filter on BOTH fields                     │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## ✅ Definition of Done

- [ ] Use populate for cross-collection queries
- [ ] Design compound indexes for common query patterns
- [ ] Explain the tradeoff between read speed and write overhead

---

<div align="center">

**Module 03** | [Lesson 2](./02-middleware-hooks.md) → **Lesson 3** → [Lesson 4](./04-taskforge-models.md)

</div>
