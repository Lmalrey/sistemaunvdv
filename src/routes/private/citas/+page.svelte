<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { format } from 'date-fns';
	import { es } from 'date-fns/locale';
	import { createSvelteTable, flexRender, getCoreRowModel, type ColumnDef } from '@tanstack/svelte-table';
	import type { AppointmentEntry } from './$types';

	let { data } = $props();

	// --- INICIO DE LA SOLUCIÓN: SIMPLIFICAR DEFINICIÓN DE COLUMNAS ---
	const columns: ColumnDef<AppointmentEntry>[] = [
		{
			header: 'Paciente',
			accessorKey: 'patientName' // Simplificado, solo necesitamos una clave para acceder
		},
		{
			header: 'Fecha y Hora',
			accessorKey: 'date'
		},
		{
			header: 'Especialidad',
			accessorKey: 'specialtyName'
		},
		{
			header: 'Médico',
			accessorKey: 'doctorName'
		},
		{
			header: 'Estado',
			accessorKey: 'status'
		},
		{
			id: 'actions',
			header: 'Acciones'
			// No necesita 'cell' aquí, lo manejamos en la plantilla
		}
	];
	
	const table = $derived(createSvelteTable({
        data: data.appointments,
        columns,
        pageCount: data.pageCount,
        state: {
            pagination: {
                pageIndex: data.currentPage - 1,
                pageSize: data.pageSize
            }
        },
        manualPagination: true,
        getCoreRowModel: getCoreRowModel(),
    }));

	function goToPage(pageIndex: number) {
        const url = new URL($page.url);
        url.searchParams.set('page', (pageIndex + 1).toString());
        goto(url, { replaceState: true, keepFocus: true, noScroll: true });
    }

	let actionsModalOpenId = $state<bigint | null>(null);
	let statusModalOpenId = $state<bigint | null>(null);

	function openActionsModal(id: bigint) { actionsModalOpenId = id; }
	function closeActionsModal() { actionsModalOpenId = null; }
	function openStatusModal(id: bigint) {
		closeActionsModal();
		statusModalOpenId = id;
	}
	function closeStatusModal() { statusModalOpenId = null; }
	function handleReprogram(id: bigint) { goto(`/private/citas/${id}/edit`); }
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeStatusModal();
			closeActionsModal();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="page-container">
	<header class="page-header">
		<div>
			<h1>Gestión de Citas</h1>
			<p>Administre las citas médicas programadas</p>
		</div>
		<a href="/private/citas/add" class="btn-primary">Nueva Cita</a>
	</header>

	<div class="kpi-grid">
		<div class="kpi-card"><div class="kpi-value">{data.kpis.today}</div><div class="kpi-label">Hoy</div></div>
		<div class="kpi-card"><div class="kpi-value">{data.kpis.thisWeek}</div><div class="kpi-label">Esta Semana</div></div>
		<div class="kpi-card"><div class="kpi-value">{data.kpis.pending}</div><div class="kpi-label">Pendientes</div></div>
		<div class="kpi-card"><div class="kpi-value">{data.kpis.completed}</div><div class="kpi-label">Completadas</div></div>
	</div>

	<div class="table-section">
		<h2>Próximas Citas</h2>
		<div class="table-wrapper">
			<table>
				<thead>
					{#each $table.getHeaderGroups() as headerGroup (headerGroup.id)}
						<tr>
							{#each headerGroup.headers as header (header.id)}
                                {@const Header= flexRender(header.column.columnDef.header, header.getContext())}
								<th>
									<Header />
								</th>
							{/each}
						</tr>
					{/each}
				</thead>
				<tbody>
					{#each $table.getRowModel().rows as row (row.id)}
						<tr>
							<!-- Paciente -->
							<td>
								<div class="cell-main">{row.original.patientName} {row.original.patientLastName}</div>
								<div class="cell-sub">C.I: V-{row.original.patientCi}</div>
								<div class="cell-sub">{row.original.patientPhone}</div>
							</td>
							<!-- Fecha y Hora -->
							<td>
								<div class="cell-main">{format(row.original.date, "EEE, dd MMM yyyy", { locale: es })}</div>
								<div class="cell-sub">{format(row.original.date, "hh:mm a", { locale: es })}</div>
							</td>
							<!-- Especialidad -->
							<td>{row.original.specialtyName}</td>
							<!-- Médico -->
							<td>Dr. {row.original.doctorName} {row.original.doctorLastName}</td>
							<!-- Estado -->
							<td>
								<span class="status-badge {row.original.status.toLowerCase()}">{row.original.status}</span>
							</td>
							<!-- Acciones -->
							<td>
								<div class="actions-cell">
									<button 
									class="actions-btn" 
									onclick={() => openActionsModal(row.original.id)} aria-label="Abrir acciones"
									>⋮</button>
									{#if actionsModalOpenId === row.original.id}
										<div class="actions-modal">
											<button onclick={() => openStatusModal(row.original.id)}>Cambiar estado</button>
											<button onclick={() => handleReprogram(row.original.id)}>Reprogramar</button>
										</div>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<div class="footer">
		<span>
			{`página ${$table.getState().pagination.pageIndex + 1} de ${$table.getPageCount()}`}
		</span>

		<button
			disabled={!$table.getCanPreviousPage()}
			onclick={()=>goToPage($table.getState().pagination.pageIndex - 1)}
			class="prev"
			aria-label="página anterior"
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 6-6 6 6 6" />
			</svg>
		</button>

		<button
			disabled={!$table.getCanNextPage()}
			onclick={() => goToPage($table.getState().pagination.pageIndex + 1)}
			class="next"
			aria-label="siguiente página"
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 6 6 6-6 6" />
			</svg>
		</button>
	</div>
</div>

<!-- Modal para cambiar estado -->
{#if statusModalOpenId !== null}
	{@const appointmentToUpdate = data.appointments.find(a => a.id === statusModalOpenId)}
	<div class="modal-overlay" onclick={closeStatusModal} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') closeStatusModal() }} role="button" tabindex="-1">
		<div class="modal-content" onclick={(event) => event.stopPropagation()}>
			<header class="modal-header">
				<h3>Cambiar Estado de la Cita</h3>
				<button class="close-btn" onclick={closeStatusModal} aria-label="Cerrar modal">×</button>
			</header>
			<p>Paciente: {appointmentToUpdate?.patientName} {appointmentToUpdate?.patientLastName}</p>
			<form method="POST" action="?/updateStatus" use:enhance={() => {
				return async () => {
					closeStatusModal();
					await invalidateAll();
				};
			}}>
				<input type="hidden" name="appointmentId" value={statusModalOpenId} />
				<label for="status-select">Nuevo Estado</label>
				<select name="statusId" id="status-select">
					{#each data.statuses as status}
						<option value={status.id.toString()} selected={status.status === appointmentToUpdate?.status}>{status.status}</option>
					{/each}
				</select>
				<div class="modal-actions">
					<button type="button" class="btn-secondary" onclick={closeStatusModal}>Cancelar</button>
					<button type="submit" class="btn-primary">Guardar Cambios</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	:global(body) {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
	}
	.page-container {
		padding: 2rem;
		background-color: #f8f9fa;
	}
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}
	.page-header h1 {
		font-size: 1.75rem; margin: 0; color: #333;
	}
	.page-header p {
		margin: 0; color: #666;
	}
	.btn-primary {
		background-color: #007bff; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: bold; text-decoration: none; font-size: 0.9rem;
	}
	.kpi-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}
	.kpi-card {
		background-color: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
	}
	.kpi-value {
		font-size: 2.5rem; font-weight: bold; color: #333;
	}
	.kpi-label {
		color: #666;
	}
	.table-section {
		background-color: white; 
		padding: 1.5rem; 
		border-radius: 8px; 
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
	}
	.table-section h2 {
		margin-top: 0; color: #333;
	}
	.table-wrapper {
		overflow-x: auto;
	}
	table {
		width: 100%; border-collapse: collapse;
	}
	th, td {
		padding: 1rem; text-align: left; border-bottom: 1px solid #e9ecef;
	}
	th {
		color: #666; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px;
	}
	 td .cell-main {
		font-weight: 500; color: #333;
	}
	td .cell-sub {
		font-size: 0.875rem; color: #666;
	}
	.status-badge {
		padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: bold; text-transform: capitalize;
	}
	.status-badge.programada { background-color: #e9ecef; color: #495057; }
	.status-badge.confirmada { background-color: #d1e7fd; color: #0c5460; }
	.status-badge.completada { background-color: #cce5ff; color: #004085; }
	.status-badge.cancelada { background-color: #f8d7da; color: #721c24; } 
	.actions-cell {
		position: relative;
	}
	.actions-btn {
		background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666; padding: 0 0.5rem; border-radius: 4px;
	}
	.actions-btn:hover {
		background-color: #f1f1f1;
	}
	.actions-modal {
		position: absolute; right: 0; top: 100%; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); z-index: 10; width: 180px; padding: 0.5rem;
	}
	.actions-modal button {
		display: block; width: 100%; padding: 0.75rem; border: none; background: none; text-align: left; cursor: pointer; border-radius: 4px;
	}
	.actions-modal button:hover {
		background-color: #f8f9fa;
	}
	.modal-overlay {
		position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 100;
	}
	.modal-content {
		background: white; padding: 2rem; border-radius: 8px; width: 100%; max-width: 500px;
	}
	.modal-header {
		display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;
	}
	.modal-header h3 { margin: 0; }
	.close-btn { background: none; border: none; font-size: 2rem; line-height: 1; cursor: pointer; color: #666; }
	.modal-content select { width: 100%; padding: 0.75rem; margin-top: 0.5rem; border-radius: 6px; border: 1px solid #ccc; }
	.modal-actions {
		display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;
	}
	.btn-secondary {
		background-color: #6c757d; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;
	}
	.footer {
		display: flex; justify-content: flex-end; align-items: center; padding-top: 1rem; margin-top: 1rem; border-top: 1px solid #e9ecef;
	}
	.footer span {
		margin-right: 1rem; font-size: 0.9rem; color: #666;
	}
	.footer{
        display: flex;
		gap: var(--space-xs);
		padding: var(--space-s);
		position: sticky;
		left: 0;
        border-top: 1px solid var(--border-color);
		justify-content: flex-end;
    }
    .prev,
	.next {
		background: none;
		border: none;
		padding: var(--space-3xs);

		&:not(:disabled):hover {
			cursor: pointer;
			background-color: var(--color-primary-hover-light);
		}

		& svg {
			width: var(--font-size-md);
			stroke: var(--color-primary);
		}

		&:disabled svg {
			stroke: var(--text-terciary-color);
		}
	}
	h2{
		padding-bottom: 1rem;
	}
</style>