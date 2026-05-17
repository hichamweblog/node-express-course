# Lesson 02: Mocking Real-Time Features

> **Module 13** | **Lesson 2 of 4** | ⏱️ 45 minutes

---

## 💻 Code: Mocking Socket.io

```typescript
// tests/mocks/socket.mock.ts
import { vi } from 'vitest';

export const mockIO = {
  to: vi.fn().mockReturnThis(),
  emit: vi.fn(),
};

vi.mock('../../src/socket/index.js', () => ({
  getIO: () => mockIO,
}));

// In your test:
expect(mockIO.to).toHaveBeenCalledWith(`board:${boardId}`);
expect(mockIO.emit).toHaveBeenCalledWith('task:moved', expect.objectContaining({
  taskId,
}));
```

---

## ✅ Definition of Done

- [ ] Mock Socket.io for unit tests
- [ ] Verify events are emitted with correct data
- [ ] Test without requiring live WebSocket connections

---

<div align="center">

**Module 13** | [Lesson 1](./01-testing-socketio.md) → **Lesson 2** → [Lesson 3](./03-integration-e2e.md)

</div>
