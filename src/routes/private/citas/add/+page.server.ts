import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { appointmentSchema } from './schema';
import type { Actions, PageServerLoad } from './$types';
import { startOfDay, endOfDay } from 'date-fns'; // Importar date-fns

export const load: PageServerLoad = async () => {
	const [patients, doctors] = await Promise.all([
		db.selectFrom('patient').select(['id', 'name', 'lastName', 'ci']).orderBy('lastName').execute(),
		db.selectFrom('doctor').select(['id', 'name', 'lastName']).orderBy('lastName').execute()
	]);

	const form = await superValidate(zod(appointmentSchema));

	return { form, patients, doctors };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(appointmentSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const appointmentTimestamp = new Date(`${form.data.appointment_date}T${form.data.appointment_time}:00`);
		const patientId = BigInt(form.data.patient_id);
		const doctorId = BigInt(form.data.doctor_id);
		
		try {
			// --- VALIDACIONES CENTRALIZADAS ---
			const [doctorSlotTaken, patientSlotTaken, patientAlreadyBookedToday] = await Promise.all([
				// 1. Verificar si el horario del doctor está libre
				db.selectFrom('date')
					.select('id')
					.where('doctor_id', '=', doctorId)
					.where('date', '=', appointmentTimestamp)
					.executeTakeFirst(),
				// 2. Verificar si el paciente está libre a esa hora
				db.selectFrom('date')
					.select('id')
					.where('patient_id', '=', patientId)
					.where('date', '=', appointmentTimestamp)
					.executeTakeFirst(),
				
				db.selectFrom('date')
					.select('id')
					.where('patient_id', '=', patientId)
					.where('doctor_id', '=', doctorId)
					.where('date', '>=', startOfDay(appointmentTimestamp))
					.where('date', '<=', endOfDay(appointmentTimestamp))
					.executeTakeFirst()
			]);
			
			if (doctorSlotTaken) {
				return fail(409, { form, message: 'Este horario ya no está disponible con el doctor seleccionado.' });
			}

			if (patientSlotTaken) {
				return fail(409, { form, message: 'El paciente ya tiene otra cita programada a esta misma hora.' });
			}

			if (patientAlreadyBookedToday) {
				return fail(409, { form, message: 'El paciente ya tiene una cita programada con este doctor para este día. No se puede agendar otra.' });
			}
			
			// La validación de una cita por doctor por día se elimina porque la nueva lógica es más estricta y la cubre.
			// Si un paciente ya tiene una cita a las 9:00, el horario de las 9:00 no aparecerá disponible, cumpliendo la regla.

			// --- FIN DE VALIDACIONES ---

			const programmedStatus = await db.selectFrom('date_status').select('id').where('status', '=', 'Programada').executeTakeFirstOrThrow();

			await db.insertInto('date').values({
				patient_id: patientId,
				doctor_id: doctorId,
				status_id: programmedStatus.id,
				date: appointmentTimestamp,
				observation: form.data.observation
			}).execute();

		} catch (error) {
			console.error('Error al registrar la cita:', error);
			return fail(500, { form, message: 'Error en el servidor al guardar la cita.' });
		}

		redirect(303, '/private/citas?success=true');
	}
};