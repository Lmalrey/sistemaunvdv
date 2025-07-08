<script>
    export let collapsed = false;

    export const toggleSidebar = () => {
        collapsed = !collapsed;
    };
</script>

<aside class="sidebar {collapsed ? 'collapsed' : ''}">
    <div class="sidebar-header">
        {#if !collapsed}
            <h2 class="header-title">Neurapp</h2>
        {/if}
        <button
            type="button"
            id="burger-button"
            on:click={toggleSidebar}
            aria-label="Toggle sidebar"
            style="background: none; border: none; padding: 0; cursor: pointer;"
        >
            <svg
                width="64px"
                height="64px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                    <path
                        d="M20 7L4 7"
                        stroke="#ffffff"
                        stroke-width="1.5"
                        stroke-linecap="round"
                    ></path>
                    <path
                        d="M20 12L4 12"
                        stroke="#ffffff"
                        stroke-width="1.5"
                        stroke-linecap="round"
                    ></path>
                    <path
                        d="M20 17L4 17"
                        stroke="#ffffff"
                        stroke-width="1.5"
                        stroke-linecap="round"
                    ></path>
                </g>
            </svg>
        </button>
    </div>
    <nav>
        <ul>
            <li>
                <a href="/private/dashboard" aria-label="Dashboard">
                    <svg
                        width="30"
                        height="30"
                        viewBox="0 0 30 30"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M3.75 15C3.75 15.3315 3.8817 15.6495 4.11612 15.8839C4.35054 16.1183 4.66848 16.25 5 16.25H12.5C12.8315 16.25 13.1495 16.1183 13.3839 15.8839C13.6183 15.6495 13.75 15.3315 13.75 15V5C13.75 4.66848 13.6183 4.35054 13.3839 4.11612C13.1495 3.8817 12.8315 3.75 12.5 3.75H5C4.66848 3.75 4.35054 3.8817 4.11612 4.11612C3.8817 4.35054 3.75 4.66848 3.75 5V15ZM3.75 25C3.75 25.3315 3.8817 25.6495 4.11612 25.8839C4.35054 26.1183 4.66848 26.25 5 26.25H12.5C12.8315 26.25 13.1495 26.1183 13.3839 25.8839C13.6183 25.6495 13.75 25.3315 13.75 25V20C13.75 19.6685 13.6183 19.3505 13.3839 19.1161C13.1495 18.8817 12.8315 18.75 12.5 18.75H5C4.66848 18.75 4.35054 18.8817 4.11612 19.1161C3.8817 19.3505 3.75 19.6685 3.75 20V25ZM16.25 25C16.25 25.3315 16.3817 25.6495 16.6161 25.8839C16.8505 26.1183 17.1685 26.25 17.5 26.25H25C25.3315 26.25 25.6495 26.1183 25.8839 25.8839C26.1183 25.6495 26.25 25.3315 26.25 25V15C26.25 14.6685 26.1183 14.3505 25.8839 14.1161C25.6495 13.8817 25.3315 13.75 25 13.75H17.5C17.1685 13.75 16.8505 13.8817 16.6161 14.1161C16.3817 14.3505 16.25 14.6685 16.25 15V25ZM17.5 3.75C17.1685 3.75 16.8505 3.8817 16.6161 4.11612C16.3817 4.35054 16.25 4.66848 16.25 5V10C16.25 10.3315 16.3817 10.6495 16.6161 10.8839C16.8505 11.1183 17.1685 11.25 17.5 11.25H25C25.3315 11.25 25.6495 11.1183 25.8839 10.8839C26.1183 10.6495 26.25 10.3315 26.25 10V5C26.25 4.66848 26.1183 4.35054 25.8839 4.11612C25.6495 3.8817 25.3315 3.75 25 3.75H17.5Z"
                            fill="#ffffff"
                        />
                    </svg>
                </a>
                {#if !collapsed}
                    <a class="texto" href="/private/dashboard">Dashboard</a>
                {/if}
            </li>
            <li>
                <a
                    class="texto"
                    href="/private/pacientes"
                    aria-label="Pacientes"
                >
                    <svg
                        width="64px"
                        height="64px"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                            id="SVGRepo_tracerCarrier"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        ></g><g id="SVGRepo_iconCarrier">
                            <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M3 18C3 15.3945 4.66081 13.1768 6.98156 12.348C7.61232 12.1227 8.29183 12 9 12C9.70817 12 10.3877 12.1227 11.0184 12.348C11.3611 12.4703 11.6893 12.623 12 12.8027C12.3107 12.623 12.6389 12.4703 12.9816 12.348C13.6123 12.1227 14.2918 12 15 12C15.7082 12 16.3877 12.1227 17.0184 12.348C19.3392 13.1768 21 15.3945 21 18V21H15.75V19.5H19.5V18C19.5 15.5147 17.4853 13.5 15 13.5C14.4029 13.5 13.833 13.6163 13.3116 13.8275C14.3568 14.9073 15 16.3785 15 18V21H3V18ZM9 11.25C8.31104 11.25 7.66548 11.0642 7.11068 10.74C5.9977 10.0896 5.25 8.88211 5.25 7.5C5.25 5.42893 6.92893 3.75 9 3.75C10.2267 3.75 11.3158 4.33901 12 5.24963C12.6842 4.33901 13.7733 3.75 15 3.75C17.0711 3.75 18.75 5.42893 18.75 7.5C18.75 8.88211 18.0023 10.0896 16.8893 10.74C16.3345 11.0642 15.689 11.25 15 11.25C14.311 11.25 13.6655 11.0642 13.1107 10.74C12.6776 10.4869 12.2999 10.1495 12 9.75036C11.7001 10.1496 11.3224 10.4869 10.8893 10.74C10.3345 11.0642 9.68896 11.25 9 11.25ZM13.5 18V19.5H4.5V18C4.5 15.5147 6.51472 13.5 9 13.5C11.4853 13.5 13.5 15.5147 13.5 18ZM11.25 7.5C11.25 8.74264 10.2426 9.75 9 9.75C7.75736 9.75 6.75 8.74264 6.75 7.5C6.75 6.25736 7.75736 5.25 9 5.25C10.2426 5.25 11.25 6.25736 11.25 7.5ZM15 5.25C13.7574 5.25 12.75 6.25736 12.75 7.5C12.75 8.74264 13.7574 9.75 15 9.75C16.2426 9.75 17.25 8.74264 17.25 7.5C17.25 6.25736 16.2426 5.25 15 5.25Z"
                                fill="#ffffff"
                            ></path>
                        </g>
                    </svg>
                </a>
                {#if !collapsed}
                    <a class="texto" href="/private/pacientes">Pacientes</a>
                {/if}
            </li>
            <li>
                <a
                    href="/private/registro_pacientes"
                    aria-label="Registro de pacientes"
                >
                    <svg
                        width="64px"
                        height="64px"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                            id="SVGRepo_tracerCarrier"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        ></g><g id="SVGRepo_iconCarrier">
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="#ffffff"
                                stroke-width="1.5"
                            ></circle>
                            <path
                                d="M15 12L12 12M12 12L9 12M12 12L12 9M12 12L12 15"
                                stroke="#ffffff"
                                stroke-width="1.5"
                                stroke-linecap="round"
                            ></path>
                        </g></svg
                    >
                </a>
                {#if !collapsed}
                    <a class="texto" href="/private/registro_pacientes"
                        >Registro de pacientes</a
                    >
                {/if}
            </li>
            <li>
                <a href="/private/informes" aria-label="Informes Médicos">
                    <svg
                        width="64px"
                        height="64px"
                        viewBox="0 0 512 512"
                        id="Layer_1"
                        version="1.1"
                        xml:space="preserve"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        fill="#ffffff"
                        stroke="#ffffff"
                        ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                            id="SVGRepo_tracerCarrier"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        ></g><g id="SVGRepo_iconCarrier">
                            <style type="text/css">
                                .st0 {
                                    fill: none;
                                    stroke: #ffffff;
                                    stroke-width: 15;
                                    stroke-linejoin: round;
                                    stroke-miterlimit: 10;
                                }
                                .st1 {
                                    fill: #ffffff;
                                    stroke: #ffffff;
                                    stroke-width: 15;
                                    stroke-linejoin: round;
                                    stroke-miterlimit: 10;
                                }
                                .st2 {
                                    fill: #ffffff;
                                    stroke: #ffffff;
                                    stroke-width: 10;
                                    stroke-linecap: round;
                                    stroke-linejoin: round;
                                    stroke-miterlimit: 10;
                                }
                                .st3 {
                                    fill: #ffffff;
                                    stroke: #ffffff;
                                    stroke-width: 15;
                                    stroke-linecap: round;
                                    stroke-linejoin: round;
                                    stroke-miterlimit: 10;
                                }
                                .st4 {
                                    fill: none;
                                    stroke: #ffffff;
                                    stroke-width: 15;
                                    stroke-linecap: round;
                                    stroke-linejoin: round;
                                    stroke-miterlimit: 10;
                                }
                                .st5 {
                                    fill: none;
                                    stroke: #ffffff;
                                    stroke-width: 10;
                                    stroke-linecap: round;
                                    stroke-linejoin: round;
                                    stroke-miterlimit: 10;
                                }
                                .st6 {
                                    fill: #ffffff;
                                    stroke: #ffffff;
                                    stroke-width: 8;
                                    stroke-linecap: round;
                                    stroke-linejoin: round;
                                    stroke-miterlimit: 10;
                                }
                                .st7 {
                                    fill: #ffffff;
                                    stroke: #ffffff;
                                    stroke-width: 10;
                                    stroke-linejoin: round;
                                    stroke-miterlimit: 10;
                                }
                                .st8 {
                                    fill: #ffffff;
                                    stroke: #ffffff;
                                    stroke-width: 12;
                                    stroke-linecap: round;
                                    stroke-linejoin: round;
                                    stroke-miterlimit: 10;
                                }
                                .st9 {
                                    fill: none;
                                    stroke: #ffffff;
                                    stroke-width: 8;
                                    stroke-linecap: round;
                                    stroke-linejoin: round;
                                    stroke-miterlimit: 10;
                                }
                                .st10 {
                                    fill: none;
                                    stroke: #ffffff;
                                    stroke-width: 7;
                                    stroke-linecap: round;
                                    stroke-linejoin: round;
                                    stroke-miterlimit: 10;
                                }
                                .st11 {
                                    fill: none;
                                    stroke: #ffffff;
                                    stroke-width: 12;
                                    stroke-linejoin: round;
                                    stroke-miterlimit: 10;
                                }
                                .st12 {
                                    fill: #ffffff;
                                    stroke: #ffffff;
                                    stroke-width: 10;
                                    stroke-miterlimit: 10;
                                }
                                .st13 {
                                    fill: none;
                                    stroke: #ffffff;
                                    stroke-width: 12;
                                    stroke-linecap: round;
                                    stroke-linejoin: round;
                                    stroke-miterlimit: 10;
                                }
                                .st14 {
                                    fill: none;
                                    stroke: #ffffff;
                                    stroke-width: 10;
                                    stroke-linejoin: round;
                                    stroke-miterlimit: 10;
                                }
                                .st15 {
                                    fill: #ffffff;
                                    stroke: #ffffff;
                                    stroke-width: 15;
                                    stroke-miterlimit: 10;
                                }
                                .st16 {
                                    fill: #ffffff;
                                    stroke: #ffffff;
                                    stroke-width: 15;
                                    stroke-linecap: round;
                                    stroke-miterlimit: 10;
                                }
                            </style>
                            <g>
                                <g>
                                    <path
                                        d="M256,82.4c-10.4,0-18.8-8.5-18.8-18.9c0-10.4,8.5-18.8,18.8-18.8s18.8,8.5,18.8,18.8C274.8,74,266.4,82.4,256,82.4z M256,54.7c-4.9,0-8.8,4-8.8,8.8s4,8.9,8.8,8.9s8.8-4,8.8-8.9S260.9,54.7,256,54.7z"
                                    ></path>
                                </g>
                                <g>
                                    <path
                                        d="M317.4,115.6H194.6c-4.1,0-7.5-3.4-7.5-7.5V73c0-9.4,7.6-17,17-17h35.1c4.1,0,7.5,3.4,7.5,7.5s-3.4,7.5-7.5,7.5h-35.1 c-1.1,0-2,0.9-2,2v27.6h107.8V73c0-1.1-0.9-2-2-2h-35.1c-4.1,0-7.5-3.4-7.5-7.5s3.4-7.5,7.5-7.5h35.1c9.4,0,17,7.6,17,17v35.1 C324.9,112.2,321.5,115.6,317.4,115.6z"
                                    ></path>
                                </g>
                                <g>
                                    <g>
                                        <g>
                                            <path
                                                d="M337,288.2H175c-4.1,0-7.5-3.4-7.5-7.5s3.4-7.5,7.5-7.5h162c4.1,0,7.5,3.4,7.5,7.5S341.1,288.2,337,288.2z"
                                            ></path>
                                        </g>
                                        <g>
                                            <path
                                                d="M337,333.9H175c-4.1,0-7.5-3.4-7.5-7.5s3.4-7.5,7.5-7.5h162c4.1,0,7.5,3.4,7.5,7.5S341.1,333.9,337,333.9z"
                                            ></path>
                                        </g>
                                        <g>
                                            <path
                                                d="M337,379.1H175c-4.1,0-7.5-3.4-7.5-7.5s3.4-7.5,7.5-7.5h162c4.1,0,7.5,3.4,7.5,7.5S341.1,379.1,337,379.1z"
                                            ></path>
                                        </g>
                                    </g>
                                    <g>
                                        <g>
                                            <path
                                                d="M263.7,234h-15.5c-5.1,0-9.3-4.2-9.3-9.3v-8.8h-8.9c-5.1,0-9.3-4.2-9.3-9.3V191c0-5.1,4.2-9.3,9.3-9.3h8.9v-8.8 c0-5.1,4.2-9.3,9.3-9.3h15.5c5.1,0,9.3,4.2,9.3,9.3v8.8h8.9c5.1,0,9.3,4.2,9.3,9.3v15.5c0,5.1-4.2,9.3-9.3,9.3H273v8.8 C273,229.8,268.9,234,263.7,234z M249,224H263v-8.9c0-5.1,4.2-9.3,9.3-9.3h8.8v-14.1h-8.8c-5.1,0-9.3-4.2-9.3-9.3v-8.9H249v8.9 c0,5.1-4.2,9.3-9.3,9.3h-8.8v14.1h8.8c5.1,0,9.3,4.2,9.3,9.3V224z"
                                            ></path>
                                        </g>
                                    </g>
                                </g>
                                <g>
                                    <path
                                        d="M351,439.5H161c-16.9,0-30.6-13.7-30.6-30.6V131.2c0-16.9,13.7-30.6,30.6-30.6h190c16.9,0,30.6,13.7,30.6,30.6v277.6 C381.6,425.8,367.9,439.5,351,439.5z M161,115.6c-8.6,0-15.6,7-15.6,15.6v277.6c0,8.6,7,15.6,15.6,15.6h190 c8.6,0,15.6-7,15.6-15.6V131.2c0-8.6-7-15.6-15.6-15.6H161z"
                                    ></path>
                                </g>
                                <g>
                                    <path
                                        d="M376.8,469.8H359c-4.1,0-7.5-3.4-7.5-7.5s3.4-7.5,7.5-7.5h17.8c8.6,0,15.6-7,15.6-15.6V100.9c0-8.6-7-15.6-15.6-15.6 h-58.4c-4.1,0-7.5-3.4-7.5-7.5s3.4-7.5,7.5-7.5h58.4c16.9,0,30.6,13.7,30.6,30.6v338.2C407.4,456,393.7,469.8,376.8,469.8z"
                                    ></path>
                                </g>
                                <g>
                                    <path
                                        d="M335.5,469.8H135.2c-16.9,0-30.6-13.7-30.6-30.6V100.9c0-16.9,13.7-30.6,30.6-30.6h58.4c4.1,0,7.5,3.4,7.5,7.5 s-3.4,7.5-7.5,7.5h-58.4c-8.6,0-15.6,7-15.6,15.6v338.2c0,8.6,7,15.6,15.6,15.6h200.3c4.1,0,7.5,3.4,7.5,7.5 S339.6,469.8,335.5,469.8z"
                                    ></path>
                                </g>
                            </g>
                        </g></svg
                    >
                </a>
                {#if !collapsed}
                    <a class="texto" href="/private/informes"
                        >Informes Médicos</a
                    >
                {/if}
            </li>
            <li>
                <a href="/private/citas" aria-label="Citas">
                    <svg
                        width="64px"
                        height="64px"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                            id="SVGRepo_tracerCarrier"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        ></g><g id="SVGRepo_iconCarrier">
                            <path
                                d="M18 16L16 16M16 16L14 16M16 16L16 14M16 16L16 18"
                                stroke="#ffffff"
                                stroke-width="1.5"
                                stroke-linecap="round"
                            ></path>
                            <path
                                d="M7 4V2.5"
                                stroke="#ffffff"
                                stroke-width="1.5"
                                stroke-linecap="round"
                            ></path>
                            <path
                                d="M17 4V2.5"
                                stroke="#ffffff"
                                stroke-width="1.5"
                                stroke-linecap="round"
                            ></path>
                            <path
                                d="M21.5 9H16.625H10.75M2 9H5.875"
                                stroke="#ffffff"
                                stroke-width="1.5"
                                stroke-linecap="round"
                            ></path>
                            <path
                                d="M14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12V14C22 17.7712 22 19.6569 20.8284 20.8284C20.1752 21.4816 19.3001 21.7706 18 21.8985"
                                stroke="#ffffff"
                                stroke-width="1.5"
                                stroke-linecap="round"
                            ></path>
                        </g></svg
                    >
                </a>
                {#if !collapsed}
                    <a class="texto" href="/private/citas">Citas</a>
                {/if}
            </li>

            <li>
                <a href="/private/recipes" aria-label="Récipes">
                    <svg
                        width="64px"
                        height="64px"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                            id="SVGRepo_tracerCarrier"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        ></g><g id="SVGRepo_iconCarrier">
                            <path
                                opacity="0.15"
                                d="M8.42896 8.57104L4.89342 12.1066C2.9408 14.0592 2.9408 17.225 4.89342 19.1776C6.84604 21.1303 10.0119 21.1303 11.9645 19.1776L15.5 15.6421L8.42896 8.57104Z"
                                fill="#000000"
                            ></path>
                            <path
                                d="M8.42896 8.57104L15.5 15.6421M8.42896 8.57104L4.89342 12.1066C2.9408 14.0592 2.9408 17.225 4.89342 19.1776C6.84604 21.1303 10.0119 21.1303 11.9645 19.1776L15.5 15.6421M8.42896 8.57104L11.9645 5.03551C13.9171 3.08289 17.0829 3.08289 19.0356 5.03551C20.9882 6.98813 20.9882 10.154 19.0356 12.1066L15.5 15.6421"
                                stroke="#ffffff"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            ></path>
                        </g></svg
                    >
                </a>
                {#if !collapsed}
                    <a class="texto" href="/private/recipes">Récipes</a>
                {/if}
            </li>
            <li>
                <a href="/private/pacientes_dia" aria-label="Pacientes del día">
                    <svg
                        width="64px"
                        height="64px"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                            id="SVGRepo_tracerCarrier"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        ></g><g id="SVGRepo_iconCarrier">
                            <path
                                d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
                                stroke="#ffffff"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            ></path>
                            <path
                                d="M12 12H15"
                                stroke="#ffffff"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            ></path>
                            <path
                                d="M12 16H15"
                                stroke="#ffffff"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            ></path>
                            <path
                                d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
                                stroke="#ffffff"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            ></path>
                            <circle cx="9" cy="12" r="1" fill="#ffffff"
                            ></circle>
                            <circle cx="9" cy="16" r="1" fill="#ffffff"
                            ></circle>
                        </g></svg
                    >
                </a>
                {#if !collapsed}
                    <a class="texto" href="/private/pacientes_dia"
                        >Pacientes del día</a
                    >
                {/if}
            </li>
            <li>
                <a href="/private/usuarios" aria-label="Usuarios">
                    <svg
                        width="64px"
                        height="64px"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#000000"
                        ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                            id="SVGRepo_tracerCarrier"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        ></g><g id="SVGRepo_iconCarrier">
                            <title></title>
                            <g id="Complete">
                                <g id="user">
                                    <g>
                                        <path
                                            d="M20,21V19a4,4,0,0,0-4-4H8a4,4,0,0,0-4,4v2"
                                            fill="none"
                                            stroke="#ffffff"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                        ></path>
                                        <circle
                                            cx="12"
                                            cy="7"
                                            fill="none"
                                            r="4"
                                            stroke="#ffffff"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                        ></circle>
                                    </g>
                                </g>
                            </g>
                        </g></svg
                    >
                </a>
                {#if !collapsed}
                    <a class="texto" href="/private/usuarios">Usuarios</a>
                {/if}
            </li>
            <li>
                <a href="/private/configuracion" aria-label="Configuración">
                    <svg
                        width="64px"
                        height="64px"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                            id="SVGRepo_tracerCarrier"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        ></g><g id="SVGRepo_iconCarrier">
                            <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M11.0175 19C10.6601 19 10.3552 18.7347 10.297 18.373C10.2434 18.0804 10.038 17.8413 9.76171 17.75C9.53658 17.6707 9.31645 17.5772 9.10261 17.47C8.84815 17.3365 8.54289 17.3565 8.30701 17.522C8.02156 17.7325 7.62943 17.6999 7.38076 17.445L6.41356 16.453C6.15326 16.186 6.11944 15.7651 6.33361 15.458C6.49878 15.2105 6.52257 14.8914 6.39601 14.621C6.31262 14.4332 6.23906 14.2409 6.17566 14.045C6.08485 13.7363 5.8342 13.5051 5.52533 13.445C5.15287 13.384 4.8779 13.0559 4.87501 12.669V11.428C4.87303 10.9821 5.18705 10.6007 5.61601 10.528C5.94143 10.4645 6.21316 10.2359 6.33751 9.921C6.37456 9.83233 6.41356 9.74433 6.45451 9.657C6.61989 9.33044 6.59705 8.93711 6.39503 8.633C6.1424 8.27288 6.18119 7.77809 6.48668 7.464L7.19746 6.735C7.54802 6.37532 8.1009 6.32877 8.50396 6.625L8.52638 6.641C8.82735 6.84876 9.21033 6.88639 9.54428 6.741C9.90155 6.60911 10.1649 6.29424 10.2375 5.912L10.2473 5.878C10.3275 5.37197 10.7536 5.00021 11.2535 5H12.1115C12.6248 4.99976 13.0629 5.38057 13.1469 5.9L13.1625 5.97C13.2314 6.33617 13.4811 6.63922 13.8216 6.77C14.1498 6.91447 14.5272 6.87674 14.822 6.67L14.8707 6.634C15.2842 6.32834 15.8528 6.37535 16.2133 6.745L16.8675 7.417C17.1954 7.75516 17.2366 8.28693 16.965 8.674C16.7522 8.99752 16.7251 9.41325 16.8938 9.763L16.9358 9.863C17.0724 10.2045 17.3681 10.452 17.7216 10.521C18.1837 10.5983 18.5235 11.0069 18.525 11.487V12.6C18.5249 13.0234 18.2263 13.3846 17.8191 13.454C17.4842 13.5199 17.2114 13.7686 17.1083 14.102C17.0628 14.2353 17.0121 14.3687 16.9562 14.502C16.8261 14.795 16.855 15.1364 17.0323 15.402C17.2662 15.7358 17.2299 16.1943 16.9465 16.485L16.0388 17.417C15.7792 17.6832 15.3698 17.7175 15.0716 17.498C14.8226 17.3235 14.5001 17.3043 14.2331 17.448C14.0428 17.5447 13.8475 17.6305 13.6481 17.705C13.3692 17.8037 13.1636 18.0485 13.1099 18.346C13.053 18.7203 12.7401 18.9972 12.3708 19H11.0175Z"
                                stroke="#ffffff"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            ></path>
                            <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M13.9747 12C13.9747 13.2885 12.9563 14.333 11.7 14.333C10.4437 14.333 9.42533 13.2885 9.42533 12C9.42533 10.7115 10.4437 9.66699 11.7 9.66699C12.9563 9.66699 13.9747 10.7115 13.9747 12Z"
                                stroke="#ffffff"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            ></path>
                        </g></svg
                    >
                </a>
                {#if !collapsed}
                    <a class="texto" href="/private/configuracion"
                        >Configuración</a
                    >
                {/if}
            </li>

            <!-- Agrega más enlaces según tu app -->
        </ul>
    </nav>
</aside>

<style>
    .sidebar {
        width: 220px;
        transition: width 0.2s;
        background: var(--color-blue-500);
        height: 100vh;
        position: static;
        left: 0;
        top: 0;
        padding: var(--space-s);
    }
    .sidebar.collapsed {
        width: 45px;
    }
    .sidebar.collapsed .header-title,
    .sidebar.collapsed .texto {
        display: none;
    }
    .sidebar h2 {
        color: var(--color-white);
        text-align: left;
        padding: 1rem;
        margin: 0;
    }
    a {
        color: var(--color-white);
        text-decoration: none;
        display: block;
        margin: 0.5rem 0.1rem;
    }
    li {
        padding-left: 0.5rem;
        list-style: none;
        display: flex;
        align-items: center;
    }
    ul {
        padding-left: 0;
    }
    li:hover {
        background: var(--color-blue-600);
    }

    svg {
        width: 24px;
        height: 24px;
        margin-right: 0.5rem;
        cursor: pointer;
    }
    svg:hover {
        background: var(--color-blue-600);
    }

    .sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem;
    }
</style>
