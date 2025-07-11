import { z } from 'zod/v4';

// En tu archivo de esquema (ej: src/routes/.../schema.ts)

export const medicineSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'El nombre es requerido'),
  // CAMBIO CLAVE: de z.number() a z.string()
  brand_id: z.string().min(1, 'Debe seleccionar una marca'), 
});
