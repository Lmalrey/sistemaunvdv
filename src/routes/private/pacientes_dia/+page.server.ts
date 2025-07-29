// src/routes/private/pacientes_dia/+page.server.ts
import { db } from '$lib/server/database';
import { fail, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms';
import { startOfDay, endOfDay } from 'date-fns';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

const updateStatusSchema = z.object({
	appointment_id: z.string(),
	status_id: z.string()
});

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

// --- CAMBIO PRINCIPAL: ACEPTAR 'url' PARA LOS FILTROS ---
export const load: PageServerLoad = async ({ url }) => {
	const today_start = startOfDay(new Date());
	const today_end = endOfDay(new Date());

	// --- OBTENER PARÁMETROS DE FILTRO DESDE LA URL ---
	const doctorId = url.searchParams.get('doctorId');
	const specialtyId = url.searchParams.get('specialtyId');
	const statusId = url.searchParams.get('statusId');

	// 1. Crear una consulta base para las citas del día actual
	let appointmentsQuery = db
		.selectFrom('date')
		.innerJoin('patient', 'patient.id', 'date.patient_id')
		.innerJoin('doctor', 'doctor.id', 'date.doctor_id')
		.innerJoin('doctor_specialty', 'doctor_specialty.id', 'doctor.specialty_id') // Necesario para filtrar por especialidad
		.innerJoin('date_status', 'date_status.id', 'date.status_id')
		.where('date.date', '>=', today_start)
		.where('date.date', '<=', today_end);

	// --- APLICAR FILTROS A LA CONSULTA ---
	if (doctorId) {
		appointmentsQuery = appointmentsQuery.where('date.doctor_id', '=', BigInt(doctorId));
	}
	if (specialtyId) {
		appointmentsQuery = appointmentsQuery.where('doctor.specialty_id', '=', BigInt(specialtyId));
	}
	if (statusId) {
		// Si el usuario elige un estado específico, lo usamos
		appointmentsQuery = appointmentsQuery.where('date.status_id', '=', BigInt(statusId));
	} else {
		// Si no se especifica ningún filtro de estado, mostramos solo 'Confirmada' y 'Completada' por defecto.
		appointmentsQuery = appointmentsQuery.where('date_status.status', 'in', ['Confirmada', 'Completada']);
	}
	
	const appointments = await appointmentsQuery
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
		.orderBy('date.date', 'asc')
		.execute();

	// 2. Cargar datos para los selects del modal de filtros
	const [allDoctors, allSpecialties, allStatuses] = await Promise.all([
		db.selectFrom('doctor').select(['id', 'name', 'lastName']).orderBy('lastName').execute(),
		db.selectFrom('doctor_specialty').select(['id', 'name']).orderBy('name').execute(),
		db.selectFrom('date_status').selectAll().orderBy('status').execute()
	]);
	
	const form = await superValidate(zod(updateStatusSchema));

	return {
		appointments: appointments as DailyAppointment[],
		allStatuses,
		allDoctors,
		allSpecialties,
		form,
		// Devolvemos los filtros actuales para que el frontend sepa qué mostrar
		filters: {
			doctorId,
			specialtyId,
			statusId
		}
	};
};

// La sección 'actions' no necesita cambios
export const actions: Actions = {
	updateStatus: async ({ request }) => {
		const form = await superValidate(request, zod(updateStatusSchema));
		if (!form.valid) {
			return fail(400, { form });
		}
		try {
			await db.updateTable('date').set({ status_id: BigInt(form.data.status_id) })
				.where('id', '=', BigInt(form.data.appointment_id)).execute();
		} catch (error) {
			console.error('Error al actualizar el estado de la cita:', error);
			return fail(500, { form, message: 'No se pudo actualizar el estado.' });
		}
		return message(form, 'Estado actualizado con éxito');
	}
};