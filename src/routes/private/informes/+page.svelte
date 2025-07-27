<script lang="ts">
    import ActionsModal from '$lib/components/ActionsModal.svelte';
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { 
        createSvelteTable, 
        flexRender, 
        getCoreRowModel,
        type ColumnDef
    } from '@tanstack/svelte-table';
    import dayjs from 'dayjs';

    // Definimos un tipo para los datos que vienen del servidor
    type Informe = {
        id: number;
        patient_name: string;
        patient_lastName: string;
        doctor_name: string;
        specialty_name: string;
        emitted_at: string | Date; // Corregido: 'emmited_at' a 'emitted_at'
    }

    let { data } = $props()
    let searchTerm = $state(data.searchTerm ?? '');
    let isModalOpen = $state(false);
	let selectedItemId : number | null = $state(null);

    // --- Definición de Columnas para los Informes ---
    const columns: ColumnDef<Informe>[] = [
        {
            accessorKey: 'patient_name',
            header: 'Nombre del Paciente',
        },
        {
            accessorKey: 'patient_lastName',
            header: 'Apellido del Paciente',
        },
        {
            accessorKey: 'doctor_name',
            header: 'Doctor',
        },
        {
            accessorKey: 'specialty_name',
            header: 'Especialidad',
        },
        {
            accessorKey: 'emitted_at', // Corregido: 'emmited_at' a 'emitted_at'
            header: 'Fecha de Emisión',
            cell: (info) => dayjs(info.getValue() as string).format('DD/MM/YYYY')
        },
        {
            id: 'actions',
            header: 'Acciones',
            cell: (info) => info.row.original
        }
    ];
    
    const table = $derived(createSvelteTable({
        data: data.informes,
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

    let debounceTimer: ReturnType<typeof setTimeout>;
    function handleSearchInput() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const url = new URL($page.url);
            if (searchTerm) url.searchParams.set('search', searchTerm);
            else url.searchParams.delete('search');
            goto(url, { replaceState: true, keepFocus: true });
        }, 300);
    }

	function openActionsModal(itemId:number) {
		selectedItemId = itemId;
		isModalOpen = true;
	}

	function closeActionsModal() {
		isModalOpen = false;
		selectedItemId = null;
	}

	function handleEdit() {
		if(selectedItemId){
            // A futuro, esta sería la ruta para editar un informe
            goto(`/private/informes/${selectedItemId}/edit`);
        }
		closeActionsModal();
	}
</script>

<!-- Snippet para la celda de acciones, adaptado para 'Informe' -->
{#snippet ActionsCell(informe: Informe)}
    <div class="actions-container">
        <button class="actions-button" onclick={()=>openActionsModal(informe.id)} aria-label={`Acciones para el informe del paciente ${informe.patient_name} ${informe.patient_lastName}`}>
            <!-- Icono de tres puntos -->
            <svg class="button-icon" width="20px" height="15px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#212121"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="1.296"></g><g id="SVGRepo_iconCarrier"> <defs> <style>.cls-1{fill:none;stroke:#212121;stroke-linecap:round;stroke-linejoin:bevel;stroke-width:1.5px;}</style> </defs> <g id="ic-actions-more-1"> <circle class="cls-1" cx="4.19" cy="11.98" r="2"></circle> <circle class="cls-1" cx="12" cy="12.02" r="2"></circle> <circle class="cls-1" cx="19.81" cy="11.98" r="2"></circle> </g> </g></svg>
        </button>
        {#if isModalOpen && selectedItemId === informe.id}
            <ActionsModal onEdit={handleEdit} close={closeActionsModal}>
                <svelte:fragment slot="deleteAction">
                <form
                    method="POST"
                    action="?/delete"
                    use:enhance={() => {
                        closeActionsModal();
                        return async ({ update }) => { await update(); };
                    }}
                >
                    <input type="hidden" name="id" value={selectedItemId} />
                    <button type="submit" class="action-item delete">
                        <span class="icon">🗑️</span>
                        Eliminar
                    </button>
                </form>
                </svelte:fragment>
            </ActionsModal>
        {/if}
    </div>
{/snippet}

<!-- Adaptamos los textos para 'Informes' -->
<h2>Informes Médicos</h2>
<div class="container">
    <div class="content-section">
        <h3>Lista de Informes</h3>
        <p>Gestiona los informes médicos emitidos en el sistema</p>
        <div class="actions-bar">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input 
                    type="text" 
                    placeholder="Buscar informe..."
                    bind:value={searchTerm}
                    oninput={handleSearchInput}
                >
            </div>
            <button class="add-button">
                <!-- A futuro, esta sería la ruta para agregar un nuevo informe -->
                <i class="fas fa-plus"></i> <a href="/private/informes/add">
                    Agregar Informe
                </a>
            </button>
        </div>
        {#if data.informes && data.informes.length > 0}
            <div class="table-scroll-container">
            <table>
                <thead>
                    {#each $table.getHeaderGroups() as headerGroup (headerGroup.id)}
                        <tr>
                            {#each headerGroup.headers as header (header.id)}
                                {@const Header = flexRender(header.column.columnDef.header, header.getContext())}
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
                            {#each row.getVisibleCells() as cell (cell.id)}
                                {@const Cell = flexRender(cell.column.columnDef.cell, cell.getContext())}
                                <td>
                                    {#if cell.column.id === 'actions'}
                                        {@render ActionsCell(cell.row.original)}
                                    {:else}
                                        <Cell />
                                    {/if}
                                </td>
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        {:else}
            <p>No hay informes registrados</p>
        {/if}
    </div>
    <!-- La paginación no necesita cambios -->
    <div class="footer">
		<span>{`página ${$table.getState().pagination.pageIndex + 1} de ${$table.getPageCount()}`}</span>
		<button disabled={!$table.getCanPreviousPage()} onclick={()=>goToPage($table.getState().pagination.pageIndex - 1)} class="prev" aria-label="página anterior">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 6-6 6 6 6" /></svg>
		</button>
		<button disabled={!$table.getCanNextPage()} onclick={() => goToPage($table.getState().pagination.pageIndex + 1)} class="next" aria-label="siguiente página">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 6 6 6-6 6" /></svg>
		</button>
	</div>
</div>

<style>
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
    max-height: 450px;
    overflow-y: auto;
}
.table-scroll-container table {
    width: 100%;
    border-collapse: collapse;
    background-color: transparent; /* El fondo lo pone el contenedor */
    border-radius: 0; /* Las esquinas redondeadas las pone el contenedor */
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
    .fas.fa-plus{
        color: white;
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

</style>