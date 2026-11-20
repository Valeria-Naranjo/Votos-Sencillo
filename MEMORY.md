# Memoria durable del sistema

- Producto: SPA + API multi-evento para registrar participación por Clave de Elector, emitir folio/OTP y capturar una boleta vinculada a la participación.
- Componentes canónicos: `votaciones-front` (React 19, TypeScript, Vite, Zustand, Axios) y `votaciones-back` (PHP 8.3+, Laravel 13, Sanctum, Eloquent).
- Datos centrales: eventos, roles, menús, casillas, usuarios, participaciones, proyectos, boletas, tokens y bitácora.
- Roles base: SuperAdmin, Administrador, Casilla y Registro. El acceso administrativo usa permisos normalizados por rol/menú/acción, middleware de API y filtrado de navegación.
- Autenticación: Bearer tokens Sanctum creados sobre `User`; `vw_users` queda como proyección de lectura. Cambiar el rol de un usuario revoca sus tokens y modificar un rol revoca los tokens de todos sus usuarios.
- Reglas comprobadas: Clave de Elector de 18 caracteres; CURP opcional; unicidad de identidad por evento; OTP de seis dígitos con expiración; una boleta por participación; máximo configurable de uno a cinco votos; proyectos activos, del mismo evento y no repetidos.
- Gestión operativa: `/roles-permisos` administra roles, permisos y asignación rápida de usuarios; `/menus` administra jerarquía, rutas, códigos, permisos especiales y estado lógico. Roles inactivos no admiten nuevas asignaciones.
- Estándar UI: shell con navbar sticky, contención sin overflow y formularios responsivos; las reglas canónicas viven en `votaciones-front/docs/agents/FORMULARIOS_Y_CRUD.md` y `DISENO_E_INTERACCION.md`.
- Estructura de páginas: modelo en `domains/models`, estado y CRUD en `hooks`, composición en `index`, captura en `form` y listado en `table`; guía en `votaciones-front/docs/agents/CREACION_DE_PAGINAS.md`.
- Estado verificado el 2026-10-07: frontend compila; migración multi-evento valida en modo `--pretend`; rutas de eventos, registro/OCR y apertura/envío de boleta están registradas.
- Riesgos urgentes restantes: `user_id` suplantable en flujos electorales, elegibilidad de voto incompleta, signup roto, rutas CRUD de baja inconsistentes, páginas públicas contra endpoints privados y credenciales predecibles en seeders.
- Decisiones pendientes: regla exacta de elegibilidad por distrito/casilla, momento de publicación de resultados, retención legal de identidad/OCR, año/ámbito oficial y plataforma de producción.
- Fuente extensa: `CONTEXTO_SISTEMA.md`. Instrucciones para cambios: `AGENTS.md`.
