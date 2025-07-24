import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { appointmentSchema } from './schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Ya no necesitamos cargar 'statuses' aquí para el formulario de 'add'
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

		// Combinar fecha y hora en un solo objeto Date para la consulta
		const appointmentTimestamp = new Date(`${form.data.appointment_date}T${form.data.appointment_time}:00`);
		
		try {
			// --- LÓGICA DE VALIDACIÓN CENTRAL ---
			// Verificar si el horario está disponible ANTES de intentar insertar.
			const existingAppointment = await db.selectFrom('date')
				.select('id')
				.where('doctor_id', '=', BigInt(form.data.doctor_id))
				.where('date', '=', appointmentTimestamp)
				.executeTakeFirst();

			if (existingAppointment) {
				// Si la cita ya existe, devolvemos un error de conflicto (409)
				return fail(409, { form, message: 'Este horario ya no está disponible. Por favor, seleccione otro.' });
			}
			// --- FIN DE LA LÓGICA DE VALIDACIÓN ---

			// Obtener el ID del estado "Programada"
			const programmedStatus = await db.selectFrom('date_status')
				.select('id')
				.where('status', '=', 'Programada')
				.executeTakeFirstOrThrow();

			// Si está libre, insertar la nueva cita
			await db.insertInto('date').values({
				patient_id: BigInt(form.data.patient_id),
				doctor_id: BigInt(form.data.doctor_id),
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