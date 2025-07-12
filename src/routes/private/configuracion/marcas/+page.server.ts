import { db } from "$lib/server/database";
import { fail } from "@sveltejs/kit";
import type { ServerLoad, Actions } from "@sveltejs/kit";

export const load: ServerLoad = async({url})=>{

    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = 3; // O el número de items por página que prefieras
    const searchTerm = url.searchParams.get('search');

    let queryBase = db.selectFrom('medicine_brand');
    if (searchTerm) {
        queryBase = queryBase.where('name', 'ilike', `%${searchTerm}%`);
    }

    const totalResult = await queryBase
        .select(db.fn.count('id').as('total'))
        .executeTakeFirst();
    
    const totalItems = Number(totalResult?.total ?? 0);
    const pageCount = Math.ceil(totalItems / pageSize);

    // 4. SEGUNDA CONSULTA: OBTENER LOS DATOS DE LA PÁGINA ACTUAL
    const marcas = await queryBase
        .selectAll()
        .orderBy('id', 'asc')
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .execute();

    // 5. DEVOLVER TODOS LOS DATOS NECESARIOS PARA LA TABLA
    return {
        marcas,
        pageCount,
        currentPage: page,
        pageSize,
        totalItems,
        searchTerm
    };
}
export const actions: Actions = {
    // Nombramos la acción 'delete'. Puedes tener otras como 'create', 'update', etc.
    delete: async ({ request }) => {
        const data = await request.formData();
        const id = data.get('id');

        if (!id) {
            return fail(400, { message: 'ID no proporcionado' });
        }

        const selectedItemId = Number(id);

        try {
            // TU QUERY DE KYSENY, JUSTO DONDE DEBE ESTAR
            const deleteResult = await db
                .deleteFrom('medicine_brand')
                .where('medicine_brand.id', '=', selectedItemId)
                .executeTakeFirst();

            // `numDeletedRows` es un BigInt, por eso se compara con 0n
            if (deleteResult.numDeletedRows === 0n) {
                return fail(404, { message: `Marca con ID ${selectedItemId} no encontrado.` });
            }

            // Si todo sale bien, SvelteKit recargará los datos de `load` automáticamente.
            return { success: true, message: `Marca ${selectedItemId} eliminado.` };

        } catch (error) {
            console.error("Error al eliminar:", error);
            return fail(500, { message: 'Error interno del servidor.' });
        }
    }
};

