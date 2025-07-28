<script lang="ts">
	import { page } from '$app/stores';
	let { data } = $props();
	const { record } = data;
</script>

<div class="show-container">
	<div class="header">
		<a href="/private/informes" class="back-link">← Volver al listado</a>
		<h1>Detalle del Informe Médico</h1>
	</div>

	<div class="report-card">
		<!-- Datos Generales -->
		<section>
			<h2>Datos Generales</h2>
			<div class="details-grid">
				<div>
					<span class="label">Paciente</span>
					<span class="value">{record.patient_name} {record.patient_lastName}</span>
				</div>
				<div>
					<span class="label">Cédula</span>
					<span class="value">{record.patient_ci}</span>
				</div>
				<div>
					<span class="label">Edad</span>
					<span class="value">{record.patient_age} años</span>
				</div>
				<div>
					<span class="label">Doctor</span>
					<span class="value">{record.doctor_name} {record.doctor_lastName}</span>
				</div>
				<div>
					<span class="label">Sede</span>
					<span class="value">{record.tenant_name}</span>
				</div>
				<div>
					<span class="label">Fecha de Emisión</span>
					<span class="value">{new Date(record.emmited_at).toLocaleDateString()}</span>
				</div>
				<div class="full-width">
					<span class="label">Descripción / Motivo de Consulta</span>
					<p class="value-block">{record.description}</p>
				</div>
				<div class="full-width">
					<span class="label">Indicaciones</span>
					<p class="value-block">{record.work_plan}</p>
				</div>
			</div>
		</section>

		<!-- Examen Físico -->
		<section>
			<h2>Examen Físico</h2>
			<div class="details-grid">
				<div>
					<span class="label">Peso</span>
					<span class="value">{record.weight} kg</span>
				</div>
				<div>
					<span class="label">Talla</span>
					<span class="value">{record.height} cm</span>
				</div>
				<div>
					<span class="label">Perímetro Cefálico</span>
					<span class="value">{record.cephalic_perimeter} cm</span>
				</div>
				<div>
					<span class="label">Frec. Cardíaca</span>
					<span class="value">{record.heard_rate} lpm</span>
				</div>
				<div>
					<span class="label">Frec. Respiratoria</span>
					<span class="value">{record.breathing_rate} rpm</span>
				</div>
				<div>
					<span class="label">Presión Arterial</span>
					<span class="value">{record.blood_pressure}</span>
				</div>
				<div>
					<span class="label">Fecha del Examen</span>
					<span class="value">{new Date(record.physical_exam_date).toLocaleDateString()}</span>
				</div>
			</div>
		</section>

		<!-- Diagnósticos -->
		<section>
			<h2>Diagnósticos</h2>
			{#if record.diagnoses.length > 0}
				<ul>
					{#each record.diagnoses as diagnosis}
						<li>{diagnosis.name}</li>
					{/each}
				</ul>
			{:else}
				<p>No se registraron diagnósticos.</p>
			{/if}
		</section>
	</div>

	<!-- Botones de Acción -->
	<div class="action-buttons">
		<a href="/private/informes" class="button-secondary">Volver</a>
		<a href="/private/informes/{$page.params.id}/report" class="button-primary">Generar Reporte</a>
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

	.report-card {
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
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

	.full-width {
		grid-column: 1 / -1;
	}

	.value-block {
		background-color: #f9f9f9;
		padding: 0.75rem;
		border-radius: 4px;
		margin: 0;
		white-space: pre-wrap; /* Para respetar saltos de línea */
	}

	ul {
		list-style: disc;
		padding-left: 20px;
		margin: 0;
	}
	li {
		margin-bottom: 0.5rem;
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