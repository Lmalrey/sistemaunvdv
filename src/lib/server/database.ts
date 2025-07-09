import { Pool } from 'pg'
import { Kysely, PostgresDialect, type Selectable } from 'kysely'
import { DATABASE_URL } from '$env/static/private'

export interface DiagnosisTable {
  id: number;
  name: string;
  // Si tuvieras más columnas, como `description: string;`, las añadirías aquí.
}

export interface Database {
  diagnosis: DiagnosisTable;
  // Si tuvieras más tablas, como `users: UsersTable;`, las añadirías aquí.
}

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

export type Diagnosis = Selectable<Database['diagnosis']>;