import { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {

    await db.schema
    .createTable("doctor_specialty")
        .addColumn("id", "bigint", col => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn("name", "varchar(30)", col => col.notNull()).execute();

    await db.schema
    .createTable('doctor')
        .addColumn("id", "bigint", col => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn("name", "varchar(30)", col => col.notNull())
        .addColumn("lastName", "varchar(30)", col => col.notNull())
        .addColumn("matricula", "integer", col => col.notNull().unique())
        .addColumn("colegio_id", "integer", col => col.notNull())
        .addColumn("rif", "text", col => col.notNull())
        .addColumn("specialty_id", "bigint", col => col.references("doctor_specialty.id").notNull())
        .addColumn("phone", "varchar(15)", col => col.notNull())
        .addColumn("email", "varchar(50)", col => col.notNull())
        .addColumn("logo_url", "text")
        .addColumn("account_id", "uuid", col => col.notNull()).execute();
    
    await db.schema
    .createTable("secretaria")
        .addColumn("id", "bigint", col => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn("name", "varchar(30)", col => col.notNull())
        .addColumn("lastName", "varchar(30)", col => col.notNull())
        .addColumn("phone", "varchar(15)", col => col.notNull())
        .addColumn("account_id", "uuid", col => col.notNull()).execute();

    await db.schema
    .createTable("gender")
        .addColumn("id", "bigint", col => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn("gender", "varchar(10)", col => col.notNull()).execute();

    await db.schema
    .createTable("province")
        .addColumn("id", "bigint", col => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn("name", "varchar(20)", col => col.notNull()).execute();
    
    await db.schema
    .createTable("state")
        .addColumn("id", "bigint", col => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn("name", "varchar(20)", col => col.notNull()).execute();

    await db.schema
    .createTable("personal_background")
        .addColumn("id", "bigint", col => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn("description", "text", col => col.notNull()).execute();

    await db.schema
    .createTable("personal_background_question")
        .addColumn("id", "bigint", col => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn("question", "text", col => col.notNull()).execute();

    await db.schema
    .createTable("personal_background_question_junction")
        .addColumn("background_id", "bigint", col => col.references("personal_background.id").notNull())
        .addColumn("question_id", "bigint", col => col.references("personal_background_question.id").notNull())
        .addColumn("answer", "boolean", col => col.notNull()).execute();

    await db.schema
    .createTable("family_background")
        .addColumn("id", "bigint", col => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn("description", "text", col => col.notNull()).execute();

    await db.schema
    .createTable("family_background_question")
        .addColumn("id", "bigint", col => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn("question", "text", col => col.notNull()).execute();

    await db.schema
    .createTable("family_background_question_junction")
        .addColumn("background_id", "bigint", col => col.references("family_background.id").notNull())
        .addColumn("question_id", "bigint", col => col.references("family_background_question.id").notNull())
        .addColumn("answer", "boolean", col => col.notNull()).execute();

    await db.schema
    .createTable("patient")
        .addColumn("id", "bigint", col => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn("ci", "integer", col => col.unique())
        .addColumn("name", "varchar(30)", col => col.notNull())
        .addColumn("lastName", "varchar(30)", col => col.notNull())
        .addColumn("birthDate", "date", col => col.notNull())
        .addColumn("phone", "varchar(15)", col => col.notNull())
        .addColumn("email", "varchar(50)", col => col.notNull())
        .addColumn("gender_id", "bigint", col => col.references("gender.id").notNull())
        .addColumn("province_id", "bigint", col => col.references("province.id").notNull())
        .addColumn("state_id", "bigint", col => col.references("state.id").notNull())
        .addColumn("city", "varchar(30)", col => col.notNull())
        .addColumn("personal_background_id", "bigint", col => col.references("personal_background.id").notNull())
        .addColumn("family_background_id", "bigint", col => col.references("family_background.id").notNull())
        .addColumn("parent_fullname", "varchar(50)", col => col.notNull())
        .addColumn("parent_ci", "integer", col => col.notNull()).execute();
    
    await db.schema
    .createTable("date_status")
        .addColumn("id", "bigint", col => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn("status", "varchar(20)", col => col.notNull()).execute();

    await db.schema
    .createTable("date")
        .addColumn("id", "bigint", col => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn("date", "timestamp", col => col.notNull())
        .addColumn("status_id", "bigint", col => col.references("date_status.id").notNull())
        .addColumn("doctor_id", "bigint", col => col.references("doctor.id").notNull())
        .addColumn("patient_id", "bigint", col => col.references("patient.id").notNull())
        .addColumn("observation", "text").execute();

    await db.schema
    .createTable("tenant")
        .addColumn("id", "bigint", col => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn("name", "varchar(30)", col => col.notNull())
        .addColumn("rif", "text", col => col.notNull())
        .addColumn("phone", "varchar(15)", col => col.notNull())
        .addColumn("email", "varchar(50)", col => col.notNull())
        .addColumn("state_id", "bigint", col => col.references("state.id").notNull())
        .addColumn("city", "varchar(30)", col => col.notNull())
        .addColumn("address", "text", col => col.notNull()).execute();

    await db.schema
    .createTable("physical_exam")
        .addColumn("id", "bigint", col => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn("weight", "integer", col => col.notNull())
        .addColumn("height", "integer", col => col.notNull())
        .addColumn("cephalic_perimeter", "integer", col => col.notNull())
        .addColumn("heard_rate", "integer", col => col.notNull())
        .addColumn("breathing_rate", "integer", col => col.notNull())
        .addColumn("blood_pressure", "numrange", col => col.notNull())
        .addColumn("date", "date", col => col.notNull()).execute();

    await db.schema
    .createTable("medical_record")
        .addColumn("id", "bigint", col => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn("tenant_id", "bigint", col => col.references("tenant.id").notNull())
        .addColumn("doctor_id", "bigint", col => col.references("doctor.id").notNull())
        .addColumn("patient_id", "bigint", col => col.references("patient.id").notNull())
        .addColumn("physical_exam_id", "bigint", col => col.references("physical_exam.id").notNull())
        .addColumn("emmited_at", "date", col => col.notNull())
        .addColumn("description", "text", col => col.notNull())
        .addColumn("work_plan", "text", col => col.notNull()).execute();

    await db.schema
    .createTable("diagnosis")
        .addColumn("id", "bigint", col => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn("name", "varchar(100)", col => col.notNull()).execute();

    await db.schema
    .createTable("medical_record_diagnosis")
        .addColumn("medical_record_id", "bigint", col => col.references("medical_record.id").notNull())
        .addColumn("diagnosis_id", "bigint", col => col.references("diagnosis.id").notNull()).execute();
    
    await db.schema
    .createTable("recipe")
        .addColumn("id", "bigint", col => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn("tenant_id", "bigint", col => col.references("tenant.id").notNull())
        .addColumn("date", "date", col => col.notNull())
        .addColumn("doctor_id", "bigint", col => col.references("doctor.id").notNull())
        .addColumn("patient_id", "bigint", col => col.references("patient.id").notNull())
        .addColumn("medical_record_id", "bigint", col => col.references("medical_record.id").notNull()).execute();

    await db.schema
    .createTable("medicine_brand")
        .addColumn("id", "bigint", col => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn("name", "varchar(50)", col => col.notNull()).execute();

    await db.schema
    .createTable("medicine")
        .addColumn("id", "bigint", col => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn("name", "varchar(50)", col => col.notNull())
        .addColumn("brand_id", "bigint", col => col.references("medicine_brand.id").notNull()).execute();

    await db.schema
    .createTable("measurement_unit")
        .addColumn("id", "bigint", col => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn("name", "varchar(20)", col => col.notNull())
        .addColumn("unit", "varchar(20)", col => col.notNull()).execute();

    await db.schema
    .createTable("medicine_concentration")
        .addColumn("id", "bigint", col => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn("medicine_id", "bigint", col => col.references("medicine.id").notNull())
        .addColumn("amount", "integer", col => col.notNull())
        .addColumn("measurement_unit_id", "bigint", col => col.references("measurement_unit.id").notNull()).execute();

    await db.schema
    .createTable("recipe_medicine")
        .addColumn("recipe_id", "bigint", col => col.references("recipe.id").notNull())
        .addColumn("medicine_id", "bigint", col => col.references("medicine.id").notNull())
        .addColumn("indications", "text", col => col.notNull()).execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
    await db.schema.dropTable("recipe_medicine").execute();
    await db.schema.dropTable("medicine_concentration").execute();
    await db.schema.dropTable("measurement_unit").execute();
    await db.schema.dropTable("medicine").execute();
    await db.schema.dropTable("medicine_brand").execute();
    await db.schema.dropTable("recipe").execute();
    await db.schema.dropTable("medical_record_diagnosis").execute();
    await db.schema.dropTable("diagnosis").execute();
    await db.schema.dropTable("medical_record").execute();
    await db.schema.dropTable("physical_exam").execute();
    await db.schema.dropTable("tenant").execute();
    await db.schema.dropTable("date").execute();
    await db.schema.dropTable("date_status").execute();
    await db.schema.dropTable("patient").execute();
    await db.schema.dropTable("family_background_question_junction").execute();
    await db.schema.dropTable("family_background_question").execute();
    await db.schema.dropTable("family_background").execute();
    await db.schema.dropTable("personal_background_question_junction").execute();
    await db.schema.dropTable("personal_background_question").execute();
    await db.schema.dropTable("personal_background").execute();
    await db.schema.dropTable("state").execute();
    await db.schema.dropTable("province").execute();
    await db.schema.dropTable("gender").execute();
    await db.schema.dropTable("secretaria").execute();
    await db.schema.dropTable("doctor").execute();
    await db.schema.dropTable("doctor_specialty").execute();
}