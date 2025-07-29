<script lang="ts">
	import { tick } from 'svelte';
	
	type Option = {
		value: string;
		label: string;
	};

	let {
		options,
		value = $bindable(''),
		placeholder = 'Buscar...'
	}: {
		options: Option[];
		value?: string;
		placeholder?: string;
	} = $props();

	let inputValue = $state('');
	let isOpen = $state(false);
	let activeIndex = $state(-1);
	
	// --- CAMBIO CLAVE: Declarar referencias al DOM con $state ---
	let listboxElement = $state<HTMLUListElement | undefined>(undefined);
	let inputElement = $state<HTMLInputElement | undefined>(undefined);
	// --- FIN DEL CAMBIO ---

	$effect(() => {
		const selectedOption = options.find(opt => opt.value === value);
		inputValue = selectedOption ? selectedOption.label : '';
	});

	const filteredOptions = $derived(
		isOpen ? options.filter(opt => opt.label.toLowerCase().includes(inputValue.toLowerCase())) : []
	);

	function openList() {
		isOpen = true;
	}

	function closeList() {
		isOpen = false;
		activeIndex = -1;
	}

	function selectOption(option: Option) {
		value = option.value;
		inputValue = option.label;
		closeList();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeList();
			return;
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (!isOpen) openList();
			activeIndex = (activeIndex + 1) % filteredOptions.length;
			// El uso de la variable no cambia
			listboxElement?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			if (!isOpen) openList();
			activeIndex = (activeIndex - 1 + filteredOptions.length) % filteredOptions.length;
			listboxElement?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
		} else if (event.key === 'Enter') {
			event.preventDefault();
			if (isOpen && activeIndex >= 0) {
				selectOption(filteredOptions[activeIndex]);
			}
		} else if (event.key === 'Tab') {
			closeList();
		}
	}

	$effect(() => {
		function handleClickOutside(event: MouseEvent) {
			// El uso de la variable no cambia
			if (inputElement?.parentElement && !inputElement.parentElement.contains(event.target as Node)) {
				closeList();
				const selectedOption = options.find(opt => opt.value === value);
				if(inputValue !== (selectedOption?.label ?? '')) {
					inputValue = selectedOption ? selectedOption.label : '';
				}
			}
		}
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<div class="combobox-container">
	<input
		type="text"
		bind:this={inputElement}
		bind:value={inputValue}
		{placeholder}
		onfocus={openList}
		oninput={() => { if (!isOpen) openList(); activeIndex = -1; value = ''; /* Limpiar valor al escribir */ }}
		onkeydown={handleKeydown}
		role="combobox"
		aria-autocomplete="list"
		aria-expanded={isOpen}
		aria-controls="combobox-listbox"
		aria-activedescendant={activeIndex > -1 ? `option-${activeIndex}` : undefined}
	/>
	{#if isOpen && filteredOptions.length > 0}
		<ul bind:this={listboxElement} class="options-list" role="listbox" id="combobox-listbox">
			{#each filteredOptions as option, i}
				<li
					id={`option-${i}`}
					class:active={activeIndex === i}
					role="option"
					aria-selected={activeIndex === i}
					onclick={() => selectOption(option)}
					onmouseenter={() => activeIndex = i}
				>
					{option.label}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.combobox-container {
		position: relative;
		width: 100%;
	}

	input {
		width: 100%;
		padding: 0.75rem;
		border-radius: 6px;
		border: 1px solid #ccc;
		font-size: 1rem;
	}

	.options-list {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		background: white;
		border: 1px solid #ccc;
		border-radius: 6px;
		max-height: 200px;
		overflow-y: auto;
		z-index: 10;
		list-style: none;
		padding: 0;
		margin: 0;
		box-shadow: 0 4px 8px rgba(0,0,0,0.1);
	}

	li {
		padding: 0.75rem;
		cursor: pointer;
		transition: background-color 0.1s;
	}

	li:hover,
	li.active {
		background-color: #e0f0ff;
	}
</style>