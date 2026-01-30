// ===========================================
// Database Schema Exports
// ===========================================
//
// This file serves as the central export point for all database schemas.
// Import all your schema files here and re-export them.
//
// Example usage:
//
// 1. Create a schema file (e.g., users.ts):
//
//    import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
//
//    export const users = pgTable('users', {
//      id: uuid('id').defaultRandom().primaryKey(),
//      email: varchar('email', { length: 255 }).notNull().unique(),
//      password: varchar('password', { length: 255 }).notNull(),
//      createdAt: timestamp('created_at').defaultNow().notNull(),
//      updatedAt: timestamp('updated_at').defaultNow().notNull(),
//    });
//
// 2. Export it here:
//
//    export * from './users.js';
//
// ===========================================

// TODO: Uncomment and add schema exports as you create them
// export * from './users.js';
// export * from './jobs.js';
// export * from './companies.js';
// export * from './applications.js';
// export * from './skills.js';

// Placeholder export to prevent empty module errors
export const placeholder = true;
