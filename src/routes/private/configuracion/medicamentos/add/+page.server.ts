import {db} from '$lib/server/database';
import { medicineSchema } from '../schema';
import { message, superValidate } from 'sveltekit-superforms';
import { fail } from '@sveltejs/kit';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async () => {
    // 1. Cargar todas las marcas disponibles
    const brands = await db
    .selectFrom('medicine_brand')
    .selectAll()
    .orderBy('name', 'asc')
    .execute();

    // 2. Preparar un formulario vacío
    const form = await superValidate(zod4(medicineSchema));

    // 3. Devolver el formulario y la lista de marcas
    return { form, brands };
};
export const actions = {
    default: async ({ request }) => {
        // La validación en `actions` también debe usar el adaptador
        const form = await superValidate(request, zod4(medicineSchema));
        if (!form.valid) {
            return fail(400, { form });
        }

        await db
        .insertInto('medicine')
        .values({
            name: form.data.name,
            brand_id: form.data.brand_id
        }).execute();

        return message(form, 'Medicamento guardado correctamente');
    }
};