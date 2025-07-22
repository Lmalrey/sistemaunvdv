<script>
    import SuperDebug, { superForm } from "sveltekit-superforms";

    let { data } = $props();

    const { form, errors, message, enhance } = superForm(data.form);
</script>

<h1>Crear informe</h1>

<form method="post" use:enhance>
    <div class="input-group">
        <label for="weight">Peso</label>
        <input
            id="weight"
            name="weight"
            type="number"
            bind:value={$form.weight}
        />
        {#if $errors.weight}
            <span class="error">{$errors.weight}</span>
        {/if}
    </div>

    <div class="input-group">
        <label for="height">Talla</label>
        <input
            id="height"
            name="height"
            type="number"
            bind:value={$form.height}
        />
        {#if $errors.height}
            <span class="error">{$errors.height}</span>
        {/if}
    </div>

    <div class="input-group">
        <label for="cephalic_perimeter">Perímetro Cefálico</label>
        <input
            id="cephalic_perimeter"
            name="cephalic_perimeter"
            type="number"
            bind:value={$form.cephalicPerimeter}
        />
        {#if $errors.cephalicPerimeter}
            <span class="error">{$errors.cephalicPerimeter}</span>
        {/if}
    </div>

    <div class="input-group">
        <label for="heart_rate">Frecuencia Cardíaca</label>
        <input
            id="heart_rate"
            name="heart_rate"
            type="number"
            bind:value={$form.heartRate}
        />
        {#if $errors.heartRate}
            <span class="error">{$errors.heartRate}</span>
        {/if}
    </div>

    <div class="input-group">
        <label for="breathing_rate">Frecuencia Respiratoria</label>
        <input
            id="breathing_rate"
            name="breathing_rate"
            type="number"
            bind:value={$form.breathingRate}
        />
        {#if $errors.breathingRate}
            <span class="error">{$errors.breathingRate}</span>
        {/if}
    </div>

    <p>Presión Sanguínea</p>
    <div class="blood-pressure">
        <div class="input-group">
            <label for="blood_pressure">Baja</label>
            <input
                id="blood_pressure"
                name="blood_pressure"
                type="number"
                bind:value={$form.bloodPressureLow}
            />
            {#if $errors.bloodPressureLow}
                <span class="error">{$errors.bloodPressureLow}</span>
            {/if}
        </div>
        <div class="input-group">
            <label for="blood_pressure">Alta</label>
            <input
                id="blood_pressure"
                name="blood_pressure"
                type="number"
                bind:value={$form.bloodPressureHigh}
            />
            {#if $errors.bloodPressureHigh}
                <span class="error">{$errors.bloodPressureHigh}</span>
            {/if}
        </div>
    </div>

    <button>Crear Informe físico</button>
</form>

<style>
    h1 {
        margin-bottom: var(--space-m);
    }
    form {
        background-color: var(--color-white);
        border-radius: var(--border-radius);
        box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
        padding: var(--space-xs);
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
    }

    .input-group {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    input {
        padding: var(--space-2xs) var(--space-xs);
        font-size: var(--font-size-normal);
        border-radius: var(--border-radius);
        border: 1px solid #ccc;
    }

    button {
        background: var(--color-blue-400);
        align-self: center;
    }

    .blood-pressure {
        display: flex;
        justify-content: space-between;
        gap: var(--space-2xs);
    }
</style>
