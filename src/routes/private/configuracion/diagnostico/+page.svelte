<script lang="ts">
    let {data} = $props()
    	import ActionsModal from '$lib/components/ActionsModal.svelte';

	// $state es la nueva "runa" para crear estado reactivo en Svelte 5.
	let isModalOpen = $state(false);

	// Este podría ser el ID del diagnóstico que quieres editar/eliminar.
	let selectedItemId = $state(null);

	function openActionsModal(itemId:any) {
		selectedItemId = itemId;
		isModalOpen = true;
	}

	function closeActionsModal() {
		isModalOpen = false;
		selectedItemId = null;
	}

	function handleEdit() {
		console.log('Editar item:', selectedItemId);
		// Aquí iría tu lógica para navegar a la página de edición
		// o abrir otro modal más grande para editar.
		closeActionsModal();
	}

	function handleDelete() {
		if (confirm(`¿Estás seguro de que deseas eliminar el item ${selectedItemId}?`)) {
			console.log('Eliminar item:', selectedItemId);
			// Aquí iría la llamada a tu API para eliminar el diagnóstico.
		}
		closeActionsModal();
	}
</script>

<h2>Configuración del sistema</h2>
<div class="container">
    <div class="content-section">
        <h3>Lista de Medicamentos</h3>
        <p>Gestiona la lista de medicamentos disponibles en el sistema</p>
        <div class="actions-bar">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" placeholder="Buscar diagnósticos...">
            </div>
            <button class="add-button">
                <i class="fas fa-plus"></i> <a href="/private/configuracion/diagnostico/add">
                    Agregar diagnóstico
                </a>
            </button>
        </div>
        {#if data.diagnosticos && data.diagnosticos.length > 0}
            <div class="table-scroll-container">
                <table>
                    <thead>
                        <tr>
                            <td>ID</td>
                            <td>Diagnóstico</td>
                            <td>Acciones</td>
                        </tr>
                    </thead>
                    <tbody>
                        {#each data.diagnosticos as diagnostico}
                        <tr>
                            <td>{diagnostico.id}</td>
                            <td>{diagnostico.name}</td>
                            <td>
                                <div class="actions-container">
                                    <button class="actions-button" onclick={()=>openActionsModal(diagnostico.id)}>
                                        <svg class="button-icon" width="20px" height="15px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#212121"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="1.296"></g><g id="SVGRepo_iconCarrier"> <defs> <style>.cls-1{fill:none;stroke:#212121;stroke-linecap:round;stroke-linejoin:bevel;stroke-width:1.5px;}</style> </defs> <g id="ic-actions-more-1"> <circle class="cls-1" cx="4.19" cy="11.98" r="2"></circle> <circle class="cls-1" cx="12" cy="12.02" r="2"></circle> <circle class="cls-1" cx="19.81" cy="11.98" r="2"></circle> </g> </g></svg>
                                    </button>
                                    {#if isModalOpen && selectedItemId === diagnostico.id}
                                        <ActionsModal
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            close={closeActionsModal}
                                        />
                                    {/if}
                                </div>
                            </td>
                        </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
                
            {:else}
                <p>No hay diagnosticos registrados</p>
        {/if}
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

    thead td {
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

</style>