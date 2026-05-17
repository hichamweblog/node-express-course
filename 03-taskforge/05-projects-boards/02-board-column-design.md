# Lesson 02: Board & Column Design

> **Module 05** | **Lesson 2 of 4** | ⏱️ 50 minutes

---

## 📖 Theory: Columns as Embedded Documents

```
┌──────────────────────────────────────────────────────────┐
│          WHY EMBED COLUMNS IN BOARDS?                     │
├──────────────────────────────────────────────────────────┤
│                                                           │
│   Board document:                                        │
│   {                                                      │
│     _id: "board123",                                     │
│     name: "Sprint 14",                                   │
│     columns: [                                           │
│       { _id: "col1", name: "To Do",   order: 0 },      │
│       { _id: "col2", name: "Doing",   order: 1 },      │
│       { _id: "col3", name: "Review",  order: 2 },      │
│       { _id: "col4", name: "Done",    order: 3 },      │
│     ]                                                    │
│   }                                                      │
│                                                           │
│   WHY EMBED?                                             │
│   ✅ Columns always loaded with board (1 query)          │
│   ✅ Bounded (typically 4-8 columns per board)           │
│   ✅ Column reordering is a single update                │
│   ✅ No extra collection needed                          │
│                                                           │
│   WHY NOT REFERENCE?                                     │
│   ❌ You'd always need a JOIN/populate                    │
│   ❌ Reordering requires updating multiple documents      │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## Column Reordering

```typescript
async reorderColumns(boardId: string, columnIds: string[]) {
  const board = await Board.findById(boardId);
  if (!board) throw new NotFoundError('Board not found');

  // Reorder columns based on the new order array
  const reordered = columnIds.map((id, index) => {
    const col = board.columns.find(c => c._id.toString() === id);
    if (!col) throw new BadRequestError(`Column ${id} not found`);
    return { ...col.toObject(), order: index };
  });

  board.columns = reordered;
  return board.save();
}
```

---

## ✅ Definition of Done

- [ ] Design boards with embedded columns
- [ ] Implement column add, remove, rename, reorder
- [ ] Support WIP limits per column

---

<div align="center">

**Module 05** | [Lesson 1](./01-project-management-api.md) → **Lesson 2** → [Lesson 3](./03-board-templates.md)

</div>
