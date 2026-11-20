# Contexto integral del Sistema de Votaciones

> Actualización 2026-10-07: el dominio ya contempla eventos reutilizables y el flujo participación → folio/OTP → boleta. Las secciones históricas que describen CURP global o una boleta sin evento deben leerse como estado previo.

## 1. Resumen ejecutivo

**Estado comprobado.** El workspace contiene dos aplicaciones Git independientes que forman un sistema web de registro de participación y captura de votos para proyectos ciudadanos:

- `votaciones-front/`: SPA React 19 + TypeScript + Vite. Proporciona autenticación, captura de participación por CURP, boleta de hasta cinco proyectos, catálogos, usuarios, estadísticas y tres vistas rotuladas como públicas.
- `votaciones-back/`: API Laravel 13 + Sanctum. Persiste roles, menús, casillas, usuarios, participaciones, proyectos, boletas y bitácora en una base relacional.
- `Otros/`: material auxiliar no conectado al build: imágenes, hojas de cálculo, respaldos SQL, una exportación/prototipo estático y copias de fuentes.

La interfaz identifica el producto como **Sistema de Votaciones** y las páginas públicas lo describen como un proceso de **presupuesto participativo 2025**. Esa denominación y anualidad sólo están comprobadas en la UI; no existe documentación funcional oficial dentro del repositorio que confirme municipio, organizador, fechas de apertura/cierre ni criterio legal del proceso.

El sistema compila, pero el levantamiento encontró defectos críticos en autorización, integridad de voto, rutas de borrado, cambio de contraseña, registro público y consistencia entre navegación, API y páginas públicas. Las pruebas existentes son sólo las pruebas de ejemplo de Laravel y no validan ningún caso de negocio.

### Evolución implementada: eventos y acceso a boleta

- `events` configura nombre, logo/ruta, modalidad (`attendance` o `attendance_ballot`), máximo de selecciones, vigencia y estado.
- Proyectos, participaciones y boletas pueden pertenecer a un evento.
- Registro captura la Clave de Elector de 18 caracteres solicitada por el manual; CURP queda como dato complementario y puede leerse mediante Google Vision o teclearse.
- La imagen de la INE se envía a Vision y no se persiste. La integración requiere `GOOGLE_VISION_API_KEY`.
- El alta genera folio y OTP de seis dígitos; en BD sólo se conserva el hash del OTP. La boleta se abre con ambos datos y recibe un token temporal de un solo flujo.
- La emisión bloquea duplicados por evento, selecciones repetidas, proyectos inactivos o pertenecientes a otro evento y una segunda boleta para la misma participación.
- Roles operativos: `Registro` captura participación y puede abrir boleta como apoyo; `Casilla` opera la urna/boleta.
- La regla territorial exacta (qué proyectos puede votar cada distrito o casilla) continúa pendiente de definición formal y no debe inferirse.

## 2. Alcance revisado

Se revisaron código fuente, manifiestos, rutas, migraciones, modelos, controladores, seeders, configuración, hooks, stores, páginas y pruebas de ambos repositorios. Los artefactos binarios y respaldos de `Otros/` se inventariaron, pero no se tomaron como estado canónico de la aplicación ni se expusieron datos de sus contenidos.

No se encontró infraestructura como código, contenedores, CI/CD, proxy web, manifiestos cloud ni scripts de despliegue. Hay archivos `.env` locales en frontend y backend; no se copiaron valores. El backend sí tiene `.env.example`; el frontend no.

## 3. Arquitectura comprobada

```text
Navegador
  └─ SPA React (HashRouter, Zustand, Axios)
       ├─ páginas autenticadas y controles de permiso visuales
       ├─ páginas etiquetadas como públicas
       └─ VITE_API_URL → API JSON
                         └─ Laravel + Sanctum
                              ├─ auth:sanctum
                              ├─ controladores CRUD / estadísticas
                              ├─ Eloquent + vista vw_users
                              └─ BD relacional (configurable; migración de vista usa SQL/MySQL)
```

### Frontend

- Entrada: `votaciones-front/src/main.tsx`; registra manualmente `/sw.js` en producción.
- Enrutamiento: `votaciones-front/src/App.tsx`, con `HashRouter`.
- Estado: stores genéricos Zustand en `src/store/generic.store.ts`; autenticación persistida bajo `auth-persist`.
- Transporte: Axios en `src/utils/Axios.tsx`; token Bearer obtenido de `auth-persist` para JSON.
- Capa genérica: hooks → store → repositorio → `infrastructure.generic.ts` → API.
- UI: Tailwind 4, DaisyUI, PrimeReact, componentes locales y librería de componentes en `components/ui`.
- Exportación: PDF del lado cliente con jsPDF/html2canvas; también hay dependencias para XLSX.

### Backend

- Entrada y routing: `votaciones-back/bootstrap/app.php`, `routes/api.php`, `routes/web.php`.
- Autenticación: tokens personales Sanctum creados en `AuthController`.
- CRUD: `BaseCrudController` para casillas, proyectos, participaciones y boletas; controladores dedicados para usuarios, roles y menús.
- Datos: Eloquent y una vista SQL `vw_users` que une usuario, rol y casilla.
- Auditoría: observador global para siete modelos, configurado en `AppServiceProvider`.
- Estadísticas: agregaciones SQL/Eloquent en `StatisticsController`.

### Infraestructura y ambientes

| Aspecto | Estado comprobado |
|---|---|
| Frontend | Node `>=22`; Vite/Rolldown; variables `VITE_API_URL` y `VITE_API_URL_IMG` |
| Backend | PHP `^8.3`; Laravel `^13`; Sanctum `^4` |
| BD | Laravel admite varios drivers, pero `vw_users` usa `CREATE OR REPLACE VIEW`, `CONCAT` y `CAST ... AS CHAR`, lo que hace la migración dependiente de MySQL/MariaDB |
| Sesión/cache/cola | Predeterminados a base de datos si el ambiente no los cambia |
| Despliegue | No documentado ni automatizado en el alcance |
| Observabilidad | Log local de Laravel y tabla `activity_logs`; no hay monitoreo externo implementado |

## 4. Módulos y responsabilidades

| Módulo | Responsabilidad | Datos principales | Dependencias |
|---|---|---|---|
| Autenticación | Login, logout, token, cambio de contraseña | `users`, `vw_users`, `personal_access_tokens` | Sanctum, Hash |
| Roles y menús | Catálogo de roles, permisos y menús | `roles`, `menus` | usuario autenticado |
| Casillas | Centros de votación y distrito | `casillas` | usuarios asignados |
| Usuarios | Operadores/administradores y asignación a casilla | `users`, `vw_users` | roles, casillas |
| Participaciones | Registro de documento y CURP | `participations` | usuario/casilla capturista |
| Proyectos | Catálogo votable por distrito y viabilidad | `projects` | boletas |
| Boletas | Hasta cinco referencias a proyectos | `ballots` | usuario/casilla y proyectos |
| Estadísticas | Totales y agrupaciones por casilla/distrito/proyecto | participaciones, boletas, proyectos, `vw_users` | SQL agregado |
| Auditoría | Cambios de modelos y contexto HTTP | `activity_logs` | observador Eloquent |
| Vistas públicas | Casillas, proyectos y resultados descargables | endpoints de catálogos y estadísticas | actualmente requieren token |

## 5. Modelo de datos y relaciones

- `roles`: permisos `read/create/update/delete` como cadenas de IDs o `todas`, permisos adicionales y página inicial.
- `menus`: jerarquía manual mediante `belongs_to`, tipo `group|item`, URL, orden y banderas.
- `casillas`: tipo `Rural|Urbana|Especial`, distrito, perímetro, lugar, ubicación y activo.
- `users`: correo único, rol obligatorio y casilla opcional.
- `participations`: tipo de documento, CURP, usuario capturista y activo.
- `projects`: folio, distrito asignado, nombre, lugar, viabilidad y activo.
- `ballots`: usuario capturista y cinco FKs opcionales hacia proyectos.
- `activity_logs`: acción, antes/después, modelo polimórfico, usuario y metadatos HTTP.
- `vw_users`: vista que expone usuario unido a rol y casilla; excluye usuarios con `deleted_at`.

La base representa cada boleta con cinco columnas, no con una tabla normalizada de votos. Esto simplifica el formulario, pero complica consultas, índices, restricciones, extensibilidad y auditoría por selección.

## 6. Actores, roles y permisos

### Actores comprobados

| Actor | Capacidad declarada | Aplicación real |
|---|---|---|
| SuperAdmin (rol 1) | Todas las operaciones | Bypass explícito del middleware de permisos |
| Administrador (rol 2) | Gestión general | Permisos por menú y acción en `role_menu_permissions` |
| Casilla (rol 3) | Registrar participación y boleta | Acceso sembrado a captura; los endpoints electorales heredados aún requieren endurecimiento granular |
| Visitante | Consultar casillas, proyectos y resultados | La UI ofrece rutas públicas, pero la API correspondiente exige Sanctum |
| Sistema/observador | Registrar cambios | Observa siete modelos y crea `activity_logs` |

Desde 2026-10-06 existe `RequirePermission`, una matriz normalizada rol–menú y una pantalla unificada de roles/usuarios. La protección ya cubre la administración de menús, roles y usuarios; los catálogos y flujos electorales heredados todavía requieren extender el mismo patrón.

## 7. Flujos de extremo a extremo

### 7.1 Inicio de sesión

1. El frontend envía usuario/correo y contraseña a `POST /api/auth/login`.
2. El backend busca presentación en `vw_users` y contraseña en `users`, ambos activos.
3. Crea el token Sanctum sobre el modelo escribible `User` y devuelve la proyección de usuario junto con `allowed_menu_codes`.
4. El frontend persiste el token y filtra navegación con los códigos permitidos.
5. `PrivateRoute` valida sesión para el área interna.

**Excepción:** credenciales inválidas producen 401. El cambio de contraseña vuelve a cargar el modelo `User` escribible.

### 7.2 Registro de participación

1. Operador autenticado selecciona INE o Carta Identidad y captura CURP.
2. Frontend envía `type`, `curp` y `user_id` a `/participations/createOrUpdate`.
3. Backend valida tipo, formato de CURP, unicidad a nivel aplicación y existencia del usuario.
4. Persiste participación y el observador intenta auditarla.

**Excepciones:** CURP repetida o formato inválido. **Vacíos:** no hay restricción UNIQUE en BD, no se fuerza que `user_id` sea el usuario autenticado y no hay transacción que vincule participación con una boleta.

### 7.3 Captura de boleta

1. Operador autenticado carga proyectos y selecciona hasta cinco.
2. `useBoleta.ts` construye `vote_1...vote_5`; ceros se transforman a `null` en backend.
3. Backend valida existencia de proyectos y que no se repitan dentro de la misma boleta.
4. Persiste boleta y el frontend genera localmente un folio `BOL-...` que no se almacena.

**Reglas implementadas:** máximo estructural de cinco y proyectos no repetidos. **Vacíos críticos:** acepta boleta sin votos; no valida proyecto activo, viable ni perteneciente al distrito de la casilla; acepta un `user_id` distinto del autenticado; no existe UNIQUE para limitar boletas por usuario; el comentario y relación `hasOne` contradicen la captura repetida observable. `Boleta.tsx` contiene además un flujo alternativo que sólo espera con `setTimeout` y muestra éxito sin llamar a la API.

### 7.4 Administración de catálogos

Los hooks genéricos consumen listar, crear/actualizar, eliminar y activar/desactivar. Las bajas son lógicas (`active=false`, `deleted_at`). No se usa `SoftDeletes` de Eloquent aunque algunos modelos lo importan. El listado filtra activos sólo cuando el rol autenticado es mayor a 2.

**Error confirmado:** rutas `delete/{id}` de casillas, proyectos, participaciones y boletas apuntan a `delete`, pero `BaseCrudController` implementa `destroy`. Esas cuatro bajas individuales fallan al despacharse.

### 7.5 Estadísticas y vistas públicas

`StatisticsController` calcula proyectos, participaciones, boletas, casillas activas, distribuciones, rankings y votos nulos. Las páginas públicas reutilizan hooks de catálogos/estadísticas con auto-fetch.

**Contradicción:** todos esos endpoints están dentro de `auth:sanctum`, por lo que un visitante sin token no puede obtener los datos. Además, la UI publica “2025” mientras el código/migraciones y actividad del repositorio son de 2026; falta una fuente temporal canónica.

## 8. Reglas de negocio comprobadas

| Regla | Evidencia | Fortaleza |
|---|---|---|
| Participación usa INE o Carta Identidad | migración + `ParticipationController` | BD y aplicación |
| CURP debe tener 18 caracteres y patrón definido | `ParticipationController` | Sólo aplicación |
| CURP no debe repetirse | regla `unique` | Sólo aplicación; carrera concurrente posible |
| Boleta admite 0–5 proyectos | cinco FKs nullable + controlador | BD/aplicación |
| Un proyecto no se repite en una boleta | controlador + evento `saving` del modelo | Aplicación duplicada |
| Proyecto tiene distrito y viabilidad | migración/modelo | No se exige al votar |
| Usuarios inactivos no inician sesión | `AuthController@login` | Aplicación |
| Usuarios tienen rol; casilla es opcional | migración `users` | BD |
| Bajas son lógicas | controladores y `deleted_at` manual | Inconsistente; no hay scope global |
| Cambio de permisos revoca tokens de todos los usuarios del rol | `AccessControlController@update` | Transacción de aplicación |
| Cambio de rol revoca tokens del usuario | `AccessControlController@assignUserRole`, `UserController@createOrUpdate` | Aplicación |
| Auditoría excluye campos sensibles conocidos | `GlobalModelObserver` | Aplicación; fallo interno ocultable |

## 9. Errores, inconsistencias y riesgos priorizados

### Críticos

1. **Autorización todavía parcial fuera del módulo administrativo.** Menús, roles y usuarios ya aplican middleware; catálogos y operaciones electorales heredadas deben incorporarlo.
2. **Suplantación de casilla.** Participación y boleta aceptan `user_id` del cliente sin compararlo con `auth()->id()` ni la casilla autorizada.
3. **Integridad electoral incompleta.** No se valida distrito, viabilidad, actividad, mínimo de votos, relación participación–boleta ni regla inequívoca sobre cantidad de boletas.
4. **Cobertura automatizada insuficiente.** La nueva autorización y revocación de sesiones sólo cuentan con verificación funcional/manual; faltan pruebas de integración específicas.
5. **Alta pública rota/insegura.** `/auth/signup` es público, referencia `Employee` sin importar/definir, valida tabla `employees` inexistente en migraciones y crea `User` sin `role_id` obligatorio.
6. **Credenciales predecibles en seeder.** `UserSeeder.php` contiene cuentas y contraseñas iniciales embebidas. Deben tratarse como comprometidas si alguna vez se desplegaron; no se reproducen aquí.

### Altos

7. **Cuatro endpoints de borrado llaman método inexistente** (`delete` vs `destroy`).
8. **Vistas públicas no funcionan anónimamente** porque sus APIs requieren Sanctum.
9. **Un flujo de boleta simula persistencia** (`Boleta.tsx`) y genera comprobante local no verificable.
10. **Unicidad sólo en aplicación:** CURP, folio y posible boleta por operador/casilla carecen de índices UNIQUE adecuados.
11. **Auditoría puede fallar silenciosamente:** el `catch (\Throwable $th)` usa `$e`, variable indefinida.
12. **Sin transacción atómica** entre registro de identidad/participación y voto; pueden quedar registros huérfanos o duplicados lógicos.

### Medios

13. Menús sembrados usan rutas `/app/...`, pero el router real usa `#/registro`, `#/usuarios`, etc.; la navegación activa usa además un Sidebar hardcodeado.
14. `AxiosFiles` busca token en `localStorage.token`, mientras el login persiste bajo `auth-persist`; cargas multipart autenticadas pueden fallar.
15. `validateStatus` acepta 422, lo que exige disciplina en cada consumidor y puede tratar validaciones como respuestas exitosas.
16. La baja lógica no usa `SoftDeletes` real ni filtra siempre `deleted_at`; administradores pueden ver registros dados de baja y relaciones siguen apuntándolos.
17. El frontend construido produce un chunk principal de 11,491.52 kB (3,938.56 kB gzip), con advertencia de Vite; faltan lazy loading y separación de paquetes.
18. El service worker se registra, pero no hay `public/sw.js` comprobado ni configuración PWA activa en Vite.
19. `README.md` de ambos proyectos conserva texto de plantilla y no documenta operación, variables ni despliegue.
20. Hay archivos `copy`, prototipos y componentes duplicados que elevan riesgo de modificar una implementación no activa.

### Bajos / mantenibilidad

21. Importaciones y bloques inalcanzables/comentados en controladores, hooks y componentes.
22. Nombres y contratos mezclan español/inglés; permisos son strings no tipados.
23. La vista SQL no declara explícitamente `use DB`, depende del alias global de Laravel y es específica del motor.
24. Las estadísticas usan múltiples consultas y cinco columnas de voto; el costo crecerá con el volumen.

## 10. Mejoras recomendadas

### Prioridad 0 — antes de uso real

- Extender `RequirePermission` a casillas, proyectos, participaciones, boletas, logs y estadísticas, con pruebas de denegación y bypass SuperAdmin.
- Derivar `user_id` y casilla desde el token, nunca desde el payload; definir explícitamente quién puede capturar por otra casilla.
- Definir la invariante electoral: relación participación–boleta, número mínimo/máximo, repetición por ciudadano/casilla, periodo y proyectos elegibles. Aplicarla en servicio transaccional y en restricciones BD.
- Autenticar con `User`, cargar rol/casilla como relaciones o DTO, y reparar cambio de contraseña.
- Deshabilitar o reconstruir `signup`; eliminar dependencias `Employee` ajenas al dominio.
- Rotar credenciales sembradas, sustituirlas por configuración segura y evitar contraseñas conocidas en código.
- Corregir rutas de borrado y el error `$e/$th` del observador.

### Prioridad 1 — confiabilidad

- Agregar pruebas feature de autenticación, autorización, captura concurrente, elegibilidad, bajas, endpoints públicos y estadísticas.
- Crear índices/constraints para CURP, folio y demás invariantes confirmadas.
- Unificar el flujo de boleta y emitir un folio persistido/verificable desde backend.
- Exponer endpoints públicos de sólo lectura con DTOs mínimos, rate limiting y decisión explícita sobre cuándo publicar resultados.
- Normalizar `ballots` + `ballot_votes` si se requiere trazabilidad y consultas escalables.
- Versionar configuración de ejemplo del frontend y documentar despliegue/CORS/HTTPS/backups.

### Prioridad 2 — calidad y rendimiento

- Alinear menús, rutas y una única fuente de autorización/navegación.
- Introducir lazy routes y manual chunks; retirar componentes/copies muertos y dependencias no usadas.
- Implementar paginación y revisar índices para estadísticas.
- Reemplazar documentación de plantilla por guía operativa sin secretos.

## 11. Vacíos y preguntas abiertas

Estas decisiones no pueden inferirse con seguridad del repositorio y cambian materialmente el diseño:

1. ¿Una participación corresponde exactamente a una boleta y a una persona, o sólo registra afluencia?
2. ¿Cuántos proyectos debe/podría elegir cada ciudadano: exactamente cinco, de uno a cinco o cero a cinco?
3. ¿Los proyectos deben pertenecer al distrito de la casilla y ser viables/activos?
4. ¿Una cuenta de casilla puede emitir muchas boletas? Si sí, ¿qué identifica de forma no reversible cada evento de voto?
5. ¿Las estadísticas/resultados deben ser públicas durante la jornada o sólo después del cierre?
6. ¿Cuál es el año y ámbito oficial del proceso? La UI dice 2025, el desarrollo observado es 2026.
7. ¿Qué motor, hosting, dominio, política de respaldo, retención de CURP y requisitos de protección de datos rigen producción?
8. ¿`Otros/respaldosDB` representa producción, pruebas o una importación histórica? No debe tratarse como fuente canónica sin confirmación.

## 12. Mapa de evidencia

| Tema | Rutas principales |
|---|---|
| Enrutamiento UI | `votaciones-front/src/App.tsx`, `src/components/Sidebar.tsx` |
| Transporte/estado | `src/utils/Axios.tsx`, `src/hooks/useGenericData.tsx`, `src/store/generic.store.ts` |
| Captura de voto | `src/pages/boletasPage/useBoleta.ts`, `Boleta.tsx`, `src/hooks/useBallotsData.tsx` |
| Vistas públicas | `src/pages/publics/`, hooks de proyectos/casillas/usuarios/boletas/participaciones |
| API y seguridad | `votaciones-back/routes/api.php`, `app/Http/Controllers/AuthController.php` |
| CRUD | `app/Http/Controllers/BaseCrudController.php` y controladores de entidad |
| Estadísticas | `app/Http/Controllers/StatisticsController.php` |
| Esquema | `votaciones-back/database/migrations/` |
| Roles/datos iniciales | `votaciones-back/database/seeders/` |
| Auditoría | `app/Observers/GlobalModelObserver.php`, `app/Providers/AppServiceProvider.php` |
| Dependencias | `votaciones-front/package.json`, `votaciones-back/composer.json`, `votaciones-back/package.json` |
| Pruebas | `votaciones-back/tests/`; no se encontraron pruebas frontend |

## 13. Verificación y revisión

- Frontend: `npm run build` exitoso el **6 de octubre de 2026**; Vite reportó chunk principal excesivo.
- Backend: `php artisan test` exitoso, **2 pruebas / 2 aserciones**, ambas de plantilla.
- Rutas: `php artisan route:list --path=api` exitoso, **62 rutas**; se confirmó middleware Sanctum en catálogos.
- Repositorios: ambos limpios al inicio del levantamiento; la raíz común no es repositorio Git.
- Última revisión de este documento: **6 de octubre de 2026**, zona `America/Mexico_City`.

