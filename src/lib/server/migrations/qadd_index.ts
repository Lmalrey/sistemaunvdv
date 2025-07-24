import { Kysely } from "kysely";

export async function up (db: Kysely<unknown>): Promise<void> {
    await db.schema.createIndex('idx_doctor_id_date')
        .on('date')
        .columns(['doctor_id', 'date'])
        .execute();
}
export async function down (db: Kysely<unknown>): Promise<void> {
    await db.schema.dropIndex('idx_doctor_id_date').execute();
}