import cors from "cors";
import "dotenv/config";
import express, { type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { config } from "./config/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { logger } from "./utils/logger.js";

// ===========================================
// Express 5 Application Setup
// ===========================================

const app = express();

// -------------------------------------------
// Security Middleware
// -------------------------------------------

// Helmet - Sets various HTTP headers for security
app.use(helmet());

// CORS - Cross-Origin Resource Sharing
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Rate Limiting - Prevent brute force attacks
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

// Parse JSON bodies
app.use(express.json({ limit: "10kb" }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// -------------------------------------------
// Request Logging
// -------------------------------------------

app.use((req: Request, _res: Response, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
  });
  next();
});

// -------------------------------------------
// Health Check Route
// -------------------------------------------

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "DevJobs Pro API is running",
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------
// API Routes
// -------------------------------------------

// TODO: Import and mount route modules
// import authRoutes from './routes/auth.routes.js';
// import jobRoutes from './routes/job.routes.js';
// import userRoutes from './routes/user.routes.js';
// import applicationRoutes from './routes/application.routes.js';
// import companyRoutes from './routes/company.routes.js';

// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/jobs', jobRoutes);
// app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/applications', applicationRoutes);
// app.use('/api/v1/companies', companyRoutes);

// -------------------------------------------
// Error Handling
// -------------------------------------------

// Handle 404 - Route not found
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// -------------------------------------------
// Server Startup
// -------------------------------------------

const startServer = async (): Promise<void> => {
  try {
    // TODO: Test database connection before starting
    // await db.execute(sql`SELECT 1`);
    // logger.info('Database connection established');

    app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📍 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 Health check: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  logger.fatal("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: unknown) => {
  logger.fatal("Unhandled Rejection:", reason);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

startServer();

export default app;
