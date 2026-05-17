# Lesson 03: Monitoring & Security

> **Module 14** | **Lesson 3 of 4** | ⏱️ 45 minutes

---

## 💻 Code: Enhanced Health Check

```typescript
app.get('/health', async (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const checks: any = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    mongodb: mongoState === 1 ? 'healthy' : 'unhealthy',
    redis: 'unknown',
    websocket: io.engine.clientsCount,
  };

  try {
    await redis.ping();
    checks.redis = 'healthy';
  } catch {
    checks.redis = 'unhealthy';
  }

  const isHealthy = checks.mongodb === 'healthy' && checks.redis === 'healthy';
  res.status(isHealthy ? 200 : 503).json({ status: isHealthy ? 'ok' : 'degraded', ...checks });
});
```

---

## ✅ Definition of Done

- [ ] Health check reports all services
- [ ] Structured logging for production
- [ ] Security headers and rate limiting configured

---

<div align="center">

**Module 14** | [Lesson 2](./02-scaling-socketio-redis.md) → **Lesson 3** → [Lesson 4](./04-taskforge-deployment.md)

</div>
