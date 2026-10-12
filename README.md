# NewsWave — Prototipo funcional 

Plataforma web de noticias desarrollada para el módulo **Desarrollo de Front-end**.
Esta versión corresponde a la Entrega 2:

1. **Desarrollo en HTML, CSS y JavaScript**
2. **Renderizado dinámico del catálogo desde un archivo JSON**
3. **Favoritos y gestión de noticias propias (crear, editar y eliminar)**
4. **Formulario de contacto con validaciones**

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
Noticias-/
├── index.html              Página de inicio
├── noticias.html           Listado con filtros, búsqueda y paginación
├── detalle.html            Detalle de una noticia (recibe ?id=)
├── favoritos.html          Favoritos guardados y gestión de noticias propias
├── contacto.html           Formulario de contacto con validaciones
├── acerca.html             Página informativa del proyecto
├── assets/
│   ├── css/
│   │   └── styles.css      Hoja de estilos única, comentada por secciones
│   ├── js/
│   │   ├── datos.js        Carga del JSON, localStorage y utilidades compartidas
│   │   ├── layout.js       Menú responsivo, buscador, fecha y botón de favorito
│   │   ├── inicio.js       Render de la página de inicio
│   │   ├── noticias.js     Filtros, búsqueda, orden y paginación
│   │   ├── detalle.js      Render de la noticia y del panel lateral
│   │   ├── favoritos.js    Lista de favoritos y CRUD de noticias propias
│   │   └── contacto.js     Validación del formulario de contacto
│   └── img/                Imágenes de las noticias
└── data/
    ├── noticias.json       Fuente de datos del aplicativo
    └── noticias-respaldo.js  Copia generada del JSON (modo file://)
```

Cada página carga los scripts en este orden: `noticias-respaldo.js`, `datos.js`,
`layout.js` y, por último, el archivo de su vista.

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
- **Listado:** las 12 noticias (más las creadas por el usuario) con filtro por
  categoría, búsqueda en título, resumen, categoría, etiquetas y contenido (sin
  distinguir tildes ni mayúsculas), ordenamiento por fecha o título y paginación
  de 8 noticias por página. El buscador de la cabecera, presente en todas las
  páginas, lleva al listado con la búsqueda aplicada (`noticias.html?q=texto`).
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

## Punto 3 — Favoritos

La estrella de cada tarjeta guarda o quita la noticia en `localStorage`
(clave `newswave_favoritos`). En `favoritos.html` se listan las noticias
guardadas, se pueden ordenar por fecha, quitar una a una o vaciar la lista.
La misma página incluye un panel de gestión de noticias propias:

- **Crear:** título, resumen, categoría e imagen del equipo (se guarda en base64).
- **Leer:** las noticias creadas aparecen en favoritos y pueden abrirse en el detalle.
- **Editar:** el botón *Editar* de la tarjeta carga sus datos en el formulario; si
  no se elige otra imagen se conserva la actual.
- **Eliminar:** al quitar de favoritos una noticia propia, esta se borra.

Se guardan en `localStorage` con la clave `newswave_custom`.

## Punto 4 — Formulario con validaciones

`contacto.html` valida los campos obligatorios, el formato del correo y la
longitud mínima del mensaje, muestra el error debajo de cada campo y, si todo es
correcto, reemplaza el formulario por un mensaje de confirmación.

## Pendiente

- **Punto 6 — Repositorio en GitHub:** publicación del proyecto.

---

## Correspondencia con la Entrega Previa 1

El desarrollo respeta la maquetación aprobada: misma paleta, misma tipografía,
misma retícula de 12 columnas con 1.200 px de contenido y los mismos nueve
componentes definidos en el documento de la Entrega Previa 1.

Proyecto académico. Las noticias y las imágenes son material de demostración.
