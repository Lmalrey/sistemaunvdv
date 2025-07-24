// src/routes/private/informes/[id]/edit/+page.server.ts
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { medicalRecordSchema } from './schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const recordId = BigInt(params.id);

	// 1. Obtener los datos existentes del informe y su examen físico asociado
	const record = await db
		.selectFrom('medical_record')
		.innerJoin('physical_exam', 'physical_exam.id', 'medical_record.physical_exam_id')
		.selectAll('medical_record')
		.select([
			'physical_exam.weight',
			'physical_exam.height',
			'physical_exam.cephalic_perimeter',
			'physical_exam.heard_rate',
			'physical_exam.breathing_rate',
			'physical_exam.blood_pressure',
			'physical_exam.date'
		])
		.where('medical_record.id', '=', recordId)
		.executeTakeFirst();

	if (!record) {
		error(404, 'Informe médico no encontrado');
	}

	// 2. Obtener los diagnósticos asociados
	const diagnoses = await db
		.selectFrom('medical_record_diagnosis')
		.select('diagnosis_id')
		.where('medical_record_id', '=', recordId)
		.execute();
	
	const diagnosis_ids = diagnoses.map(d => d.diagnosis_id);

	// 3. Transformar los datos para que coincidan con el esquema del formulario
	// ¡Importante! Transformar el numrange de vuelta a formato de usuario
	const match = record.blood_pressure.match(/\[(\d+),(\d+)\]/);
	const userBloodPressure = match ? `${match[2]}/${match[1]}` : '';

	const initialData = {
		...record,
        patient_id: record.patient_id.toString(),
        doctor_id: record.doctor_id.toString(),
        tenant_id: record.tenant_id.toString(),
		blood_pressure: userBloodPressure,
		emmited_at: new Date(record.emmited_at).toISOString().split('T')[0],
		date: new Date(record.date).toISOString().split('T')[0],
		diagnosis_ids: diagnoses.map(d => d.diagnosis_id.toString())
	};

	// 4. Cargar datos para los selects
	const [patients, doctors, tenants, allDiagnoses] = await Promise.all([
		db.selectFrom('patient').select(['id', 'name', 'lastName']).orderBy('lastName').execute(),
		db.selectFrom('doctor').select(['id', 'name', 'lastName']).orderBy('lastName').execute(),
		db.selectFrom('tenant').select(['id', 'name']).orderBy('name').execute(),
		db.selectFrom('diagnosis').select(['id', 'name']).orderBy('name').execute()
	]);

	// 5. Inicializar el formulario con los datos existentes
	const form = await superValidate(initialData, zod(medicalRecordSchema));

	return { form, patients, doctors, tenants, diagnoses: allDiagnoses };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const recordId = BigInt(params.id);
		const form = await superValidate(request, zod(medicalRecordSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
            const [systolic, diastolic] = form.data.blood_pressure.split('/').map(Number);
            const formattedBloodPressure = `[${diastolic}, ${systolic}]`;

            const tenantId = BigInt(form.data.tenant_id);
            const doctorId = BigInt(form.data.doctor_id);
            const patientId = BigInt(form.data.patient_id);
            const diagnosisIds = form.data.diagnosis_ids.map(id => BigInt(id));
			
            await db.transaction().execute(async (trx) => {
				// Obtener el ID del examen físico asociado para poder actualizarlo
				const existingRecord = await trx.selectFrom('medical_record')
					.select('physical_exam_id')
					.where('id', '=', recordId)
					.executeTakeFirstOrThrow();
                    
                    // 1. Actualizar la tabla physical_exam
                    await trx
                        .updateTable('physical_exam')
                        .set({
                            weight: form.data.weight,
                            height: form.data.height,
                            cephalic_perimeter: form.data.cephalic_perimeter,
                            heard_rate: form.data.heard_rate,
                            breathing_rate: form.data.breathing_rate,
                            blood_pressure: formattedBloodPressure,
                            date: form.data.date
                        })
                        .where('id', '=', existingRecord.physical_exam_id)
                        .execute();

                        // 2. Actualizar la tabla medical_record
                        await trx
                            .updateTable('medical_record')
                            .set({
                                tenant_id: tenantId,
                                doctor_id: doctorId,
                                patient_id: patientId,
                                emmited_at: form.data.emmited_at,
                                description: form.data.description,
                                work_plan: form.data.work_plan
                            })
                            .where('id', '=', recordId)
                            .execute();
                    // 3. Actualizar la tabla de unión (eliminar antiguos e insertar nuevos)
                        await trx
                                .deleteFrom('medical_record_diagnosis')
                                .where('medical_record_id', '=', recordId)
                                .execute();
            
                            const diagnosesToInsert = diagnosisIds.map((diagnosisId) => ({
                                medical_record_id: recordId,
                                diagnosis_id: diagnosisId
                            }));

				if (diagnosesToInsert.length > 0) {
					await trx.insertInto('medical_record_diagnosis').values(diagnosesToInsert).execute();
				}
			});
		} catch (error) {
			console.error('Error al actualizar el informe médico:', error);
			return fail(500, { form, message: 'Ocurrió un error en el servidor. Inténtelo de nuevo.' });
		}

		// Redirigir a la página de visualización del informe
		redirect(303, `/private/informes`);
	}
};