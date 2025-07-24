<!-- src/routes/private/recipes/[id]/edit/+page.svelte -->
<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';
	import { page } from '$app/stores';

	let { data }: { data: PageData } = $props();

	const { form, enhance, errors, message } = superForm(data.form, {
		dataType: 'json'
	});

	// Lógica de filtrado (idéntica a la del formulario de 'add')
	let filteredMedicalRecords = $derived(
		$form.patient_id
			? data.medicalRecords.filter((record) => record.patient_id.toString() === $form.patient_id)
			: data.medicalRecords // Mostrar todos si no hay paciente seleccionado al inicio
	);

	let previousPatientId = $state($form.patient_id);
	$effect(() => {
		if ($form.patient_id !== previousPatientId) {
			$form.medical_record_id = '';
			previousPatientId = $form.patient_id;
		}
	});

	function addMedicine() {
		const newMedicine = { medicine_id: '', amount: 0, measurement_unit_id: '', indications: '' };
		$form.medicines = [...$form.medicines, newMedicine];
	}

	function removeMedicine(index: number) {
		$form.medicines.splice(index, 1);
		$form.medicines = $form.medicines;
	}
</script>

<div class="recipe-container">
	<div class="header">
		<a href="/private/recipes" class="back-link">← Volver</a>
		<h1>Editar Receta Médica</h1>
	</div>

	{#if $message}
		<div class="form-message-error">{$message}</div>
	{/if}

	<form method="POST" use:enhance>
		<div class="form-section">
			<h2>Datos de la Receta</h2>
			<div class="form-grid">
				<!-- Los campos se rellenan automáticamente con los datos de 'load' -->
				<div>
					<label for="patient_id">Paciente</label>
					<select name="patient_id" id="patient_id" bind:value={$form.patient_id}>
						<option disabled value="">Seleccionar paciente</option>
						{#each data.patients as p}
							<option value={p.id.toString()}>{p.name} {p.lastName}</option>
						{/each}
					</select>
					{#if $errors.patient_id}<span class="error">{$errors.patient_id}</span>{/if}
				</div>
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
					<label for="tenant_id">Sede</label>
					<select name="tenant_id" id="tenant_id" bind:value={$form.tenant_id}>
						<option disabled value="">Seleccionar sede</option>
						{#each data.tenants as t}
							<option value={t.id.toString()}>{t.name}</option>
						{/each}
					</select>
					{#if $errors.tenant_id}<span class="error">{$errors.tenant_id}</span>{/if}
				</div>
				<div>
					<label for="date">Fecha</label>
					<input type="date" name="date" id="date" bind:value={$form.date} />
					{#if $errors.date}<span class="error">{$errors.date}</span>{/if}
				</div>
				<div class="full-width">
					<label for="medical_record_id">Informe Médico Asociado</label>
					<select
						name="medical_record_id"
						id="medical_record_id"
						bind:value={$form.medical_record_id}
						disabled={!$form.patient_id || filteredMedicalRecords.length === 0}
					>
						<option disabled value="">
							{#if !$form.patient_id}
								Seleccione un paciente primero
							{:else if filteredMedicalRecords.length === 0}
								No hay informes para este paciente
							{:else}
								Seleccionar informe
							{/if}
						</option>
						{#each filteredMedicalRecords as mr}
							<option value={mr.id.toString()}>
								ID: {mr.id} - {mr.description.substring(0, 50)}...
							</option>
						{/each}
					</select>
					{#if $errors.medical_record_id}<span class="error">{$errors.medical_record_id}</span>{/if}
				</div>
			</div>
		</div>

		<div class="form-section">
			<h2>Medicamentos</h2>
			{#each $form.medicines as medicine, i}
				<div class="medicine-entry">
					<h4>Medicamento #{i + 1}</h4>
					<div class="form-grid">
						<div class="full-width">
							<label for="medicine_id_{i}">Medicamento</label>
							<select name="medicines[{i}].medicine_id" id="medicine_id_{i}" bind:value={$form.medicines[i].medicine_id}>
								<option disabled value="">Seleccionar medicamento</option>
								{#each data.medicines as med}
									<option value={med.id.toString()}>{med.name}</option>
								{/each}
							</select>
							{#if $errors.medicines?.[i]?.medicine_id}<span class="error">{$errors.medicines[i].medicine_id}</span>{/if}
						</div>
						<div>
							<label for="amount_{i}">Cantidad</label>
							<input type="number" name="medicines[{i}].amount" id="amount_{i}" bind:value={$form.medicines[i].amount}/>
							{#if $errors.medicines?.[i]?.amount}<span class="error">{$errors.medicines[i].amount}</span>{/if}
						</div>
						<div>
							<label for="unit_id_{i}">Unidad</label>
							<select name="medicines[{i}].measurement_unit_id" id="unit_id_{i}" bind:value={$form.medicines[i].measurement_unit_id}>
								<option disabled value="">Seleccionar unidad</option>
								{#each data.measurementUnits as unit}
									<option value={unit.id.toString()}>{unit.name} ({unit.unit})</option>
								{/each}
							</select>
							{#if $errors.medicines?.[i]?.measurement_unit_id}<span class="error">{$errors.medicines[i].measurement_unit_id}</span>{/if}
						</div>
						<div class="full-width">
							<label for="indications_{i}">Indicaciones</label>
							<textarea name="medicines[{i}].indications" id="indications_{i}" bind:value={$form.medicines[i].indications}></textarea>
							{#if $errors.medicines?.[i]?.indications}<span class="error">{$errors.medicines[i].indications}</span>{/if}
						</div>
					</div>
					<button type="button" class="remove-btn" onclick={() => removeMedicine(i)}>Eliminar Medicamento</button>
				</div>
			{/each}
			{#if $errors.medicines?._errors}<span class="error full-width">{$errors.medicines._errors}</span>{/if}
			<button type="button" class="add-btn" onclick={addMedicine}>+ Añadir Medicamento</button>
		</div>

		<div class="submit-container">
			<button type="submit" class="button-primary">Guardar Cambios</button>
		</div>
	</form>
</div>

<style>
	.recipe-container { 
        max-width: 900px; 
        margin: 2rem auto; 
        font-family: sans-serif; 
    }
	.header { 
        display: flex; 
        align-items: center; 
        gap: 1rem; 
        margin-bottom: 1.5rem; 
    }
	.back-link { 
        text-decoration: none; 
    }
	.form-section { 
        background: #f9f9f9; 
        padding: 1.5rem; border-radius: 8px; 
        margin-bottom: 2rem; 
        border: 1px solid #eee; }
	.form-grid { 
        display: grid; 
        grid-template-columns: 1fr 1fr; 
        gap: 1rem; }
	.full-width { 
        grid-column: 1 / -1; 
    }
	label { 
        display: block; 
        margin-bottom: 0.5rem; 
        font-weight: 500; 
    }
	input, select, textarea { width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid #ccc; }
	.error { color: red; font-size: 0.875rem; }
	.medicine-entry { border: 1px dashed #ccc; padding: 1rem; margin-bottom: 1rem; border-radius: 6px; position: relative; }
	.medicine-entry h4 { margin-top: 0; }
	.add-btn, .remove-btn { padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; border: 1px solid; }
	.add-btn { background-color: #e0f0ff; border-color: #007bff; color: #007bff; }
	.remove-btn { background-color: #ffe0e0; border-color: #dc3545; color: #dc3545; position: absolute; top: 1rem; right: 1rem; }
	.submit-container { text-align: right; }
	.button-primary { background-color: #007bff; color: white; border: none; padding: 0.75rem 1.5rem; font-size: 1rem; cursor: pointer; border-radius: 6px; }
	.form-message-error { 
        background-color: #f8d7da; 
        color: #721c24; 
        padding: 1rem; 
        border: 1px solid #f5c6cb; 
        border-radius: 6px; 
        margin-bottom: 1.5rem; 
        }
        h2{
            padding-bottom: 2rem;
        }
</style>