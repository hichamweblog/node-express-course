# Lesson 04: 🛠️ PROJECT — Projects & Boards API

> **Module 05** | **Lesson 4 of 4** | ⏱️ 60 minutes

---

## API Endpoints

```
POST   /api/v1/workspaces/:wid/projects       → Create project
GET    /api/v1/workspaces/:wid/projects       → List projects
GET    /api/v1/projects/:id                    → Get project
PATCH  /api/v1/projects/:id                    → Update project

POST   /api/v1/projects/:pid/boards            → Create board (from template)
GET    /api/v1/projects/:pid/boards            → List boards
GET    /api/v1/boards/:id                      → Get board with columns
PATCH  /api/v1/boards/:id/columns              → Update columns
POST   /api/v1/boards/:id/columns              → Add column
PATCH  /api/v1/boards/:id/columns/reorder      → Reorder columns
```

---

## ✅ Definition of Done

- [ ] Project CRUD within workspace scope
- [ ] Board creation from templates
- [ ] Column CRUD and reordering

---

<div align="center">

**🎉 Module 05 Complete! → [Start Module 06: Tasks & Assignments](../06-tasks-assignments/README.md)**

</div>
