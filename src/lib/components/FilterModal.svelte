<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	type Doctor = { id: bigint; name: string; lastName: string };
	type Specialty = { id: bigint; name: string };
	type Status = { id: bigint; status: string };

	let {
		close,
		doctors,
		specialties,
		statuses,
		currentFilters
	}: {
		close: () => void;
		doctors: Doctor[];
		specialties: Specialty[];
		statuses: Status[];
		currentFilters: {
			doctorId: string | null;
			specialtyId: string | null;
			statusId: string | null;
		};
	} = $props();

	// Estado local para los filtros del modal
	let selectedDoctorId = $state(currentFilters.doctorId ?? '');
	let selectedSpecialtyId = $state(currentFilters.specialtyId ?? '');
	let selectedStatusId = $state(currentFilters.statusId ?? '');

	function applyFilters() {
		const url = new URL($page.url);
		
		// Helper para establecer o eliminar parámetros
		const updateParam = (key: string, value: string | null) => {
			if (value) {
				url.searchParams.set(key, value);
			} else {
				url.searchParams.delete(key);
			}
		};

		updateParam('doctorId', selectedDoctorId);
		updateParam('specialtyId', selectedSpecialtyId);
		updateParam('statusId', selectedStatusId);
		url.searchParams.set('page', '1'); // Reiniciar a la página 1 con nuevos filtros

		goto(url, { replaceState: true, keepFocus: true });
		close();
	}
	
	function clearFilters() {
		selectedDoctorId = '';
		selectedSpecialtyId = '';
		selectedStatusId = '';
		applyFilters();
	}
</script>

<div class="modal-overlay" onclick={close} role="dialog" aria-modal="true">
	<div class="modal-content" onclick={(e) => e.stopPropagation()}>
		<header class="modal-header">
			<h3>Filtrar Citas</h3>
			<button class="close-btn" onclick={close} aria-label="Cerrar modal">×</button>
		</header>
		
		<div class="filter-form">
			<label for="filter-doctor">Doctor</label>
			<select id="filter-doctor" bind:value={selectedDoctorId}>
				<option value="">Todos</option>
				{#each doctors as doctor}
					<option value={doctor.id.toString()}>{doctor.name} {doctor.lastName}</option>
				{/each}
			</select>

			<label for="filter-specialty">Especialidad</label>
			<select id="filter-specialty" bind:value={selectedSpecialtyId}>
				<option value="">Todas</option>
				{#each specialties as specialty}
					<option value={specialty.id.toString()}>{specialty.name}</option>
				{/each}
			</select>

			<label for="filter-status">Estado</label>
			<select id="filter-status" bind:value={selectedStatusId}>
				<option value="">Todos</option>
				{#each statuses as status}
					<option value={status.id.toString()}>{status.status}</option>
				{/each}
			</select>
		</div>

		<div class="modal-actions">
			<button type="button" class="btn-secondary" onclick={clearFilters}>Limpiar Filtros</button>
			<button type="button" class="btn-primary" onclick={applyFilters}>Aplicar Filtros</button>
		</div>
	</div>
</div>

<style>
	/* Usaremos los mismos estilos de modal que ya tienes */
	.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 100; }
	.modal-content { background: white; padding: 2rem; border-radius: 8px; width: 100%; max-width: 500px; }
	.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
	.modal-header h3 { margin: 0; }
	.close-btn { background: none; border: none; font-size: 2rem; line-height: 1; cursor: pointer; color: #666; }
	.filter-form { display: flex; flex-direction: column; gap: 1rem; }
	.filter-form label { font-weight: 500; }
	.filter-form select { width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid #ccc; }
	.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
	.btn-primary { background-color: #007bff; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; }
	.btn-secondary { background-color: #6c757d; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; }
</style>