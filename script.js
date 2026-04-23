const selectCantidad = document.getElementById("cantidad-colores");
const botonGenerar = document.getElementById("generar-btn");
const contenedorPaleta = document.getElementById("paleta");

botonGenerar.addEventListener("click", generarPaleta);

function generarPaleta() {
    const cantidad = +selectCantidad.value;

    contenedorPaleta.innerHTML = "";

    for (let i = 0; i < cantidad; i++) {
        const colorHex = generarColorHex();
        const colorHsl = generarColorHsl();

        crearCajaColor(colorHex, colorHsl);
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
    const l = Math.floor(Math.random() * 100);

    return `hsl(${h}, ${s}%, ${l}%)`;
}

function crearCajaColor(colorHex, colorHsl) {
    const caja = document.createElement("div");

    caja.classList.add("color-box");
    caja.style.backgroundColor = colorHex;

    caja.innerHTML = `
        <span>${colorHex}</span>
        <span>${colorHsl}</span>
    `;
    
    contenedorPaleta.appendChild(caja);
}