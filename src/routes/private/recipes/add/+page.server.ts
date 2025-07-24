// src/routes/private/recipes/add/+page.server.ts
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { recipeSchema } from './schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Cargar datos para los selects en paralelo
	const [patients, doctors, tenants, medicalRecords, medicines, measurementUnits] =
		await Promise.all([
			db.selectFrom('patient').select(['id', 'name', 'lastName']).orderBy('lastName').execute(),
			db.selectFrom('doctor').select(['id', 'name', 'lastName']).orderBy('lastName').execute(),
			db.selectFrom('tenant').select(['id', 'name']).orderBy('name').execute(),
			db.selectFrom('medical_record').select(['id', 'description', 'patient_id']).orderBy('emmited_at', 'desc').execute(),
			db.selectFrom('medicine').select(['id', 'name']).orderBy('name').execute(),
			db.selectFrom('measurement_unit').select(['id', 'name', 'unit']).orderBy('name').execute()
		]);

	// Inicializar el formulario. Podemos empezar con un medicamento por defecto.
	const form = await superValidate(zod(recipeSchema));

	return { form, patients, doctors, tenants, medicalRecords, medicines, measurementUnits };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(recipeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// Usar una transacción para todas las inserciones
			await db.transaction().execute(async (trx) => {
				// 1. Guardar 'recipe' y obtener el ID
				const recipe = await trx
					.insertInto('recipe')
					.values({
						patient_id: BigInt(form.data.patient_id),
						doctor_id: BigInt(form.data.doctor_id),
						tenant_id: BigInt(form.data.tenant_id),
						medical_record_id: BigInt(form.data.medical_record_id),
						date: form.data.date
					})
					.returning('id')
					.executeTakeFirstOrThrow();

				const recipeId = recipe.id;

				// 2. Iterar sobre cada medicamento y guardarlo
				for (const med of form.data.medicines) {
					// 3. Guardar 'medicine_concentration' y obtener el ID
					const concentration = await trx
						.insertInto('medicine_concentration')
						.values({
							amount: med.amount,
							measurement_unit_id: BigInt(med.measurement_unit_id)
						})
						.returning('id')
						.executeTakeFirstOrThrow();

					const concentrationId = concentration.id;

					// 4. Guardar 'recipe_medicine' con todos los IDs
					await trx
						.insertInto('recipe_medicine')
						.values({
							recipe_id: recipeId,
							medicine_id: BigInt(med.medicine_id),
							medicine_concentration_id: concentrationId,
							indications: med.indications
						})
						.execute();
				}
			});
		} catch (error) {
			console.error('Error al crear la receta:', error);
			return fail(500, { form, message: 'Error en el servidor al guardar la receta.' });
		}

		redirect(303, '/private/recipes');
	}
};