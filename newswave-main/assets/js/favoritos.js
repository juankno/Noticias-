/* ==========================================================================
   NewsWave - favoritos.js
   Gestiona la vista de favoritos: listado basado en localStorage, 
   ordenamiento, vaciar lista, mini CRUD con imagen local y botón de eliminar junto a la estrella.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var CLAVE_FAVORITOS = "newswave_favoritos";
  var CLAVE_NOTICIAS_CUSTOM = "newswave_custom";

  var contenedor =
    document.getElementById("contenedor-favoritos") ||
    document.querySelector(".seccion .wrap");
  var datosGlobales = null;

  function obtenerFavoritos() {
    try {
      var favs = localStorage.getItem(CLAVE_FAVORITOS);
      return favs ? JSON.parse(favs).map(Number) : [];
    } catch (e) {
      return [];
    }
  }

  function guardarFavoritos(favs) {
    try {
      localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favs));
    } catch (e) {
      console.error("Error al guardar favoritos", e);
    }
  }

  function obtenerNoticiasCustom() {
    try {
      var custom = localStorage.getItem(CLAVE_NOTICIAS_CUSTOM);
      return custom ? JSON.parse(custom) : [];
    } catch (e) {
      return [];
    }
  }

  function guardarNoticiasCustom(custom) {
    try {
      localStorage.setItem(CLAVE_NOTICIAS_CUSTOM, JSON.stringify(custom));
    } catch (e) {
      console.error("Error al guardar noticias custom", e);
    }
  }

  NW.cargarDatos()
    .then(function (datos) {
      datosGlobales = datos;
      var custom = obtenerNoticiasCustom();
      datosGlobales.noticias = custom.concat(datosGlobales.noticias);

      renderizarFavoritos();
      conectarEventosFavoritos();
    })
    .catch(function (error) {
      if (contenedor) {
        NW.mostrarError(contenedor, error.message);
      }
    });

  window.actualizarVistaFavoritos = function () {
    if (datosGlobales) {
      renderizarFavoritos();
    }
  };

  function renderizarFavoritos() {
    if (!contenedor) {
      return;
    }

    var favsIds = obtenerFavoritos();

    var noticiasFav = datosGlobales.noticias.filter(function (n) {
      return favsIds.indexOf(Number(n.id)) !== -1;
    });

    if (noticiasFav.length === 0) {
      contenedor.innerHTML =
        "" +
        '<div class="wrap">' +
        '  <div class="estado">' +
        '    <div style="font-size:34px">&#9734;</div>' +
        '    <h3 class="mt-16">Todavía no tienes noticias guardadas</h3>' +
        '    <p style="max-width:520px;margin:8px auto 0">Cuando marques una noticia con la estrella aparecerá en esta lista.</p>' +
        '    <a class="boton boton--oscuro mt-24" href="noticias.html">Explorar noticias</a>' +
        "  </div>" +
        "  " +
        renderizarMiniCRUD() +
        "</div>";
      return;
    }

    // Renderizamos las tarjetas y modificamos el pie de la tarjeta para poner el botón al lado de la estrella
    var htmlTarjetas = noticiasFav
      .map(function (noticia) {
        var tarjetaHtml = NW.plantillaTarjeta(datosGlobales, noticia);

        // Creamos un reemplazo visual para inyectar el botón pequeño al lado de la estrella en el DOM de la tarjeta
        return (
          '<div class="tarjeta-contenedor-fav" data-id-tarjeta="' +
          noticia.id +
          '">' +
          "  " +
          tarjetaHtml +
          "</div>"
        );
      })
      .join("");

    contenedor.innerHTML =
      "" +
      '<div class="wrap">' +
      '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px;">' +
      '    <p style="font-weight:600;"><strong>' +
      noticiasFav.length +
      "</strong> noticias guardadas</p>" +
      '    <div style="display:flex;gap:8px;">' +
      '      <button type="button" class="boton boton--claro boton--pequeno" id="btn-ordenar-fav">Ordenar por fecha</button>' +
      '      <button type="button" class="boton boton--claro boton--pequeno" id="btn-vaciar-fav" style="color:#C8102E;">Vaciar lista</button>' +
      "    </div>" +
      "  </div>" +
      '  <div class="grilla-tarjetas" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:24px;">' +
      htmlTarjetas +
      "  </div>" +
      "  " +
      renderizarMiniCRUD() +
      "</div>";

    // Inyectar el botón pequeño al lado de la estrella en cada tarjeta renderizada
    var contenedoresTarjeta = contenedor.querySelectorAll(
      ".tarjeta-contenedor-fav",
    );
    for (var i = 0; i < contenedoresTarjeta.length; i++) {
      var card = contenedoresTarjeta[i];
      var idNoticia = card.dataset.idTarjeta;
      var pieTarjeta = card.querySelector(
        ".tarjeta__pie, .tarjeta-pie, footer, div:last-child",
      );

      // Si encontramos la zona inferior de la tarjeta, agregamos el botón pequeño al lado de la estrella existente
      var btnEstrella = card.querySelector(".boton-favorito");
      if (btnEstrella && btnEstrella.parentNode) {
        var btnEliminarMini = document.createElement("button");
        btnEliminarMini.type = "button";
        btnEliminarMini.className =
          "boton boton--claro boton--pequeno btn-eliminar-uno";
        btnEliminarMini.dataset.id = idNoticia;
        btnEliminarMini.style.color = "#C8102E";
        btnEliminarMini.style.borderColor = "#C8102E";
        btnEliminarMini.style.padding = "2px 8px";
        btnEliminarMini.style.fontSize = "12px";
        btnEliminarMini.style.marginLeft = "6px";
        btnEliminarMini.innerHTML = "&#10005; Quitar";

        btnEstrella.parentNode.insertBefore(
          btnEliminarMini,
          btnEstrella.nextSibling,
        );
      }
    }
  }

  function renderizarMiniCRUD() {
    return (
      "" +
      '<div class="panel mt-32" style="background:var(--soft);padding:24px;border-radius:var(--radius);">' +
      "  <h3>Gestión básica de noticias (Mini CRUD)</h3>" +
      '  <p class="meta mt-8">Crea una noticia nueva seleccionando una imagen de tu equipo.</p>' +
      '  <form id="form-crear-noticia" class="mt-16" style="display:flex;flex-direction:column;gap:12px;">' +
      '    <input type="text" id="nuevo-titulo" placeholder="Título de la noticia" required style="padding:10px;border:1px solid var(--line);border-radius:6px;">' +
      '    <input type="text" id="nuevo-resumen" placeholder="Resumen corto" required style="padding:10px;border:1px solid var(--line);border-radius:6px;">' +
      "    " +
      '    <label style="font-size: 14px; font-weight: 500; margin-top: 4px;" for="nueva-imagen-archivo">Seleccionar imagen de tu equipo:</label>' +
      '    <input type="file" id="nueva-imagen-archivo" accept="image/*" required style="padding:8px;border:1px solid var(--line);border-radius:6px;background:#fff;">' +
      "    " +
      '    <label style="font-size: 14px; font-weight: 500; margin-top: 4px;">Seleccionar categoría:</label>' +
      '    <select id="nueva-categoria" style="padding:10px;border:1px solid var(--line);border-radius:6px;">' +
      datosGlobales.categorias
        .map(function (c) {
          return '<option value="' + c.id + '">' + c.nombre + "</option>";
        })
        .join("") +
      "    </select>" +
      '    <button type="submit" class="boton boton--primario boton--pequeno mt-8">Crear noticia</button>' +
      "  </form>" +
      "</div>"
    );
  }

  function conectarEventosFavoritos() {
    document.addEventListener("click", function (evento) {
      if (evento.target && evento.target.id === "btn-vaciar-fav") {
        if (confirm("¿Estás segura de vaciar tu lista de favoritos?")) {
          guardarFavoritos([]);
          renderizarFavoritos();
        }
      }
      if (evento.target && evento.target.id === "btn-ordenar-fav") {
        var favsIds = obtenerFavoritos();
        favsIds.reverse();
        guardarFavoritos(favsIds);
        renderizarFavoritos();
      }

      var btnEliminar = evento.target.closest(".btn-eliminar-uno");
      if (btnEliminar) {
        var idAEliminar = Number(btnEliminar.dataset.id);
        if (confirm("¿Deseas quitar esta noticia de favoritos?")) {
          var favs = obtenerFavoritos();
          var indexFav = favs.indexOf(idAEliminar);
          if (indexFav !== -1) {
            favs.splice(indexFav, 1);
            guardarFavoritos(favs);
          }

          var custom = obtenerNoticiasCustom();
          var customFiltrado = custom.filter(function (n) {
            return Number(n.id) !== idAEliminar;
          });
          if (customFiltrado.length !== custom.length) {
            guardarNoticiasCustom(customFiltrado);
            datosGlobales.noticias = customFiltrado.concat(
              datosGlobales.noticias.filter(function (n) {
                return (
                  custom.some(function (c) {
                    return Number(c.id) === Number(n.id);
                  }) === false
                );
              }),
            );
          }

          renderizarFavoritos();
        }
      }
    });

    document.addEventListener("submit", function (evento) {
      if (evento.target && evento.target.id === "form-crear-noticia") {
        evento.preventDefault();
        var titulo = document.getElementById("nuevo-titulo").value;
        var resumen = document.getElementById("nuevo-resumen").value;
        var categoria = document.getElementById("nueva-categoria").value;
        var inputArchivo = document.getElementById("nueva-imagen-archivo");

        if (inputArchivo.files && inputArchivo.files[0]) {
          var lector = new FileReader();
          lector.onload = function (e) {
            var imagenBase64 = e.target.result;

            var nueva = {
              id: Date.now(),
              titulo: titulo,
              resumen: resumen,
              categoria: categoria,
              fecha: new Date().toISOString().split("T")[0],
              lectura: 3,
              imagen: imagenBase64,
              contenido: [
                resumen,
                "Contenido de prueba generado desde el panel de gestión básica con imagen local.",
              ],
            };

            var custom = obtenerNoticiasCustom();
            custom.unshift(nueva);
            guardarNoticiasCustom(custom);

            datosGlobales.noticias.unshift(nueva);
            var favs = obtenerFavoritos();
            favs.push(Number(nueva.id));
            guardarFavoritos(favs);

            renderizarFavoritos();
            alert(
              "¡Noticia creada con tu imagen y agregada a favoritos con éxito!",
            );
          };
          lector.readAsDataURL(inputArchivo.files[0]);
        } else {
          alert("Por favor selecciona una imagen de tu equipo.");
        }
      }
    });
  }
});
