import { z } from 'zod/v4';

// Esquema base que solo contiene los campos de datos, sin el ID.
// Es ideal para la creación de nuevos registros.
export const marcaSchema = z.object({
    nombre: z.string({ message: 'El nombre es requerido.' })
        .min(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
});

// Esquema para la edición, que extiende el base y AÑADE el ID como requerido.
export const editMarcaSchema = marcaSchema.extend({
    id: z.number()
});