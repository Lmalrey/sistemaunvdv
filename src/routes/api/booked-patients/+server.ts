// src/routes/api/booked-patients/+server.ts
import { db } from '$lib/server/database';
import { json, error } from '@sveltejs/kit';
import { startOfDay, endOfDay } from 'date-fns';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const doctorId = url.searchParams.get('doctorId');
	const dateStr = url.searchParams.get('date');

	if (!doctorId || !dateStr) {
		error(400, 'Faltan parámetros: doctorId y date son requeridos');
	}

	try {
		const selectedDateStart = startOfDay(new Date(dateStr + 'T00:00:00'));
		const selectedDateEnd = endOfDay(new Date(dateStr + 'T00:00:00'));

		// Obtenemos los IDs de los pacientes que ya tienen una cita con este doctor en este día
		const bookedPatientsResult = await db
			.selectFrom('date')
			.select('patient_id')
			.where('doctor_id', '=', BigInt(doctorId))
			.where('date', '>=', selectedDateStart)
			.where('date', '<=', selectedDateEnd)
			.execute();
		
		// Devolvemos un array de IDs de pacientes en formato string para facilitar la comparación en el frontend
		const bookedPatientIds = bookedPatientsResult.map(p => p.patient_id.toString());

		return json({ bookedPatientIds });

	} catch (err) {
		console.error('API Error fetching booked patients:', err);
		error(500, 'Error interno del servidor');
	}
};