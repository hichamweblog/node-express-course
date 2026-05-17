# TaskForge API

> Real-time collaborative project management backend — Express 5, Mongoose, Socket.io

## Quick Start

### 1. Start Infrastructure

```bash
docker compose up -d
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
cp .env.example .env
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Verify

```bash
curl http://localhost:3002/health
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm test` | Run tests with Vitest |
| `npm run db:seed` | Seed database |

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/health` | Health check | ❌ |
| `POST` | `/api/v1/auth/register` | Register | ❌ |
| `POST` | `/api/v1/auth/login` | Login | ❌ |
| `GET` | `/api/v1/workspaces` | List workspaces | ✅ |
| `POST` | `/api/v1/workspaces` | Create workspace | ✅ |
| `GET` | `/api/v1/projects` | List projects | ✅ |
| `GET` | `/api/v1/boards/:id` | Get board | ✅ |
| `GET` | `/api/v1/tasks` | List tasks | ✅ |
| `POST` | `/api/v1/tasks` | Create task | ✅ |
| `PATCH` | `/api/v1/tasks/:id/move` | Move task | ✅ |
| `GET` | `/api/v1/notifications` | Get notifications | ✅ |

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `board:join` | Client → Server | Join board room |
| `board:leave` | Client → Server | Leave board room |
| `task:move` | Client → Server | Move task between columns |
| `task:moved` | Server → Client | Task was moved by another user |
| `task:updated` | Server → Client | Task was updated |
| `board:user_joined` | Server → Client | User joined board |
| `presence:typing` | Client → Server | User is typing |

## Tech Stack

- **Runtime:** Node.js v24 LTS
- **Framework:** Express 5 + Socket.io 4
- **Language:** TypeScript
- **Database:** MongoDB 7 (Mongoose 8)
- **Cache:** Redis 7
- **Testing:** Vitest + Supertest

## Project Structure

```
src/
├── index.ts              # App entry point (Express + Socket.io)
├── config/               # Zod-validated env config
├── db/                   # Mongoose connection
├── models/               # Mongoose schemas & models
├── middleware/            # Auth, errors, validation
├── routes/               # Route definitions
├── controllers/          # Request handlers
├── services/             # Business logic
├── socket/               # Socket.io setup & events
└── utils/                # Logger, helpers
```
