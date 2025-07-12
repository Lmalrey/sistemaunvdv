<script lang="ts">
    import { superForm } from "sveltekit-superforms";

    let {data} = $props();

    const { form, errors, enhance, constraints } = superForm(data.form, {
		// Opcional: para una UX mejor, resetea el formulario tras un envío exitoso.
		// En este caso, como redirigimos, no es estrictamente necesario.
		resetForm: false
	});

</script>

<div class="content">
    <div class="header">
        <div class="left">
            <a class="back-button" href="/private/configuracion/antecedentes_personales">←</a>
        </div>
        <div class="right">
        <h2>Editar Antecedente Personal</h2>
        <p>Modificar Información del antecedente personal existente</p>
        </div>
    </div>
    <div class="form">
        <h3>Editar antecedente personal</h3>
        <form method="POST" use:enhance>
            <label for="pregunta">Pregunta</label>
            <input
				type="text"
				id="pregunta"
				name="pregunta"
				bind:value={$form.pregunta}
				aria-invalid={$errors.pregunta ? 'true' : undefined}
                {...$constraints.pregunta}/>

            {#if $errors.pregunta}
				<span class="invalid">{$errors.pregunta}</span>
			{/if}

		<button type="submit" class="submit-button">Guardar Cambios</button>
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
    .back-button {
        display: inline-block;
        background-color: transparent;
        border: none;
        cursor: pointer;
        font-size: 1.5rem;
        padding: 0.5rem;
        line-height: 1;
    }
    a {
        text-decoration: none;
        color: inherit;
    }
    h3 {
        text-align: left;
        color: var(--color-grey-900);
        margin: .5rem;
        margin-left: 1rem;
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

</style>