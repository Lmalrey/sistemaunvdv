<script lang="ts">
	import StatusCell from '$lib/ui/StatusCell.svelte';
	import {
		createSvelteTable,
		flexRender,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		renderComponent,
		type ColumnDef
	} from '@tanstack/svelte-table';

	type Cliente = {
		nombre: string;
		razon_social: string;
		rif: string;
		estatus: 'activo' | 'inactivo';
	};

	const defaultColumns: ColumnDef<Cliente>[] = [
		{
			accessorKey: 'nombre',
			cell: (info) => info.getValue(),
			header: 'Nombre'
		},
		{
			accessorKey: 'razon_social',
			cell: (info) => info.getValue(),
			header: () => 'Razón Social'
		},
		{
			accessorKey: 'rif',
			header: () => 'Rif'
		},
		{
			accessorKey: 'estatus',
			cell: (info) =>
				renderComponent(StatusCell, {
					text: info.getValue() as string,
					success: info.getValue() === 'activo'
				}),
			header: () => 'Status',
			footer: (info) => info.column.id
		}
	];

	const { data } = $props();

	const table = createSvelteTable<Cliente>({
		columns: defaultColumns,
		data: data.clientes,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel()
	});
</script>

<div class="title-container">
	<h1>Lista</h1>

	<a class="add-client" href="/admin/clientes/register">
		<!-- <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h12m-6-6v12" />
		</svg> -->
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M6 12H18M12 6V18" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
		Añadir cliente
	</a>
</div>

<div class="table-container">
	<div class="header">
		<input
			type="text"
			placeholder="Buscar..."
			onkeyup={(e) => $table.setGlobalFilter(e.currentTarget.value)}
		/>
		<button class="options-button" aria-label="Opciones">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
				<path
					d="M12.15 28.012v-.85c.019-.069.05-.131.063-.2.275-1.788 1.762-3.2 3.506-3.319 1.95-.137 3.6.975 4.137 2.787.069.238.119.488.181.731v.85c-.019.056-.05.106-.056.169-.269 1.65-1.456 2.906-3.081 3.262-.125.025-.25.063-.375.094h-.85c-.056-.019-.113-.05-.169-.056-1.625-.262-2.862-1.419-3.237-3.025-.037-.156-.081-.3-.119-.444zm7.888-24.024v.85c-.019.069-.05.131-.056.2-.281 1.8-1.775 3.206-3.538 3.319-1.944.125-3.588-1-4.119-2.819-.069-.231-.119-.469-.175-.7v-.85c.019-.056.05-.106.063-.162.3-1.625 1.244-2.688 2.819-3.194.206-.069.425-.106.637-.162h.85c.056.019.113.05.169.056 1.631.269 2.863 1.419 3.238 3.025l.113.437zm-.001 11.587v.85c-.019.069-.05.131-.063.2-.281 1.794-1.831 3.238-3.581 3.313-1.969.087-3.637-1.1-4.106-2.931-.05-.194-.094-.387-.137-.581v-.85c.019-.069.05-.131.063-.2.275-1.794 1.831-3.238 3.581-3.319 1.969-.094 3.637 1.1 4.106 2.931.05.2.094.394.137.588z"
				/>
			</svg>
		</button>
	</div>
	<table>
		<thead>
			{#each $table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<tr>
					{#each headerGroup.headers as header (header.id)}
						<th>
							{#if !header.isPlaceholder}
								{@const Header = flexRender(header.column.columnDef.header, header.getContext())}
								<Header />
							{/if}
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
							<Cell />
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
		<!-- <tfoot>
			{#each $table.getFooterGroups() as footerGroup (footerGroup.id)}
				<tr>
					{#each footerGroup.headers as header (header.id)}
						<th>
							{#if !header.isPlaceholder}
								<svelte:component
									this={flexRender(header.column.columnDef.footer, header.getContext())}
								/>
							{/if}
						</th>
					{/each}
				</tr>
			{/each}
		</tfoot> -->
	</table>
	<div class="footer">
		<span>
			{`página ${$table.getState().pagination.pageIndex + 1} de ${$table.getPageCount()}`}
		</span>

		<button
			disabled={!$table.getCanPreviousPage()}
			onclick={$table.previousPage}
			class="prev"
			aria-label="página anterior"
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 6-6 6 6 6" />
			</svg>
		</button>

		<button
			disabled={!$table.getCanNextPage()}
			onclick={$table.nextPage}
			class="next"
			aria-label="siguiente página"
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 6 6 6-6 6" />
			</svg>
		</button>
	</div>
</div>

<style>
	
	.title-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-l);
	}

	h1 {
		font-size: var(--font-size-lg);
	}
	.header,
	.footer {
		display: flex;
		gap: var(--space-xs);
		padding: var(--space-s);
		position: sticky;
		left: 0;
	}

	.footer {
		border-top: 1px solid var(--border-color);
		justify-content: flex-end;
	}

	.options-button {
		background: none;
		border: none;
		border-radius: 50%;
		padding: var(--space-xs);
		aspect-ratio: 1;

		& svg {
			width: var(--font-size-md);
			fill: var(--text-secondary-color);
		}

		&:hover {
			background: var(--color-neutral-hover);
		}
	}

	.table-container {
		overflow-x: auto;
		border: 1px solid var(--border-color);
		border-radius: var(--border-radius);
		box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
	}

	table {
		border-collapse: collapse;
		border-spacing: 0;
		width: 100%;
		font-size: var(--font-size-normal);
	}

	thead {
		border-top: 1px solid var(--border-color);
		border-bottom: 1px solid var(--border-color);
		background: var(--color-neutral-hover);
	}

	td,
	th {
		padding: var(--space-xs) var(--space-s);
		text-align: start;
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

	.add-client {
		border-radius: var(--border-radius);
		display: flex;
		align-items: center;
		background-color: var(--color-primary);
		text-decoration: none;
		color: var(--color-neutral);
		padding: var(--space-3xs) var(--space-2xs);
		transition: background 200ms;

		&:hover {
			background: var(--color-primary-hover);
		}

		& > svg {
			width: calc(var(--font-size-lg) * 1.2);
			stroke: var(--color-neutral);
		}
	}
</style>
