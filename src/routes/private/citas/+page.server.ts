// src/routes/private/citas/+page.server.ts
import { db } from '$lib/server/database';
import { fail } from '@sveltejs/kit';
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';
import type { Actions, PageServerLoad } from './$types';

// El tipo AppointmentEntry se mantiene igual
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
	// Parámetros de la URL (sin cambios)
	const page = Number(url.searchParams.get('page') ?? '1');
	const pageSize = 10;
	const searchTerm = url.searchParams.get('search') ?? '';
	const doctorId = url.searchParams.get('doctorId');
	const specialtyId = url.searchParams.get('specialtyId');
	const statusId = url.searchParams.get('statusId');

	const now = new Date();
	const todayStart = startOfDay(now);
	const todayEnd = endOfDay(now);
	const weekStart = startOfWeek(now, { weekStartsOn: 1 });
	const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

	// KPIs (sin cambios)
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

	// Consulta base con filtros (sin cambios)
	let baseQuery = db
		.selectFrom('date')
		.innerJoin('patient', 'patient.id', 'date.patient_id')
		.innerJoin('doctor', 'doctor.id', 'date.doctor_id')
		.innerJoin('doctor_specialty', 'doctor_specialty.id', 'doctor.specialty_id')
		.innerJoin('date_status', 'date_status.id', 'date.status_id')
		.where('date.date', '>=', todayStart);
	
	if (searchTerm) {
		baseQuery = baseQuery.where((eb) =>
			eb.or([
				eb('patient.name', 'ilike', `%${searchTerm}%`),
				eb('patient.lastName', 'ilike', `%${searchTerm}%`)
			])
		);
	}
	if (doctorId) baseQuery = baseQuery.where('date.doctor_id', '=', BigInt(doctorId));
	if (specialtyId) baseQuery = baseQuery.where('doctor.specialty_id', '=', BigInt(specialtyId));
	if (statusId) baseQuery = baseQuery.where('date.status_id', '=', BigInt(statusId));

	// Consultas de paginación y citas (sin cambios)
	const totalResultPromise = baseQuery.select(({ fn }) => [fn.countAll().as('count')]).executeTakeFirstOrThrow();
	const appointmentsPromise = baseQuery
		.select([
			'date.id', 'date.date', 'date.observation', 'date_status.status',
			'patient.name as patientName', 'patient.lastName as patientLastName', 'patient.ci as patientCi', 'patient.phone as patientPhone',
			'doctor.name as doctorName', 'doctor.lastName as doctorLastName',
			'doctor_specialty.name as specialtyName'
		])
		.orderBy('date.date', 'asc')
		.limit(pageSize)
		.offset((page - 1) * pageSize)
		.execute();
	
	// --- CORRECCIÓN: Promesa única y simplificada para los datos de los filtros ---
	const filtersDataPromise = (async () => {
		const [doctors, specialties, statuses] = await Promise.all([
			db.selectFrom('doctor').select(['id', 'name', 'lastName']).orderBy('lastName').execute(),
			db.selectFrom('doctor_specialty').select(['id', 'name']).orderBy('name').execute(),
			db.selectFrom('date_status').selectAll().orderBy('status').execute()
		]);
		return { doctors, specialties, statuses };
	})();
		
	// --- CORRECCIÓN: Se elimina 'statusesPromise' y se captura 'filtersData' ---
	const [kpis, totalResult, appointments, filtersData] = await Promise.all([
		kpisPromise, 
		totalResultPromise, 
		appointmentsPromise, 
		filtersDataPromise // Esta promesa devuelve el objeto { doctors, specialties, statuses }
	]);

	const totalItems = Number(totalResult.count);
	const pageCount = Math.ceil(totalItems / pageSize);

	// --- CORRECCIÓN: Se añaden los datos de los filtros al objeto de retorno ---
	return {
		kpis,
		appointments: appointments as AppointmentEntry[],
		...filtersData, // <-- Esto expande el objeto a: doctors: [...], specialties: [...], statuses: [...]
		currentPage: page,
		pageSize,
		pageCount,
		filters: {
			searchTerm,
			doctorId,
			specialtyId,
			statusId
		}
	};
};

// La sección de 'actions' no necesita cambios
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