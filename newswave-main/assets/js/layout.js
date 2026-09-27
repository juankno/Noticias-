/* --- Gestión de Favoritos con localStorage ----------------------------- */

var CLAVE_FAVORITOS = "newswave_favoritos";

// Obtener la lista actual de favoritos desde localStorage asegurando que sean números
function obtenerFavoritos() {
  try {
    var favs = localStorage.getItem(CLAVE_FAVORITOS);
    return favs ? JSON.parse(favs).map(Number) : [];
  } catch (e) {
    return [];
  }
}

// Guardar la lista en localStorage
function guardarFavoritos(favs) {
  try {
    localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favs));
  } catch (e) {
    console.error("No se pudo guardar en localStorage", e);
  }
}

// Sincronizar el estado visual de todos los botones de favoritos en la página actual
function sincronizarBotonesFavoritos() {
  var favs = obtenerFavoritos();
  var botones = document.querySelectorAll(
    ".boton-favorito, .boton-favorito-detalle",
  );

  for (var i = 0; i < botones.length; i++) {
    // Aseguramos que el id del botón se convierta a número para compararlo correctamente
    var id = Number(botones[i].dataset.id);
    var esFav = favs.indexOf(id) !== -1;

    if (esFav) {
      botones[i].classList.add("activo");
      botones[i].innerHTML =
        "&#9733; " +
        (botones[i].classList.contains("boton-favorito-detalle")
          ? "Guardado"
          : "");
      botones[i].setAttribute("aria-pressed", "true");
    } else {
      botones[i].classList.remove("activo");
      botones[i].innerHTML =
        "&#9734; " +
        (botones[i].classList.contains("boton-favorito-detalle")
          ? "Agregar a favoritos"
          : "");
      botones[i].setAttribute("aria-pressed", "false");
    }
  }
}

// Escuchar clics en cualquier botón de favorito de la aplicación
document.addEventListener("click", function (evento) {
  var boton = evento.target.closest(".boton-favorito, .boton-favorito-detalle");
  if (!boton) {
    return;
  }

  var id = Number(boton.dataset.id); // Forzar conversión a número aquí también
  var favs = obtenerFavoritos();
  var index = favs.indexOf(id);

  if (index === -1) {
    favs.push(id); // Agregar
  } else {
    favs.splice(index, 1); // Remover
  }

  guardarFavoritos(favs);
  sincronizarBotonesFavoritos();

  // Si estamos en la página de favoritos, actualizar la vista automáticamente
  if (typeof actualizarVistaFavoritos === "function") {
    actualizarVistaFavoritos();
  }
});

// Ejecutar sincronización inicial al cargar la página
setTimeout(sincronizarBotonesFavoritos, 300);
