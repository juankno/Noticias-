/* ==========================================================================
   NewsWave - layout.js
   Comportamiento comun a todas las paginas: menu responsivo, buscador de la
   cabecera, fecha del encabezado y botones de favorito (estrella).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  /* --- Menu responsivo -------------------------------------------------- */

  var botonMenu = document.querySelector('.boton-menu');
  var menu = document.getElementById('menu-principal');

  if (botonMenu && menu) {
    botonMenu.addEventListener('click', function () {
      var abierto = menu.classList.toggle('abierto');
      botonMenu.setAttribute('aria-expanded', String(abierto));
      botonMenu.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });
  }

  /* --- Buscador de la cabecera ------------------------------------------ */

  // Envia la busqueda al listado de noticias (noticias.html?q=texto).
  var buscador = document.querySelector('.buscador-cabecera');

  if (buscador) {
    buscador.addEventListener('submit', function (evento) {
      evento.preventDefault();
      var texto = buscador.querySelector('input').value.trim();
      window.location.href = 'noticias.html' + (texto ? '?q=' + encodeURIComponent(texto) : '');
    });
  }

  /* --- Fecha del encabezado y año del pie ------------------------------- */

  var hoy = new Date();
  var fechaHoy = document.querySelector('[data-fecha-hoy]');
  var anio = document.querySelector('[data-anio]');

  if (fechaHoy) {
    var iso = hoy.getFullYear() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getDate();
    fechaHoy.textContent = 'Bogotá, Colombia · ' + NW.fechaLarga(iso);
  }
  if (anio) {
    anio.textContent = hoy.getFullYear();
  }

  /* --- Favoritos -------------------------------------------------------- */

  // Delegacion de eventos: las tarjetas se generan despues de cargar el JSON.
  document.addEventListener('click', function (evento) {
    var boton = evento.target.closest('.boton-favorito, .boton-favorito-detalle');
    if (!boton) { return; }

    NW.alternarFavorito(Number(boton.dataset.id));
    NW.sincronizarFavoritos();

    // Aviso para las vistas que dependen de la lista (favoritos.html).
    document.dispatchEvent(new CustomEvent('favoritos:cambio'));
  });

  NW.sincronizarFavoritos();
});
