/* ==========================================================================
   NewsWave - detalle.js
   Muestra una noticia completa. El identificador se recibe por la direccion
   (detalle.html?id=3) y el contenido se toma del archivo JSON local.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var contenedor = document.getElementById("detalle-noticia");
  var lateral = document.getElementById("detalle-lateral");
  var ruta = document.getElementById("ruta-categoria");

  NW.cargarDatos()
    .then(function (datos) {
      // Se incluyen las noticias creadas por el usuario para poder mostrarlas.
      datos.noticias = NW.todasLasNoticias(datos);

      var id = Number(NW.parametro("id"));
      var noticia = datos.noticias.filter(function (n) {
        return Number(n.id) === id;
      })[0];

      if (!noticia) {
        contenedor.innerHTML =
          '<div class="estado"><h3>Noticia no encontrada</h3>' +
          "<p>La noticia solicitada no existe o fue retirada del catálogo.</p>" +
          '<a class="boton boton--oscuro mt-16" href="noticias.html">Volver al listado</a></div>';
        if (lateral) {
          lateral.innerHTML = "";
        }
        return;
      }

      document.title = noticia.titulo + " | NewsWave";
      pintarNoticia(datos, noticia);
      pintarLateral(datos, noticia);
      NW.sincronizarFavoritos();
      conectarCompartir(noticia);
    })
    .catch(function (error) {
      NW.mostrarError(contenedor, error.message);
    });

  function pintarNoticia(datos, noticia) {
    if (ruta) {
      ruta.textContent = NW.nombreCategoria(datos, noticia.categoria);
    }

    var parrafos = noticia.contenido.map(function (texto) {
      return "<p>" + NW.limpiar(texto) + "</p>";
    });

    // La cita se ubica despues del primer parrafo cuando existe.
    if (noticia.cita) {
      parrafos.splice(
        1,
        0,
        '<blockquote class="detalle__cita">' +
          NW.limpiar(noticia.cita) +
          "</blockquote>",
      );
    }

    var tags = (noticia.tags || [])
      .map(function (tag) {
        return '<span class="etiqueta">' + NW.limpiar(tag) + "</span>";
      })
      .join("");

    contenedor.innerHTML =
      "" +
      '<span class="etiqueta etiqueta--roja">' +
      NW.limpiar(NW.nombreCategoria(datos, noticia.categoria)) +
      "</span>" +
      "<h1>" +
      NW.limpiar(noticia.titulo) +
      "</h1>" +
      '<p class="entradilla">' +
      NW.limpiar(noticia.resumen) +
      "</p>" +
      '<div class="detalle__firma">' +
      '  <div class="detalle__autor">' +
      "    <div>" +
      '      <div style="font-weight:700;font-size:14px">' +
      NW.limpiar(noticia.autor) +
      "</div>" +
      '      <div class="meta">' +
      NW.fechaLarga(noticia.fecha) +
      " &middot; " +
      noticia.lectura +
      " min de lectura</div>" +
      "    </div>" +
      "  </div>" +
      '  <div class="detalle__acciones">' +
      '    <button class="boton boton--primario boton--pequeno boton-favorito-detalle" type="button" data-id="' +
      noticia.id +
      '">' +
      "      &#9734; Agregar a favoritos</button>" +
      '    <a class="boton boton--claro boton--pequeno" href="contacto.html">&#9993; Contactar</a>' +
      '    <button class="boton boton--claro boton--pequeno" type="button" id="btn-compartir">&#8599; Compartir</button>' +
      "  </div>" +
      "</div>" +
      '<img class="detalle__imagen" src="' +
      noticia.imagen +
      '" alt="' +
      NW.limpiar(noticia.titulo) +
      '">' +
      '<p class="meta mt-8">' +
      NW.limpiar(noticia.credito || "") +
      "</p>" +
      '<div class="detalle__cuerpo">' +
      parrafos.join("") +
      "</div>" +
      '<div class="detalle__tags">' +
      tags +
      "</div>";
  }

  function pintarLateral(datos, noticia) {
    if (!lateral) {
      return;
    }

    var relacionadas = datos.noticias.filter(function (n) {
      return n.id !== noticia.id && n.categoria === noticia.categoria;
    });

    // Si la categoria no tiene suficientes noticias se completan con las mas recientes.
    if (relacionadas.length < 3) {
      var otras = datos.noticias.filter(function (n) {
        return n.id !== noticia.id && relacionadas.indexOf(n) === -1;
      });
      relacionadas = relacionadas.concat(otras);
    }

    relacionadas = relacionadas.slice(0, 3);

    lateral.innerHTML =
      "" +
      '<div class="panel">' +
      '  <h3 class="panel__titulo">En esta noticia</h3>' +
      "  <dl>" +
      "    <dt>Categoría</dt><dd>" +
      NW.limpiar(NW.nombreCategoria(datos, noticia.categoria)) +
      "</dd>" +
      "    <dt>Publicada</dt><dd>" +
      NW.fechaCorta(noticia.fecha) +
      "</dd>" +
      "    <dt>Autor</dt><dd>" +
      NW.limpiar(noticia.autor) +
      "</dd>" +
      "    <dt>Lectura</dt><dd>" +
      noticia.lectura +
      " min</dd>" +
      '    <dt>Estado</dt><dd data-estado-favorito="' +
      noticia.id +
      '"></dd>' +
      "  </dl>" +
      "</div>" +
      '<h3 class="mt-24" style="font-size:21px">Noticias relacionadas</h3>' +
      '<div class="relacionadas">' +
      relacionadas
        .map(function (n) {
          return (
            "" +
            '<a class="relacionada" href="detalle.html?id=' +
            n.id +
            '">' +
            '  <img src="' +
            n.imagen +
            '" alt="' +
            NW.limpiar(n.titulo) +
            '" loading="lazy">' +
            "  <div><h4>" +
            NW.limpiar(n.titulo) +
            "</h4>" +
            '  <div class="meta mt-8">' +
            NW.fechaCorta(n.fecha) +
            "</div></div>" +
            "</a>"
          );
        })
        .join("") +
      "</div>" +
      '<div class="panel panel--suave mt-24">' +
      '  <h3 style="font-size:19px">¿Tienes información sobre este tema?</h3>' +
      '  <p class="meta mt-8">Escríbenos y la redacción revisará tu aporte.</p>' +
      '  <a class="boton boton--oscuro boton--pequeno mt-16" href="contacto.html">Ir al formulario</a>' +
      "</div>";
  }

  /**
   * Comparte la noticia con el menu nativo del dispositivo; si el navegador
   * no lo soporta, copia el enlace al portapapeles.
   */
  function conectarCompartir(noticia) {
    var boton = document.getElementById("btn-compartir");
    if (!boton) {
      return;
    }

    boton.addEventListener("click", function () {
      var enlace = window.location.href;

      if (navigator.share) {
        navigator.share({ title: noticia.titulo, text: noticia.resumen, url: enlace })
          .catch(function () {}); // el usuario cerro el menu
        return;
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(enlace).then(function () {
          boton.innerHTML = "&#10004; Enlace copiado";
          setTimeout(function () { boton.innerHTML = "&#8599; Compartir"; }, 2000);
        });
        return;
      }

      window.prompt("Copia el enlace de la noticia:", enlace);
    });
  }
});
