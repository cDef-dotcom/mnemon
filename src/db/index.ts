import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

export function getDb() {
  if (!databaseUrl) {
    console.warn('[Mnemon DB] Warning: DATABASE_URL environment variable is not set.');
    return null;
  }
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

export type DbClient = ReturnType<typeof getDb>;
