---
name: Tu Voz Transforma — Sistema operativo municipal
description: Un sistema administrativo compacto, contenido y explícito para operar votación, catálogos y control de acceso.
colors:
  institutional-wine: "#761c35"
  shell-wine: "#651d32"
  focus-wine: "#9b2242"
  wine-deep: "#6e1738"
  warm-ground: "#f6f4f1"
  app-ground: "#f5f3ef"
  surface: "#ffffff"
  surface-muted: "#f6f3f1"
  surface-selected: "#f3e8ec"
  shell-ink: "#130d0e"
  ink: "#232323"
  ink-muted: "#6d6865"
  border: "#e8e2df"
  divider: "#eee9e6"
  success-ink: "#25643c"
  success-surface: "#e7f4eb"
  notice-ink: "#6d5520"
  notice-surface: "#f5f0e4"
  danger-ink: "#a33232"
  danger-surface: "#f9e8e8"
typography:
  display:
    fontFamily: "Nunito Sans, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 850
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Nunito Sans, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 850
    lineHeight: 1.25
  title:
    fontFamily: "Nunito Sans, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 850
    lineHeight: 1.3
  body:
    fontFamily: "Nunito Sans, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Nunito Sans, sans-serif"
    fontSize: "0.74rem"
    fontWeight: 750
    lineHeight: 1.25
rounded:
  field-sm: "5px"
  compact: "7px"
  control: "8px"
  field: "10px"
  row: "11px"
  group: "13px"
  panel: "15px"
  shell: "16px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  base: "16px"
  lg: "18px"
  xl: "22px"
  page: "28px"
components:
  button-primary:
    backgroundColor: "{colors.institutional-wine}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.field}"
    padding: "9px 15px"
    height: "44px"
  button-icon:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.shell-wine}"
    rounded: "{rounded.control}"
    size: "44px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "9px 11px"
    height: "42px"
  field-search:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "0 12px"
    height: "42px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
  tab-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.institutional-wine}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
  permission-chip:
    backgroundColor: "{colors.warm-ground}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "6px 8px"
  status-active:
    backgroundColor: "{colors.success-surface}"
    textColor: "{colors.success-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 8px"
---

# Design System: Tu Voz Transforma — Sistema operativo municipal

## Overview

**Creative North Star: "El Libro Operativo Municipal"**

La aplicación se comporta como un registro administrativo contemporáneo: sobrio, explícito y preparado para decisiones repetidas con poco margen de error. Superficies blancas se apoyan sobre un suelo neutro cálido; la barra superior y el lateral oscuro anclan el contexto, mientras el guinda institucional concentra selección, foco y confirmación.

La densidad es compacta sin ser críptica. El shell permanece estable durante el desplazamiento, los textos largos nunca rompen sus contenedores y los formularios conservan una secuencia predecible desde el dato hasta la acción. Las vistas de acceso y menús son la expresión más completa del sistema: catálogo o editor a la izquierda, trabajo operativo a la derecha y una transformación deliberada a una sola columna en pantallas pequeñas.

**Key Characteristics:**

- Shell institucional estable con topbar guinda fija al flujo y navegación lateral oscura contenida.
- Fondo cálido y paneles blancos con profundidad ambiental reservada a superficies raíz.
- Guinda concentrado en selección, foco, acciones y cifras relevantes.
- Jerarquía sans compacta, títulos fuertes y metadatos silenciosos.
- Rejilla de formulario de doce columnas que colapsa a una columna sin clases dinámicas.
- Listas operativas que pasan de tabla a filas apiladas; las matrices conservan juntos objeto y permisos.

## Colors

La paleta combina vino institucional, negro cálido, superficies marfil y estados semánticos discretos. El color informa contexto y consecuencia; no rellena el espacio de trabajo por decoración.

### Primary

- **Guinda institucional:** acción primaria, rol seleccionado y controles confirmatorios.
- **Guinda de shell:** topbar, jerarquía de navegación y contraste institucional persistente.
- **Guinda de foco:** foco de campos, selección nativa y detalles activos.
- **Vino profundo:** hover de acciones primarias y texto de acciones secundarias.

### Neutral

- **Suelo cálido y suelo de aplicación:** fondos continuos detrás de las superficies de trabajo.
- **Superficie blanca:** paneles, campos, pestañas y barras de acciones.
- **Superficie tenue:** encabezados de grupo, tipos y controles auxiliares.
- **Superficie seleccionada:** selección de rol y hover operativo de baja intensidad.
- **Tinta de shell, tinta operativa y tinta silenciosa:** navegación, contenido principal y metadatos.
- **Borde y divisor cálidos:** separación de grupos y filas sin endurecer la interfaz.

### Tertiary

- **Éxito sobrio:** activo y resultado correcto, siempre como pareja de tinta y superficie.
- **Aviso cálido:** restricciones y consecuencias de seguridad.
- **Peligro administrativo:** error, desactivación y acciones irreversibles; nunca depende sólo del color.

### Named Rules

**The Concentrated Wine Rule.** El guinda marca selección, foco o acción; las grandes áreas de lectura permanecen neutras.

**The Semantic Pair Rule.** Éxito, aviso y peligro combinan tinta, superficie, texto o icono; ningún estado se comunica únicamente por color.

## Typography

**Display Font:** Nunito Sans (con respaldo sans-serif)
**Body Font:** Nunito Sans (con respaldo sans-serif)

**Character:** Una sans humanista sostiene la lectura operativa. Peso, escala, espaciado y contraste —no una voz ornamental— distinguen página, panel, entidad, explicación y acción.

### Hierarchy

- **Display** (850, 1.75rem, 1.2): título único de una vista operativa.
- **Headline** (850, 1.1rem, 1.25): rol seleccionado, editor o encabezado principal de panel.
- **Title** (850, 0.9rem, 1.3): módulos, grupos, entidades y encabezados de tabla.
- **Body** (400, 0.9rem, 1.45): contenido y explicación de alcance o consecuencia.
- **Label** (750, 0.74rem, 1.25): acciones, permisos, campos y metadatos compactos; sólo los rótulos estructurales usan mayúsculas e interletraje amplio.

### Named Rules

**The One Operational Voice Rule.** Las superficies administrativas usan una sola voz sans; la jerarquía proviene de peso y escala, no de tipografías decorativas.

## Layout

El shell ocupa al menos toda la altura dinámica del viewport. La topbar mide visualmente 64px más el área segura, permanece pegada arriba con una capa superior y conserva en el flujo el espacio que necesita el contenido. El área principal y todos los hijos flex/grid usan ancho flexible y `min-width: 0`; la navegación recorta etiquetas largas con elipsis en vez de extender el sidebar.

Las vistas de control usan composición maestro/detalle. Roles y permisos reservan 250px al catálogo con 18px de separación; Menús reserva entre 300 y 360px al editor y deja el listado flexible. Ambos paneles laterales pueden permanecer pegados bajo la topbar. El lienzo usa 28px en escritorio, 18px en tablet y 12–14px en móvil.

Los formularios canónicos usan doce columnas y cada campo declara su tramo mediante una propiedad CSS estable. Bajo 640px todos los campos ocupan una sola columna y la barra de acciones pasa de dos columnas a una. Las acciones permanecen pegadas al borde inferior del formulario cuando el cuerpo se desplaza.

A 1023px o menos el sidebar cerrado ocupa 0px y el abierto se comporta como drawer. A 980px Menús apila editor y listado; a 900px Roles convierte el catálogo en tira horizontal; a 680px las tablas de menús se vuelven filas apiladas; a 620–639px se compactan márgenes, títulos del shell y acciones.

**The Contained Navigation Rule.** Icono, etiqueta y badge viven dentro del ancho del sidebar; las cadenas largas se recortan, nunca empujan el contenedor.

**The Grouped Decision Rule.** Una entidad y sus acciones permanecen juntas al cambiar de breakpoint; una pantalla nunca se separa conceptualmente de sus permisos.

**The Stable Actions Rule.** En formularios desplazables, encabezado y barra de acciones permanecen estables y sólo el cuerpo consume el scroll.

## Elevation & Depth

El sistema combina capas tonales con elevación ambiental. Bordes y fondos separan el contenido interno; sólo el shell, los paneles raíz, la selección y el foco reciben sombra. La profundidad explica jerarquía o estado y no convierte cada bloque en una tarjeta.

### Shadow Vocabulary

- **Shell estable** (`0 2px 14px rgba(19, 13, 14, .18)`): separa la topbar persistente del contenido en scroll.
- **Panel ambiental** (`0 8px 26px rgba(50, 42, 38, .07)`): eleva catálogos, editores y listados raíz.
- **Selección baja** (`0 2px 8px rgba(49, 39, 35, .09)`): pestañas y opciones segmentadas activas.
- **Halo de campo** (`0 0 0 3px rgba(155, 34, 66, .1)`): búsqueda, select y campo enfocado.

### Named Rules

**The Quiet Depth Rule.** La sombra pertenece a jerarquía, selección y foco; grupos, filas y chips permanecen planos.

## Shapes

La geometría escala con el objeto: campos compactos usan 5–9px, controles principales 10px, filas 11px, grupos 13px y paneles 15–16px. Estados y contadores pequeños usan cápsulas completas. Los bordes son finos y cálidos; el trazo discontinuo identifica una ranura de creación, no una decoración general.

Los controles interactivos principales miden al menos 44px por lado. Paneles que contienen tablas pueden recortar sus esquinas; editores con selects, menús o popovers conservan overflow visible o portalan la capa flotante.

## Components

### Buttons

- **Shape:** acción primaria de 44px de alto y radio de 10px; acciones iconográficas cuadradas de 44px y radio de 9px.
- **Primary:** guinda institucional, texto blanco y relleno horizontal compacto; reserva el peso alto para el verbo.
- **Hover / Focus:** vino más profundo en hover y contorno guinda translúcido con separación en foco visible.
- **Secondary / Danger:** superficie blanca con borde cálido; peligro conserva el mismo lugar y geometría, cambia a tinta roja explícita.
- **Disabled:** reduce contraste sin ocultar el valor o la intención; el texto informa progreso o ausencia de cambios.

### Chips

- **Style:** permisos estándar sobre gris cálido; permisos especiales sobre ocre tenue; estados sobre cápsulas semánticas.
- **State:** una casilla guinda acompaña la selección y la etiqueta conserva lenguaje humano aunque el código interno use `snake_case`.

### Cards / Containers

- **Corner Style:** paneles raíz de 15–16px y grupos internos de 13px.
- **Background:** blanco sobre suelo neutro cálido.
- **Shadow Strategy:** elevación ambiental sólo en paneles raíz; filas internas se separan por divisores.
- **Border:** trazo cálido de 1px para grupos, formularios compactos y filas.
- **Internal Padding:** 18–22px en paneles; 10–14px en filas y encabezados densos.

### Inputs / Fields

- **Style:** superficie blanca, borde cálido, radio de 8–10px, altura de 42px y etiqueta superior asociada.
- **Focus:** borde guinda y halo tonal de 3px; búsqueda usa `focus-within` para tratar icono y campo como una sola unidad.
- **Error / Disabled:** error combina borde, texto y relación ARIA; deshabilitado mantiene legible el valor actual.
- **Responsive:** 16px de tipografía en entradas móviles para evitar zoom; la rejilla nunca usa clases Tailwind construidas dinámicamente.

### Navigation

La topbar guinda permanece visible durante scroll y sostiene acceso al drawer, contexto de producto y cuenta. El sidebar oscuro agrupa por sección; cada item tiene al menos 44px, icono fijo, etiqueta truncable y activo tonal. Bajo 1024px se comporta como drawer con overlay, no como rail superpuesto sobre el contenido.

### Role Rail

El catálogo combina avatar, nombre y volumen de usuarios. La selección usa superficie rosada y avatar guinda; en escritorio permanece pegado bajo el shell y en compacto se convierte en tira horizontal con snap.

### Permission Matrix

Cada grupo contiene pantalla, ruta y acciones. Filas sin acceso reducen opacidad; filas activas recuperan contraste. La cabecera de grupo contiene una acción masiva reversible y los permisos especiales se distinguen con superficie ocre.

### Menu Editor and List

El editor pegado mantiene tipo, campos, permisos y acciones dentro de un panel desplazable. El listado usa tabla de ancho fijo con rutas que quiebran de forma segura; en móvil cada registro se vuelve una fila semántica con labels generados y acciones visibles de editar y activar/desactivar.

## Do's and Don'ts

### Do:

- **Do** reservar guinda para contexto institucional, selección, foco y confirmación.
- **Do** mantener topbar visible, sidebar contenido y textos largos dentro de su ancho.
- **Do** usar la rejilla canónica de doce columnas y colapsarla a una columna bajo 640px.
- **Do** conservar acciones visibles, de 44px y en una posición estable para mouse, teclado y touch.
- **Do** usar bordes y capas tonales para separar filas antes de añadir sombra.
- **Do** convertir tablas operativas en filas apiladas cuando el ancho ya no permita leerlas.
- **Do** acompañar estados semánticos con texto, icono o contexto explícito.

### Don't:

- **Don't** permitir que nombres, rutas, badges o controles sobresalgan de su panel o del sidebar.
- **Don't** construir spans de la rejilla con clases Tailwind dinámicas ni introducir selectores nativos en formularios nuevos.
- **Don't** ocultar acciones relevantes detrás de hover ni comunicar desactivación sólo por color.
- **Don't** elevar cada fila, grupo o permiso; la profundidad se reserva para shell, panel raíz, selección y foco.
- **Don't** recortar selects, tooltips o menús dentro de un ancestro con overflow oculto.
- **Don't** introducir tipografía ornamental, gradientes decorativos o motion que no explique estado o relación espacial en superficies administrativas.
