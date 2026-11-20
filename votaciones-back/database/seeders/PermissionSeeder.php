<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $menus = DB::table('menus')->where('type', 'item')->whereNotNull('code')->get()->keyBy('code');

        foreach ($menus as $menu) {
            DB::table('role_menu_permissions')->updateOrInsert([
                'role_id' => 2,
                'menu_id' => $menu->id,
            ], [
                'can_view' => true,
                'can_create' => true,
                'can_update' => true,
                'can_delete' => true,

                'custom_permissions' => $menu->code === 'access_control' ? json_encode(['manage_permissions']) : null,

                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        foreach (['participation_capture', 'ballot'] as $code) {
            if (!isset($menus[$code])) continue;
            DB::table('role_menu_permissions')->updateOrInsert([
                'role_id' => 3,
                'menu_id' => $menus[$code]->id,
            ], [
                'can_view' => true,
                'can_create' => true,
                'can_update' => false,
                'can_delete' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        if (isset($menus['events'])) {
            DB::table('role_menu_permissions')->updateOrInsert([
                'role_id' => 3,
                'menu_id' => $menus['events']->id,
            ], [
                'can_view' => true,
                'can_create' => false,
                'can_update' => false,
                'can_delete' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        foreach (['participation_capture', 'ballot'] as $code) {
            if (!isset($menus[$code])) continue;
            DB::table('role_menu_permissions')->updateOrInsert([
                'role_id' => 4,
                'menu_id' => $menus[$code]->id,
            ], [
                'can_view' => true,
                'can_create' => true,
                'can_update' => false,
                'can_delete' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
