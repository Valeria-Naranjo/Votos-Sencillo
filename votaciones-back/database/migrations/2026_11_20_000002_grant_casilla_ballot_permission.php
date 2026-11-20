<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $ballotMenuId = DB::table('menus')->where('code', 'ballot')->value('id');

        if (!$ballotMenuId) {
            $principalGroupId = DB::table('menus')
                ->where('type', 'group')
                ->where('menu', 'Principal')
                ->orderBy('id')
                ->value('id');

            $order = (int) DB::table('menus')->where('belongs_to', $principalGroupId ?? 0)->max('order') + 1;

            $ballotMenuId = DB::table('menus')->insertGetId([
                'menu' => 'Boleta',
                'code' => 'ballot',
                'type' => 'item',
                'belongs_to' => $principalGroupId ?? 0,
                'url' => '/boleta',
                'icon' => 'LuVote',
                'order' => $order,
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('role_menu_permissions')->updateOrInsert(
            ['role_id' => 3, 'menu_id' => $ballotMenuId],
            [
                'can_view' => true,
                'can_create' => true,
                'can_update' => false,
                'can_delete' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    public function down(): void
    {
        // Solo se revoca el permiso; el menú se conserva porque ya puede estar en uso.
        $ballotMenuId = DB::table('menus')->where('code', 'ballot')->value('id');
        if (!$ballotMenuId) {
            return;
        }

        DB::table('role_menu_permissions')->where('role_id', 3)->where('menu_id', $ballotMenuId)->delete();
    }
};
