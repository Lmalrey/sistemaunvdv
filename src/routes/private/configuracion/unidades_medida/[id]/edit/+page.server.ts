import {db} from '$lib/server/database';
import { unidadMedidaSchema, editUnidadMedidaSchema } from '../../schema';
import {error, fail, redirect} from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import { zod4 } from 'sveltekit-superforms/adapters';

// 1. FUNCIÓN `load` PARA CARGAR DATOS EN EL FORMULARIO
export const load: PageServerLoad = async ({ params }) => {
    const id = Number(params.id);
    if (isNaN(id)) {
        throw error(400, 'ID inválido');
    }

    // Buscamos el diagnóstico existente en la base de datos
    const unidad = await db
        .selectFrom('measurement_unit')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();

    if (!unidad) {
        throw error(404, 'Unidad de medida no encontrada');
    }

    // Mapeamos el objeto de la base de datos al que espera el schema de Zod.
    // Esto asegura que el campo 'nombre' se popule correctamente en el formulario.
    const dataForForm = {
        id: unidad.id,
        nombre: unidad.name,
        unidad: unidad.unit
    };
    // Inicializamos Superforms con el esquema y los datos cargados.
    const form = await superValidate(dataForForm, zod4(editUnidadMedidaSchema));

    // Pasamos el formulario a la página .svelte
    return { form };
};

// 2. OBJETO `actions` PARA MANEJAR LA ACTUALIZACIÓN
export const actions: Actions = {
    default: async ({ request, params }) => {
        // Validamos los datos que vienen del formulario del cliente
        // Usamos el schema base, ya que el ID lo tomamos de la URL de forma segura.
        const form = await superValidate(request, zod4(unidadMedidaSchema));

        // Si el formulario no es válido, Superforms lo devuelve automáticamente
        // con los errores para que se muestren en el cliente.
        if (!form.valid) {
            return fail(400, { form });
        }

        const id = Number(params.id);
        if (isNaN(id)) {
            return fail(400, { message: 'ID inválido', form });
        }

        // Si es válido, actualizamos la base de datos.
        try {
            await db
                .updateTable('measurement_unit')
                .set({
                    name: form.data.nombre,
                    unit: form.data.unidad
                })
                .where('id', '=', id)
                .execute();
        } catch (e) {
            console.error(e);
            return fail(500, { message: 'No se pudo actualizar la base de datos.', form });
        }

        // Si todo sale bien, redirigimos al usuario a la lista principal.
        throw redirect(303, '/private/configuracion/unidades_medida');
    }
};
