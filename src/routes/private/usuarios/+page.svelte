<script lang="ts">
	import ActionsModal from '$lib/components/ActionsModal.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { createSvelteTable, flexRender, getCoreRowModel, type ColumnDef } from '@tanstack/svelte-table';
	import type { DoctorEntry, SecretaryEntry } from './$types';

	type UserEntry = DoctorEntry | SecretaryEntry;

	let { data } = $props();

	// Estado para controlar la pestaña activa
	let activeTab = $state<'doctors' | 'secretaries'>('doctors');

    // --- Estados y lógica de búsqueda ---
	let searchTermDoctors = $state(data.doctors.searchTerm ?? '');
	let searchTermSecretaries = $state(data.secretaries.searchTerm ?? '');
	
	let debounceTimers: { doctors: any; secretaries: any } = { doctors: null, secretaries: null };

	function handleSearchInput(type: 'doctors' | 'secretaries') {
		clearTimeout(debounceTimers[type]);
		debounceTimers[type] = setTimeout(() => {
			const url = new URL($page.url);
			const term = type === 'doctors' ? searchTermDoctors : searchTermSecretaries;

			// Actualizar el parámetro de búsqueda correcto
			if (term) {
				url.searchParams.set(`search_${type}`, term);
			} else {
				url.searchParams.delete(`search_${type}`);
			}
			// Resetear la paginación de la tabla actual al buscar
			url.searchParams.set(`page_${type}`, '1');

			goto(url, { replaceState: true, keepFocus: true });
		}, 300); // 300ms debounce
	}

	// --- Definición de Columnas para Doctores ---
	const columnsDoctors: ColumnDef<DoctorEntry>[] = [
		{ 
            header: 'Nombre Completo', 
            id: 'fullName', 
            accessorFn: (row) => `${row.name} ${row.lastName}` 
        },
		{ 
            header: 'Correo Electrónico', 
            accessorKey: 'email' 
        },
		{ 
            header: 'Teléfono', 
            accessorKey: 'phone' 
        },
		{ 
            header: 'Especialidad', 
            accessorKey: 'specialtyName' 
        },
		{ 
            id: 'actions', 
            header: 'Acciones' 

        }
	];

	// --- Definición de Columnas para Secretarias ---
	const columnsSecretaries: ColumnDef<SecretaryEntry>[] = [
		{ 
            header: 'Nombre Completo', 
            id: 'fullName', 
            accessorFn: (row) => `${row.name} ${row.lastName}` 
        },
		{ 
            header: 'Teléfono', 
            accessorKey: 'phone' 
        },
		{ 
            id: 'actions', 
            header: 'Acciones' 
        }
	];

	// --- Dos instancias de TanStack Table ---
	const tableDoctors = $derived(createSvelteTable({
		data: data.doctors.data,
		columns: columnsDoctors,
		pageCount: data.doctors.pageCount,
		state: { pagination: { pageIndex: data.doctors.currentPage - 1, pageSize: data.pageSize } },
		manualPagination: true,
		getCoreRowModel: getCoreRowModel()
	}));
	
	const tableSecretaries = $derived(createSvelteTable({
		data: data.secretaries.data,
		columns: columnsSecretaries,
		pageCount: data.secretaries.pageCount,
		state: { pagination: { pageIndex: data.secretaries.currentPage - 1, pageSize: data.pageSize } },
		manualPagination: true,
		getCoreRowModel: getCoreRowModel()
	}));

	function goToPage(type: 'doctors' | 'secretaries', pageIndex: number) {
		const url = new URL($page.url);
		url.searchParams.set(`page_${type}`, (pageIndex + 1).toString());
		goto(url, { replaceState: true, keepFocus: true, noScroll: true });
	}
	
	// --- Lógica de Modales (generalizada) ---
	let isModalOpen = $state(false);
	let selectedUser: UserEntry | null = $state(null);
	
	// Referencias a los elementos del DOM
	let actionButtonElements = new Map<bigint, HTMLButtonElement>();
	let modalElement: HTMLDivElement | null = null;


	function openActionsModal(user: UserEntry) {
		selectedUser = user;
		isModalOpen = true;
	}
	function closeActionsModal() {
		isModalOpen = false;
		selectedUser = null;
	}
	function handleEdit() {
		if (selectedUser) {
			const userRolePath = selectedUser.role.toLowerCase();
			goto(`/private/usuarios/${userRolePath}/${selectedUser.id}/edit`);
		}
		closeActionsModal();
	}
	$effect(() => {
		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				closeActionsModal();
			}
		};

		const handleClickOutside = (event: MouseEvent) => {
			if (!selectedUser) return;
			
			const button = actionButtonElements.get(selectedUser.id);
			
			// Cierra si el clic NO fue en el botón de acciones Y NO fue dentro del modal
			if (button && !button.contains(event.target as Node) && modalElement && !modalElement.contains(event.target as Node)) {
				closeActionsModal();
			}
		};

		if (isModalOpen) {
			window.addEventListener('keydown', handleKeydown);
			document.addEventListener('mousedown', handleClickOutside);
		}

		// Función de limpieza: se ejecuta cuando el modal se cierra o el componente se desmonta
		return () => {
			window.removeEventListener('keydown', handleKeydown);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	});
</script>

{#snippet ActionsCell(user: UserEntry)}
	<div class="actions-container">
		<button class="actions-button" onclick={() => openActionsModal(user)} aria-label={`Acciones para ${user.name}`}>⋮</button>
		{#if isModalOpen && selectedUser?.id === user.id}
			<ActionsModal onEdit={handleEdit} {close} />
		{/if}
	</div>
{/snippet}

<h2>Usuarios del Sistema</h2>
<div class="container">
	<div class="content-section">
		<h3>Lista de Usuarios</h3>
		<p>Gestiona los doctores y secretarias registrados en el sistema</p>
		<div class="actions-bar">
			<div></div>
			<a href="/private/usuarios/add" class="add-button">Agregar Usuario</a>
		</div>

		<!-- Pestañas para seleccionar la tabla -->
		<div class="tabs">
			<button class="tab-btn" class:active={activeTab === 'doctors'} onclick={() => activeTab = 'doctors'}>
				Doctores ({data.doctors.data.length})
			</button>
			<button class="tab-btn" class:active={activeTab === 'secretaries'} onclick={() => activeTab = 'secretaries'}>
				Secretarias ({data.secretaries.data.length})
			</button>
		</div>

		<!-- Contenido de las Pestañas -->
		{#if activeTab === 'doctors'}
            <div class="search-box">
				<i class="fas fa-search"></i>
				<input 
                    type="text" 
                    placeholder="Buscar doctor por nombre, email, especialidad..."
                    bind:value={searchTermDoctors}
                    oninput={() => handleSearchInput('doctors')}
                >
			</div>
			<div class="table-scroll-container">
				<table>
					<thead>
						{#each $tableDoctors.getHeaderGroups() as headerGroup (headerGroup.id)}
                        <tr>
                            {#each headerGroup.headers as header (header.id)}
                                {@const Header= flexRender(header.column.columnDef.header, header.getContext())}
									<th>
                                        <Header/>
                                    </th>
								{/each}
							</tr>
						{/each}
					</thead>
					<tbody>
						{#each $tableDoctors.getRowModel().rows as row (row.id)}
							<tr>
								{#each row.getVisibleCells() as cell (cell.id)}
                                    {@const Cell= flexRender(cell.column.columnDef.cell, cell.getContext())}
									<td>
										{#if cell.column.id === 'actions'}
											{@render ActionsCell(cell.row.original)}
										{:else}
                                            <Cell/>
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
            <div class="footer">
                <span>
                    {`Página ${data.doctors.currentPage} de ${data.doctors.pageCount || 1}`}
                </span>
                <button
                    disabled={data.doctors.currentPage <= 1}
                    onclick={()=>goToPage('doctors', data.doctors.currentPage - 2)}
                    class="prev"
                    aria-label="página anterior"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 6-6 6 6 6" />
                    </svg>
                </button>

                <button
                    disabled={data.doctors.currentPage >= data.doctors.pageCount}
                    onclick={() => goToPage('doctors', data.doctors.currentPage)}
                    class="next"
                    aria-label="siguiente página"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 6 6 6-6 6" />
                    </svg>
                </button>
            </div>
		{:else if activeTab === 'secretaries'}
            <div class="search-box">
				<i class="fas fa-search"></i>
				<input 
                    type="text" 
                    placeholder="Buscar secretaria por nombre o teléfono..."
                    bind:value={searchTermSecretaries}
                    oninput={() => handleSearchInput('secretaries')}
                >
			</div>
			<div class="table-scroll-container">
				<table>
					<thead>
						{#each $tableSecretaries.getHeaderGroups() as headerGroup (headerGroup.id)}
                        <tr>
                            {#each headerGroup.headers as header (header.id)}
                                {@const Header= flexRender(header.column.columnDef.header, header.getContext())}
									<th>
                                        <Header/>
                                    </th>
								{/each}
							</tr>
						{/each}
					</thead>
					<tbody>
						{#each $tableSecretaries.getRowModel().rows as row (row.id)}
                        <tr>
                            {#each row.getVisibleCells() as cell (cell.id)}
                                {@const Cell=flexRender(cell.column.columnDef.cell, cell.getContext())}
									<td>
										{#if cell.column.id === 'actions'}
											{@render ActionsCell(cell.row.original)}
										{:else}
                                            <Cell/>
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
            <div class="footer">
                <span>
                    {`Página ${data.secretaries.currentPage} de ${data.secretaries.pageCount || 1}`}
                </span>
                <button
                    disabled={data.secretaries.currentPage <= 1}
                    onclick={()=>goToPage('secretaries', data.secretaries.currentPage - 2)}
                    class="prev"
                    aria-label="página anterior"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 6-6 6 6 6" />
                    </svg>
                </button>

                <button
                    disabled={data.secretaries.currentPage >= data.secretaries.pageCount}
                    onclick={() => goToPage('secretaries', data.secretaries.currentPage)}
                    class="next"
                    aria-label="siguiente página"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 6 6 6-6 6" />
                    </svg>
                </button>
            </div>
		{/if}
	</div>
</div>


<style>
	/* ... (Usa tus estilos anteriores) ... */
	/* .role-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: bold;
		color: white;
	}
	.role-badge.doctor {
		background-color: #007bff;  Azul
	}
	.role-badge.secretaria {
		background-color: #28a745; Verde
	}
	.pagination-btn {
		background: none; border: 1px solid #ccc; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; margin-left: 0.5rem;
	}
	.pagination-btn:disabled { cursor: not-allowed; opacity: 0.5; }
	.pagination-btn:not(:disabled):hover { background-color: #f1f1f1; } */
    h2{
        font-size: 24px;
        color: #333333;
        margin-bottom: 20px;
        font-weight: 600;
    }
    .container{
    background-color: #ffffff;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    width: 100%;
    max-width: 1200px;
    padding: 23px;
    box-sizing: border-box;
    }
    
    .content-section h3 {
    font-size: 20px;
    color: #333333;
    margin-bottom: 5px;
    font-weight: 600;
}

    .content-section p {
    font-size: 14px;
    color: #777777;
    margin-bottom: 20px;
}

    .actions-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
}

    .search-box {
    position: relative;
    width: 300px;
}

    .search-box input {
    width: 100%;
    padding: 10px 10px 10px 40px; /* Left padding for icon */
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 15px;
    color: #333333;
    outline: none;
    transition: border-color 0.3s;
}

.search-box input::placeholder {
    color: #aaaaaa;
}

.search-box input:focus {
    border-color: #007bff;
}

.search-box .fas.fa-search {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #999999;
    font-size: 16px;
}
    a {
    color: #ffffff;
    text-decoration: none;
    }
    .add-button {
    background-color: var(--color-blue-500);
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background-color 0.3s;
    font-weight: 500;
    outline: none;
    }
    .add-button .fas {
    font-size: 14px;
    }

    .add-button:hover {
    background-color: var(--color-blue-900);
    }
    table {
    width: 100%;
    border-collapse: collapse;
    background-color: #ffffff;
    border-radius: 8px;
    overflow: hidden; /* Ensures rounded corners apply to content */
}

    table thead {
    background-color: #f8f9fa;
}

     thead th {
    position: sticky;
    top: 0;
    z-index: 2;
    padding: 15px;
    text-align: left;
    font-size: 14px;
    color: #666666;
    font-weight: 600;
    border-bottom: 1px solid #e0e0e0;
}

    tbody tr {
    border-bottom: 1px solid #eef0f3;
}
    tbody tr:last-child {
    border-bottom: none;
}

    td {
    padding: 15px;
    font-size: 15px;
    color: #333333;
}
.actions-container{
    position: relative;
	display: inline-block;
}
.actions-button{
    background-color: #ffffff;
    border: none;
}
.actions-button:hover {
	background-color: #f0f0f0;
}

.table-scroll-container{
    max-height: 300px;
    overflow-y: auto;
}
.table-scroll-container table {
    width: 100%;
    border-collapse: collapse;
    background-color: transparent; /* El fondo lo pone el contenedor */
    border-radius: 0; /* Las esquinas redondeadas las pone el contenedor */
}
i{
    color: #ffffff;
}
.action-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px;
		border: none;
		background: none;
		width: 100%;
		text-align: left;
		border-radius: 6px;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.action-item:hover {
		background-color: #f5f5f5;
	}

	.action-item .icon {
		font-size: 1.2rem;
	}

	.action-item.delete {
		color: #e53e3e; /* Rojo para la opción de eliminar */
	}

	.action-item.delete:hover {
		background-color: #fed7d7;
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
    .tabs {
		display: flex;
		border-bottom: 2px solid #e0e0e0;
		margin-bottom: 1.5rem;
	}
	.tab-btn {
		padding: 0.75rem 1.5rem;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 500;
		color: #666;
		border-bottom: 3px solid transparent;
		transform: translateY(2px);
	}
	.tab-btn.active {
		color: #007bff;
		border-bottom-color: #007bff;
	}
	.footer { display: flex; justify-content: flex-end; align-items: center; padding-top: 1rem; margin-top: 1rem; border-top: 1px solid #e9ecef; }
	.footer span { margin-right: 1rem; font-size: 0.9rem; color: #666; }
	/* .pagination-btn { background: none; border: 1px solid #ccc; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; margin-left: 0.5rem; }
	.pagination-btn:disabled { cursor: not-allowed; opacity: 0.5; }
	.pagination-btn:not(:disabled):hover { background-color: #f1f1f1;} */

    .search-box {
		margin-bottom: 1.5rem; /* Añadir espacio debajo del buscador */
		width: 100%;
		max-width: 400px;
	}

</style>