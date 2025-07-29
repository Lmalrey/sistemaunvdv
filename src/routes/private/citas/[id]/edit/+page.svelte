<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { appointmentSchema } from '../../add/schema';
	import { zod } from 'sveltekit-superforms/adapters';
    import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { form, enhance, errors, message } = superForm(data.form, {
		validators: zod(appointmentSchema),
		dataType: 'json'
	});
	
	// --- LÓGICA DE CARGA DE HORARIOS (adaptada de 'add') ---
	let availableSlots = $state<string[]>([]);
	let isLoadingSlots = $state(false);
	let patientBookedSlots = $state<Set<string>>(new Set());
	let apiController: AbortController | undefined;

	// Variables para detectar cambios
	let previousDate = $state($form.appointment_date);

	$effect(() => {
		const { doctor_id, appointment_date, patient_id } = $form;
		
		// En 'edit', solo reaccionamos al cambio de fecha
		if (appointment_date !== previousDate) {
			previousDate = appointment_date;

			apiController?.abort();
			apiController = new AbortController();

			$form.appointment_time = ''; // Reiniciar hora al cambiar la fecha
			availableSlots = [];
			patientBookedSlots = new Set();
			
			// Doctor y paciente son fijos, así que podemos usarlos directamente
			if (doctor_id && appointment_date && patient_id) {
				fetchDoctorAvailability(doctor_id, appointment_date, apiController.signal);
				fetchPatientSchedule(patient_id, appointment_date, apiController.signal);
			}
		}
	});

	// Ejecutar la carga inicial de horarios cuando el componente se monta
	$effect(() => {
		const { doctor_id, appointment_date, patient_id } = $form;
		if (doctor_id && appointment_date && patient_id) {
			apiController = new AbortController();
			fetchDoctorAvailability(doctor_id, appointment_date, apiController.signal);
			fetchPatientSchedule(patient_id, appointment_date, apiController.signal);
		}
	});
	
	async function fetchDoctorAvailability(doctorId: string, date: string, signal: AbortSignal) {
		isLoadingSlots = true;
		try {
			// IMPORTANTE: Excluimos la cita actual de la verificación de disponibilidad del doctor
			const response = await fetch(`/api/availability?doctorId=${doctorId}&date=${date}&excludeId=${data.form.id}`, { signal });
			if (signal.aborted) return;
			availableSlots = response.ok ? await response.json() : [];
		} catch (err:any) { if (err.name !== 'AbortError') console.error(err); }
		finally { if (!signal.aborted) isLoadingSlots = false; }
	}

	async function fetchPatientSchedule(patientId: string, date: string, signal: AbortSignal) {
		try {
			// IMPORTANTE: Excluimos la cita actual de la verificación de horarios del paciente
			const response = await fetch(`/api/patient-schedule?patientId=${patientId}&date=${date}&excludeId=${data.form.id}`, { signal });
			if (signal.aborted) return;
			if (response.ok) {
				const result = await response.json();
				patientBookedSlots = new Set(result.bookedTimes);
			}
		} catch (err:any) { if (err.name !== 'AbortError') console.error(err); }
	}
	
	const finalAvailableSlots = $derived(
		availableSlots.filter(slot => !patientBookedSlots.has(slot))
	);
</script>

<div class="appointment-container">
	<div class="header">
		<a href="/private/citas" class="back-link">← Volver</a>
		<h1>Reprogramar Cita</h1>
	</div>

	{#if $message}
		<div class="form-message-error">{$message}</div>
	{/if}

	<form method="POST" use:enhance>
		<div class="form-section">
			<div class="form-grid">
				<div>
					<label for="doctor_id">Doctor (no se puede cambiar)</label>
					<select name="doctor_id" id="doctor_id" bind:value={$form.doctor_id} disabled>
						{#each data.doctors as d} <option value={d.id.toString()}>{d.name} {d.lastName}</option> {/each}
					</select>
				</div>
				<div>
					<label for="patient_id">Paciente (no se puede cambiar)</label>
					<select name="patient_id" id="patient_id" bind:value={$form.patient_id} disabled>
						{#each data.patients as p} <option value={p.id.toString()}>{p.name} {p.lastName}</option> {/each}
					</select>
				</div>
				<div>
					<label for="appointment_date">Nueva Fecha de la Cita</label>
					<input type="date" name="appointment_date" id="appointment_date" bind:value={$form.appointment_date} min={new Date().toISOString().split('T')[0]}/>
					{#if $errors.appointment_date}<span class="error">{$errors.appointment_date}</span>{/if}
				</div>
				<div>
					<label for="appointment_time">Nueva Hora de la Cita</label>
					<select name="appointment_time" id="appointment_time" bind:value={$form.appointment_time} disabled={!$form.appointment_date}>
						<option disabled value="">
							{#if isLoadingSlots}
								Cargando horarios...
							{:else if finalAvailableSlots.length === 0 && $form.appointment_date}
								No hay horarios disponibles
							{:else}
								Seleccionar hora
							{/if}
						</option>
						{#each finalAvailableSlots as slot}
							<option value={slot}>{slot}</option>
						{/each}
					</select>
					{#if $errors.appointment_time}<span class="error">{$errors.appointment_time}</span>{/if}
				</div>

				<div class="full-width">
					<label for="observation">Observación (Opcional)</label>
					<textarea name="observation" id="observation" bind:value={$form.observation}></textarea>
					{#if $errors.observation}<span class="error">{$errors.observation}</span>{/if}
				</div>
			</div>
		</div>

		<div class="submit-container">
			<button type="submit" class="button-primary" disabled={!$form.appointment_time}>
				Guardar Cambios
			</button>
		</div>
	</form>
</div>

<style>
	.appointment-container { max-width: 900px; margin: 2rem auto; font-family: sans-serif; }
	.header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
	.back-link { text-decoration: none; }
	.form-section { background: #f9f9f9; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; border: 1px solid #eee; }
	.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
	.full-width { grid-column: 1 / -1; }
	label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
	input, select, textarea { width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid #ccc; font-size: 1rem; }
	select:disabled { background-color: #f3f4f6; cursor: not-allowed; }
	.error { color: red; font-size: 0.875rem; }
	.submit-container { text-align: right; }
	.button-primary { background-color: #007bff; color: white; border: none; padding: 0.75rem 1.5rem; font-size: 1rem; cursor: pointer; border-radius: 6px; }
	.form-message-error { background-color: #f8d7da; color: #721c24; padding: 1rem; border: 1px solid #f5c6cb; border-radius: 6px; margin-bottom: 1.5rem; }

	/* .status-message {
		display: block;
		font-size: 0.875rem;
		margin-top: 0.5rem;
		font-weight: 500;
	}
	.status-message.checking {
		color: #666;
	}
	.status-message.unavailable {
		color: #e53e3e; Rojo 
	} 
    */

	.button-primary:disabled {
		background-color: #a0aec0; /* Gris */
		cursor: not-allowed;
	}
</style>