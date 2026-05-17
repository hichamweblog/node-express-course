# Lesson 02: Query Operators & Projections

> **Module 02** | **Lesson 2 of 4** | ⏱️ 45 minutes

---

## 📖 Key Operators

```
┌──────────────────────────────────────────────────────────┐
│              MONGODB QUERY OPERATORS                      │
├──────────────────────────────────────────────────────────┤
│                                                           │
│   COMPARISON:                                            │
│   $eq, $ne      Equal, Not Equal                        │
│   $gt, $gte     Greater Than (or equal)                 │
│   $lt, $lte     Less Than (or equal)                    │
│   $in, $nin     In array / Not in array                 │
│                                                           │
│   LOGICAL:                                               │
│   $and           All conditions must match               │
│   $or            At least one condition                  │
│   $not           Negate a condition                      │
│   $nor           None of the conditions                  │
│                                                           │
│   ARRAY:                                                 │
│   $elemMatch     Match element in array                  │
│   $size          Array has exact length                  │
│   $all           Array contains all values              │
│                                                           │
│   ELEMENT:                                               │
│   $exists        Field exists or not                    │
│   $type          Field is specific BSON type            │
│                                                           │
│   UPDATE:                                                │
│   $set           Set field value                        │
│   $unset         Remove field                           │
│   $inc           Increment number                       │
│   $push          Add to array                           │
│   $pull          Remove from array                      │
│   $addToSet      Add unique to array                    │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## TaskForge Query Examples

```javascript
// Find urgent tasks assigned to a user
db.tasks.find({
  assignees: userId,
  priority: { $in: ["urgent", "high"] },
  isArchived: false,
});

// Find tasks due in the next 7 days
db.tasks.find({
  dueDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 86400000) },
});

// Projections — return only specific fields
db.tasks.find(
  { boardId: boardId },
  { title: 1, priority: 1, assignees: 1, _id: 1 }
);
```

---

## ✅ Definition of Done

- [ ] Use comparison, logical, and array operators
- [ ] Write projections to limit returned fields
- [ ] Query nested fields and arrays

---

<div align="center">

**Module 02** | [Lesson 1](./01-mongodb-fundamentals.md) → **Lesson 2** → [Lesson 3](./03-atlas-compass-shell.md)

</div>
