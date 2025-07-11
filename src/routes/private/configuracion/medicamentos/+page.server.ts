import { db } from "$lib/server/database";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
    // 1. OBTENER PARÁMETROS (igual que antes)
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = 3; // Puedes ajustar esto
    const searchTerm = url.searchParams.get('search');

    // 2. CONSTRUIR CONSULTA BASE CON JOIN
    // ¡CRÍTICO! Unimos las dos tablas para acceder a ambos nombres.
    let queryBase = db
        .selectFrom('medicine')
        .innerJoin('medicine_brand', 'medicine_brand.id', 'medicine.brand_id');

    // 3. APLICAR BÚSQUEDA A AMBAS TABLAS
    if (searchTerm) {
        // Usamos una función de callback para agrupar condiciones con OR
        queryBase = queryBase.where((eb) => eb.or([
            eb('medicine.name', 'ilike', `%${searchTerm}%`),
            eb('medicine_brand.name', 'ilike', `%${searchTerm}%`)
        ]));
    }

    // 4. PRIMERA CONSULTA: OBTENER EL CONTEO TOTAL DE ITEMS
    // La consulta de conteo también necesita el join y el where para ser precisa.
    const totalResult = await queryBase
        .select(db.fn.count('medicine.id').as('total')) // Contamos sobre la tabla principal
        .executeTakeFirst();
    
    const totalItems = Number(totalResult?.total ?? 0);
    const pageCount = Math.ceil(totalItems / pageSize);

    // 5. SEGUNDA CONSULTA: OBTENER LOS DATOS DE LA PÁGINA ACTUAL
    const medicines = await queryBase
        // ¡CRÍTICO! Seleccionamos columnas explícitamente para evitar conflictos de nombres
        .select([
            'medicine.id',
            'medicine.name',
            'medicine_brand.name as brand_name' // Usamos un alias para el nombre de la marca
        ])
        .orderBy('medicine.name', 'asc') // Ordenamos por nombre de medicamento
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .execute();

    // 6. DEVOLVER TODOS LOS DATOS
    return {
        medicines, // Cambiado de 'diagnosticos'
        pageCount,
        currentPage: page,
        pageSize,
        totalItems,
        searchTerm
    };
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');

		if (!id) {
			return fail(400, { message: 'ID no proporcionado' });
		}

		try {
            // La eliminación solo afecta a la tabla `medicine`
			await db
				.deleteFrom('medicine')
				.where('medicine.id', '=', Number(id))
				.executeTakeFirst();
			
			return { success: true, message: `Medicamento eliminado.` };

		} catch (error) {
			console.error("Error al eliminar medicamento:", error);
			return fail(500, { message: 'Error interno del servidor.' });
		}
	}
};