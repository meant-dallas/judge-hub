import type { Config } from 'drizzle-kit'

const url = process.env.DATABASE_URL ?? 'file:./local.db'
const isSQLite = url.startsWith('file:')

export default {
  schema:  isSQLite ? './lib/db/schema.sqlite.ts' : './lib/db/schema.pg.ts',
  out:     './drizzle',
  dialect: isSQLite ? 'sqlite' : 'postgresql',
  dbCredentials: isSQLite
    ? { url: url.replace(/^file:/, '') }
    : { url },
} satisfies Config
