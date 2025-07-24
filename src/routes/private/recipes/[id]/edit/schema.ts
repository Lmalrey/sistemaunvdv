// src/routes/private/recipes/[id]/edit/schema.ts
// (Contenido idéntico al de la ruta 'add')
import { z } from 'zod';

const medicineEntrySchema = z.object({
	medicine_id: z.string().nonempty('Debe seleccionar un medicamento'),
	amount: z.coerce.number().positive('La cantidad debe ser mayor a cero'),
	measurement_unit_id: z.string().nonempty('Debe seleccionar una unidad de medida'),
	indications: z.string().min(5, 'Las indicaciones son muy cortas')
});

export const recipeSchema = z.object({
	patient_id: z.string().nonempty('Debe seleccionar un paciente'),
	doctor_id: z.string().nonempty('Debe seleccionar un doctor'),
	tenant_id: z.string().nonempty('Debe seleccionar una sede'),
	medical_record_id: z.string().nonempty('Debe seleccionar un informe médico asociado'),
	date: z.string().nonempty('La fecha es requerida'),
	medicines: z.array(medicineEntrySchema).min(1, 'Debe agregar al menos un medicamento a la receta')
});