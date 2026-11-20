<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\ObjResponse;
use App\Models\Role;
use App\Models\RoleMenuPermission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class AccessControlController extends Controller
{
    public function createRole(Request $request)
    {
        $data = $request->validate([
            'role' => ['required', 'string', 'max:100', 'unique:roles,role'],
            'description' => ['nullable', 'string', 'max:500'],
            'page_index' => ['nullable', 'string', 'max:255'],
        ]);

        $role = Role::create([...$data, 'active' => true]);
        return ObjResponse::success($role->loadCount('users'), 'Rol creado. Ya puedes configurar sus permisos.');
    }

    public function updateRole(Request $request, Role $role)
    {
        abort_if($role->id === 1, 422, 'El rol SuperAdmin no se puede editar desde esta pantalla.');
        $data = $request->validate([
            'role' => ['required', 'string', 'max:100', Rule::unique('roles', 'role')->ignore($role->id)],
            'description' => ['nullable', 'string', 'max:500'],
            'page_index' => ['nullable', 'string', 'max:255'],
        ]);

        $revoked = DB::transaction(function () use ($role, $data) {
            $role->update($data);
            return $role->users()->get()->sum(fn (User $user) => $user->tokens()->delete());
        });

        return ObjResponse::success([
            'role' => $role->fresh()->loadCount('users'),
            'revoked_tokens' => $revoked,
        ], 'Rol actualizado. Las sesiones vinculadas fueron cerradas.');
    }

    public function setRoleStatus(Request $request, Role $role)
    {
        abort_if($role->id === 1, 422, 'El rol SuperAdmin siempre debe permanecer activo.');
        abort_if((int) $request->user()->role_id === (int) $role->id, 422, 'No puedes desactivar tu propio rol.');
        $data = $request->validate(['active' => ['required', 'boolean']]);

        $revoked = DB::transaction(function () use ($role, $data) {
            $role->update(['active' => $data['active'], 'deleted_at' => null]);
            return $role->users()->get()->sum(fn (User $user) => $user->tokens()->delete());
        });

        return ObjResponse::success([
            'role' => $role->fresh()->loadCount('users'),
            'revoked_tokens' => $revoked,
        ], $data['active'] ? 'Rol reactivado.' : 'Rol desactivado. Sus sesiones fueron cerradas.');
    }

    public function catalog()
    {
        $roles = Role::query()
            ->when((int) request()->user()->role_id !== 1, fn ($query) => $query->where('id', '!=', 1))
            ->withCount('users')->orderBy('id')->get();
        $menus = Menu::query()
            ->where('active', true)
            ->with(['children' => fn ($query) => $query->where('active', true)->orderBy('order')])
            ->where('type', 'group')
            ->orderBy('order')
            ->get();
        $users = User::query()->with('role:id,role')->select('id', 'username', 'email', 'role_id', 'active')->orderBy('username')->get();

        return ObjResponse::success(compact('roles', 'menus', 'users'), 'Catálogo de acceso obtenido');
    }

    public function show(Role $role)
    {
        return ObjResponse::success([
            'role' => $role->loadCount('users'),
            'permissions' => $role->menuPermissions()->get(),
        ], 'Permisos del rol obtenidos');
    }

    public function update(Request $request, Role $role)
    {
        abort_if($role->id === 1, 422, 'El rol SuperAdmin conserva acceso total y no puede limitarse.');

        $data = $request->validate([
            'role' => ['sometimes', 'required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'page_index' => ['nullable', 'string', 'max:255'],
            'permissions' => ['required', 'array'],
            'permissions.*.menu_id' => ['required', 'integer', 'distinct', 'exists:menus,id'],
            'permissions.*.can_view' => ['required', 'boolean'],
            'permissions.*.can_create' => ['required', 'boolean'],
            'permissions.*.can_update' => ['required', 'boolean'],
            'permissions.*.can_delete' => ['required', 'boolean'],
            'permissions.*.custom_permissions' => ['nullable', 'array'],
            'permissions.*.custom_permissions.*' => ['string', 'max:100'],
        ]);

        $menus = Menu::query()->where('active', true)->where('type', 'item')
            ->whereIn('id', collect($data['permissions'])->pluck('menu_id')->unique())
            ->get()->keyBy('id');
        foreach ($data['permissions'] as $index => $permission) {
            $menu = $menus->get($permission['menu_id']);
            if (!$menu) {
                throw ValidationException::withMessages(["permissions.$index.menu_id" => 'El permiso debe pertenecer a una pantalla activa.']);
            }
            $hasOperationalGrant = $permission['can_create'] || $permission['can_update'] || $permission['can_delete'] || !empty($permission['custom_permissions']);
            if ($hasOperationalGrant && !$permission['can_view']) {
                throw ValidationException::withMessages(["permissions.$index.can_view" => 'Ver es obligatorio cuando se concede otra acción.']);
            }
            $declared = collect(explode(',', (string) $menu->others_permissions))->map(fn ($value) => trim($value))->filter();
            $unknown = collect($permission['custom_permissions'] ?? [])->diff($declared);
            if ($unknown->isNotEmpty()) {
                throw ValidationException::withMessages(["permissions.$index.custom_permissions" => 'El menú no declara uno o más permisos personalizados enviados.']);
            }
        }

        $revoked = DB::transaction(function () use ($role, $data) {
            $role->update(collect($data)->only(['role', 'description', 'page_index'])->all());
            $role->menuPermissions()->delete();
            foreach ($data['permissions'] as $permission) {
                $role->menuPermissions()->create($permission);
            }

            $userIds = $role->users()->pluck('id');
            return DB::table('personal_access_tokens')
                ->where('tokenable_type', \App\Models\User::class)
                ->whereIn('tokenable_id', $userIds)
                ->delete();
        });

        return ObjResponse::success([
            'revoked_tokens' => $revoked,
            'affected_users' => $role->users()->count(),
        ], 'Permisos actualizados. Las sesiones afectadas fueron cerradas.');
    }

    public function assignUserRole(Request $request, User $user)
    {
        abort_if((int) $user->id === (int) $request->user()?->id, 422, 'No puedes cambiar tu propio rol desde esta pantalla.');
        $data = $request->validate([
            'role_id' => ['required', 'integer', Rule::exists('roles', 'id')->where(fn ($query) => $query->where('active', true))],
        ]);
        abort_if((int) $data['role_id'] === 1 && (int) $request->user()->role_id !== 1, 403, 'Sólo SuperAdmin puede asignar el rol SuperAdmin.');
        $changed = (int) $user->role_id !== (int) $data['role_id'];
        if ($changed) {
            DB::transaction(function () use ($user, $data) {
                $user->update(['role_id' => $data['role_id']]);
                $user->tokens()->delete();
            });
        }

        return ObjResponse::success(['sessions_revoked' => $changed], $changed
            ? 'Rol actualizado. Las sesiones del usuario fueron cerradas.'
            : 'El usuario ya tenía ese rol.');
    }
}

