// src/routes/private/informes/[id]/show/+page.server.ts
import { db } from '$lib/server/database';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const recordId = BigInt(params.id);

	// 1. Obtener todos los datos del informe en una sola consulta, uniendo las tablas necesarias
	const record = await db
		.selectFrom('medical_record')
		.innerJoin('patient', 'patient.id', 'medical_record.patient_id')
		.innerJoin('doctor', 'doctor.id', 'medical_record.doctor_id')
		.innerJoin('tenant', 'tenant.id', 'medical_record.tenant_id')
		.innerJoin('physical_exam', 'physical_exam.id', 'medical_record.physical_exam_id')
		.select([
			// Campos del informe
			'medical_record.id',
			'medical_record.emmited_at',
			'medical_record.description',
			'medical_record.work_plan',
			// Campos del paciente
			'patient.name as patient_name',
			'patient.lastName as patient_lastName',
			'patient.ci as patient_ci',
			'patient.birthDate as patient_birthDate',
			// Campos del doctor
			'doctor.name as doctor_name',
			'doctor.lastName as doctor_lastName',
			// Campos de la sede
			'tenant.name as tenant_name',
			// Campos del examen físico
			'physical_exam.weight',
			'physical_exam.height',
			'physical_exam.cephalic_perimeter',
			'physical_exam.heard_rate',
			'physical_exam.breathing_rate',
			'physical_exam.blood_pressure',
			'physical_exam.date as physical_exam_date'
		])
		.where('medical_record.id', '=', recordId)
		.executeTakeFirst();

	if (!record) {
		error(404, 'Informe médico no encontrado');
	}

	// 2. Obtener los diagnósticos asociados con sus nombres
	const diagnoses = await db
		.selectFrom('medical_record_diagnosis')
		.innerJoin('diagnosis', 'diagnosis.id', 'medical_record_diagnosis.diagnosis_id')
		.select(['diagnosis.id', 'diagnosis.name'])
		.where('medical_record_id', '=', recordId)
		.orderBy('diagnosis.name')
		.execute();

	// 3. Formatear la presión arterial para mostrarla
	const match = record.blood_pressure.match(/\[(\d+),(\d+)\]/);
	const formattedBloodPressure = match ? `${match[2]}/${match[1]}` : 'N/A';

	// Función para calcular la edad
	const calculateAge = (birthDate: Date) => {
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
	};

	return {
		record: {
			...record,
			blood_pressure: formattedBloodPressure,
			patient_age: calculateAge(new Date(record.patient_birthDate)),
			diagnoses
		}
	};
};