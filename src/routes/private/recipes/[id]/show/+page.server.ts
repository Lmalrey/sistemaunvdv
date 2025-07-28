// src/routes/private/recipes/[id]/show/+page.server.ts
import { db } from '$lib/server/database';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const recipeId = BigInt(params.id);

	// Usamos Promise.all para ejecutar las consultas de forma concurrente
	const [recipeInfo, medicines] = await Promise.all([
		// Consulta 1: Obtener los datos principales del récipe
		db.selectFrom('recipe')
			.innerJoin('patient', 'patient.id', 'recipe.patient_id')
			.innerJoin('doctor', 'doctor.id', 'recipe.doctor_id')
			.innerJoin('tenant', 'tenant.id', 'recipe.tenant_id')
			.select([
				'recipe.id',
				'recipe.date',
				'patient.name as patient_name',
				'patient.lastName as patient_lastName',
				'patient.ci as patient_ci',
				'patient.birthDate as patient_birthDate',
				'doctor.name as doctor_name',
				'doctor.lastName as doctor_lastName',
				'tenant.name as tenant_name'
			])
			.where('recipe.id', '=', recipeId)
			.executeTakeFirst(),

		// Consulta 2: Obtener la lista de medicamentos del récipe con todos sus detalles
		db.selectFrom('recipe_medicine')
			.innerJoin('medicine', 'medicine.id', 'recipe_medicine.medicine_id')
			.innerJoin('medicine_concentration', 'medicine_concentration.id', 'recipe_medicine.medicine_concentration_id')
			.innerJoin('measurement_unit', 'measurement_unit.id', 'medicine_concentration.measurement_unit_id')
			.leftJoin('medicine_brand', 'medicine_brand.id', 'medicine.brand_id')
			.where('recipe_medicine.recipe_id', '=', recipeId)
			.select([
				'medicine.name as medicine_name',
				'medicine_brand.name as brand_name',
				'medicine_concentration.amount',
				'measurement_unit.unit as measurement_unit', // ej: MG, ML
				'measurement_unit.name as measurement_unit_name', // ej: Miligramos
				'recipe_medicine.indications'
			])
			.execute()
	]);

	if (!recipeInfo) {
		error(404, 'Receta no encontrada');
	}

	const calculateAge = (birthDate: Date) => {
		const ageDifMs = Date.now() - new Date(birthDate).getTime();
		const ageDate = new Date(ageDifMs);
		return Math.abs(ageDate.getUTCFullYear() - 1970);
	};

	return {
		recipe: recipeInfo,
		medicines,
		patient_age: calculateAge(new Date(recipeInfo.patient_birthDate))
	};
};