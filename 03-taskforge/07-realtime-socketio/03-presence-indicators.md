# Lesson 03: Presence & Typing Indicators

> **Module 07** | **Lesson 3 of 4** | ⏱️ 45 minutes

---

## 💻 Code: Presence System

```typescript
// Track who's viewing each board
const boardPresence = new Map<string, Set<string>>(); // boardId → Set<userId>

socket.on('board:join', (boardId: string) => {
  socket.join(`board:${boardId}`);

  if (!boardPresence.has(boardId)) boardPresence.set(boardId, new Set());
  boardPresence.get(boardId)!.add(userId);

  // Tell everyone who's on this board
  io.to(`board:${boardId}`).emit('presence:update', {
    boardId,
    users: Array.from(boardPresence.get(boardId)!),
  });
});

socket.on('disconnect', () => {
  // Remove from all boards
  for (const [boardId, users] of boardPresence) {
    if (users.delete(userId)) {
      io.to(`board:${boardId}`).emit('presence:update', {
        boardId,
        users: Array.from(users),
      });
    }
  }
});

// Typing indicator
socket.on('presence:typing_start', ({ taskId, boardId }) => {
  socket.to(`board:${boardId}`).emit('presence:user_typing', { userId, taskId });
});

socket.on('presence:typing_stop', ({ taskId, boardId }) => {
  socket.to(`board:${boardId}`).emit('presence:user_stopped_typing', { userId, taskId });
});
```

---

## ✅ Definition of Done

- [ ] Show which users are viewing a board
- [ ] Display typing indicators in task descriptions
- [ ] Clean up presence on disconnect

---

<div align="center">

**Module 07** | [Lesson 2](./02-live-board-sync.md) → **Lesson 3** → [Lesson 4](./04-taskforge-realtime.md)

</div>
