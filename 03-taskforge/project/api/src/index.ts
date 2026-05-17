import { createServer } from "http";

import cors from "cors";
import "dotenv/config";
import express, { type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { config } from "./config/index.js";
import { connectDB, disconnectDB, mongoose } from "./db/connection.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { initializeSocket } from "./socket/index.js";
import { logger } from "./utils/logger.js";

// ===========================================
// Express 5 + Socket.io Application
// ===========================================

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io on the same HTTP server
const io = initializeSocket(httpServer);

// -------------------------------------------
// Security Middleware
// -------------------------------------------

app.use(helmet());

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: { success: false, message: "Too many requests" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// -------------------------------------------
// Body Parsing
// -------------------------------------------

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// -------------------------------------------
// Request Logging
// -------------------------------------------

app.use((req: Request, _res: Response, next) => {
  logger.info({ method: req.method, url: req.url, ip: req.ip });
  next();
});

// -------------------------------------------
// Health Check
// -------------------------------------------

app.get("/health", async (_req: Request, res: Response) => {
  const mongoState = mongoose.connection.readyState;
  const dbStatus =
    mongoState === 1 ? "healthy" : mongoState === 2 ? "connecting" : "unhealthy";

  res.status(dbStatus === "healthy" ? 200 : 503).json({
    success: dbStatus === "healthy",
    message: "TaskForge API",
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      websocket: io ? "healthy" : "unhealthy",
    },
  });
});

// -------------------------------------------
// API Routes
// -------------------------------------------

// TODO: Mount routes as we build each module
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/workspaces', workspaceRoutes);
// app.use('/api/v1/projects', projectRoutes);
// app.use('/api/v1/boards', boardRoutes);
// app.use('/api/v1/tasks', taskRoutes);
// app.use('/api/v1/comments', commentRoutes);
// app.use('/api/v1/notifications', notificationRoutes);

// -------------------------------------------
// Error Handling
// -------------------------------------------

app.use(notFoundHandler);
app.use(errorHandler);

// -------------------------------------------
// Server Startup
// -------------------------------------------

const startServer = async (): Promise<void> => {
  try {
    await connectDB(config.mongodbUri);

    httpServer.listen(config.port, () => {
      logger.info(`🚀 TaskForge API running on port ${config.port}`);
      logger.info(`📍 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 Health: http://localhost:${config.port}/health`);
      logger.info(`🔌 WebSocket: ws://localhost:${config.port}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  io.close();
  await disconnectDB();
  process.exit(0);
};

process.on("uncaughtException", (error: Error) => {
  logger.fatal("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  logger.fatal("Unhandled Rejection:", reason);
  process.exit(1);
});

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

startServer();

export default app;
