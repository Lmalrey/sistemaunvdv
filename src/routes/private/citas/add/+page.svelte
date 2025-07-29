<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { appointmentSchema } from './schema';
	import { zod } from 'sveltekit-superforms/adapters';
	import type { PageData } from './$types';
	import ComboBox from '$lib/components/ComboBox.svelte';

	let { data }: { data: PageData } = $props();

	const { form, enhance, errors, message } = superForm(data.form, {
		validators: zod(appointmentSchema),
		dataType: 'json'
	});

	// --- ESTADOS PARA LA LÓGICA DE DISPONIBILIDAD ---
	let doctorAvailableSlots = $state<string[]>([]);
	let patientBookedSlots = $state<Set<string>>(new Set());
	let isLoadingSlots = $state(false);
	
	// --- NUEVO ESTADO PARA PACIENTES OCUPADOS POR DOCTOR/DÍA ---
	let dailyBookedPatientIds = $state<Set<string>>(new Set());
	
	let apiController: AbortController | undefined;

	let previousDoctorId = $state($form.doctor_id);
	let previousPatientId = $state($form.patient_id);
	let previousDate = $state($form.appointment_date);

	// --- ÚNICO $effect MEJORADO PARA GESTIONAR TODO ---
	$effect(() => {
		const { doctor_id, appointment_date, patient_id } = $form;
		
		const doctorOrDateChanged = doctor_id !== previousDoctorId || appointment_date !== previousDate;
		const patientOrDateChanged = patient_id !== previousPatientId || (appointment_date !== previousDate && patient_id);
		
		if (doctorOrDateChanged || patientOrDateChanged) {
			apiController?.abort();
			apiController = new AbortController();
		}

		// Lógica que se dispara si cambia el DOCTOR o la FECHA
		if (doctorOrDateChanged) {
			previousDoctorId = doctor_id;
			previousDate = appointment_date;
			
			// Reiniciar todo lo que depende de esta combinación
			$form.appointment_time = '';
			$form.patient_id = '';
			doctorAvailableSlots = [];
			dailyBookedPatientIds = new Set();
			
			if (doctor_id && appointment_date) {
				// Cargar horarios libres del doctor
				fetchDoctorAvailability(doctor_id, appointment_date, apiController.signal);
				// Cargar pacientes que ya tienen cita con este doctor este día
				fetchDailyBookedPatients(doctor_id, appointment_date, apiController.signal);
			}
		}

		// Lógica que se dispara si cambia el PACIENTE (o la fecha mientras hay un paciente seleccionado)
		if (patientOrDateChanged) {
			if (patient_id !== previousPatientId) {
				previousPatientId = patient_id;
				$form.appointment_time = ''; 
			}
			previousDate = appointment_date;

			patientBookedSlots = new Set();
			if (patient_id && appointment_date) {
				// Cargar horarios ocupados por el paciente con OTROS doctores
				fetchPatientSchedule(patient_id, appointment_date, apiController.signal);
			}
		}
	});

	async function fetchDoctorAvailability(doctorId: string, date: string, signal: AbortSignal) {
		isLoadingSlots = true;
		try {
			const response = await fetch(`/api/availability?doctorId=${doctorId}&date=${date}`, { signal });
			if (signal.aborted) return;
			doctorAvailableSlots = response.ok ? await response.json() : [];
		} catch (err:any) { if (err.name !== 'AbortError') console.error(err); }
		finally { if (!signal.aborted) isLoadingSlots = false; }
	}
	
	// NUEVA función para obtener pacientes ocupados por doctor/día
	async function fetchDailyBookedPatients(doctorId: string, date: string, signal: AbortSignal) {
		try {
			const response = await fetch(`/api/booked-patients?doctorId=${doctorId}&date=${date}`, { signal });
			if (signal.aborted) return;
			if (response.ok) {
				const result = await response.json();
				dailyBookedPatientIds = new Set(result.bookedPatientIds);
			}
		} catch (err:any) { if (err.name !== 'AbortError') console.error(err); }
	}

	async function fetchPatientSchedule(patientId: string, date: string, signal: AbortSignal) {
		try {
			const response = await fetch(`/api/patient-schedule?patientId=${patientId}&date=${date}`, { signal });
			if (signal.aborted) return;
			if (response.ok) {
				const result = await response.json();
				patientBookedSlots = new Set(result.bookedTimes);
			}
		} catch (err:any) { if (err.name !== 'AbortError') console.error(err); }
	}

	const finalAvailableSlots = $derived(
		doctorAvailableSlots.filter(slot => !patientBookedSlots.has(slot))
	);
	
	// --- LISTA DE PACIENTES FILTRADA PARA EL COMBOBOX ---
	const availablePatientsOptions = $derived(
		data.patients
			// Filtramos los pacientes cuyo ID está en la lista de "ocupados para ese día"
			.filter(p => !dailyBookedPatientIds.has(p.id.toString()))
			.map(p => ({
				value: p.id.toString(),
				label: `${p.name} ${p.lastName} (CI: ${p.ci})`
			}))
	);
</script>



<div class="appointment-container">
	<div class="header">
		<a href="/private/citas" class="back-link">← Volver</a>
		<h1>Programar Nueva Cita</h1>
	</div>

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
					<input
						type="date"
						name="appointment_date"
						id="appointment_date"
						bind:value={$form.appointment_date}
						min={new Date().toISOString().split('T')[0]}
					/>
					{#if $errors.appointment_date}<span class="error">{$errors.appointment_date}</span>{/if}
				</div>
				<div>
					<label for="patient_id">Paciente</label>
					<ComboBox
						options={availablePatientsOptions}
						bind:value={$form.patient_id}
						placeholder="Buscar y seleccionar paciente..."
					/>
					{#if $errors.patient_id}<span class="error">{$errors.patient_id}</span>{/if}
				</div>
				
				<div>
					<label for="appointment_time">Hora de la Cita</label>
					<select name="appointment_time" id="appointment_time" bind:value={$form.appointment_time} disabled={!$form.doctor_id || !$form.appointment_date || !$form.patient_id}>
						<option disabled value="">
							{#if !$form.doctor_id || !$form.appointment_date || !$form.patient_id}
								Seleccione doctor, fecha y paciente
							{:else if isLoadingSlots}
								Cargando horarios...
							{:else if finalAvailableSlots.length === 0}
								No hay horarios compatibles
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
					<textarea
						name="observation"
						id="observation"
						bind:value={$form.observation}
						placeholder="Alergias, motivo de la consulta, etc."
					></textarea>
					{#if $errors.observation}<span class="error">{$errors.observation}</span>{/if}
				</div>
			</div>
		</div>

		<div class="submit-container">
			<button 
				type="submit" 
				class="button-primary"
				disabled={!$form.doctor_id || !$form.appointment_date || !$form.appointment_time || !$form.patient_id}
			>
				Programar Cita
			</button>
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
		color: #e53e3e; /* Rojo
	} */

	.button-primary:disabled {
		background-color: #a0aec0; /* Gris */
		cursor: not-allowed;
	}

	/* .patient-search {
		width: 100%;
		padding: 0.75rem;
		margin-bottom: 0.5rem;
		border-radius: 6px;
		border: 1px solid #ccc;
	}
	/* Para que el select parezca un combobox filtrable
	select[size] {
		height: auto;
		min-height: 120px; /* Ajusta según necesites
	} */

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