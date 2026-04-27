const selectCantidad = document.getElementById("cantidad-colores");
const botonGenerar = document.getElementById("generar-btn");
const contenedorPaleta = document.getElementById("paleta");
const selectFormato = document.getElementById("formato-color");


function generarPaleta() {
    const cantidad = +selectCantidad.value;
    const formato = selectFormato.value;

    contenedorPaleta.innerHTML = "";

    for (let i = 0; i < cantidad; i++) {
        const colorHex = generarColorHex();
        const colorHsl = generarColorHsl();

        const colorFondo = formato === "hex" ? colorHex : colorHsl;
        const colorACopiar = formato === "hex" ? colorHex : colorHsl;

    crearCajaColor(colorFondo, colorHex, colorACopiar);
}

    mostrarMensaje("Paleta generada!");
}

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

function crearCajaColor(colorFondo, colorHex, colorACopiar) {
    const caja = document.createElement("div");

    caja.classList.add("color-box");
    caja.style.backgroundColor = colorFondo;

    const esClaro = colorFondo.startsWith("#")
        ? esColorClaroHex(colorFondo)
        : esColorClaroHsl(colorFondo); 

        caja.style.color = esClaro ? "#000" : "#fff";

    caja.innerHTML = `
        <span>${colorHex}</span>
    `;

    caja.addEventListener("click", () => {
        navigator.clipboard.writeText(colorACopiar);
        mostrarMensaje("Color copiado!");
    });
    
    contenedorPaleta.appendChild(caja);
}

const form = document.getElementById("form-paleta");

form.addEventListener("submit" , (e) =>{
    e.preventDefault();
    generarPaleta();

    document.activeElement.blur();
});

function mostrarMensaje(texto) {
    const existente = document.querySelector(".toast");
    if(existente) existente.remove();

    const mensaje = document.createElement("div");
    mensaje.classList.add("toast");
    mensaje.textContent = texto;

    document.body.appendChild(mensaje);

    setTimeout(() => {
        mensaje.classList.add("visible");
    }, 10);

    setTimeout(() => {
        mensaje.classList.remove("visible");
        setTimeout(() => mensaje.remove(), 300);
    }, 2000);
}

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