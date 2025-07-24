<script lang=ts>
import { superForm } from 'sveltekit-superforms';
	import { appointmentSchema } from './schema';
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

	// --- INICIO: LÓGICA PARA ADVERTENCIA DE HORARIO ---
	let isCheckingAvailability = $state(false);
	let isSlotUnavailable = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout>;
	let controller: AbortController;

	$effect(() => {
		const { doctor_id, appointment_date, appointment_time } = $form;

		// Limpiar el estado de la advertencia cada vez que algo cambia
		isSlotUnavailable = false;
		
		// Cancelar cualquier verificación anterior
		clearTimeout(debounceTimer);
		if (controller) controller.abort();

		// Solo proceder si tenemos los tres datos
		if (doctor_id && appointment_date && appointment_time) {
			// Iniciar un temporizador para no hacer fetch en cada cambio instantáneo
			debounceTimer = setTimeout(() => {
				controller = new AbortController();
				checkAvailability(doctor_id, appointment_date, appointment_time, controller.signal);
			}, 500); // Espera 500ms antes de verificar
		}
	});

	async function checkAvailability(doctorId: string, date: string, time: string, signal: AbortSignal) {
		isCheckingAvailability = true;
		try {
			const response = await fetch(`/api/check-availability?doctorId=${doctorId}&date=${date}&time=${time}`, { signal });
			
			if (signal.aborted) return; // Si se abortó mientras esperábamos, no hacemos nada

			if (response.ok) {
				const result = await response.json();
				isSlotUnavailable = !result.isAvailable;
			}
		} catch (err: any) {
			if (err.name !== 'AbortError') {
				console.error('Error al verificar horario:', err);
			}
		} finally {
			if (!signal.aborted) {
				isCheckingAvailability = false;
			}
		}
	}
	// --- FIN: LÓGICA PARA ADVERTENCIA ---

</script>

<div class="appointment-container">
	<div class="header">
		<a href="/private/citas" class="back-link">← Volver</a>
		<h1>Programar Nueva Cita</h1>
	</div>

	<!-- El mensaje de error del servidor es ahora muy importante -->
	{#if $message}
		<div class="form-message-error">{$message}</div>
	{/if}

	<form method="POST" use:enhance>
		<div class="form-section">
			<div class="form-grid">
				<div>
					<label for="doctor_id">Doctor</label>
					<select name="doctor_id" id="doctor_id" bind:value={$form.doctor_id}>
						<option disabled value="">Seleccionar doctor</option>
						{#each data.doctors as d}
							<option value={d.id.toString()}>{d.name} {d.lastName}</option>
						{/each}
					</select>
					{#if $errors.doctor_id}<span class="error">{$errors.doctor_id}</span>{/if}
				</div>

				<div>
					<label for="appointment_date">Fecha de la Cita</label>
					<input type="date" name="appointment_date" id="appointment_date" bind:value={$form.appointment_date} min={new Date().toISOString().split('T')[0]}/>
					{#if $errors.appointment_date}<span class="error">{$errors.appointment_date}</span>{/if}
				</div>

				<!-- --- INICIO DEL SELECT ESTÁTICO --- -->
				
				<div>
					<label for="appointment_time">Hora de la Cita</label>
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
					
					<!-- MENSAJES DE ESTADO DE DISPONIBILIDAD -->
					{#if isCheckingAvailability}
						<span class="status-message checking">Verificando...</span>
					{:else if isSlotUnavailable}
						<span class="status-message unavailable">⚠️ Horario no disponible</span>
					{/if}
				</div>

				<div>
					<label for="patient_id">Paciente</label>
					<select name="patient_id" id="patient_id" bind:value={$form.patient_id}>
						<option disabled value="">Seleccionar paciente</option>
						{#each data.patients as p}
							<option value={p.id.toString()}>{p.name} {p.lastName} (CI: {p.ci})</option>
						{/each}
					</select>
					{#if $errors.patient_id}<span class="error">{$errors.patient_id}</span>{/if}
				</div>

				<div class="full-width">
					<label for="observation">Observación (Opcional)</label>
					<textarea name="observation" id="observation" bind:value={$form.observation} placeholder="Alergias, motivo de la consulta, etc."></textarea>
					{#if $errors.observation}<span class="error">{$errors.observation}</span>{/if}
				</div>
			</div>
		</div>

		<div class="submit-container">
			<button type="submit" class="button-primary">Programar Cita</button>
		</div>
	</form>
</div>

<style>
	/* ... (Puedes usar los estilos de tus formularios anteriores) ... */
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

	.status-message {
		display: block;
		font-size: 0.875rem;
		margin-top: 0.5rem;
		font-weight: 500;
	}
	.status-message.checking {
		color: #666;
	}
	.status-message.unavailable {
		color: #e53e3e; /* Rojo */
	}

	.button-primary:disabled {
		background-color: #a0aec0; /* Gris */
		cursor: not-allowed;
	}

	/* .time-slots-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
		gap: 0.75rem;
		background-color: #ffffff;
		padding: 1rem;
		border: 1px solid #ccc;
		border-radius: 6px;
	}

	.time-slot-btn {
		padding: 0.75rem 0.5rem;
		border: 1px solid #007bff;
		color: #007bff;
		background-color: #ffffff;
		border-radius: 4px;
		cursor: pointer;
		text-align: center;
		font-size: 1rem;
		transition: all 0.2s ease-in-out;
	}

	.time-slot-btn:hover {
		background-color: #e6f2ff;
	}

	.time-slot-btn.selected {
		background-color: #007bff;
		color: #ffffff;
		font-weight: bold;
	}
	
	.slot-message {
		grid-column: 1 / -1;
		text-align: center;
		color: #666;
		padding: 1rem;
	} */
</style>