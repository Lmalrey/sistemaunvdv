<script lang="ts">
    import {tick} from 'svelte';

    let {onEdit, close}=$props();

    $effect(()=>{
        const handleKeydown = (event:any) => {
			if (event.key === 'Escape') {
				close();
			}
		};
        const handleClickOutside = (event:any) =>{
            tick().then(() => {
				const dialogNode = document.querySelector('.actions-modal');
				if (dialogNode && !dialogNode.contains(event.target)) {
					close();
				}
			});
		};
        window.addEventListener('keydown', handleKeydown);
		document.addEventListener('mousedown', handleClickOutside);

		// La función de limpieza se ejecuta cuando el componente se destruye,
		// evitando fugas de memoria.
		return () => {
			window.removeEventListener('keydown', handleKeydown);
			document.removeEventListener('mousedown', handleClickOutside);
		};
    })
</script>

<!-- svelte-ignore slot_element_deprecated -->
<div class="actions-modal">
	<button class="action-item" onclick={onEdit}>
		<span class="icon">✎</span>
		Editar
	</button>
	<slot name="deleteAction"/>
</div>

<style>
	.actions-modal {
		position: absolute;
		top: calc(0% - 60px); /* Posición justo debajo del botón que lo activa */
		right: 0;
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		border: 1px solid #eee;
		padding: 8px;
		z-index: 20;
		width: 150px;
		display: flex;
		flex-direction: column;
		gap: 4px;
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

</style>