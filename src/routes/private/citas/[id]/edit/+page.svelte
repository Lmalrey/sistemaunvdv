<!-- src/routes/private/citas/[id]/edit/+page.svelte -->
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

    function generateTimeSlots() {
		const slots = [];
		const startTime = new Date('1970-01-01T08:00:00');
		const endTime = new Date('1970-01-01T17:00:00');
		let current = new Date(startTime);
		while (current < endTime) {
			slots.push(current.toTimeString().substring(0, 5));
			current.setMinutes(current.getMinutes() + 30);
		}
		return slots;
	}
	const timeSlots = generateTimeSlots();

	// Lógica para carga dinámica de horarios (idéntica a la de 'add')
	let availableSlots = $state<string[]>([]);
	let isLoadingSlots = $state(false);
	let isSlotUnavailable = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout>;
	let controller: AbortController;

	$effect(() => {
		const { doctor_id, appointment_date, appointment_time } = $form;
		isSlotUnavailable = false;
		
		clearTimeout(debounceTimer);
		if (controller) controller.abort();

		if (doctor_id && appointment_date && appointment_time) {
			debounceTimer = setTimeout(() => {
				controller = new AbortController();
				checkAvailability(doctor_id, appointment_date, appointment_time, controller.signal);
			}, 500);
		}
	});

	async function checkAvailability(doctorId: string, date: string, time: string, signal: AbortSignal) {
		isCheckingAvailability = true;
		try {
			const response = await fetch(`/api/check-availability?doctorId=${doctorId}&date=${date}&time=${time}`, { signal });
			if (signal.aborted) return;
			if (response.ok) {
				const result = await response.json();
				// Una cita no puede chocar consigo misma
				const originalDate = new Date(data.form.appointment_date + 'T' + data.form.appointment_time);
				const newDate = new Date(date + 'T' + time);
				if (originalDate.getTime() === newDate.getTime()) {
					isSlotUnavailable = false;
				} else {
					isSlotUnavailable = !result.isAvailable;
				}
			}
		} catch (err: any) {
			if (err.name !== 'AbortError') console.error('Error al verificar horario:', err);
		} finally {
			if (!signal.aborted) isCheckingAvailability = false;
		}
	}
	let isCheckingAvailability = $state(false);

	function selectTime(slot: string) {
		$form.appointment_time = slot;
	}
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
						{#each data.doctors as d}
							<option value={d.id.toString()}>{d.name} {d.lastName}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="patient_id">Paciente (no se puede cambiar)</label>
					<select name="patient_id" id="patient_id" bind:value={$form.patient_id} disabled>
						{#each data.patients as p}
							<option value={p.id.toString()}>{p.name} {p.lastName}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="appointment_date">Nueva Fecha de la Cita</label>
					<input type="date" name="appointment_date" id="appointment_date" bind:value={$form.appointment_date} min={new Date().toISOString().split('T')[0]}/>
					{#if $errors.appointment_date}<span class="error">{$errors.appointment_date}</span>{/if}
				</div>
				<div class="full-width">
					<p>Nueva Hora de la Cita</p>
					<div class="time-slots-grid">
						<select 
						name="appointment_time" 
						id="appointment_time" 
						bind:value={$form.appointment_time}
						disabled={!$form.doctor_id || !$form.appointment_date}
					>
						<option disabled value="">
							{#if !$form.doctor_id || !$form.appointment_date}
								Seleccione doctor y fecha
							{:else}
								Seleccionar hora
							{/if}
						</option>
						{#each timeSlots as slot}
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
		</div>

		<div class="submit-container">
			<button type="submit" class="button-primary" disabled={isSlotUnavailable}>
				{#if isSlotUnavailable}Horario no disponible{:else}Guardar Cambios{/if}
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