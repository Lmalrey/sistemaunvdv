import { db } from '$lib/server/database.js';
import { medicineSchema } from '../../schema';
import { message } from 'sveltekit-superforms';
import { error, fail, redirect } from '@sveltejs/kit';

import { zod4 } from 'sveltekit-superforms/adapters';

// --- PASO 1: IMPORTAR EL ADAPTADOR Y SUPERVALIDATE ---
import { superValidate } from 'sveltekit-superforms/server';

export const load = async ({ params }) => {
    const brands = await db.selectFrom('medicine_brand').selectAll().orderBy('name', 'asc').execute();

    const medicine = await db.selectFrom('medicine')
        .selectAll()
        .where('id', '=', Number(params.id))
        .executeTakeFirst();
    
    if (!medicine) {
        throw error(404, 'Medicamento no encontrado');
    }

    // --- PASO 2: USAR EL ADAPTADOR EN LA LLAMADA ---
    // ¡IMPORTANTE! Convertimos brand_id a string para que coincida con el <select> del formulario.
    const form = await superValidate(
		{
			...medicine,
			brand_id: String(medicine.brand_id ?? '')
		},
		zod4(medicineSchema)
	);

    return { form, brands };
};

export const actions = {
    default: async ({ request, params }) => {
        const form = await superValidate(request, zod4(medicineSchema));
        if (!form.valid) {
            return fail(400, { form });
        }

		// ¡IMPORTANTE! Convertimos brand_id de nuevo a número antes de guardarlo en la BD.
        // Y usamos `params.id` para identificar el registro a actualizar.
        await db.updateTable('medicine').set({
            name: form.data.name,
            brand_id: Number(form.data.brand_id)
        }).where('id', '=', Number(params.id))
          .execute();

        return message(form, 'Medicamento actualizado correctamente');
    }
};