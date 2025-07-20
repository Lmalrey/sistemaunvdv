import { z } from "zod/v4";

export const pacienteSchema = z.object({
    ci: z.number,
    name: z.string({ message: 'El nombre es requerido.' })
        .min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
    lastname: z.string({ message: 'El apellido es requerido.' })
        .min(3, { message: 'El apellido debe tener al menos 3 caracteres.' }),
    birthdate: z.date({ message: 'La fecha de nacimiento es requerida.' }),
    phone: z.string({ message: 'El teléfono es requerido.' })
        .min(11, { message: 'El teléfono debe tener al menos 11 caracteres.' }),
    email: z.email({ message: 'El email no es válido.' }),
    gender_id: z.number({ message: 'El género es requerido.' }),
    province_id: z.number({ message: 'La provincia es requerida.' }),
    state_id: z.number({ message: 'El estado es requerido.' }),
    city: z.string({ message: 'La ciudad es requerida.' })
        .min(3, { message: 'La ciudad debe tener al menos 3 caracteres.' }),
    personal_background_id: z.number({ message: 'La pregunta personal es requerida.' }),
    family_background_id: z.number({ message: 'La pregunta familiar es requerida.' }),
    parent_fullname: z.string({ message: 'El nombre del padre es requerido.' })
        .min(3, { message: 'El nombre del padre debe tener al menos 3 caracteres.' }),
    parent_ci: z.number({ message: 'El CI del padre es requerido.' }),
});

export const editPacienteSchema = pacienteSchema.extend({
    id: z.number()
});
