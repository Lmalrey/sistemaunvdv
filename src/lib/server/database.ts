import { Pool } from 'pg'
import { Kysely, PostgresDialect, type Selectable, type Insertable, type Generated } from 'kysely'
import { config } from 'dotenv';

config();

// Asegúrate de que las variables de entorno necesarias están definidas
if (!process.env.DATABASE_URL) {
  throw new Error('La variable de entorno DATABASE_URL no está definida');
}


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

export interface GenderTable {
  id: Generated<bigint>;
  gender: string;
}

export interface ProvinceTable {
    id: Generated<bigint>;
    name: string;
}

export interface StateTable {
    id: Generated<bigint>;
    name: string;
}

export interface PersonalBackgroundTable {
    id: Generated<bigint>;
    description: string;
}

export interface PersonalBackgroundQuestionTable {
    id: Generated<bigint>;
    question: string;
}

export interface PersonalBackgroundQuestionJunctionTable {
    background_id: bigint;
    question_id: bigint;
    answer: boolean;
}

export interface FamilyBackgroundTable {
    id: Generated<bigint>;
    description: string;
}

export interface FamilyBackgroundQuestionTable {
    id: Generated<bigint>;
    question: string;
}

export interface FamilyBackgroundQuestionJunctionTable {
    background_id: bigint;
    question_id: bigint;
    answer: boolean;
}

export interface PatientTable {
  id: Generated<bigint>;
  ci: number;
  name: string;
  lastName: string;
  birthDate: Date;
  phone: string;
  email: string;
  gender_id: bigint;
  province_id: bigint;
  state_id: bigint;
  city: string;
  personal_background_id: bigint;
  family_background_id: bigint;
  parent_fullname: string;
  parent_ci: number;
}



export interface Database {
  diagnosis: DiagnosisTable;
  medicine_brand: MedicineBrandTable;
  medicine: MedicineTable;
  measurement_unit: MeasurementUnitTable;
  personal_background_question: PersonalBackgroundQuestionTable;
  family_background_question: FamilyBackgroundQuestionTable;
  patient: PatientTable;
  gender: GenderTable;
  province: ProvinceTable;
  state: StateTable;
  personal_background: PersonalBackgroundTable;
  personal_background_question_junction: PersonalBackgroundQuestionJunctionTable;
  family_background: FamilyBackgroundTable;
  family_background_question_junction: FamilyBackgroundQuestionJunctionTable;
  // Si tuvieras más tablas, como `users: UsersTable;`, las añadirías aquí.
}

export const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
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
export type Patient = Selectable<Database['patient']>;
export type NewPatient = Insertable<Database['patient']>;