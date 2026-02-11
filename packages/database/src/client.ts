import postgres from 'postgres';

/**
 * PostgreSQL client for Polished
 * Uses the `postgres` library for Bun-compatible database access
 */

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/polished';

/**
 * Create PostgreSQL connection
 *
 * Configuration:
 * - Connection pooling (max 20 connections)
 * - Automatic idle timeout (20s)
 * - Connection timeout (10s)
 * - Transform: camelCase column names
 */
export const sql = postgres(databaseUrl, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
  transform: postgres.camel,
});

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

/**
 * Close database connection
 */
export async function closeConnection(): Promise<void> {
  await sql.end();
}

export default sql;
