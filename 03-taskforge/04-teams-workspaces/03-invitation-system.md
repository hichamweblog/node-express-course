# Lesson 03: Invitation & Role System

> **Module 04** | **Lesson 3 of 4** | ⏱️ 45 minutes

---

## 📖 Workspace Role Hierarchy

```
┌──────────────────────────────────────────────────────────┐
│              WORKSPACE ROLE PERMISSIONS                    │
├──────────────────────────────────────────────────────────┤
│                                                           │
│   Role      Permissions                                  │
│   ────      ───────────                                  │
│   owner     Everything + delete workspace + transfer     │
│   admin     Manage members + settings + all CRUD         │
│   member    Create/edit tasks + comment                  │
│   viewer    Read-only access                             │
│                                                           │
│   Hierarchy: owner > admin > member > viewer             │
│                                                           │
│   Rules:                                                 │
│   - Only one owner per workspace                         │
│   - Owners can't be removed (must transfer first)        │
│   - Admins can't change owner role                       │
│   - Members can only edit their own tasks                │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## ✅ Definition of Done

- [ ] Implement role hierarchy enforcement
- [ ] Build email invitation flow
- [ ] Prevent owner from being removed

---

<div align="center">

**Module 04** | [Lesson 2](./02-workspace-crud.md) → **Lesson 3** → [Lesson 4](./04-taskforge-workspaces.md)

</div>
