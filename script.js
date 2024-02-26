// Constructores
function segurosAuto(marca, year, tipo) {
    this.marca = marca;
    this.year = year;
    this.tipo = tipo;
}

// Realizando la cotizacion con los datos
segurosAuto.prototype.cotizarSeguro = function () {
    /* 
    1 = Americano 1.15
    2 = Asiatico 1.05
    3 = Europeo 1.35
      */

    let cantidad;
    const base = 2000;

    switch (this.marca) {
        case "1":
            cantidad = base * 1.15;
            break;
        case "2":
            cantidad = base * 1.05;
            break;
        case "3":
            cantidad = base * 1.35;
            break;
        default:
            break;
    }

    // Leer el años
    const diferencia = new Date().getFullYear() - this.year;

    // Cada año que la diferencia es mayor, el costo va a reducirse um 3%
    cantidad -= (diferencia * 3 * cantidad) / 100;

    /* 
    Si el seguro es basico se multiplica por un 30% más
    Si el seguro es completo se multiplica por un 50% más
      */

    if (this.tipo === "basico") {
        cantidad *= 1.3;
    } else {
        cantidad *= 1.5;
    }

    return cantidad;
};

function UI() { }

// Llena las opciones de los años
UI.prototype.llenarOpciones = () => {
    const max = new Date().getFullYear(),
        min = max - 20;

    const selectYear = document.querySelector("#year");

    for (let i = max; i > min; i--) {
        let option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        selectYear.appendChild(option);
    }
};

// Muesta alerta de pantalla
UI.prototype.mostrarMensaje = (mensaje, tipo) => {
    const div = document.createElement("div");

    if (tipo === "error") {
        div.classList.add("error");
    } else {
        div.classList.add("correcto");
    }

    div.classList.add("mensaje", "mt-10");
    div.textContent = mensaje;

    // Insertar en el HTML
    const form = document.querySelector("#cotizar-seguro");
    form.insertBefore(div, document.querySelector("#resultado"));

    setTimeout(() => {
        div.remove();
    }, 3000);
};

UI.prototype.mostrarResultado = (total, seguro) => {
    const { marca, year, tipo } = seguro;

    // Crear el resultado
    const div = document.createElement("div");
    div.classList.add("mt-10");

    let textMarca;

    switch (marca) {
        case "1":
            textMarca = "Americano";
            break;
        case "2":
            textMarca = "Asiatico";
            break;
        case "3":
            textMarca = "Europeo";
            break;
        default:
            break;
    }

    div.innerHTML = `
        <p class="header">Tu Resumen</p>
        <p class="font-bold">Marca: <span class="font-normal">${textMarca}</span></p>
        <p class="font-bold">Año: <span class="font-normal">${year}</span></p>
        <p class="font-bold">Tipo: <span class="font-normal capitalize">${tipo}</span></p>
        <p class="font-bold">Total: <span class="font-normal">${total}</span></p>
    `;

    const resultadoDiv = document.querySelector("#resultado");

    // Mostrar el spinner
    const spinner = document.querySelector("#cargando");
    spinner.style.display = "block";

    setTimeout(() => {
        spinner.style.display = "none"; // Se borra el spinner
        resultadoDiv.appendChild(div); // Se muestra el resultado
    }, 3000);
};

UI.prototype.mostrarDetallesMarca = (data) => {
    // Mostrar detalles adicionales de la marca obtenidos mediante fetch
    const detallesDiv = document.createElement("div");
    detallesDiv.classList.add("detalles-marca");
    detallesDiv.innerHTML = `<p>Detalles de la marca: ${JSON.stringify(data)}</p>`;
    const resultadoDiv = document.querySelector("#resultado");
    resultadoDiv.appendChild(detallesDiv);
};

// Instanciar UI
const ui = new UI();

document.addEventListener("DOMContentLoaded", () => {
    ui.llenarOpciones(); // Llena el select con los años...

    // Recuperar cotización almacenada
    const cotizacionGuardada = JSON.parse(localStorage.getItem("cotizacion"));
    if (cotizacionGuardada) {
        const { marca, year, tipo, total } = cotizacionGuardada;
        ui.mostrarResultado(total, { marca, year, tipo });
    }
});

eventListeners();
function eventListeners() {
    const form = document.querySelector("#cotizar-seguro");
    form.addEventListener("submit", cotizarSeguro);
}

async function cotizarSeguro(e) {
    e.preventDefault();

    // Leer la marca seleccionada
    const marca = document.querySelector("#marca").value;

    // Leer el año seleccionado
    const year = document.querySelector("#year").value;

    // Leer el tipo de cobertura
    const tipo = document.querySelector('input[name="tipo"]:checked').value;

    if (marca === "" || year === "" || tipo === "") {
        ui.mostrarMensaje("Todos los campos son obligatorios", "error");
        return;
    }

    ui.mostrarMensaje("Cotizando...", "exito");

    // Ocultar las cotizaciones previas
    const resultado = document.querySelector("#resultado div");
    if (resultado != null) {
        resultado.remove();
    }

    // Instanciar el seguro
    const seguro = new segurosAuto(marca, year, tipo);
    const total = seguro.cotizarSeguro();

    // Almacenar cotización en localStorage
    localStorage.setItem("cotizacion", JSON.stringify({ marca, year, tipo, total }));

    // Utilizando el prototipo que va a cotizar
    ui.mostrarResultado(total, seguro);

    // Realizar solicitud fetch para obtener datos adicionales (por ejemplo, detalles sobre la marca)
    try {
        const response = await fetch(`https://api.example.com/marca/${marca}`);
        const data = await response.json();
        // Actualizar la interfaz con los datos adicionales obtenidos
        ui.mostrarDetallesMarca(data);
    } catch (error) {
        console.error("Error al obtener detalles de la marca:", error);
    }
}
