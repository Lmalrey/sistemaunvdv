<script lang="ts">

	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	// La propiedad 'form' se actualiza automáticamente por SvelteKit después de una acción.
	let { form }: { form: ActionData } = $props();

	// Función para "cerrar" el modal, limpiando el estado del formulario.
	function closeModal() {
		form = null;
	}
</script>

<body>
    <div class="container">
        
        <div class="right-section">
            <div class="logo">
                <img src="../images/LOGo Dra Carolina Reyes 1.png" alt="Unidad de Neurología Vigen del Valle Logo"> </div>
            <h1>Unidad de Neurodiagnóstico<br>Vigen del Valle</h1>

            <div class="login-card">
                <h2>Recuperar Contraseña</h2>
                <p>Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña</p>

                <form method="POST" action="?/restore" use:enhance>
                        <div class="input-group">
                            <label for="email">Correo electrónico</label>
                            <div class="input-field">
                                <span class="icon"><svg width="20px" height="20px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" fill="#1976d2"></path> <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" fill="#1976d2"></path> </g></svg></span> 
                                <input type="email" name="email" placeholder="Ingrese su correo">
                            </div>
                            {#if form?.error}
                                <p class="error-message">{form.error}</p>
                            {/if}
                        </div>
                        <button type="submit" class="button">Enviar enlace</button>
                        <a href="/login" class="button-link">Volver</a>
                </form>
                </div>
            </div>
        </div>
    {#if form?.success}
		<div class="modal-overlay">
			<div class="modal-card">
				<div class="success-icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
				</div>
				<h2>Correo Enviado</h2>
				<p class="modal-text">Hemos enviado un enlace de recuperación a tu correo electrónico.</p>
				<p class="modal-text">Revisa tu bandeja de entrada y sigue las instrucciones del correo para restablecer tu contraseña.</p>
				<p class="modal-subtext">Si no recibes el correo en unos minutos, revisa tu carpeta de spam.</p>

				<a href="/login" class="button-primary">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
					Volver al Inicio de Sesión
				</a>
				<button class="button-secondary" onclick={closeModal}>
					Enviar a otro correo
				</button>
			</div>
		</div>
	{/if}
</body>

<style>
  body {
    margin: 0;
    font-family: Arial, sans-serif; /* Or your preferred font, e.g., 'Poppins', sans-serif; */
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f0f2f5; /* Light grey background for the whole page */
}

/* Main container for the layout */
.container {
    display: flex;
    width: 100%; /* Adjust as needed */
    max-width: 650px; /* Max width for larger screens */
    height: 95vh; /* Adjust height as needed */
    min-height: 600px; /* Minimum height */
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border-radius: 1px;
    overflow: hidden; /* Ensures rounded corners are applied to children */
    margin: auto;
}

/* Right section for the login form */
.right-section {
    flex: 1; /* Takes less space */
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    text-align: center;
    position: relative;
}

.logo img {
    max-width: 240px; /* Adjust logo size */
    margin-bottom: 10px;
}

.right-section h1 {
    font-size: 1.8em;
    color: var(--color-blue-700);
    margin-bottom: 30px;
    line-height: 1.2;
}

.login-card {
    background-color: #f2f7fa;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    width: 85%; /* Adjust width of the card */
    max-width: 400px;
    text-align: left;
}

.login-card h2 {
    font-size: 1.5em;
    color: var(--color-blue-700); /* Green color for "Bienvenido" */
    margin-bottom: 10px;
    text-align: center;
}

.login-card p {
    font-size: 0.9em;
    color: #666;
    margin-bottom: 25px;
    text-align: center;
}

.input-group {
    margin-bottom: 20px;
}

.input-group label {
    display: block;
    font-size: 0.9em;
    color: #555;
    margin-bottom: 8px;
}

.input-field {
    position: relative;
    display: flex;
    align-items: center;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 8px 2px;
    background-color: #ffffff;
}

.input-field input {
    border: none;
    outline: none;
    flex-grow: 1;
    padding: 5px 0;
    font-size: 1em;
}

.input-field .icon {
    margin-left: 5px;
    margin-right: 10px;
    color: #aaa;
    font-size: 1.1em;
}

.button {
    width: 100%;
    padding: 12px;
    background-color: var(--color-blue-700); /* Blue button */
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1.1em;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-bottom: 15px; /* Space between buttons */
}

.button:hover {
    background-color: #0056b3;
}

.button-link {
		display: block;
		width: 100%;
		padding: 12px;
		background-color: var(--color-blue-700);;
		color: white;
		border: none;
		border-radius: 5px;
		font-size: 1.1em;
		cursor: pointer;
		text-align: center;
		text-decoration: none;
		transition: all 0.3s ease;
		box-sizing: border-box; /* Asegura que el padding no afecte el ancho total */
	}
	.button-link:hover {
		background-color: #0056b3;
	}

	.button:disabled {
		background-color: #aaa;
		cursor: not-allowed;
	}

/* Responsive adjustments */
@media (max-width: 768px) {
    .container {
        flex-direction: column;
        height: auto;
        min-height: 100vh;
        width: 100%;
        border-radius: 0;
        box-shadow: none;
    }

    .right-section {
        padding: 40px 20px; /* More padding for better spacing */
        justify-content: flex-start; /* Align content to the top */
    }

    .login-card {
        width: 95%; /* Adjust width for smaller screens */
        max-width: none;
        margin-top: 20px;
    }
}
.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-card {
		background-color: var(--color-card, #ffffff);
		padding: 2.5rem;
		border-radius: 12px;
		box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
		text-align: center;
		max-width: 450px;
		width: 90%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.success-icon {
		color: var(--color-blue-700);
		margin-bottom: 1.5rem;
	}

	.modal-card h2 {
		color: var(--color-success);
		font-size: 1.75rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
	}

	.modal-text {
		color: var(--color-text-primary);
		line-height: 1.6;
		margin: 0 0 1rem 0;
	}

	.modal-subtext {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		margin-top: 1rem;
		margin-bottom: 2rem;
	}

	.button-primary,
	.button-secondary {
		width: 100%;
		padding: 0.75rem;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.button-primary {
		background-color: var(--color-primary);
		color: white;
		border: 1px solid var(--color-primary);
		margin-bottom: 0.75rem;
	}
	.button-primary:hover {
		background-color: #357ae8;
	}

	.button-secondary {
		background-color: var(--color-card);
		color: var(--color-secondary);
		border: 1px solid #ccc;
	}
	.button-secondary:hover {
		background-color: #f1f5f9;
	}

</style>
