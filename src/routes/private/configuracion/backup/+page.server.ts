import { fail } from '@sveltejs/kit';
import { spawn, exec as execCallback } from 'node:child_process';
import util from 'node:util';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { env } from '$env/dynamic/private';
import type { Actions, PageServerLoad } from './$types';

import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { createSchema, deleteSchema, restoreSchema, checkVersionSchema } from './schema';

const exec = util.promisify(execCallback);

const BACKUP_DIR = path.resolve('./backups');


function getPgCommand(executable: 'pg_dump' | 'psql'): string {
	if (env.POSTGRES_BIN_DIR) {
		return path.join(env.POSTGRES_BIN_DIR, executable);
	}
	return executable;
}

async function ensureBackupDir() {
	try {
		await fs.access(BACKUP_DIR);
	} catch {
		await fs.mkdir(BACKUP_DIR, { recursive: true });
	}
}

function runStreamedCommand(command: string, args: string[], options: { inputStream?: NodeJS.ReadableStream, outputStream?: NodeJS.WritableStream }): Promise<string> {
	return new Promise((resolve, reject) => {
		const process = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });
		
		let stderr = '';
		process.stderr.on('data', (data) => {
			stderr += data.toString();
		});

		if (options.inputStream) {
			options.inputStream.pipe(process.stdin);
		}
		if (options.outputStream) {
			process.stdout.pipe(options.outputStream);
		}
		
		process.on('close', (code) => {
			if (code === 0) {
				resolve(stderr); // Resuelve con stderr para advertencias
			} else {
				reject(new Error(`El proceso terminó con el código ${code}. Error: ${stderr}`));
			}
		});

		process.on('error', (err) => {
			reject(err);
		});
	});
}


export const load: PageServerLoad = async () => {
	// Tu función load está perfecta, no se necesita ningún cambio.
	await ensureBackupDir();
	const files = await fs.readdir(BACKUP_DIR);
	const backups = await Promise.all(
		files
			.filter((file) => file.endsWith('.sql'))
			.map(async (file) => {
				const stats = await fs.stat(path.join(BACKUP_DIR, file));
				return { name: file, size: (stats.size / 1024 / 1024).toFixed(2), createdAt: stats.birthtime };
			})
	);
	backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
	
	// Inicializar todos los formularios que se usan en la página
	return {
		createForm: await superValidate(zod(createSchema)),
		restoreForm: await superValidate(zod(restoreSchema)),
		deleteForm: await superValidate(zod(deleteSchema)),
		checkVersionForm: await superValidate(zod(checkVersionSchema)),
		backups
	};
};

export const actions: Actions = {
	create: async (event) => {
		const form = await superValidate(event, zod(createSchema));
		if (!form.valid) return fail(400, { form });

		if (!env.DATABASE_URL) {
			console.error('PGDUMP_URL no está configurada.');
			return fail(500, { form, message: 'Configuración del servidor incompleta.' });
		}

		await ensureBackupDir();

		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const filename = `backup-${timestamp}.sql`;
		const filepath = path.join(BACKUP_DIR, filename);

		const writeStream = fsSync.createWriteStream(filepath);
		const pgDumpCmd = getPgCommand('pg_dump');

		try {
			console.log('Ejecutando comando de respaldo...');
			const stderr = await runStreamedCommand(pgDumpCmd, [env.DATABASE_URL], { outputStream: writeStream });
			
			if (stderr) console.warn('Advertencia de pg_dump:', stderr);
			
			console.log(`Respaldo '${filename}' creado exitosamente.`);
			return { form, message: `Respaldo '${filename}' creado exitosamente.` };

		} catch (error: any) {
			console.error('Error al crear el respaldo:', error.message);
			await fs.unlink(filepath).catch(() => {}); // Limpiar archivo fallido
			return fail(500, { form, message: `Error al crear el respaldo: ${error.message}` });
		}
	},

	restore: async (event) => {
		const form = await superValidate(event, zod(restoreSchema));
		if (!form.valid) return fail(400, { form });
		
		if (!env.DATABASE_URL) {
			return fail(500, { form, message: 'Configuración del servidor incompleta.' });
		}

		const { filename } = form.data;
		const filepath = path.join(BACKUP_DIR, filename);
		
		try {
			await fs.access(filepath); // Verificar que el archivo existe
		} catch {
			return fail(404, { form, message: `El archivo de respaldo '${filename}' no fue encontrado.`});
		}
		
		const readStream = fsSync.createReadStream(filepath);
		const psqlCmd = getPgCommand('psql');
		
		try {
			console.log(`Restaurando desde '${filename}'...`);
			await runStreamedCommand(psqlCmd, [env.DATABASE_URL], { inputStream: readStream });
			
			console.log(`Base de datos restaurada desde '${filename}'.`);
			return { form, message: `Base de datos restaurada exitosamente desde '${filename}'.` };

		} catch (error: any) {
			console.error('Error al restaurar la base de datos:', error.message);
			return fail(500, { form, message: `Error en la restauración: ${error.message}` });
		}
    },

	delete: async (event) => {
		// Tu acción de eliminar está bien, pero la adaptamos para superforms
		const form = await superValidate(event, zod(deleteSchema));
		if (!form.valid) return fail(400, { form });

		const { filename } = form.data;
		const filepath = path.join(BACKUP_DIR, filename);

		try {
			await fs.unlink(filepath);
			return { form, message: `Respaldo '${filename}' eliminado.` };
		} catch (error) {
			console.error('Error al eliminar el respaldo:', error);
			return fail(500, { form, message: 'No se pudo eliminar el archivo de respaldo.' });
		}
	},

	check_version: async (event) => {
		// Tu acción de check_version es correcta para comandos cortos.
		const form = await superValidate(event, zod(checkVersionSchema));
		if (!form.valid) return fail(400, { form });

		let pgDumpOutput: string, psqlOutput: string;
		try {
			const { stdout } = await exec(`${getPgCommand('pg_dump')} --version`);
			pgDumpOutput = stdout.trim();
		} catch (e: any) {
			pgDumpOutput = `Error: ${e.stderr || e.message}`;
		}
		try {
			const { stdout } = await exec(`${getPgCommand('psql')} --version`);
			psqlOutput = stdout.trim();
		} catch (e: any) {
			psqlOutput = `Error: ${e.stderr || e.message}`;
		}
		return { form, pgDumpOutput, psqlOutput };
	}
};