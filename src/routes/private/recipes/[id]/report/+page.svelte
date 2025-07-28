<script lang="ts">
	import jsPDF from 'jspdf';
	import html2canvas from 'html2canvas';

	let { data } = $props();
	const { recipe, medicines, patient_age } = data;

	let reportElement: HTMLElement;
	let generatingPDF = $state(false);

	async function generatePDF() {
		generatingPDF = true;
		await new Promise((resolve) => setTimeout(resolve, 100));

		const canvas = await html2canvas(reportElement, { scale: 2 });
		const imgData = canvas.toDataURL('image/png');
		
		const pdf = new jsPDF('p', 'mm', 'a4');
		const pdfWidth = pdf.internal.pageSize.getWidth();
		const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
		
		pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
		pdf.save(`recipe-${recipe.id}.pdf`);
		
		generatingPDF = false;
	}

	function printReport() {
		window.print();
	}

</script>

<div class="report-page-container">
	<div class="actions-toolbar" class:hidden={generatingPDF}>
		<a href="/private/recipes" class="button-secondary">← Volver</a>
		<div class="actions">
			<button class="button-primary" onclick={generatePDF} disabled={generatingPDF}>
				{#if generatingPDF} Generando... {:else} Descargar PDF {/if}
			</button>
			<button class="button-primary" onclick={printReport}>Imprimir</button>
		</div>
	</div>

	<!-- Contenedor del reporte con diseño secuencial -->
	<div class="report-sheet" bind:this={reportElement}>
		<header class="report-header">
			<div>
				<h2 class="unit-name">UNIDAD DE NEURODIAGNOSTICO VIRGEN DEL VALLE</h2>
				<p>{recipe.tenant_name}. {recipe.tenant_address}</p>
				<p>Teléfono: {recipe.doctor_phone}</p>
				<p>R.I.F.: {recipe.doctor_rif}</p>
			</div>
			<div class="doctor-info">
				<p class="doctor-name">{recipe.doctor_name} {recipe.doctor_lastName}</p>
				<p>{recipe.doctor_specialty}</p>
				<p>MPPS: {recipe.doctor_mpps}</p>
			</div>
		</header>
		
		<div class="title-bar">
			<h3>RÉCIPE MÉDICO</h3>
		</div>

		<section class="patient-info">
			<div><strong>Paciente:</strong> {recipe.patient_name.toUpperCase()} {recipe.patient_lastName.toUpperCase()}</div>
			<div><strong>C.I.:</strong> {recipe.patient_ci}</div>
			<div><strong>Edad:</strong> {patient_age} años</div>
			<div><strong>Fecha:</strong> {new Date(recipe.date).toLocaleDateString()}</div>
		</section>

		<!-- --- NUEVO DISEÑO SECUENCIAL PARA MEDICAMENTOS --- -->
		<section class="medicines-section">
			{#each medicines as med, i}
				<div class="medicine-item">
					<div class="medicine-name">
						<span>{i + 1}.</span>
						<strong>
							{med.medicine_name.toUpperCase()} {med.brand_name ? med.brand_name.toUpperCase() : ''}
						</strong>
						<span>({med.amount} {med.unit})</span>
					</div>
					<div class="medicine-indications">
						<pre>{med.indications}</pre>
					</div>
				</div>
			{/each}
		</section>
		<!-- ------------------------------------------------- -->

		<footer class="report-footer">
			<div class="signature">
				<!-- Espacio para la firma del doctor -->
			</div>
		</footer>
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;700&family=Roboto:wght@400;700&display=swap');

	.report-page-container {
		background-color: #e0e0e0;
		padding: 2rem;
		min-height: 100vh;
	}

	.actions-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 210mm;
		margin: 0 auto 1.5rem auto;
		background: white;
		padding: 1rem;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}
	.actions-toolbar.hidden {
		display: none;
	}
	.actions {
		display: flex;
		gap: 0.75rem;
	}

	.report-sheet {
		width: 210mm;
		min-height: 297mm;
		margin: 0 auto;
		background: white;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
		font-family: 'Roboto', sans-serif;
		color: #333;
		font-size: 11pt;
		padding: 15mm;
		display: flex;
		flex-direction: column;
	}

	.report-header {
		display: flex;
		justify-content: space-between;
		font-size: 9pt;
		line-height: 1.4;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #ccc;
	}
	.report-header p {
		margin: 0;
	}
	.unit-name {
		font-weight: 700;
		font-size: 12pt;
		margin: 0 0 0.5rem 0;
	}
	.doctor-info {
		text-align: right;
	}
	.doctor-name {
		font-weight: 700;
		font-size: 11pt;
	}

	.title-bar {
		text-align: center;
		margin-bottom: 1.5rem;
	}
	.title-bar h3 {
		font-size: 16pt;
		margin: 0;
		font-family: 'Roboto Slab', serif;
		font-weight: 700;
	}

	.patient-info {
		display: grid;
		grid-template-columns: 3fr 1fr;
		gap: 0.25rem 2rem;
		margin-bottom: 2rem;
		font-size: 11pt;
		padding-bottom: 1rem;
		border-bottom: 1px solid #eee;
	}

	.medicines-section {
		flex-grow: 1; /* Ocupa el espacio restante */
	}

	.medicine-item {
		margin-bottom: 1.5rem;
	}

	.medicine-name {
		font-size: 12pt;
		margin-bottom: 0.5rem;
		display: flex;
		align-items: baseline;
		gap: 0.5em;
	}
	.medicine-name span:last-child {
		font-size: 10pt;
		color: #555;
	}

	.medicine-indications {
		padding-left: 2em;
		border-left: 2px solid #f0f0f0;
	}
	.medicine-indications pre {
		margin: 0;
		white-space: pre-wrap; /* Respeta saltos de línea y espacios */
		font-family: 'Roboto', sans-serif;
		font-size: 11pt;
		line-height: 1.6;
	}

	.report-footer {
		margin-top: auto; /* Empuja el pie de página hacia abajo */
		padding-top: 2rem;
		display: flex;
		justify-content: flex-end;
	}
	.signature {
		width: 250px;
		border-top: 1px solid #333;
		padding-top: 0.5rem;
		text-align: center;
	}

	.button-primary, .button-secondary {
		padding: 0.5rem 1rem; border: 1px solid transparent; border-radius: 6px;
		cursor: pointer; font-size: 0.9rem; font-weight: 500; text-decoration: none;
		display: inline-block; text-align: center; transition: all 0.2s ease-in-out;
		background-color: #007bff; color: white;
	}
	.button-secondary { background-color: #6c757d; }

	@media print {
		body, .report-page-container { background-color: white; margin: 0; padding: 0; }
		.actions-toolbar { display: none; }
		.report-sheet { box-shadow: none; width: 100%; min-height: auto; padding: 0; margin: 0; }
	}
</style>