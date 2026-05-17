# Lesson 03: Board Templates & Settings

> **Module 05** | **Lesson 3 of 4** | ⏱️ 40 minutes

---

## 💻 Code: Board Templates

```typescript
const BOARD_TEMPLATES = {
  kanban: {
    columns: [
      { name: 'Backlog', color: '#6B7280' },
      { name: 'To Do', color: '#3B82F6' },
      { name: 'In Progress', color: '#F59E0B' },
      { name: 'Done', color: '#10B981' },
    ],
  },
  scrum: {
    columns: [
      { name: 'Product Backlog', color: '#6B7280' },
      { name: 'Sprint Backlog', color: '#8B5CF6' },
      { name: 'In Progress', color: '#3B82F6' },
      { name: 'Testing', color: '#F59E0B' },
      { name: 'Done', color: '#10B981' },
    ],
  },
  simple: {
    columns: [
      { name: 'To Do', color: '#3B82F6' },
      { name: 'Done', color: '#10B981' },
    ],
  },
};
```

---

## ✅ Definition of Done

- [ ] Create boards from templates
- [ ] Customize board settings

---

<div align="center">

**Module 05** | [Lesson 2](./02-board-column-design.md) → **Lesson 3** → [Lesson 4](./04-taskforge-projects-boards.md)

</div>
