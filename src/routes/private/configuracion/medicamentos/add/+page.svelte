<script lang="ts">
    import { superForm } from 'sveltekit-superforms/client';

    let { data } = $props();
    const { form, errors, enhance, message } = superForm(data.form);
</script>

<div class="content">
    <div class="header">
        <div class="left">
            <button><a href="/private/configuracion/medicamentos">←</a></button>
        </div>
        <div class="right">
        <h2>Nuevo Medicamento</h2>
        <p>Agregar un nuevo medicamento</p>
        </div>
    </div>
    <div class="form">
        <h3>Información del Medicamento</h3>
        <p>Ingrese el nombre del medicamento</p>
        <form method="POST" use:enhance>

                <label for="name">Nombre del Medicamento</label>
                <input type="text" id="name" name="name" bind:value={$form.name} />
                {#if $errors.name}<span class="invalid">{$errors.name}</span>{/if}
            
                <label for="brand_id">Marca</label>
                <!-- ¡AQUÍ ESTÁ LA LÓGICA CLAVE! -->
                <select id="brand_id" name="brand_id" bind:value={$form.brand_id}>
                    <option value="" disabled selected>Selecciona una marca...</option>
                    {#each data.brands as brand (brand.id)}
                        <!-- CRÍTICO: El `value` es el ID, pero el usuario ve el nombre -->
                        <option value={brand.id}>{brand.name}</option>
                    {/each}
                </select>
                {#if $errors.brand_id}<span class="invalid">{$errors.brand_id}</span>{/if}
            
                <button type="submit">Guardar</button>
        
            {#if $message}<h3 class="message">{$message}</h3>{/if}
        </form>
    </div>
</div>

<style>
    
	.invalid {
		color: red;
	}
    .header {
        display: flex;
        justify-content: start;
        gap: 1rem;
        padding: 1rem;
        max-width: 600px;
        margin: auto;
    }
    .left button{
        background-color: transparent;
        border: none;
        cursor: pointer;
        font-size: 1.5rem;
    }
    a {
        text-decoration: none;
        color: inherit;
        font-weight: bold;
        font-size: 20px;
    }
    h3 {
        text-align: left;
        color: var(--color-grey-900);
        margin: .5rem;
        margin-left: 1rem;
    }
    .message {
        color: var(--color-blue-500);
    }
    .form {
        border: thin solid var(--color-grey-300);
        border-radius: 5px;
        max-width: 600px;
        margin: auto;
    }
    .form form {
        display: flex;
        flex-direction: column;
        padding: 1rem;
    }
    .form label {
        font-weight: bold;
    }
    .form input, .form select {
        padding: 0.5rem;
        border: thin solid var(--color-grey-300);
        border-radius: 5px;
    }
    .form button {
        margin: 1rem 0;
        padding: 0.5rem;
        background-color: var(--color-blue-500);
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
    .form p{
        text-align: left;
        color: var(--color-grey-600);
        margin-left: 1rem;
    }
</style>