# Lesson 02: Middleware & Hooks

> **Module 03** | **Lesson 2 of 4** | ⏱️ 45 minutes

---

## 📖 Theory: Mongoose Middleware Types

```
┌──────────────────────────────────────────────────────────┐
│              MONGOOSE MIDDLEWARE (HOOKS)                   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│   PRE HOOKS — Run BEFORE the operation                   │
│   ─────────                                              │
│   pre('save')      → Hash password before saving user    │
│   pre('find')      → Auto-exclude archived documents     │
│   pre('remove')    → Clean up related documents          │
│                                                           │
│   POST HOOKS — Run AFTER the operation                   │
│   ──────────                                             │
│   post('save')     → Log activity after task creation    │
│   post('remove')   → Send notification after deletion    │
│   post('findOneAndUpdate') → Emit socket event           │
│                                                           │
│   QUERY MIDDLEWARE — Applied to query operations         │
│   ────────────────                                       │
│   pre('find')      → Filter out isArchived: true         │
│   pre('countDocuments') → Same filter for counts         │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## 💻 Code: TaskForge Middleware Examples

```typescript
// Auto-exclude archived documents from all queries
taskSchema.pre(/^find/, function (next) {
  // 'this' is the query object
  if (!this.getFilter().hasOwnProperty('isArchived')) {
    this.where({ isArchived: false });
  }
  next();
});

// Log activity after task update
taskSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) {
    await Activity.create({
      action: 'updated',
      entityType: 'task',
      entityId: doc._id,
      userId: doc._updatedBy, // Set in service layer
      workspaceId: doc.workspaceId,
    });
  }
});

// Auto-generate slug for workspace
workspaceSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});
```

---

## ✅ Definition of Done

- [ ] Use pre and post hooks for business logic
- [ ] Auto-filter archived documents in queries
- [ ] Auto-generate slugs on save

---

<div align="center">

**Module 03** | [Lesson 1](./01-schemas-validation-virtuals.md) → **Lesson 2** → [Lesson 3](./03-population-indexing.md)

</div>
