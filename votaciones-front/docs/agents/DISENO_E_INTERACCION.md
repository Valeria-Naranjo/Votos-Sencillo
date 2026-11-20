# Diseño, interacción y comportamiento responsive

## Dirección visual

**Libro Operativo Municipal.** La interfaz conserva el guinda institucional, superficies blancas y neutros cálidos de VOTOS-SENCILLO. La prioridad es operar con rapidez y certeza; la marca vive en el color, la tipografía compacta y los estados, no en decoración adicional.

- Guinda para selección, foco y acción primaria.
- Verde y ocre sólo para estados semánticos, siempre acompañados por texto o icono.
- Bordes cálidos de 1px para grupos; sombra ambiental únicamente en paneles raíz.
- Radios: 8–10px en controles, 11–13px en filas/grupos y 15px en paneles.
- Una familia sans para títulos, labels y cuerpo. Jerarquía por peso y tamaño.
- No introducir gradientes decorativos, glassmorphism, emojis como iconos ni tarjetas anidadas.

## Shell de aplicación

- La topbar permanece `sticky` en la parte superior, altura visual de 64px más `safe-area-inset-top`.
- El contenido y los paneles pegados usan el offset `--header-h`.
- En escritorio el sidebar puede conservar rail compacto; bajo 1024px, cerrado ocupa 0px y abierto funciona como drawer con overlay.
- Menús: `min-width: 0`, ancho contenido, icono fijo y label con ellipsis. Ningún item debe sobresalir del sidebar.
- El dropdown de usuario debe escapar recortes y mantenerse dentro del viewport.
- Root y pantallas usan `min-height: 100dvh`; no depender de `100vh` en móvil.

## Jerarquía operativa

1. Título corto, descripción útil y acción principal.
2. Estado o resumen que cambie decisiones.
3. Búsqueda y filtros.
4. Contenido principal.
5. Feedback de carga, vacío, error y confirmación.

Las acciones importantes no dependen del hover. Editar y activar/desactivar permanecen visibles en touch.

## Espaciado y contención

- Escala: 4, 8, 12, 16, 18, 22 y 28px.
- Página: 28px escritorio, 18px tablet, 12–14px móvil.
- Paneles: 18–22px. Filas: 10–14px.
- Usar `gap` entre hermanos; evitar márgenes arbitrarios en cada hijo.
- Todo hijo flex/grid que pueda contener texto usa `min-width: 0`.
- Rutas, correos y códigos usan `overflow-wrap: anywhere`.
- `overflow: hidden` sólo redondea una superficie sin popovers; menús desplegables usan portal o ancestro visible.

## Responsive y touch

- 320–639px: una columna, acciones principales de ancho completo y tablas convertidas a filas apiladas.
- 640–979px: composición intermedia; formularios y listados pueden apilarse.
- 980px+: maestro/detalle o rail + contenido.
- Targets de 44px mínimo; 48px cuando la acción sea primaria en touch.
- Matrices de permisos pueden desplazarse o apilarse, pero pantalla y acciones nunca se separan conceptualmente.
- Probar 320, 375, 768, 1024 y 1440px, además de zoom 200% y nombres largos.
- Orden visual y DOM coinciden en todos los breakpoints.

## Movimiento

- Press: ~60ms. Cambios de estado: 150–250ms. Drawer: hasta 300ms.
- Animar sólo estado, carga o relación espacial.
- Respetar `prefers-reduced-motion` y no depender de animación para comprender el resultado.
- No escalar tarjetas en hover ni reanimar listas completas al actualizar datos.

## Estados y superficies del navegador

- Foco visible guinda con separación suficiente.
- Selección de texto, caret y scrollbar toman colores de la paleta.
- Disabled conserva el valor legible y explica por qué no se puede actuar.
- Loading mantiene la geometría para evitar saltos.
- Empty state explica qué falta y ofrece la siguiente acción.
- Error conserva los datos capturados y permite reintentar.

## Contenido

- Español claro y verbos concretos: Crear, Guardar cambios, Desactivar, Reactivar.
- Las confirmaciones incluyen entidad y consecuencia.
- No usar sinónimos para conceptos distintos: módulo, pantalla, rol, permiso y usuario.
- Los permisos especiales se muestran en lenguaje humano aunque su código interno use `snake_case`.

## Checklist antes de entregar

- Topbar visible durante scroll; sidebar sin desbordes.
- Márgenes y radios provienen de las escalas establecidas.
- Formularios operables por teclado y touch.
- Loading, vacío, error, disabled y éxito comprobados.
- Sin scroll horizontal global accidental.
- Menús, selects y tooltips no se recortan.
- Build TypeScript, pruebas backend y revisión visual desktop/móvil aprobados.
