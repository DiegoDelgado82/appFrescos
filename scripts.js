$(function () {
    // Cargar listado desde localStorage al cargar la página
    cargarListadoDesdeLocalStorage();
  
    // Obtener productos desde un archivo JSON usando una promesa
    $.getJSON("./productos.json")
      .done(function (data) {
        console.log("Carga de JSON Exitosa");
        productos = data;
        $("#buscarProducto").autocomplete({
          source: function (request, response) {
            var term = request.term.toLowerCase();
            var suggestions = productos
              .filter(function (producto) {
                return producto.nombre.toLowerCase().includes(term);
              })
              .map(function (producto) {
                return producto.nombre;
              });
            response(suggestions);
          },
        });
      })
      .fail(function () {
        alert("Error al cargar los productos.");
      });
  });
  
  function agregarALista() {
    var nombreProducto = $("#buscarProducto").val();
    var cantidad = $("#cantidad").val();
    var tipoPrecio = $("input[name='tipoPrecio']:checked").val();
    var producto = productos.find(function (producto) {
      return producto.nombre === nombreProducto;
    });
  
    if (producto) {
      if (!cantidad.match(/^\d+$/) || cantidad <= 0) {
        alert("La cantidad debe ser un número entero mayor que cero.");
        return;
      }
      var fila = {
        ean: producto.ean,
        cantidad: cantidad,
        descripcion: producto.nombre,
        tipoPrecio: tipoPrecio,
      };
      agregarFilaATabla(fila);
      guardarListadoEnLocalStorage();
      $("#buscarProducto").val("");
      $("#cantidad").val("1");
    } else {
      alert("Producto no encontrado.");
    }
  }
  
  function agregarFilaATabla(fila) {
    var filaHtml =
      "<tr>" +
      "<td>" + fila.ean + "</td>" +
      "<td>" + fila.cantidad + "</td>" +
      "<td>" + fila.descripcion + "</td>" +
      "<td>" + fila.tipoPrecio + "</td>" +
      "<td>" +
      '<button class="btn btn-warning btn-sm" onclick="editarFila(this)">Editar</button> ' +
      '<button class="btn btn-danger btn-sm" onclick="eliminarFila(this)">Eliminar</button>' +
      "</td>" +
      "</tr>";
    $("#tablaProductos tbody").append(filaHtml);
  }
  
  function editarFila(boton) {
    var fila = $(boton).closest("tr");
    var ean = fila.find("td:eq(0)").text();
    var cantidad = fila.find("td:eq(1)").text();
    var descripcion = fila.find("td:eq(2)").text();
    var tipoPrecio = fila.find("td:eq(3)").text();
  
    // Cargar valores en los campos de entrada
    $("#buscarProducto").val(descripcion);
    $("#cantidad").val(cantidad);
    $("input[name='tipoPrecio'][value='" + tipoPrecio + "']").prop("checked", true);
  
    // Eliminar la fila de la tabla
    fila.remove();
  
    // Actualizar el localStorage
    guardarListadoEnLocalStorage();
  }
  
  function eliminarFila(boton) {
    var fila = $(boton).closest("tr");
    fila.remove();
    guardarListadoEnLocalStorage();
  }
  
  function guardarListadoEnLocalStorage() {
    var filas = [];
    $("#tablaProductos tbody tr").each(function () {
      var celdas = $(this).find("td");
      filas.push({
        ean: celdas.eq(0).text(),
        cantidad: celdas.eq(1).text(),
        descripcion: celdas.eq(2).text(),
        tipoPrecio: celdas.eq(3).text(),
      });
    });
    localStorage.setItem("listadoProductos", JSON.stringify(filas));
  }
  
  function cargarListadoDesdeLocalStorage() {
    var listado = localStorage.getItem("listadoProductos");
    if (listado) {
      var filas = JSON.parse(listado);
      filas.forEach(function (fila) {
        agregarFilaATabla(fila);
      });
    }
  }
  
  function borrarListado() {
    if (confirm("¿Está seguro de que desea borrar el listado?")) {
      $("#tablaProductos tbody").empty();
      localStorage.removeItem("listadoProductos");
    }
  }
  
  function descargarExcel() {
    var table = document.getElementById("tablaProductos");
    var rows = Array.from(table.querySelectorAll("tr"));
    var data = rows.map(function (row) {
      return Array.from(row.querySelectorAll("td:nth-child(-n+4)")).map(function (cell) {
        return cell.textContent;
      });
    });
  
    var ws = XLSX.utils.aoa_to_sheet(data);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "lista_productos.xlsx");
    $("#tablaProductos tbody").empty();
    localStorage.removeItem("listadoProductos");
  }
  