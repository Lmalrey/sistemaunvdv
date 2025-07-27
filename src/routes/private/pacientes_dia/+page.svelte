<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import { format } from 'date-fns';

	let { data }: { data: PageData } = $props();

</script>

<div class="daily-patients-container">
	<div class="header">
		<h1>Pacientes del Día</h1>
		<p>Gestiona las citas programadas para hoy, {format(new Date(), 'dd/MM/yyyy')}.</p>
	</div>

	{#if data.appointments.length > 0}
		<div class="appointments-list">
			{#each data.appointments as appt (appt.id)}
				<div class="appointment-card">
					<div class="card-header">
						<span class="appointment-time">{format(new Date(appt.date), 'HH:mm')}</span>
						<span class="status-badge status-{appt.status.toLowerCase()}">{appt.status}</span>
					</div>
					<div class="card-body">
						<div class="info-section">
							<strong>Paciente:</strong>
							<span>{appt.patientName} {appt.patientLastName}</span>
							<small>C.I: {appt.patientCi || 'N/A'}</small>
						</div>
						<div class="info-section">
							<strong>Doctor:</strong>
							<span>{appt.doctorName} {appt.doctorLastName}</span>
						</div>
						{#if appt.observation}
							<div class="info-section observation">
								<strong>Observación:</strong>
								<p>{appt.observation}</p>
							</div>
						{/if}
					</div>
					<div class="card-footer">
						<form
							method="POST"
							action="?/updateStatus"
							use:enhance={() => {
								// use:enhance invalidará los datos automáticamente tras el éxito,
								// lo que recargará la lista con el nuevo estado.
								return async ({ update }) => {
									await update();
								};
							}}
						>
							<input type="hidden" name="appointment_id" value={appt.id} />
							<label for="status-{appt.id}">Cambiar estado:</label>
							<select
								name="status_id"
								id="status-{appt.id}"
								onchange={(e) => e.currentTarget.form?.requestSubmit()}
							>
								{#each data.allStatuses as status}
									<option value={status.id.toString()} selected={status.id === appt.statusId}>
										{status.status}
									</option>
								{/each}
							</select>
						</form>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="no-appointments-message">
			<p>No hay citas programadas para el día de hoy.</p>
		</div>
	{/if}
</div>

<style>
	.daily-patients-container {
		max-width: 1200px;
		margin: 2rem auto;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	}
	.header {
		margin-bottom: 2rem;
		border-bottom: 1px solid #e0e0e0;
		padding-bottom: 1rem;
	}
	.header h1 {
		font-size: 2rem;
		font-weight: 600;
		color: #333;
	}
	.header p {
		font-size: 1.1rem;
		color: #666;
	}
	.appointments-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.5rem;
	}
	.appointment-card {
		background-color: #ffffff;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		border: 1px solid #e0e0e0;
		display: flex;
		flex-direction: column;
	}
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		background-color: #f8f9fa;
		border-bottom: 1px solid #e0e0e0;
	}
	.appointment-time {
		font-size: 1.25rem;
		font-weight: 600;
		color: #007bff;
	}
	.status-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: 500;
		color: white;
	}
	.status-programada { background-color: #17a2b8; }
	.status-confirmada { background-color: #28a745; }
	.status-completada { background-color: #6c757d; }
	.status-cancelada { background-color: #dc3545; }
	.card-body {
		padding: 1.5rem;
		flex-grow: 1;
	}
	.info-section {
		display: flex;
		flex-direction: column;
		margin-bottom: 1rem;
	}
	.info-section strong {
		font-weight: 500;
		color: #555;
		margin-bottom: 0.25rem;
	}
	.info-section small {
		color: #777;
		font-size: 0.9rem;
	}
    .info-section.observation p {
        margin: 0;
        font-style: italic;
        color: #444;
    }
	.card-footer {
		padding: 1rem 1.5rem;
		background-color: #f8f9fa;
		border-top: 1px solid #e0e0e0;
	}
	.card-footer form {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.card-footer label {
		font-weight: 500;
		color: #333;
	}
	.card-footer select {
		padding: 0.5rem;
		border-radius: 6px;
		border: 1px solid #ccc;
		font-size: 1rem;
		flex-grow: 1;
	}
	.no-appointments-message {
		text-align: center;
		padding: 3rem;
		background-color: #f8f9fa;
		border-radius: 8px;
	}
</style>