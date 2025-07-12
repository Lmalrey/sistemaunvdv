<script lang="ts">
    import { superForm } from "sveltekit-superforms";

    let { data } = $props();

    const {form, errors, constraints, message, enhance}=superForm(data.form);
</script>
<div class="Content">
    <div class="header">
        <div class="left">
            <button><a href="/private/configuracion/antecedentes_personales">←</a></button>
        </div>
        <div class="right">
        <h2>Nuevo Antecedente Personal</h2>
        <p>Agregar un nuevo antecedente personal</p>
        </div>
    </div>
    <div class="form">
        <h3>Información del antecedente personal</h3>
        <p>Ingrese el antecedente personal</p>
        <form method="POST" use:enhance>
            <label for="pregunta">Pregunta</label>
            <input type="text" name="pregunta" aria-invalid={$errors.pregunta ? 'true' : undefined}
            bind:value={$form.pregunta}
            {...$constraints.pregunta}/>
    
            {#if $errors.pregunta}
            <span class="invalid">{$errors.pregunta}</span>
            {/if}
    
            <button type="submit">Guardar antecedente</button>
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
        padding: 1rem;
        display: flex;
        flex-direction: column;
    }
    .form label {
        font-weight: bold;
    }
    .form input {
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