import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";
import * as schema from "./schema/index.js";

// ===========================================
// PostgreSQL Connection
// ===========================================

/**
 * PostgreSQL connection client
 *
 * Configuration options:
 * - max: Maximum number of connections in the pool
 * - idle_timeout: Seconds before idle connections are closed
 * - connect_timeout: Seconds to wait for a connection
 */
const connectionString = config.databaseUrl;

const client = postgres(connectionString, {
  max: config.isProduction ? 20 : 5,
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: () => {}, // Suppress notice messages
});

// ===========================================
// Drizzle ORM Instance
// ===========================================

/**
 * Drizzle database instance with schema
 *
 * Usage:
 * import { db } from './db/index.js';
 *
 * // Query example
 * const users = await db.select().from(schema.users);
 *
 * // Insert example
 * const newUser = await db.insert(schema.users).values({...}).returning();
 */
export const db = drizzle(client, {
  schema,
  logger: config.isDevelopment,
});

// ===========================================
// Database Health Check
// ===========================================

/**
 * Test database connection
 * Call this at server startup to verify connectivity
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    await client`SELECT 1`;
    logger.info("✅ Database connection established");
    return true;
  } catch (error) {
    logger.error("❌ Database connection failed:", error);
    return false;
  }
};

// ===========================================
// Graceful Shutdown
// ===========================================

/**
 * Close database connections gracefully
 * Call this before process exit
 */
export const closeConnection = async (): Promise<void> => {
  try {
    await client.end();
    logger.info("Database connections closed");
  } catch (error) {
    logger.error("Error closing database connections:", error);
  }
};

// Export types for use elsewhere
export type Database = typeof db;
