import { Kysely } from "kysely";

export async function up (db: Kysely<unknown>): Promise<void> {
    await db.schema
        .alterTable('medicine_concentration')
        .dropColumn('medicine_id')
        .execute();
}
export async function down (db: Kysely<unknown>): Promise<void> {
    await db.schema
        .alterTable('medicine_concentration')
        .addColumn('medicine_id', 'bigint', col => col.references('medicine.id').notNull())
        .execute();
    }