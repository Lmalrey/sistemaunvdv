<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { userSchema } from './schema';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { form, enhance, errors, message } = superForm(data.form, {
		validators: zod(userSchema),
		dataType: 'json'
	});
</script>

<div class="user-container">
	<div class="header">
		<a href="/private/usuarios" class="back-link">← Volver</a>
		<h1>Agregar Nuevo Usuario</h1>
	</div>

	{#if $message}
		<div class="form-message-error">{$message}</div>
	{/if}

	<form method="POST" use:enhance>
		<!-- ... (Sección de Autenticación y Tipo de Usuario sin cambios) ... -->
		<div class="form-section">
			<h2>Datos de Autenticación</h2>
			<div class="form-grid">
				<div>
					<label for="email">Correo Electrónico</label>
					<input type="email" id="email" name="email" bind:value={$form.email} placeholder="correo@ejemplo.com" />
					{#if $errors.email}<span class="error">{$errors.email}</span>{/if}
				</div>
				<div>
					<label for="password">Contraseña</label>
					<input type="password" id="password" name="password" bind:value={$form.password} placeholder="Mínimo 8 caracteres" />
					{#if $errors.password}<span class="error">{$errors.password}</span>{/if}
				</div>
			</div>
		</div>
		<div class="form-section">
			<h2>Tipo de Usuario y Perfil</h2>
			<div>
				<label for="userType">Seleccione el tipo de usuario</label>
				<select name="userType" id="userType" bind:value={$form.userType}>
					<option value="" disabled>-- Tipo --</option>
					<option value="doctor">Doctor</option>
					<option value="secretaria">Secretaria</option>
				</select>
				{#if $errors.userType}<span class="error">{$errors.userType}</span>{/if}
			</div>
		</div>

		<!-- CAMPOS CONDICIONALES PARA DOCTOR -->
		{#if $form.userType === 'doctor'}
			<div class="profile-fields">
				<h3>Perfil del Doctor</h3>
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
							<label for="specialty_id">Especialidad</label>
							<select name="specialty_id" id="specialty_id" bind:value={$form.specialty_id}>
								<option value="" disabled>Seleccionar</option>
								{#each data.specialties as specialty}
									<option value={specialty.id.toString()}>{specialty.name}</option>
								{/each}
							</select>
							{#if $errors.specialty_id}<span class="error">{$errors.specialty_id}</span>{/if}
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
						<label for="phone">Teléfono</label>
						<input type="tel" id="phone" name="phone" bind:value={$form.phone} />
						{#if $errors.phone}<span class="error">{$errors.phone}</span>{/if}
					</div>

					<!-- --- CAMBIO AQUÍ: AÑADIR CAMPO LOGO_URL --- -->
					<div class="full-width">
						<label for="logo_url">URL del Logo (Opcional)</label>
						<input type="url" id="logo_url" name="logo_url" bind:value={$form.logo_url} placeholder="https://ejemplo.com/logo.png" />
						{#if $errors.logo_url}<span class="error">{$errors.logo_url}</span>{/if}
					</div>
				</div>
			</div>
		{/if}

		<!-- CAMPOS CONDICIONALES PARA SECRETARIA (sin cambios) -->
		{#if $form.userType === 'secretaria'}
			<div class="profile-fields">
					<h3>Perfil de la Secretaria</h3>
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
						<div class="full-width">
							<label for="phone">Teléfono</label>
							<input type="tel" id="phone" name="phone" bind:value={$form.phone} />
							{#if $errors.phone}<span class="error">{$errors.phone}</span>{/if}
						</div>
					</div>
				</div>
		{/if}

		<div class="submit-container">
			<button type="submit" class="button-primary" disabled={!$form.userType}>
				Crear Usuario
			</button>
		</div>
	</form>
</div>

<style>
	/* ... (Puedes usar los estilos de tus formularios anteriores) ... */
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
	.profile-fields { 
        margin-top: 1.5rem; 
        padding: 1.5rem;
        background: #f9f9f9;
        border-top: 1px solid #eee; 
        border-radius: 8px;
    }
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
    h2{
        margin-bottom: 1rem;
    }
    h3{
        margin-bottom: 1rem;
    }
</style>