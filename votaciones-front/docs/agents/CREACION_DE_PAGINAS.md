# Estándar para crear páginas nuevas

Este documento define el flujo canónico para agregar una página administrativa a `votaciones-front`. La referencia base son Usuarios, Proyectos y Casillas. Roles y permisos, y Menús, también siguen esta separación.

Complementa estas reglas con:

- `docs/agents/FORMULARIOS_Y_CRUD.md` para validación, estados y operaciones CRUD.
- `docs/agents/DISENO_E_INTERACCION.md` para layout, espaciado, responsive y accesibilidad.
- `DESIGN.md` para tokens y lenguaje visual.

## Objetivo de la separación

Cada responsabilidad debe tener un lugar predecible:

| Capa | Responsabilidad | No debe contener |
|---|---|---|
| `domains/models` | Interfaces, tipos, DTO y valores iniciales puros | Peticiones HTTP, JSX o estado React |
| `hooks` | Estado, carga, CRUD y reglas de interacción de la página | Maquetación extensa |
| `pages/.../index` | Encabezado y composición de las partes | Definiciones completas de formularios o tablas |
| `pages/.../form` | Campos, validaciones y presentación del formulario | Carga global duplicada |
| `pages/.../table` | Columnas, filas, búsqueda y acciones de tabla | Formulario de captura |
| `App.tsx` | Registro de la ruta | Lógica de la funcionalidad |

Una página puede tener más archivos —filtros, detalles, estadísticas o pasos— cuando exista una responsabilidad adicional real. No se conserva una versión monolítica “por respaldo”; Git es el respaldo.

## Árbol mínimo

Para una entidad llamada `Evento`:

```text
src/
├─ domains/
│  └─ models/
│     └─ evento.model.ts
├─ hooks/
│  └─ useEventosData.tsx
├─ pages/
│  └─ eventosPage/
│     ├─ index.eventos.tsx
│     ├─ form.eventos.tsx
│     ├─ table.eventos.tsx
│     └─ eventos.css              # sólo si los estilos globales no bastan
└─ App.tsx
```

Si la página necesita autorización y navegación, también se actualizan el seeder o catálogo de menús del backend, los permisos del rol y `Sidebar.tsx`. Registrar una ruta no concede acceso por sí mismo.

## 1. Registrar el modelo de dominio

Ruta: `src/domains/models/evento.model.ts`.

```ts
export interface Evento {
   id: number;
   name: string;
   starts_at: string;
   ends_at: string;
   active?: boolean;
   created_at?: string;
   updated_at?: string;
   deleted_at?: string | null;
}
```

Reglas:

- Usa los nombres reales del contrato API; no inventes traducciones sólo para la vista.
- No uses `any` para campos conocidos.
- Los campos generados por servidor pueden ser opcionales.
- Los valores iniciales reutilizables pueden exportarse desde el modelo si son puros.
- Si formulario y respuesta usan formas distintas, declara `EventoFormValues` o un DTO explícito.

Referencia: `src/domains/models/casilla.model.ts`.

## 2. Crear el hook de datos

Ruta: `src/hooks/useEventosData.tsx`.

Para un CRUD convencional se usa `useGenericData`:

```tsx
import { useMemo } from "react";
import type { Evento } from "../domains/models/evento.model";
import { useGenericData, type GenericDataReturn } from "./useGenericData";

interface EventosPersistState {}

interface EventosExtraState {
   singularName: string;
   pluralName: string;
   textBtnSubmit: string;
}

interface EventosExtension {}

export type EventosDataReturn = GenericDataReturn<
   Evento,
   EventosExtension,
   EventosPersistState,
   EventosExtraState
>;

export default function useEventosData() {
   const initialState = useMemo<Evento>(() => ({
      id: 0,
      name: "",
      starts_at: "",
      ends_at: "",
      active: true
   }), []);

   return useGenericData<Evento, EventosExtension, EventosPersistState, EventosExtraState>({
      initialState,
      prefix: "eventos",
      autoFetch: true,
      persistKey: "eventos-persist",
      extraState: {
         singularName: "Evento",
         pluralName: "Eventos",
         textBtnSubmit: "REGISTRAR"
      },
      extension: () => ({}),
      hooks: {
         beforePost: (evento) => evento,
         afterFetch: (eventos) => eventos,
         beforeDelete: () => true,
         onError: (message) => console.error("[Eventos]", message)
      }
   });
}
```

Cuando el módulo no es un CRUD convencional —por ejemplo Roles y permisos— se crea un hook específico que siga concentrando peticiones, estado y operaciones. La UI recibe el objeto retornado por el hook mediante props.

El hook es responsable de:

- Cargar y refrescar datos.
- Estado de selección, edición, loading y error.
- Invocar repositorio/API mediante las utilidades existentes.
- Aplicar transformaciones antes y después de guardar.
- Exponer acciones con nombres de negocio.

El hook no debe renderizar tarjetas, campos o tablas.

## 3. Construir el formulario

Ruta: `src/pages/eventosPage/form.eventos.tsx`.

El formulario importa el hook y el modelo, configura campos y validaciones, y reutiliza los componentes de `src/components/forms`.

```tsx
import { useRef } from "react";
import * as Yup from "yup";
import FormGeneric, { type FieldConfig } from "../../components/forms/FormGeneric";
import { Input } from "../../components/forms";
import type { Evento } from "../../domains/models/evento.model";
import useEventosData from "../../hooks/useEventosData";

export default function EventoForm() {
   const eventos = useEventosData();
   const formikRef: React.RefObject<null> = useRef(null);

   const formData: FieldConfig<Evento>[] = [
      {
         name: "name",
         value: "",
         input: <Input col={12} idName="name" label="Nombre" required />,
         validations: Yup.string().trim().required("El nombre es obligatorio."),
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      }
   ];

   const onSubmit = async (values: Evento | Evento[]) => {
      await eventos.postItem(values);
   };

   if (!eventos.open) return null;

   return (
      <div className="card mb-6">
         <div className="card-header">
            <span className="header-title">
               {eventos.initialValues.id > 0 ? "Editar evento" : "Nuevo evento"}
            </span>
         </div>
         <div className="card-body">
            <FormGeneric
               initialValuesContext={eventos.initialValues}
               formData={formData}
               validations={{}}
               formikRef={formikRef}
               validationSchema={() => Yup.object()}
               onSubmit={onSubmit}
               textBtnSubmit={eventos.textBtnSubmit}
               handleCancel={() => eventos.setOpen()}
               container="none"
            />
         </div>
      </div>
   );
}
```

Reglas del formulario:

- Reutiliza `Input`, `Select2`, `FormGeneric` y demás componentes existentes.
- No introduzcas un `<select>` nativo en formularios nuevos.
- La etiqueta debe estar asociada al control y los errores deben ser accesibles.
- Usa Yup para reglas del cliente; el backend sigue siendo la autoridad.
- Crear y editar comparten formulario salvo que el flujo sea realmente diferente.
- Los inputs son de 16px en móvil y los controles principales miden al menos 44px.
- El formulario no vuelve a implementar el CRUD que ya vive en el hook.

## 4. Construir la tabla

Ruta: `src/pages/eventosPage/table.eventos.tsx`.

Toda tabla operativa nueva debe construirse con `src/components/CustomTable.tsx`. No se crean tablas HTML manuales ni se incorpora otra librería de tabla para páginas CRUD. La implementación de referencia es `src/pages/casillasPage/table.casillas.tsx`.

```tsx
import CustomTable, { renderColActive } from "../../components/CustomTable";
import CustomButton from "../../components/CustomButtom";
import Tooltip from "../../components/Tooltip";
import { icons } from "../../constant";
import useEventosData from "../../hooks/useEventosData";

export default function EventoTable() {
   const eventos = useEventosData();

   return (
      <CustomTable
         data={eventos.items}
         columns={[
            { headerName: "Nombre", field: "name" },
            { headerName: "Activo", field: "active", renderField: (value) => renderColActive(value as boolean) }
         ]}
         enableRowSelection={false}
         onRowSelect={() => {}}
         actions={(row) => (
            <div className="grid grid-flow-col gap-1">
               <Tooltip title="Editar registro">
                  <CustomButton color="blue" size="sm" onClick={() => { eventos.setOpen(); eventos.handleChangeItem(row); }}>
                     <icons.Lu.LuPencil />
                  </CustomButton>
               </Tooltip>
               <Tooltip title="Eliminar registro">
                  <CustomButton color="rose" size="sm" onClick={() => eventos.removeItemData(row)}>
                     <icons.Lu.LuTrash2 />
                  </CustomButton>
               </Tooltip>
            </div>
         )}
         getRowActions={() => []}
         singularName={eventos.singularName}
         onRefresh={eventos.fetchData}
         loading={eventos.loading}
         headerActions={() => <></>}
      />
   );
}
```

Reglas de tabla:

- Usa siempre `CustomTable` y su contrato de `columns`, `actions`, `getRowActions`, `onRefresh`, `loading`, permisos, filtros y exportación.
- No construyas directamente `<table>`, `<thead>`, `<tbody>` o paginación propia para un CRUD.
- Las columnas y renderizadores viven aquí, no en `index`.
- Editar carga el registro en el estado compartido y abre el formulario.
- Eliminar/desactivar usa la acción del hook y solicita confirmación cuando corresponde.
- Loading, error, vacío y reintento son estados distintos.
- Las acciones importantes son visibles y accesibles por teclado; no dependen únicamente de hover.
- En móvil la información permanece asociada a su registro y no produce overflow horizontal.
- `CustomTable` mantiene una barra horizontal sincronizada y visible debajo de su área desplazable; no implementes otra barra por página.
- La tabla ocupa automáticamente la altura útil restante del viewport; el encabezado y los filtros permanecen fijos durante el desplazamiento vertical.
- La altura mínima predeterminada es `80vh`; cada pantalla puede ajustarla mediante `minTableHeight`, conservando siempre visible el scroll vertical.
- La columna de acciones permanece fija a la derecha. Si la lectura horizontal lo requiere, fija también la primera columna de datos con la prop `pinFirstColumn`.

## 5. Componer la página

Ruta: `src/pages/eventosPage/index.eventos.tsx`.

```tsx
import useEventosData from "../../hooks/useEventosData";
import EventoForm from "./form.eventos";
import EventoTable from "./table.eventos";

export default function Eventos() {
   const eventos = useEventosData();

   return (
      <div className="page">
         <div className="page-header">
            <div>
               <div className="breadcrumb">Configuración <span>›</span> <span>{eventos.pluralName}</span></div>
               <h1 className="page-title">{eventos.pluralName}</h1>
               <p className="page-subtitle">Administra los eventos disponibles.</p>
            </div>
            <button className="btn-secondary" onClick={() => eventos.setOpen()}>
               {eventos.open ? "✕ Cancelar" : "+ Nuevo evento"}
            </button>
         </div>

         <EventoForm />
         <EventoTable />
      </div>
   );
}
```

`index` debe ser fácil de leer de arriba hacia abajo: encabezado, controles principales y partes que forman la pantalla.

## 6. Registrar la ruta

En `src/App.tsx`:

```tsx
import Eventos from "./pages/eventosPage/index.eventos";

// Dentro de las rutas protegidas:
<Route path="eventos" element={<Eventos />} />
```

La URL sembrada en la tabla de menús debe coincidir con HashRouter: `/eventos` para `#/eventos`.

## 7. Crear el controlador del backend

Ruta base: `votaciones-back/app/Http/Controllers/BaseCrudController.php`.

Los controladores de CRUD deben extender `BaseCrudController`. No se deben copiar en cada controlador las operaciones genéricas que ya resuelve la clase base.

`BaseCrudController` proporciona actualmente:

- `index`: listado completo o paginado mediante `per_page`.
- `selectIndex`: listado activo con estructura `id` y `label`.
- `createOrUpdate`: creación y actualización usando el `id` del payload.
- `show`: consulta de un registro.
- `destroy`: baja lógica mediante `active = false` y `deleted_at`.
- `disEnable`: activación o desactivación.
- `deleteMultiple`: baja lógica de varios registros.
- Validación central con soporte para reglas `unique` durante una actualización.
- Procesamiento opcional de imágenes.
- Respuestas consistentes mediante `ObjResponse`.

### Controlador mínimo

Para `Evento`, el controlador debe comenzar así:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Evento;

class EventoController extends BaseCrudController
{
    protected $modelClass = Evento::class;

    protected $validationRules = [
        'name' => 'required|string|max:255',
        'starts_at' => 'required|date',
        'ends_at' => 'required|date|after_or_equal:starts_at',
        'active' => 'boolean',
    ];

    protected $validationMessages = [
        'name.required' => 'El nombre del evento es obligatorio.',
        'ends_at.after_or_equal' => 'La fecha final no puede ser anterior a la inicial.',
    ];

    protected $selectLabel = 'name';
    protected $defaultOrderBy = ['starts_at' => 'desc'];
    protected $useAuthFilter = true;
}
```

Con esa configuración el controlador ya tiene las operaciones CRUD genéricas. No es necesario volver a declarar `index`, `createOrUpdate`, `show`, `destroy`, `disEnable`, `deleteMultiple` o `selectIndex` si su comportamiento estándar es suficiente.

### Propiedades `protected` disponibles

| Propiedad | Uso |
|---|---|
| `$modelClass` | Modelo Eloquent principal. Es obligatoria. |
| `$resourceClass` | API Resource opcional para transformar respuestas. |
| `$validationRules` | Reglas usadas al crear y actualizar. |
| `$validationMessages` | Mensajes de validación propios del módulo. |
| `$imageFields` | Campos de archivo que deben procesarse como imágenes. |
| `$imageDirectory` | Directorio de destino de las imágenes. |
| `$defaultOrderBy` | Orden del listado, por ejemplo `['folio' => 'asc']`. |
| `$useAuthFilter` | Si está activo, los roles operativos sólo reciben registros activos. |
| `$indexQueryCallback` | Ajuste opcional de la consulta del listado. |
| `$selectIndexQueryCallback` | Ajuste opcional de la consulta para selectores. |
| `$selectLabel` | Columna utilizada como etiqueta en `selectIndex`. |

Sólo declara las propiedades que el controlador necesite modificar, además de `$modelClass`.

### Cuándo sobrescribir un método

Un método heredado se sobrescribe cuando la variante no puede expresarse correctamente con las propiedades anteriores. Algunos ejemplos:

- `selectIndex` necesita una etiqueta compuesta o filtros según el usuario.
- `index` debe cargar relaciones, agregados o filtros de negocio obligatorios.
- `createOrUpdate` necesita una transacción, crear registros relacionados o revocar tokens.
- `destroy` debe impedir la baja cuando existen dependencias activas.
- `show` debe devolver relaciones adicionales.

```php
public function selectIndex(Request $request)
{
    $query = $this->modelClass::query()
        ->where('active', true)
        ->selectRaw("id, CONCAT(name, ' — ', starts_at) as label")
        ->orderBy('name');

    return ObjResponse::success($query->get(), 'Lista de eventos obtenida');
}
```

Cuando todavía sirve parte del comportamiento genérico, llama explícitamente a `parent` en lugar de duplicarlo:

```php
public function show(Request $request, $id, $internal = false)
{
    $evento = parent::show($request, $id, true);

    if (!$evento || $internal) {
        return $evento;
    }

    return ObjResponse::success(
        $evento->load('casillas', 'projects'),
        'Evento encontrado'
    );
}
```

La firma del método sobrescrito debe ser compatible con la del padre.

### Funciones exclusivas del controlador

Las operaciones que sólo pertenecen al módulo se agregan en su propio controlador, con nombre explícito y ruta propia. Por ejemplo:

```php
public function publishResults(Evento $evento)
{
    // Autorización y reglas específicas del evento.
}

public function duplicateConfiguration(Evento $evento)
{
    // Transacción específica para copiar casillas, proyectos o ajustes.
}
```

Estas funciones no deben agregarse a `BaseCrudController` salvo que sean realmente genéricas, compartidas y tengan el mismo contrato en varios módulos.

### Reglas para controladores

- No dupliques código de `BaseCrudController` sólo para cambiar un mensaje o el orden; usa las propiedades configurables.
- Las reglas de negocio y la autorización siempre se validan en backend.
- Usa transacciones para operaciones que escriben varias tablas.
- Conserva el contrato de respuestas de `ObjResponse`.
- Las bajas estándar son lógicas; no mezcles `SoftDeletes` sin migración y revisión de consultas.
- La ruta de baja debe apuntar al método real `destroy`, no a un método `delete` inexistente.
- Si sobrescribes un método, agrega una prueba Feature para la diferencia de comportamiento.
- Las funciones únicas deben tener rutas y permisos específicos; no las escondas dentro de un CRUD genérico.

Referencias actuales:

- `CasillaController` sobrescribe `selectIndex` porque construye una etiqueta compuesta y aplica un filtro por usuario.
- `ProjectController` utiliza únicamente propiedades `protected`, porque el comportamiento genérico cubre su CRUD.
- `BallotController` y `ParticipationController` extienden la misma base y agregan sus variantes de dominio cuando corresponde.

## 8. Registrar menú y permisos

Si la página es administrativa:

1. Agrega un código estable, por ejemplo `events`.
2. Registra nombre, código, ruta, icono, grupo y orden en `votaciones-back/database/seeders/MenuSeeder.php`.
3. Otorga permisos iniciales en `PermissionSeeder.php`.
4. Agrega el enlace a `Sidebar.tsx` con el mismo `code`.
5. Protege los endpoints Laravel con `permission:events,view|create|update|delete`, según cada operación.
6. No confíes en que ocultar el enlace en React sea autorización suficiente.

## 9. Archivos adicionales permitidos

Créelos sólo cuando separen una responsabilidad concreta:

```text
filters.eventos.tsx       # filtros complejos reutilizables
details.eventos.tsx       # panel de detalle
steps.eventos.ts          # configuración de un wizard
evento.schema.ts          # esquema grande compartido
evento.mapper.ts          # traducción API ↔ formulario
eventos.css               # estilos exclusivos de la página
```

Evita nombres genéricos como `utils.ts` o `helpers.ts` dentro de una página si no expresan su propósito.

## Implementaciones de referencia

- Casillas: `src/pages/casillasPage/index.casillas.tsx`, `form.casillas.tsx`, `table.casillas.tsx`.
- Proyectos: `src/pages/projectsPage/index.projects.tsx`, `form.projects.tsx`, `table.projects.tsx`.
- Usuarios: `src/pages/usersPage/index.users.tsx`, `form.users.tsx`, `table.users.tsx`.
- Menús: `src/pages/menusPage/index.menus.tsx`, `form.menus.tsx`, `table.menus.tsx`, `src/hooks/useMenusData.tsx`.
- Roles y permisos: `src/pages/accessControl/index.access-control.tsx`, `form.access-control.tsx`, `table.access-control.tsx`, `src/hooks/useAccessControlData.tsx`.

## Lista de verificación

- [ ] Modelo o DTO tipado en `domains/models`.
- [ ] Hook en `hooks`, con carga, CRUD y estados de error.
- [ ] Carpeta de página con `index`, `form` y `table`.
- [ ] Componentes de formulario existentes reutilizados.
- [ ] Los listados tabulares utilizan `CustomTable`; no existe una tabla HTML paralela.
- [ ] Validación de cliente y validación equivalente en backend.
- [ ] Estados loading, vacío, error y reintento.
- [ ] Acciones con autorización real en API.
- [ ] Ruta registrada en `App.tsx`.
- [ ] Menú, código y URL alineados con HashRouter.
- [ ] Sidebar filtrado por el código de permiso.
- [ ] Diseño verificado en escritorio y móvil sin overflow.
- [ ] Controlador Laravel extiende `BaseCrudController` cuando el módulo es un CRUD convencional.
- [ ] Sólo se sobrescribieron métodos con una diferencia real y probada.
- [ ] `npm run build` ejecutado correctamente.
