import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { patientFormSchema } from '../../add/schema'; // Asegúrate que esta ruta sea correcta
import { db } from '$lib/server/database';
import type { Actions, ServerLoad } from '@sveltejs/kit';

// Función helper para formatear fechas a YYYY-MM-DD usando UTC para evitar problemas de zona horaria.
function toYYYYMMDD_UTC(date: Date | null | undefined): string {
	if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
		return '';
	}
	const yyyy = date.getUTCFullYear();
	const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
	const dd = String(date.getUTCDate()).padStart(2, '0');
	return `${yyyy}-${mm}-${dd}`;
}

export const load: ServerLoad = async ({ params }) => {
	const patientId = BigInt(params.id || 0);
	if (!patientId) throw error(404, 'Paciente no encontrado');
	
	const patient = await db.selectFrom('patient').selectAll().where('id', '=', patientId).executeTakeFirst();
	if (!patient) throw error(404, 'Paciente no encontrado');

	// Cargar todos los datos relacionados...
	const personalBg = await db.selectFrom('personal_background').selectAll().where('id', '=', patient.personal_background_id).executeTakeFirstOrThrow();
	const familyBg = await db.selectFrom('family_background').selectAll().where('id', '=', patient.family_background_id).executeTakeFirstOrThrow();
	const personalAnswers = await db.selectFrom('personal_background_question_junction').selectAll().where('background_id', '=', personalBg.id).execute();
	const familyAnswers = await db.selectFrom('family_background_question_junction').selectAll().where('background_id', '=', familyBg.id).execute();
	const gendersData = await db.selectFrom('gender').selectAll().execute();
	const provincesData = await db.selectFrom('province').selectAll().execute();
	const statesData = await db.selectFrom('state').selectAll().execute();
	const allPersonalQuestions = await db.selectFrom('personal_background_question').selectAll().execute();
	const allFamilyQuestions = await db.selectFrom('family_background_question').selectAll().execute();

	// --- PASO 1: PREPARAR DATOS PARA LA VALIDACIÓN (con los tipos correctos) ---
	const dataForValidation = {
		// Mapeamos explícitamente CADA campo que el schema espera.
		// El error anterior ocurría porque `...patient` incluía campos extra
		// (como id, created_at, etc.) que no están en el schema, causando
		// que la validación de superValidate fallara y devolviera un formulario vacío.
		name: patient.name,
		lastName: patient.lastName,
		ci: Number(patient.ci),
		birthDate: patient.birthDate, // Se mantiene como objeto Date.
		gender_id: Number(patient.gender_id),
		phone: patient.phone,
		email: patient.email,
		state_id: Number(patient.state_id),
		province_id: Number(patient.province_id),
		city: patient.city,
		parent_fullname: patient.parent_fullname,
		parent_ci: Number(patient.parent_ci),
		personal_background: {
			description: personalBg.description,
			answers: allPersonalQuestions.map(q => {
				const savedAnswer = personalAnswers.find(ans => ans.question_id === q.id);
				return { question_id: Number(q.id), question_text: q.question, answer: !!savedAnswer?.answer };
			})
		},
		family_background: {
			description: familyBg.description,
			answers: allFamilyQuestions.map(q => {
				const savedAnswer = familyAnswers.find(ans => ans.question_id === q.id);
				return { question_id: Number(q.id), question_text: q.question, answer: !!savedAnswer?.answer };
			})
		}
	};

	// --- PASO 2: VALIDAR PRIMERO ---
	// Esta llamada ahora no dará error de TypeScript
	const form = await superValidate(dataForValidation, zod(patientFormSchema));

	// DEBUG: Si la validación falla, imprime los errores en la consola del servidor.
	if (!form.valid) {
		console.log('ERRORES DE VALIDACIÓN INICIAL:', form.errors);
	} else {
		// --- PASO 3: FORMATEAR PARA EL CLIENTE ---
		// Si la validación fue exitosa, ahora formateamos la fecha a un string YYYY-MM-DD.
		// Esto es más robusto contra problemas de zona horaria que enviar el objeto Date.
		// El input type="date" en el cliente recibirá el string que espera.
		// Le mentimos a TypeScript aquí a propósito porque el tipo del schema es Date,
		// pero para el cliente enviaremos un string. Superforms lo manejará.
		// @ts-ignore
		form.data.birthDate = toYYYYMMDD_UTC(form.data.birthDate);
	}

	// Convertimos los IDs de BigInt a Number para que los <option> del cliente
	// tengan el tipo correcto (number) y coincidan con el valor del formulario.
	const genders = gendersData.map((g) => ({ ...g, id: Number(g.id) }));
	const provinces = provincesData.map((p) => ({ ...p, id: Number(p.id) }));
	const states = statesData.map((s) => ({ ...s, id: Number(s.id) }));

	return { form, genders, provinces, states };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const patientId = BigInt(params.id || 0);
		if (!patientId) throw error(404, 'Paciente no encontrado');

		const form = await superValidate(request, zod(patientFormSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await db.transaction().execute(async (trx) => {
                const patientData = await trx.selectFrom('patient')
                    .select(['personal_background_id', 'family_background_id'])
                    .where('id', '=', patientId)
                    .executeTakeFirstOrThrow();

				// 1. Actualizar descripciones de antecedentes
				await trx.updateTable('personal_background').set({ description: form.data.personal_background.description }).where('id', '=', patientData.personal_background_id).execute();
				await trx.updateTable('family_background').set({ description: form.data.family_background.description }).where('id', '=', patientData.family_background_id).execute();

				// 2. Actualizar respuestas de antecedentes (borrar e insertar de nuevo)
				// Personales
				await trx.deleteFrom('personal_background_question_junction').where('background_id', '=', patientData.personal_background_id).execute();
				const personalAnswersData = form.data.personal_background.answers.map(ans => ({
					background_id: patientData.personal_background_id,
					question_id: BigInt(ans.question_id),
					answer: ans.answer
				}));
				if (personalAnswersData.length > 0) {
					await trx.insertInto('personal_background_question_junction').values(personalAnswersData).execute();
				}

				// Familiares
				await trx.deleteFrom('family_background_question_junction').where('background_id', '=', patientData.family_background_id).execute();
				const familyAnswersData = form.data.family_background.answers.map(ans => ({
					background_id: patientData.family_background_id,
					question_id: BigInt(ans.question_id),
					answer: ans.answer
				}));
				if (familyAnswersData.length > 0) {
					await trx.insertInto('family_background_question_junction').values(familyAnswersData).execute();
				}

				// Corregimos la fecha para evitar problemas de zona horaria.
				// Zod la convierte a un objeto Date en UTC (medianoche). Al pasarlo a la DB,
				// puede interpretarse como el día anterior en zonas horarias locales.
				// Creamos una nueva fecha usando los componentes UTC para que se interprete correctamente en la zona local.
				const birthDate = form.data.birthDate;
				const correctedBirthDate = new Date(birthDate.getUTCFullYear(), birthDate.getUTCMonth(), birthDate.getUTCDate());

				// 3. Actualizar la tabla de pacientes
				await trx.updateTable('patient').set({
                    ci: BigInt(form.data.ci),
                    name: form.data.name,
                    lastName: form.data.lastName,
                    birthDate: correctedBirthDate,
                    phone: form.data.phone,
                    email: form.data.email,
                    // Convertir de nuevo a BigInt para la base de datos
                    gender_id: BigInt(form.data.gender_id),
                    province_id: BigInt(form.data.province_id),
                    state_id: BigInt(form.data.state_id),
                    city: form.data.city,
                    parent_fullname: form.data.parent_fullname,
                    parent_ci: BigInt(form.data.parent_ci)
                }).where('id', '=', patientId).execute();
			});
		} catch (err) {
			console.error('Error al actualizar el paciente:', err);
			return fail(500, { form, message: 'Hubo un error en el servidor al actualizar.' });
		}

		// Redirigir a la lista de pacientes
		throw redirect(303, `/private/pacientes`);
	}
};