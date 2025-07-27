import { db } from '$lib/server/database';
import { fail, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms';
import { startOfDay, endOfDay } from 'date-fns';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';


// Un esquema simple solo para la acción de actualización
const updateStatusSchema = z.object({
	appointment_id: z.string(),
	status_id: z.string()
});

// Definimos un tipo para la estructura de datos que devolverá nuestra consulta
export type DailyAppointment = {
	id: bigint;
	date: Date;
	observation: string | null;
	patientName: string;
	patientLastName: string;
	patientCi: number | null;
	doctorName: string;
	doctorLastName: string;
	statusId: bigint;
	status: string;
};

export const load: PageServerLoad = async () => {
	const today_start = startOfDay(new Date());
	const today_end = endOfDay(new Date());

	// 1. Cargar las citas del día actual
	const appointments = await db
		.selectFrom('date')
		.innerJoin('patient', 'patient.id', 'date.patient_id')
		.innerJoin('doctor', 'doctor.id', 'date.doctor_id')
		.innerJoin('date_status', 'date_status.id', 'date.status_id')
		.select([
			'date.id',
			'date.date',
			'date.observation',
			'patient.name as patientName',
			'patient.lastName as patientLastName',
			'patient.ci as patientCi',
			'doctor.name as doctorName',
			'doctor.lastName as doctorLastName',
			'date_status.id as statusId',
			'date_status.status as status'
		])
		.where('date.date', '>=', today_start)
		.where('date.date', '<=', today_end)
		.orderBy('date.date', 'asc')
		.execute();

	// 2. Cargar todos los estados posibles para el menú desplegable
	const allStatuses = await db.selectFrom('date_status').selectAll().execute();
	
	const form = await superValidate(zod(updateStatusSchema));

	return {
		appointments: appointments as DailyAppointment[],
		allStatuses,
		form
	};
};

export const actions: Actions = {
	updateStatus: async ({ request }) => {
		const form = await superValidate(request, zod(updateStatusSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await db
				.updateTable('date')
				.set({
					status_id: BigInt(form.data.status_id)
				})
				.where('id', '=', BigInt(form.data.appointment_id))
				.execute();
		} catch (error) {
			console.error('Error al actualizar el estado de la cita:', error);
			return fail(500, { form, message: 'No se pudo actualizar el estado.' });
		}

		// Devolvemos un mensaje de éxito. `use:enhance` invalidará los datos y recargará la lista.
		return message(form, 'Estado actualizado con éxito');
	}
};