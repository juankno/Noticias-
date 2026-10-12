/* ==========================================================================
   NewsWave - contacto.js
   Validación del formulario de contacto y manejo de estados de éxito/error.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var form = document.getElementById("formulario-contacto");
  if (!form) {
    return;
  }

  form.addEventListener("reset", limpiarErrores);

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();

    // Limpiar errores previos
    limpiarErrores();

    var nombre = document.getElementById("nombre");
    var correo = document.getElementById("correo");
    var asunto = document.getElementById("asunto");
    var mensaje = document.getElementById("mensaje");

    var esValido = true;

    // Validar nombre
    if (!nombre.value.trim()) {
      mostrarErrorCampo(nombre, "Por favor, escribe tu nombre completo.");
      esValido = false;
    }

    // Validar correo
    var regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correo.value.trim()) {
      mostrarErrorCampo(correo, "El correo electrónico es obligatorio.");
      esValido = false;
    } else if (!regexCorreo.test(correo.value.trim())) {
      mostrarErrorCampo(
        correo,
        "Por favor, ingresa un correo electrónico válido.",
      );
      esValido = false;
    }

    // Validar asunto
    if (!asunto.value) {
      mostrarErrorCampo(asunto, "Selecciona una opción de asunto.");
      esValido = false;
    }

    // Validar mensaje
    if (!mensaje.value.trim() || mensaje.value.trim().length < 10) {
      mostrarErrorCampo(
        mensaje,
        "El mensaje debe contener al menos 10 caracteres.",
      );
      esValido = false;
    }

    if (esValido) {
      mostrarExito();
    }
  });

  function mostrarErrorCampo(elemento, mensajeTexto) {
    var contenedorCampo = elemento.closest(".campo");
    if (!contenedorCampo) {
      return;
    }

    var error = document.createElement("p");
    error.className = "campo__error";
    error.textContent = mensajeTexto;

    contenedorCampo.classList.add("campo--error");
    contenedorCampo.appendChild(error);
  }

  function limpiarErrores() {
    var campos = form.querySelectorAll(".campo--error");
    for (var i = 0; i < campos.length; i++) {
      campos[i].classList.remove("campo--error");
    }
    var mensajesError = form.querySelectorAll(".campo__error");
    for (var j = 0; j < mensajesError.length; j++) {
      mensajesError[j].remove();
    }
  }

  function mostrarExito() {
    form.innerHTML =
      "" +
      '<div class="estado">' +
      '  <div class="estado__icono estado__icono--exito">&#10004;</div>' +
      '  <h3 class="mt-16">¡Mensaje enviado con éxito!</h3>' +
      '  <p class="meta mt-8">Gracias por contactarnos. Nuestro equipo revisará tu solicitud y te responderá pronto.</p>' +
      '  <a class="boton boton--oscuro mt-24" href="index.html">Volver al inicio</a>' +
      "</div>";
  }
});
