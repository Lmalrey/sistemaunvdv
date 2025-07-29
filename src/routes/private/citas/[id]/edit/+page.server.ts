// src/routes/private/citas/[id]/edit/+page.server.ts
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { appointmentSchema } from '../../add/schema';
import { format, startOfDay, endOfDay } from 'date-fns';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const appointmentId = BigInt(params.id);
	const appointment = await db.selectFrom('date').selectAll().where('id', '=', appointmentId).executeTakeFirst();

	if (!appointment) {
		error(404, 'Cita no encontrada');
	}

	const initialData = {
		patient_id: appointment.patient_id.toString(),
		doctor_id: appointment.doctor_id.toString(),
		appointment_date: format(appointment.date, 'yyyy-MM-dd'),
		appointment_time: format(appointment.date, 'HH:mm'),
		observation: appointment.observation ?? ''
	};

	const [patients, doctors] = await Promise.all([
		db.selectFrom('patient').select(['id', 'name', 'lastName', 'ci']).orderBy('lastName').execute(),
		db.selectFrom('doctor').select(['id', 'name', 'lastName']).orderBy('lastName').execute()
	]);

	const form = await superValidate(initialData, zod(appointmentSchema));

	return { form, patients, doctors }; // No es necesario pasar appointmentId, ya está en params
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const appointmentIdToEdit = BigInt(params.id);
		const form = await superValidate(request, zod(appointmentSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const newAppointmentTimestamp = new Date(`${form.data.appointment_date}T${form.data.appointment_time}:00`);
		const patientId = BigInt(form.data.patient_id);
		const doctorId = BigInt(form.data.doctor_id);

		try {
			// --- VALIDACIONES CENTRALIZADAS PARA EDICIÓN ---
			const dayStart = startOfDay(newAppointmentTimestamp);
			const dayEnd = endOfDay(newAppointmentTimestamp);

			const [doctorSlotTaken, patientSlotTaken, patientAlreadyBookedToday] = await Promise.all([
				// 1. Doctor ocupado (excluyendo la cita actual)
				db.selectFrom('date').select('id')
					.where('doctor_id', '=', doctorId)
					.where('date', '=', newAppointmentTimestamp)
					.where('id', '!=', appointmentIdToEdit)
					.executeTakeFirst(),
				// 2. Paciente ocupado a esa hora (excluyendo la cita actual)
				db.selectFrom('date').select('id')
					.where('patient_id', '=', patientId)
					.where('date', '=', newAppointmentTimestamp)
					.where('id', '!=', appointmentIdToEdit)
					.executeTakeFirst(),
				// 3. Paciente ya tiene OTRA cita con este doctor este día (excluyendo la cita actual)
				db.selectFrom('date').select('id')
					.where('patient_id', '=', patientId)
					.where('doctor_id', '=', doctorId)
					.where('date', '>=', dayStart)
					.where('date', '<=', dayEnd)
					.where('id', '!=', appointmentIdToEdit)
					.executeTakeFirst()
			]);
			
			if (doctorSlotTaken) return fail(409, { form, message: 'Este horario ya está ocupado. Por favor, elija otro.' });
			if (patientSlotTaken) return fail(409, { form, message: 'El paciente ya tiene otra cita programada a esta misma hora.' });
			if (patientAlreadyBookedToday) return fail(409, { form, message: 'El paciente ya tiene otra cita programada con este doctor para este día.' });
			
			// --- FIN DE VALIDACIONES ---

			await db.updateTable('date').set({
				// paciente y doctor no se pueden cambiar en la UI, pero los incluimos por si se cambia la lógica en el futuro
				patient_id: patientId,
				doctor_id: doctorId,
				date: newAppointmentTimestamp,
				observation: form.data.observation
			})
			.where('id', '=', appointmentIdToEdit)
			.execute();

		} catch (error) {
			console.error('Error al reprogramar la cita:', error);
			return fail(500, { form, message: 'Error en el servidor al guardar los cambios.' });
		}

		redirect(303, `/private/citas?reprogrammed=true`);
	}
};