import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, type Actions, type ServerLoad } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { userSchema} from './schema';
import { createClient } from '@supabase/supabase-js';
import {config} from 'dotenv';
config();


// Importar claves de entorno de forma segura
import { PUBLIC_SUPABASE_URL } from '$env/static/public';


export const load: ServerLoad = async () => {
	const specialties = await db.selectFrom('doctor_specialty').selectAll().orderBy('name').execute();
	
	// Usamos un esquema inicial sin los campos dinámicos para la carga
	const form = await superValidate(zod(userSchema));

	return { form, specialties };
};

export const actions: Actions = {
	default: async ({ request }) => {
		// Al procesar la acción, usamos el esquema completo y dinámico
		const form = await superValidate(request, zod(userSchema));

		if (!form.valid) {
			return fail(400, { form });
		}
		
		// Crear un cliente de Supabase con privilegios de administrador para crear usuarios
		const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!);

		// 1. Crear el usuario en Supabase Auth
		const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
			email: form.data.email,
			password: form.data.password,
			email_confirm: true // Opcional: marca el email como verificado
		});

		if (authError) {
			console.error("Error de Supabase:", authError);
			// Devolvemos el error a Superforms para mostrarlo en la UI
			return fail(409, { form, message: `Error al crear el usuario: ${authError.message}` });
		}

		if (!user) {
			return fail(500, { form, message: 'El usuario no pudo ser creado en el sistema de autenticación.' });
		}

		// 2. Insertar en la base de datos local según el tipo de usuario
		try {
			if (form.data.userType === 'doctor') {
				await db.insertInto('doctor').values({
					name: form.data.name,
					lastName: form.data.lastName,
					matricula: form.data.matricula,
					colegio_id: form.data.colegio_id,
					rif: form.data.rif,
					specialty_id: BigInt(form.data.specialty_id),
					phone: form.data.phone,
					email: form.data.email,
                    logo_url: form.data.logo_url,
					account_id: user.id // <-- El enlace clave
				}).execute();
                
			} else if (form.data.userType === 'secretaria') {
				await db.insertInto('secretaria').values({
					name: form.data.name,
					lastName: form.data.lastName,
					phone: form.data.phone,
					account_id: user.id // <-- El enlace clave
				}).execute();
			}
		} catch (dbError) {
			console.error("Error en la base de datos local:", dbError);
			
			// Opcional pero recomendado: Rollback. Eliminar el usuario de Supabase si falla la BD local.
			await supabaseAdmin.auth.admin.deleteUser(user.id);

			return fail(500, { form, message: 'Usuario creado en Supabase, pero falló el registro local. La operación fue revertida.' });
		}
		
		redirect(303, '/private/usuarios');
	}
};