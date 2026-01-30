import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  // Database dialect - PostgreSQL
  dialect: "postgresql",

  // Path to your schema files
  schema: "./src/db/schema",

  // Output directory for migrations
  out: "./drizzle",

  // Database connection configuration
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  // Enable verbose logging during migrations
  verbose: true,

  // Enable strict mode for safer migrations
  strict: true,
});
