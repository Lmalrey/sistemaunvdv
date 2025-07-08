import { rifSchema } from '$lib/common/schemas/schemas';
import { db } from '$lib/server/database';
import type { Actions, ServerLoad } from '@sveltejs/kit';
import { type } from 'arktype';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { arktype } from 'sveltekit-superforms/adapters';

const schema = type({
	nombre: 'string',
	razonSocial: type('string').pipe((value) => value.toUpperCase()),
	rif: rifSchema,
	email: 'string.email',
	telefono: /^(?:02\d{9}|04(?:12|14|16|24|26)\d{7})$/,
	direccion: 'string',
	ciudad: 'string < 50',
	estado: 'string < 50',
	notas: 'string'
});

export const load: ServerLoad = async () => {
	const form = await superValidate(arktype(schema));

	// Always return { form } in load functions
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, arktype(schema));

		console.log(form);

		// await new Promise((resolve) => {
		// 	setTimeout(resolve, 3000);
		// });

		if (!form.valid) {
			// Return { form } and things will just work.
			return fail(400, { form });
		}

		await db
			.insertInto('clientes')
			.values({
				nombre: form.data.nombre,
				razon_social: form.data.razonSocial,
				direccion: form.data.direccion,
				email: form.data.email,
				estado: form.data.estado,
				rif: form.data.rif,
				telefono: form.data.telefono,
				notas: form.data.notas,
				ciudad: form.data.ciudad
			})
			.execute();

		// Return the form with a status message
		return message(form, { text: '!Cliente creado satisfactoriamente!', type: 'success' });
	}
};
