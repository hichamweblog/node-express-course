# Lesson 03: Monitoring & Observability

> **Module 13: Deployment & Scaling** | **Lesson 3 of 4** | ⏱️ 45 minutes

---

## 📖 Theory: The Three Pillars

```
┌─────────────────────────────────────────────────────────────┐
│         THREE PILLARS OF OBSERVABILITY                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. LOGS — What happened?                                   │
│  ─────────────────────────                                  │
│  Structured JSON logs (Pino) → Log aggregation service      │
│  ✅ Already implemented with Pino!                          │
│                                                              │
│  2. METRICS — How is the system performing?                  │
│  ──────────────────────────────────────────                  │
│  Request count, response time, error rate, DB pool usage    │
│  Tools: Prometheus, Grafana, Datadog                        │
│                                                              │
│  3. TRACES — Where did time go?                             │
│  ─────────────────────────────                              │
│  Follow a request across services                           │
│  Tools: OpenTelemetry, Jaeger                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 Code: Health Check Endpoint (Enhanced)

```typescript
app.get('/health', async (req, res) => {
  const checks = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    database: 'unknown',
    redis: 'unknown',
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'healthy';
  } catch {
    checks.database = 'unhealthy';
  }

  try {
    await redis.ping();
    checks.redis = 'healthy';
  } catch {
    checks.redis = 'unhealthy';
  }

  const isHealthy = checks.database === 'healthy' && checks.redis === 'healthy';
  res.status(isHealthy ? 200 : 503).json({ status: isHealthy ? 'ok' : 'degraded', ...checks });
});
```

---

## ✅ Definition of Done

- [ ] Explain the three pillars of observability
- [ ] Enhance health check with service status
- [ ] Add response time logging middleware

---

<div align="center">

**Module 13** | [Lesson 2](./02-horizontal-scaling-patterns.md) → **Lesson 3** → [Lesson 4](./04-storeflow-deployment.md)

</div>
