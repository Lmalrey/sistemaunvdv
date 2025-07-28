// src/routes/private/recipes/[id]/report/+page.server.ts
import { db } from '$lib/server/database';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const recipeId = BigInt(params.id);

	// 1. Obtener los datos principales del récipe, paciente, doctor y sede
	const recipeInfoPromise = db
		.selectFrom('recipe')
		.innerJoin('patient', 'patient.id', 'recipe.patient_id')
		.innerJoin('gender', 'gender.id', 'patient.gender_id')
		.innerJoin('doctor', 'doctor.id', 'recipe.doctor_id')
		.innerJoin('doctor_specialty', 'doctor_specialty.id', 'doctor.specialty_id')
		.innerJoin('tenant', 'tenant.id', 'recipe.tenant_id')
		.select([
			'recipe.id',
			'recipe.date',
			'patient.name as patient_name',
			'patient.lastName as patient_lastName',
			'patient.ci as patient_ci',
			'patient.birthDate as patient_birthDate',
			'gender.gender as patient_gender',
			'doctor.name as doctor_name',
			'doctor.lastName as doctor_lastName',
			'doctor.matricula as doctor_mpps',
			'doctor.rif as doctor_rif',
			'doctor_specialty.name as doctor_specialty',
			'tenant.name as tenant_name',
			'tenant.address as tenant_address',
			'doctor.phone as doctor_phone', // Asumimos que los teléfonos del encabezado son del doctor
			'doctor.email as doctor_email'
		])
		.where('recipe.id', '=', recipeId)
		.executeTakeFirst();

	// 2. Obtener la lista de medicamentos del récipe
	const medicinesPromise = db
		.selectFrom('recipe_medicine')
		.innerJoin('medicine', 'medicine.id', 'recipe_medicine.medicine_id')
		.innerJoin('medicine_concentration', 'medicine_concentration.id', 'recipe_medicine.medicine_concentration_id')
		.innerJoin('measurement_unit', 'measurement_unit.id', 'medicine_concentration.measurement_unit_id')
		// Opcional: unir la marca del medicamento si es relevante
		.leftJoin('medicine_brand', 'medicine_brand.id', 'medicine.brand_id')
		.where('recipe_medicine.recipe_id', '=', recipeId)
		.select([
			'medicine.name as medicine_name',
			'medicine_brand.name as brand_name', // Puede ser null si no hay marca
			'medicine_concentration.amount',
			'measurement_unit.unit', // Ej: MG, ML
			'recipe_medicine.indications'
		])
		.execute();

	const [recipeInfo, medicines] = await Promise.all([recipeInfoPromise, medicinesPromise]);

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