# Lesson 02: Horizontal Scaling Patterns

> **Module 13: Deployment & Scaling** | **Lesson 2 of 4** | ⏱️ 45 minutes

---

## 📖 Theory: Scaling Strategies

```
┌─────────────────────────────────────────────────────────────┐
│              SCALING STRATEGIES                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  VERTICAL SCALING (Scale Up)                                │
│  ──────────────────────────                                 │
│  Bigger server: more CPU, more RAM                          │
│  ✅ Simple  ❌ Has a ceiling  ❌ Single point of failure    │
│                                                              │
│  HORIZONTAL SCALING (Scale Out)                             │
│  ────────────────────────────                               │
│  More servers behind a load balancer                        │
│  ✅ Unlimited scaling  ✅ Fault tolerant  ❌ More complex   │
│                                                              │
│               Load Balancer                                  │
│              /      |      \                                │
│          App:1   App:2   App:3                              │
│              \      |      /                                │
│              PostgreSQL + Redis                              │
│              (shared state)                                  │
│                                                              │
│  REQUIREMENTS FOR HORIZONTAL SCALING:                       │
│  ✅ Stateless servers (no local file storage)               │
│  ✅ Shared sessions (Redis, not memory)                     │
│  ✅ Database connection pooling                             │
│  ✅ Idempotent API operations                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 Code: Docker Compose for Production

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  api:
    build: .
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }

  nginx:
    image: nginx:alpine
    ports: ['80:80']
    volumes: ['./nginx.conf:/etc/nginx/nginx.conf']
    depends_on: [api]
```

---

## ✅ Definition of Done

- [ ] Explain vertical vs horizontal scaling
- [ ] List requirements for stateless servers
- [ ] Configure multiple replicas with Docker Compose

---

<div align="center">

**Module 13** | [Lesson 1](./01-production-configuration.md) → **Lesson 2** → [Lesson 3](./03-monitoring-observability.md)

</div>
