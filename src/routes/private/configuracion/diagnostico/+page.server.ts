import { db } from "$lib/server/database";
import { fail } from "@sveltejs/kit";
import type { ServerLoad, Actions } from "@sveltejs/kit";

export const load: ServerLoad = async()=>{
    const diagnosticos = await db
    .selectFrom('diagnosis')
    .selectAll()
    .execute();

    return {diagnosticos};
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
				.deleteFrom('diagnosis')
				.where('diagnosis.id', '=', selectedItemId)
				.executeTakeFirst();

			// `numDeletedRows` es un BigInt, por eso se compara con 0n
			if (deleteResult.numDeletedRows === 0n) {
				return fail(404, { message: `Diagnóstico con ID ${selectedItemId} no encontrado.` });
			}

			// Si todo sale bien, SvelteKit recargará los datos de `load` automáticamente.
			return { success: true, message: `Diagnóstico ${selectedItemId} eliminado.` };

		} catch (error) {
			console.error("Error al eliminar:", error);
			return fail(500, { message: 'Error interno del servidor.' });
		}
	}
};

