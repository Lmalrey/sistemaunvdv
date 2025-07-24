<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { userEditSchema } from './schema'; // <-- Importamos el esquema unificado
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { form, enhance, errors, message } = superForm(data.form, {
		validators: zod(userEditSchema), // <-- Usamos el esquema unificado
		dataType: 'json'
	});
</script>

<div class="user-container">
	<div class="header">
		<a href="/private/usuarios" class="back-link">← Volver</a>
		<h1>Editando Perfil de {data.role === 'doctor' ? 'Doctor' : 'Secretaria'}</h1>
	</div>

	{#if $message}<div class="form-message-error">{$message}</div>{/if}

	<form method="POST" use:enhance>
		<div class="form-section">
			<h2>Datos de la Cuenta (No editables)</h2>
			<div class="form-grid">
				<div>
					<label for="email">Correo Electrónico</label>
					<input type="email" id="email" value={data.email ?? 'N/A'} disabled />
				</div>
				<div>
					<label for="userType">Tipo de Usuario</label>
					<input type="text" id="userType" value={data.role} disabled class="capitalize" />
				</div>
			</div>
		</div>

		<div class="form-section">
			<h2>Información del Perfil</h2>
			
			<!-- Ahora TypeScript entiende que $form aquí es de tipo doctor -->
			{#if $form.role === 'doctor'}
				<div class="form-grid">
					<div>
						<label for="name">Nombre</label>
						<input type="text" id="name" name="name" bind:value={$form.name} />
						{#if $errors.name}<span class="error">{$errors.name}</span>{/if}
					</div>
					<div>
						<label for="lastName">Apellido</label>
						<input type="text" id="lastName" name="lastName" bind:value={$form.lastName} />
						{#if $errors.lastName}<span class="error">{$errors.lastName}</span>{/if}
					</div>
					<div>
						<label for="matricula">Matrícula</label>
						<input type="number" id="matricula" name="matricula" bind:value={$form.matricula} />
						{#if $errors.matricula}<span class="error">{$errors.matricula}</span>{/if}
					</div>
					<div>
						<label for="colegio_id">ID Colegio</label>
						<input type="number" id="colegio_id" name="colegio_id" bind:value={$form.colegio_id} />
						{#if $errors.colegio_id}<span class="error">{$errors.colegio_id}</span>{/if}
					</div>
					<div>
						<label for="rif">RIF</label>
						<input type="text" id="rif" name="rif" bind:value={$form.rif} />
						{#if $errors.rif}<span class="error">{$errors.rif}</span>{/if}
					</div>
					<div>
						<label for="specialty_id">Especialidad</label>
						<select name="specialty_id" id="specialty_id" bind:value={$form.specialty_id}>
							{#each data.specialties as specialty}
								<option value={specialty.id.toString()}>{specialty.name}</option>
							{/each}
						</select>
						{#if $errors.specialty_id}<span class="error">{$errors.specialty_id}</span>{/if}
					</div>
					<div>
						<label for="phone">Teléfono</label>
						<input type="tel" id="phone" name="phone" bind:value={$form.phone} />
						{#if $errors.phone}<span class="error">{$errors.phone}</span>{/if}
					</div>
					<div class="full-width">
						<label for="logo_url">URL del Logo (Opcional)</label>
						<input type="url" id="logo_url" name="logo_url" bind:value={$form.logo_url} />
						{#if $errors.logo_url}<span class="error">{$errors.logo_url}</span>{/if}
					</div>
				</div>
			{:else if $form.role === 'secretaria'}
				<div class="form-grid">
					<!-- Y aquí entiende que es de tipo secretaria -->
					<div>
						<label for="name">Nombre</label>
						<input type="text" id="name" name="name" bind:value={$form.name} />
						{#if $errors.name}<span class="error">{$errors.name}</span>{/if}
					</div>
					<div>
						<label for="lastName">Apellido</label>
						<input type="text" id="lastName" name="lastName" bind:value={$form.lastName} />
						{#if $errors.lastName}<span class="error">{$errors.lastName}</span>{/if}
					</div>
					<div class="full-width">
						<label for="phone">Teléfono</label>
						<input type="tel" id="phone" name="phone" bind:value={$form.phone} />
						{#if $errors.phone}<span class="error">{$errors.phone}</span>{/if}
					</div>
				</div>
			{/if}
		</div>

		<div class="submit-container">
			<button type="submit" class="button-primary">Guardar Cambios</button>
		</div>
	</form>
</div>

<style>
	.user-container { max-width: 900px; margin: 2rem auto; font-family: sans-serif; }
	.header { 
        display: flex; 
        align-items: center; 
        gap: 1rem; 
        margin-bottom: 1.5rem; 
    }
	.back-link { 
        text-decoration: none; 
    }
	.form-section { 
        background: #f9f9f9; 
        padding: 1.5rem; 
        border-radius: 8px; 
        margin-bottom: 2rem; 
        border: 1px solid #eee; 
    }
	.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
	.full-width { grid-column: 1 / -1; }
	label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
	input, select { width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid #ccc; font-size: 1rem; }
	.error { 
        color: red; 
        font-size: 0.875rem; 
    }
	/* .profile-fields { 
        margin-top: 1.5rem; 
        padding: 1.5rem;
        background: #f9f9f9;
        border-top: 1px solid #eee; 
        border-radius: 8px;
    } */
	.submit-container { text-align: right; }
	.button-primary { 
        background-color: #007bff; 
        color: white; 
        border: none; 
        padding: 0.75rem 1.5rem; 
        font-size: 1rem; 
        cursor: pointer; 
        border-radius: 6px; 
        margin-top: 1rem;
    }

	.button-primary:disabled { 
        background-color: #a0aec0; 
        cursor: not-allowed; 
    }
	.form-message-error { 
        background-color: #f8d7da; 
        color: #721c24; 
        padding: 1rem; 
        border: 1px solid #f5c6cb; 
        border-radius: 6px; 
        margin-bottom: 1.5rem; 
        }
    /* h2{
        margin-bottom: 1rem;
    }
    h3{
        margin-bottom: 1rem;
    } */
	input:disabled {
		background-color: #e9ecef;
		cursor: not-allowed;
		opacity: 0.7;
	}
</style>