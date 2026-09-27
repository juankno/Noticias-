/* ==========================================================================
   NewsWave - noticias.js
   Listado de noticias: filtro por categoria, busqueda por titulo,
   ordenamiento por fecha y paginacion. Todo se calcula sobre el arreglo
   que se carga desde el archivo JSON local.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var POR_PAGINA = 8;

  var contenedor = document.getElementById('listado-noticias');
  var chips = document.getElementById('filtro-categorias');
  var buscador = document.getElementById('filtro-busqueda');
  var orden = document.getElementById('filtro-orden');
  var contador = document.getElementById('contador-resultados');
  var paginacion = document.getElementById('paginacion');

  var datos = null;
  var estado = {
    categoria: NW.parametro('categoria') || 'todas',
    texto: NW.parametro('q') || '',
    orden: 'recientes',
    pagina: 1
  };

  NW.cargarDatos()
    .then(function (respuesta) {
      datos = respuesta;
      pintarChips();

      if (buscador) { buscador.value = estado.texto; }

      conectarEventos();
      pintar();
    })
    .catch(function (error) {
      NW.mostrarError(contenedor, error.message);
    });

  /* --- Filtros ---------------------------------------------------------- */

  function pintarChips() {
    if (!chips) { return; }

    var lista = [{ id: 'todas', nombre: 'Todas' }].concat(datos.categorias);

    chips.innerHTML = lista.map(function (categoria) {
      var activo = categoria.id === estado.categoria ? ' activo' : '';
      return '<button type="button" class="chip' + activo + '" data-categoria="' +
        categoria.id + '">' + NW.limpiar(categoria.nombre) + '</button>';
    }).join('');
  }

  function conectarEventos() {
    if (chips) {
      chips.addEventListener('click', function (evento) {
        var boton = evento.target.closest('.chip');
        if (!boton) { return; }

        estado.categoria = boton.dataset.categoria;
        estado.pagina = 1;
        pintarChips();
        pintar();
      });
    }

    if (buscador) {
      buscador.addEventListener('input', function () {
        estado.texto = buscador.value;
        estado.pagina = 1;
        pintar();
      });
    }

    if (orden) {
      orden.addEventListener('change', function () {
        estado.orden = orden.value;
        estado.pagina = 1;
        pintar();
      });
    }

    if (paginacion) {
      paginacion.addEventListener('click', function (evento) {
        var boton = evento.target.closest('[data-pagina]');
        if (!boton) { return; }

        estado.pagina = Number(boton.dataset.pagina);
        pintar();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /** Aplica categoria, busqueda y ordenamiento sobre el catalogo completo. */
  function filtrar() {
    var texto = NW.normalizar(estado.texto.trim());

    var resultado = datos.noticias.filter(function (noticia) {
      var coincideCategoria = estado.categoria === 'todas' || noticia.categoria === estado.categoria;
      var coincideTexto = texto === '' ||
        NW.normalizar(noticia.titulo).indexOf(texto) !== -1 ||
        NW.normalizar(noticia.resumen).indexOf(texto) !== -1;

      return coincideCategoria && coincideTexto;
    });

    resultado.sort(function (a, b) {
      if (estado.orden === 'antiguas') {
        return a.fecha.localeCompare(b.fecha);
      }
      if (estado.orden === 'titulo') {
        return a.titulo.localeCompare(b.titulo, 'es');
      }
      return b.fecha.localeCompare(a.fecha);
    });

    return resultado;
  }

  /* --- Pintado ---------------------------------------------------------- */

  function pintar() {
    var resultado = filtrar();
    var paginas = Math.max(1, Math.ceil(resultado.length / POR_PAGINA));

    if (estado.pagina > paginas) { estado.pagina = paginas; }

    var desde = (estado.pagina - 1) * POR_PAGINA;
    var visibles = resultado.slice(desde, desde + POR_PAGINA);

    if (contador) {
      contador.innerHTML = resultado.length === 0
        ? 'No se encontraron noticias con los filtros seleccionados.'
        : 'Mostrando <strong>' + visibles.length + '</strong> de <strong>' +
          resultado.length + '</strong> noticias';
    }

    if (visibles.length === 0) {
      contenedor.innerHTML = '';
      contenedor.insertAdjacentHTML('beforeend',
        '<div class="estado" style="grid-column:1/-1">' +
        '<h3>Sin resultados</h3>' +
        '<p>Revisa la categoría seleccionada o intenta con otras palabras en el buscador.</p>' +
        '</div>');
    } else {
      contenedor.innerHTML = visibles.map(function (noticia) {
        return NW.plantillaTarjeta(datos, noticia);
      }).join('');
    }

    pintarPaginacion(paginas);
  }

  function pintarPaginacion(paginas) {
    if (!paginacion) { return; }

    if (paginas <= 1) {
      paginacion.innerHTML = '';
      return;
    }

    var html = '<button type="button" class="boton boton--claro boton--pequeno" data-pagina="' +
      (estado.pagina - 1) + '"' + (estado.pagina === 1 ? ' disabled' : '') + '>Anterior</button>';

    for (var i = 1; i <= paginas; i++) {
      var clase = i === estado.pagina ? 'boton--oscuro' : 'boton--claro';
      html += '<button type="button" class="boton ' + clase + ' boton--pequeno" data-pagina="' + i + '">' + i + '</button>';
    }

    html += '<button type="button" class="boton boton--claro boton--pequeno" data-pagina="' +
      (estado.pagina + 1) + '"' + (estado.pagina === paginas ? ' disabled' : '') + '>Siguiente</button>';

    paginacion.innerHTML = html;
  }
});
