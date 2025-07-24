import { Pool } from "pg";
import {
  Kysely,
  PostgresDialect,
  type Selectable,
  type Insertable,
  type Generated,
} from "kysely";
import { config } from "dotenv";

config();

// Asegúrate de que las variables de entorno necesarias están definidas
if (!process.env.DATABASE_URL) {
  throw new Error("La variable de entorno DATABASE_URL no está definida");
}

export interface DiagnosisTable {
  id: Generated<bigint>;
  name: string;
  // Si tuvieras más columnas, como `description: string;`, las añadirías aquí.
}
export interface MedicineBrandTable {
  id: Generated<bigint>;
  name: string;
}

export interface MedicineTable {
  id: Generated<bigint>; // Corregido: Unificado a bigint para consistencia
  name: string;
  brand_id: bigint; // Corregido: Unificado a bigint para consistencia
}
export interface MeasurementUnitTable {
  id: Generated<bigint>; // Corregido: Unificado a bigint para consistencia
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

export interface PhysicalExamTable { // Corregido: Exportar la interfaz
  id: Generated<bigint>;
  weight: number;
  height: number;
  cephalic_perimeter: number;
  heard_rate: number;
  blood_pressure: string;
  breathing_rate: number;
  date: string;
}

export interface MedicalRecordTable {
  id: Generated<bigint>;
  tenant_id: bigint;
  doctor_id: bigint;
  patient_id: bigint;
  physical_exam_id: bigint;
  emmited_at: string;
  description: string;
  work_plan: string;
}

export interface MedicalRecordDiagnosisTable {
  medical_record_id: bigint;
  diagnosis_id: bigint;
}

export interface TenantTable {
  id: Generated<bigint>;
  name: string;
  rif: string;
  phone: string;
  email: string;
  state_id: bigint;
  city: string;
  address: string;
}

export interface DoctorTable{
  id: Generated<bigint>;
  name: string;
  lastName: string;
  matricula: number;
  colegio_id: number;
  rif: string;
  specialty_id: bigint;
  phone: string;
  email: string;
  logo_url: string;
  account_id: string;
}
export interface DoctorSpecialtyTable {
    id: Generated<bigint>;
    name: string;
}
export interface RecipeTable{
  id: Generated<bigint>;
  tenant_id: bigint;
  date: string;
  doctor_id: bigint;
  patient_id: bigint;
  medical_record_id: bigint;
}
export interface RecipeMedicineTable{
  recipe_id: bigint;
  medicine_id: bigint;
  medicine_concentration_id: bigint;
  indications: string
}
export interface MedicineConcentrationTable{
  id: Generated<bigint>;
  amount: number;
  measurement_unit_id: bigint;
}
export interface DateTable {
  id: Generated<bigint>;
  date: Date;
  status_id: bigint;
  doctor_id: bigint;
  patient_id: bigint;
  observation: string;
}
export interface DateStatusTable {
  id: Generated<bigint>;
  status: string;
}
export interface SecretariaTable {
  id: Generated<bigint>;
  name: string;
  lastName: string;
  phone: string;
  account_id: string;
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
  physical_exam: PhysicalExamTable;
  medical_record: MedicalRecordTable;
  medical_record_diagnosis: MedicalRecordDiagnosisTable; // Añadido: Registrar la tabla en la BD
  tenant: TenantTable;
  doctor: DoctorTable;
  doctor_specialty: DoctorSpecialtyTable;
  recipe: RecipeTable;
  recipe_medicine: RecipeMedicineTable;
  medicine_concentration: MedicineConcentrationTable;
  date: DateTable;
  date_status: DateStatusTable;
  secretaria: SecretariaTable;
  // Si tuvieras más tablas, como `users: UsersTable;`, las añadirías aquí.
}

export const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<Database>({
  dialect,
});

export type Diagnosis = Selectable<Database["diagnosis"]>;
export type MedicineBrand = Selectable<Database["medicine_brand"]>;
export type Medicine = Selectable<Database["medicine"]>;
export type MeasurementUnit = Selectable<Database["measurement_unit"]>;
export type PersonalBackgroundQuestion = Selectable<Database["personal_background_question"]>;
export type FamilyBackgroundQuestion = Selectable<Database["family_background_question"]>;
export type Patient = Selectable<Database["patient"]>;
export type NewPatient = Insertable<Database["patient"]>;
export type MedicalRecord= Selectable<Database["medical_record"]>;
export type NewMedicalRecord = Insertable<Database["medical_record"]>;
export type Tenant = Selectable<Database["tenant"]>;
export type NewTenant = Insertable<Database["tenant"]>;
export type Doctor = Selectable<Database["doctor"]>;
export type NewDoctor = Insertable<Database["doctor"]>;
export type PhysicalExam = Selectable<Database["physical_exam"]>;
export type NewPhysicalExam = Insertable<Database["physical_exam"]>;
export type Recipe = Selectable<Database["recipe"]>;
export type NewRecipe = Insertable<Database["recipe"]>;
export type Fecha= Selectable<Database["date"]>;
export type NewDate = Insertable<Database["date"]>;
export type Secretaria=Selectable<Database["secretaria"]>;
export type NewSecretaria = Insertable<Database["secretaria"]>;


