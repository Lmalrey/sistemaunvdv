import { Kysely } from "kysely";

export async function up (db: Kysely<unknown>): Promise<void> {
    await db.schema
        .alterTable('recipe_medicine')
        .addColumn('medicine_concentration_id', 'bigint', col => col.references('medicine_concentration.id').notNull())
        .execute();
}
export async function down (db: Kysely<unknown>): Promise<void> {
    await db.schema
        .alterTable('recipe_medicine')
        .dropColumn('medicine_concentration_id')
        .execute();
}