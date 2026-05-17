import cors from "cors";
import "dotenv/config";
import express, { type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { config } from "./config/index.js";
import { disconnectPrisma, prisma } from "./db/prisma.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { logger } from "./utils/logger.js";

// ===========================================
// Express 5 Application Setup
// ===========================================

const app = express();

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
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// -------------------------------------------
// Body Parsing Middleware
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
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      message: "StoreFlow API is running",
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
      services: { database: "healthy" },
    });
  } catch {
    res.status(503).json({
      success: false,
      message: "Service degraded",
      services: { database: "unhealthy" },
    });
  }
});

// -------------------------------------------
// API Routes
// -------------------------------------------

// TODO: Mount routes as we build them in each module
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/products', productRoutes);
// app.use('/api/v1/categories', categoryRoutes);
// app.use('/api/v1/cart', cartRoutes);
// app.use('/api/v1/orders', orderRoutes);
// app.use('/api/v1/admin', adminRoutes);
// app.use('/api/v1/webhooks', webhookRoutes);

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
    await prisma.$queryRaw`SELECT 1`;
    logger.info("Database connection established");

    app.listen(config.port, () => {
      logger.info(`🚀 StoreFlow API running on port ${config.port}`);
      logger.info(`📍 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 Health: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  await disconnectPrisma();
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
