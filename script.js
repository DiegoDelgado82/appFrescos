$(function () {
  $(document).ready(function() {
    // Recuperar los productos guardados desde localStorage
    var productosGuardados = JSON.parse(localStorage.getItem('productos')) || [];
  
    // Renderizar la tabla con los productos guardados
    renderizarTabla(productosGuardados);
  });
  
  function renderizarTabla(productos) {
    // Limpiar la tabla antes de agregar los productos
    $("#tablaProductos tbody").empty();
  
    // Agregar cada producto a la tabla
    productos.forEach(function(producto) {
      var fila = "<tr><td>" + producto.ean + "</td><td>" + producto.cantidad + "</td><td>" + producto.nombre + "</td><td>" + producto.tipoPrecio + "</td></tr>";
      $("#tablaProductos tbody").append(fila);
    });
  }
    
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
  
 // Función para abrir el modal y editar la fila seleccionada
function editarFila(fila) {
  // Obtén los datos de la fila seleccionada
  const ean = fila.find('td:eq(0)').text();
  const cantidad = fila.find('td:eq(1)').text();
  const descripcion = fila.find('td:eq(2)').text();
  const tipoPrecio = fila.find('td:eq(3)').text();

  // Usa SweetAlert2 para mostrar un modal
  Swal.fire({
      title: 'Editar Producto',
      html: `
          <label>EAN:</label>
          <input type="text" id="editEAN" class="swal2-input" value="${ean}" disabled>
          <label>Cantidad:</label>
          <input type="number" id="editCantidad" class="swal2-input" value="${cantidad}" min="1">
          <label>Descripción:</label>
          <input type="text" id="editDescripcion" class="swal2-input" value="${descripcion}">
          <label>Tipo Precio:</label>
          <select id="editTipoPrecio" class="swal2-input">
              <option value="A4" ${tipoPrecio === 'A4' ? 'selected' : ''}>A4</option>
              <option value="semáforo" ${tipoPrecio === 'semáforo' ? 'selected' : ''}>Semáforo</option>
              <option value="peroquet" ${tipoPrecio === 'peroquet' ? 'selected' : ''}>Peroquet</option>
              <option value="imagen" ${tipoPrecio === 'imagen' ? 'selected' : ''}>Imagen</option>
          </select>
      `,
      confirmButtonText: 'Guardar',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
          // Obtener los nuevos valores ingresados por el usuario
          const nuevaCantidad = document.getElementById('editCantidad').value;
          const nuevaDescripcion = document.getElementById('editDescripcion').value;
          const nuevoTipoPrecio = document.getElementById('editTipoPrecio').value;

          if (!nuevaCantidad || nuevaCantidad <= 0 || !nuevaDescripcion.trim()) {
              Swal.showValidationMessage('Todos los campos deben estar completos y la cantidad debe ser mayor a 0.');
              return false;
          }

          return { nuevaCantidad, nuevaDescripcion, nuevoTipoPrecio };
      }
  }).then((result) => {
      if (result.isConfirmed) {
          // Actualiza la fila con los nuevos valores
          fila.find('td:eq(1)').text(result.value.nuevaCantidad);
          fila.find('td:eq(2)').text(result.value.nuevaDescripcion);
          fila.find('td:eq(3)').text(result.value.nuevoTipoPrecio);
          //Swal.fire('Actualizado', 'El producto ha sido modificado correctamente.', 'success');
      }
  });
}

// Función para agregar botones de editar y eliminar a cada fila
function agregarBotones(fila) {
  const botones = `
      <td>
          <button class="btn btn-warning btn-sm" onclick="editarFila($(this).closest('tr'))">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarFila($(this).closest('tr'))">Eliminar</button>
      </td>
  `;
  fila.append(botones);
}

// Función para agregar una nueva fila
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

      var fila = $(`<tr>
          <td>${producto.ean}</td>
          <td>${cantidad}</td>
          <td>${producto.nombre}</td>
          <td>${tipoPrecio}</td>
      </tr>`);
      agregarBotones(fila);
      $("#tablaProductos tbody").append(fila);
      $("#buscarProducto").val("");
      $("#cantidad").val("1");
  } else {
      alert("Producto no encontrado.");
  }
}

// Función para eliminar una fila
function eliminarFila(fila) {
  fila.remove();
  //Swal.fire('Eliminado', 'El producto ha sido eliminado.', 'success');
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
  function realizarCaptura() {
    // Captura la tabla y la convierte en una imagen
    html2canvas(document.getElementById('tablaProductos')), {
      onrendered: function(canvas) {
        // Crea una imagen a partir del canvas
        var image = canvas.toDataURL(); // Convertir el canvas en una imagen en base64
        console.log(image);  // Otras acciones como abrir WhatsApp o guardar la imagen

        // Abre el enlace de WhatsApp
        var whatsappUrl = `https://wa.me/?text=Lista%20de%20productos%20adjunta.%0A%0A${encodeURIComponent(image)}`;
        
        // Preguntar al usuario si quiere abrir WhatsApp
        Swal.fire({
            title: '¿Desea enviar la lista por WhatsApp?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.isConfirmed) {
                window.open(whatsappUrl, '_blank');
            }
        });
    
  }
}
  }
