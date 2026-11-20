# Instrucciones operativas del repositorio

## Alcance

Esta raíz agrupa dos repositorios que forman un mismo producto: `votaciones-front` (React/Vite) y `votaciones-back` (Laravel API). `Otros` contiene material auxiliar y respaldos; no se considera código canónico ni debe modificarse sin una petición explícita.

## Invariantes y seguridad

- No confiar en `user_id`, rol, casilla, permisos ni distrito enviados por el cliente. Derivarlos del usuario autenticado o validarlos explícitamente.
- Toda mutación debe aplicar autorización en backend; ocultar acciones en frontend no constituye control de acceso.
- La cardinalidad se toma de `events.max_votes` (1–5). No inventar la regla territorial de elegibilidad: distrito/casilla continúa pendiente en `CONTEXTO_SISTEMA.md`.
- Una boleta nunca debe contener el mismo proyecto dos veces. Mantener la validación servidor y, cuando se confirme el modelo final, reforzarla en BD.
- CURP y datos electorales son sensibles. No registrarlos en logs, fixtures públicos, mensajes de error ni documentación.
- No copiar valores de `.env`, tokens, credenciales de seeders ni datos de respaldos a documentación o commits.
- Las operaciones relacionadas que representen una sola captura electoral deben ser transaccionales.
- Nunca persistir la imagen de la credencial sin una decisión explícita de privacidad. El OCR actual es transitorio; confirmar visualmente los datos extraídos antes de registrar.
- No devolver ni almacenar el OTP en texto plano después de su emisión inicial. La boleta debe usar el token temporal generado tras validar folio y OTP.

## Arquitectura y convenciones

- Frontend: conservar el flujo hook/store/repositorio/infraestructura para CRUD, salvo refactor deliberado y probado.
- Backend: respuestas JSON usan `ObjResponse`; mantener contrato consistente.
- Bajas actuales son lógicas mediante `active`/`deleted_at`; no mezclar con `SoftDeletes` sin migración y revisión de consultas.
- `vw_users` es una proyección. No intentar persistir cambios sobre esa vista; escribir sobre `users`, `roles` o `casillas`.
- La migración de `vw_users` es específica de MySQL/MariaDB. No asumir compatibilidad SQLite en pruebas de integración.
- Rutas frontend reales usan `HashRouter`; al tocar menús, alinear URLs sembradas y rutas activas.

## Verificación mínima

- Frontend: ejecutar `npm run build` en `votaciones-front`.
- Backend: ejecutar `php artisan test` y revisar `php artisan route:list --path=api` en `votaciones-back`.
- Para cambios de dominio, agregar pruebas feature; las dos pruebas actuales no cubren negocio.
- Para cambios de permisos, probar al menos SuperAdmin, Administrador, Casilla y visitante anónimo.
- Para voto/participación, probar concurrencia, duplicados, proyectos inactivos/no viables, distrito ajeno y payload con `user_id` suplantado.

## Defectos conocidos que no deben normalizarse

- Las rutas de baja de casillas/proyectos/participaciones/boletas llaman `delete`, mientras el CRUD base expone `destroy`.
- Los endpoints consumidos por las páginas públicas están protegidos por Sanctum.
- `signup` referencia un dominio de empleados inexistente y no satisface el rol obligatorio.
- El token de login se crea desde `VW_User`, lo que rompe escritura en cambio de contraseña.
- `GlobalModelObserver` captura `$th` pero registra `$e`.
- `Boleta.tsx` contiene un flujo simulado; `useBoleta.ts` es el flujo que sí llama a la API.

Consulta `CONTEXTO_SISTEMA.md` para evidencia, riesgos y preguntas abiertas; mantén `MEMORY.md` breve y actualizado cuando se confirme una decisión.

