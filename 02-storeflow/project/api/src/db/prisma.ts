import { PrismaClient } from "@prisma/client";

import { logger } from "../utils/logger.js";

// ===========================================
// Prisma Client Singleton
// ===========================================
//
// Why a singleton?
// Each PrismaClient instance holds a connection pool.
// Creating multiple instances exhausts database connections.
// This pattern ensures ONE client for the entire application.
//
// The globalThis trick prevents hot-reload from creating
// multiple clients during development (tsx watch mode).
// ===========================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ===========================================
// Graceful Disconnect
// ===========================================

export const disconnectPrisma = async (): Promise<void> => {
  await prisma.$disconnect();
  logger.info("Prisma client disconnected");
};
