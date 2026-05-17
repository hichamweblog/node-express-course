# Lesson 01: Project Management API

> **Module 05** | **Lesson 1 of 4** | ⏱️ 45 minutes

---

## 💻 Code: Project Service with Auto-Incrementing Task Numbers

```typescript
export const projectService = {
  async create(workspaceId: string, userId: string, data: { name: string; key: string }) {
    return Project.create({
      ...data,
      workspaceId,
      settings: { taskPrefix: data.key, taskCounter: 0 },
      createdBy: userId,
    });
  },

  // Atomic task number generation: TF-001, TF-002, TF-003...
  async getNextTaskNumber(projectId: string): Promise<string> {
    const project = await Project.findByIdAndUpdate(
      projectId,
      { $inc: { 'settings.taskCounter': 1 } },
      { new: true },
    );
    if (!project) throw new NotFoundError('Project not found');
    const num = String(project.settings.taskCounter).padStart(3, '0');
    return `${project.settings.taskPrefix}-${num}`;
  },
};
```

> **💡 Why `$inc` for task numbers?** Atomic increment prevents two concurrent task creations from getting the same number. No race condition possible.

---

## ✅ Definition of Done

- [ ] CRUD for projects within a workspace
- [ ] Atomic task number generation with $inc
- [ ] Project key validation (2-6 uppercase chars)

---

<div align="center">

**Module 05** | **Lesson 1** → [Lesson 2](./02-board-column-design.md)

</div>
