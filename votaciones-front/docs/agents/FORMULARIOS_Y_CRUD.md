# Formularios, CRUD y componentes canónicos

Estas reglas son obligatorias para formularios nuevos y para toda pantalla CRUD que se modifique. Conservan el lenguaje institucional de VOTOS-SENCILLO y sustituyen cualquier supuesto del proyecto del que se tomó la referencia.

## Árbol de decisión

1. Un catálogo CRUD usa los hooks/repositorios genéricos existentes y los componentes de `src/components/forms`.
2. Un formulario nuevo usa React Hook Form + Yup. Los formularios heredados Formik + Yup se mantienen operativos y se migran cuando su pantalla sea modificada de forma material.
3. Un flujo por etapas sólo usa wizard cuando existen decisiones o validaciones distintas por etapa.
4. Antes de crear un componente, busca uno equivalente en `src/components/forms` y `src/components`.
5. Una abstracción nueva necesita al menos dos consumidores o debe encapsular accesibilidad, foco, overlay o normalización difícil.

## Contrato de formulario

- Todo formulario visible empieza con `FormHeader`: icono semántico, título específico y una descripción breve de su propósito. No se permiten encabezados vacíos, texto sin contraste ni títulos sin icono.
- Valores iniciales completos; nunca alternar entre controlado y no controlado.
- Esquema Yup y validación inline con `aria-invalid`, `aria-describedby`, mensaje específico y foco en el primer error.
- El servidor siempre vuelve a validar. El cliente normaliza espacios, correo, identificadores, rutas y números antes de enviar.
- El botón principal muestra progreso, bloquea doble envío y permanece accesible en la barra de acciones.
- Cancelar no pierde cambios silenciosamente. Si hay cambios, confirmar antes de limpiar o cerrar.
- Formularios en panel o diálogo: encabezado y acciones estables; sólo el cuerpo puede desplazarse.
- El error explica qué dato falló y cómo corregirlo. Nunca mostrar únicamente “Error”.

## Campos

| Dato | Control esperado |
|---|---|
| Texto, correo, contraseña, número | `Input` canónico o field RHF equivalente |
| Texto largo | `Textarea` con label/helper/error |
| Catálogo relacionado | `Select2`/`react-select`, buscable y limpiable sólo si es nullable |
| Booleano | `Switch` o checkbox con `id` y `htmlFor` |
| Búsqueda | `type="search"`, botón visible para limpiar |
| Fecha/hora | `DateTimePicker`; no crear nuevos `input type="date|time"` |
| Archivo/imagen | `FileInputModerno`/captura; nunca pedir al usuario una URL local |

El teclado móvil debe corresponder al dato: `email`, `tel`, `url`, `inputMode="numeric"` o `decimal`. Los inputs enfocados deben usar al menos 16px en móvil para evitar zoom de Safari.

## Selectores, tablas y acciones

- No añadir `<select>` nativo en código nuevo. Usa `react-select` o el wrapper canónico.
- Búsquedas y filtros siempre ofrecen limpiar cuando difieren del valor inicial.
- Acciones por fila son visibles y tienen nombre accesible. Editar y activar/desactivar usan la misma posición en todas las tablas.
- Preferir activar/desactivar frente a borrar si existe historial o relaciones.
- Toda acción destructiva nombra el objetivo y la consecuencia antes de confirmar.
- En móvil, las tablas operativas se convierten en filas apiladas/cards semánticas; el scroll horizontal se reserva para matrices reales.

## Layout y accesibilidad

- Rejilla canónica: 12 columnas en escritorio, una columna bajo 640px. No construir clases Tailwind dinámicas como `col-span-${n}`.
- Las secciones usan `DividerComponent`; nunca la clase genérica `.divider`, porque entra en conflicto con DaisyUI. El texto del separador debe quedar entre líneas con espacio visible, nunca atravesado por ellas.
- Espaciado base: 4/8/12/16/24px. Campos relacionados quedan próximos; secciones distintas reciben más espacio.
- Targets interactivos de 44px como mínimo.
- Labels vinculados por `htmlFor`; errores y helper por `aria-describedby`.
- Orden de foco y orden visual deben coincidir.
- Los overlays se portalan o usan posición fija; nunca dentro de un ancestro que los recorte con `overflow`.
- Textos largos: `min-width: 0`, `overflow-wrap: anywhere` o ellipsis cuando sea una sola línea.

## Estado de red

- Carga inicial: skeleton o mensaje específico de qué se carga.
- Vacío: qué falta y cuál es la siguiente acción.
- Error: explicación y opción de reintentar.
- Guardado: control deshabilitado y texto “Guardando…”.
- Éxito: mensaje breve con la consecuencia real, especialmente cuando se revocan sesiones.

## Migración de formularios heredados

- Formik + Yup continúa soportado por `FormikForm` y `FormGeneric`.
- Al tocar un formulario heredado: corregir labels/ARIA, defaults, inputMode, foco inválido, barra de acciones y grid responsive.
- No mezclar Formik y React Hook Form dentro del mismo formulario.
- No duplicar un formulario manual debajo de `FormGeneric`.

## Seguridad de acceso

- El frontend nunca decide autorización real; sólo refleja permisos recibidos.
- Cambiar rol o permisos informa que las sesiones afectadas se cerrarán.
- Menús, roles y permisos personalizados se validan nuevamente en Laravel.
- No permitir escalamiento a SuperAdmin desde un rol menor.

