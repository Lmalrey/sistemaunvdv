import { z } from 'zod/v4';

export const diagnosticoSchema = z.object({
    nombre: z.string()
})