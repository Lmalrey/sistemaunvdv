<script lang="ts">
	import StatCard from '$lib/components/StatCard.svelte';

	// Datos de ejemplo para el dashboard
	const stats = [
		{ title: 'Total Pacientes', value: '2', description: 'Este mes', icon: 'users' },
		{ title: 'Citas Pendientes', value: '0', description: 'Para hoy', icon: 'calendar' },
		{ title: 'Informes Médicos', value: '2', description: 'Generados', icon: 'document' },
		{ title: 'Récipes Emitidos', value: '2', description: 'Este mes', icon: 'link' }
	];

	const upcomingAppointments = [
		{ name: 'José Alcalá', reason: 'Consulta de neurologia', time: '8:00', color: '#3b82f6' },
		{ name: 'Luis Alcalá', reason: 'Terapia de Lenguaje', time: '8:30', color: '#10b981' },
	];

	const currentDate = new Date();
	const formattedDate = new Intl.DateTimeFormat('es-ES', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}).format(currentDate);
</script>

<div class="dashboard-container">
	<!-- Encabezado -->
	<header class="dashboard-header">
		<div>
			<h1>Dashboard</h1>
			<p class="subtitle">{formattedDate}</p>
		</div>
		<div class="user-profile">
			<div class="user-info">
				<span class="user-name">Luis Alcalá</span>
				<span class="user-role">Administrador</span>
			</div>
			<div class="user-avatar">LA</div>
		</div>
	</header>

	<!-- Pestañas de Navegación -->
	<nav class="tabs">
		<button class="tab active">Vista General</button>
		<button class="tab">Pacientes del Día</button>
	</nav>

	<!-- Contenido Principal -->
	<main class="dashboard-content">
		<!-- Tarjetas de Estadísticas -->
		<section class="stats-grid">
			{#each stats as stat}
				<StatCard title={stat.title} value={stat.value} description={stat.description} icon={stat.icon} />
			{/each}
		</section>

		<!-- Gráfico y Próximas Citas -->
		<section class="main-grid">
			<div class="card chart-card">
				<h2>Pacientes Registrados</h2>
				<p class="subtitle">Número de pacientes registrados en los últimos 6 meses</p>
				<div class="chart-placeholder">
					<span>(Gráfico próximamente)</span>
				</div>
			</div>

			<div class="card appointments-card">
				<h2>Próximas Citas</h2>
				<!-- <p class="subtitle">Citas programadas más cercanas</p> -->
				<ul class="appointments-list">
					{#each upcomingAppointments as appt}
						<li>
							<div class="appointment-details">
								<span class="dot" style="background-color: {appt.color};"></span>
								<div>
									<span class="patient-name">{appt.name}</span>
									<span class="appointment-reason">{appt.reason}</span>
								</div>
							</div>
							<div class="appointment-time">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
								<span>{appt.time}</span>
							</div>
						</li>
					{/each}
				</ul>
			</div>
		</section>
	</main>
</div>

<style>
	:global(body) {
		background-color: #f8fafc;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		color: #1e293b;
	}

	.dashboard-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1.5rem;
	}

	h1 {
		font-size: 2.25rem;
		font-weight: 700;
		margin: 0;
		color: #0f172a;
	}

	.subtitle {
		font-size: 1rem;
		color: #64748b;
		margin-top: 0.25rem;
	}

	.user-profile {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.user-info {
		text-align: right;
	}

	.user-name {
		display: block;
		font-weight: 600;
		color: #334155;
	}

	.user-role {
		font-size: 0.875rem;
		color: #64748b;
	}

	.user-avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background-color: #e2e8f0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		color: #475569;
	}

	.tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
	}

	.tab {
		padding: 0.5rem 1rem;
		border: 1px solid #e2e8f0;
		background-color: #ffffff;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tab:hover {
		background-color: #f1f5f9;
	}

	.tab.active {
		background-color: #f1f5f9;
		border-color: #cbd5e1;
		color: #0f172a;
	}

	.card {
		background-color: #ffffff;
		border-radius: 0.75rem;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.06);
		border: 1px solid #e2e8f0;
	}
	
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.main-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 1.5rem;
		align-items: start;
	}

	.chart-card h2, .appointments-card h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.25rem 0;
	}
	
	.chart-placeholder {
		height: 300px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f8fafc;
		border-radius: 0.5rem;
		margin-top: 1rem;
		color: #94a3b8;
	}

	.appointments-list {
		list-style: none;
		padding: 0;
		margin: 1rem 0 0 0;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.appointments-list li {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.appointment-details {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	
	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
	}

	.patient-name {
		display: block;
		font-weight: 500;
		color: #334155;
	}
	
	.appointment-reason {
		font-size: 0.875rem;
		color: #64748b;
	}

	.appointment-time {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #475569;
	}

	/* Responsive */
	@media (max-width: 900px) {
		.main-grid {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 600px) {
		.dashboard-header {
			flex-direction: column;
			gap: 1rem;
		}
		.user-profile {
			align-self: flex-end;
		}
	}
</style>