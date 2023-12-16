// Se define la URL base para la API que se utilizará para obtener datos de indicadores económicos.
const url = "https://mindicador.cl/api/";

// Se selecciona el formulario con el id 'converter' del DOM y se almacena en la variable 'form'.
const form = document.querySelector("#converter");

// Se selecciona el elemento con el id 'myChart' del DOM y se almacena en la variable 'chart'. Este elemento se utilizará para renderizar el gráfico.
const chart = document.querySelector("#myChart");

// Se declara una variable 'myChart' que se utilizará para almacenar la instancia del gráfico Chart.js.
let myChart;

// Se define una función asíncrona 'getDataDivisa' que toma una URL y una divisa como parámetros.
// Esta función realiza una solicitud a la API utilizando la URL proporcionada y la divisa, y retorna la serie de datos obtenida de la respuesta.
// Si hay algún error en la solicitud, se muestra una alerta con el mensaje de error.
const getDataDivisa = async (url, divisa) => {
  try {
    const response = await fetch(`${url}${divisa}`);
    if (!response.ok) {
      throw new Error("Internal Server Error");
    }
    const data = await response.json();
    console.log(data);
    return data.serie;
  } catch (error) {
    alert(error.message);
  }
};

// Se agrega un evento de escucha al formulario que escucha el evento de envío ('submit').
// Cuando se envía el formulario, se evita el comportamiento predeterminado (recargar la página),
// se obtienen los valores del formulario (monto y divisa), se llama a 'getDataDivisa' para obtener los datos de la divisa seleccionada
// y luego se llama a 'calculateValueDivisa' con el valor y los datos obtenidos.
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const value = form.elements["value"].value;
  const divisa = form.elements["divisa"].value;

  const data = await getDataDivisa(url, divisa);
  await calculateValueDivisa(value, data);
});

// Se define una función 'totalConvertDivisa' que toma un valor y datos de divisa como parámetros.
// Calcula el total dividiendo el valor por el valor de la primera entrada en los datos de la divisa y luego redondea el resultado a dos decimales.
const totalConvertDivisa = (value, data) => {
  const valueDivisa = data[0].valor;
  const totalSwap = value / valueDivisa;
  return totalSwap.toFixed(2);
};

// Se define una función 'renderHtml' que toma un total como parámetro y actualiza el contenido del elemento con id 'totalConverter' en el DOM
// con un mensaje que incluye el total. Si no hay datos, muestra "Resultado: $0".
const renderHtml = (total) => {
  const resultString = total
    ? `Resultado: ${parseFloat(total)}`
    : "Resultado: $0";
  document.querySelector("#totalConverter").innerHTML = resultString;
};

// Se define una función 'getValueDivisa' que toma datos de divisa como parámetro y devuelve un array de valores mapeados desde los datos.
const getValueDivisa = (data) => {
  return data.map((item) => item.valor);
};

// Se define una función 'getDateDivisa' que toma datos de divisa como parámetro y devuelve un array de fechas formateadas mapeadas desde los datos.
const getDateDivisa = (data) => {
  return data.map((item) => new Date(item.fecha).toLocaleDateString("en-US"));
};

// Se define una función 'destroyChart' que verifica si hay una instancia de gráfico ('myChart') y, si es así, la destruye.
const destroyChart = () => {
  if (myChart) {
    myChart.destroy();
  }
};

// Se define una función asíncrona 'calculateValueDivisa' que toma un valor y datos de divisa como parámetros y llama a 'viewChart' con esos parámetros.
const calculateValueDivisa = async (value, data) => {
  viewChart(data, value);
};

// Se define una función 'viewChart' que toma datos y un valor como parámetros.
// Si no hay datos o la longitud de los datos es 0, muestra "Resultado: $0" en el DOM, destruye el gráfico y sale de la función.
// Si hay datos, calcula el total, actualiza el DOM con el total y luego configura y renderiza un gráfico de línea utilizando Chart.js
// con los últimos 10 días de datos.
const viewChart = (data, value) => {
  if (!data || data.length === 0) {
    // No hay datos, mostrar 0 en el gráfico y en el DOM
    renderHtml(0);
    destroyChart();
    return;
  }

  const lastTenDaysData = data.slice(-10);

  const total = totalConvertDivisa(value, lastTenDaysData);
  renderHtml(total);

  const dateLabels = getDateDivisa(lastTenDaysData);
  const currencyValues = getValueDivisa(lastTenDaysData);

  const datasets = [
    {
      label: "Divisa",
      borderColor: "greenyellow",
      data: currencyValues,
    },
  ];
  const config = {
    type: "line",
    data: { labels: dateLabels, datasets },
  };

  destroyChart();
  chart.style.backgroundColor = "orangered";
  chart.style.color = "black";
  chart.style.borderRadius = "15px";

  myChart = new Chart(chart, config);
};
