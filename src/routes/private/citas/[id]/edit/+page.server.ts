// src/routes/private/citas/[id]/edit/+page.server.ts
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { appointmentSchema } from '../../add/schema';
import { format } from 'date-fns';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const appointmentId = BigInt(params.id);

	// 1. Obtener la cita existente
	const appointment = await db
		.selectFrom('date')
		.selectAll()
		.where('id', '=', appointmentId)
		.executeTakeFirst();

	if (!appointment) {
		error(404, 'Cita no encontrada');
	}

	// 2. Formatear los datos para que coincidan con el esquema del formulario
	const initialData = {
		patient_id: appointment.patient_id.toString(),
		doctor_id: appointment.doctor_id.toString(),
		appointment_date: format(appointment.date, 'yyyy-MM-dd'),
		appointment_time: format(appointment.date, 'HH:mm'),
		observation: appointment.observation ?? ''
	};

	// 3. Cargar datos para los selects (pacientes y doctores)
	const [patients, doctors] = await Promise.all([
		db.selectFrom('patient').select(['id', 'name', 'lastName', 'ci']).orderBy('lastName').execute(),
		db.selectFrom('doctor').select(['id', 'name', 'lastName']).orderBy('lastName').execute()
	]);

	const form = await superValidate(initialData, zod(appointmentSchema));

	return { form, patients, doctors, appointmentId: appointment.id.toString() };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const appointmentId = BigInt(params.id);
		const form = await superValidate(request, zod(appointmentSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const newAppointmentTimestamp = new Date(
			`${form.data.appointment_date}T${form.data.appointment_time}:00`
		);

		try {
			// Verificación de disponibilidad (crucial para reprogramar)
			const existingAppointment = await db
				.selectFrom('date')
				.select('id')
				.where('doctor_id', '=', BigInt(form.data.doctor_id))
				.where('date', '=', newAppointmentTimestamp)
				.where('id', '!=', appointmentId) // <-- Excluir la cita actual de la verificación
				.executeTakeFirst();

			if (existingAppointment) {
				return fail(409, { form, message: 'Este horario ya está ocupado. Por favor, elija otro.' });
			}

			// Actualizar la cita
			await db
				.updateTable('date')
				.set({
					patient_id: BigInt(form.data.patient_id),
					doctor_id: BigInt(form.data.doctor_id),
					date: newAppointmentTimestamp,
					observation: form.data.observation
					// No actualizamos el status_id al reprogramar, se mantiene el que tenía
				})
				.where('id', '=', appointmentId)
				.execute();

		} catch (error) {
			console.error('Error al reprogramar la cita:', error);
			return fail(500, { form, message: 'Error en el servidor al guardar los cambios.' });
		}

		redirect(303, `/private/citas?reprogrammed=${appointmentId}`);
	}
};