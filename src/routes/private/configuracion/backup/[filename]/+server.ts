import { error, type RequestHandler } from '@sveltejs/kit';
import fs from 'node:fs';
import path from 'node:path';

const BACKUP_DIR = path.resolve('./backups');

export const GET: RequestHandler = async ({ params }) => {
	const { filename } = params;

	// Medida de seguridad
	if (!filename || filename.includes('..') || filename.includes('/')) {
		error(400, 'Nombre de archivo inválido.');
	}

	const filepath = path.join(BACKUP_DIR, filename);

	try {
		const stats = await fs.promises.stat(filepath);
		const fileStream = fs.createReadStream(filepath);

		return new Response(fileStream as any, {
			headers: {
				'Content-Type': 'application/sql',
				'Content-Length': stats.size.toString(),
				'Content-Disposition': `attachment; filename="${filename}"`
			}
		});
	} catch (e) {
		error(404, 'Archivo no encontrado.');
	}
};