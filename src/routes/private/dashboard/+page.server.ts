// src/routes/private/dashboard/+page.server.ts
import { db } from '$lib/server/database';
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const now = new Date();

	// --- Promesas para obtener los KPIs ---
	const kpisPromise = (async () => {
		const monthStart = startOfMonth(now);
		const monthEnd = endOfMonth(now);
		const todayStart = startOfDay(now);

		const [totalPatients, pendingAppointments, totalRecords, totalRecipes] = await Promise.all([
			// Total de pacientes registrados
			db.selectFrom('patient').select(({ fn }) => [fn.countAll().as('count')]).executeTakeFirstOrThrow(),
			// Citas pendientes para hoy y el futuro
			db.selectFrom('date')
				.innerJoin('date_status', 'date_status.id', 'date.status_id')
				.select(({ fn }) => [fn.countAll().as('count')])
				.where('date.date', '>=', todayStart)
				.where('date_status.status', 'in', ['Programada', 'Confirmada'])
				.executeTakeFirstOrThrow(),
			// Informes médicos generados este mes
			db.selectFrom('medical_record').select(({ fn }) => [fn.countAll().as('count')])
				.where('emmited_at', '>=', monthStart.toISOString())
				.where('emmited_at', '<=', monthEnd.toISOString())
				.executeTakeFirstOrThrow(),
			// Récipes emitidos este mes
			db.selectFrom('recipe').select(({ fn }) => [fn.countAll().as('count')])
				.where('date', '>=', monthStart.toISOString())
				.where('date', '<=', monthEnd.toISOString())
				.executeTakeFirstOrThrow()
		]);

		return {
			totalPatients: Number(totalPatients.count),
			pendingAppointments: Number(pendingAppointments.count),
			totalRecords: Number(totalRecords.count),
			totalRecipes: Number(totalRecipes.count)
		};
	})();

	// --- Promesa para obtener las próximas 5 citas del día ---
	const upcomingAppointmentsPromise = (async () => {
		const todayStart = startOfDay(now);
		const todayEnd = endOfDay(now);

		return db.selectFrom('date')
			.innerJoin('patient', 'patient.id', 'date.patient_id')
			.select(['date.date', 'patient.name', 'patient.lastName', 'date.observation'])
			.where('date.date', '>=', todayStart)
			.where('date.date', '<=', todayEnd)
			.orderBy('date.date', 'asc')
			.limit(5)
			.execute();
	})();
	
	// --- Resolvemos todas las promesas en paralelo ---
	const [kpis, upcomingAppointments] = await Promise.all([kpisPromise, upcomingAppointmentsPromise]);

	return {
		kpis,
		upcomingAppointments
	};
};