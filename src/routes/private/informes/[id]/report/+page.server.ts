// src/routes/private/informes/[id]/report/+page.server.ts
import { db } from '$lib/server/database';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const recordId = BigInt(params.id);

	// La consulta principal se mantiene, ya que obtiene todos los datos necesarios
	const record = await db
		.selectFrom('medical_record')
		.innerJoin('patient', 'patient.id', 'medical_record.patient_id')
		.innerJoin('gender', 'gender.id', 'patient.gender_id')
		.innerJoin('personal_background', 'personal_background.id', 'patient.personal_background_id')
		.innerJoin('family_background', 'family_background.id', 'patient.family_background_id')
		.innerJoin('doctor', 'doctor.id', 'medical_record.doctor_id')
		.innerJoin('tenant', 'tenant.id', 'medical_record.tenant_id')
		.innerJoin('doctor_specialty', 'doctor_specialty.id', 'doctor.specialty_id')
		.innerJoin('physical_exam', 'physical_exam.id', 'medical_record.physical_exam_id')
		.select([
			'medical_record.id',
			'medical_record.emmited_at',
			'medical_record.description',
			'medical_record.work_plan',
			'patient.name as patient_name',
			'gender.gender as patient_gender',
			'patient.lastName as patient_lastName',
			'patient.ci as patient_ci',
			'patient.birthDate as patient_birthDate',
			'patient.email as patient_email',
			'patient.personal_background_id', 
			'patient.family_background_id',
			'personal_background.description as personal_background_description',
			'family_background.description as family_background_description',
			'doctor.name as doctor_name',
			'doctor.lastName as doctor_lastName',
			'doctor.matricula as doctor_mpps',
			'doctor.rif as doctor_rif',
			'doctor.email as doctor_email',
			'doctor.phone as doctor_phone',
			'doctor_specialty.name as doctor_specialty',
			'tenant.name as tenant_name',
			'tenant.address as tenant_address',
			'physical_exam.weight',
			'physical_exam.height'
		])
		.where('medical_record.id', '=', recordId)
		.executeTakeFirst();

	if (!record) {
		error(404, 'Informe médico no encontrado');
	}

	const personalQuestionsPromise = db
		.selectFrom('personal_background_question_junction as junction')
		.innerJoin('personal_background_question as question', 'question.id', 'junction.question_id')
		.select(['question.question', 'junction.answer'])
		.where('junction.background_id', '=', record.personal_background_id)
		.execute();

	// Consulta para antecedentes familiares
	const familyQuestionsPromise = db
		.selectFrom('family_background_question_junction as junction')
		.innerJoin('family_background_question as question', 'question.id', 'junction.question_id')
		.select(['question.question', 'junction.answer'])
		.where('junction.background_id', '=', record.family_background_id)
		.execute();
	
	// Ejecutamos las consultas de preguntas en paralelo
	const [personalQuestions, familyQuestions] = await Promise.all([personalQuestionsPromise, familyQuestionsPromise]);

	// Obtener los diagnósticos sigue siendo necesario
	const diagnoses = await db
		.selectFrom('medical_record_diagnosis')
		.innerJoin('diagnosis', 'diagnosis.id', 'medical_record_diagnosis.diagnosis_id')
		.select(['diagnosis.id', 'diagnosis.name'])
		.where('medical_record_id', '=', recordId)
		.orderBy('diagnosis.name')
		.execute();

	const calculateAge = (birthDate: Date) => {
		const ageDifMs = Date.now() - new Date(birthDate).getTime();
		const ageDate = new Date(ageDifMs);
		return Math.abs(ageDate.getUTCFullYear() - 1970);
	};

    // --- CAMBIO PRINCIPAL ---
    // Se elimina toda la data de ejemplo (mockup) y se retorna solo lo obtenido de la BD.
	return {
		record: {
			...record,
			patient_age: calculateAge(new Date(record.patient_birthDate)),
			diagnoses_text: diagnoses.map((d) => d.name).join('\n'),
			personal_questions: personalQuestions,
			family_questions: familyQuestions
		}
	};
};