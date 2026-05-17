# Lesson 01: Multi-Tenant Data Modeling

> **Module 04** | **Lesson 1 of 4** | ⏱️ 45 minutes

---

## 🎯 Hook: Every Workspace Is an Isolated Universe

When Alice creates a workspace, Bob shouldn't see it. When Bob creates tasks, they live inside HIS workspace. This is **multi-tenancy** — shared infrastructure, isolated data.

---

## 📖 Theory: Multi-Tenant Strategies

```
┌──────────────────────────────────────────────────────────┐
│         MULTI-TENANT DATABASE STRATEGIES                  │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  1. SEPARATE DATABASES (per tenant)                      │
│     ✅ Complete isolation  ❌ Expensive, hard to manage   │
│     → Enterprise SaaS (Salesforce)                       │
│                                                           │
│  2. SHARED DATABASE, SEPARATE COLLECTIONS                │
│     ✅ Good isolation  ❌ Many collections                │
│     → Medium complexity                                  │
│                                                           │
│  3. SHARED COLLECTION + TENANT FIELD ← Our approach      │
│     ✅ Simple  ✅ Cost-effective  ❌ Must enforce in code  │
│     → Most SaaS apps (Trello, Asana, Notion)             │
│                                                           │
│  TaskForge approach:                                     │
│  Every query includes workspaceId in the filter          │
│  { workspaceId: req.workspace._id, ... }                 │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## Workspace Data Isolation

```typescript
// EVERY service method includes workspaceId
async getProjects(workspaceId: string) {
  return Project.find({ workspaceId, isArchived: false });
  //                    ^^^^^^^^^^^ data isolation!
}

// Middleware can auto-inject workspaceId
app.use('/api/v1/workspaces/:workspaceId/*', (req, res, next) => {
  req.workspaceId = req.params.workspaceId;
  next();
});
```

---

## ✅ Definition of Done

- [ ] Explain three multi-tenant strategies
- [ ] Design workspace-scoped queries
- [ ] Understand why every query needs workspaceId

---

<div align="center">

**Module 04** | **Lesson 1** → [Lesson 2](./02-workspace-crud.md)

</div>
