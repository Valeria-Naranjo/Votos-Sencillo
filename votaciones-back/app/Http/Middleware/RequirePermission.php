<?php

namespace App\Http\Middleware;

use App\Models\RoleMenuPermission;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequirePermission
{
    public function handle(Request $request, Closure $next, string $menuCode, string $action = 'view'): Response
    {
        $user = $request->user();
        if (!$user || !$user->active) {
            return response()->json(['status' => false, 'message' => 'Sesión no válida.'], 401);
        }

        if ((int) $user->role_id === 1) {
            return $next($request);
        }

        $permission = RoleMenuPermission::query()
            ->where('role_id', $user->role_id)
            ->whereHas('menu', fn ($query) => $query->where('code', $menuCode)->where('active', true))
            ->first();

        $allowed = $permission && match ($action) {
            'view' => $permission->can_view,
            'create' => $permission->can_create,
            'update' => $permission->can_update,
            'delete' => $permission->can_delete,
            default => in_array($action, $permission->custom_permissions ?? [], true),
        };

        if (!$allowed) {
            return response()->json([
                'status' => false,
                'message' => 'No tienes permiso para realizar esta acción.',
                'required_permission' => "$menuCode.$action",
            ], 403);
        }

        return $next($request);
    }
}

