<script lang="ts">
    import { onMount } from 'svelte';

    onMount(() => {
        const passwordInput = document.getElementById('password') as HTMLInputElement;
        const confirmPasswordInput = document.getElementById('confirmpassword') as HTMLInputElement;
        const passwordMismatchError = document.getElementById('passwordMismatchError') as HTMLDivElement;
        const passwordMatchSuccess = document.getElementById('passwordMatchSuccess') as HTMLDivElement;
        const form = document.querySelector('form');
        const submitButton = document.querySelector('.login-button') as HTMLButtonElement;

        // Function to validate password match
        function validatePasswordMatch() {
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if(password.length>0 && confirmPassword.length>0) {
                if (password === confirmPassword) {
                    passwordMismatchError.style.display = 'none';
                    passwordMatchSuccess.style.display = 'block';
                    submitButton.disabled = false; // Enable the submit button
                } else {
                    passwordMismatchError.style.display = 'block';
                    passwordMatchSuccess.style.display = 'none';
                    submitButton.disabled = true; // Disable the submit button
                }
            
            } else {
                passwordMismatchError.style.display = 'none';
                passwordMatchSuccess.style.display = 'none';
                submitButton.disabled = true; // Disable the submit button if inputs are empty
            }
            
        }

        // Add event listeners for input changes
        passwordInput.addEventListener('input', validatePasswordMatch);
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    });

    
</script>
<body>
    <div class="container">
        
        <div class="right-section">
            <div class="logo">
                <img src="../images/LOGo Dra Carolina Reyes 1.png" alt="Unidad de Neurología Vigen del Valle Logo"> </div>
            <h1>Unidad de Neurodiagnóstico<br>Vigen del Valle</h1>

            <div class="login-card">
                <h2>Cambiar contraseña</h2>
                <p>Ingrese contraseña segura</p>

                <form method="POST" action="?/changepassword">
                    <div class="input-group">
                        <label for="password">Nueva Contraseña</label>
                        <div class="input-field">
                            <span class="icon"><svg width="20px" height="20px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#00000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M4 6V4C4 1.79086 5.79086 0 8 0C10.2091 0 12 1.79086 12 4V6H14V16H2V6H4ZM6 4C6 2.89543 6.89543 2 8 2C9.10457 2 10 2.89543 10 4V6H6V4ZM7 13V9H9V13H7Z" fill="#1976d2"></path> </g></svg></span> 
                            <input type="password" name="password" id="password" placeholder="Ingrese su nueva contraseña" required>
                        </div>
                    </div>
                    <div class="input-group">
                        <label for="password">Confirme Nueva Contraseña</label>
                        <div class="input-field">
                            <span class="icon"><svg width="20px" height="20px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#00000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M4 6V4C4 1.79086 5.79086 0 8 0C10.2091 0 12 1.79086 12 4V6H14V16H2V6H4ZM6 4C6 2.89543 6.89543 2 8 2C9.10457 2 10 2.89543 10 4V6H6V4ZM7 13V9H9V13H7Z" fill="#1976d2"></path> </g></svg></span> 
                            <input type="password" name="confirmpassword" id="confirmpassword" placeholder="Confirme su nueva contraseña" required>
                        </div>
                        <div id="passwordMismatchError" class="error-message">Las contraseñas no coinciden.</div>
                        <div id="passwordMatchSuccess" class="success-message">Las contraseñas coinciden.</div>
                    </div>
                    <button type="submit" class="login-button" disabled>Guardar nueva contraseña</button>
                    <a href="/login" class="anchor">← Volver al inicio de sesión</a>
                </form>
            </div>
        </div>
    </div>
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
    height: 97vh; /* Adjust height as needed */
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
    margin-bottom: 5px;
}

.right-section h1 {
    font-size: 1.8em;
    color: var(--color-blue-700);
    margin-bottom: 20px;
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

.login-button {
    width: 100%;
    padding: 12px;
    background-color: var(--color-blue-700); /* Blue button */
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1.1em;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.login-button:hover {
    background-color: #0056b3;
}

.anchor {
    display: block;
    text-align: center;
    font-size: 0.85em;
    color: var(--color-blue-700); /* Blue for links */
    text-decoration: none;
    margin-top: 10px; /* Adjust if needed to move closer to input field */
}

.anchor:hover {
    text-decoration: underline;
}
.error-message {
            color: #d9534f;
            font-size: 0.9em;
            margin-top: 5px;
            display: none;
        }
.success-message {
            color: #5cb85c;
            font-size: 0.9em;
            margin-top: 5px;
            display: none;
        }
button:disabled { /* Styling for disabled state */
            background-color: #cccccc;
            cursor: not-allowed;
            opacity: 0.7;
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
  

</style>
