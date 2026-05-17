# Lesson 04: 🛠️ PROJECT — Tasks API

> **Module 06** | **Lesson 4 of 4** | ⏱️ 60 minutes

---

## API Endpoints

```
POST   /api/v1/boards/:bid/tasks         → Create task
GET    /api/v1/boards/:bid/tasks         → List tasks (by column)
GET    /api/v1/tasks/:id                 → Get task details
PATCH  /api/v1/tasks/:id                 → Update task
PATCH  /api/v1/tasks/:id/move            → Move task between columns
DELETE /api/v1/tasks/:id                 → Archive task

POST   /api/v1/tasks/:id/checklist       → Add checklist item
PATCH  /api/v1/tasks/:id/checklist/:iid  → Toggle checklist item
POST   /api/v1/tasks/:id/assign          → Assign user
DELETE /api/v1/tasks/:id/assign/:uid     → Unassign user
```

---

## ✅ Definition of Done

- [ ] Full task CRUD with auto-numbering
- [ ] Drag-and-drop move with real-time broadcast
- [ ] Checklists, subtasks, labels, and assignees

---

<div align="center">

**🎉 Module 06 Complete! → [Start Module 07: Real-Time with Socket.io](../07-realtime-socketio/README.md)**

</div>
