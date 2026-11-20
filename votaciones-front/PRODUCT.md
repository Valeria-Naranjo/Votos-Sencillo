# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Administradores que configuran accesos y operadores de casilla que registran participación y votos durante una jornada. Los administradores necesitan asignar usuarios, roles y permisos con rapidez y sin ambigüedad.

## Product Purpose

Administrar un proceso de participación ciudadana: configurar centros, proyectos y accesos; registrar participantes; capturar boletas; y consultar resultados. El control de acceso debe impedir operaciones no autorizadas en la API, no sólo ocultarlas en la interfaz.

## Operating Context

La configuración de usuarios y roles ocurre antes y durante la operación. Un cambio de rol o permisos debe revocar las sesiones afectadas para que las nuevas reglas entren en vigor al volver a iniciar sesión.

## Capabilities and Constraints

- Roles vinculados a menús y a acciones estándar: ver, crear, editar y eliminar.
- Cada menú puede declarar permisos especiales propios.
- Un usuario tiene un rol; cambiarlo revoca todos sus tokens.
- Modificar permisos de un rol revoca los tokens de todos los usuarios de ese rol.
- React/Vite en frontend y Laravel/Sanctum en backend.
- La base de datos se restablecerá; se permiten cambios estructurales incompatibles con datos actuales.

## Brand Commitments

Nombre visible: Tu Voz Transforma / Sistema de Votaciones GP. Se conserva el lenguaje visual institucional existente en guinda, neutros cálidos y navegación lateral.

## Evidence on Hand

- Implementación actual en este repositorio.
- GPCenter como referencia funcional de roles, menús y permisos.
- Dos capturas aportadas por el usuario sobre matriz de permisos y edición de menús.

## Product Principles

- La autorización real vive en el servidor.
- Los cambios de acceso deben ser rápidos de aplicar y fáciles de auditar.
- La interfaz debe mostrar alcance, consecuencias y cambios pendientes antes de guardar.
- Los permisos se conceden explícitamente; la ausencia de permiso deniega.

