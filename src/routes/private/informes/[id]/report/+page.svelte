<script lang="ts">
	import jsPDF from 'jspdf';
	import html2canvas from 'html2canvas';

	let { data } = $props();
	const { record } = data;

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
		pdf.save(`informe-${record.patient_ci}.pdf`);
		
		generatingPDF = false;
	}

	function printReport() {
		window.print();
	}

	const mailtoLink = `mailto:${record.patient_email ?? ''}?subject=Informe Médico de ${record.patient_name} ${record.patient_lastName}&body=Adjunto encontrará un enlace a su informe médico. Para verlo, por favor haga clic aquí: ${window.location.href}`;
</script>

<div class="report-page-container">
	<div class="actions-toolbar" class:hidden={generatingPDF}>
		<a href="/private/informes/{record.id}/show" class="button-secondary">← Volver</a>
		<div class="actions">
			<button class="button-primary" onclick={generatePDF} disabled={generatingPDF}>
				{#if generatingPDF}
					Generando...
				{:else}
					Descargar PDF
				{/if}
			</button>
			<button class="button-primary" onclick={printReport}>Imprimir</button>
			<a href={mailtoLink} class="button-primary">Enviar por Correo</a>
		</div>
	</div>

	<!-- Contenedor del reporte para PDF/Impresión -->
	<div class="report-sheet" bind:this={reportElement}>
		<header class="report-header">
			<div>
				<h2 class="unit-name">UNIDAD DE NEURODIAGNOSTICO VIRGEN DEL VALLE</h2>
				<p>{record.tenant_name}. {record.tenant_address}</p>
				<p>Teléfono: {record.doctor_phone}</p>
				<p>R.I.F.: {record.doctor_rif}</p>
				<p>Email: {record.doctor_email}</p>
			</div>
			<div class="doctor-info">
				<p class="doctor-name">{record.doctor_name} {record.doctor_lastName}</p>
				<p>{record.doctor_specialty}</p>
				<p>MPPS: {record.doctor_mpps}</p>
			</div>
		</header>

		<div class="title-bar">
			<h3>INFORME MÉDICO</h3>
		</div>

		<section class="patient-info">
			<div><strong>Paciente:</strong> {record.patient_name.toUpperCase()} {record.patient_lastName.toUpperCase()}</div>
			<div><strong>C.I.:</strong> {record.patient_ci}</div>
			<div><strong>Edad:</strong> {record.patient_age} años</div>
			<div><strong>Sexo:</strong> {record.patient_gender.charAt(0).toUpperCase()}</div>
			<div><strong>Fecha de Emisión:</strong> {new Date(record.emmited_at).toLocaleDateString()}</div>
			<div><strong>Nro. Informe:</strong> {record.id.toString().padStart(6, '0')}</div>
		</section>

		<section class="report-body">
			<!-- El campo 'description' ahora representa el motivo de la consulta principal -->
			<h4>MOTIVO DE CONSULTA / DESCRIPCIÓN</h4>
			<pre>{record.description}</pre>

			<!-- Solo se muestran los campos del examen físico que están en la BD -->
			<h4>EXAMEN FÍSICO:</h4>
			<p>PESO: {record.weight} KG <br>TALLA: {record.height} CM</p>

			{#if record.personal_background_description || record.personal_questions.some(q => q.answer)}
				<h4>ANTECEDENTES PERSONALES:</h4>
				{#if record.personal_background_description}
					<p>{record.personal_background_description}</p>
				{/if}
				<!-- Filtramos para mostrar solo las preguntas con respuesta 'true' -->
				{@const answeredYesPersonal = record.personal_questions.filter(q => q.answer)}
				{#if answeredYesPersonal.length > 0}
					<ul class="questions-list">
						{#each answeredYesPersonal as item}
							<li>{item.question}</li>
						{/each}
					</ul>
				{/if}
			{/if}

			{#if record.family_background_description || record.family_questions.some(q => q.answer)}
				<h4>ANTECEDENTES FAMILIARES:</h4>
				{#if record.family_background_description}
					<p>{record.family_background_description}</p>
				{/if}
				<!-- Filtramos para mostrar solo las preguntas con respuesta 'true' -->
				{@const answeredYesFamily = record.family_questions.filter(q => q.answer)}
				{#if answeredYesFamily.length > 0}
					<ul class="questions-list">
						{#each answeredYesFamily as item}
							<li>{item.question}</li>
						{/each}
					</ul>
				{/if}
			{/if}

			<!-- Diagnósticos obtenidos de la BD -->
			<h4>DIAGNÓSTICO:</h4>
			<pre>{record.diagnoses_text}</pre>
			
			<!-- Plan de trabajo obtenido de la BD -->
			<h4>Indicaciones</h4>
			<pre>{record.work_plan}</pre>

		</section>
		
		<footer class="report-footer">
			<div class="signature">
				<p>Atentamente,</p>
				<br /><br /><br />
				<hr />
				<p>
					<strong>DR. {record.doctor_name.toUpperCase()} {record.doctor_lastName.toUpperCase()}</strong><br />
					{record.doctor_specialty}
				</p>
			</div>
		</footer>
	</div>
</div>

<style>
	/* Los estilos se mantienen igual que en la respuesta anterior */
	@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

	.report-page-container {
		background-color: #e0e0e0;
		padding: 2rem;
		min-height: 100vh;
	}

	.actions-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 210mm; /* A4 width */
		margin: 0 auto 1.5rem auto;
		background: white;
		padding: 1rem;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}
	.actions-toolbar.hidden {
		display: none;
	}
	.actions-toolbar .actions {
		display: flex;
		gap: 0.75rem;
	}

	.report-sheet {
		width: 210mm;
		min-height: 297mm;
		margin: 0 auto;
		background: white;
		padding: 15mm;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
		font-family: 'Roboto', sans-serif;
		color: #333;
		font-size: 11pt;
	}

	.report-header {
		display: flex;
		justify-content: space-between;
		border-bottom: 2px solid #333;
		padding-bottom: 1rem;
		margin-bottom: 0.5rem;
	}
	.report-header p {
		margin: 0.2rem 0;
		font-size: 9pt;
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
		margin: 1rem 0;
		border-bottom: 1px solid #ccc;
		padding-bottom: 0.5rem;
	}
	.title-bar h3 {
		margin: 0;
		font-weight: 700;
		text-decoration: underline;
	}

	.patient-info {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 0.25rem 2rem;
		margin-bottom: 1.5rem;
		font-size: 10pt;
	}
	.patient-info div:nth-child(even) {
		grid-column-start: 2;
	}

	.report-body h4 {
		margin: 1.5rem 0 0.5rem 0;
		font-weight: 700;
		text-decoration: underline;
		font-size: 11pt;
	}
	.report-body p {
		margin: 0.5rem 0;
		line-height: 1.6;
	}
	.report-body pre {
		white-space: pre-wrap;
		font-family: 'Roboto', sans-serif;
		font-size: 11pt;
		line-height: 1.6;
		margin: 0.5rem 0;
	}

	.report-footer {
		margin-top: 4rem;
		display: flex;
		justify-content: center;
	}
	.signature {
		text-align: center;
	}
	.signature hr {
		border: 0;
		border-top: 1px solid #333;
		width: 250px;
	}
	.signature p {
		margin: 0.2rem 0;
	}

	.button-primary, .button-secondary {
		padding: 0.5rem 1rem;
		border: 1px solid transparent;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		text-decoration: none;
		display: inline-block;
		text-align: center;
		transition: all 0.2s ease-in-out;
		background-color: #007bff;
		color: white;
	}
	.button-secondary {
		background-color: #6c757d;
	}

	/* Estilos para impresión */
	@media print {
		body, .report-page-container {
			background-color: white;
			margin: 0;
			padding: 0;
		}
		.actions-toolbar {
			display: none;
		}
		.report-sheet {
			box-shadow: none;
			width: 100%;
			min-height: auto;
			padding: 0;
			margin: 0;
		}
	}
</style>