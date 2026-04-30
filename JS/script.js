/* =========================
   SELECTORES
========================= */

const selectCantidad = document.getElementById("cantidad-colores");
const selectFormato = document.getElementById("formato-color");
const form = document.getElementById("form-paleta");

const contenedorPaleta = document.getElementById("paleta");
const contenedorGuardadas = document.getElementById("paletas-guardadas");

const botonGuardar = document.getElementById("guardar-paleta-btn");
const botonCopiarPaleta = document.getElementById("copiar-paleta");


/* =========================
   ESTADO
========================= */
let paletaActual = [];
let paletasGuardadas = [];

/* =========================
   INICIALIZACIÓN
========================= */

init();

function init() {
    ocultarUIInicial();
    cargarPaletas();
    asignarEventos();
}

function ocultarUIInicial() {
    contenedorPaleta.classList.add("oculto");
    botonGuardar.classList.add("oculto");
    botonCopiarPaleta.classList.add("oculto");
}

function asignarEventos() {
    form.addEventListener("submit", handleSubmit);
    botonGuardar.addEventListener("click", guardarPaleta);
    botonCopiarPaleta.addEventListener("click", copiarPaleta);
}


/* =========================
   EVENTOS
========================= */
function handleSubmit(e) {
    e.preventDefault();
    generarPaleta();
    document.activeElement.blur();
}


/* =========================
   GENERAR PALETA
========================= */

function generarPaleta() {
    const cantidad = +selectCantidad.value;
    const formato = selectFormato.value;

    limpiarContenedorPaleta();

    for (let i = 0; i < cantidad; i++) {
        const colorHex = generarColorHex();
        const colorHsl = generarColorHsl();

        const colorFinal = formato === "hex" ? colorHex : colorHsl;

        paletaActual.push(colorFinal);
        crearCajaColor(colorFinal, colorHex, colorFinal);
}
    mostrarUITrasGeneracion();
    mostrarMensaje("Paleta generada!");
}

function limpiarContenedorPaleta() {
    contenedorPaleta.innerHTML = "";
    paletaActual = [];
}

/* =========================
   UI
========================= */

function mostrarUITrasGeneracion() {
    contenedorPaleta.classList.remove("oculto");
    botonGuardar.classList.remove("oculto");
    botonCopiarPaleta.classList.remove("oculto");
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
    const colorBox = document.createElement("div");

    colorBox.classList.add("color-box");
    colorBox.style.backgroundColor = colorFondo;

    aplicarAccesibilidad(colorBox, colorHex);
    aplicarConstraste(colorBox, colorFondo);

    colorBox.innerHTML = `
        <span class="hex">${colorHex}</span>
        <span class="hsl">${obtenerHsl(colorFondo, colorHex)}</span>
        <div class="overlay">Click para copiar</div>
    `;

    agregarEventosColor(colorBox, colorACopiar);

    contenedorPaleta.appendChild(colorBox);
}

function aplicarAccesibilidad(elemento, colorHex) {
    elemento.setAttribute("tabindex", "0");
    elemento.setAttribute("role", "button");
    elemento.setAttribute(
        "aria-label",
        `Color ${colorHex}. Presionar Enter para copiar`
    );
}

function aplicarConstraste(elemento, color) {
    const esClaro = color.startsWith("#")
        ? esColorClaroHex(color)
        : esColorClaroHsl(color); 

    elemento.classList.add(esClaro ? "light" : "dark");
}

function obtenerHsl(colorFondo, colorHex) {
    return colorFondo.startsWith("hsl")
        ? colorFondo
        : convertirHexAHsl(colorHex);
}

function agregarEventosColor(elemento, color) {
    elemento.addEventListener("click", () => copiarColor(elemento, color));

    elemento.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            copiarColor(elemento, color);
        }
    });
}

/* =========================
   COPIAR
========================= */

function copiarColor(elemento, color) {
    navigator.clipboard.writeText(color);

    elemento.classList.add("copied");

    setTimeout(() => {
        elemento.classList.remove("copied");
    }, 200);

    mostrarMensaje(`Copiado: ${color}`);
}

function copiarPaleta(e) {
    const formato = selectFormato.value;

    const colores = [...contenedorPaleta.querySelectorAll(".color-box")]
        .map(caja =>
            formato === "hex"
                ? caja.querySelector(".hex").textContent
                : caja.querySelector(".hsl").textContent
        );

    navigator.clipboard.writeText(colores.join(", "));
    mostrarMensaje("Paleta copiada!");

    if (e) e.target.blur();
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
    actualizarStorage();
    renderizarPaletasGuardadas();

    mostrarMensaje("Paleta guardada!");

    if (e) e.target.blur();
}

/* =========================
   STORAGE
========================= */

function actualizarStorage() {
    localStorage.setItem("paletas", JSON.stringify(paletasGuardadas));
}

function cargarPaletas() {
    const data = localStorage.getItem("paletas");
    if (!data) return;

    try {
        const parsed = JSON.parse(data);

        paletasGuardadas = Array.isArray(parsed)
            ? parsed.filter(p => p && Array.isArray(p.colores))
            : [];

    } catch {
        paletasGuardadas = [];
    }

    renderizarPaletasGuardadas();
}


/* =========================
   RENDER GUARDADAS
========================= */
function renderizarPaletasGuardadas() {
    contenedorGuardadas.innerHTML = "";

    if (paletasGuardadas.length === 0) {
        contenedorGuardadas.innerHTML = 
            '<p class="mensaje-vacio">Todavía no guardaste ninguna paleta... ¡Creá una y guardala!</p>'
        return;
    }

    paletasGuardadas.forEach(paleta => {
        const paletteItem = document.createElement("div");
        paletteItem.classList.add("paleta-guardada");

        const colores = document.createElement("div");
        colores.classList.add("colores");


        paleta.colores.forEach(color => {
            const mini = document.createElement("div");
            mini.classList.add("mini-color");
            mini.style.background = color;
            colores.appendChild(mini);
        });

        const acciones = crearAccionesPaleta(paleta);

        paletteItem.appendChild(colores);
        paletteItem.appendChild(acciones);

        contenedorGuardadas.appendChild(paletteItem);
    });
}

function crearAccionesPaleta(paleta) {
    const acciones = document.createElement("div");
    acciones.classList.add("acciones");

    const btnCargar = crearBoton("Cargar", () =>
        cargarPaletaEnPantalla(paleta.colores)
);

    const btnEliminar = crearBoton("Eliminar", (e) => {
        e.stopPropagation();
        eliminarPaleta(paleta.id);
    });

    acciones.append(btnCargar, btnEliminar);
    return acciones;
}

function crearBoton(texto, handler) {
    const btn = document.createElement("button");
    btn.textContent = texto;

    btn.addEventListener("click", (e) => {
        handler(e);
        e.target.blur();
    });

    return btn;
}

/* =========================
   ELIMINAR
========================= */
function eliminarPaleta(id) {
    paletasGuardadas = paletasGuardadas.filter(p => p.id !== id);
    actualizarStorage();
    renderizarPaletasGuardadas();
    mostrarMensaje("Paleta eliminada");
}

/* =========================
   CARGAR AL INICIO
========================= */
function cargarPaletaEnPantalla(colores) {
    limpiarContenedorPaleta();

    colores.forEach(color => {
        const hex = color.startsWith("#") ? color : convertirHslAHex(color);
        crearCajaColor(color, hex, color);
        paletaActual.push(color);
    });

    mostrarUITrasGeneracion();
    mostrarMensaje("Paleta cargada");
}


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
    return (0.299*r + 0.587*g + 0.114*b) > 150;
}

function esColorClaroHsl(hsl) {
    const l = parseInt(hsl.match(/\d+/g)[2]);
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
    let h, s, l=(max+min)/2;

    if (max === min) {
        const d=max-min;
        s=l>0.5?d/(2-max-min):d/(max+min);
        h=(max===r?(g-b)/d+(g<b?6:0):
           max===g?(b-r)/d+2:(r-g)/d+4)*60;
    } else h=s=0;

    return `hsl(${Math.round(h)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`;
}

/* =========================
   HSL → HEX
========================= */

function convertirHslAHex(hsl) {
    const [h,s,l]=hsl.match(/\d+/g).map(Number);
    const a=s*Math.min(l,100-l)/10000;
    const f=n=>{
        const k=(n+h/30)%12;
        const c=l/100-a*Math.max(Math.min(k-3,9-k,1),-1);
        return Math.round(255*c).toString(16).padStart(2,"0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}