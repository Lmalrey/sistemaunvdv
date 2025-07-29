import { json } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { addDays, addMinutes, format, isBefore, setHours, startOfDay } from 'date-fns';

export const GET = async ({ url }) => {
	const doctorId = url.searchParams.get('doctorId');
	const dateStr = url.searchParams.get('date'); // Formato 'YYYY-MM-DD'
	const excludeId = url.searchParams.get('excludeId');

	if (!doctorId || !dateStr) {
		return json({ error: 'Faltan doctorId o fecha' }, { status: 400 });
	}

	const selectedDate = new Date(dateStr + 'T00:00:00'); // Asegurar que sea la zona horaria local
	const dayStart = startOfDay(selectedDate);
	const dayEnd = addDays(dayStart, 1);

	try {

		let query = db.selectFrom('date')
			.select('date')
			.where('doctor_id', '=', BigInt(doctorId))
			.where('date', '>=', dayStart)
			.where('date', '<', dayEnd);

		if (excludeId) {
			query = query.where('id', '!=', BigInt(excludeId)); // <-- Excluir cita
		}

		// 1. Obtener todas las citas ya reservadas para ese doctor en ese día
		const bookedAppointments = await query.execute();
		
		// Usar un Set para búsquedas de tiempo O(1) (mucho más rápido que Array.includes)
		const bookedTimes = new Set(bookedAppointments.map(appt => format(new Date(appt.date), 'HH:mm')));

		// 2. Generar todos los posibles horarios en el rango de 8am a 5pm
		const availableSlots = [];
		const startHour = setHours(dayStart, 8);
		const endHour = setHours(dayStart, 17); // 5 PM
		
		let currentSlot = startHour;
		while (isBefore(currentSlot, endHour)) {
			const timeStr = format(currentSlot, 'HH:mm');
			
			// 3. Si el horario NO está en la lista de reservados, lo añadimos
			if (!bookedTimes.has(timeStr)) {
				availableSlots.push(timeStr);
			}

			currentSlot = addMinutes(currentSlot, 30);
		}

		return json(availableSlots);

	} catch (e) {
		console.error(e);
		return json({ error: 'Error al consultar la disponibilidad' }, { status: 500 });
	}
};