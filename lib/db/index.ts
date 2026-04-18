// Dual-driver db singleton: SQLite (file:) for local dev, Neon PostgreSQL for production.
// Both Drizzle adapters expose the same .select()/.insert()/.update()/.delete() API,
// so query files can be written once and work for both.

// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path')

const rawUrl = process.env.DATABASE_URL ?? 'file:./local.db'
const isSQLite = rawUrl.startsWith('file:')
// Resolve SQLite path to absolute so it works regardless of Turbopack worker CWD
const url = isSQLite
  ? 'file:' + path.resolve(process.cwd(), rawUrl.replace(/^file:/, ''))
  : rawUrl

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
