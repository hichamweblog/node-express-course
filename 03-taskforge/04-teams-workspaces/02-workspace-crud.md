# Lesson 02: Workspace CRUD & Members

> **Module 04** | **Lesson 2 of 4** | ⏱️ 50 minutes

---

## 💻 Code: Workspace Service

```typescript
export const workspaceService = {
  async create(userId: string, data: { name: string; description?: string }) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return Workspace.create({
      ...data,
      slug,
      members: [{ userId, role: 'owner', joinedAt: new Date() }],
      createdBy: userId,
    });
  },

  async getUserWorkspaces(userId: string) {
    return Workspace.find({
      'members.userId': userId,
      isArchived: false,
    }).populate('members.userId', 'name email avatar');
  },

  async addMember(workspaceId: string, userId: string, role: WorkspaceRole = 'member') {
    return Workspace.findByIdAndUpdate(
      workspaceId,
      { $addToSet: { members: { userId, role, joinedAt: new Date() } } },
      { new: true },
    );
  },

  async removeMember(workspaceId: string, userId: string) {
    return Workspace.findByIdAndUpdate(
      workspaceId,
      { $pull: { members: { userId } } },
      { new: true },
    );
  },

  async updateMemberRole(workspaceId: string, userId: string, role: WorkspaceRole) {
    return Workspace.findOneAndUpdate(
      { _id: workspaceId, 'members.userId': userId },
      { $set: { 'members.$.role': role } },
      { new: true },
    );
  },
};
```

---

## ✅ Definition of Done

- [ ] Create workspaces with auto-slug generation
- [ ] Add, remove, and update member roles
- [ ] Query workspaces a user belongs to

---

<div align="center">

**Module 04** | [Lesson 1](./01-multi-tenant-modeling.md) → **Lesson 2** → [Lesson 3](./03-invitation-system.md)

</div>
