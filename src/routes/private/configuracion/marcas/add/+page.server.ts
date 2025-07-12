import {message, superValidate} from 'sveltekit-superforms';
import { db } from '$lib/server/database.js';
import {zod4} from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { marcaSchema } from '../schema.js';


export const load = async()=>{

    const form = await superValidate(zod4(marcaSchema));
    return {form}
}

export const actions = {
    default: async ({request}) => {
        const form = await superValidate(request, zod4(marcaSchema));
        console.log(form);

        if (!form.valid) {
            return fail(400, { form });
        }

        await db.insertInto('medicine_brand')
            .values({
                name: form.data.nombre
            })
            .execute();

        return message(form, 'Marca guardado correctamente');
    }
}