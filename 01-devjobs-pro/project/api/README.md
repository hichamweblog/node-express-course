# DevJobs Pro API

A production-ready job board API built with Express 5, TypeScript, PostgreSQL, and Drizzle ORM.

## 🚀 Features

- **Express 5** with native async/await error handling
- **TypeScript** for type safety
- **PostgreSQL** with **Drizzle ORM** for database management
- **Zod** for runtime validation
- **JWT** authentication with refresh tokens
- **Role-based access control** (Candidate, Employer, Admin)
- **File uploads** with Cloudinary integration
- **Email service** with Nodemailer
- **Security** with Helmet, CORS, and rate limiting
- **Structured logging** with Pino

## 📁 Project Structure

```
api/
├── drizzle/                  # Generated migrations
├── src/
│   ├── config/               # Environment configuration
│   │   └── index.ts          # Zod-validated config
│   ├── db/
│   │   ├── schema/           # Drizzle schema definitions
│   │   │   └── index.ts      # Schema exports
│   │   └── index.ts          # Database connection
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication & authorization
│   │   └── errorHandler.ts   # Global error handling
│   ├── routes/               # Route definitions (TODO)
│   ├── controllers/          # Request handlers (TODO)
│   ├── services/             # Business logic (TODO)
│   ├── utils/
│   │   └── logger.ts         # Pino logger setup
│   └── index.ts              # Application entry point
├── .env.example              # Environment template
├── drizzle.config.ts         # Drizzle Kit configuration
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or pnpm

### Installation

1. **Clone and navigate to the project:**

   ```bash
   cd 01-devjobs-pro/project/api
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Set up the database:**

   ```bash
   # Create database
   createdb devjobs_pro

   # Generate and run migrations
   npm run db:generate
   npm run db:migrate
   ```

5. **Start the development server:**

   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:3000`

## 📜 Available Scripts

| Script                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Start development server with hot reload |
| `npm run build`         | Compile TypeScript to JavaScript         |
| `npm run start`         | Run production server                    |
| `npm run test`          | Run tests with Vitest                    |
| `npm run test:coverage` | Run tests with coverage report           |
| `npm run db:generate`   | Generate migrations from schema changes  |
| `npm run db:migrate`    | Apply pending migrations                 |
| `npm run db:studio`     | Open Drizzle Studio (database GUI)       |

## 🔒 Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable             | Description                                |
| -------------------- | ------------------------------------------ |
| `NODE_ENV`           | Environment: development, production, test |
| `PORT`               | Server port (default: 3000)                |
| `DATABASE_URL`       | PostgreSQL connection string               |
| `JWT_SECRET`         | Secret for access tokens (min 32 chars)    |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (min 32 chars)   |
| `CLOUDINARY_*`       | Cloudinary credentials                     |
| `SMTP_*`             | Email service configuration                |
| `CORS_ORIGIN`        | Allowed CORS origins                       |

## 🏗️ API Endpoints (Planned)

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### Jobs

- `GET /api/v1/jobs` - List all jobs (with filters)
- `GET /api/v1/jobs/:id` - Get job details
- `POST /api/v1/jobs` - Create job (Employer)
- `PUT /api/v1/jobs/:id` - Update job (Employer)
- `DELETE /api/v1/jobs/:id` - Delete job (Employer)

### Applications

- `GET /api/v1/applications` - List user's applications
- `POST /api/v1/applications` - Apply to job (Candidate)
- `PATCH /api/v1/applications/:id/status` - Update status (Employer)

### Users

- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update profile
- `PUT /api/v1/users/me/avatar` - Upload avatar

### Companies

- `GET /api/v1/companies` - List companies
- `GET /api/v1/companies/:id` - Get company details
- `POST /api/v1/companies` - Create company (Employer)

## 🔐 Authentication Flow

1. User registers or logs in → receives `accessToken` + `refreshToken`
2. Access token expires in 15 minutes
3. Use refresh token to get new access token
4. Refresh token expires in 7 days

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test -- --watch
```

## 📝 Error Handling

The API uses structured error responses:

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": {
    "email": ["Invalid email format"],
    "password": ["Must be at least 8 characters"]
  }
}
```

Error codes:

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🚀 Deployment

1. Build the project:

   ```bash
   npm run build
   ```

2. Set production environment variables

3. Start the server:
   ```bash
   NODE_ENV=production npm run start
   ```

## 📄 License

MIT
