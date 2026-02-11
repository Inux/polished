/**
 * @polished/database
 *
 * Database layer for Polished - Beauty Studio SaaS Platform
 *
 * Architecture:
 * - Direct SQL queries (no ORM)
 * - Zod for runtime validation and TypeScript types
 * - Multi-tenant row-level security
 */

// Database client
export { sql as db, testConnection, closeConnection } from './client';

// All Zod schemas and types
export * from './schemas';

// All query functions
export * from './queries';
