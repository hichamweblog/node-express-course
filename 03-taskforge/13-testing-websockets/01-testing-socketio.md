# Lesson 01: Testing Socket.io Events

> **Module 13** | **Lesson 1 of 4** | ⏱️ 50 minutes

---

## 💻 Code: Socket.io Client in Tests

```typescript
import { io as Client, type Socket } from 'socket.io-client';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Board Real-Time Events', () => {
  let clientSocket: Socket;

  beforeAll((done) => {
    clientSocket = Client('http://localhost:3002', {
      auth: { token: testUserToken },
    });
    clientSocket.on('connect', done);
  });

  afterAll(() => {
    clientSocket.disconnect();
  });

  it('receives task:moved event when task moves', (done) => {
    clientSocket.emit('board:join', boardId);

    clientSocket.on('task:moved', (data) => {
      expect(data.taskId).toBe(taskId);
      expect(data.toColumnId).toBe(newColumnId);
      done();
    });

    // Trigger move via REST API
    request(app)
      .patch(`/api/v1/tasks/${taskId}/move`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ toColumnId: newColumnId, newPosition: 0 });
  });

  it('shows presence when joining board', (done) => {
    clientSocket.on('presence:update', (data) => {
      expect(data.users).toContain(testUserId);
      done();
    });

    clientSocket.emit('board:join', boardId);
  });
});
```

---

## ✅ Definition of Done

- [ ] Set up Socket.io client in test environment
- [ ] Test event emission and reception
- [ ] Verify authentication middleware in Socket.io

---

<div align="center">

**Module 13** | **Lesson 1** → [Lesson 2](./02-mocking-realtime.md)

</div>
