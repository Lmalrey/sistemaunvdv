import { z } from 'zod';

const filenameSchema = z
	.string()
	.min(1, 'El nombre del archivo es requerido.')
	.refine((val) => !val.includes('..') && !val.includes('/'), {
		message: 'Nombre de archivo inválido.'
	});

export const createSchema = z.object({});

export const checkVersionSchema = z.object({});

// --- ESQUEMA CORREGIDO ---
export const restoreSchema = z
	.object({
		filename: filenameSchema,
		// 1. El tipo base es un string simple, lo que permite cualquier valor mientras se escribe.
		confirmation: z.string() 
	})
	// 2. La validación se aplica al objeto completo después de que los campos son validados individualmente.
	.refine((data) => data.confirmation === 'CONFIRMAR RESTAURACIÓN', {
		// Mensaje de error que se asignará al campo 'confirmation'.
		message: "Debe escribir la frase 'CONFIRMAR RESTAURACIÓN' para confirmar.",
		// La ruta del campo al que se debe aplicar el error.
		path: ['confirmation'] 
	});

export const deleteSchema = z.object({
	filename: filenameSchema
});
