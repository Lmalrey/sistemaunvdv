// src/routes/api/patient-schedule/+server.ts
import { db } from '$lib/server/database';
import { json, error } from '@sveltejs/kit';
import { startOfDay, endOfDay, format } from 'date-fns';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const patientId = url.searchParams.get('patientId');
	const dateStr = url.searchParams.get('date');
	const excludeId = url.searchParams.get('excludeId');

	if (!patientId || !dateStr) {
		error(400, 'Faltan parámetros: patientId y date son requeridos');
	}

	try {
		const selectedDateStart = startOfDay(new Date(dateStr + 'T00:00:00'));
		const selectedDateEnd = endOfDay(new Date(dateStr + 'T00:00:00'));

		let query = db.selectFrom('date')
			.select('date')
			.where('patient_id', '=', BigInt(patientId))
			.where('date', '>=', selectedDateStart)
			.where('date', '<=', selectedDateEnd);
			
		if (excludeId) {
			query = query.where('id', '!=', BigInt(excludeId)); // <-- Excluir cita
		}

		// Obtenemos las fechas/horas de las citas que el paciente ya tiene en ese día
		const patientAppointments = await query.execute();
		
		// Devolvemos un array de las horas ocupadas en formato "HH:mm"
		const bookedTimes = patientAppointments.map(appt => format(new Date(appt.date), 'HH:mm'));

		return json({ bookedTimes });

	} catch (err) {
		console.error('API Error fetching patient schedule:', err);
		error(500, 'Error interno del servidor');
	}
};