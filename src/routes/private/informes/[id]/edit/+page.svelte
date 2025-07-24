<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { page } from '$app/stores';

	let { data } = $props();
	let currentStep = $state(1);

	const { form, enhance, errors, message } = superForm(data.form, {
		dataType: 'json'
	});

	function nextStep() {
		if (currentStep < 3) currentStep++;
	}
	function prevStep() {
		if (currentStep > 1) currentStep--;
	}
	function goToStep(step: number) {
		currentStep = step;
	}
</script>

<div class="registration-container">
	<div class="header">
		<!-- El enlace para volver ahora apunta al informe específico -->
		<a href="/private/informes" class="back-link">← Volver</a>
		<h1>Editar Informe Médico</h1>
	</div>

	<!-- El resto del componente es prácticamente idéntico -->

	<div class="stepper-nav">
		<button class:active={currentStep === 1} onclick={() => goToStep(1)}>Datos del Informe</button>
		<button class:active={currentStep === 2} onclick={() => goToStep(2)}>Examen Físico</button>
		<button class:active={currentStep === 3} onclick={() => goToStep(3)}>Diagnósticos</button>
	</div>

	{#if $message}
		<div class="form-message-error">{$message}</div>
	{/if}

	<form method="POST" use:enhance>
		<!-- Paso 1: Datos del Informe -->
		{#if currentStep === 1}
			<div class="form-step">
				<h2>Datos Generales</h2>
				<p class="subtitle">Información principal del informe médico.</p>
				<div class="form-grid">
					<!-- Los campos se rellenan automáticamente gracias a Superforms -->
					<div>
						<label for="patient_id">Paciente</label>
						<select id="patient_id" name="patient_id" bind:value={$form.patient_id}>
							<option value="" disabled>Seleccionar paciente</option>
							{#each data.patients as p}
								<option value={p.id}>{p.name} {p.lastName}</option>
							{/each}
						</select>
						{#if $errors.patient_id}<span class="error">{$errors.patient_id}</span>{/if}
					</div>
					<div>
						<label for="doctor_id">Doctor</label>
						<select id="doctor_id" name="doctor_id" bind:value={$form.doctor_id}>
							<option value="" disabled>Seleccionar doctor</option>
							{#each data.doctors as d}
								<option value={d.id}>{d.name} {d.lastName}</option>
							{/each}
						</select>
						{#if $errors.doctor_id}<span class="error">{$errors.doctor_id}</span>{/if}
					</div>
					<div>
						<label for="tenant_id">Sede</label>
						<select id="tenant_id" name="tenant_id" bind:value={$form.tenant_id}>
							<option value="" disabled>Seleccionar sede</option>
							{#each data.tenants as t}
								<option value={t.id}>{t.name}</option>
							{/each}
						</select>
						{#if $errors.tenant_id}<span class="error">{$errors.tenant_id}</span>{/if}
					</div>
					<div>
						<label for="emmited_at">Fecha de Emisión</label>
						<input id="emmited_at" type="date" name="emmited_at" bind:value={$form.emmited_at} />
						{#if $errors.emmited_at}<span class="error">{$errors.emmited_at}</span>{/if}
					</div>
					<div class="full-width">
						<label for="description">Descripción / Motivo de Consulta</label>
						<textarea id="description" name="description" placeholder="Describa el motivo de la consulta..." bind:value={$form.description}></textarea>
						{#if $errors.description}<span class="error">{$errors.description}</span>{/if}
					</div>
					<div class="full-width">
						<label for="work_plan">Plan de Trabajo</label>
						<textarea id="work_plan" name="work_plan" placeholder="Describa el plan de trabajo a seguir..." bind:value={$form.work_plan}></textarea>
						{#if $errors.work_plan}<span class="error">{$errors.work_plan}</span>{/if}
					</div>
				</div>
			</div>
		{/if}

		<!-- Paso 2: Examen Físico -->
		{#if currentStep === 2}
			<div class="form-step">
				<h2>Examen Físico</h2>
				<p class="subtitle">Registre los signos vitales y medidas del paciente.</p>
				<div class="form-grid">
					<!-- Campos rellenados automáticamente -->
					<div>
						<label for="weight">Peso (kg)</label>
						<input id="weight" type="number" step="0.1" name="weight" bind:value={$form.weight} />
						{#if $errors.weight}<span class="error">{$errors.weight}</span>{/if}
					</div>
					<div>
						<label for="height">Altura (cm)</label>
						<input id="height" type="number" name="height" bind:value={$form.height} />
						{#if $errors.height}<span class="error">{$errors.height}</span>{/if}
					</div>
					<div>
						<label for="cephalic_perimeter">Perímetro Cefálico (cm)</label>
						<input id="cephalic_perimeter" type="number" step="0.1" name="cephalic_perimeter" bind:value={$form.cephalic_perimeter} />
						{#if $errors.cephalic_perimeter}<span class="error">{$errors.cephalic_perimeter}</span>{/if}
					</div>
					<div>
						<label for="heard_rate">Frecuencia Cardíaca (lpm)</label>
						<input id="heard_rate" type="number" name="heard_rate" bind:value={$form.heard_rate} />
						{#if $errors.heard_rate}<span class="error">{$errors.heard_rate}</span>{/if}
					</div>
					<div>
						<label for="breathing_rate">Frecuencia Respiratoria (rpm)</label>
						<input id="breathing_rate" type="number" name="breathing_rate" bind:value={$form.breathing_rate} />
						{#if $errors.breathing_rate}<span class="error">{$errors.breathing_rate}</span>{/if}
					</div>
					<div>
						<label for="blood_pressure">Presión Arterial (ej: 120/80)</label>
						<input id="blood_pressure" type="text" name="blood_pressure" placeholder="120/80" bind:value={$form.blood_pressure} />
						{#if $errors.blood_pressure}<span class="error">{$errors.blood_pressure}</span>{/if}
					</div>
					<div class="full-width">
						<label for="date">Fecha del Examen</label>
						<input id="date" type="date" name="date" bind:value={$form.date} />
						{#if $errors.date}<span class="error">{$errors.date}</span>{/if}
					</div>
				</div>
			</div>
		{/if}

		<!-- Paso 3: Diagnósticos -->
		{#if currentStep === 3}
			<div class="form-step">
				<h2>Diagnósticos</h2>
				<p class="subtitle">Seleccione uno o más diagnósticos de la lista.</p>
				<div>
					<label for="diagnosis_ids">Diagnósticos (selección múltiple)</label>
					<select id="diagnosis_ids" name="diagnosis_ids" multiple bind:value={$form.diagnosis_ids} style="min-height: 250px;">
						{#each data.diagnoses as diagnosis}
							<option value={diagnosis.id}>{diagnosis.name}</option>
						{/each}
					</select>
					<small>Mantén presionado Ctrl (o Cmd en Mac) para seleccionar varios.</small>
					{#if $errors.diagnosis_ids}<span class="error">{$errors.diagnosis_ids}</span>{/if}
				</div>
			</div>
		{/if}

		<!-- Botones de Navegación -->
		<div class="step-navigation">
			<div>
				{#if currentStep > 1}
					<button type="button" class="button-secondary" onclick={prevStep}>Anterior</button>
				{/if}
			</div>
			<div>
				{#if currentStep < 3}
					<button type="button" class="button-primary" onclick={nextStep}>Siguiente</button>
				{/if}
				{#if currentStep === 3}
					<!-- Texto del botón actualizado -->
					<button type="submit" class="button-primary">Guardar Cambios</button>
				{/if}
			</div>
		</div>
	</form>
</div>

<style>
    /* --- VARIABLES DE ESTILO --- */
	:root {
		--primary-color: #007bff;
		--primary-color-dark: #0056b3;
		--background-color: #f4f7f9;
		--card-background: #ffffff;
		--border-color: #e0e0e0;
		--text-color-primary: #333;
		--text-color-secondary: #666;
		--text-color-light: #ffffff;
		--error-color: #dc3545;
	}

	.registration-container {
		background-color: var(--background-color);
		padding: 2rem;
		border-radius: 8px;
		max-width: 1000px;
		margin: 2rem auto;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	}

	.header {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
	}

    .back-link {
        text-decoration: none;
        color: var(--text-color-secondary);
        font-weight: 500;
    }

	h1 {
		font-size: 1.75rem;
		color: var(--text-color-primary);
		font-weight: 600;
        margin: 0;
	}

	/* --- NAVEGACIÓN DE PASOS --- */
	.stepper-nav {
		display: flex;
		gap: 0.5rem;
		border-bottom: 2px solid var(--border-color);
		margin-bottom: 2rem;
	}

	.stepper-nav button {
		padding: 0.75rem 1.5rem;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 500;
		color: var(--text-color-secondary);
		border-bottom: 3px solid transparent;
		transform: translateY(2px);
		transition: all 0.2s ease-in-out;
	}

	.stepper-nav button.active {
		color: var(--primary-color);
		border-bottom-color: var(--primary-color);
	}

	/* --- CONTENIDO DEL PASO DEL FORMULARIO --- */
	.form-step {
		background-color: var(--card-background);
		padding: 2rem;
		border-radius: 8px;
		border: 1px solid var(--border-color);
	}
    
    .form-step h2 {
        font-size: 1.4rem;
        color: var(--text-color-primary);
        margin-top: 0;
        margin-bottom: 0.25rem;
    }

    .subtitle {
        color: var(--text-color-secondary);
        margin-top: 0;
        margin-bottom: 2rem;
    }

    /* .section-title {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-color);
    } */

	/* --- LAYOUT Y CAMPOS --- */
	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}

    .full-width {
        grid-column: 1 / -1;
    }

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: var(--text-color-primary);
	}

	input, select, textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	input:focus, select:focus, textarea:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
	}

    textarea {
        min-height: 120px;
        resize: vertical;
    }

	/* --- SECCIÓN DE ANTECEDENTES --- */
    /* .antecedentes-section {
        margin-top: 2rem;
    }
    .antecedentes-section:first-child {
        margin-top: 0;
    }
    .antecedentes-section h4 {
        margin-top: 1.5rem;
        margin-bottom: 1rem;
    }
    .questions-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
	.question {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
    .question input[type="checkbox"] {
        width: auto;
        height: 1.2em;
        width: 1.2em;
    }
    .question label {
        margin-bottom: 0;
        font-weight: normal;
    } */


	/* --- BOTONES DE NAVEGACIÓN --- */
	.step-navigation {
		display: flex;
		justify-content: space-between;
		margin-top: 2rem;
	}

	.button-primary, .button-secondary{
		padding: 0.75rem 1.5rem;
		border: 1px solid transparent;
		border-radius: 6px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 500;
		text-decoration: none;
		display: inline-block;
		text-align: center;
		transition: all 0.2s ease-in-out;
	}

	.button-primary {
		background-color: var(--primary-color);
		color: var(--text-color-light);
	}
	.button-primary:hover {
		background-color: var(--primary-color-dark);
	}

	.button-secondary {
		background-color: var(--card-background);
		color: var(--text-color-primary);
		border-color: var(--border-color);
	}
    .button-secondary:hover {
        background-color: #f1f1f1;
    }

    /* .button-cancel {
        background-color: transparent;
        color: var(--text-color-secondary);
    }
    .button-cancel:hover {
        background-color: #f1f1f1;
    } */

	/* --- MENSAJES DE ERROR --- */
	.error {
		color: var(--error-color);
		font-size: 0.875rem;
		margin-top: 0.25rem;
	}

    .form-message-error {
        background-color: #f8d7da;
        color: #721c24;
        padding: 1rem;
        border: 1px solid #f5c6cb;
        border-radius: 6px;
        margin-bottom: 1.5rem;
    }
</style>