<script lang="ts">
	import { page } from '$app/stores';

	let { children } = $props();

	// Definimos los elementos del menú. No hay cambios aquí.
	// He añadido una ruta "General" para la página principal de la sección.
	const menuItems = [
		{ href: '/private/configuracion', label: 'General' },
		{ href: '/private/configuracion/diagnostico', label: 'Diagnósticos' },
		{ href: '/private/configuracion/medicamentos', label: 'Medicamentos' },
		{ href: '/private/configuracion/marcas', label: 'Marcas' },
		{ href: '/private/configuracion/unidades_medida', label: 'Unidades' },
		{ href: '/private/configuracion/antecedentes_personales', label: 'Ant. Personales' },
		{ href: '/private/configuracion/antecedentes_familiares', label: 'Ant. Familiares' },
		{ href: '/private/configuracion/backup', label: 'Respaldo' }

	];
</script>

<div class="config-container">
	<!-- La barra de navegación ahora es horizontal -->
	<nav class="tabs-nav">
		{#each menuItems as item}
			{@const isActive = $page.url.pathname === item.href || ($page.url.pathname.startsWith(item.href) && item.href !== '/private/configuracion')}
			<a href={item.href} class:active={isActive}>
				{item.label}
			</a>
		{/each}
	</nav>

	<main class="content">
		<!-- Aquí se renderiza el contenido de cada página (diagnostico, marcas, etc.) -->
		{@render children()}
	</main>
</div>

<style>
	.config-container {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        width: 90%;
	}

	/* Estilos para la barra de navegación horizontal (tabs) */
	.tabs-nav {
		display: flex;
        justify-content: space-between;
		gap: 0.5rem;
		background-color: #ffffff; /* Un color de fondo claro */
		padding: 0.5rem;
		border-radius: 12px;
		margin-bottom: 2rem;
	}

	.tabs-nav a {
		padding: 0.6rem 1.2rem;
		text-decoration: none;
		color: #4a5568; /* Color de texto para pestañas inactivas */
		border-radius: 8px;
		transition: all 0.2s ease-in-out;
		font-weight: 500;
		white-space: nowrap; /* Evita que el texto se parta en dos líneas */
	}

	/* Estilo para la pestaña activa, como en la imagen */
	.tabs-nav a.active {
		background-color: #ffffff;
		color: #007bff; /* Color primario para el texto activo */
		font-weight: 600;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
	}

	.tabs-nav a:not(.active):hover {
		background-color: #e2e8f0; /* Un hover sutil para las inactivas */
	}

	.content {
		padding: 0 1rem; /* Añadimos un poco de padding por si acaso */
	}
</style>