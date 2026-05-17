# Lesson 04: 🛠️ PROJECT — TaskForge Models

> **Module 03** | **Lesson 4 of 4** | ⏱️ 60 minutes

---

## 🎯 What We're Building

Finalize all 7 Mongoose models with:
1. Custom validators for all business rules
2. Pre-save hooks (password hashing, slug generation)
3. Query middleware (auto-filter archived)
4. Virtuals (checklist progress, display name)
5. Compound indexes for performance
6. Seed script with test data

## Seed Script

```typescript
// src/db/seed.ts
import { connectDB } from './connection.js';
import { User, Workspace, Project, Board } from '../models/index.js';

async function seed() {
  await connectDB(process.env.MONGODB_URI!);

  // Create admin user
  const admin = await User.create({
    email: 'admin@taskforge.dev',
    name: 'Admin User',
    passwordHash: 'password123', // Pre-save hook hashes this
  });

  // Create workspace
  const workspace = await Workspace.create({
    name: 'Engineering Team',
    slug: 'engineering-team',
    members: [{ userId: admin._id, role: 'owner' }],
    createdBy: admin._id,
  });

  // Create project
  const project = await Project.create({
    name: 'TaskForge API',
    key: 'TF',
    workspaceId: workspace._id,
    settings: { taskPrefix: 'TF', taskCounter: 0 },
    createdBy: admin._id,
  });

  // Create board with default columns
  await Board.create({
    name: 'Sprint 1',
    projectId: project._id,
    columns: [
      { name: 'To Do', order: 0, color: '#6B7280' },
      { name: 'In Progress', order: 1, color: '#3B82F6' },
      { name: 'Review', order: 2, color: '#F59E0B' },
      { name: 'Done', order: 3, color: '#10B981' },
    ],
    createdBy: admin._id,
  });

  console.log('✅ Seed complete');
  process.exit(0);
}

seed().catch(console.error);
```

---

## ✅ Definition of Done

- [ ] All models have proper validation and hooks
- [ ] Seed script creates test data
- [ ] Indexes verified with `db.collection.getIndexes()`

---

<div align="center">

**🎉 Module 03 Complete! → [Start Module 04: Teams & Workspaces](../04-teams-workspaces/README.md)**

</div>
