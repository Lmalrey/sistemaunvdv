// src/routes/private/recipes/[id]/edit/+page.server.ts
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { recipeSchema } from './schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const recipeId = BigInt(params.id);

	// 1. Obtener la receta principal
	const recipe = await db.selectFrom('recipe').selectAll().where('id', '=', recipeId).executeTakeFirst();

	if (!recipe) {
		error(404, 'Receta no encontrada');
	}

	// 2. Obtener los medicamentos y sus concentraciones asociadas
	const medicinesData = await db
		.selectFrom('recipe_medicine')
		.innerJoin('medicine_concentration', 'medicine_concentration.id', 'recipe_medicine.medicine_concentration_id')
		.where('recipe_medicine.recipe_id', '=', recipeId)
		.select([
			'recipe_medicine.medicine_id',
			'recipe_medicine.indications',
			'medicine_concentration.amount',
			'medicine_concentration.measurement_unit_id'
		])
		.execute();

	// 3. Transformar los datos para que coincidan con el esquema del formulario (y convertir BigInt a string)
	const initialData = {
		patient_id: recipe.patient_id.toString(),
		doctor_id: recipe.doctor_id.toString(),
		tenant_id: recipe.tenant_id.toString(),
		medical_record_id: recipe.medical_record_id.toString(),
		date: new Date(recipe.date).toISOString().split('T')[0], // Formato YYYY-MM-DD
		medicines: medicinesData.map((med) => ({
			medicine_id: med.medicine_id.toString(),
			amount: med.amount,
			measurement_unit_id: med.measurement_unit_id.toString(),
			indications: med.indications
		}))
	};

	// 4. Cargar datos para los selects
	const [patients, doctors, tenants, medicalRecords, medicines, measurementUnits] =
		await Promise.all([
			db.selectFrom('patient').select(['id', 'name', 'lastName']).orderBy('lastName').execute(),
			db.selectFrom('doctor').select(['id', 'name', 'lastName']).orderBy('lastName').execute(),
			db.selectFrom('tenant').select(['id', 'name']).orderBy('name').execute(),
			// Cargamos todos los informes para el filtrado reactivo en el cliente
			db.selectFrom('medical_record').select(['id', 'description', 'patient_id']).orderBy('emmited_at', 'desc').execute(),
			db.selectFrom('medicine').select(['id', 'name']).orderBy('name').execute(),
			db.selectFrom('measurement_unit').select(['id', 'name', 'unit']).orderBy('name').execute()
		]);

	const form = await superValidate(initialData, zod(recipeSchema));

	return { form, patients, doctors, tenants, medicalRecords, medicines, measurementUnits };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const recipeId = BigInt(params.id);
		const form = await superValidate(request, zod(recipeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await db.transaction().execute(async (trx) => {
				// 1. Actualizar la tabla principal 'recipe'
				await trx
					.updateTable('recipe')
					.set({
						patient_id: BigInt(form.data.patient_id),
						doctor_id: BigInt(form.data.doctor_id),
						tenant_id: BigInt(form.data.tenant_id),
						medical_record_id: BigInt(form.data.medical_record_id),
						date: form.data.date
					})
					.where('id', '=', recipeId)
					.execute();

				// 2. Estrategia "Borrar y Re-insertar" para los medicamentos
				// Primero, obtener los IDs de las concentraciones viejas para borrarlas
				const oldConcentrations = await trx
					.selectFrom('recipe_medicine')
					.select('medicine_concentration_id')
					.where('recipe_id', '=', recipeId)
					.execute();
				
				const oldConcentrationIds = oldConcentrations.map(c => c.medicine_concentration_id);

				// Borrar las entradas de la tabla de unión
				await trx.deleteFrom('recipe_medicine').where('recipe_id', '=', recipeId).execute();
				
				// Borrar las concentraciones viejas
				if (oldConcentrationIds.length > 0) {
					await trx.deleteFrom('medicine_concentration').where('id', 'in', oldConcentrationIds).execute();
				}

				// 3. Insertar los nuevos medicamentos (lógica idéntica a la de 'add')
				for (const med of form.data.medicines) {
					const concentration = await trx
						.insertInto('medicine_concentration')
						.values({
							amount: med.amount,
							measurement_unit_id: BigInt(med.measurement_unit_id)
						})
						.returning('id')
						.executeTakeFirstOrThrow();

					await trx
						.insertInto('recipe_medicine')
						.values({
							recipe_id: recipeId,
							medicine_id: BigInt(med.medicine_id),
							medicine_concentration_id: concentration.id,
							indications: med.indications
						})
						.execute();
				}
			});
		} catch (error) {
			console.error('Error al actualizar la receta:', error);
			return fail(500, { form, message: 'Error en el servidor al actualizar la receta.' });
		}

		redirect(303, `/private/recipes`);
	}
};