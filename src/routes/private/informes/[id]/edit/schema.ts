// src/routes/private/informes/[id]/edit/schema.ts (CORREGIDO)
import { z } from 'zod';

export const medicalRecordSchema = z.object({
  // Campos para medical_record
  patient_id: z.string().nonempty('Debe seleccionar un paciente'),
  doctor_id: z.string().nonempty('Debe seleccionar un doctor'),
  tenant_id: z.string().nonempty('Debe seleccionar una sede'),
  emmited_at: z.string().nonempty('La fecha de emisión es requerida'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  work_plan: z.string().min(10, 'El plan de trabajo debe tener al menos 10 caracteres'),

  // Campos para physical_exam
  weight: z.coerce.number().positive('El peso debe ser un número positivo'),
  height: z.coerce.number().positive('La altura debe ser un número positivo'),
  cephalic_perimeter: z.coerce.number().positive('El perímetro cefálico debe ser un número positivo'),
  heard_rate: z.coerce.number().positive('La frecuencia cardíaca debe ser un número positivo'),
  breathing_rate: z.coerce.number().positive('La frecuencia respiratoria debe ser un número positivo'),
  blood_pressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, 'Formato de presión inválido (ej: 120/80)'),
  date: z.string().nonempty('La fecha del examen es requerida'),

  // Campos para medical_record_diagnosis
  diagnosis_ids: z.array(z.string()).min(1, 'Debe seleccionar al menos un diagnóstico')
});