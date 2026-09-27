# NewsWave — Prototipo funcional 

Plataforma web de noticias desarrollada para el módulo **Desarrollo de Front-end**.
Esta versión corresponde a los dos primeros puntos de la Entrega 2:

1. **Desarrollo en HTML, CSS y JavaScript**
2. **Renderizado dinámico del catálogo desde un archivo JSON**

No se utilizan librerías ni frameworks externos: todo está resuelto con HTML5,
CSS3 y JavaScript estándar (ES5/ES6 compatible con los navegadores actuales).

---

## Cómo ejecutar el proyecto

**Opción 1 — con un servidor local (recomendada).** Es la forma correcta, porque
el navegador permite leer el archivo JSON mediante `fetch`:

```bash
# desde la carpeta del proyecto
python -m http.server 8000
# luego abrir http://localhost:8000 en el navegador
```

También funciona con la extensión **Live Server** de Visual Studio Code
(clic derecho sobre `index.html` → *Open with Live Server*).

**Opción 2 — abriendo `index.html` con doble clic.** Los navegadores bloquean la
lectura de archivos locales con `fetch` por seguridad (protocolo `file://`). Para
que el sitio siga funcionando en ese caso se incluye una copia de respaldo del
catálogo en `data/noticias-respaldo.js`, que se usa automáticamente cuando el
`fetch` falla. El contenido de ese archivo se genera a partir del JSON y no debe
editarse a mano.

---

## Estructura del proyecto

```
newswave-app/
├── index.html              Página de inicio
├── noticias.html           Listado con filtros, búsqueda y paginación
├── detalle.html            Detalle de una noticia (recibe ?id=)
├── favoritos.html          Lista de favoritos (pendiente: punto 3)
├── contacto.html           Formulario de contacto (pendiente: punto 4)
├── acerca.html             Página informativa del proyecto
├── assets/
│   ├── css/
│   │   └── styles.css      Hoja de estilos única, comentada por secciones
│   ├── js/
│   │   ├── datos.js        Carga del JSON y utilidades compartidas
│   │   ├── layout.js       Menú responsivo, buscador y estado activo
│   │   ├── inicio.js       Render de la página de inicio
│   │   ├── noticias.js     Filtros, búsqueda, orden y paginación
│   │   └── detalle.js      Render de la noticia y del panel lateral
│   └── img/                Imágenes de las noticias
└── data/
    ├── noticias.json       Fuente de datos del aplicativo
    └── noticias-respaldo.js  Copia generada del JSON (modo file://)
```

---

## Punto 1 — Desarrollo en HTML, CSS y JavaScript

**HTML.** Las seis páginas usan etiquetas semánticas (`header`, `nav`, `main`,
`section`, `article`, `aside`, `footer`), atributos `alt` en las imágenes y
`aria-label` en los controles que no tienen texto visible.

**CSS.** Una sola hoja de estilos organizada en siete secciones comentadas. El
sistema de diseño se define con variables CSS (`--navy`, `--red`, `--line`, etc.),
las retículas se construyen con CSS Grid y los componentes internos con Flexbox.
El diseño es responsivo con tres puntos de quiebre:

| Dispositivo | Ancho | Comportamiento |
|---|---|---|
| Escritorio | 1025 px o más | Retícula de 4 columnas, menú horizontal |
| Tableta | 768 a 1024 px | Retícula de 2 columnas, detalle a una columna |
| Móvil | menos de 768 px | Una columna y menú desplegable |

**JavaScript.** El código está separado por responsabilidad: un archivo común
(`datos.js`) y un archivo por vista. Se evita el uso de variables globales sueltas
agrupando las funciones compartidas en el objeto `NW`.

## Punto 2 — Renderizado dinámico desde JSON

Ninguna noticia está escrita directamente en el HTML. El archivo
`data/noticias.json` contiene 12 noticias y 6 categorías, y toda la interfaz se
genera a partir de él:

- **Inicio:** noticia principal (campo `principal`), tres destacadas (campo
  `destacada`), tarjetas de categorías y los contadores del encabezado.
- **Listado:** las 12 noticias con filtro por categoría, búsqueda por título y
  resumen (sin distinguir tildes ni mayúsculas), ordenamiento por fecha o título
  y paginación de 8 noticias por página.
- **Detalle:** la noticia se ubica por el parámetro `?id=` de la dirección; si el
  identificador no existe se muestra un mensaje de error con un enlace de regreso.
  El panel lateral calcula las noticias relacionadas por categoría.

Para agregar una noticia basta con añadir un objeto al arreglo `noticias` del
archivo JSON: el sitio la muestra sin tocar el HTML.

### Estructura de cada noticia

```json
{
  "id": 1,
  "titulo": "Título de la noticia",
  "categoria": "tecnologia",
  "resumen": "Descripción breve que se muestra en la tarjeta.",
  "imagen": "assets/img/noticia-01.jpg",
  "credito": "Texto del pie de imagen.",
  "fecha": "2026-09-26",
  "autor": "Redacción NewsWave",
  "lectura": 4,
  "destacada": true,
  "principal": true,
  "tags": ["datos abiertos", "desarrollo web"],
  "contenido": ["Primer párrafo.", "Segundo párrafo."],
  "cita": "Frase destacada (opcional)."
}
```

---

## Pendiente para los siguientes puntos de la entrega

- **Punto 3 — Favoritos:** almacenar la lista con `localStorage` y mostrarla en
  `favoritos.html`. El botón de estrella ya existe en las tarjetas y cambia de
  estado visual, pero todavía no guarda la selección.
- **Punto 4 — Formularios con validaciones:** validar los campos obligatorios y
  el formato del correo en `contacto.html`, con mensajes de error y de
  confirmación.
- **Punto 5 — Código estructurado:** revisión final y documentación del código.
- **Punto 6 — Repositorio en GitHub:** publicación del proyecto.

---

## Correspondencia con la Entrega Previa 1

El desarrollo respeta la maquetación aprobada: misma paleta, misma tipografía,
misma retícula de 12 columnas con 1.200 px de contenido y los mismos nueve
componentes definidos en el documento de la Entrega Previa 1.

Proyecto académico. Las noticias y las imágenes son material de demostración.
