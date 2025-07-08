import { db } from "$lib/server/database";
import type { ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async()=>{
    const diagnosticos = await db
    .selectFrom('diagnosis')
    .selectAll()
    .execute();

    return {diagnosticos};
}

