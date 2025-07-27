import { db } from '$lib/server/database';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';


// Definimos un tipo para la estructura de datos que devolverá nuestra consulta
export type RecipeEntry = {
	id: bigint;
	recipeDate: string;
	patientName: string;
	patientLastName: string;
	patientCi: number | null;
	doctorName: string;
	doctorLastName: string;
	medicineCount: number;
};

export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page') ?? '1');
	const pageSize = 5;
	const searchTerm = url.searchParams.get('search') ?? '';

	// Consulta base para reutilizar en la obtención de datos y el conteo total
	let query = db
		.selectFrom('recipe')
		.innerJoin('patient', 'patient.id', 'recipe.patient_id')
		.innerJoin('doctor', 'doctor.id', 'recipe.doctor_id');

	if (searchTerm) {
		query = query.where((eb) =>
			eb.or([
				eb('patient.name', 'ilike', `%${searchTerm}%`),
				eb('patient.lastName', 'ilike', `%${searchTerm}%`),
				eb('doctor.name', 'ilike', `%${searchTerm}%`),
				eb('doctor.lastName', 'ilike', `%${searchTerm}%`),
				// Manejar búsqueda por CI si es un número válido
				!isNaN(Number(searchTerm)) ? eb('patient.ci', '=', Number(searchTerm)) : eb.lit(false)
			])
		);
	}

	// Consulta principal para obtener los datos paginados
	const recipes = await query
		.select([
			'recipe.id',
			'recipe.date as recipeDate',
			'patient.name as patientName',
			'patient.lastName as patientLastName',
			'patient.ci as patientCi',
			'doctor.name as doctorName',
			'doctor.lastName as doctorLastName',
			// Subconsulta para contar los medicamentos de cada receta
			(eb) =>
				eb
					.selectFrom('recipe_medicine')
					.select(eb.fn.count('recipe_id').as('count'))
					.whereRef('recipe_medicine.recipe_id', '=', 'recipe.id')
					.as('medicineCount')
		])
		.limit(pageSize)
		.offset((page - 1) * pageSize)
		.orderBy('recipe.date', 'desc')
		.execute()
        .then(res => res.map(r => ({ ...r, medicineCount: Number(r.medicineCount) }))); // Kysely devuelve count como string o bigint

	// Consulta para obtener el número total de registros para la paginación
	const { count } = await query
        .select(db.fn.countAll().as('count'))
        .executeTakeFirstOrThrow()
        .then(res => ({ count: Number(res.count) }));

	const pageCount = Math.ceil(count / pageSize);

	return {
		recipes: recipes as RecipeEntry[],
		currentPage: page,
		pageSize,
		pageCount,
		searchTerm
	};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) {
			return fail(400, { message: 'ID de receta no proporcionado' });
		}

		try {
            const recipeId = BigInt(id.toString());
			// Usar una transacción para asegurar la integridad de los datos
			await db.transaction().execute(async (trx) => {
				// 1. Obtener los IDs de las concentraciones de medicamentos asociados a la receta
                const concentrationsToDelete = await trx.selectFrom('recipe_medicine')
                    .select('medicine_concentration_id')
                    .where('recipe_id', '=', recipeId)
                    .execute();
                
                const concentrationIds = concentrationsToDelete.map(c => c.medicine_concentration_id);

                // 2. Eliminar las entradas de la tabla de unión 'recipe_medicine'
				await trx.deleteFrom('recipe_medicine').where('recipe_id', '=', recipeId).execute();

                // 3. Eliminar las concentraciones si existen
                if(concentrationIds.length > 0) {
                    await trx.deleteFrom('medicine_concentration').where('id', 'in', concentrationIds).execute();
                }

				// 4. Finalmente, eliminar la receta
				await trx.deleteFrom('recipe').where('id', '=', recipeId).execute();
			});
		} catch (error) {
            console.error("Error al eliminar la receta:", error);
			return fail(500, { message: 'No se pudo eliminar la receta.' });
		}

		// Si se quiere redirigir a la misma página para que se actualice la lista
		redirect(303, '/private/recipes');
	}
};