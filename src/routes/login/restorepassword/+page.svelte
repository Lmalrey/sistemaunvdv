<body>
    <div class="container">
        
        <div class="right-section">
            <div class="logo">
                <img src="../images/LOGo Dra Carolina Reyes 1.png" alt="Unidad de Neurología Vigen del Valle Logo"> </div>
            <h1>Unidad de Neurodiagnóstico<br>Vigen del Valle</h1>

            <div class="login-card">
                <h2>Recuperar Contraseña</h2>
                <p>Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña</p>

                <form method="POST" action="?/restore">
                    <div class="input-group">
                        <label for="email">Correo electrónico</label>
                        <div class="input-field">
                            <span class="icon"><svg width="20px" height="20px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" fill="#1976d2"></path> <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" fill="#1976d2"></path> </g></svg></span> 
                            <input type="email" name="email" placeholder="Ingrese su correo">
                        </div>
                    </div>
                    <button type="submit" class="button">Enviar enlace</button>
                    <button class="button"><a href="/login">Volver</a></button>
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

.button a {
    color: white; /* Ensure the link text is white */
    text-decoration: none; /* Remove underline from link */
    display: block; /* Make the link fill the button */
    width: 100%; /* Full width for the button */
}

.button:hover {
    background-color: #0056b3;
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
