import {message, superValidate} from 'sveltekit-superforms';
import { db } from '$lib/server/database.js';
import {zod4} from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { unidadMedidaSchema } from '../schema.js';


export const load = async()=>{

    const form = await superValidate(zod4(unidadMedidaSchema));
    return {form}
}

export const actions = {
    default: async ({request}) => {
        const form = await superValidate(request, zod4(unidadMedidaSchema));
        console.log(form);

        if (!form.valid) {
            return fail(400, { form });
        }

        await db.insertInto('measurement_unit')
            .values({
                name: form.data.nombre,
                unit: form.data.unidad
            })
            .execute();

        return message(form, 'Unidad de medida guardada correctamente');
    }
}