/* ==========================================================================
   NewsWave - favoritos.js
   Vista de favoritos: listado guardado en localStorage, ordenamiento por
   fecha, vaciado de la lista y panel basico para crear noticias propias
   con una imagen del equipo del usuario.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var contenedor = document.getElementById("contenedor-favoritos");
  var datos = null;
  var ordenRecientes = true;

  NW.cargarDatos()
    .then(function (respuesta) {
      datos = respuesta;
      datos.noticias = NW.todasLasNoticias(datos);

      pintar();
      conectarEventos();
    })
    .catch(function (error) {
      NW.mostrarError(contenedor, error.message);
    });

  /* --- Pintado ---------------------------------------------------------- */

  function pintar() {
    var ids = NW.obtenerFavoritos();

    var favoritas = datos.noticias.filter(function (n) {
      return ids.indexOf(Number(n.id)) !== -1;
    });

    favoritas.sort(function (a, b) {
      return ordenRecientes
        ? b.fecha.localeCompare(a.fecha)
        : a.fecha.localeCompare(b.fecha);
    });

    contenedor.innerHTML =
      (favoritas.length === 0 ? plantillaVacia() : plantillaLista(favoritas)) +
      plantillaFormulario();

    NW.sincronizarFavoritos();
  }

  function plantillaVacia() {
    return (
      "" +
      '<div class="estado">' +
      '  <div class="estado__icono">&#9734;</div>' +
      '  <h3 class="mt-16">Todavía no tienes noticias guardadas</h3>' +
      '  <p class="estado__texto">Cuando marques una noticia con la estrella aparecerá en esta lista.</p>' +
      '  <a class="boton boton--oscuro mt-24" href="noticias.html">Explorar noticias</a>' +
      "</div>"
    );
  }

  function plantillaLista(favoritas) {
    return (
      "" +
      '<div class="favoritos__barra">' +
      "  <p><strong>" + favoritas.length + "</strong> noticias guardadas</p>" +
      '  <div class="favoritos__acciones">' +
      '    <button type="button" class="boton boton--claro boton--pequeno" id="btn-ordenar-fav">' +
      (ordenRecientes ? "Más antiguas primero" : "Más recientes primero") +
      "</button>" +
      '    <button type="button" class="boton boton--pequeno boton--peligro" id="btn-vaciar-fav">Vaciar lista</button>' +
      "  </div>" +
      "</div>" +
      '<div class="rejilla rejilla--4">' +
      favoritas
        .map(function (noticia) {
          return NW.plantillaTarjeta(datos, noticia, { quitar: true });
        })
        .join("") +
      "</div>"
    );
  }

  function plantillaFormulario() {
    var opciones = datos.categorias
      .map(function (c) {
        return '<option value="' + c.id + '">' + NW.limpiar(c.nombre) + "</option>";
      })
      .join("");

    return (
      "" +
      '<div class="panel panel--suave mt-40">' +
      "  <h3>Gestión básica de noticias</h3>" +
      '  <p class="meta mt-8">Crea una noticia nueva seleccionando una imagen de tu equipo. Se guardará en tus favoritos.</p>' +
      '  <form id="form-crear-noticia" class="formulario-crear mt-16">' +
      '    <div class="campo">' +
      '      <label for="nuevo-titulo">Título</label>' +
      '      <input type="text" id="nuevo-titulo" placeholder="Título de la noticia" required>' +
      "    </div>" +
      '    <div class="campo">' +
      '      <label for="nuevo-resumen">Resumen</label>' +
      '      <input type="text" id="nuevo-resumen" placeholder="Resumen corto" required>' +
      "    </div>" +
      '    <div class="campo">' +
      '      <label for="nueva-imagen-archivo">Imagen</label>' +
      '      <input type="file" id="nueva-imagen-archivo" accept="image/*" required>' +
      "    </div>" +
      '    <div class="campo">' +
      '      <label for="nueva-categoria">Categoría</label>' +
      '      <select id="nueva-categoria">' + opciones + "</select>" +
      "    </div>" +
      "    <div>" +
      '      <button type="submit" class="boton boton--primario boton--pequeno">Crear noticia</button>' +
      "    </div>" +
      "  </form>" +
      "</div>"
    );
  }

  /* --- Acciones --------------------------------------------------------- */

  function conectarEventos() {
    // La estrella de las tarjetas se gestiona en layout.js; aqui solo se repinta.
    document.addEventListener("favoritos:cambio", pintar);

    contenedor.addEventListener("click", function (evento) {
      if (evento.target.closest("#btn-ordenar-fav")) {
        ordenRecientes = !ordenRecientes;
        pintar();
        return;
      }

      if (evento.target.closest("#btn-vaciar-fav")) {
        if (confirm("¿Deseas vaciar tu lista de favoritos?")) {
          NW.guardarFavoritos([]);
          pintar();
        }
        return;
      }

      var botonQuitar = evento.target.closest(".boton-quitar");
      if (botonQuitar && confirm("¿Deseas quitar esta noticia de favoritos?")) {
        quitarNoticia(Number(botonQuitar.dataset.id));
        pintar();
      }
    });

    contenedor.addEventListener("submit", function (evento) {
      if (evento.target.id !== "form-crear-noticia") { return; }
      evento.preventDefault();
      crearNoticia();
    });
  }

  /** Quita la noticia de favoritos; si fue creada por el usuario, la elimina. */
  function quitarNoticia(id) {
    NW.guardarFavoritos(
      NW.obtenerFavoritos().filter(function (fav) { return fav !== id; })
    );

    var propias = NW.obtenerNoticiasPropias();
    var restantes = propias.filter(function (n) { return Number(n.id) !== id; });

    if (restantes.length !== propias.length) {
      NW.guardarNoticiasPropias(restantes);
      datos.noticias = datos.noticias.filter(function (n) {
        return Number(n.id) !== id;
      });
    }
  }

  function crearNoticia() {
    var titulo = document.getElementById("nuevo-titulo").value.trim();
    var resumen = document.getElementById("nuevo-resumen").value.trim();
    var categoria = document.getElementById("nueva-categoria").value;
    var archivo = document.getElementById("nueva-imagen-archivo").files[0];

    if (!archivo) {
      alert("Por favor selecciona una imagen de tu equipo.");
      return;
    }

    // La imagen se guarda como texto base64 para poder almacenarla en localStorage.
    var lector = new FileReader();
    lector.onload = function (e) {
      var nueva = {
        id: Date.now(),
        titulo: titulo,
        resumen: resumen,
        categoria: categoria,
        imagen: e.target.result,
        fecha: new Date().toISOString().split("T")[0],
        autor: "Usuario NewsWave",
        lectura: 3,
        contenido: [
          resumen,
          "Contenido de prueba generado desde el panel de gestión básica con imagen local.",
        ],
      };

      var propias = NW.obtenerNoticiasPropias();
      propias.unshift(nueva);
      NW.guardarNoticiasPropias(propias);
      datos.noticias.unshift(nueva);

      var favoritos = NW.obtenerFavoritos();
      favoritos.push(nueva.id);
      NW.guardarFavoritos(favoritos);

      pintar();
      alert("¡Noticia creada con tu imagen y agregada a favoritos con éxito!");
    };
    lector.readAsDataURL(archivo);
  }
});
