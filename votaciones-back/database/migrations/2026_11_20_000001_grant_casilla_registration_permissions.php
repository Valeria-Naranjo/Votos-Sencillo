<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $participationMenuId = DB::table('menus')
            ->where('type', 'item')
            ->where('menu', 'Registrar Participación')
            ->value('id');

        if (!$participationMenuId) {
            return;
        }

        DB::table('menus')
            ->where('id', $participationMenuId)
            ->update(['code' => 'participation_capture', 'updated_at' => now()]);

        $eventsMenuId = DB::table('menus')->where('code', 'events')->value('id');
        if (!$eventsMenuId) {
            $administrationGroupId = DB::table('menus')
                ->where('type', 'group')
                ->whereIn('menu', ['Configuraciones', 'Administración'])
                ->orderBy('id')
                ->value('id');

            $eventsMenuId = DB::table('menus')->insertGetId([
                'menu' => 'Eventos',
                'code' => 'events',
                'type' => 'item',
                'belongs_to' => $administrationGroupId ?? 0,
                'url' => '/eventos',
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('role_menu_permissions')->updateOrInsert(
            ['role_id' => 3, 'menu_id' => $participationMenuId],
            [
                'can_view' => true,
                'can_create' => true,
                'can_update' => false,
                'can_delete' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('role_menu_permissions')->updateOrInsert(
            ['role_id' => 3, 'menu_id' => $eventsMenuId],
            [
                'can_view' => true,
                'can_create' => false,
                'can_update' => false,
                'can_delete' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    public function down(): void
    {
        // Solo se revocan los permisos otorgados; los menús se conservan porque ya pueden estar en uso.
        $menuIds = DB::table('menus')->whereIn('code', ['participation_capture', 'events'])->pluck('id');
        DB::table('role_menu_permissions')->where('role_id', 3)->whereIn('menu_id', $menuIds)->delete();
    }
};
