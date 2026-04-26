const selectCantidad = document.getElementById("cantidad-colores");
const botonGenerar = document.getElementById("generar-btn");
const contenedorPaleta = document.getElementById("paleta");
const selectFormato = document.getElementById("formato-color");

botonGenerar.addEventListener("click", generarPaleta);

function generarPaleta() {
    const cantidad = +selectCantidad.value;
    const formato = selectFormato.value;

    contenedorPaleta.innerHTML = "";

    for (let i = 0; i < cantidad; i++) {
        const color = generarColor(formato);
        crearCajaColor(color);
    }
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

function crearCajaColor(color) {
    const caja = document.createElement("div");

    caja.classList.add("color-box");
    caja.style.backgroundColor = color;

    caja.innerHTML = `
        <span>${color}</span>
    `;
    
    contenedorPaleta.appendChild(caja);
}

function generarColor(formato) {
    if (formato === "hex") {
        return generarColorHex();
    } else if (formato === "hsl") {
        return generarColorHsl();
    }
}