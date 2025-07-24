// src/routes/private/usuarios/[role=userRole]/[id]/+page.server.ts (ACTUALIZADO)
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { userEditSchema } from './schema'; // <-- Importamos el esquema unificado
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { role, id } = params;
	const userId = BigInt(id);
	let initialData;

	if (role === 'doctor') {
		const userData = await db.selectFrom('doctor').selectAll().where('id', '=', userId).executeTakeFirst();
		if (!userData) error(404, 'Doctor no encontrado');
		initialData = { ...userData, role: 'doctor' as const, specialty_id: userData.specialty_id.toString() };
	} else { // role === 'secretaria'
		const userData = await db.selectFrom('secretaria').selectAll().where('id', '=', userId).executeTakeFirst();
		if (!userData) error(404, 'Secretaria no encontrada');
		initialData = { ...userData, role: 'secretaria' as const };
	}

	const form = await superValidate(initialData, zod(userEditSchema));
	const specialties = await db.selectFrom('doctor_specialty').selectAll().orderBy('name').execute();

	// Devolvemos el email por separado para mostrarlo, ya que no es parte del formulario de edición.
	return { form, specialties, role, email: initialData.email };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const { role, id } = params;
		const userId = BigInt(id);

		const form = await superValidate(request, zod(userEditSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			if (form.data.role === 'doctor') {
				await db.updateTable('doctor').set({
					name: form.data.name,
					lastName: form.data.lastName,
					matricula: form.data.matricula,
					colegio_id: form.data.colegio_id,
					rif: form.data.rif,
					specialty_id: BigInt(form.data.specialty_id),
					phone: form.data.phone,
					logo_url: form.data.logo_url
				}).where('id', '=', userId).execute();
			} else if (form.data.role === 'secretaria') {
				await db.updateTable('secretaria').set({
					name: form.data.name,
					lastName: form.data.lastName,
					phone: form.data.phone
				}).where('id', '=', userId).execute();
			}
		} catch (dbError) {
			return fail(500, { form, message: 'Error en el servidor al guardar los cambios.' });
		}
		redirect(303, '/private/usuarios');
	}
};