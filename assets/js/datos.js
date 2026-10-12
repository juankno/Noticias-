/* ==========================================================================
   NewsWave - datos.js
   Carga del archivo JSON local y utilidades compartidas por todas las vistas.
   Se expone un unico objeto global (NW) para evitar variables sueltas.
   ========================================================================== */

var NW = (function () {
  'use strict';

  var RUTA_JSON = 'data/noticias.json';
  var CLAVE_FAVORITOS = 'newswave_favoritos';
  var CLAVE_NOTICIAS_PROPIAS = 'newswave_custom';
  var cache = null; // se guarda la respuesta para no pedir el archivo varias veces

  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  /**
   * Carga el catalogo de noticias desde el archivo JSON local.
   * Si la pagina se abre con doble clic (protocolo file://) el navegador
   * bloquea fetch por seguridad; en ese caso se usa la copia de respaldo
   * que se incluye en data/noticias-respaldo.js.
   * @returns {Promise<Object>} objeto con categorias y noticias
   */
  function cargarDatos() {
    if (cache) {
      return Promise.resolve(cache);
    }
    return fetch(RUTA_JSON)
      .then(function (respuesta) {
        if (!respuesta.ok) {
          throw new Error('No se pudo leer el archivo JSON (' + respuesta.status + ')');
        }
        return respuesta.json();
      })
      .catch(function () {
        if (window.NOTICIAS_RESPALDO) {
          return window.NOTICIAS_RESPALDO;
        }
        throw new Error('No fue posible cargar el catálogo de noticias.');
      })
      .then(function (datos) {
        cache = datos;
        return cache;
      });
  }

  /** Devuelve el nombre legible de una categoria a partir de su id. */
  function nombreCategoria(datos, id) {
    var categoria = datos.categorias.filter(function (c) { return c.id === id; })[0];
    return categoria ? categoria.nombre : id;
  }

  /** Convierte "2026-09-26" en "26 de septiembre de 2026". */
  function fechaLarga(iso) {
    var p = iso.split('-');
    return Number(p[2]) + ' de ' + MESES[Number(p[1]) - 1] + ' de ' + p[0];
  }

  /** Convierte "2026-09-26" en "26 sep 2026". */
  function fechaCorta(iso) {
    var p = iso.split('-');
    return Number(p[2]) + ' ' + MESES_CORTOS[Number(p[1]) - 1] + ' ' + p[0];
  }

  /** Escapa texto antes de insertarlo en el HTML. */
  function limpiar(texto) {
    return String(texto)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Quita tildes y pasa a minusculas para comparar en las busquedas. */
  function normalizar(texto) {
    return String(texto)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }

  /** Lee un parametro de la direccion, por ejemplo detalle.html?id=3 */
  function parametro(nombre) {
    return new URLSearchParams(window.location.search).get(nombre);
  }

  /* --- Almacenamiento local (localStorage) ----------------------------- */

  function leerLista(clave) {
    try {
      var valor = localStorage.getItem(clave);
      return valor ? JSON.parse(valor) : [];
    } catch (e) {
      return [];
    }
  }

  function guardarLista(clave, lista) {
    try {
      localStorage.setItem(clave, JSON.stringify(lista));
    } catch (e) {
      console.error('No se pudo guardar en localStorage', e);
    }
  }

  /** Ids de las noticias marcadas como favoritas (siempre numericos). */
  function obtenerFavoritos() {
    return leerLista(CLAVE_FAVORITOS).map(Number);
  }

  function guardarFavoritos(ids) {
    guardarLista(CLAVE_FAVORITOS, ids);
  }

  /** Agrega o quita una noticia de favoritos. Devuelve true si quedo guardada. */
  function alternarFavorito(id) {
    var favoritos = obtenerFavoritos();
    var indice = favoritos.indexOf(id);

    if (indice === -1) {
      favoritos.push(id);
    } else {
      favoritos.splice(indice, 1);
    }

    guardarFavoritos(favoritos);
    return indice === -1;
  }

  /** Noticias creadas por el usuario desde el panel de gestion. */
  function obtenerNoticiasPropias() {
    return leerLista(CLAVE_NOTICIAS_PROPIAS);
  }

  function guardarNoticiasPropias(noticias) {
    guardarLista(CLAVE_NOTICIAS_PROPIAS, noticias);
  }

  /** Catalogo del JSON precedido por las noticias creadas por el usuario. */
  function todasLasNoticias(datos) {
    return obtenerNoticiasPropias().concat(datos.noticias);
  }

  /* --- Plantillas y estados --------------------------------------------- */

  /**
   * Construye el HTML de una tarjeta de noticia.
   * Se usa en el inicio, en el listado y en la vista de favoritos.
   * Con opciones.quitar se agrega el boton para retirarla de favoritos y
   * con opciones.editar el boton para modificarla (solo noticias propias).
   */
  function plantillaTarjeta(datos, noticia, opciones) {
    var botonQuitar = opciones && opciones.quitar
      ? '        <button class="boton boton--pequeno boton--peligro boton-quitar" type="button" data-id="' + noticia.id + '">&#10005; Quitar</button>'
      : '';
    var botonEditar = opciones && opciones.editar
      ? '        <button class="boton boton--claro boton--pequeno boton-editar" type="button" data-id="' + noticia.id + '">&#9998; Editar</button>'
      : '';

    return '' +
      '<article class="tarjeta">' +
      '  <a href="detalle.html?id=' + noticia.id + '">' +
      '    <img class="tarjeta__imagen" src="' + noticia.imagen + '" alt="' + limpiar(noticia.titulo) + '" loading="lazy">' +
      '  </a>' +
      '  <div class="tarjeta__cuerpo">' +
      '    <span class="etiqueta">' + limpiar(nombreCategoria(datos, noticia.categoria)) + '</span>' +
      '    <h3 class="tarjeta__titulo"><a href="detalle.html?id=' + noticia.id + '">' + limpiar(noticia.titulo) + '</a></h3>' +
      '    <p class="tarjeta__resumen">' + limpiar(noticia.resumen) + '</p>' +
      '    <div class="tarjeta__pie">' +
      '      <span class="meta">' + fechaCorta(noticia.fecha) + ' &middot; ' + noticia.lectura + ' min</span>' +
      '      <div class="tarjeta__acciones">' +
      '        <button class="boton-favorito" type="button" data-id="' + noticia.id + '" ' +
      '                title="Guardar en favoritos" aria-label="Guardar en favoritos">&#9734;</button>' +
      botonEditar +
      botonQuitar +
      '        <a class="boton boton--claro boton--pequeno" href="detalle.html?id=' + noticia.id + '">Ver más</a>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '</article>';
  }

  /** Actualiza el estado visual de todos los botones de favorito de la pagina. */
  function sincronizarFavoritos() {
    var favoritos = obtenerFavoritos();
    var botones = document.querySelectorAll('.boton-favorito, .boton-favorito-detalle');

    for (var i = 0; i < botones.length; i++) {
      var boton = botones[i];
      var guardado = favoritos.indexOf(Number(boton.dataset.id)) !== -1;
      var esDetalle = boton.classList.contains('boton-favorito-detalle');

      boton.classList.toggle('activo', guardado);
      boton.setAttribute('aria-pressed', String(guardado));

      if (esDetalle) {
        boton.innerHTML = guardado ? '&#9733; Guardado' : '&#9734; Agregar a favoritos';
      } else {
        boton.innerHTML = guardado ? '&#9733;' : '&#9734;';
      }
    }
  }

  /** Muestra un mensaje de error dentro de un contenedor. */
  function mostrarError(contenedor, mensaje) {
    contenedor.innerHTML = '<div class="estado"><h3>No fue posible mostrar la información</h3>' +
      '<p>' + limpiar(mensaje) + '</p></div>';
  }

  return {
    cargarDatos: cargarDatos,
    nombreCategoria: nombreCategoria,
    fechaLarga: fechaLarga,
    fechaCorta: fechaCorta,
    limpiar: limpiar,
    normalizar: normalizar,
    parametro: parametro,
    obtenerFavoritos: obtenerFavoritos,
    guardarFavoritos: guardarFavoritos,
    alternarFavorito: alternarFavorito,
    obtenerNoticiasPropias: obtenerNoticiasPropias,
    guardarNoticiasPropias: guardarNoticiasPropias,
    todasLasNoticias: todasLasNoticias,
    plantillaTarjeta: plantillaTarjeta,
    sincronizarFavoritos: sincronizarFavoritos,
    mostrarError: mostrarError
  };
})();
