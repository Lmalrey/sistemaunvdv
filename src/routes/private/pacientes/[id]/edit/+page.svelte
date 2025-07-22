<script lang="ts">
    import { zod } from 'sveltekit-superforms/adapters';
	import { superForm } from 'sveltekit-superforms';
	// Importamos el schema desde la carpeta de creación
    import { patientFormSchema } from '../../add/schema';

    let { data } = $props();

    let currentStep = $state(1);

    const { form, enhance, errors, message } = superForm(data.form, {
		validators: zod(patientFormSchema),
		dataType: 'json',
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
		<!-- Cambiamos el texto del título -->
		<a href="/private/pacientes" class="back-link">← Volver</a>
		<h1>Editar Información del Paciente</h1>
	</div>

	<!-- La navegación de pasos es idéntica -->
	<div class="stepper-nav">
		<button class:active={currentStep === 1} onclick={() => goToStep(1)}>Datos Personales</button>
		<button class:active={currentStep === 2} onclick={() => goToStep(2)}>Datos de Contacto</button>
		<button class:active={currentStep === 3} onclick={() => goToStep(3)}>Antecedentes</button>
	</div>

	{#if $message}
		<div class="form-message-error">{$message}</div>
	{/if}

	<!-- El formulario es idéntico. `bind:value` funcionará con los datos cargados. -->
	<form method="POST" use:enhance>
		{#if currentStep === 1}
			<div class="form-step">
				<h2>Datos Personales</h2>
				<p class="subtitle">Modifique la información personal del paciente</p>
				<!-- El HTML del paso 1 es el mismo -->
                <div class="form-grid">
					<div>
						<label for="name">Nombre</label>
						<input id="name" type="text" name="name" placeholder="Nombre del paciente" bind:value={$form.name} />
						{#if $errors.name}<span class="error">{$errors.name}</span>{/if}
					</div>
					<div>
						<label for="lastName">Apellido</label>
						<input id="lastName" type="text" name="lastName" placeholder="Apellido del paciente" bind:value={$form.lastName} />
						{#if $errors.lastName}<span class="error">{$errors.lastName}</span>{/if}
					</div>
					<div>
						<label for="ci">Cédula de identidad</label>
						<input id="ci" type="number" name="ci" placeholder="Número de cédula" bind:value={$form.ci} />
						{#if $errors.ci}<span class="error">{$errors.ci}</span>{/if}
					</div>
					<div>
						<label for="birthDate">Fecha de Nacimiento</label>
						<input id="birthDate" type="date" name="birthDate" bind:value={$form.birthDate} />
						{#if $errors.birthDate}<span class="error">{$errors.birthDate}</span>{/if}
					</div>
                    <div>
						<label for="gender_id">Género</label>
						<select id="gender_id" name="gender_id" bind:value={$form.gender_id}>
							<option value="" disabled>Seleccionar género</option>
							{#each data.genders as gender}
								<option value={gender.id}>{gender.gender}</option>
							{/each}
						</select>
						{#if $errors.gender_id}<span class="error">{$errors.gender_id}</span>{/if}
					</div>
				</div>
                <h2 class="section-title">Información del Representante</h2>
                <div class="form-grid">
                    <div>
						<label for="parent_fullname">Nombre Completo del Representante</label>
						<input id="parent_fullname" type="text" name="parent_fullname" placeholder="Nombre completo" bind:value={$form.parent_fullname} />
						{#if $errors.parent_fullname}<span class="error">{$errors.parent_fullname}</span>{/if}
					</div>
					<div>
						<label for="parent_ci">Cédula del Representante</label>
						<input id="parent_ci" type="number" name="parent_ci" placeholder="Cédula del representante" bind:value={$form.parent_ci} />
						{#if $errors.parent_ci}<span class="error">{$errors.parent_ci}</span>{/if}
					</div>
                </div>
			</div>
		{/if}

		{#if currentStep === 2}
			<div class="form-step">
				<h2>Datos de Contacto</h2>
				<p class="subtitle">Modifique la información de ubicación del paciente</p>
				<!-- El HTML del paso 2 es el mismo -->
                <div class="form-grid">
                    <div>
						<label for="phone">Teléfono</label>
						<input id="phone" type="tel" name="phone" placeholder="Número de teléfono" bind:value={$form.phone} />
						{#if $errors.phone}<span class="error">{$errors.phone}</span>{/if}
					</div>
					<div>
						<label for="email">Correo Electrónico</label>
						<input id="email" type="email" name="email" placeholder="Correo electrónico" bind:value={$form.email} />
						{#if $errors.email}<span class="error">{$errors.email}</span>{/if}
					</div>
					<div>
						<label for="state_id">Estado</label>
						<select id="state_id" name="state_id" bind:value={$form.state_id}>
							<option value="" disabled>Seleccionar estado</option>
							{#each data.states as state}
								<option value={state.id}>{state.name}</option>
							{/each}
						</select>
						{#if $errors.state_id}<span class="error">{$errors.state_id}</span>{/if}
					</div>
					<div>
						<label for="province_id">Municipio</label>
						<select id="province_id" name="province_id" bind:value={$form.province_id}>
							<option value="" disabled>Seleccionar municipio</option>
							{#each data.provinces as province}
								<option value={province.id}>{province.name}</option>
							{/each}
						</select>
						{#if $errors.province_id}<span class="error">{$errors.province_id}</span>{/if}
					</div>
                    <div class="full-width">
						<label for="city">Ciudad</label>
						<input id="city" type="text" name="city" placeholder="Ciudad" bind:value={$form.city} />
						{#if $errors.city}<span class="error">{$errors.city}</span>{/if}
					</div>
				</div>
			</div>
		{/if}

		{#if currentStep === 3}
			<div class="form-step">
				<h2>Antecedentes Médicos</h2>
				<p class="subtitle">Modifique los antecedentes médicos del paciente</p>
				<!-- El HTML del paso 3 es el mismo -->
                <div class="antecedentes-section">
                    <label for="personal_description">Descripción de Antecedentes Personales</label>
                    <textarea id="personal_description" name="personal_background.description" bind:value={$form.personal_background.description}
                        placeholder="Describa detalladamente los antecedentes personales del paciente"></textarea>
                    {#if $errors.personal_background?.description}<span class="error">{$errors.personal_background.description}</span>{/if}
                    
                    <h4>Preguntas Personales</h4>
                    <div class="questions-list">
                        {#each $form.personal_background.answers as answer, i}
                            <div class="question">
                                <input type="checkbox" name={`personal_background.answers[${i}].answer`} bind:checked={answer.answer} id={`personal-q-${i}`} />
                                <label for={`personal-q-${i}`}>{answer.question_text}</label>
                                <input type="hidden" name={`personal_background.answers[${i}].question_id`} value={answer.question_id} />
                                <input type="hidden" name={`personal_background.answers[${i}].question_text`} value={answer.question_text} />
                            </div>
                        {/each}
                    </div>
                </div>

                <div class="antecedentes-section">
                    <label for="family_description">Descripción de Antecedentes Familiares</label>
                    <textarea id="family_description" name="family_background.description" bind:value={$form.family_background.description}
                        placeholder="Describa detalladamente los antecedentes familiares del paciente"></textarea>
                    {#if $errors.family_background?.description}<span class="error">{$errors.family_background.description}</span>{/if}

                    <h4>Preguntas Familiares</h4>
                    <div class="questions-list">
                        {#each $form.family_background.answers as answer, i}
                            <div class="question">
                                <input type="checkbox" name={`family_background.answers[${i}].answer`} bind:checked={answer.answer} id={`family-q-${i}`} />
                                <label for={`family-q-${i}`}>{answer.question_text}</label>
                                <input type="hidden" name={`family_background.answers[${i}].question_id`} value={answer.question_id} />
                                <input type="hidden" name={`family_background.answers[${i}].question_text`} value={answer.question_text} />
                            </div>
                        {/each}
                    </div>
                </div>
			</div>
		{/if}

		<!-- Cambiamos el texto del botón de envío -->
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
					<!-- CAMBIO DE TEXTO -->
					<button type="submit" class="button-primary">Actualizar Paciente</button>
				{/if}
			</div>
		</div>
	</form>
</div>

<!-- Copia aquí el mismo bloque <style> que tienes en tu formulario de creación -->
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

    .section-title {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-color);
    }

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
    .antecedentes-section {
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
    }


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