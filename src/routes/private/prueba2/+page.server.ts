import { db } from '$lib/server/database';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async () => {
	const clientes = await db
		.selectFrom('clientes')
		.select([
			'clientes.id',
			'clientes.nombre',
			'clientes.rif',
			'clientes.razon_social',
			'clientes.estatus'
		])
		.execute();

	// Always return { form } in load functions
	return {
		clientes
	};
};
