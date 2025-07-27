<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Desestructuramos `errors` y le damos un alias para cada formulario
	const {
		form: createForm,
		enhance: createEnhance,
		submitting: creating,
		message: createMessage,
		errors: createErrors // <-- Añadido
	} = superForm(data.createForm, { id: 'create', taintedMessage: null });

	const {
		form: restoreForm,
		enhance: restoreEnhance,
		submitting: restoring,
		message: restoreMessage,
		errors: restoreErrors // <-- AÑADIDO AQUÍ
	} = superForm(data.restoreForm, { id: 'restore', taintedMessage: null });
	
	const {
		form: deleteForm,
		enhance: deleteEnhance,
		submitting: deleting,
		message: deleteMessage,
		errors: deleteErrors // <-- Añadido
	} = superForm(data.deleteForm, { id: 'delete', taintedMessage: null });
	
	// ... el resto de tu script se mantiene igual ...
	let isRestoreModalOpen = $state(false);
	let selectedBackupToRestore = $state('');

	function openRestoreModal(filename: string) {
		selectedBackupToRestore = filename;
		$restoreForm.filename = filename;
		$restoreForm.confirmation = '';
		isRestoreModalOpen = true;
	}
</script>

<div class="backup-container">
	<h2>Respaldo y Recuperación de Base de Datos</h2>
	<p>Crea, restaura o elimina respaldos de la base de datos.</p>

	<!-- Mostramos los mensajes de éxito/error de cualquiera de los formularios -->
	{#if $createMessage || $restoreMessage || $deleteMessage}
		<div class="message success">
			{$createMessage || $restoreMessage || $deleteMessage}
		</div>
	{/if}

	<div class="card create-backup">
		<h3>Crear Nuevo Respaldo</h3>
		<p>Esto creará una copia de seguridad completa de la base de datos.</p>
		
		<!-- === FORMULARIO 1: CREAR RESPALDO === -->
		<form method="POST" action="?/create" use:createEnhance>
			<button type="submit" disabled={$creating}>
				{$creating ? 'Creando respaldo...' : 'Iniciar Respaldo'}
			</button>
		</form>
	</div>

	<div class="card backup-list">
		<h3>Respaldos Existentes</h3>
		{#if data.backups.length > 0}
			<table>
				<thead>
					<tr>
						<th>Nombre del Archivo</th>
						<th>Fecha de Creación</th>
						<th>Tamaño (MB)</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody>
					{#each data.backups as backup (backup.name)}
						<tr>
							<td>{backup.name}</td>
							<td>{new Date(backup.createdAt).toLocaleString()}</td>
							<td>{backup.size}</td>
							<td class="actions">
								<a href="/private/configuracion/backup/{backup.name}" class="btn-icon" title="Descargar" download>
									📥
								</a>
								<button class="btn-icon" title="Restaurar" onclick={() => openRestoreModal(backup.name)}>
									🔄
								</button>

								<!-- === FORMULARIO 2: ELIMINAR RESPALDO (dentro del bucle) === -->
								<form
									method="POST"
									action="?/delete"
									use:deleteEnhance
									style="display: inline;"
								>
									<!-- Campo oculto para enviar el nombre del archivo a eliminar -->
									<input type="hidden" name="filename" value={backup.name} />
									<button type="submit" class="btn-icon" title="Eliminar" disabled={$deleting}>
                                        🗑️
                                    </button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<p>No hay respaldos disponibles.</p>
		{/if}
	</div>
</div>

<!-- === MODAL CON FORMULARIO 3: RESTAURAR RESPALDO === -->
{#if isRestoreModalOpen}
	<dialog class="modal-overlay" open onclose={() => (isRestoreModalOpen = false)}>
		<div class="modal-content">
			<h3>⚠️ Confirmación Requerida ⚠️</h3>
			<p>
				Está a punto de <strong>RESTAURAR</strong> la base de datos desde el archivo:
				<strong>{selectedBackupToRestore}</strong>.
			</p>
			<p class="danger-text">
				Esta acción es irreversible y reemplazará todos los datos actuales por los del respaldo.
			</p>

			<!-- El formulario para la acción de restaurar -->
			<form method="POST" action="?/restore" use:restoreEnhance>
				<!-- Campo oculto que ya está vinculado en `openRestoreModal` -->
				<input type="hidden" name="filename" bind:value={$restoreForm.filename} />
				
				<label for="confirmation">
					Para confirmar, escriba exactamente: <strong>CONFIRMAR RESTAURACIÓN</strong>
				</label>
				<!-- Vinculamos directamente al store del formulario de restauración -->
				<input
					type="text"
					id="confirmation"
					name="confirmation"
					bind:value={$restoreForm.confirmation}
					autocomplete="off"
				/>
				{#if $restoreErrors.confirmation}
					<p class="error-message">{$restoreErrors.confirmation}</p>
				{/if}

				<div class="modal-actions">
					<button type="button" class="btn-secondary" onclick={() => (isRestoreModalOpen = false)}>Cancelar</button>
					<button 
						type="submit" 
						class="btn-danger" 
						disabled={$restoreForm.confirmation !== 'CONFIRMAR RESTAURACIÓN' || $restoring}
					>
						{$restoring ? 'Restaurando...' : 'Restaurar Base de Datos'}
					</button>
				</div>
			</form>
		</div>
	</dialog>
{/if}
<style>
	.backup-container { max-width: 1000px; margin: 2rem auto; font-family: sans-serif; }
	.card { background: #f9f9f9; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; }
	table { width: 100%; border-collapse: collapse; }
	th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #ddd; }
	.actions { display: flex; gap: 0.5rem; }
	.btn-icon { background: none; border: none; cursor: pointer; font-size: 1.2rem; padding: 0.25rem; }
	.message { padding: 1rem; border-radius: 6px; margin-bottom: 1rem; }
	.message.success { background-color: #d4edda; color: #155724; }
	/* .message.error { background-color: #f8d7da; color: #721c24; } */
	.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; }
	.modal-content { background: white; padding: 2rem; border-radius: 8px; max-width: 500px; width: 90%; }
	.danger-text { color: #dc3545; font-weight: bold; }
	.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
	.btn-danger { background-color: #dc3545; color: white; /* ... */ }
</style>