# Lesson 02: @Mentions & Event Triggers

> **Module 08** | **Lesson 2 of 4** | ⏱️ 50 minutes

---

## 💻 Code: Parsing @Mentions

```typescript
// Extract @mentions from text content
const parseMentions = (text: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
};

// In comment service — after creating comment:
async createComment(taskId: string, userId: string, content: string) {
  const mentionNames = parseMentions(content);

  // Resolve names to user IDs
  const mentionedUsers = await User.find({
    name: { $in: mentionNames },
  }).select('_id name');

  const comment = await Comment.create({
    taskId, userId, content,
    mentions: mentionedUsers.map(u => u._id),
  });

  // Notify mentioned users
  for (const user of mentionedUsers) {
    await notificationService.create({
      userId: user._id.toString(),
      type: 'comment_mentioned',
      title: 'You were mentioned',
      message: `${userName} mentioned you in a comment`,
      link: `/tasks/${taskId}`,
    });
  }

  return comment;
}
```

---

## ✅ Definition of Done

- [ ] Parse @mentions from comment text
- [ ] Notify mentioned users in real-time
- [ ] Notify task watchers and assignees on updates

---

<div align="center">

**Module 08** | [Lesson 1](./01-notification-architecture.md) → **Lesson 2** → [Lesson 3](./03-email-digests.md)

</div>
