import { z } from 'zod';

export const appointmentSchema = z.object({
	patient_id: z.string().nonempty('Debe seleccionar un paciente'),
	doctor_id: z.string().nonempty('Debe seleccionar un doctor'),
	
	// Campos para que el usuario elija
	appointment_date: z.string().nonempty('Debe seleccionar una fecha'),
	appointment_time: z.string().nonempty('Debe seleccionar una hora'),

	// El estado se establecerá en el servidor, pero podemos incluirlo si fuera necesario
	// status_id: z.string().nonempty('Debe seleccionar un estado'),

	observation: z.string().optional()
});