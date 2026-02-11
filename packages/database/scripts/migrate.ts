/**
 * Database Migration Runner
 *
 * Runs SQL migrations in order, tracking which have been applied.
 * Usage: bun run migrate
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { sql } from '../src/client';

const MIGRATIONS_DIR = join(import.meta.dir, '../migrations');

interface Migration {
  name: string;
  appliedAt: Date;
}

async function getMigrationsTableExists(): Promise<boolean> {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = '_migrations'
      ) as exists
    `;
    return result[0].exists;
  } catch {
    return false;
  }
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const tableExists = await getMigrationsTableExists();
  if (!tableExists) {
    return new Set();
  }

  const result = await sql<Migration[]>`SELECT name FROM _migrations`;
  return new Set(result.map((m) => m.name));
}

async function applyMigration(name: string, content: string): Promise<void> {
  console.log(`  Applying: ${name}`);

  await sql.begin(async (tx) => {
    // Execute migration SQL
    await tx.unsafe(content);

    // Record migration (if table exists - first migration creates it)
    const tableExists = await getMigrationsTableExists();
    if (tableExists) {
      await tx`INSERT INTO _migrations (name) VALUES (${name})`;
    }
  });

  console.log(`  ✅ Applied: ${name}`);
}

async function runMigrations(): Promise<void> {
  console.log('\n🗄️  Polished Database Migrations\n');

  try {
    // Get list of migration files
    const files = await readdir(MIGRATIONS_DIR);
    const sqlFiles = files
      .filter((f) => f.endsWith('.sql'))
      .sort();

    if (sqlFiles.length === 0) {
      console.log('No migration files found.\n');
      return;
    }

    // Get already applied migrations
    const applied = await getAppliedMigrations();

    // Find pending migrations
    const pending = sqlFiles.filter((f) => !applied.has(f));

    if (pending.length === 0) {
      console.log('✅ All migrations are already applied.\n');
      return;
    }

    console.log(`Found ${pending.length} pending migration(s):\n`);

    // Apply each pending migration
    for (const file of pending) {
      const filePath = join(MIGRATIONS_DIR, file);
      const content = await readFile(filePath, 'utf-8');
      await applyMigration(file, content);
    }

    console.log(`\n✅ Successfully applied ${pending.length} migration(s).\n`);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run migrations
runMigrations();
