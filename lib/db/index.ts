// Dual-driver db singleton: SQLite (file:) for local dev, Neon PostgreSQL for production.
// Both Drizzle adapters expose the same .select()/.insert()/.update()/.delete() API,
// so query files can be written once and work for both.

const url = process.env.DATABASE_URL ?? 'file:./local.db'
const isSQLite = url.startsWith('file:')

// Prevent multiple connections during Next.js hot reload
const g = globalThis as unknown as { _db?: unknown; _tables?: unknown }

if (!g._db) {
  if (isSQLite) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require('drizzle-orm/better-sqlite3')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const schema = require('./schema.sqlite')
    const client = new Database(url.replace(/^file:/, ''))
    g._db = drizzle(client, { schema })
    g._tables = schema
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { neon } = require('@neondatabase/serverless')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require('drizzle-orm/neon-http')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const schema = require('./schema.pg')
    g._db = drizzle(neon(url), { schema })
    g._tables = schema
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db: any = g._db
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const tables: any = g._tables
