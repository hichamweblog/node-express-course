import mongoose from "mongoose";

import { logger } from "../utils/logger.js";

// ===========================================
// MongoDB Connection
// ===========================================
//
// Unlike Prisma (singleton client), Mongoose maintains
// its OWN internal connection pool. You call connect()
// once and Mongoose handles the rest.
//
// Mongoose also supports connection events for
// monitoring health — critical in production.
// ===========================================

export const connectDB = async (uri: string): Promise<void> => {
  try {
    await mongoose.connect(uri, {
      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.fatal({ error }, "MongoDB connection failed");
    process.exit(1);
  }
};

// ===========================================
// Connection Event Monitoring
// ===========================================

mongoose.connection.on("connected", () => {
  logger.info("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  logger.error({ err }, "Mongoose connection error");
});

mongoose.connection.on("disconnected", () => {
  logger.warn("Mongoose disconnected from MongoDB");
});

// ===========================================
// Graceful Disconnect
// ===========================================

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info("Mongoose disconnected gracefully");
};

export { mongoose };
