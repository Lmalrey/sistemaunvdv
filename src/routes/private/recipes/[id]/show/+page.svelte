<script lang="ts">
	import { page } from '$app/stores';
	let { data } = $props();
	const { recipe, medicines, patient_age } = data;
</script>

<div class="show-container">
	<div class="header">
		<a href="/private/recipes" class="back-link">← Volver al listado</a>
		<h1>Detalle de la Receta Médica</h1>
	</div>

	<div class="card">
		<!-- Datos Generales de la Receta -->
		<section>
			<h2>Datos de la Receta</h2>
			<div class="details-grid">
				<div>
					<span class="label">Paciente</span>
					<span class="value">{recipe.patient_name} {recipe.patient_lastName}</span>
				</div>
				<div>
					<span class="label">Cédula</span>
					<span class="value">{recipe.patient_ci}</span>
				</div>
				<div>
					<span class="label">Edad</span>
					<span class="value">{patient_age} años</span>
				</div>
				<div>
					<span class="label">Doctor</span>
					<span class="value">{recipe.doctor_name} {recipe.doctor_lastName}</span>
				</div>
				<div>
					<span class="label">Sede</span>
					<span class="value">{recipe.tenant_name}</span>
				</div>
				<div>
					<span class="label">Fecha de Emisión</span>
					<span class="value">{new Date(recipe.date).toLocaleDateString()}</span>
				</div>
			</div>
		</section>

		<!-- Lista de Medicamentos -->
		<section>
			<h2>Medicamentos Recetados</h2>
			{#if medicines.length > 0}
				<div class="medicine-list">
					{#each medicines as med, i}
						<div class="medicine-item">
							<div class="medicine-header">
								<span class="medicine-number">{i + 1}</span>
								<h3 class="medicine-name">
									{med.medicine_name}
									{#if med.brand_name}({med.brand_name}){/if}
									<span class="medicine-concentration">
										- {med.amount} {med.measurement_unit}
									</span>
								</h3>
							</div>
							<div class="medicine-indications">
								<span class="label">Indicaciones:</span>
								<p>{med.indications}</p>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p>No hay medicamentos registrados en esta receta.</p>
			{/if}
		</section>
	</div>

	<!-- Botones de Acción -->
	<div class="action-buttons">
		<a href="/private/recipes" class="button-secondary">Volver</a>
		<a href="/private/recipes/{$page.params.id}/report" class="button-primary">Generar Reporte</a>
	</div>
</div>

<style>
	:root {
		--primary-color: #007bff;
		--primary-color-dark: #0056b3;
		--background-color: #f4f7f9;
		--card-background: #ffffff;
		--border-color: #e0e0e0;
		--text-color-primary: #333;
		--text-color-secondary: #666;
		--text-color-light: #ffffff;
	}

	.show-container {
		max-width: 900px;
		margin: 2rem auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
			sans-serif;
	}

	.header {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		margin-bottom: 2rem;
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

	.card {
		background-color: var(--card-background);
		border-radius: 8px;
		border: 1px solid var(--border-color);
		padding: 2.5rem;
	}

	section {
		margin-bottom: 2.5rem;
	}
	section:last-child {
		margin-bottom: 0;
	}

	h2 {
		font-size: 1.4rem;
		color: var(--primary-color);
		margin-top: 0;
		margin-bottom: 1.5rem;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid var(--primary-color);
		display: inline-block;
	}

	.details-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.details-grid > div {
		display: flex;
		flex-direction: column;
	}

	.label {
		font-size: 0.875rem;
		color: var(--text-color-secondary);
		margin-bottom: 0.25rem;
		font-weight: 500;
	}

	.value {
		font-size: 1rem;
		color: var(--text-color-primary);
	}

	.medicine-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.medicine-item {
		border: 1px solid var(--border-color);
		border-radius: 6px;
		padding: 1rem;
	}

	.medicine-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.medicine-number {
		background-color: var(--primary-color);
		color: white;
		border-radius: 50%;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		flex-shrink: 0;
	}

	.medicine-name {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0;
	}

	.medicine-concentration {
		font-weight: normal;
		color: var(--text-color-secondary);
		font-size: 0.9rem;
	}
	
	.medicine-indications p {
		margin: 0;
		padding-left: 31px; /* Alinear con el texto del nombre */
		white-space: pre-wrap;
	}

	.action-buttons {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 2rem;
	}

	.button-primary,
	.button-secondary {
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
</style>