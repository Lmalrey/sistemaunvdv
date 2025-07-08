import { db } from "$lib/server/database";
import type { ServerLoad } from "@sveltejs/kit";
import { id } from "zod/v4/locales";

export const load: ServerLoad = async()=>{
    const diagnosticos = await db
    .selectFrom('diagnosis')
    .selectAll()
    .execute();

    return {diagnosticos};

    const deletediagnosis = await db
    .deleteFrom('diagnosis')
    .where('diagnosis.id', '=', id)
    .executeTakeFirst()
}

