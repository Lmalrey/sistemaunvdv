// src/routes/private/usuarios/[role=userRole]/[id]/schema.ts (ACTUALIZADO)
import { z } from 'zod';

// Esquema base con los campos comunes
const baseEditSchema = z.object({
	name: z.string().min(2, 'El nombre es requerido'),
	lastName: z.string().min(2, 'El apellido es requerido'),
	phone: z.string().min(7, 'El teléfono es requerido')
});

// Esquema específico para doctor, añadiendo el 'role' como literal
const doctorEditSchema = baseEditSchema.extend({
	role: z.literal('doctor'), // Discriminador
	matricula: z.coerce.number().positive('La matrícula es requerida'),
	colegio_id: z.coerce.number().positive('El ID del colegio es requerido'),
	rif: z.string().min(5, 'El RIF es requerido'),
	specialty_id: z.string().nonempty('Debe seleccionar una especialidad'),
	logo_url: z.string().url('Debe ser una URL válida').optional().or(z.literal(''))
});

// Esquema para secretaria, añadiendo el 'role' como literal
const secretariaEditSchema = baseEditSchema.extend({
	role: z.literal('secretaria') // Discriminador
});

// Unión discriminada para la edición. Zod sabrá qué validar basándose en el campo 'role'.
export const userEditSchema = z.discriminatedUnion('role', [
	doctorEditSchema,
	secretariaEditSchema
]);