// src/routes/private/citas/+page.server.ts
import { db } from '$lib/server/database';
import { fail } from '@sveltejs/kit';
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';
import type { Actions, PageServerLoad } from './$types';

// Definimos un tipo para la estructura de datos que devolverá nuestra consulta principal
export type AppointmentEntry = {
	id: bigint;
	date: Date;
	observation: string | null;
	status: string;
	patientName: string;
	patientLastName: string;
	patientCi: number | null;
	patientPhone: string;
	doctorName: string;
	doctorLastName: string;
	specialtyName: string;
};

export const load: PageServerLoad = async ({ url }) => {
	// Lógica de Paginación
	const page = Number(url.searchParams.get('page') ?? '1');
	const pageSize = 10; // Número de citas por página

	const now = new Date();
	const todayStart = startOfDay(now);
	const todayEnd = endOfDay(now);
	const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Lunes
	const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

	// 1. Obtener los contadores (KPIs) en paralelo
	const kpisPromise = (async () => {
		const [todayCount, weekCount, pendingCount, completedCount] = await Promise.all([
			db.selectFrom('date').select(({ fn }) => [fn.countAll().as('count')]).where('date', '>=', todayStart).where('date', '<=', todayEnd).executeTakeFirstOrThrow(),
			db.selectFrom('date').select(({ fn }) => [fn.countAll().as('count')]).where('date', '>=', weekStart).where('date', '<=', weekEnd).executeTakeFirstOrThrow(),
			db.selectFrom('date').innerJoin('date_status', 'date_status.id', 'date.status_id').select(({ fn }) => [fn.countAll().as('count')]).where('date', '>=', todayStart).where('date', '<=', todayEnd).where('date_status.status', '=', 'Confirmada').executeTakeFirstOrThrow(),
			db.selectFrom('date').innerJoin('date_status', 'date_status.id', 'date.status_id').select(({ fn }) => [fn.countAll().as('count')]).where('date', '>=', todayStart).where('date', '<=', todayEnd).where('date_status.status', '=', 'Completada').executeTakeFirstOrThrow()
		]);
		return {
			today: Number(todayCount.count),
			thisWeek: Number(weekCount.count),
			pending: Number(pendingCount.count),
			completed: Number(completedCount.count)
		};
	})();

	// 2. Crear una consulta base reutilizable para las citas
	const baseQuery = db
		.selectFrom('date')
		.innerJoin('patient', 'patient.id', 'date.patient_id')
		.innerJoin('doctor', 'doctor.id', 'date.doctor_id')
		.innerJoin('doctor_specialty', 'doctor_specialty.id', 'doctor.specialty_id')
		.innerJoin('date_status', 'date_status.id', 'date.status_id')
		.where('date.date', '>=', todayStart);

	// 3. Obtener el total de registros para calcular las páginas
	const totalResultPromise = baseQuery
		.select(({ fn }) => [fn.countAll().as('count')])
		.executeTakeFirstOrThrow();

	// 4. Obtener solo las citas de la página actual
	const appointmentsPromise = baseQuery
		.select([
			'date.id', 'date.date', 'date.observation',
			'date_status.status',
			'patient.name as patientName', 'patient.lastName as patientLastName', 'patient.ci as patientCi', 'patient.phone as patientPhone',
			'doctor.name as doctorName', 'doctor.lastName as doctorLastName',
			'doctor_specialty.name as specialtyName'
		])
		.orderBy('date.date', 'asc')
		.limit(pageSize)
		.offset((page - 1) * pageSize)
		.execute();

	const statusesPromise = db.selectFrom('date_status').selectAll().execute();
	
	const [kpis, totalResult, appointments, statuses] = await Promise.all([kpisPromise, totalResultPromise, appointmentsPromise, statusesPromise]);

	const totalItems = Number(totalResult.count);
	const pageCount = Math.ceil(totalItems / pageSize);

	return {
		kpis,
		appointments: appointments as AppointmentEntry[],
		statuses,
		currentPage: page,
		pageSize,
		pageCount
	};
};

export const actions: Actions = {
	updateStatus: async ({ request }) => {
		const formData = await request.formData();
		const appointmentId = formData.get('appointmentId');
		const newStatusId = formData.get('statusId');

		if (!appointmentId || !newStatusId) {
			return fail(400, { message: 'Faltan datos para actualizar el estado.' });
		}

		try {
			await db
				.updateTable('date')
				.set({ status_id: BigInt(newStatusId.toString()) })
				.where('id', '=', BigInt(appointmentId.toString()))
				.execute();
		} catch (error) {
			console.error("Error al actualizar estado:", error);
			return fail(500, { message: 'No se pudo actualizar el estado de la cita.' });
		}

		return { success: true };
	}
};