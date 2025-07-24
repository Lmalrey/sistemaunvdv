import { z } from 'zod';

// Esquema base para los campos de autenticación y el tipo de usuario
const baseUserSchema = z.object({
	email: z.string().email('Debe ser un correo electrónico válido'),
	password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
	userType: z.enum(['doctor', 'secretaria'], { required_error: 'Debe seleccionar un tipo de usuario' })
});

// Esquema específico para cuando el tipo es 'doctor'
const doctorSchema = baseUserSchema.extend({
	userType: z.literal('doctor'),
	name: z.string().min(2, 'El nombre es requerido'),
	lastName: z.string().min(2, 'El apellido es requerido'),
	matricula: z.coerce.number().positive('La matrícula es requerida'),
	colegio_id: z.coerce.number().positive('El ID del colegio es requerido'),
	rif: z.string().min(5, 'El RIF es requerido'),
	specialty_id: z.string().nonempty('Debe seleccionar una especialidad'),
	phone: z.string().min(7, 'El teléfono es requerido'),
    logo_url: z.string()
});

// Esquema específico para cuando el tipo es 'secretaria'
const secretariaSchema = baseUserSchema.extend({
	userType: z.literal('secretaria'),
	name: z.string().min(2, 'El nombre es requerido'),
	lastName: z.string().min(2, 'El apellido es requerido'),
	phone: z.string().min(7, 'El teléfono es requerido')
});

// Unión discriminada: Zod usará el campo 'userType' para decidir qué esquema aplicar
export const userSchema = z.discriminatedUnion('userType', [
	doctorSchema,
	secretariaSchema
]);

// También exportamos un esquema simple para manejar el caso sin selección
export const initialSchema = baseUserSchema;