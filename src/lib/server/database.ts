import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import type { Database } from 'lucide-svelte'
import { DATABASE_URL } from '$env/static/private'

export const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: DATABASE_URL,
  })
})

// Database interface is passed to Kysely's constructor, and from now on, Kysely 
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how 
// to communicate with your database.
export const db = new Kysely <Database>({
  dialect
})