import { db } from '$lib/server/database';
import { sql } from 'kysely';
import type { PageServerLoad } from './$types';

export type DoctorEntry = {
	id: bigint;
	name: string;
	lastName: string;
	email: string;
	phone: string;
	specialtyName: string;
	role: 'Doctor';
};
export type SecretaryEntry = {
	id: bigint;
	name: string;
	lastName: string;
	phone: string;
	role: 'Secretaria';
};

export const load: PageServerLoad = async ({ url }) => {
	const pageSize = 10;

	// Parámetros de paginación y búsqueda independientes
	const doctorsPage = Number(url.searchParams.get('page_doctors') ?? '1');
	const secretariesPage = Number(url.searchParams.get('page_secretaries') ?? '1');
	const doctorsSearchTerm = url.searchParams.get('search_doctors') ?? '';
	const secretariesSearchTerm = url.searchParams.get('search_secretaries') ?? '';

	// --- Consultas para Doctores ---
	const doctorsPromise = (async () => {
		let query = db
			.selectFrom('doctor')
			.innerJoin('doctor_specialty', 'doctor_specialty.id', 'doctor.specialty_id');

		// Aplicar filtro de búsqueda si existe
		if (doctorsSearchTerm) {
			query = query.where((eb) => eb.or([
				eb('doctor.name', 'ilike', `%${doctorsSearchTerm}%`),
				eb('doctor.lastName', 'ilike', `%${doctorsSearchTerm}%`),
				eb('doctor.email', 'ilike', `%${doctorsSearchTerm}%`),
				eb('doctor_specialty.name', 'ilike', `%${doctorsSearchTerm}%`)
			]));
		}

		const totalResult = await query.select(({ fn }) => [fn.countAll<number>().as('count')]).executeTakeFirstOrThrow();
		const pageCount = Math.ceil(totalResult.count / pageSize);
		const data = await query
			.select(['doctor.id', 'doctor.name', 'doctor.lastName', 'doctor.email', 'doctor.phone', 'doctor_specialty.name as specialtyName', sql<"Doctor">`'Doctor'`.as('role')])
			.orderBy('doctor.lastName', 'asc')
			.limit(pageSize)
			.offset((doctorsPage - 1) * pageSize)
			.execute();
		
		return { data: data as DoctorEntry[], currentPage: doctorsPage, pageCount, searchTerm: doctorsSearchTerm };
	})();

	// --- Consultas para Secretarias ---
	const secretariesPromise = (async () => {
		let query = db.selectFrom('secretaria');

		// Aplicar filtro de búsqueda si existe
		if (secretariesSearchTerm) {
			query = query.where((eb) => eb.or([
				eb('name', 'ilike', `%${secretariesSearchTerm}%`),
				eb('lastName', 'ilike', `%${secretariesSearchTerm}%`),
				eb('phone', 'ilike', `%${secretariesSearchTerm}%`)
			]));
		}

		const totalResult = await query.select(({ fn }) => [fn.countAll<number>().as('count')]).executeTakeFirstOrThrow();
		const pageCount = Math.ceil(totalResult.count / pageSize);
		const data = await query
			.select(['id', 'name', 'lastName', 'phone', sql<"Secretaria">`'Secretaria'`.as('role')])
			.orderBy('lastName', 'asc')
			.limit(pageSize)
			.offset((secretariesPage - 1) * pageSize)
			.execute();

		return { data: data as SecretaryEntry[], currentPage: secretariesPage, pageCount, searchTerm: secretariesSearchTerm };
	})();

	const [doctors, secretaries] = await Promise.all([doctorsPromise, secretariesPromise]);

	return { doctors, secretaries, pageSize };
};