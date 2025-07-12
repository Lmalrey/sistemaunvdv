import {message, superValidate} from 'sveltekit-superforms';
import { db } from '$lib/server/database.js';
import {zod4} from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { antecedentesFamiliaresSchema } from '../schema.js';


export const load = async()=>{

    const form = await superValidate(zod4(antecedentesFamiliaresSchema));
    return {form}
}

export const actions = {
    default: async ({request}) => {
        const form = await superValidate(request, zod4(antecedentesFamiliaresSchema));
        console.log(form);

        if (!form.valid) {
            return fail(400, { form });
        }

        await db.insertInto('family_background_question')
            .values({
                question: form.data.pregunta
            })
            .execute();

        return message(form, 'Antecedente familiar guardado correctamente');
    }
}