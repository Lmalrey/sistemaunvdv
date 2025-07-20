import { z } from 'zod';

// Esquema para una sola respuesta a una pregunta de antecedentes
const backgroundAnswerSchema = z.object({
  question_id: z.coerce.number(), // coerce convierte el string del form a número
  question_text: z.string(), // Para mostrar la pregunta en el UI
  answer: z.boolean().default(false),
});

// Esquema para la sección de antecedentes personales
const personalBackgroundSchema = z.object({
  description: z.string().min(1, 'La descripción no puede estar vacía.'),
  answers: z.array(backgroundAnswerSchema),
});

// Esquema para la sección de antecedentes familiares
const familyBackgroundSchema = z.object({
  description: z.string().min(1, 'La descripción no puede estar vacía.'),
  answers: z.array(backgroundAnswerSchema),
});

// Esquema principal del formulario del paciente
export const patientFormSchema = z.object({
  ci: z.coerce.number().int().positive('El CI debe ser un número positivo.'),
  name: z.string().min(2, 'El nombre es requerido.'),
  lastName: z.string().min(2, 'El apellido es requerido.'),
  birthDate: z.coerce.date({ message: 'Por favor, introduce una fecha de nacimiento válida.' }),
  phone: z.string().min(11, 'El teléfono no es válido.'),
  email: z.string().email('El email no es válido.'),
  gender_id: z.coerce.number().positive('Debes seleccionar un género.'),
  province_id: z.coerce.number().positive('Debes seleccionar una provincia.'),
  state_id: z.coerce.number().positive('Debes seleccionar un estado.'),
  city: z.string().min(2, 'La ciudad es requerida.'),
  parent_fullname: z.string().min(3, 'El nombre del representante es requerido.'),
  parent_ci: z.coerce.number().int().positive('El CI del representante no es válido.'),

  // Secciones anidadas para los antecedentes
  personal_background: personalBackgroundSchema,
  family_background: familyBackgroundSchema,
});

// Exportamos el tipo inferido para usarlo en SvelteKit
export type PatientFormSchema = typeof patientFormSchema;