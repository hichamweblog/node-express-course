# Lesson 03: Integration & E2E Tests

> **Module 13** | **Lesson 3 of 4** | ⏱️ 50 minutes

---

## 💻 Code: Full Integration Test

```typescript
describe('Task Lifecycle', () => {
  it('creates task, moves it, and verifies activity log', async () => {
    // 1. Create task
    const createRes = await request(app)
      .post(`/api/v1/boards/${boardId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Integration test task' });
    expect(createRes.status).toBe(201);

    const taskId = createRes.body.data._id;

    // 2. Move task
    const moveRes = await request(app)
      .patch(`/api/v1/tasks/${taskId}/move`)
      .set('Authorization', `Bearer ${token}`)
      .send({ toColumnId: doneColumnId, newPosition: 0 });
    expect(moveRes.status).toBe(200);

    // 3. Verify activity was logged
    const activityRes = await request(app)
      .get(`/api/v1/tasks/${taskId}/activity`)
      .set('Authorization', `Bearer ${token}`);

    expect(activityRes.body.data).toHaveLength(2); // created + moved
    expect(activityRes.body.data[0].action).toBe('moved');
  });
});
```

---

## ✅ Definition of Done

- [ ] Full lifecycle integration tests
- [ ] Test database isolation between tests
- [ ] Verify activity logging in integration

---

<div align="center">

**Module 13** | [Lesson 2](./02-mocking-realtime.md) → **Lesson 3** → [Lesson 4](./04-taskforge-test-suite.md)

</div>
