/* ==========================================================================
   NewsWave - inicio.js
   Renderiza la noticia principal, las noticias destacadas y las secciones
   tematicas de la pagina de inicio a partir del archivo JSON.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var principal = document.getElementById('noticia-principal');
  var destacadas = document.getElementById('noticias-destacadas');
  var secciones = document.getElementById('secciones-tematicas');
  var totalNoticias = document.getElementById('total-noticias');
  var totalCategorias = document.getElementById('total-categorias');

  NW.cargarDatos()
    .then(function (datos) {
      pintarPrincipal(datos);
      pintarDestacadas(datos);
      pintarSecciones(datos);

      if (totalNoticias) { totalNoticias.textContent = datos.noticias.length; }
      if (totalCategorias) { totalCategorias.textContent = datos.categorias.length; }
    })
    .catch(function (error) {
      if (destacadas) { NW.mostrarError(destacadas, error.message); }
    });

  /** Noticia marcada como principal en el JSON. */
  function pintarPrincipal(datos) {
    if (!principal) { return; }

    var noticia = datos.noticias.filter(function (n) { return n.principal; })[0] || datos.noticias[0];

    principal.innerHTML = '' +
      '<div>' +
      '  <span class="antetitulo">Noticia destacada</span>' +
      '  <h1>' + NW.limpiar(noticia.titulo) + '</h1>' +
      '  <p class="entradilla">' + NW.limpiar(noticia.resumen) + '</p>' +
      '  <div class="principal__acciones">' +
      '    <a class="boton boton--primario" href="detalle.html?id=' + noticia.id + '">Leer la noticia</a>' +
      '    <a class="boton boton--claro" href="noticias.html">Explorar todas las secciones</a>' +
      '  </div>' +
      '  <div class="principal__cifras">' +
      '    <div><strong id="total-noticias">' + datos.noticias.length + '</strong>' +
      '         <span class="meta">Noticias publicadas</span></div>' +
      '    <div><strong id="total-categorias">' + datos.categorias.length + '</strong>' +
      '         <span class="meta">Categorías temáticas</span></div>' +
      '    <div><strong>24/7</strong><span class="meta">Actualización continua</span></div>' +
      '  </div>' +
      '</div>' +
      '<img class="principal__imagen" src="' + noticia.imagen + '" alt="' + NW.limpiar(noticia.titulo) + '">';
  }

  /** Las tres noticias marcadas como destacadas. */
  function pintarDestacadas(datos) {
    if (!destacadas) { return; }

    var lista = datos.noticias.filter(function (n) { return n.destacada; }).slice(0, 3);

    if (lista.length === 0) {
      lista = datos.noticias.slice(0, 3);
    }

    destacadas.innerHTML = lista.map(function (noticia) {
      return NW.plantillaTarjeta(datos, noticia);
    }).join('');
  }

  /** Tarjetas de las categorias disponibles. */
  function pintarSecciones(datos) {
    if (!secciones) { return; }

    var iconos = {
      tecnologia: '&#128187;', educacion: '&#127891;', turismo: '&#129517;',
      comercial: '&#128722;', ciencia: '&#128300;', deportes: '&#127942;'
    };

    secciones.innerHTML = datos.categorias.slice(0, 4).map(function (categoria) {
      return '' +
        '<a class="tarjeta-seccion" href="noticias.html?categoria=' + categoria.id + '">' +
        '  <div class="tarjeta-seccion__icono">' + (iconos[categoria.id] || '&#128240;') + '</div>' +
        '  <h3>' + NW.limpiar(categoria.nombre) + '</h3>' +
        '  <p>' + NW.limpiar(categoria.descripcion) + '</p>' +
        '</a>';
    }).join('');
  }
});
