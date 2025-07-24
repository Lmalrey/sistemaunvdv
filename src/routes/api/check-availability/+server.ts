// src/routes/api/check-availability/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const doctorId = url.searchParams.get('doctorId');
	const date = url.searchParams.get('date');
	const time = url.searchParams.get('time');

	if (!doctorId || !date || !time) {
		return json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
	}

	try {
		const appointmentTimestamp = new Date(`${date}T${time}:00`);

		const existingAppointment = await db
			.selectFrom('date')
			.select('id')
			.where('doctor_id', '=', BigInt(doctorId))
			.where('date', '=', appointmentTimestamp)
			.executeTakeFirst();
		
		// Devolvemos si el horario está disponible o no.
		return json({ isAvailable: !existingAppointment });

	} catch (e) {
		console.error("Error checking availability:", e);
		// En caso de error, es más seguro asumir que no está disponible
		return json({ error: 'Error al verificar la disponibilidad' }, { status: 500 });
	}
};