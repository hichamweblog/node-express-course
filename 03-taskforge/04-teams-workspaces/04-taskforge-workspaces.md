# Lesson 04: 🛠️ PROJECT — Workspaces API

> **Module 04** | **Lesson 4 of 4** | ⏱️ 60 minutes

---

## API Endpoints

```
POST   /api/v1/workspaces              → Create workspace
GET    /api/v1/workspaces              → List user's workspaces
GET    /api/v1/workspaces/:id          → Get workspace details
PATCH  /api/v1/workspaces/:id          → Update workspace
DELETE /api/v1/workspaces/:id          → Archive workspace
POST   /api/v1/workspaces/:id/members  → Add member
DELETE /api/v1/workspaces/:id/members/:userId → Remove member
PATCH  /api/v1/workspaces/:id/members/:userId → Change role
```

---

## ✅ Definition of Done

- [ ] All workspace endpoints functional
- [ ] Role-based authorization enforced
- [ ] Members can be added, removed, and role-changed
- [ ] Data isolation verified between workspaces

---

<div align="center">

**🎉 Module 04 Complete! → [Start Module 05: Projects & Boards](../05-projects-boards/README.md)**

</div>
