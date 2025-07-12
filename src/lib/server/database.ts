import { Pool } from 'pg'
import { Kysely, PostgresDialect, type Selectable } from 'kysely'
import { DATABASE_URL } from '$env/static/private'
import { number } from 'zod/v4';

export interface DiagnosisTable {
  id: number;
  name: string;
  // Si tuvieras más columnas, como `description: string;`, las añadirías aquí.
}
export interface MedicineBrandTable{
  id: number;
  name: string;
}

export interface MedicineTable{
  id: number;
  name: string;
  brand_id: number;
}
export interface MeasurementUnitTable{
  id: number;
  name: string;
  unit: string;
}
export interface PersonalBackgroundQuestionTable{
  id: number;
  question: string;
}
export interface FamilyBackgroundQuestionTable{
  id: number;
  question: string;
}


export interface Database {
  diagnosis: DiagnosisTable;
  medicine_brand: MedicineBrandTable;
  medicine: MedicineTable;
  measurement_unit: MeasurementUnitTable;
  personal_background_question: PersonalBackgroundQuestionTable;
  family_background_question: FamilyBackgroundQuestionTable;
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
export type MedicineBrand = Selectable<Database['medicine_brand']>;
export type Medicine = Selectable<Database['medicine']>;
export type MeasurementUnit = Selectable<Database['measurement_unit']>;
export type PersonalBackgroundQuestion = Selectable<Database['personal_background_question']>;
export type FamilyBackgroundQuestion = Selectable<Database['family_background_question']>;