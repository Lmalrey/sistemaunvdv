// src/routes/private/informes/add/+page.server.ts (CORREGIDO)
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { medicalRecordSchema } from './schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [patients, doctors, tenants, diagnoses] = await Promise.all([
		db.selectFrom('patient').select(['id', 'name', 'lastName']).orderBy('lastName').execute(),
		db.selectFrom('doctor').select(['id', 'name', 'lastName']).orderBy('lastName').execute(),
		db.selectFrom('tenant').select(['id', 'name']).orderBy('name').execute(),
		db.selectFrom('diagnosis').select(['id', 'name']).orderBy('name').execute()
	]);

	const form = await superValidate(zod(medicalRecordSchema));

	return { form, patients, doctors, tenants, diagnoses };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(medicalRecordSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// --- INICIO DE LA SOLUCIÓN ---
			// Transformar la presión arterial al formato numrange de PostgreSQL
			const [systolic, diastolic] = form.data.blood_pressure.split('/').map(Number);
			const formattedBloodPressure = `[${diastolic}, ${systolic}]`;
			// --- FIN DE LA SOLUCIÓN ---

			await db.transaction().execute(async (trx) => {
				const physicalExam = await trx
					.insertInto('physical_exam')
					.values({
						weight: form.data.weight,
						height: form.data.height,
						cephalic_perimeter: form.data.cephalic_perimeter,
						heard_rate: form.data.heard_rate,
						breathing_rate: form.data.breathing_rate,
						blood_pressure: formattedBloodPressure, // <-- USAR EL VALOR FORMATEADO
						date: form.data.date
					})
					.returning('id')
					.executeTakeFirstOrThrow();

				const medicalRecord = await trx
					.insertInto('medical_record')
					.values({
						tenant_id: form.data.tenant_id,
						doctor_id: form.data.doctor_id,
						patient_id: form.data.patient_id,
						physical_exam_id: physicalExam.id,
						emmited_at: form.data.emmited_at,
						description: form.data.description,
						work_plan: form.data.work_plan
					})
					.returning('id')
					.executeTakeFirstOrThrow();

				const diagnosesToInsert = form.data.diagnosis_ids.map((diagnosisId) => ({
					medical_record_id: medicalRecord.id,
					diagnosis_id: diagnosisId
				}));

				if (diagnosesToInsert.length > 0) {
					await trx.insertInto('medical_record_diagnosis').values(diagnosesToInsert).execute();
				}
			});
		} catch (error) {
			console.error('Error al crear el informe médico:', error);
			return fail(500, { form, message: 'Ocurrió un error en el servidor. Inténtelo de nuevo.' });
		}

		redirect(303, '/private/informes?success=true');
	}
};