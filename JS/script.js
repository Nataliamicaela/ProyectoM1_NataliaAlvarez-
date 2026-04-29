const selectCantidad = document.getElementById("cantidad-colores");
const contenedorPaleta = document.getElementById("paleta");
contenedorPaleta.classList.add("oculto");
const selectFormato = document.getElementById("formato-color");
const botonGuardar = document.getElementById("guardar-paleta-btn");
botonGuardar.classList.add("oculto");
const form = document.getElementById("form-paleta");
const contenedorGuardadas = document.getElementById("paletas-guardadas");

/* =========================
   ESTADO
========================= */
let paletaActual = [];
let paletasGuardadas = [];

/* =========================
   EVENTOS
========================= */
form.addEventListener("submit" , (e) =>{
    e.preventDefault();
    generarPaleta();
    document.activeElement.blur();
});

botonGuardar.addEventListener("click", guardarPaleta);

/* =========================
   GENERAR PALETA
========================= */

function generarPaleta() {
    const cantidad = +selectCantidad.value;
    const formato = selectFormato.value;

    contenedorPaleta.innerHTML = "";
    paletaActual = [];

    for (let i = 0; i < cantidad; i++) {
        const colorHex = generarColorHex();
        const colorHsl = generarColorHsl();

        const colorFondo = formato === "hex" ? colorHex : colorHsl;
        const colorACopiar = formato === "hex" ? colorHex : colorHsl;

        paletaActual.push(colorACopiar);

    crearCajaColor(colorFondo, colorHex, colorACopiar);
}

    contenedorPaleta.classList.remove("oculto");

    botonGuardar.classList.remove("oculto");

    mostrarMensaje("Paleta generada!");
}

/* =========================
   COLORES
========================= */

function generarColorHex() {
    const letras = "0123456789ABCDEF";
    let color = "#";

    for (let i = 0; i < 6; i++) {
        color += letras[Math.floor(Math.random() * 16)];
    }

    return color;
}

function generarColorHsl() {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 100);
    const l = Math.floor(Math.random() * 60) + 20;

    return `hsl(${h}, ${s}%, ${l}%)`;
}

/* =========================
   CREAR CAJA
========================= */

function crearCajaColor(colorFondo, colorHex, colorACopiar) {
    const caja = document.createElement("div");

    caja.classList.add("color-box");
    caja.style.backgroundColor = colorFondo;

    caja.setAttribute("tabindex", "0");
    caja.setAttribute("role", "button");
    caja.setAttribute(
        "aria-label",
        `Color ${colorHex}. Presionar Enter para copiar`
    );

    const esClaro = colorFondo.startsWith("#")
        ? esColorClaroHex(colorFondo)
        : esColorClaroHsl(colorFondo); 

        caja.classList.add(esClaro ? "light" : "dark");

    caja.innerHTML = `
            <span class="hex">${colorHex}</span>
            <span class="hsl">${colorFondo.startsWith("hsl") ? colorFondo : convertirHexAHsl(colorHex)}</span>
            <div class="overlay">Click para copiar</div>
    `;

    caja.addEventListener("click", () => copiarColor(caja, colorACopiar));

    caja.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            copiarColor(caja, colorACopiar);
        }
    });
    
    contenedorPaleta.appendChild(caja);
}

/* =========================
   COPIAR
========================= */

function copiarColor(caja, color) {
    navigator.clipboard.writeText(color);

    caja.classList.add("copied");

    setTimeout(() => {
        caja.classList.remove("copied");
    }, 200);

    mostrarMensaje(`Copiado: ${color}`);
}

/* =========================
   GUARDAR PALETA
========================= */
function guardarPaleta(e) {
    if (paletaActual.length === 0) {
        botonGuardar.classList.add("oculto");
        mostrarMensaje("Primero generá una paleta");
        return;
    }

    const nuevaPaleta = {
        id: Date.now(),
        colores: paletaActual
    };

    paletasGuardadas.push(nuevaPaleta);

    localStorage.setItem("paletas", JSON.stringify(paletasGuardadas));

    renderizarPaletasGuardadas();

    mostrarMensaje("Paleta guardada!");

    if (e) e.target.blur();
}

/* =========================
   RENDER GUARDADAS
========================= */
function renderizarPaletasGuardadas() {
    contenedorGuardadas.innerHTML = "";

    if (paletasGuardadas.length === 0) {
        const mensaje = document.createElement("p");
        mensaje.textContent = "Todavía no guardaste ninguna paleta... ¡Creá una y guardala!";
        mensaje.classList.add("mensaje-vacio");

        contenedorGuardadas.appendChild(mensaje);
        return;
    }

    paletasGuardadas.forEach(paleta => {
        const contenedor = document.createElement("div");
        contenedor.classList.add("paleta-guardada");

        const contenedorColores = document.createElement("div");
        contenedorColores.classList.add("colores");


        paleta.colores.forEach(color => {
            const box = document.createElement("div");
            box.classList.add("mini-color");
            box.style.background = color;
            contenedorColores.appendChild(box);
        });

        const contenedorAcciones = document.createElement("div");
        contenedorAcciones.classList.add("acciones");


        const btnCargar = document.createElement("button");
        btnCargar.textContent = "Cargar";

        btnCargar.addEventListener("click", (e) => {
            cargarPaletaEnPantalla(paleta.colores);
            e.target.blur();
        });

        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";

        btnEliminar.addEventListener("click", (e) => {
            e.stopPropagation();
            eliminarPaleta(paleta.id);
            e.target.blur();
        });

        contenedorAcciones.appendChild(btnCargar);
        contenedorAcciones.appendChild(btnEliminar);

        contenedor.appendChild(contenedorColores);
        contenedor.appendChild(contenedorAcciones);

        contenedorGuardadas.appendChild(contenedor);
    });
}

/* =========================
   ELIMINAR
========================= */
function eliminarPaleta(id) {
    paletasGuardadas = paletasGuardadas.filter(p => p.id !== id);

    localStorage.setItem("paletas", JSON.stringify(paletasGuardadas));

    renderizarPaletasGuardadas();

    mostrarMensaje("Paleta eliminada");
}

/* =========================
   CARGAR AL INICIO
========================= */
function cargarPaletas() {
    const data = localStorage.getItem("paletas");

    if (!data) return;

    try {
        const parsed = JSON.parse(data);

        if (!Array.isArray(parsed)) {
            paletasGuardadas = [];
            return;
        }

        paletasGuardadas = parsed.filter(p => {
            return p && Array.isArray(p.colores);
        });

    } catch (error) {
        paletasGuardadas = [];
    }

    renderizarPaletasGuardadas();
}

cargarPaletas();


/* =========================
   MENSAJE (TOAST)
========================= */

function mostrarMensaje(texto) {
    const existente = document.querySelector(".toast");
    if(existente) existente.remove();

    const mensaje = document.createElement("div");
    mensaje.classList.add("toast");
    mensaje.textContent = texto;

    mensaje.setAttribute("role", "status");
    mensaje.setAttribute("aria-live", "polite");

    document.body.appendChild(mensaje);

    setTimeout(() => {
        mensaje.classList.add("visible");
    }, 10);

    setTimeout(() => {
        mensaje.classList.remove("visible");
        setTimeout(() => mensaje.remove(), 300);
    }, 2000);
}

/* =========================
   CONTRASTE
========================= */

function esColorClaroHex(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const luminancia = (0.299 * r + 0.587 * g + 0.114 * b);

    return luminancia > 150;
}

function esColorClaroHsl(hsl) {
    const valores = hsl.match(/\d+/g);
    const l = parseInt(valores[2]); 
    return l > 60;
}

/* =========================
   HEX → HSL
========================= */

function convertirHexAHsl(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l;

    l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b: 
                h = (r - g) / d + 4;
                break;
        }

        h = Math.round(h * 60);
    }

    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `hsl(${h}, ${s}%, ${l}%)`; 
}

/* =========================
   HSL → HEX
========================= */
function convertirHslAHex(hsl) {
    const [h, s, l] = hsl.match(/\d+/g).map(Number);

    const a = s * Math.min(l, 100 - l) / 10000;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };

    return `#${f(0)}${f(8)}${f(4)}`;
}

function cargarPaletaEnPantalla(colores) {
    contenedorPaleta.innerHTML = "";
    paletaActual = [];

    colores.forEach(color => {
        const colorHex = color.startsWith("#") ? color : null;

        // Si es HSL, generamos HEX solo para mostrar
        const hex = colorHex || convertirHslAHex(color);

        crearCajaColor(color, hex, color);

        paletaActual.push(color);
    });

    mostrarMensaje("Paleta cargada");
}